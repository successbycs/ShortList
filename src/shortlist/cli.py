"""Safe command-line entry points for the template self-test."""

from __future__ import annotations

import argparse
import json
from collections.abc import Sequence
from pathlib import Path

from shortlist.adapters import NoOpAdapter
from shortlist.audit import AuditStore
from shortlist.config import ConfigurationError, load_settings
from shortlist.logging import configure_logging, set_correlation_id


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="app-template")
    parser.add_argument("--config", type=Path, help="Path to an active TOML configuration file")
    subcommands = parser.add_subparsers(dest="command", required=True)
    subcommands.add_parser("health", help="Validate local configuration without external calls")
    subcommands.add_parser("self-test", help="Record a synthetic self-test audit event")
    demo = subcommands.add_parser("demo", help="Run the deterministic no-op demonstration")
    demo.add_argument(
        "--no-op", action="store_true", required=True, help="Required safety acknowledgement"
    )
    return parser


def _record_result(command: str, config_path: Path | None) -> int:
    settings = load_settings(config_path=config_path)
    correlation_id = set_correlation_id()
    logger = configure_logging(settings.log_level)
    result = NoOpAdapter().perform()
    event = AuditStore(settings.audit_database_path).record_event(
        event_type="template.self_test" if command == "self-test" else "template.demo",
        correlation_id=correlation_id,
        payload={"command": command, "outcome": result.outcome, "reason": result.reason},
    )
    logger.info("Synthetic no-op completed", extra={"structured": {"event_id": event.event_id}})
    print(
        json.dumps(
            {
                "status": "ok",
                "correlation_id": correlation_id,
                "event_id": event.event_id,
                "outcome": result.outcome,
                "reason": result.reason,
            },
            sort_keys=True,
        )
    )
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "health":
            settings = load_settings(config_path=args.config)
            correlation_id = set_correlation_id()
            print(
                json.dumps(
                    {
                        "status": "ok",
                        "correlation_id": correlation_id,
                        "settings": settings.safe_values(),
                    },
                    sort_keys=True,
                )
            )
            return 0
        return _record_result(args.command, args.config)
    except (ConfigurationError, ValueError) as error:
        print(f"configuration error: {error}")
        return 2


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
