from __future__ import annotations

import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts" / "check_wsl_sandbox_mount.py"
SPEC = spec_from_file_location("check_wsl_sandbox_mount", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


def fixture(name: str) -> Path:
    return ROOT / "tests" / "fixtures" / name


def test_compatible_fixture_reports_absent_nested_mount() -> None:
    result = MODULE.check_mountinfo(fixture("wsl-mountinfo-compatible.txt").read_text())

    assert result.status == "compatible"
    assert result.exit_code == 0


def test_incompatible_fixture_reports_only_the_mount_target() -> None:
    result = MODULE.check_mountinfo(fixture("wsl-mountinfo-incompatible.txt").read_text())

    assert result.status == "incompatible"
    assert result.exit_code == 2
    assert "/mnt/wslg/distro" in result.message
    assert "/dev/sdd" not in result.message


def test_malformed_fixture_is_unknown_without_crashing() -> None:
    result = MODULE.check_mountinfo(fixture("wsl-mountinfo-malformed.txt").read_text())

    assert result.status == "unknown"
    assert result.exit_code == 3


def test_cli_uses_fixture_and_exit_status(capsys) -> None:  # type: ignore[no-untyped-def]
    assert MODULE.main(["--mountinfo", str(fixture("wsl-mountinfo-incompatible.txt"))]) == 2

    assert capsys.readouterr().out.startswith("incompatible: nested /mnt/wslg/distro")
