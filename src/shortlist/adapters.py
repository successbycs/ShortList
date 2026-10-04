"""Side-effect-free adapters for the template self-test."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class NoActionResult:
    outcome: str
    reason: str


class NoOpAdapter:
    """Return a deterministic decision without contacting any external system."""

    def perform(self) -> NoActionResult:
        return NoActionResult(
            outcome="no_action",
            reason="template self-test intentionally performs no external action",
        )
