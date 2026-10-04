"""Run real local capability proofs for the active template deployment surface."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from shortlist.audit import AuditStore

ROOT = Path(__file__).resolve().parents[1]
PROOF_ROOT = ROOT / "var" / "proofs"


def output_path(value: str) -> Path:
    candidate = (ROOT / value).resolve() if not Path(value).is_absolute() else Path(value).resolve()
    if not candidate.is_relative_to(PROOF_ROOT.resolve()):
        raise ValueError("proof output must be below var/proofs")
    return candidate


def command(arguments: list[str], *, environ: dict[str, str] | None = None) -> tuple[int, str]:
    result = subprocess.run(
        arguments,
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        env=environ,
    )
    return result.returncode, result.stdout.strip()


def proof_environment(environ: dict[str, str] | None = None) -> dict[str, str]:
    """Remove host Compose overrides that would invalidate the disposable proof."""
    values = dict(os.environ if environ is None else environ)
    values.pop("APP_TEMPLATE_AUDIT_DATABASE_PATH", None)
    return values


def row(
    component: str, boundary: str, status: str, observed: str, limitation: str = ""
) -> dict[str, str]:
    return {
        "component": component,
        "boundary": boundary,
        "status": status,
        "observed": observed,
        "limitation": limitation,
    }


def prove() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    with tempfile.TemporaryDirectory(prefix="issue-30-proof-") as directory:
        temporary = Path(directory)
        database = temporary / "audit.sqlite3"
        valid = temporary / "valid.toml"
        valid.write_text(
            f'app_name = "issue-30-proof"\naudit_database_path = "{database}"\n',
            encoding="utf-8",
        )
        invalid = temporary / "invalid.toml"
        invalid.write_text("unknown_key = true\n", encoding="utf-8")
        cli = [sys.executable, "-m", "shortlist.cli"]

        isolated_environment = proof_environment()
        code, output = command(
            [*cli, "--config", str(valid), "health"], environ=isolated_environment
        )
        rows.append(
            row(
                "CLI and Pydantic configuration",
                "operator CLI valid configuration",
                "passed" if code == 0 and json.loads(output)["status"] == "ok" else "failed",
                f"exit={code}",
            )
        )
        code, output = command(
            [*cli, "--config", str(invalid), "health"], environ=isolated_environment
        )
        rows.append(
            row(
                "CLI invalid configuration refusal",
                "operator CLI invalid configuration",
                "passed" if code == 2 and "configuration error" in output else "failed",
                f"exit={code}",
            )
        )
        code, output = command(
            [*cli, "--config", str(valid), "self-test"], environ=isolated_environment
        )
        payload: dict[str, Any] = json.loads(output) if code == 0 else {}
        persisted = database.exists() and any(
            event.event_id == payload.get("event_id")
            for event in AuditStore(database).list_events()
        )
        rows.append(
            row(
                "SQLite audit persistence",
                "CLI write, process exit, application-store reopen",
                "passed" if code == 0 and persisted else "failed",
                f"exit={code}; event_reopened={persisted}",
            )
        )
        code, output = command(
            [*cli, "--config", str(valid), "demo", "--no-op"], environ=isolated_environment
        )
        payload = json.loads(output) if code == 0 else {}
        rows.append(
            row(
                "No-op adapter",
                "operator CLI deterministic demo",
                "passed" if code == 0 and payload.get("outcome") == "no_action" else "failed",
                f"exit={code}; outcome={payload.get('outcome')}",
            )
        )
    code, _ = command([sys.executable, "scripts/check_markdown_links.py"])
    rows.append(
        row(
            "Markdown verification tooling",
            "repository checker good input",
            "passed" if code == 0 else "failed",
            f"exit={code}",
        )
    )
    PROOF_ROOT.mkdir(parents=True, exist_ok=True)
    fixture = PROOF_ROOT / ".issue-30-bad-link.md"
    fixture.write_text("[missing](missing-proof-target.md)\n", encoding="utf-8")
    try:
        code, _ = command([sys.executable, "scripts/check_markdown_links.py"])
    finally:
        fixture.unlink(missing_ok=True)
    rows.append(
        row(
            "Markdown verification refusal",
            "known-bad disposable local link",
            "passed" if code == 1 else "failed",
            f"exit={code}",
        )
    )
    rows.extend(
        [
            row(
                "PyYAML runtime",
                "no active YAML boundary",
                "inactive",
                "no supported default YAML path",
            ),
            row(
                "Prefect runtime",
                "no configured flow/deployment",
                "inactive",
                "feature adoption required",
            ),
            row(
                "OpenAI Agents SDK provider request",
                "approved non-production provider account",
                "blocked",
                "no approved credential/account/cost/data boundary",
            ),
        ]
    )
    return rows


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="var/proofs/issue-30.json")
    args = parser.parse_args(argv)
    try:
        output = output_path(args.output)
    except ValueError as error:
        print(f"proof output error: {error}")
        return 2
    rows = prove()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps({"schema_version": 1, "rows": rows}, indent=2) + "\n", encoding="utf-8"
    )
    failed = sum(item["status"] == "failed" for item in rows)
    print(json.dumps({"output": str(output.relative_to(ROOT)), "failed": failed}, sort_keys=True))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
