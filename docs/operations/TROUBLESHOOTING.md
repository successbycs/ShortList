# Troubleshooting

**Status:** active template | **Owner:** operator | **Update:** recurrent failure changes.

If Docker is unavailable in WSL, enable Docker Desktop WSL integration and rerun `docker --version`, `docker compose version`, and `docker info`. For config failures, check unknown `APP_TEMPLATE_` keys and TOML values without exposing secrets.

## Intermittent Codex sandbox mount failure on WSL

For trace evidence, attempts, reviewed assumptions, and decisions, maintain the
[WSL sandbox incident record](WSL_SANDBOX_INCIDENT.md). Its latest observations
take precedence over historical version assumptions below. The exact rejected
socket and sole root cause remain unresolved; a topology warning is not proof
that disabling WSLg repairs the affected operation.

If a normal Codex file-edit operation fails before touching the repository with
`unsupported host mount at /mnt/wslg/distro`, first run the read-only preflight:

```bash
.venv/bin/python scripts/check_wsl_sandbox_mount.py
```

An `incompatible` result means the known nested `/mnt/wslg/distro` topology is
present below `/mnt/wslg`; it is a compatibility warning, not proof that every
sandbox operation will fail. The check reports only the mount target, never an
environment dump or credentials. Reproduce parser behavior safely with:

```bash
.venv/bin/python scripts/check_wsl_sandbox_mount.py \
  --mountinfo tests/fixtures/wsl-mountinfo-incompatible.txt
```

Use an approved terminal fallback for a narrowly scoped repository edit while
collecting the command, timestamp, and sanitized error for the Issue record.
Do not unmount `/mnt/wslg/distro`, edit `/etc/fstab`, restart WSL, or alter
global WSL, Docker, or Codex configuration from this runbook. A durable host
remedy requires an approved, vendor-supported procedure and an explicit human
approval point. If the preflight is `unknown`, retain its short error and
escalate rather than guessing the mount topology.

### Diagnosis and remediation boundary

Observed on the affected host: WSL2 owns the `/mnt/wslg` mount tree and exposes
`/mnt/wslg/distro` as a nested read-only mount. Codex CLI 0.159.3 exposes a
user-level configuration system and app-server transport options, but its
published local help does not expose a socket-directory override. Therefore the
repository cannot safely claim which Codex setting, if any, selects the rejected
sandbox socket path.

The selected repository remedy is the preflight plus a narrowly scoped terminal
fallback for an already-authorized edit. It is safe to repeat and has no WSL
rollback. A durable host remedy has two possible routes: use a vendor-documented
Codex/app-server socket-location setting, if one is confirmed; or alter the
host WSLg mount environment using a vendor-supported procedure. Both routes
require explicit human approval before any setting, WSL service, or mount is
changed. Keep the preflight evidence and normal-patch result with the approval
request so the host/tool owner can reproduce the intermittent failure.

### Human recovery during an approved WSLg experiment

An approved WSLg experiment uses `wsl --shutdown`, which deliberately ends WSL
terminal, Codex, and Dev Container processes. This is expected, not proof that
the experiment failed. Save active work first. After WSL restarts, the human
operator must open Ubuntu and run:

```bash
cd /home/chris/template
code .
```

Before shutdown, the first Codex session must record the baseline and leave the
GitHub Issue `status:blocked` with this recovery action. After restart, open
Ubuntu and run:

```bash
cd /home/chris/template
code .
```

Start a new user-directed Codex session and report that the workspace is back.
Do not edit `.wslconfig`, unmount a path, or restart WSL again. Reopening VS
Code is not proof that Codex is repaired. The new session re-reads and claims
the Issue, runs the after-state probe, and requests restoration. If it does not
return, the approved host-side timeout restores the original configuration; the
Issue remains blocked and the after-test is unobserved.
