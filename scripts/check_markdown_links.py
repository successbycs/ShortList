"""Fail when a repository-relative Markdown file link does not resolve."""

from __future__ import annotations

import re
from pathlib import Path

LINK = re.compile(r"\[[^]]+\]\(([^)]+)\)")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    failures: list[str] = []
    for markdown in root.rglob("*.md"):
        if any(part in {".git", ".venv"} for part in markdown.parts):
            continue
        for target in LINK.findall(markdown.read_text(encoding="utf-8")):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            file_target = target.split("#", 1)[0]
            if file_target and not (markdown.parent / file_target).resolve().is_file():
                failures.append(f"{markdown.relative_to(root)} -> {target}")
    if failures:
        print("Broken Markdown links:\n" + "\n".join(failures))
        return 1
    print("Markdown links: passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
