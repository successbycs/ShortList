from __future__ import annotations

import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "check_markdown_links.py"
SPEC = spec_from_file_location("check_markdown_links", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)
find_broken_links = MODULE.find_broken_links


def test_finds_missing_repository_relative_link(tmp_path: Path) -> None:
    (tmp_path / "guide.md").write_text("[missing](missing.md)\n", encoding="utf-8")

    assert find_broken_links(tmp_path) == ["guide.md -> missing.md"]


def test_ignores_external_root_and_placeholder_links(tmp_path: Path) -> None:
    (tmp_path / "guide.md").write_text(
        "\n".join(
            [
                "[web](https://example.test)",
                "[plugin](plugin://example)",
                "[site](/features/analytics)",
                "[template](IMAGE_PATH_OR_URL)",
                "[value]({{ thread_url }})",
            ]
        ),
        encoding="utf-8",
    )

    assert find_broken_links(tmp_path) == []


def test_ignores_imported_vendor_skill_links(tmp_path: Path) -> None:
    vendor = tmp_path / ".codex" / "skills" / "vendor"
    vendor.mkdir(parents=True)
    (vendor / "SKILL.md").write_text("[unimported](../../pricing/SKILL.md)\n", encoding="utf-8")

    assert find_broken_links(tmp_path) == []


def test_ignores_generated_and_dependency_trees(tmp_path: Path) -> None:
    dependency = tmp_path / "apps" / "web" / "node_modules" / "package"
    generated = tmp_path / "var" / "workspace"
    dependency.mkdir(parents=True)
    generated.mkdir(parents=True)
    (dependency / "README.md").write_text("[missing](missing.md)\n", encoding="utf-8")
    (generated / "report.md").write_text("[missing](missing.md)\n", encoding="utf-8")

    assert find_broken_links(tmp_path) == []
