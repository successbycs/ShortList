"""Detect a WSLg mount topology that can disrupt the Codex app-server sandbox."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

PARENT_TARGET = "/mnt/wslg"
NESTED_TARGET = "/mnt/wslg/distro"


@dataclass(frozen=True)
class MountCheck:
    status: str
    message: str
    exit_code: int


def mount_targets(mountinfo: str) -> set[str]:
    """Return decoded mount targets from Linux procfs mountinfo text."""
    targets: set[str] = set()
    for line in mountinfo.splitlines():
        if not line.strip():
            continue
        before_separator, separator, _ = line.partition(" - ")
        fields = before_separator.split()
        if not separator or len(fields) < 5:
            raise ValueError("mountinfo contains a malformed record")
        targets.add(fields[4].replace(r"\040", " ").replace(r"\011", "\t"))
    if not targets:
        raise ValueError("mountinfo contains no records")
    return targets


def check_mountinfo(mountinfo: str) -> MountCheck:
    try:
        targets = mount_targets(mountinfo)
    except ValueError as error:
        return MountCheck("unknown", f"unknown: {error}", 3)
    if PARENT_TARGET in targets and NESTED_TARGET in targets:
        return MountCheck(
            "incompatible",
            "incompatible: nested /mnt/wslg/distro mount is present beneath /mnt/wslg; "
            "normal app-server sandbox operations may fail",
            2,
        )
    return MountCheck(
        "compatible",
        "compatible: the known nested /mnt/wslg/distro mount topology is absent",
        0,
    )


def main(arguments: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mountinfo",
        type=Path,
        default=Path("/proc/self/mountinfo"),
        help="read mountinfo from this path instead of live procfs",
    )
    args = parser.parse_args(arguments)
    try:
        mountinfo = args.mountinfo.read_text(encoding="utf-8")
    except OSError as error:
        print(f"unknown: cannot read mountinfo ({type(error).__name__})")
        return 3
    result = check_mountinfo(mountinfo)
    print(result.message)
    return result.exit_code


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
