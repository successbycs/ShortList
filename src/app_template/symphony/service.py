"""Service composition, local durable event evidence, and dashboard API."""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import sqlite3
import subprocess
from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException

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
    def __init__(self, database: Path) -> None:
        self.database = database

    def append(self, record: RunRecord, result: RunResult | None) -> None:
        self.database.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.database) as connection:
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
        with sqlite3.connect(self.database) as connection:
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
        self.database.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.database) as connection:
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
        with sqlite3.connect(self.database) as connection:
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
            with sqlite3.connect(self.database) as connection:
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
            return {
                **self.scheduler.snapshot(),
                "events": self.store.recent(),
                "notifications": self.store.recent_notifications(),
            }

        @app.post("/api/pause")
        def pause() -> dict[str, bool]:
            self.scheduler.paused = True
            return {"paused": True}

        @app.post("/api/resume")
        def resume() -> dict[str, bool]:
            self.scheduler.paused = False
            return {"paused": False}

        @app.post("/api/tick")
        async def tick() -> dict[str, object]:
            if not self.workflow.config.runtime.live_dispatch:
                raise HTTPException(
                    status_code=409, detail="live dispatch is disabled by WORKFLOW.md"
                )
            await self.tick()
            return self.scheduler.snapshot()

        return app

    def run_dashboard(self) -> None:
        import uvicorn

        uvicorn.run(
            self.dashboard(),
            host=os.environ.get(
                "SYMPHONY_DASHBOARD_HOST", self.workflow.config.runtime.dashboard_host
            ),
            port=self.workflow.config.runtime.dashboard_port,
        )


def run_service(path: Path = Path("WORKFLOW.md")) -> None:
    asyncio.run(SymphonyService.from_host_workflow(path).serve())
