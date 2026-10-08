"""Fail when a repository-relative Markdown file link does not resolve."""

from __future__ import annotations

import re
from pathlib import Path

LINK = re.compile(r"\[[^]]+\]\(([^)]+)\)")
URI_SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")
PLACEHOLDER = re.compile(r"^[A-Z][A-Z0-9_]*$")


def find_broken_links(root: Path) -> list[str]:
    failures: list[str] = []
    for markdown in root.rglob("*.md"):
        if any(part in {".git", ".venv", "node_modules", "var"} for part in markdown.parts):
            continue
        if markdown.is_relative_to(root / ".codex" / "skills"):
            continue
        for target in LINK.findall(markdown.read_text(encoding="utf-8")):
            target = target.strip().strip("<>")
            if (
                target.startswith(("#", "/", "{{"))
                or URI_SCHEME.match(target)
                or PLACEHOLDER.fullmatch(target)
            ):
                continue
            file_target = target.split("#", 1)[0]
            if file_target and not (markdown.parent / file_target).resolve().is_file():
                failures.append(f"{markdown.relative_to(root)} -> {target}")
    return failures


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    failures = find_broken_links(root)
    if failures:
        print("Broken Markdown links:\n" + "\n".join(failures))
        return 1
    print("Markdown links: passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
