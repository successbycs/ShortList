import sqlite3
from pathlib import Path

import pytest

from app_template.symphony.domain import Issue, RunRecord, RunResult, RunStatus
from app_template.symphony.notifications import NotificationResult
from app_template.symphony.service import EventStore, SymphonyService
from app_template.symphony.workflow import load_workflow


class EmptyTracker:
    def candidates(self, required_labels: set[str]):  # type: ignore[no-untyped-def]
        return []

    def get(self, issue_id: str):  # type: ignore[no-untyped-def]
        return None

    def comment(self, issue, body: str) -> None:  # type: ignore[no-untyped-def]
        return None

    def transition(self, issue, remove: str, add: str) -> None:  # type: ignore[no-untyped-def]
        return None


class EmptyRunner:
    async def run(self, *args, **kwargs):  # type: ignore[no-untyped-def]
        raise AssertionError("runner must not be called")


class FakeNotifier:
    def __init__(self, result: NotificationResult) -> None:
        self.result = result
        self.records: list[RunRecord] = []

    def notify(self, record: RunRecord) -> NotificationResult:
        self.records.append(record)
        return self.result


def notification_record() -> RunRecord:
    return RunRecord(
        issue=Issue("19", "#19", "Notify operator", None, "open", url="https://example.test/19"),
        status=RunStatus.HUMAN_REVIEW,
        attempt=1,
        model="gpt-5.6-terra",
    )


def test_event_store_persists_across_instances(tmp_path: Path) -> None:
    database = tmp_path / "events.sqlite3"
    EventStore(database).append(notification_record(), RunResult(True, "synthetic result"))

    events = EventStore(database).recent()

    assert events[0]["issue_id"] == "19"
    assert events[0]["summary"] == "synthetic result"


def test_human_review_notification_is_sent_once_per_transition(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    notifier = FakeNotifier(NotificationResult("sent", "fake handoff sent", 1))
    store = EventStore(tmp_path / "events.sqlite3")
    service = SymphonyService(load_workflow(path), EmptyTracker(), EmptyRunner(), store, notifier)
    record = notification_record()

    service._notify_human_review(record)
    service._notify_human_review(record)

    assert notifier.records == [record]
    assert store.recent_notifications()[0]["status"] == "sent"
    assert store.recent_notifications()[0]["attempts"] == 1


def test_disabled_and_failed_notification_results_are_durable(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    record = notification_record()
    disabled = EventStore(tmp_path / "disabled.sqlite3")
    SymphonyService(
        load_workflow(path), EmptyTracker(), EmptyRunner(), disabled
    )._notify_human_review(record)
    assert disabled.recent_notifications()[0]["status"] == "disabled"
    failed = EventStore(tmp_path / "failed.sqlite3")
    service = SymphonyService(
        load_workflow(path),
        EmptyTracker(),
        EmptyRunner(),
        failed,
        FakeNotifier(NotificationResult("failed", "SMTP delivery failed", 2)),
    )
    service._notify_human_review(record)
    assert failed.recent_notifications()[0]["status"] == "failed"


def test_operational_evidence_migrates_reopens_and_stays_sanitized(tmp_path: Path) -> None:
    database = tmp_path / "events.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE symphony_events(id INTEGER PRIMARY KEY)")

    first = EventStore(database)
    first.record_operation("observation", "28", {"known": True, "source": "github"})
    first.record_operation("admission_decision", "28", {"decision": "claim_attempt"})
    assert first.reserve("28") is True

    reopened = EventStore(database)
    assert {event["kind"] for event in reopened.recent_operations()} >= {
        "observation",
        "admission_decision",
        "queue_age",
        "reservation",
    }
    assert reopened.active_reservations() == {"28"}
    assert reopened.reserve("28") is False
    with pytest.raises(ValueError, match="allow-listed"):
        reopened.record_operation("observation", "28", {"runner_transcript": "secret"})


def test_interrupted_reservation_survives_restart_until_worker_stop(tmp_path: Path) -> None:
    database = tmp_path / "events.sqlite3"
    interrupted = EventStore(database)
    assert interrupted.reserve("28") is True

    recovered = EventStore(database)
    assert recovered.active_reservations() == {"28"}
    recovered.stop_reservation("28", "human_review")

    assert EventStore(database).active_reservations() == set()
    assert EventStore(database).recent_operations()[0]["kind"] == "worker_stop"
