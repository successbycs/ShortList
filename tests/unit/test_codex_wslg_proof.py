"""Evidence acceptance tests; do not substitute for the committed real-host run."""

import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location(
    "codex_wslg_proof", ROOT / "scripts/prove_codex_wslg_repair.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def evidence():
    return json.loads(
        (ROOT / "docs/operations/evidence/issue-35-runtime-comparison.json").read_text()
    )


def test_real_isolated_evidence_passes():
    assert module.comparison_passed(evidence())


def test_missing_trial_is_not_pass():
    report = evidence()
    report["runs"][1]["trials"].pop(0)
    assert not module.comparison_passed(report)


def test_protocol_error_is_not_denial_proof():
    report = evidence()
    for row in report["runs"][1]["trials"]:
        if row["method"] == "denied_read":
            row["denied"] = False
            row["error"] = {"code": -32602, "message": "invalid params"}
    assert not module.comparison_passed(report)


def test_wrong_baseline_error_is_not_reproduction():
    report = evidence()
    report["runs"][0]["trials"][0]["error"]["message"] = "file not found"
    assert not module.comparison_passed(report)


def test_security_or_cleanup_failure_is_not_pass():
    for field in ["workspace_clean", "canary_unchanged"]:
        report = copy.deepcopy(evidence())
        report["runs"][1][field] = False
        assert not module.comparison_passed(report)
