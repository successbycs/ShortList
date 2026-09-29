from __future__ import annotations

import sqlite3
from datetime import UTC, datetime
from pathlib import Path

import pytest

from app_template.audit import AuditEvent, AuditStore, UnsupportedSchemaVersion


def test_event_persists_across_store_instances(tmp_path: Path) -> None:
    database_path = tmp_path / "audit.sqlite3"
    store = AuditStore(database_path)
    event = store.record_event(
        event_type="template.test",
        correlation_id="correlation-1",
        payload={"outcome": "no_action"},
    )

    events = AuditStore(database_path).list_events()

    assert events == [event]


def test_batch_rolls_back_when_any_write_fails(tmp_path: Path) -> None:
    store = AuditStore(tmp_path / "audit.sqlite3")
    now = datetime.now(UTC).isoformat()
    valid = AuditEvent("event-1", "valid", "correlation-1", {}, now)
    invalid = AuditEvent("event-2", "", "correlation-1", {}, now)

    with pytest.raises(sqlite3.IntegrityError):
        store.record_batch([valid, invalid])

    assert store.list_events() == []


def test_unsupported_schema_version_fails_safely(tmp_path: Path) -> None:
    database_path = tmp_path / "audit.sqlite3"
    store = AuditStore(database_path)
    store.initialize()
    with sqlite3.connect(database_path) as connection:
        connection.execute("UPDATE schema_metadata SET schema_version = 999 WHERE singleton = 1")

    with pytest.raises(UnsupportedSchemaVersion, match="Expected schema version 1, found 999"):
        store.initialize()
