"""Service composition, local durable event evidence, and dashboard API."""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import sqlite3
import subprocess
from datetime import UTC, datetime
from html import escape
from ipaddress import ip_address
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from app_template.symphony.domain import Issue, RunRecord, RunResult
from app_template.symphony.notifications import (
    HumanReviewNotifier,
    NotificationResult,
    SmtpHumanReviewNotifier,
)
from app_template.symphony.runner import CodexAppServerRunner, Runner
from app_template.symphony.scheduler import Scheduler
from app_template.symphony.tracker import GitHubTracker, Tracker
from app_template.symphony.workflow import Workflow, load_workflow


class EventStore:
    _OPERATION_FIELDS = {
        "observation": {"source", "status", "known"},
        "admission_decision": {"decision"},
        "claim": {"status_label"},
        "reviewed_revision": {"revision"},
        "queue_age": {"seconds"},
        "reservation": {"state"},
        "worker_stop": {"outcome"},
    }

    def __init__(self, database: Path) -> None:
        self.database = database

    def _connect(self) -> sqlite3.Connection:
        self.database.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.database)
        connection.execute(
            """CREATE TABLE IF NOT EXISTS symphony_operational_events(
               id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, issue_id TEXT NOT NULL,
               kind TEXT NOT NULL, details_json TEXT NOT NULL)"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS symphony_reservations(
               issue_id TEXT PRIMARY KEY, acquired_at TEXT NOT NULL, status TEXT NOT NULL,
               stopped_at TEXT, outcome TEXT)"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS symphony_queue_age(
               issue_id TEXT PRIMARY KEY, first_seen_at TEXT NOT NULL)"""
        )
        return connection

    @staticmethod
    def _safe_details(
        kind: str, details: dict[str, object]
    ) -> dict[str, str | int | float | bool | None]:
        """Allow only the bounded evidence fields, never runner content or credentials."""
        allowed = EventStore._OPERATION_FIELDS.get(kind)
        if allowed is None or set(details) - allowed:
            raise ValueError("operation details contain fields that are not allow-listed")
        safe: dict[str, str | int | float | bool | None] = {}
        for key, value in details.items():
            if not key.replace("_", "").isalnum() or len(key) > 64:
                raise ValueError("operational evidence keys must be short identifiers")
            if not isinstance(value, str | int | float | bool | type(None)):
                raise ValueError("operational evidence values must be scalar")
            if isinstance(value, str) and len(value) > 256:
                raise ValueError("operational evidence strings must be at most 256 characters")
            safe[key] = value
        return safe

    @staticmethod
    def _record_operation(
        connection: sqlite3.Connection,
        kind: str,
        issue_id: str,
        details: dict[str, str | int | float | bool | None],
    ) -> None:
        connection.execute(
            "INSERT INTO symphony_operational_events(created_at, issue_id, kind, details_json) "
            "VALUES (?, ?, ?, ?)",
            (datetime.now(UTC).isoformat(), issue_id, kind, json.dumps(details, sort_keys=True)),
        )

    def record_operation(self, kind: str, issue_id: str, details: dict[str, object]) -> None:
        if kind not in self._OPERATION_FIELDS:
            raise ValueError("operation kind is not allow-listed")
        safe_details = self._safe_details(kind, details)
        with self._connect() as connection:
            if kind == "admission_decision":
                row = connection.execute(
                    "SELECT first_seen_at FROM symphony_queue_age WHERE issue_id = ?", (issue_id,)
                ).fetchone()
                now = datetime.now(UTC)
                if row is None:
                    connection.execute(
                        "INSERT INTO symphony_queue_age(issue_id, first_seen_at) VALUES (?, ?)",
                        (issue_id, now.isoformat()),
                    )
                    age_seconds = 0
                else:
                    elapsed = now - datetime.fromisoformat(row[0])
                    age_seconds = max(0, int(elapsed.total_seconds()))
                self._record_operation(connection, "queue_age", issue_id, {"seconds": age_seconds})
            self._record_operation(connection, kind, issue_id, safe_details)

    def reserve(self, issue_id: str) -> bool:
        """Acquire the local crash-safety fence for one Issue exactly once."""
        with self._connect() as connection:
            cursor = connection.execute(
                "INSERT OR IGNORE INTO symphony_reservations(issue_id, acquired_at, status) "
                "VALUES (?, ?, 'active')",
                (issue_id, datetime.now(UTC).isoformat()),
            )
            acquired = cursor.rowcount == 1
            if acquired:
                self._record_operation(connection, "reservation", issue_id, {"state": "active"})
        return acquired

    def stop_reservation(self, issue_id: str, outcome: str) -> None:
        with self._connect() as connection:
            connection.execute(
                "UPDATE symphony_reservations SET status = 'stopped', stopped_at = ?, outcome = ? "
                "WHERE issue_id = ? AND status = 'active'",
                (datetime.now(UTC).isoformat(), outcome[:256], issue_id),
            )
            self._record_operation(connection, "worker_stop", issue_id, {"outcome": outcome[:256]})

    def active_reservations(self) -> set[str]:
        if not self.database.exists():
            return set()
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT issue_id FROM symphony_reservations WHERE status = 'active'"
            ).fetchall()
        return {str(row[0]) for row in rows}

    def recent_operations(self) -> list[dict[str, object]]:
        if not self.database.exists():
            return []
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT created_at, issue_id, kind, details_json FROM symphony_operational_events "
                "ORDER BY id DESC LIMIT 100"
            ).fetchall()
        return [
            {"created_at": row[0], "issue_id": row[1], "kind": row[2], **json.loads(row[3])}
            for row in rows
        ]

    def dashboard_snapshot(self) -> dict[str, object]:
        """Read an existing database without migration, creation or free-text run data."""
        snapshot: dict[str, object] = {
            "operations": [],
            "active_reservations": [],
            "notifications": [],
        }
        if not self.database.exists():
            return snapshot
        with sqlite3.connect(self.database.resolve().as_uri() + "?mode=ro", uri=True) as db:
            tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master")}
            if "symphony_operational_events" in tables:
                operations = []
                for created, issue_id, kind, raw in db.execute(
                    "SELECT created_at, issue_id, kind, details_json "
                    "FROM symphony_operational_events ORDER BY id DESC LIMIT 100"
                ):
                    try:
                        details = self._safe_details(kind, json.loads(raw))
                    except (ValueError, TypeError):
                        continue
                    operations.append(
                        {"created_at": created, "issue_id": issue_id, "kind": kind, **details}
                    )
                snapshot["operations"] = operations
            if "symphony_reservations" in tables:
                snapshot["active_reservations"] = [
                    row[0]
                    for row in db.execute(
                        "SELECT issue_id FROM symphony_reservations "
                        "WHERE status = 'active' ORDER BY issue_id"
                    )
                ]
            if "symphony_notification_deliveries" in tables:
                snapshot["notifications"] = [
                    {
                        "created_at": created,
                        "issue_id": issue_id,
                        "status": status,
                        "attempts": attempts,
                    }
                    for created, issue_id, status, attempts in db.execute(
                        "SELECT created_at, issue_id, status, attempts "
                        "FROM symphony_notification_deliveries "
                        "WHERE status IN ('pending', 'sent', 'disabled', 'failed') "
                        "ORDER BY id DESC LIMIT 100"
                    )
                ]
        return snapshot

    def append(self, record: RunRecord, result: RunResult | None) -> None:
        with self._connect() as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS symphony_events(
                   id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, issue_id TEXT NOT NULL,
                   status TEXT NOT NULL, attempt INTEGER NOT NULL, model TEXT,
                   summary TEXT, payload_json TEXT NOT NULL)"""
            )
            connection.execute(
                "INSERT INTO symphony_events("
                "created_at, issue_id, status, attempt, model, summary, payload_json"
                ") VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    datetime.now(UTC).isoformat(),
                    record.issue.id,
                    record.status,
                    record.attempt,
                    record.model,
                    result.summary if result else None,
                    json.dumps(
                        {
                            "error": record.error,
                            "thread_id": record.thread_id,
                            "turn_id": record.turn_id,
                        }
                    ),
                ),
            )

    def recent(self) -> list[dict[str, object]]:
        if not self.database.exists():
            return []
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT created_at, issue_id, status, attempt, model, summary, "
                "payload_json FROM symphony_events ORDER BY id DESC LIMIT 100"
            ).fetchall()
        return [
            {
                "created_at": row[0],
                "issue_id": row[1],
                "status": row[2],
                "attempt": row[3],
                "model": row[4],
                "summary": row[5],
                **json.loads(row[6]),
            }
            for row in rows
        ]

    def claim_notification(self, issue_id: str, transition_id: str) -> bool:
        """Reserve one delivery attempt for a particular human-review transition."""
        with self._connect() as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS symphony_notification_deliveries(
                   id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, issue_id TEXT NOT NULL,
                   transition_id TEXT NOT NULL, status TEXT NOT NULL, detail TEXT NOT NULL,
                   attempts INTEGER NOT NULL, UNIQUE(issue_id, transition_id))"""
            )
            cursor = connection.execute(
                "INSERT OR IGNORE INTO symphony_notification_deliveries("
                "created_at, issue_id, transition_id, status, detail, attempts"
                ") VALUES (?, ?, ?, 'pending', 'delivery pending', 0)",
                (datetime.now(UTC).isoformat(), issue_id, transition_id),
            )
        return cursor.rowcount == 1

    def complete_notification(
        self, issue_id: str, transition_id: str, result: NotificationResult
    ) -> None:
        with self._connect() as connection:
            connection.execute(
                "UPDATE symphony_notification_deliveries "
                "SET status = ?, detail = ?, attempts = ? "
                "WHERE issue_id = ? AND transition_id = ?",
                (result.status, result.detail, result.attempts, issue_id, transition_id),
            )

    def recent_notifications(self) -> list[dict[str, object]]:
        if not self.database.exists():
            return []
        try:
            with self._connect() as connection:
                rows = connection.execute(
                    "SELECT created_at, issue_id, transition_id, status, detail, attempts "
                    "FROM symphony_notification_deliveries ORDER BY id DESC LIMIT 100"
                ).fetchall()
        except sqlite3.OperationalError:
            return []
        return [
            {
                "created_at": row[0],
                "issue_id": row[1],
                "transition_id": row[2],
                "status": row[3],
                "detail": row[4],
                "attempts": row[5],
            }
            for row in rows
        ]


