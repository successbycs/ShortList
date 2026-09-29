from __future__ import annotations

import os
import shutil
import subprocess
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "bootstrap_template.py"
SPEC = spec_from_file_location("bootstrap_template", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)
main = MODULE.main


@pytest.fixture
def copied_template(tmp_path: Path) -> Path:
    root = Path(__file__).resolve().parents[2]
    destination = tmp_path / "template-copy"
    ignored = shutil.ignore_patterns(".git", ".venv", "var", "__pycache__")
    shutil.copytree(root, destination, ignore=ignored)
    return destination


def test_dry_run_preserves_files(copied_template: Path, capsys: pytest.CaptureFixture[str]) -> None:
    original = (copied_template / "pyproject.toml").read_text(encoding="utf-8")

    arguments = [
        "--root",
        str(copied_template),
        "--project-name",
        "demo-app",
        "--package-name",
        "demo_app",
        "--dry-run",
    ]
    assert main(arguments) == 0

    assert '"status": "dry-run"' in capsys.readouterr().out
    assert (copied_template / "pyproject.toml").read_text(encoding="utf-8") == original
    assert (copied_template / "src" / "app_template").is_dir()


def test_bootstrap_renames_package_and_is_repeatable(copied_template: Path) -> None:
    arguments = [
        "--root",
        str(copied_template),
        "--project-name",
        "demo-app",
        "--package-name",
        "demo_app",
    ]

    assert main(arguments) == 0
    assert main(arguments) == 0
    assert (copied_template / "src" / "demo_app").is_dir()
    assert not (copied_template / "src" / "app_template").exists()
    assert 'name = "demo-app"' in (copied_template / "pyproject.toml").read_text(encoding="utf-8")
    result = subprocess.run(
        [sys.executable, "-c", "import demo_app; print(demo_app.__version__)"],
        cwd=copied_template,
        env={**os.environ, "PYTHONPATH": str(copied_template / "src")},
        check=True,
        capture_output=True,
        text=True,
    )
    assert result.stdout.strip() == "0.1.0"


def test_invalid_name_and_conflict_fail_without_overwrite(copied_template: Path) -> None:
    (copied_template / "src" / "taken_name").mkdir()

    invalid_name = [
        "--root",
        str(copied_template),
        "--project-name",
        "Bad Name",
        "--package-name",
        "bad_name",
    ]
    conflict = [
        "--root",
        str(copied_template),
        "--project-name",
        "demo-app",
        "--package-name",
        "taken_name",
    ]
    assert main(invalid_name) == 2
    assert main(conflict) == 2
    assert (copied_template / "src" / "app_template").is_dir()
