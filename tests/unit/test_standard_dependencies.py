from __future__ import annotations

import tomllib
from pathlib import Path


def test_standard_ai_web_and_workflow_dependencies_are_direct_requirements() -> None:
    project = tomllib.loads(Path("pyproject.toml").read_text(encoding="utf-8"))
    dependencies = project["project"]["dependencies"]

    assert any(dependency.startswith("openai-agents") for dependency in dependencies)
    assert any(dependency.startswith("prefect") for dependency in dependencies)
    assert any(dependency.startswith("fastapi") for dependency in dependencies)
