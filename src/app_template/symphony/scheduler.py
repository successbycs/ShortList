"""One-authority poll, reservation, retry, escalation, and reconciliation loop."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import UTC, datetime

from app_template.symphony.domain import FailureKind, Issue, RunRecord, RunResult, RunStatus
from app_template.symphony.runner import Runner
from app_template.symphony.tracker import Tracker
from app_template.symphony.workflow import Workflow
from app_template.symphony.workspaces import WorkspaceManager


class Scheduler:
    def __init__(
        self,
        workflow: Workflow,
        tracker: Tracker,
        runner: Runner,
        on_event: Callable[[RunRecord, RunResult | None], None] | None = None,
        on_human_review: Callable[[RunRecord], None] | None = None,
    ) -> None:
        self.workflow, self.tracker, self.runner, self.on_event = (
            workflow,
            tracker,
            runner,
            on_event,
        )
        self.on_human_review = on_human_review
        self.workspaces = WorkspaceManager(workflow.config.workspace, workflow.path.parent)
        self.records: dict[str, RunRecord] = {}
        self.running: dict[str, asyncio.Task[None]] = {}
        self.paused = False
        self.input_tokens = self.output_tokens = 0
        self.rate_limit_percent: int | None = None

    @staticmethod
    def _packets(issue: Issue) -> set[str]:
        """Unscoped work is exclusive, not implicitly safe for parallel execution."""
        return set(issue.code_packets) or {"__unscoped__"}

    @classmethod
    def _packets_overlap(cls, first: Issue, second: set[str]) -> bool:
        first_packets = cls._packets(first)
        if "__unscoped__" in first_packets or "__unscoped__" in second:
            return bool(second)
        for left in first_packets:
            for right in second:
                if left == right or left.startswith(f"{right}/") or right.startswith(f"{left}/"):
                    return True
        return False

    def snapshot(self) -> dict[str, object]:
        return {
            "paused": self.paused,
            "running": len(self.running),
            "tokens": {"input": self.input_tokens, "output": self.output_tokens},
            "rate_limit_percent": self.rate_limit_percent,
            "runs": [
                {
                    "issue": record.issue.identifier,
                    "title": record.issue.title,
                    "status": record.status,
                    "attempt": record.attempt,
                    "model": record.model,
                    "workspace": str(record.workspace) if record.workspace else None,
                    "error": record.error,
                }
                for record in self.records.values()
            ],
        }

    def _eligible(self, issue: Issue, packets: set[str]) -> bool:
        if (
            issue.id in self.running
            or issue.id in self.records
            and self.records[issue.id].status in {RunStatus.HUMAN_REVIEW, RunStatus.BLOCKED}
        ):
            return False
        return not self._packets_overlap(issue, packets)

    def reconcile(self) -> None:
        """Stop tracking runs whose authoritative GitHub Issue changed externally."""
        required = set(self.workflow.config.tracker.required_labels)
        for issue_id, record in self.records.items():
            if record.status not in {RunStatus.QUEUED, RunStatus.RETRY_QUEUED}:
                continue
            observation = self.tracker.observe(issue_id)
            current = observation.issue
            if not observation.known:
                record.error = "GitHub observation unavailable"
            elif current is None or current.state not in self.workflow.config.tracker.active_states:
                record.update(RunStatus.CANCELLED, error="Issue closed or unavailable in GitHub")
            elif required - current.normalized_labels:
                record.update(RunStatus.CANCELLED, error="Issue eligibility changed in GitHub")

    async def tick(self) -> None:
        if self.paused or not self.workflow.config.runtime.live_dispatch:
            return
        self.reconcile()
        candidates = self.tracker.candidates(set(self.workflow.config.tracker.required_labels))
        candidates.sort(
            key=lambda issue: (
                issue.priority if issue.priority is not None else 99,
                issue.identifier,
            )
        )
        reserved = set().union(
            *(
                self._packets(record.issue)
                for record in self.records.values()
                if record.status in {RunStatus.RUNNING, RunStatus.RETRY_QUEUED}
            )
        )
        slots = self.workflow.config.agent.max_concurrent_agents - len(self.running)
        for issue in candidates:
            if slots <= 0:
                break
            if self._eligible(issue, reserved):
                contract = self.workflow.config.task_contract
                if self.tracker.claim(
                    issue, status_label=contract.ready_label, terra_label=contract.terra_label
                ):
                    reserved.update(self._packets(issue))
                    self.running[issue.id] = asyncio.create_task(self._execute(issue))
                    slots -= 1

    async def _attempt(self, record: RunRecord, *, model: str, role: str, prompt: str) -> RunResult:
        record.model = model
        record.attempt += 1
        record.update(RunStatus.RUNNING)
        record.workspace = self.workspaces.prepare(record.issue)
        result = await self.runner.run(
            record.issue, record.workspace, model=model, role=role, prompt=prompt
        )
        record.thread_id, record.turn_id = result.thread_id, result.turn_id
        self.input_tokens += result.input_tokens
        self.output_tokens += result.output_tokens
        self.rate_limit_percent = result.rate_limit_percent or self.rate_limit_percent
        self.workspaces.complete(record.workspace)
        if self.on_event:
            self.on_event(record, result)
        return result

    async def _execute(self, issue: Issue) -> None:
        record = self.records.setdefault(issue.id, RunRecord(issue=issue, status=RunStatus.QUEUED))
        terra = self.workflow.config.agent.terra_model
        try:
            result: RunResult | None = None
            for _ in range(self.workflow.config.agent.max_attempts):
                result = await self._attempt(
                    record, model=terra, role="implementation", prompt=self.workflow.prompt_template
                )
                if result.succeeded:
                    record.update(RunStatus.HUMAN_REVIEW)
                    if not self.tracker.finish(issue, status_label="status:human-review"):
                        record.update(
                            RunStatus.BLOCKED, error="GitHub observation unavailable before review"
                        )
                        return
                    self.tracker.comment(issue, f"Terra implementation completed: {result.summary}")
                    self._notify_human_review(record)
                    return
                if result.failure_kind not in {None, FailureKind.TASK_LOCAL}:
                    record.update(RunStatus.BLOCKED, error=result.summary)
                    self.tracker.finish(issue, status_label="status:blocked")
                    return
                record.update(RunStatus.RETRY_QUEUED, error=result.summary)
                record.next_attempt_at = datetime.now(UTC)
                await asyncio.sleep(self.workflow.config.agent.retry_backoff_seconds)
            record.update(RunStatus.ESCALATING, error=result.summary if result else "no result")
            astra = self.workflow.config.agent.astra_model
            plan = await self._attempt(
                record,
                model=astra,
                role="diagnosis-and-execplan",
                prompt=(
                    "Create a self-contained ExecPlan that diagnoses the failed implementation "
                    "and proposes the smallest repair.\n"
                    f"Issue: {issue.title}\nFailure: {record.error}\n"
                ),
            )
            if not plan.succeeded:
                record.update(RunStatus.BLOCKED, error=plan.summary)
                self.tracker.finish(issue, status_label="status:blocked")
                return
            repair = await self._attempt(
                record,
                model=terra,
                role="repair-execution",
                prompt=(
                    "Execute and verify the Astra diagnostic ExecPlan, then return control "
                    "to the original issue."
                ),
            )
            if repair.succeeded:
                resumed = await self._attempt(
                    record,
                    model=terra,
                    role="resumed-implementation",
                    prompt=self.workflow.prompt_template,
                )
                if resumed.succeeded:
                    record.update(RunStatus.HUMAN_REVIEW)
                    self.tracker.finish(issue, status_label="status:human-review")
                    self._notify_human_review(record)
                    return
            record.update(RunStatus.BLOCKED, error="repair or resumed implementation failed")
            self.tracker.finish(issue, status_label="status:blocked")
        except Exception as error:  # tracker/runner errors are bounded as a run result
            record.update(RunStatus.BLOCKED, error=f"{type(error).__name__}: {error}")
        finally:
            self.running.pop(issue.id, None)

    def _notify_human_review(self, record: RunRecord) -> None:
        """Keep optional notification failures outside the completed task path."""
        if self.on_human_review:
            try:
                self.on_human_review(record)
            except Exception:  # notification is never allowed to change run completion
                pass

    async def serve(self) -> None:
        while True:
            await self.tick()
            await asyncio.sleep(self.workflow.config.polling.interval_seconds)
