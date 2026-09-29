from __future__ import annotations

import json
from pathlib import Path

from app_template.audit import AuditStore
from app_template.cli import main


def test_health_redacts_diagnostic_token(monkeypatch, capsys) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setenv("APP_TEMPLATE_DIAGNOSTIC_TOKEN", "synthetic-secret")

    assert main(["health"]) == 0

    payload = json.loads(capsys.readouterr().out)
    assert payload["status"] == "ok"
    assert payload["settings"]["diagnostic_token"] == "[REDACTED]"


def test_no_op_demo_records_audit_event(tmp_path: Path, monkeypatch, capsys) -> None:  # type: ignore[no-untyped-def]
    database_path = tmp_path / "audit.sqlite3"
    monkeypatch.setenv("APP_TEMPLATE_AUDIT_DATABASE_PATH", str(database_path))

    assert main(["demo", "--no-op"]) == 0

    payload = json.loads(capsys.readouterr().out)
    events = AuditStore(database_path).list_events()
    assert payload["outcome"] == "no_action"
    assert events[0].correlation_id == payload["correlation_id"]
    assert events[0].payload["outcome"] == "no_action"
