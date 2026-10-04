from __future__ import annotations

import json
import logging

from shortlist.logging import (
    REDACTED,
    JsonFormatter,
    redact,
    set_correlation_id,
)


def test_redact_recursively_redacts_sensitive_structured_keys() -> None:
    value = redact({"api_token": "synthetic-secret", "nested": {"password": "also-secret"}})

    assert value == {"api_token": REDACTED, "nested": {"password": REDACTED}}


def test_json_formatter_includes_correlation_id_and_redacts_data() -> None:
    set_correlation_id("correlation-test")
    record = logging.LogRecord("test", logging.INFO, "", 0, "message", (), None)
    record.structured = {"authorization": "synthetic-secret"}  # type: ignore[attr-defined]

    rendered = json.loads(JsonFormatter().format(record))

    assert rendered["correlation_id"] == "correlation-test"
    assert rendered["data"]["authorization"] == REDACTED
