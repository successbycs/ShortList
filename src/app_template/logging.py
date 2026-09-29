"""JSON logging with correlation IDs and key-based secret redaction."""

from __future__ import annotations

import contextvars
import json
import logging
from collections.abc import Mapping
from typing import Any
from uuid import uuid4

CORRELATION_ID: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "correlation_id", default=None
)
SENSITIVE_KEY_PARTS = ("secret", "password", "token", "api_key", "authorization", "credential")
REDACTED = "[REDACTED]"


def set_correlation_id(value: str | None = None) -> str:
    """Set and return the correlation ID for the current execution context."""
    correlation_id = value or str(uuid4())
    CORRELATION_ID.set(correlation_id)
    return correlation_id


def redact(value: Any, *, key: str | None = None) -> Any:
    """Redact values whose structured key signals a credential.

    This intentionally cannot guarantee removal of secrets embedded in arbitrary
    free-text messages. Callers must avoid logging free-text credentials.
    """
    normalized_key = (key or "").lower()
    if any(part in normalized_key for part in SENSITIVE_KEY_PARTS):
        return REDACTED
    if isinstance(value, Mapping):
        return {
            str(item_key): redact(item_value, key=str(item_key))
            for item_key, item_value in value.items()
        }
    if isinstance(value, list):
        return [redact(item) for item in value]
    if isinstance(value, tuple):
        return [redact(item) for item in value]
    return value


class JsonFormatter(logging.Formatter):
    """Emit a compact, redacted JSON log record."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": CORRELATION_ID.get() or set_correlation_id(),
        }
        structured = getattr(record, "structured", None)
        if structured is not None:
            payload["data"] = redact(structured)
        return json.dumps(payload, sort_keys=True, default=str)


def configure_logging(level: str = "INFO") -> logging.Logger:
    """Configure the template logger without touching the root logger."""
    logger = logging.getLogger("app_template")
    logger.handlers.clear()
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    logger.setLevel(level)
    logger.propagate = False
    return logger
