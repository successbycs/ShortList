# Design controlled WSLg-disable experiment

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Design task:** [GitHub Issue #33](https://github.com/successbycs/template/issues/33)  
**Implementation handoff:** [GitHub Issue #32](https://github.com/successbycs/template/issues/32)  
**Related incident:** [GitHub Issue #29](https://github.com/successbycs/template/issues/29)

## Purpose / Big Picture

Determine, with a reversible real-world test, whether temporarily disabling WSLg removes `/mnt/wslg/distro` and lets the affected Codex app-server sandbox start. The result can support, disprove, or leave the hypothesis inconclusive. It is not a repair or proof that live dispatch works.

## Progress

- [x] (2026-10-01 21:20Z) Claimed #33 for Astra design; made no Windows, WSL, mount, Docker, Codex configuration, or live-dispatch change.
- [x] (2026-10-01 21:25Z) Captured sanitized live baseline: WSL2 active, nested mount present, preflight returned `incompatible`.
- [x] (2026-10-01 21:26Z) Verified the vendor-documented global WSLg setting and designed backup/restart/restore steps.
- [x] (2026-10-01 21:28Z) Defined the relevant app-server boundary probe and recorded that a one-shot JSON-RPC pipe is inconclusive.
- [x] (2026-10-01 21:30Z) Validated the completed plan: Markdown links passed and the canonical verifier passed 59 tests in 3.29 seconds.
- [ ] (requires explicit human approval) Terra backs up the Windows WSL configuration, disables WSLg temporarily, restarts WSL, and records the after-state.
- [ ] (requires explicit human approval) Terra restores the exact configuration and restarts WSL unless the human explicitly approves retention.
- [ ] (after Terra evidence) Human review classifies the workaround.

## Surprises & Discoveries

- Observation: `/mnt/wslg` is tmpfs and `/mnt/wslg/distro` is a nested read-only ext4 mount.
  Evidence: `findmnt -R -o TARGET,SOURCE,FSTYPE,OPTIONS /mnt/wslg` on 2026-10-01.

- Observation: the repository preflight returned exit 2 with the incompatible warning.
  Evidence: `.venv/bin/python scripts/check_wsl_sandbox_mount.py`.

- Observation: `codex sandbox -- /bin/true` returned 0 while the nested mount remained present.
  Evidence: baseline run on 2026-10-01. It is not the affected app-server socket path and cannot answer the hypothesis.

- Observation: one-shot stdin to `codex app-server` completed initialization but returned no `command/exec` response before stdin closed.
  Evidence: protocol attempt on 2026-10-01. It is inconclusive, not a passed probe.

- Observation: Microsoft documents `.wslconfig` as global to WSL2; `[wsl2] guiApplications=false` switches WSLg off after WSL stops and restarts.
  Evidence: [Microsoft WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config), accessed 2026-10-01.

## Decision Log

- Decision: Test the documented Windows-user `.wslconfig` control, never a manual unmount or `/etc/fstab` edit.
  Rationale: WSL owns the mount tree; the documented control is reversible whereas mount manipulation is unsupported.
  Date/Author: 2026-10-01 / Astra

- Decision: Require both the mount preflight and a persistent app-server `command/exec` of `/bin/true` with `workspaceWrite` and network disabled.
  Rationale: CLI sandbox success was a false-positive risk; the app-server request reaches the claimed boundary without a model turn or file write.
  Date/Author: 2026-10-01 / Astra

- Decision: Restore WSLg by default.
  Rationale: Disabling it applies to all WSL2 distributions and removes Linux GUI support; retention requires a separate human decision.
  Date/Author: 2026-10-01 / Astra

## Outcomes & Retrospective

The design is complete. No host state changed. #32 remains blocked until a human approves a temporary global setting change and WSL restart. A successful mount/sandbox experiment still leaves live Symphony dispatch unobserved.

## Context and Orientation

The affected host runs Ubuntu in WSL2. Codex uses its Linux Bubblewrap sandbox in WSL2. The earlier incident recorded intermittent normal app-server failure before repository access: `error building bubblewrap command: app-server socket directory has an unsupported host mount at /mnt/wslg/distro`.

The repository-owned preflight is `scripts/check_wsl_sandbox_mount.py`; it reads mountinfo and reports a risk, not universal failure. The current fallback is in `docs/operations/TROUBLESHOOTING.md`.

The test changes a host file outside the repository: `%UserProfile%\.wslconfig`. It is global to every WSL2 distribution. Setting `[wsl2] guiApplications=false` disables WSLg: Linux GUI windows, GUI browser launches, display/audio/clipboard integration, and Linux GPU GUI use are unavailable. `wsl --shutdown` stops every running WSL distribution, including the observed Ubuntu and docker-desktop instances. Save active work first; services may need to reconnect.

## Plan of Work

### Milestone 1: valid before-state

From `/home/chris/template`, run:

```bash
.venv/bin/python scripts/check_wsl_sandbox_mount.py
```

Then use a disposable persistent JSON-RPC client against `codex app-server`. It sends `initialize`, `initialized`, then:

```json
{"method":"command/exec","id":1,"params":{"command":["/bin/true"],"cwd":"/home/chris/template","sandboxPolicy":{"type":"workspaceWrite","networkAccess":false},"timeoutMs":10000}}
```

Keep stdin open until response id 1 or a bounded timeout. This must not create a thread, invoke a model, edit a file, use network, contact GitHub, or enable dispatch. Exit code 0 is passed; the exact mount error is failed; missing response/protocol error is inconclusive and must be fixed before changing WSLg.

### Milestone 2: human approval

Terra presents baseline, disruption, exact file diff, and asks:

> Approve a temporary host-wide WSL2 change that disables Linux GUI applications, stops all WSL distributions with `wsl --shutdown`, runs after-state probes, and restores the original `.wslconfig` afterward?

Only an explicit yes permits the next milestone. It does not permit live dispatch, mount changes, `/etc/fstab`, credential work, system-wide Codex changes, or retention of the changed setting.

### Milestone 3: reversible test

In Windows PowerShell, record whether `$env:USERPROFILE\.wslconfig` exists, its SHA-256 hash and timestamp, and a timestamped backup alongside it. Keep the backup on the host; never commit it.

Preserve unrelated configuration. Change only the effective `[wsl2]` `guiApplications` value to `false`. If no file exists, create only:

```toml
[wsl2]
guiApplications=false
```

Display the diff, then run `wsl --shutdown` from Windows PowerShell. Start a new WSL terminal, rerun the preflight and identical persistent app-server probe, then run the canonical verifier only when services are stable.

### Milestone 4: classify and restore

- **Supported:** preflight is compatible and persistent app-server probe exits 0.
- **Disproved:** WSLg is disabled and nested mount absent, but same mount error remains.
- **Inconclusive:** setting did not apply, mount state is unreadable, the probe is incomplete, or another environment error prevents comparison.

Restore by default. Compare the current file with the expected spike version before writing. If it differs unexpectedly, stop for human direction. Restore the exact backup; if no original file existed, remove only the spike-created file. Run `wsl --shutdown`, restart WSL, rerun the preflight, and record restoration. Do not auto-delete the host backup.

## Concrete Steps

Completed read-only baseline:

```bash
.venv/bin/python scripts/check_wsl_sandbox_mount.py
codex sandbox -- /bin/true
findmnt -R -o TARGET,SOURCE,FSTYPE,OPTIONS /mnt/wslg
```

Observed: incompatible preflight, successful non-decisive CLI sandbox, nested mount present. Official app-server handshake and `command/exec` are documented at [OpenAI Codex App Server](https://learn.chatgpt.com/docs/app-server). Terra adds exact persistent-client and Windows commands to #32 after approval.

## Validation and Acceptance

The plan is accepted if a novice can identify the exact host change, temporary impact, real boundary, success/failure/inconclusive outcomes, backup/restore process, and one approval point. On 2026-10-01, git diff check, Markdown links, and the canonical verifier passed; the verifier reported 59 tests passed in 3.29 seconds.

| Boundary | Status | Evidence |
| --- | --- | --- |
| Repository mount preflight | passed | Live exit 2 observed. |
| CLI sandbox | passed but non-decisive | `codex sandbox -- /bin/true` passed with mount present. |
| Affected app-server sandbox | unobserved | Normal errors were intermittent; one-shot protocol probe incomplete. |
| WSLg-disable effect | blocked | Requires host-wide approval and restart. |
| Live Symphony dispatch | unobserved | Separate end-to-end proof required. |

## Idempotence and Recovery

Read-only probes are repeatable. Back up before every host edit and preserve unrelated values. If the persistent probe is incomplete, do not change WSLg. `wsl --shutdown` is disruptive but does not delete distributions. Default rollback is exact config restoration followed by another shutdown/restart.

## Artifacts and Notes

- Existing detector/runbook: `scripts/check_wsl_sandbox_mount.py`, `docs/operations/TROUBLESHOOTING.md`.
- Existing incident plan: `.agent/execplans/2026-10-01-repair-wsl-sandbox-mounts.md`.
- Baseline: 2026-10-01 UTC; local app-server user agent reported Codex 0.159.3.
- Sources: [OpenAI WSL guide](https://learn.chatgpt.com/docs/windows/wsl), [OpenAI App Server](https://learn.chatgpt.com/docs/app-server), [Microsoft WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config).
- Never store host config content, backups, credentials, or full mount tables in Git.

## Interfaces and Dependencies

#33 changes no product interface. #32 will use a disposable stdio JSON-RPC app-server client and the repository preflight. It depends on installed Codex, WSL2, and explicit human approval. The host interface is `%UserProfile%\.wslconfig`; `[wsl2] guiApplications` is global to WSL2 and is not owned by this repository.
