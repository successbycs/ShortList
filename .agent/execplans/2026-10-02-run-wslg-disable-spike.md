# Run the approved WSLg-disable compatibility spike

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #32](https://github.com/successbycs/template/issues/32)  
**Approved design:** [GitHub Issue #33](https://github.com/successbycs/template/issues/33)

## Purpose / Big Picture

Run one controlled, temporary host experiment: disable WSLg through the documented Windows-user setting, restart WSL, compare the Codex app-server sandbox before and after, then restore the original setting. This establishes whether WSLg removal resolves the known mount condition. It does not enable or prove live dispatch.

## Progress

- [x] (2026-10-01 21:40Z) Human explicitly approved the temporary WSLg disable, WSL restarts, probes, and default restoration.
- [x] (2026-10-01 21:41Z) Claimed #32 for Terra implementation.
- [x] (2026-10-01 21:39Z) Captured baseline: preflight exit 2; persistent app-server probe exit 0; a normal-editor probe creation succeeded but its immediate normal deletion failed before file access with the named mount error.
- [x] (2026-10-01 21:45Z) Ran a safe host helper that created the temporary setting, restarted WSL, and restored the previously absent configuration. The agent session was terminated before the after-test; this result is unobserved.
- [x] (2026-10-01 22:05Z) Rebuilt the procedure as a two-session workflow and added the operator/compliance rules.
- [x] (2026-10-01 22:08Z) Ran diff, Markdown-link, and canonical verification after the documentation update; 59 tests passed in 3.31 seconds.
- [x] (2026-10-01 22:20Z) Session A fresh baseline: live preflight returned 2; normal editor probe creation succeeded and immediate normal deletion failed with the named mount error; exact disposable file was removed through the approved fallback.
- [ ] Session A: create bounded restoration helper and transition #32 to blocked before shutdown.
- [ ] Human recovery: reopen Ubuntu and start a new Codex session.
- [ ] Session B: re-read and claim #32, run the normal-editor after-test, signal restoration, and verify restored state.
- [ ] Record result, verify repository, commit, and hand off for review.

## Surprises & Discoveries

- Observation: The first temporary WSLg run restored the original state, but it could not collect after-state evidence because the approved shutdown terminated the active agent.
  Evidence: the host helper log recorded creation, restart, removal, and final restart; no disabled-state normal-editor probe was captured.

- Observation: The direct app-server command probe passed while the nested mount remained, whereas the normal editor deletion failed.
  Evidence: before-state commands on 2026-10-01. The app-server command probe is supporting evidence only; the normal editor path remains the relevant boundary.

- Observation: Fresh normal-editor reproduction again failed only on deletion after a successful creation.
  Evidence: normal patch deletion reported the unsupported host mount error on 2026-10-01.

## Decision Log

- Decision: Restore the original Windows configuration by default.
  Rationale: The experiment is diagnostic; disabling WSLg has host-wide GUI impact.
  Date/Author: 2026-10-01 / Terra

- Decision: Treat a persistent app-server command request as the decisive probe, not the CLI sandbox command.
  Rationale: The CLI sandbox previously passed while the nested mount remained.
  Date/Author: 2026-10-01 / Astra design adopted by Terra

## Outcomes & Retrospective

The first host trial restored the original configuration but did not capture the after-test because its required restart terminated Session A. The compliance model and this plan now require a two-session handoff. The actual WSLg result remains unobserved pending the separately recorded Session A and Session B sequence.

## Context and Orientation

The repository preflight `scripts/check_wsl_sandbox_mount.py` currently reports the nested `/mnt/wslg/distro` mount. The WSLg control is the global Windows-user file `%UserProfile%\.wslconfig`, under `[wsl2]` as `guiApplications=false`. Applying it requires `wsl --shutdown`, which stops all WSL distributions including Docker Desktop's backend.

The temporary probe must send `initialize`, `initialized`, and `command/exec` to `codex app-server`, keeping stdin open until it receives the response. It runs only `/bin/true` with `workspaceWrite` and network disabled. It creates no model turn, source change, GitHub request, or live dispatch.

## Plan of Work

Session A creates a disposable app-server JSON-RPC client in `/tmp`, runs it with the repository preflight and normal-editor probe, and records only sanitized evidence. It then inspects the Windows user configuration, records existence/hash, makes a timestamped backup, and displays the diff that changes only `guiApplications`. Before `wsl --shutdown`, Session A changes #32 from `status:in-progress` to `status:blocked` and posts the exact human recovery action.

The host-side helper applies the approved temporary configuration, restarts WSL, and waits only as a restoration safety net. The human reopens Ubuntu and starts a new user-directed Codex session. Session B re-reads and claims #32, verifies that the temporary state is still present, runs the normal-editor after-test, and signals restoration. The helper restores only after comparing the configuration to its expected temporary hash. Session B confirms restored state, classifies the result, and verifies the repository.

## Concrete Steps

Before-state from the repository root:

```bash
.venv/bin/python scripts/check_wsl_sandbox_mount.py
python3 /tmp/codex_appserver_probe.py
```

Windows-state action from PowerShell, after backup and diff review:

```powershell
wsl --shutdown
```

After-state and restored-state use the same preflight and persistent app-server probe. Exact commands and results are appended below during execution.


### Human operator recovery after the test restart

The approved `wsl --shutdown` ends this Codex session. The host-side helper
must leave the temporary state active only for the approved bounded window. The
human operator then opens Ubuntu, runs `cd /home/chris/template` and `code .`,
and tells the new Codex session that the workspace is back. The new session,
not the terminated one, runs the normal-editor after-test and signals
restoration. Reopening VS Code is not acceptance evidence. If the handoff does
not happen before the timeout, the helper restores the original state and the
test is unobserved.

## Validation and Acceptance

A real result is accepted only when it includes:

| Boundary | Required evidence |
| --- | --- |
| Mount topology | Live preflight before, after WSLg-disable, and after restoration. |
| Codex app-server | Persistent `command/exec` response before and after; no CLI-sandbox substitute. |
| Host recovery | Hash/backup evidence and restored configuration state. |
| Repository | Canonical verifier after host recovery. |
| Live dispatch | Not exercised; remains unobserved. |

Supported means mount absent and app-server probe returns 0. Disproved means mount absent but the same error remains. Any unavailable comparison is inconclusive.

## Idempotence and Recovery

Do not run a second host change until the original file has been restored. Back up before editing. Preserve unrelated configuration. If the temporary file differs unexpectedly before restoration, stop rather than overwrite it. If the test causes an unexpected WSL problem, restore the backup from Windows PowerShell, run `wsl --shutdown`, and reopen WSL. Do not delete the host backup automatically.

## Artifacts and Notes

The disposable probe stays in `/tmp` and is not committed. Host configuration contents and backup contents are not committed or posted to GitHub. This plan stores only sanitized evidence. The supporting design is `.agent/execplans/2026-10-02-design-wslg-disable-experiment.md`.

## Interfaces and Dependencies

This task changes no application interface. It depends on WSL2, Windows PowerShell, the installed Codex app-server, and the explicit human approval recorded above. The affected external interface is the user-owned `.wslconfig`, not a repository configuration.
