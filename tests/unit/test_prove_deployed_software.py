from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts" / "prove_deployed_software.py"
SPEC = importlib.util.spec_from_file_location("prove_deployed_software", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_output_path_rejects_unsafe_location() -> None:
    with pytest.raises(ValueError, match="var/proofs"):
        MODULE.output_path("outside.json")


def test_output_path_accepts_repository_proof_location() -> None:
    assert MODULE.output_path("var/proofs/issue-30.json").name == "issue-30.json"


def test_proof_environment_removes_compose_audit_override() -> None:
    environment = MODULE.proof_environment(
        {"APP_TEMPLATE_AUDIT_DATABASE_PATH": "/var/lib/app-template/audit.sqlite3", "KEEP": "yes"}
    )

    assert environment == {"KEEP": "yes"}
