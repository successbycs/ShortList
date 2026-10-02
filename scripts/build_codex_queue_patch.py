"""Build an offline, digest-guarded Codex queue acknowledgement patch.

Never modifies the installed extension. Generated vendor code is local only.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

VERSION = "26.928.40906"
BASE_SHA256 = "550b03e76ac5a83cb25788aa3240ba445d0e7c7d4e76af8331442687529617ef"
ORIGINAL = (
    '"queued-follow-up-send-lock-release":async('
    "{conversationId:e,messageId:r,lockId:n,sent:o})=>{"
    "this.queuedFollowUpSendLocks.release("
    "{conversationId:e,messageId:r,lockId:n,sent:o})}"
)
REPLACEMENT = ORIGINAL[:-1] + ";return{success:true}}"


def transform(source: bytes, version: str) -> bytes:
    """Reject drift before making the one reviewed replacement."""
    if version != VERSION:
        raise ValueError(f"Unsupported extension version; expected {VERSION}")
    if hashlib.sha256(source).hexdigest() != BASE_SHA256:
        raise ValueError("Bundle digest mismatch; inspect the new package before patching")
    old = ORIGINAL.encode()
    if source.count(old) != 1:
        raise ValueError("Expected exactly one queue release handler")
    return source.replace(old, REPLACEMENT.encode(), 1)


def build(extension: Path, output: Path) -> dict[str, str]:
    """Produce a new standalone bundle and provenance manifest; refuse overwrite."""
    extension = extension.resolve(strict=True)
    output = output.resolve()
    if output == extension or extension in output.parents:
        raise ValueError("Output must be outside the installed extension")
    manifest = json.loads((extension / "package.json").read_text())
    source = (extension / "out/extension.js").read_bytes()
    patched = transform(source, manifest["version"])
    output.mkdir(parents=False, exist_ok=False)
    (output / "extension.js").write_bytes(patched)
    report = {
        "extension_version": VERSION,
        "original_sha256": BASE_SHA256,
        "patched_sha256": hashlib.sha256(patched).hexdigest(),
        "change": "Return JSON acknowledgement after queued-follow-up-send-lock-release",
        "activation": "not installed; live message delivery unobserved",
    }
    (output / "manifest.json").write_text(json.dumps(report, indent=2) + "\n")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--extension", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        report = build(args.extension, args.output)
    except (ValueError, OSError, KeyError) as exc:
        parser.exit(2, f"Patch refused: {exc}\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
