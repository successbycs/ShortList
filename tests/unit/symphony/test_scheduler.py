from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

from app_template.symphony.domain import (
    Issue,
    IssueObservation,
    ObservationStatus,
    RunResult,
    RunStatus,
)
from app_template.symphony.scheduler import Scheduler
from app_template.symphony.workflow import load_workflow


class FakeTracker:
    def __init__(self, *issues: Issue) -> None:
        self.issues = {issue.id: issue for issue in issues}
        self.transitions: list[tuple[str, str]] = []
        self.comments: list[str] = []

    def candidates(self, required_labels: set[str]) -> list[Issue]:
        return [
            issue for issue in self.issues.values() if required_labels <= issue.normalized_labels
        ]

    def observe(self, issue_id: str) -> IssueObservation:
        issue = self.issues.get(issue_id)
        return IssueObservation(
            issue_id,
            "fake",
            __import__("datetime").datetime.now(__import__("datetime").UTC),
            ObservationStatus.KNOWN if issue else ObservationStatus.UNKNOWN,
            issue,
        )

    def get(self, issue_id: str) -> Issue | None:
        return self.issues.get(issue_id)

    def comment(self, issue: Issue, body: str) -> None:
        self.comments.append(body)

    def transition(self, issue: Issue, remove: str, add: str) -> None:
        self.transitions.append((remove, add))

    def claim(self, issue: Issue, *, status_label: str, terra_label: str) -> bool:
        return status_label in issue.normalized_labels and not issue.blocked_by

    def finish(self, issue: Issue, *, status_label: str) -> bool:
        self.transitions.append(("status:in-progress", status_label))
        return True


class FakeRunner:
    def __init__(self, results: list[RunResult]) -> None:
        self.results = results
        self.calls: list[tuple[str, str]] = []

    async def run(
        self, issue: Issue, workspace: Path, *, model: str, role: str, prompt: str
    ) -> RunResult:
        self.calls.append((model, role))
        return self.results.pop(0)


def workflow(tmp_path: Path):  # type: ignore[no-untyped-def]
    repository = tmp_path / "repository"
    repository.mkdir()
    for command in (
        ["git", "init"],
        ["git", "config", "user.email", "operator.test"],
        ["git", "config", "user.name", "Operator"],
    ):
        subprocess.run(command, cwd=repository, check=True, capture_output=True)
    (repository / "README.md").write_text("seed\n", encoding="utf-8")
    subprocess.run(["git", "add", "README.md"], cwd=repository, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "seed"], cwd=repository, check=True, capture_output=True)
    path = repository / "WORKFLOW.md"
    path.write_text(
        "---\n"
        "tracker:\n"
        "  repository: owner/repo\n"
        "runtime:\n"
        "  live_dispatch: true\n"
        "agent:\n"
        "  retry_backoff_seconds: 1\n"
        "workspace:\n"
        "  root: ../workspaces\n"
        "---\n"
        "work\n",
        encoding="utf-8",
    )
    return load_workflow(path)


def test_two_terra_failures_escalate_to_astra_then_terra_resume(tmp_path: Path) -> None:
    issue = Issue(
        "5",
        "#5",
        "Task",
        "body",
        "open",
        labels=("status:ready", "symphony:ready"),
        code_packets=("src/a",),
    )
    runner = FakeRunner(
        [
            RunResult(False, "first failure"),
            RunResult(False, "second failure"),
            RunResult(True, "astra plan"),
            RunResult(True, "terra repair"),
            RunResult(True, "resumed task"),
        ]
    )
    tracker = FakeTracker(issue)
    scheduler = Scheduler(workflow(tmp_path), tracker, runner)

    async def execute() -> None:
        await scheduler.tick()
        tasks = list(scheduler.running.values())
        await asyncio.gather(*tasks)

    asyncio.run(execute())
    assert [call[0] for call in runner.calls] == [
        "gpt-5.6-terra",
        "gpt-5.6-terra",
        "gpt-6-astra",
        "gpt-5.6-terra",
        "gpt-5.6-terra",
    ]
    assert scheduler.records["5"].status == RunStatus.HUMAN_REVIEW
    assert tracker.transitions == [("status:in-progress", "status:human-review")]


def test_overlapping_code_packets_are_not_dispatched_together(tmp_path: Path) -> None:
    first = Issue(
        "1",
        "#1",
        "First",
        None,
        "open",
        labels=("status:ready", "symphony:ready"),
        code_packets=("src/shared",),
    )
    second = Issue(
        "2",
        "#2",
        "Second",
        None,
        "open",
        labels=("status:ready", "symphony:ready"),
        code_packets=("src/shared",),
    )
    tracker = FakeTracker(first)
    runner = FakeRunner([RunResult(True, "done")])
    scheduler = Scheduler(workflow(tmp_path), tracker, runner)
    assert scheduler._eligible(first, set())
    assert not scheduler._eligible(second, {"src/shared"})


def test_unscoped_work_is_serialized_against_all_packets(tmp_path: Path) -> None:
    unscoped = Issue("1", "#1", "Unscoped", None, "open")
    scoped = Issue("2", "#2", "Scoped", None, "open", code_packets=("src/app",))
    scheduler = Scheduler(workflow(tmp_path), FakeTracker(unscoped), FakeRunner([]))
    assert not scheduler._eligible(unscoped, {"src/app"})
    assert not scheduler._eligible(scoped, {"__unscoped__"})
