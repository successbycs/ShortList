"""GitHub tracker adapter and a protocol used by the scheduler."""

from __future__ import annotations

import json
import subprocess
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Protocol

from app_template.symphony.domain import Issue, IssueObservation, ObservationStatus


class TrackerError(RuntimeError):
    """A GitHub tracker command failed without exposing credentials."""


class Tracker(Protocol):
    def candidates(self, required_labels: set[str]) -> list[Issue]: ...

    def observe(self, issue_id: str) -> IssueObservation: ...

    def get(self, issue_id: str) -> Issue | None: ...

    def comment(self, issue: Issue, body: str) -> None: ...

    def claim(self, issue: Issue, *, status_label: str, terra_label: str) -> bool: ...

    def finish(self, issue: Issue, *, status_label: str) -> bool: ...

    def transition(self, issue: Issue, remove: str, add: str) -> bool: ...


class GitHubTracker:
    """GitHub CLI adapter; credentials stay with the host CLI process."""

    def __init__(self, repository: str, command: Sequence[str] = ("gh",)) -> None:
        self.repository = repository
        self.command = tuple(command)

    def _run_issue(self, *arguments: str) -> str:
        result = subprocess.run(
            [*self.command, *arguments, "--repo", self.repository],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            raise TrackerError(result.stderr.strip() or "GitHub command failed")
        return result.stdout

    def _run_api(self, endpoint: str) -> str:
        result = subprocess.run(
            [*self.command, "api", endpoint],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            raise TrackerError(result.stderr.strip() or "GitHub API command failed")
        return result.stdout

    @property
    def _issue_endpoint(self) -> str:
        return f"repos/{self.repository}/issues"

    @staticmethod
    def _issue(payload: dict[str, object]) -> Issue:
        labels = tuple(
            str(item["name"])
            for item in payload.get("labels", [])  # type: ignore[union-attr]
            if isinstance(item, dict) and "name" in item
        )
        body = payload.get("body")
        packets = GitHubTracker._code_packets(str(body or ""))
        assignees = tuple(
            str(item["login"])
            for item in payload.get("assignees", [])  # type: ignore[union-attr]
            if isinstance(item, dict) and "login" in item
        )
        return Issue(
            id=str(payload["number"]),
            identifier=f"#{payload['number']}",
            title=str(payload["title"]),
            description=str(body) if body is not None else None,
            state=str(payload["state"]).lower(),
            labels=labels,
            assignees=assignees,
            priority=None,
            code_packets=packets,
            url=str(payload.get("url")) if payload.get("url") else None,
        )

    @staticmethod
    def _code_packets(body: str) -> tuple[str, ...]:
        """Parse a Markdown `## Code packets` section without guessing scope."""
        active = False
        packets: list[str] = []
        for line in body.splitlines():
            if line.lower().strip() == "## code packets":
                active = True
                continue
            if active and line.startswith("#"):
                break
            if active and line.startswith("- "):
                value = line.removeprefix("- ").strip().strip("`")
                if value.lower().startswith("unscoped"):
                    return ()
                if value:
                    packets.append(value)
        return tuple(packets)

    def _blocked_by(self, issue_id: str) -> tuple[str, ...]:
        raw = self._run_api(f"{self._issue_endpoint}/{issue_id}/dependencies/blocked_by")
        return tuple(str(item["number"]) for item in json.loads(raw))

    def _with_dependencies(self, issue: Issue) -> Issue:
        return Issue(**{**issue.__dict__, "blocked_by": self._blocked_by(issue.id)})

    def candidates(self, required_labels: set[str]) -> list[Issue]:
        raw = self._run_issue(
            "issue",
            "list",
            "--state",
            "open",
            "--limit",
            "100",
            "--json",
            "number,title,body,state,labels,assignees,url",
        )
        issues = [self._with_dependencies(self._issue(item)) for item in json.loads(raw)]
        return [
            issue
            for issue in issues
            if required_labels <= issue.normalized_labels and not issue.blocked_by
        ]

    def observe(self, issue_id: str) -> IssueObservation:
        fetched_at = datetime.now(UTC)
        try:
            raw = self._run_issue(
                "issue",
                "view",
                issue_id,
                "--json",
                "number,title,body,state,labels,assignees,url",
            )
            issue = self._with_dependencies(self._issue(json.loads(raw)))
        except TrackerError:
            return IssueObservation(
                issue_id,
                "github:issue-view",
                fetched_at,
                ObservationStatus.UNKNOWN,
                reason="GitHub observation unavailable",
            )
        return IssueObservation(
            issue.id, "github:issue-view", fetched_at, ObservationStatus.KNOWN, issue
        )

    def get(self, issue_id: str) -> Issue | None:
        observation = self.observe(issue_id)
        return observation.issue if observation.known else None

    def comment(self, issue: Issue, body: str) -> None:
        self._run_issue("issue", "comment", issue.id, "--body", body)

    def claim(self, issue: Issue, *, status_label: str, terra_label: str) -> bool:
        observation = self.observe(issue.id)
        current = observation.issue
        if (
            not observation.known
            or current is None
            or current.state != "open"
            or current.blocked_by
            or status_label not in current.normalized_labels
        ):
            return False
        self._run_issue(
            "issue",
            "edit",
            issue.id,
            "--remove-label",
            status_label,
            "--add-label",
            "status:in-progress",
            "--add-label",
            terra_label,
        )
        return True

    def finish(self, issue: Issue, *, status_label: str) -> bool:
        observation = self.observe(issue.id)
        current = observation.issue
        if not observation.known or current is None or current.state != "open":
            return False
        self._run_issue(
            "issue",
            "edit",
            issue.id,
            "--remove-label",
            "status:in-progress",
            "--remove-label",
            "agent:terra",
            "--remove-label",
            "agent:astra",
            "--add-label",
            status_label,
        )
        return True

    def transition(self, issue: Issue, remove: str, add: str) -> bool:
        observation = self.observe(issue.id)
        if not observation.known or observation.issue is None or observation.issue.state != "open":
            return False
        self._run_issue("issue", "edit", issue.id, "--remove-label", remove, "--add-label", add)
        return True