class ReadOnlyTracker:
    """Dashboard-safe tracker: never performs GitHub reads or writes."""

    def candidates(self, required_labels: set[str]) -> list[Issue]:
        return []

    def get(self, issue_id: str) -> None:
        return None

    def comment(self, issue: object, body: str) -> None:
        raise RuntimeError("dashboard-only service cannot write GitHub")

    def claim(self, issue: object, *, status_label: str, terra_label: str) -> bool:
        return False

    def finish(self, issue: object, *, status_label: str) -> None:
        raise RuntimeError("dashboard-only service cannot write GitHub")

    def transition(self, issue: object, remove: str, add: str) -> None:
        raise RuntimeError("dashboard-only service cannot write GitHub")


class ReadOnlyRunner:
    """Dashboard-safe runner: execution is available only in the host broker."""

    async def run(self, *args: object, **kwargs: object) -> RunResult:
        return RunResult(False, "dashboard-only service cannot run Codex")


class SymphonyService:
    def __init__(
        self,
        workflow: Workflow,
        tracker: Tracker,
        runner: Runner,
        store: EventStore,
        notifier: HumanReviewNotifier | None = None,
    ) -> None:
        self.workflow, self.store = workflow, store
        self.notifier = notifier or SmtpHumanReviewNotifier(workflow.config.notifications.email)
        self.scheduler = Scheduler(
            workflow,
            tracker,
            runner,
            on_event=self.store.append,
            on_human_review=self._notify_human_review,
            on_operation=self.store.record_operation,
            reserve=self.store.reserve,
            stop_reservation=self.store.stop_reservation,
            active_reservations=self.store.active_reservations,
        )

    def _notify_human_review(self, record: RunRecord) -> None:
        transition_id = record.updated_at.isoformat()
        if not self.store.claim_notification(record.issue.id, transition_id):
            return
        try:
            result = self.notifier.notify(record)
        except Exception:
            result = NotificationResult("failed", "Notification adapter failed", 0)
        self.store.complete_notification(record.issue.id, transition_id, result)

    @classmethod
    def from_workflow(cls, path: Path = Path("WORKFLOW.md")) -> SymphonyService:
        """Construct the container-safe dashboard service without host adapters."""
        workflow = load_workflow(path)
        return cls(
            workflow,
            ReadOnlyTracker(),
            ReadOnlyRunner(),
            EventStore(workflow.path.parent / "var" / "symphony" / "events.sqlite3"),
        )

    @classmethod
    def from_host_workflow(cls, path: Path = Path("WORKFLOW.md")) -> SymphonyService:
        """Construct the only service variant permitted to execute Codex or GitHub writes."""
        workflow = load_workflow(path)
        return cls(
            workflow,
            GitHubTracker(workflow.config.tracker.repository),
            CodexAppServerRunner(repository_root=workflow.path.parent),
            EventStore(workflow.path.parent / "var" / "symphony" / "events.sqlite3"),
        )

    async def tick(self) -> None:
        await self.scheduler.tick()

    async def serve(self) -> None:
        import uvicorn

        host = os.environ.get(
            "SYMPHONY_DASHBOARD_HOST", self.workflow.config.runtime.dashboard_host
        )
        server = uvicorn.Server(
            uvicorn.Config(
                self.dashboard(),
                host=host,
                port=self.workflow.config.runtime.dashboard_port,
            )
        )
        scheduler_task = asyncio.create_task(self.scheduler.serve())
        try:
            await server.serve()
        finally:
            scheduler_task.cancel()
            await asyncio.gather(scheduler_task, return_exceptions=True)

    def preflight(self) -> dict[str, object]:
        """Report executable/authentication prerequisites without credential output."""
        executables = {name: shutil.which(name) is not None for name in ("codex", "gh")}
        github_authenticated = False
        if executables["gh"]:
            github_authenticated = (
                subprocess.run(
                    ["gh", "auth", "status"],
                    check=False,
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                ).returncode
                == 0
            )
        dispatch_ready = all(executables.values()) and github_authenticated
        return {
            "live_dispatch": self.workflow.config.runtime.live_dispatch,
            "executables": executables,
            "github_authenticated": github_authenticated,
            "dispatch_ready": dispatch_ready,
        }

    def dashboard(self) -> FastAPI:
        app = FastAPI(title="Symphony Operator Console")

        @app.get("/health")
        def health() -> dict[str, object]:
            return {"status": "ok", "live_dispatch": self.workflow.config.runtime.live_dispatch}

        @app.get("/api/status")
        def status() -> dict[str, object]:
            return self.store.dashboard_snapshot()

        @app.get("/", response_class=HTMLResponse)
        def index() -> str:
            snapshot = self.store.dashboard_snapshot()
            rows = []
            for operation in snapshot["operations"]:
                details = {
                    key: value
                    for key, value in operation.items()
                    if key not in {"created_at", "issue_id", "kind"}
                }
                cells = [
                    operation["created_at"],
                    operation["issue_id"],
                    operation["kind"],
                    json.dumps(details, sort_keys=True),
                ]
                rows.append(
                    "<tr>" + "".join(f"<td>{escape(str(cell))}</td>" for cell in cells) + "</tr>"
                )
            reservations = escape(
                ", ".join(str(item) for item in snapshot["active_reservations"]) or "None"
            )
            body = "".join(rows) or '<tr><td colspan="4">No operational evidence yet.</td></tr>'
            return (
                '<!doctype html><html lang="en"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width, initial-scale=1">'
                "<title>Symphony evidence</title><style>"
                "body{font:16px system-ui;margin:2rem;color:#172b4d;background:#f5f7fa}"
                "table{border-collapse:collapse;width:100%;background:white}"
                "td,th{text-align:left;padding:.7rem;border:1px solid #cbd2dc;"
                "overflow-wrap:anywhere}a{color:#0645ad}"
                "</style></head><body><h1>Symphony operational evidence</h1>"
                "<p>Read-only • Last 100 recorded events, newest first. "
                "Refresh to read current evidence. This is not a live worker heartbeat.</p>"
                '<p><a href="/">Refresh</a> · <a href="/api/status">JSON evidence</a></p>'
                f"<p>Active reservations: {reservations}</p>"
                "<table><caption>Persisted operations</caption><thead><tr>"
                "<th>Recorded (UTC)</th><th>Issue</th><th>Event</th><th>Details</th>"
                f"</tr></thead><tbody>{body}</tbody></table></body></html>"
            )

        return app

    def run_dashboard(self) -> None:
        import uvicorn

        host = os.environ.get(
            "SYMPHONY_DASHBOARD_HOST", self.workflow.config.runtime.dashboard_host
        )
        container_bind = host == "0.0.0.0" and Path("/.dockerenv").exists()
        try:
            loopback = host == "localhost" or ip_address(host).is_loopback
        except ValueError:
            loopback = False
        if not (loopback or container_bind):
            raise ValueError("Dashboard requires loopback or the container-only 0.0.0.0 bind")
        uvicorn.run(
            self.dashboard(),
            host=host,
            port=self.workflow.config.runtime.dashboard_port,
        )


def run_service(path: Path = Path("WORKFLOW.md")) -> None:
    asyncio.run(SymphonyService.from_host_workflow(path).serve())
