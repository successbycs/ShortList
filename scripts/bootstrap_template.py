"""Safely personalize explicit template-owned names in a copied repository."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

DIST_NAME = re.compile(r"[a-z][a-z0-9-]{1,62}\Z")
PACKAGE_NAME = re.compile(r"[a-z][a-z0-9_]{1,62}\Z")
GITHUB_REPOSITORY = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\Z")
STATE_FILE = ".template-bootstrap-state.json"


@dataclass(frozen=True)
class BootstrapPlan:
    root: Path
    project_name: str
    package_name: str
    github_repository: str
    files: tuple[Path, ...]


def _validate(project_name: str, package_name: str, github_repository: str) -> None:
    if not DIST_NAME.fullmatch(project_name):
        raise ValueError("project name must use lowercase letters, digits, and hyphens")
    if not PACKAGE_NAME.fullmatch(package_name):
        raise ValueError("package name must use lowercase letters, digits, and underscores")
    if not GITHUB_REPOSITORY.fullmatch(github_repository):
        raise ValueError("GitHub repository must use OWNER/REPOSITORY syntax")


def _build_plan(
    root: Path, project_name: str, package_name: str, github_repository: str
) -> BootstrapPlan:
    _validate(project_name, package_name, github_repository)
    state = root / STATE_FILE
    expected_state = {
        "project_name": project_name,
        "package_name": package_name,
        "github_repository": github_repository,
    }
    if state.exists():
        previous = json.loads(state.read_text(encoding="utf-8"))
        if previous == expected_state:
            return BootstrapPlan(root, project_name, package_name, github_repository, ())
        raise ValueError("template copy was already bootstrapped with different values")
    required = (root / "pyproject.toml", root / "src" / "app_template", root / "tests")
    missing = [str(path.relative_to(root)) for path in required if not path.exists()]
    if missing:
        raise ValueError(f"not an unbootstrapped template copy; missing: {', '.join(missing)}")
    target = root / "src" / package_name
    if package_name != "app_template" and target.exists():
        target_path = target.relative_to(root)
        raise ValueError(f"refusing to overwrite existing package directory: {target_path}")
    files = (
        root / "pyproject.toml",
        root / "README.md",
        root / "compose.yaml",
        root / "scripts" / "prove_deployed_software.py",
        root / "src" / "app_template" / "config.py",
    )
    files += tuple((root / "src" / "app_template").rglob("*.py"))
    files += tuple((root / "tests").rglob("*.py"))
    return BootstrapPlan(
        root,
        project_name,
        package_name,
        github_repository,
        tuple(sorted(set(files))),
    )


def _replace(text: str, plan: BootstrapPlan, path: Path) -> str:
    result = text.replace("app_template", plan.package_name)
    if path.name == "pyproject.toml":
        result = result.replace('name = "app-template"', f'name = "{plan.project_name}"')
        result = result.replace("app-template = ", f"{plan.project_name} = ")
        result = result.replace(
            'packages = ["src/app_template"]', f'packages = ["src/{plan.package_name}"]'
        )
    if path.name == "README.md":
        result = result.replace("# App Template", f"# {plan.project_name}")
    if path.name == "config.py":
        result = result.replace('default="app-template"', f'default="{plan.project_name}"')
    if path.name == "pyproject.toml":
        result = result.replace(
            'repository = "successbycs/template"',
            f'repository = "{plan.github_repository}"',
        )
    return result


def apply(plan: BootstrapPlan, *, dry_run: bool) -> None:
    if not plan.files:
        print("bootstrap: already applied; no changes")
        return
    changes = [path.relative_to(plan.root).as_posix() for path in plan.files]
    changes.append(f"src/app_template -> src/{plan.package_name}")
    changes.append(STATE_FILE)
    if dry_run:
        print(json.dumps({"status": "dry-run", "changes": changes}, sort_keys=True))
        return
    replacements = {
        path: _replace(path.read_text(encoding="utf-8"), plan, path) for path in plan.files
    }
    for path, content in replacements.items():
        path.write_text(content, encoding="utf-8")
    source = plan.root / "src" / "app_template"
    target = plan.root / "src" / plan.package_name
    if source != target:
        source.rename(target)
    state = {
        "project_name": plan.project_name,
        "package_name": plan.package_name,
        "github_repository": plan.github_repository,
    }
    (plan.root / STATE_FILE).write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "applied", "changes": changes}, sort_keys=True))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-name", required=True)
    parser.add_argument("--package-name", required=True)
    parser.add_argument(
        "--github-repository",
        required=True,
        help="Target GitHub repository in OWNER/REPOSITORY form for the copied project",
    )
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    try:
        plan = _build_plan(
            args.root.resolve(), args.project_name, args.package_name, args.github_repository
        )
        apply(plan, dry_run=args.dry_run)
    except (ValueError, json.JSONDecodeError) as error:
        print(f"bootstrap error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
