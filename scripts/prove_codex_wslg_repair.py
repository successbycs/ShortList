"""Compare two Codex runtimes against real sandbox and filesystem-helper probes.

Run from an approved host terminal; child Codex operations remain sandboxed.
No model request, host configuration change, or installed-runtime replacement.
JSON goes to stdout; persist it under var/proofs before reviewing for publication.
"""

import argparse
import base64
import hashlib
import json
import selectors
import socket
import subprocess
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path


class Executor:
    def __init__(self, binary, cwd):
        self.proc = subprocess.Popen(
            [binary, "exec-server", "--listen", "stdio://"],
            cwd=cwd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        self.selector = selectors.DefaultSelector()
        self.selector.register(self.proc.stdout, selectors.EVENT_READ)
        self.counter = 0
        try:
            response = self.call("initialize", {"clientName": "wslg-repair-proof"})
            if "error" in response:
                raise RuntimeError("executor initialization rejected")
            self.send({"method": "initialized", "params": {}})
        except Exception:
            self.close()
            raise

    def send(self, request):
        self.proc.stdin.write((json.dumps(request) + "\n").encode())
        self.proc.stdin.flush()

    def call(self, method, params):
        self.counter += 1
        self.send({"id": self.counter, "method": method, "params": params})
        deadline = time.monotonic() + 20
        while time.monotonic() < deadline:
            if not self.selector.select(max(0, deadline - time.monotonic())):
                break
            line = self.proc.stdout.readline()
            if not line:
                raise RuntimeError("executor closed stdout")
            response = json.loads(line)
            if response.get("id") == self.counter:
                return response
        raise TimeoutError(method)

    def close(self):
        self.proc.terminate()
        try:
            self.proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.proc.kill()
            self.proc.wait(timeout=5)
        self.selector.close()
        self.proc.stdin.close()
        self.proc.stdout.close()


def fingerprint(binary):
    with open(binary, "rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    return {
        "version": subprocess.check_output([binary, "--version"], text=True).strip(),
        "sha256": digest,
    }


def probe(binary, root, trials):
    workspace = root / "workspace"
    denied = root / "denied"
    workspace.mkdir(exist_ok=True)
    denied.mkdir(exist_ok=True)
    canary = denied / "canary.txt"
    canary.write_text("private-fixture")
    permission = {
        "type": "managed",
        "file_system": {
            "type": "restricted",
            "entries": [
                {"path": {"type": "path", "path": "file:///"}, "access": "read"},
                {"path": {"type": "path", "path": workspace.as_uri()}, "access": "write"},
                {"path": {"type": "path", "path": denied.as_uri()}, "access": "deny"},
            ],
        },
        "network": "restricted",
    }
    context = {
        "permissions": permission,
        "cwd": workspace.as_uri(),
        "workspaceRoots": [workspace.as_uri()],
        "windowsSandboxLevel": "restricted-token",
        "useLegacyLandlock": False,
    }
    results = []
    executor = Executor(binary, workspace)
    try:
        for trial in range(trials):
            path = workspace / f"probe-{trial}.txt"
            payload = base64.b64encode(b"wslg-proof").decode()
            for method, params in [
                ("fs/writeFile", {"path": path.as_uri(), "dataBase64": payload}),
                ("fs/readFile", {"path": path.as_uri()}),
                ("fs/remove", {"path": path.as_uri(), "recursive": False, "force": False}),
            ]:
                response = executor.call(method, dict(params, sandbox=context))
                passed = "result" in response
                if method == "fs/readFile" and passed:
                    passed = response["result"].get("dataBase64") == payload
                results.append(
                    {
                        "trial": trial,
                        "method": method,
                        "passed": passed,
                        "error": response.get("error"),
                    }
                )
                if not passed:
                    break
            if not passed:
                break
        for name, method, params in [
            ("denied_read", "fs/readFile", {"path": canary.as_uri()}),
            (
                "denied_write",
                "fs/writeFile",
                {"path": (denied / "unexpected.txt").as_uri(), "dataBase64": "eA=="},
            ),
            ("wslg_alias_read", "fs/readFile", {"path": "file:///mnt/wslg/distro" + str(canary)}),
        ]:
            response = executor.call(method, dict(params, sandbox=context))
            error = response.get("error", {})
            message = error.get("message", "").lower()
            denial = (
                "error" in response
                and error.get("code") != -32602
                and (
                    "permission denied" in message
                    or "operation not permitted" in message
                    or "read-only file system" in message
                )
            )
            results.append({"method": name, "denied": denial, "error": response.get("error")})
    finally:
        executor.close()
    # Use explicit legacy settings for these separate command-side checks.
    cli = [
        binary,
        "-c",
        'sandbox_mode="workspace-write"',
        "-c",
        "sandbox_workspace_write.exclude_slash_tmp=true",
        "-c",
        "sandbox_workspace_write.exclude_tmpdir_env_var=true",
        "-c",
        "sandbox_workspace_write.network_access=false",
        "sandbox",
        "--",
    ]
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        listener.listen()
        port = listener.getsockname()[1]
        code = (
            "from pathlib import Path; import socket,os,json; "
            "p=Path('command-probe'); p.write_text('ok'); "
            "assert p.read_text()=='ok'; p.unlink(); "
            "checks={}; "
            "checks['network_blocked']=False; "
            "\ntry:\n socket.create_connection(('127.0.0.1'," + str(port) + "),timeout=1).close()"
            "\nexcept OSError:\n checks['network_blocked']=True"
            "\ntry:\n Path("
            + repr(str(denied / "command-write"))
            + ").write_text('bad'); checks['outside_write_blocked']=False"
            "\nexcept OSError:\n checks['outside_write_blocked']=True"
            "\ntry:\n os.listdir('/tmp/codex-daemon-' + str(os.getuid())); "
            "checks['daemon_hidden']=False"
            "\nexcept OSError:\n checks['daemon_hidden']=True"
            "\nprint(json.dumps(checks)); assert all(checks.values())"
        )
        for trial in range(trials):
            run = subprocess.run(
                cli + ["/usr/bin/python3", "-c", code],
                capture_output=True,
                text=True,
                timeout=20,
                cwd=workspace,
            )
            results.append(
                {
                    "trial": trial,
                    "method": "sandbox_command",
                    "exit_code": run.returncode,
                    "stdout": run.stdout.strip(),
                    "stderr": run.stderr.strip(),
                }
            )
            if run.returncode:
                break
    return {
        "runtime": fingerprint(binary),
        "context": context,
        "trials": results,
        "workspace_clean": not list(workspace.iterdir()),
        "canary_unchanged": canary.read_text() == "private-fixture",
    }


def comparison_passed(report):
    """Reject incomplete runs and unrelated errors; scope is isolated helpers only."""
    if not report.get("wslg_present") or len(report.get("runs", [])) != 3:
        return False
    baseline, candidate, fresh = report["runs"]
    signature = "unsupported host mount at /mnt/wslg/distro"
    baseline_trials = baseline.get("trials", [])
    if not any(
        item.get("method") == "fs/writeFile"
        and signature in (item.get("error") or {}).get("message", "")
        for item in baseline_trials
    ):
        return False
    if not any(
        item.get("method") == "sandbox_command"
        and item.get("exit_code") == 1
        and signature in item.get("stderr", "")
        for item in baseline_trials
    ):
        return False
    for run, count in [(candidate, 10), (fresh, 1)]:
        if run.get("incomplete") or not run.get("workspace_clean"):
            return False
        if not run.get("canary_unchanged"):
            return False
        trials = run.get("trials", [])
        for method in ["fs/writeFile", "fs/readFile", "fs/remove", "sandbox_command"]:
            rows = [item for item in trials if item.get("method") == method]
            if len(rows) != count or {item.get("trial") for item in rows} != set(range(count)):
                return False
            if method == "sandbox_command":
                for item in rows:
                    if item.get("exit_code") != 0:
                        return False
                    try:
                        checks = json.loads(item.get("stdout", ""))
                    except ValueError:
                        return False
                    if not all(
                        checks.get(key) is True
                        for key in ["network_blocked", "outside_write_blocked", "daemon_hidden"]
                    ):
                        return False
            elif not all(item.get("passed") is True for item in rows):
                return False
        for method in ["denied_read", "denied_write", "wslg_alias_read"]:
            rows = [item for item in trials if item.get("method") == method]
            if len(rows) != 1 or rows[0].get("denied") is not True:
                return False
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--candidate", required=True)
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="codex-wslg-proof-") as temp:
        root = Path(temp)
        report = {
            "captured_at": datetime.now(UTC).isoformat(),
            "wslg_present": Path("/mnt/wslg/distro").is_dir(),
            "runs": [],
        }
        for label, binary, count in [
            ("baseline", args.baseline, 1),
            ("candidate", args.candidate, 10),
            ("candidate_fresh_process", args.candidate, 1),
        ]:
            directory = root / label
            directory.mkdir()
            try:
                result = probe(binary, directory, count)
            except Exception as error:
                result = {"incomplete": str(error)}
            report["runs"].append({"label": label, **result})
        report["isolated_comparison_passed"] = comparison_passed(report)
        report["active_editor_verified"] = False
        print(json.dumps(report, indent=2))
        return 0 if report["isolated_comparison_passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
