import sqlite3
from pathlib import Path
from unittest.mock import patch

import pytest
import uvicorn
from fastapi.testclient import TestClient

from app_template.symphony.domain import Issue, RunRecord, RunResult, RunStatus
from app_template.symphony.notifications import NotificationResult
from app_template.symphony.service import (
    EventStore,
    ReadOnlyRunner,
    ReadOnlyTracker,
    SymphonyService,
)
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


def test_dashboard_is_read_only_and_handles_missing_database(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    service = SymphonyService(
        load_workflow(path), EmptyTracker(), EmptyRunner(), EventStore(tmp_path / "events.db")
    )
    client = TestClient(service.dashboard())
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/api/status").json() == {
        "operations": [],
        "active_reservations": [],
        "notifications": [],
    }
    assert "No operational evidence yet" in client.get("/").text
    for route in ("pause", "resume", "tick"):
        assert client.post(f"/api/{route}").status_code == 404
    assert not (tmp_path / "events.db").exists()


def test_dashboard_renders_reopened_evidence_without_legacy_secrets(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    database = tmp_path / "events.db"
    store = EventStore(database)
    store.record_operation("observation", "10", {"known": True, "source": "github"})
    store.record_operation("claim", "10", {"status_label": "claimed"})
    store.record_operation("reviewed_revision", "10", {"revision": "<script>alert(1)</script>"})
    store.record_operation("admission_decision", "10", {"decision": "accepted"})
    store.reserve("10")
    store.stop_reservation("10", "human_review")
    store.reserve("11")
    store.append(notification_record(), RunResult(True, "PRIVATE_RUN_CONTENT"))
    for status in ("pending", "sent", "disabled", "failed"):
        store.claim_notification("10", f"PRIVATE_TRANSITION_{status}")
        if status != "pending":
            store.complete_notification(
                "10",
                f"PRIVATE_TRANSITION_{status}",
                NotificationResult(status, "PRIVATE_MAIL_DETAIL", 1),
            )
    before = database.read_bytes()
    service = SymphonyService(
        load_workflow(path), EmptyTracker(), EmptyRunner(), EventStore(database)
    )
    client = TestClient(service.dashboard())
    snapshot = client.get("/api/status").json()
    assert {row["kind"] for row in snapshot["operations"]} == set(EventStore._OPERATION_FIELDS)
    assert snapshot["active_reservations"] == ["11"]
    assert {row["status"] for row in snapshot["notifications"]} == {
        "pending",
        "sent",
        "disabled",
        "failed",
    }
    for row in snapshot["notifications"]:
        assert set(row) == {"created_at", "issue_id", "status", "attempts"}
        assert row["attempts"] == (0 if row["status"] == "pending" else 1)
    assert "PRIVATE_MAIL_DETAIL" not in str(snapshot)
    assert "PRIVATE_TRANSITION" not in str(snapshot)
    page = client.get("/").text
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in page
    assert "<script>alert(1)</script>" not in page
    assert "PRIVATE_RUN_CONTENT" not in page + str(snapshot)
    assert database.read_bytes() == before


def test_event_store_persists_across_instances(tmp_path: Path) -> None:
    database = tmp_path / "events.sqlite3"
    record = RunRecord(
        issue=Issue("1", "#1", "Safe persistence proof", None, "open"),
        status=RunStatus.HUMAN_REVIEW,
        attempt=1,
        model="gpt-5.6-terra",
    )
    EventStore(database).append(record, RunResult(True, "synthetic result"))

    events = EventStore(database).recent()

    assert events[0]["issue_id"] == "1"
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


def test_disabled_notification_is_durable_without_sending(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    store = EventStore(tmp_path / "events.sqlite3")
    service = SymphonyService(load_workflow(path), EmptyTracker(), EmptyRunner(), store)

    service._notify_human_review(notification_record())

    delivery = store.recent_notifications()[0]
    assert delivery["status"] == "disabled"
    assert delivery["attempts"] == 0


def test_failed_notification_is_durable_and_does_not_change_review_status(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    store = EventStore(tmp_path / "events.sqlite3")
    notifier = FakeNotifier(NotificationResult("failed", "SMTP delivery failed", 2))
    service = SymphonyService(load_workflow(path), EmptyTracker(), EmptyRunner(), store, notifier)
    record = notification_record()

    service._notify_human_review(record)

    delivery = store.recent_notifications()[0]
    assert record.status == RunStatus.HUMAN_REVIEW
    assert delivery["status"] == "failed"
    assert delivery["attempts"] == 2


def test_dashboard_factory_has_no_host_execution_adapters(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")

    service = SymphonyService.from_workflow(path)

    assert isinstance(service.scheduler.tracker, ReadOnlyTracker)
    assert isinstance(service.scheduler.runner, ReadOnlyRunner)


def test_dashboard_honours_container_host_override(tmp_path: Path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    monkeypatch.setenv("SYMPHONY_DASHBOARD_HOST", "0.0.0.0")
    service = SymphonyService.from_workflow(path)

    with patch.object(uvicorn, "run") as run, patch.object(Path, "exists", return_value=True):
        service.run_dashboard()

    assert run.call_args.kwargs["host"] == "0.0.0.0"


def test_dashboard_rejects_public_host_bind(tmp_path: Path, monkeypatch) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    service = SymphonyService.from_workflow(path)
    monkeypatch.setenv("SYMPHONY_DASHBOARD_HOST", "0.0.0.0")
    with (
        patch.object(Path, "exists", return_value=False),
        pytest.raises(ValueError, match="loopback"),
    ):
        service.run_dashboard()


def test_host_factory_is_the_only_constructor_with_execution_adapters(
    tmp_path: Path, monkeypatch
) -> None:  # type: ignore[no-untyped-def]
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    import app_template.symphony.service as service_module

    tracker = object()
    runner = object()
    monkeypatch.setattr(service_module, "GitHubTracker", lambda _: tracker)
    monkeypatch.setattr(service_module, "CodexAppServerRunner", lambda **_: runner)

    service = SymphonyService.from_host_workflow(path)

    assert service.scheduler.tracker is tracker
    assert service.scheduler.runner is runner


def test_preflight_fails_closed_without_host_prerequisites(tmp_path: Path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    path = tmp_path / "WORKFLOW.md"
    path.write_text("---\ntracker:\n  repository: owner/repo\n---\nwork\n", encoding="utf-8")
    import app_template.symphony.service as service_module

    monkeypatch.setattr(service_module.shutil, "which", lambda _: None)

    result = SymphonyService.from_host_workflow(path).preflight()

    assert result == {
        "live_dispatch": False,
        "executables": {"codex": False, "gh": False},
        "github_authenticated": False,
        "dispatch_ready": False,
    }


def test_operational_evidence_migrates_reopens_and_stays_sanitized(tmp_path: Path) -> None:
    database = tmp_path / "events.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE symphony_events(id INTEGER PRIMARY KEY)")

    first = EventStore(database)
    first.record_operation("observation", "28", {"known": True, "source": "github"})
    first.record_operation("admission_decision", "28", {"decision": "claim_attempt"})
    assert first.reserve("28") is True

    reopened = EventStore(database)
    operations = reopened.recent_operations()

    assert {event["kind"] for event in operations} >= {
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
