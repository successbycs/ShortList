"""Builder refusal checks; the separate Node proof exercises installed code."""

import hashlib
import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location(
    "codex_queue_patch", ROOT / "scripts/build_codex_queue_patch.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def fixture_bundle(tmp_path, monkeypatch, copies=1):
    extension = tmp_path / "extension"
    (extension / "out").mkdir(parents=True)
    source = ("prefix;" + module.ORIGINAL * copies + ";suffix").encode()
    (extension / "out/extension.js").write_bytes(source)
    (extension / "package.json").write_text(json.dumps({"version": module.VERSION}))
    monkeypatch.setattr(module, "BASE_SHA256", hashlib.sha256(source).hexdigest())
    return extension, source


def test_build_preserves_original_and_refuses_overwrite(tmp_path, monkeypatch):
    extension, source = fixture_bundle(tmp_path, monkeypatch)
    output = tmp_path / "candidate"
    report = module.build(extension, output)
    assert (extension / "out/extension.js").read_bytes() == source
    assert (output / "extension.js").read_bytes() == source.replace(
        module.ORIGINAL.encode(), module.REPLACEMENT.encode()
    )
    assert report["activation"].startswith("not installed")
    with pytest.raises(FileExistsError):
        module.build(extension, output)


def test_refuse_digest_drift(tmp_path, monkeypatch):
    extension, source = fixture_bundle(tmp_path, monkeypatch)
    (extension / "out/extension.js").write_bytes(source + b"drift")
    with pytest.raises(ValueError, match="digest mismatch"):
        module.build(extension, tmp_path / "candidate")
    assert not (tmp_path / "candidate").exists()


def test_refuse_version_drift(tmp_path, monkeypatch):
    extension, _ = fixture_bundle(tmp_path, monkeypatch)
    (extension / "package.json").write_text('{"version":"different"}')
    with pytest.raises(ValueError, match="Unsupported extension version"):
        module.build(extension, tmp_path / "candidate")


@pytest.mark.parametrize("copies", [0, 2])
def test_refuse_missing_or_ambiguous_handler(tmp_path, monkeypatch, copies):
    extension, _ = fixture_bundle(tmp_path, monkeypatch, copies)
    with pytest.raises(ValueError, match="exactly one"):
        module.build(extension, tmp_path / "candidate")


def test_refuse_output_inside_installation(tmp_path, monkeypatch):
    extension, _ = fixture_bundle(tmp_path, monkeypatch)
    with pytest.raises(ValueError, match="outside the installed extension"):
        module.build(extension, extension / "candidate")
