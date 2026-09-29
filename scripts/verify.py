"""Run the repository's complete local Python verification suite.

Run this script through the container-managed environment after a locked sync.
It deliberately has no network, GitHub, or Docker side effects.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMMANDS = (
    ("Ruff lint", [sys.executable, "-m", "ruff", "check", "."]),
    ("Ruff format", [sys.executable, "-m", "ruff", "format", "--check", "."]),
    ("pytest", [sys.executable, "-m", "pytest", "-q"]),
    ("Markdown links", [sys.executable, "scripts/check_markdown_links.py"]),
)


def main() -> int:
    for label, command in COMMANDS:
        print(f"==> {label}", flush=True)
        result = subprocess.run(command, cwd=ROOT, check=False)
        if result.returncode:
            print(f"Verification failed: {label}", file=sys.stderr)
            return result.returncode
    print("Verification: passed")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
