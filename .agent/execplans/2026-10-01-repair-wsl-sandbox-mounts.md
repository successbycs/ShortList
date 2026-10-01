# Diagnose and guard WSL sandbox mount compatibility

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #29](https://github.com/successbycs/template/issues/29)

## Purpose / Big Picture

This work makes the WSL mount condition behind intermittent Codex sandbox failures visible before a developer relies on the normal patch path. Afterward, an operator can run a read-only preflight that reports whether `/mnt/wslg/distro` is a nested mount known to be incompatible with the app-server sandbox. The repository provides a precise diagnosis and recovery design; it does not change WSL mounts, restart WSL, or alter host-wide configuration without explicit approval.

## Progress

- [x] (2026-10-01 18:40Z) Claimed #29 and collected read-only WSL version and mount evidence.
- [x] (2026-10-01 18:41Z) Reproduced an intermittent normal patch-path failure after one successful disposable probe; removed the exact probe file using the authorized terminal fallback.
- [x] (2026-10-01 18:45Z) Added a fixture-testable mount-topology preflight and operator documentation with diagnosis, approved options, and recovery boundary.
- [x] (2026-10-01 18:45Z) Ran fixture/live preflight, focused tests, canonical verification, and real normal patch probes; host-level repair remains blocked pending explicit approval.

## Surprises & Discoveries

- Observation: The WSL host reports `/mnt/wslg` as tmpfs and `/mnt/wslg/distro` as a nested read-only ext4 mount from `/dev/sdd`.
  Evidence: `findmnt -R -o TARGET,SOURCE,FSTYPE,OPTIONS /mnt/wslg` on 2026-10-01.
- Observation: A normal app-server patch probe succeeded once, but the immediate normal patch deletion failed before file access with `unsupported host mount at /mnt/wslg/distro`.
  Evidence: `tools.apply_patch` probe and deletion attempt on 2026-10-01; terminal fallback removed only `.agent/execplans/.wsl-sandbox-probe`.

## Decision Log

- Decision: Implement a repository-local detector and operator remediation design, not a host mount change.
  Rationale: The observed condition is host/session infrastructure; changing WSL mounts, `/etc/fstab`, or restarting WSL exceeds Issue authority.
  Date/Author: 2026-10-01 / Codex
- Decision: Treat the nested mount as a compatibility risk rather than a proven sole root cause.
  Rationale: The error names it, but intermittent reproduction means the app-server socket-selection mechanism has not been directly observed.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

The repository now detects the known topology before a developer relies on normal app-server editing, documents a safe narrow fallback, and preserves the approval boundary. Fixture tests, the live preflight, and the full verifier passed. The actual normal patch path remained intermittent: creation of a disposable probe succeeded twice, but immediate normal deletion failed twice with the named mount error. The required durable host repair cannot be completed under current authority because the published Codex app-server help does not identify a socket-directory override and host WSL changes are explicitly out of scope. Issue #29 must remain blocked until an operator approves a vendor-supported Codex/app-server or WSL remedy.

## Context and Orientation

The normal app-server sandbox mechanism sometimes fails before it can edit a repository file with: `error building bubblewrap command: app-server socket directory has an unsupported host mount at /mnt/wslg/distro`. The current host is WSL2 kernel `6.6.87.2-microsoft-standard-WSL2`. Its mount topology has `/mnt/wslg` tmpfs with `/mnt/wslg/distro` as a nested read-only ext4 mount. This is outside the repository checkout.

`scripts/` contains local verification utilities, `tests/` contains their tests, and `docs/operations/` contains operator procedures. The preflight must parse supplied mountinfo text as well as the live `/proc/self/mountinfo`, so fixture tests do not mutate real mounts. A warning does not itself prove a sandbox failure; it tells an operator the known risk exists and what evidence to collect.

## Plan of Work

First add a small standard-library script that parses Linux mountinfo records and returns a sanitized status: compatible when the target is absent or not a nested mount; incompatible when `/mnt/wslg/distro` is mounted beneath `/mnt/wslg`; unknown when mountinfo cannot be read or parsed. Make command output and exit status explicit and avoid printing environment values or device paths beyond the tested mount target.

Second add focused fixture tests for compatible, incompatible, and malformed/absent mountinfo. Add an operations runbook section defining the observed facts, assumptions, the preflight command, temporary terminal fallback, and host-level remediation options. The options must identify human approval requirements: update the Codex/app-server environment or socket-location configuration if officially supported; otherwise collect diagnostics and escalate to the host/tool owner. Do not prescribe unmounting or editing WSL configuration without an approved vendor-supported procedure.

Third run the fixture tests and canonical verifier. Run the live preflight and a harmless normal patch probe. Result: compatible fixture returned 0; incompatible fixture and live host returned 2; focused tests passed 4; canonical verifier passed 59 tests. The normal probe created its disposable file twice but immediate normal deletion failed twice before file access with the named mount error. Each exact disposable file was removed through the approved terminal fallback.

## Concrete Steps

From `/home/chris/template`:

1. Run `.venv/bin/python scripts/check_wsl_sandbox_mount.py --mountinfo tests/fixtures/wsl-mountinfo-compatible.txt` and the incompatible fixture. Expected: compatible exit 0; incompatible exit 2 with a short warning.
2. Run focused preflight tests and `.venv/bin/python scripts/verify.py`. Expected: all pass.
3. Run `.venv/bin/python scripts/check_wsl_sandbox_mount.py` against live mountinfo. Expected on this host: incompatible warning for `/mnt/wslg/distro` and exit 2.
4. Run a normal disposable app-server patch probe, then delete that exact probe. Expected: either both operations pass or an intermittent sandbox error is recorded without changing host mounts.

## Validation and Acceptance

Acceptance requires a fixture-tested preflight whose incompatible result names the nested target but not sensitive environment data; documentation that separates observed topology from inferred root cause; a formatted remediation design with options, prerequisites, rollback, and approval boundary; a real live preflight result; and a real normal patch-path probe. The canonical verifier and Markdown links must pass. A host-wide fix is not accepted or attempted without explicit approval.

## Idempotence and Recovery

The preflight only reads mountinfo and is safe to repeat. Fixture inputs are disposable. The normal patch probe uses one exact temporary file under `.agent/execplans/`, which is removed immediately after the probe; if normal deletion fails, an authorized terminal command removes only that exact named file. The repository fallback does not alter mounts. Rollback consists of removing the added preflight, tests, and documentation; any host-level proposal must have its own approved rollback procedure.

## Artifacts and Notes

Evidence: WSL2 kernel `6.6.87.2-microsoft-standard-WSL2`; live preflight returned 2 for the nested target; fixture tests `4 passed`; canonical verifier reported `59 passed in 3.34s`, Ruff lint/format and Markdown links passing. Codex CLI 0.159.3 app-server help shows user config and transport options but no documented socket-directory override. The normal probe outcome was intermittent creation success followed by deletion failure. No credentials, environment dumps, full mount tables, or host configuration writes were retained.

## Interfaces and Dependencies

`scripts/check_wsl_sandbox_mount.py` will expose a CLI accepting optional `--mountinfo PATH` and return 0 for compatible, 2 for incompatible, and 3 for unreadable/malformed evidence. `tests/` will add text fixtures and focused tests. `docs/operations/TROUBLESHOOTING.md` or `LOCAL_RUNBOOK.md` will document the command and approved recovery boundary. The implementation uses only the Python standard library and has no network, credential, WSL configuration, or application-runtime dependency.
