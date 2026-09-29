"""SQLite-backed synthetic audit-event storage for the template self-test."""

from __future__ import annotations

import json
import sqlite3
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

SCHEMA_VERSION = 1


class UnsupportedSchemaVersion(RuntimeError):
    """Raised when an existing database cannot be safely interpreted."""


@dataclass(frozen=True)
class AuditEvent:
    event_id: str
    event_type: str
    correlation_id: str
    payload: dict[str, Any]
    created_at: str


class AuditStore:
    """Own a small, transactional SQLite schema for synthetic audit evidence.

    It provides local durability and transaction boundaries. It does not claim
    tamper resistance, distributed exactly-once processing, or cross-process
    coordination beyond SQLite's normal locking behavior.
    """

    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path

    def _connect(self) -> sqlite3.Connection:
        if self.database_path != Path(":memory:"):
            self.database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_metadata (
                    singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
                    schema_version INTEGER NOT NULL,
                    applied_at TEXT NOT NULL
                )
                """
            )
            row = connection.execute(
                "SELECT schema_version FROM schema_metadata WHERE singleton = 1"
            ).fetchone()
            if row is None:
                connection.execute(
                    "INSERT INTO schema_metadata(singleton, schema_version, applied_at) "
                    "VALUES (1, ?, ?)",
                    (SCHEMA_VERSION, datetime.now(UTC).isoformat()),
                )
            elif row["schema_version"] != SCHEMA_VERSION:
                raise UnsupportedSchemaVersion(
                    f"Expected schema version {SCHEMA_VERSION}, found {row['schema_version']}"
                )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_events (
                    event_id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL CHECK (length(event_type) > 0),
                    correlation_id TEXT NOT NULL CHECK (length(correlation_id) > 0),
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )

    def _insert(self, connection: sqlite3.Connection, event: AuditEvent) -> None:
        connection.execute(
            """
            INSERT INTO audit_events(event_id, event_type, correlation_id, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                event.event_id,
                event.event_type,
                event.correlation_id,
                json.dumps(event.payload, sort_keys=True),
                event.created_at,
            ),
        )

    def record_event(
        self, *, event_type: str, correlation_id: str, payload: Mapping[str, Any]
    ) -> AuditEvent:
        self.initialize()
        event = AuditEvent(
            event_id=str(uuid4()),
            event_type=event_type,
            correlation_id=correlation_id,
            payload=dict(payload),
            created_at=datetime.now(UTC).isoformat(),
        )
        with self._connect() as connection:
            self._insert(connection, event)
        return event

    def record_batch(self, events: Iterable[AuditEvent]) -> None:
        """Write all supplied events or roll the entire batch back."""
        self.initialize()
        with self._connect() as connection:
            for event in events:
                self._insert(connection, event)

    def list_events(self) -> list[AuditEvent]:
        self.initialize()
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT event_id, event_type, correlation_id, payload_json, created_at "
                "FROM audit_events ORDER BY created_at, event_id"
            ).fetchall()
        return [
            AuditEvent(
                event_id=row["event_id"],
                event_type=row["event_type"],
                correlation_id=row["correlation_id"],
                payload=json.loads(row["payload_json"]),
                created_at=row["created_at"],
            )
            for row in rows
        ]
