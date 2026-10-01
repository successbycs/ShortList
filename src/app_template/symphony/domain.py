"""Stable domain model for the Symphony GitHub-first profile."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from pathlib import Path


class ObservationStatus(StrEnum):
    KNOWN = "known"
    UNKNOWN = "unknown"


class FailureKind(StrEnum):
    TASK_LOCAL = "task_local"
    APPROVAL = "approval"
    CANCELLED = "cancelled"
    PROVIDER = "provider"
    ENVIRONMENT = "environment"
    PROTOCOL = "protocol"


class RunStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    RETRY_QUEUED = "retry_queued"
    ESCALATING = "escalating"
    HUMAN_REVIEW = "human_review"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class Issue:
    id: str
    identifier: str
    title: str
    description: str | None
    state: str
    labels: tuple[str, ...] = ()
    assignees: tuple[str, ...] = ()
    priority: int | None = None
    blocked_by: tuple[str, ...] = ()
    code_packets: tuple[str, ...] = ()
    url: str | None = None

    @property
    def normalized_labels(self) -> set[str]:
        return {label.strip().lower() for label in self.labels}


@dataclass(frozen=True)
class RunResult:
    succeeded: bool
    summary: str
    thread_id: str | None = None
    turn_id: str | None = None
    input_tokens: int = 0
    output_tokens: int = 0
    rate_limit_percent: int | None = None
    failure_kind: FailureKind | None = None


@dataclass
class RunRecord:
    issue: Issue
    status: RunStatus
    attempt: int = 0
    workspace: Path | None = None
    model: str | None = None
    thread_id: str | None = None
    turn_id: str | None = None
    error: str | None = None
    next_attempt_at: datetime | None = None
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def update(self, status: RunStatus, *, error: str | None = None) -> None:
        self.status = status
        self.error = error
        self.updated_at = datetime.now(UTC)


@dataclass(frozen=True)
class IssueObservation:
    issue_id: str
    source: str
    fetched_at: datetime
    status: ObservationStatus
    issue: Issue | None = None
    reason: str | None = None

    @property
    def known(self) -> bool:
        return self.status is ObservationStatus.KNOWN and self.issue is not None
