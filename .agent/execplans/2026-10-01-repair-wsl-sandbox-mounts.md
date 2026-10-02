# Diagnose and guard WSL sandbox mount compatibility

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #29](https://github.com/successbycs/template/issues/29)

**Targeted repair task:** [GitHub Issue #35](https://github.com/successbycs/template/issues/35)

## Purpose / Big Picture

This work makes the WSL mount condition behind intermittent Codex sandbox failures visible before a developer relies on the normal patch path. Afterward, an operator can run a read-only preflight that reports whether `/mnt/wslg/distro` is a nested mount known to be incompatible with the app-server sandbox. The repository provides a precise diagnosis and recovery design; it does not change WSL mounts, restart WSL, or alter host-wide configuration without explicit approval.

## Progress

- [x] (2026-10-02) Post-installation repository verification: Ruff lint/format, 66 tests in 3.33 seconds, Markdown links and `git diff --check` passed. These support the handoff but do not prove activation.
- [x] (2026-10-02 02:36Z) Supported installer updated only `openai.chatgpt` from 26.5917.61114 to 26.928.40906. Its bundled runtime 0.159.2 passed 10 helper file cycles, 10 sandbox commands, fresh-process and isolation checks with WSLg enabled. Full generated evidence: `docs/operations/evidence/issue-35-installed-extension-comparison.json`.
- [x] (2026-10-02 02:52Z) Post-reload, user-directed Codex session completed 10 actual editor-mediated create/delete cycles in `.agent/execplans/.issue-35-aftertest-probe`; each deletion succeeded and the probe is absent. The installed extension binary reports `codex-cli 0.159.2`. Terminal inspection cannot connect to the editor IPC socket (`EPERM`), so executable attribution is supported by the requested reload plus this session's editor-path exercise, rather than a direct process fingerprint. No WSL shutdown occurred.
- [x] (2026-10-01 18:40Z) Claimed #29 and collected read-only WSL version and mount evidence.
- [x] (2026-10-01 18:41Z) Reproduced an intermittent normal patch-path failure after one successful disposable probe; removed the exact probe file using the authorized terminal fallback.
- [x] (2026-10-01 18:45Z) Added a fixture-testable mount-topology preflight and operator documentation with diagnosis, approved options, and recovery boundary.
- [x] (2026-10-01 18:45Z) Ran fixture/live preflight, focused tests, canonical verification, and real normal patch probes; host-level repair remains blocked pending explicit approval.
- [x] (2026-10-02 00:45Z) Started a detailed incident dossier and sanitized trace snapshot at the operator's request. Captured 12 matching error lines across five selected extension logs and inspected the visible app-server executable, which reports 0.155.0-alpha.16.
- [x] (2026-10-02 00:48Z) Validated the snapshot with `python3 -m json.tool`, all Markdown links with `.venv/bin/python scripts/check_markdown_links.py`, and whitespace with `git diff --check`; all passed. No runtime recovery is claimed.
- [ ] Resolve the historical 0.159.3 version discrepancy, trace the rejected socket, and reproduce with the same runtime outside Symphony before selecting a repair.
- [x] (2026-10-02 01:49Z) Executed #35 source/runtime diagnosis. Pinned installed binary SHA-256; the installed tag drops WSLg masks during proc preflight. Located existing upstream fix 1bd1bfa7ca4cd15f0dbf5efb8a28b9142c961d37 (PR #46125), present in official 0.160.0.
- [x] (2026-10-02 01:49Z) Reproduced the exact failure in an isolated filesystem helper and sandbox command without Symphony. Verified official candidate archive digest and 10 filesystem/command cycles plus a fresh-process check, preserving tested restrictions with WSLg enabled.
- [x] (2026-10-02 01:49Z) Extracted and apply-checked the upstream two-file patch against peeled base 0e2f848bf4a4e8d41a02d848a851ba126c09d185. Preserved upstream attribution/license, reproducible harness, result JSON, and upstream report draft. No local Rust build was performed; the tested artifact is the official release.
- [x] (2026-10-02) Canonical verification passed Ruff, 66 tests in 3.27 seconds, Markdown links and diff whitespace. Inspected installed extension manifest: executable override is application-scoped/development-only, so workspace-only activation is not supported by that setting.
- [x] (2026-10-02 02:52Z) Activated-session acceptance: the fresh user-directed editor session exercised 10 successful actual editor create/delete cycles. The existing installed-binary harness supplies 10 successful restricted command cycles, fresh-process, cleanup, and isolation checks. No WSL shutdown is required.
- [x] (2026-10-02 02:52Z) Durable after-test evidence updated. `tests/unit/test_codex_wslg_proof.py` passed (5); Ruff lint/format, Markdown-link validation, and `git diff --check` passed. The full suite was attempted but timed out at the pre-existing first dashboard TestClient test, so the historical 66-test result remains the last complete-suite evidence.
- [ ] (2026-10-02 02:55Z) GitHub handoff pending: `gh auth status` reports the active `successbycs` token is invalid, so Issue #35 cannot be re-read, commented on, or transitioned to `status:human-review`; no GitHub write was attempted. A human must run `gh auth refresh -h github.com` (or otherwise restore valid repository access), then re-read #35 and perform the documented review-status handoff.

## Surprises & Discoveries

- Observation: the supported extension updater installed runtime 0.159.2, not the separately tested 0.160.0. Its source tag resolves to ff6aec96948b70d94983af2641a6b67c94faeff5 and preserves full preflight options. The installed binary passed the same real-host harness. Installation did not replace the active process.
  Evidence: installer success, extension listing, process executable inspection, and `docs/operations/evidence/issue-35-installed-extension-comparison.json` captured 2026-10-02T02:35:16.867535+00:00.
- Observation: source tag 0.155.0-alpha.16 already detects the WSLg duplicate root, but `build_preflight_bwrap_argv` reconstructed options with defaults and lost the masks. Official 0.160.0 preserves the options. The matching WSLg root device/inode was confirmed on this host.
  Evidence: upstream PR #46125 and docs/operations/evidence/issue-35-repair-result.md; isolated baseline failed with the exact error and candidate passed.
- Observation: the first new harness attempt used an invalid Windows enum and an invalid CLI option combination. These results were inconclusive. Correcting the protocol produced a valid real-helper comparison.
  Evidence: incident result document records both mistakes; the stored valid report uses restricted-token and a subprocess working directory.

- Observation: the currently visible app-server executable reports 0.155.0-alpha.16, whereas this plan originally recorded 0.159.3. Public listener-path options do not establish control of the internal socket implicated by this error.
  Evidence: docs/operations/evidence/wsl-sandbox-20261002T004502Z.json and the current app-server help inspected on 2026-10-02. Historical executable attribution remains unresolved.

- Observation: The WSL host reports `/mnt/wslg` as tmpfs and `/mnt/wslg/distro` as a nested read-only ext4 mount from `/dev/sdd`.
  Evidence: `findmnt -R -o TARGET,SOURCE,FSTYPE,OPTIONS /mnt/wslg` on 2026-10-01.
- Observation: A normal app-server patch probe succeeded once, but the immediate normal patch deletion failed before file access with `unsupported host mount at /mnt/wslg/distro`.
  Evidence: `tools.apply_patch` probe and deletion attempt on 2026-10-01; terminal fallback removed only `.agent/execplans/.wsl-sandbox-probe`.
- Observation: after the successful editor after-test, a full `pytest -q` run did not produce output within 20 seconds; `pytest -vv -x` identified `tests/unit/symphony/test_dashboard.py::test_dashboard_exposes_status_and_pause_controls` as the first stalled test. The Issue #35 focused evidence tests still passed 5/5.
  Evidence: timeout-wrapped runs on 2026-10-02 02:52Z; no files in this task modify Symphony code or that test.

## Decision Log

- Decision: Update only the Codex VS Code extension through its supported extension installer, following the user's explicit apply-and-test request. Do not overwrite its bundled binary or set the development-only application-wide executable override.
  Rationale: the official release already passes isolated proof; supported packaging preserves companion executable compatibility. Baseline extension is 26.5917.61114 with runtime 0.155.0-alpha.16. If no newer package is available, report that limitation instead of silently broadening to a developer override. Before a reload, persist the result and exact recovery instructions. Rollback, if necessary, is `code --install-extension openai.chatgpt@26.5917.61114 --force` followed by a human editor reload; this is a documented recovery command, not yet a tested rollback.
  Date/Author: 2026-10-02 / Astra
- Decision: Use the already-released upstream correction as the repair candidate, keeping the extracted patch for review rather than inventing another security-sensitive change.
  Rationale: official 0.160.0 passed real-host regression/isolation checks. Rust is unavailable locally; installing a toolchain to duplicate an existing release is unnecessary for this selected route. Source tests were inspected, not claimed as locally executed.
  Date/Author: 2026-10-02 / Astra

- Decision: Begin with process/socket attribution and a sanitized incident record before any further host experiment or source patch.
  Rationale: prior disabled-state tests were unobserved; the actual rejected socket and historical executable identity remain unknown. Removing a sandbox security check is not an acceptable shortcut.
  Date/Author: 2026-10-02 / Astra

- Decision: Implement a repository-local detector and operator remediation design, not a host mount change.
  Rationale: The observed condition is host/session infrastructure; changing WSL mounts, `/etc/fstab`, or restarting WSL exceeds Issue authority.
  Date/Author: 2026-10-01 / Codex
- Decision: Treat the nested mount as a compatibility risk rather than a proven sole root cause.
  Rationale: The error names it, but intermittent reproduction means the app-server socket-selection mechanism has not been directly observed.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

Final #35 evidence, 2026-10-02: after the requested editor reload, this fresh user-directed Codex session completed ten actual editor-mediated disposable-file create/delete cycles with no residual file. The installed extension binary reported 0.159.2, and the saved evidence-report tests passed 5/5. The sandboxed terminal could not inspect the VS Code IPC socket (`EPERM`), so it cannot independently fingerprint the live extension child process; the observed editor operation after the requested reload is the real editor-boundary proof. The supported extension installation remains in place. Rollback is intentionally not executed after a successful repair because it would reintroduce the known affected version; its documented recovery procedure remains available if a future regression is observed. The unrelated full suite now stalls at the first dashboard TestClient test, so it is honestly recorded as unobserved for this after-test; focused evidence, Ruff, Markdown links, and diff whitespace pass. Issue #35 is ready for human review once GitHub is reachable; Issue #29's separate host-remediation boundary remains blocked.

GitHub handoff update, 2026-10-02 02:55Z: target and remote both remain `successbycs/template`, but `gh auth status` reports that the active `successbycs` credential is invalid. Per the Issue workflow, no read-dependent Issue selection, status mutation, or comment was attempted. Restore authentication and re-read #35 before transitioning it to `status:human-review`; only then may the live `status:ready` queue be inspected to select one subsequent Issue.

Activation milestone, 2026-10-02: supported extension update installed and its actual bundled binary tested successfully. Only active-editor reload/after-test and actual activation rollback verification remain unobserved. The operator owns any reload and rollback; retain the original extension package until acceptance. #29 follows #35 integration proof; #32/#33 are optional historical workaround work, and #34 is an optional platform assessment, not a repair prerequisite. See the result document for exact recovery and after-test instructions.

Repair milestone, 2026-10-02: the isolated runtime repair is verified with WSLg enabled. See [the result and activation handoff](../../docs/operations/evidence/issue-35-repair-result.md). The current editor was not replaced or reloaded, so #35 cannot yet be marked complete. The historical 0.159.3 attribution remains unknown, but the current affected binary is fingerprinted and reproduced. The generic sole-root-cause uncertainty recorded below is now narrowed to a specific source defect supported by matched failure and release recovery; active IDE integration and live dispatch remain unobserved.

Update, 2026-10-02: [the detailed incident record](../../docs/operations/WSL_SANDBOX_INCIDENT.md) now separates actual traces, historical reports, failed attempts, assumptions, decisions, and missing proof. It supersedes any categorical diagnosis or assertion below that a socket override has been ruled out. This capture adds evidence, not a demonstrated repair. No new restart occurred. The original outcome below is historical.

The repository now detects the known topology before a developer relies on normal app-server editing, documents a safe narrow fallback, and preserves the approval boundary. Fixture tests, the live preflight, and the full verifier passed. The actual normal patch path remained intermittent: creation of a disposable probe succeeded twice, but immediate normal deletion failed twice with the named mount error. The required durable host repair cannot be completed under current authority because the published Codex app-server help does not identify a socket-directory override and host WSL changes are explicitly out of scope. Issue #29 must remain blocked until an operator approves a vendor-supported Codex/app-server or WSL remedy.

## Context and Orientation

The normal app-server sandbox mechanism sometimes fails before it can edit a repository file with: `error building bubblewrap command: app-server socket directory has an unsupported host mount at /mnt/wslg/distro`. The current host is WSL2 kernel `6.6.87.2-microsoft-standard-WSL2`. Its mount topology has `/mnt/wslg` tmpfs with `/mnt/wslg/distro` as a nested read-only ext4 mount. This is outside the repository checkout.

`scripts/` contains local verification utilities, `tests/` contains their tests, and `docs/operations/` contains operator procedures. The preflight must parse supplied mountinfo text as well as the live `/proc/self/mountinfo`, so fixture tests do not mutate real mounts. A warning does not itself prove a sandbox failure; it tells an operator the known risk exists and what evidence to collect.

## Plan of Work

### Targeted repair execution (#35)

Use the isolated checkout `/tmp/codex-mount-patch.Nxw50i/upstream` for source investigation. Pin the baseline to public tag `rust-v0.155.0-alpha.16` (c36696937921f6f2d364ebeefcb66bc5cfa638e8) and compare upstream cb6da58876afed3ede0ab11084f67dd5394ecb48. The visible extension process executable has SHA-256 b385b08da83c598f0e6db7eea545093aeea9f2569c7994165a67c2d62cc230b4 and reports 0.155.0-alpha.16; a matching version string does not prove byte-for-byte source correspondence.

First inspect `codex-rs/linux-sandbox/src/daemon_mounts.rs`, `wslg.rs`, `bwrap.rs`, and their call sites. Observe actual mount identities and socket selection without dumping credentials. Both the installed-version tag and current upstream already contain WSLg duplicate-root masking, so simply adding WSLg support is not a justified patch. Establish which failing call path omits or cannot use that mask.

Before editing upstream code, identify the precise function and security invariant in this plan. Preserve reject-on-unsafe-alias behavior and test mask application order. Build only in the isolated checkout or a bounded build container; Rust is not currently on PATH. Select focused Cargo tests only after the changed crate is known and record the exact toolchain/dependency requirement. Export the final source diff and pinned base to the repository incident artifacts; do not install it over the active extension.

Acceptance for #35 requires a matching before-failure, regression tests, at least ten repeated normal command/editor create-delete cycles on this host with WSLg enabled, a fresh-session check, isolation checks, and rollback. An isolated probe that does not reach the editor helper path is supporting evidence only. If active-editor integration requires restart or binary replacement, prepare the exact artifact and recovery instructions before the human handoff. Preserve all unsuccessful trials in the incident dossier. No host mount, GUI setting, or sandbox policy is changed by source inspection.

First add a small standard-library script that parses Linux mountinfo records and returns a sanitized status: compatible when the target is absent or not a nested mount; incompatible when `/mnt/wslg/distro` is mounted beneath `/mnt/wslg`; unknown when mountinfo cannot be read or parsed. Make command output and exit status explicit and avoid printing environment values or device paths beyond the tested mount target.

Second add focused fixture tests for compatible, incompatible, and malformed/absent mountinfo. Add an operations runbook section defining the observed facts, assumptions, the preflight command, temporary terminal fallback, and host-level remediation options. The options must identify human approval requirements: update the Codex/app-server environment or socket-location configuration if officially supported; otherwise collect diagnostics and escalate to the host/tool owner. Do not prescribe unmounting or editing WSL configuration without an approved vendor-supported procedure.

Third run the fixture tests and canonical verifier. Run the live preflight and a harmless normal patch probe. Result: compatible fixture returned 0; incompatible fixture and live host returned 2; focused tests passed 4; canonical verifier passed 59 tests. The normal probe created its disposable file twice but immediate normal deletion failed twice before file access with the named mount error. Each exact disposable file was removed through the approved terminal fallback.

## Concrete Steps

For #35 the valid real-host run used `.venv/bin/python scripts/prove_codex_wslg_repair.py --baseline /home/chris/.vscode-server/extensions/openai.chatgpt-26.5917.61114-linux-x64/bin/linux-x86_64/codex --candidate /tmp/codex-mount-patch.Nxw50i/codex-x86_64-unknown-linux-musl`. The result is preserved in `docs/operations/evidence/issue-35-runtime-comparison.json`. Five focused evidence-acceptance tests passed in 0.01 seconds. The later harness adds an explicit success exit predicate; it validates this saved report, not an invented result. `git apply --check`, isolated patch application, and isolated `git diff --check` passed against the baseline checkout. See the result document for artifact hashes, release source revision and replay instructions.

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

Current diagnostic artifacts: `docs/operations/WSL_SANDBOX_INCIDENT.md` and `docs/operations/evidence/wsl-sandbox-20261002T004502Z.json`. The snapshot records capture time, process metadata, selected mount fields, source-relative log paths, match counts, and sanitized timestamped error excerpts. Raw logs and authentication data are excluded. Normal command execution also shows the mount failure; the incident is not limited to deletion.

Evidence: WSL2 kernel `6.6.87.2-microsoft-standard-WSL2`; live preflight returned 2 for the nested target; fixture tests `4 passed`; canonical verifier reported `59 passed in 3.34s`, Ruff lint/format and Markdown links passing. Codex CLI 0.159.3 app-server help shows user config and transport options but no documented socket-directory override. The normal probe outcome was intermittent creation success followed by deletion failure. No credentials, environment dumps, full mount tables, or host configuration writes were retained.

## Interfaces and Dependencies

`scripts/check_wsl_sandbox_mount.py` will expose a CLI accepting optional `--mountinfo PATH` and return 0 for compatible, 2 for incompatible, and 3 for unreadable/malformed evidence. `tests/` will add text fixtures and focused tests. `docs/operations/TROUBLESHOOTING.md` or `LOCAL_RUNBOOK.md` will document the command and approved recovery boundary. The implementation uses only the Python standard library and has no network, credential, WSL configuration, or application-runtime dependency.
