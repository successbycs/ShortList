from __future__ import annotations

import os
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
    destination = tmp_path / "template-copy"
    package = destination / "src" / "app_template"
    package.mkdir(parents=True)
    (destination / "tests").mkdir()
    scripts = destination / "scripts"
    scripts.mkdir()

    (destination / "pyproject.toml").write_text(
        """[project]
name = "app-template"

[project.scripts]
app-template = "app_template.cli:main"

[tool.hatch.build.targets.wheel]
packages = ["src/app_template"]

[tool.app-template.github]
repository = "successbycs/template"
""",
        encoding="utf-8",
    )
    (destination / "README.md").write_text("# App Template\n", encoding="utf-8")
    (destination / "WORKFLOW.md").write_text("repo: successbycs/template\n", encoding="utf-8")
    (destination / "compose.yaml").write_text("services: {}\n", encoding="utf-8")
    (scripts / "prove_deployed_software.py").write_text(
        "from app_template.audit import AuditStore\n",
        encoding="utf-8",
    )
    (scripts / "install_upstream_symphony.sh").write_text("#!/usr/bin/env bash\n", encoding="utf-8")
    (scripts / "run_upstream_symphony_dashboard.sh").write_text(
        "#!/usr/bin/env bash\n",
        encoding="utf-8",
    )
    (package / "__init__.py").write_text('__version__ = "0.1.0"\n', encoding="utf-8")
    (package / "audit.py").write_text("class AuditStore: pass\n", encoding="utf-8")
    (package / "config.py").write_text(
        'def default_name() -> str:\n    return "app-template"\n',
        encoding="utf-8",
    )
    (package / "cli.py").write_text(
        "import argparse\n\nparser = argparse.ArgumentParser()\nparser.parse_args()\n",
        encoding="utf-8",
    )
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
        "--github-repository",
        "example-owner/demo-app",
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
        "--github-repository",
        "example-owner/demo-app",
    ]

    assert main(arguments) == 0
    assert main(arguments) == 0
    assert (copied_template / "src" / "demo_app").is_dir()
    assert not (copied_template / "src" / "app_template").exists()
    assert 'name = "demo-app"' in (copied_template / "pyproject.toml").read_text(encoding="utf-8")
    assert 'repository = "example-owner/demo-app"' in (
        copied_template / "pyproject.toml"
    ).read_text(encoding="utf-8")
    assert "repo: example-owner/demo-app" in (copied_template / "WORKFLOW.md").read_text(
        encoding="utf-8"
    )
    assert not (copied_template / "src" / "demo_app" / "symphony").exists()
    assert (copied_template / "WORKFLOW.md").is_file()
    assert (copied_template / "scripts" / "install_upstream_symphony.sh").is_file()
    assert (copied_template / "scripts" / "run_upstream_symphony_dashboard.sh").is_file()
    proof = copied_template / "scripts" / "prove_deployed_software.py"
    assert "from demo_app.audit import AuditStore" in proof.read_text(encoding="utf-8")
    result = subprocess.run(
        [sys.executable, "-c", "import demo_app; print(demo_app.__version__)"],
        cwd=copied_template,
        env={**os.environ, "PYTHONPATH": str(copied_template / "src")},
        check=True,
        capture_output=True,
        text=True,
    )
    assert result.stdout.strip() == "0.1.0"
    cli_help = subprocess.run(
        [sys.executable, "-m", "demo_app.cli", "--help"],
        cwd=copied_template,
        env={**os.environ, "PYTHONPATH": str(copied_template / "src")},
        check=True,
        capture_output=True,
        text=True,
    )
    assert "symphony" not in cli_help.stdout


def test_invalid_name_and_conflict_fail_without_overwrite(copied_template: Path) -> None:
    (copied_template / "src" / "taken_name").mkdir()

    invalid_name = [
        "--root",
        str(copied_template),
        "--project-name",
        "Bad Name",
        "--package-name",
        "bad_name",
        "--github-repository",
        "example-owner/bad-name",
    ]
    conflict = [
        "--root",
        str(copied_template),
        "--project-name",
        "demo-app",
        "--package-name",
        "taken_name",
        "--github-repository",
        "example-owner/demo-app",
    ]
    assert main(invalid_name) == 2
    assert main(conflict) == 2
    assert (copied_template / "src" / "app_template").is_dir()


def test_invalid_github_repository_fails_without_changes(copied_template: Path) -> None:
    arguments = [
        "--root",
        str(copied_template),
        "--project-name",
        "demo-app",
        "--package-name",
        "demo_app",
        "--github-repository",
        "not a repository",
    ]

    assert main(arguments) == 2
    assert (copied_template / "src" / "app_template").is_dir()
