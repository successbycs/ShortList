# Issue 35: verified runtime repair and editor after-test

## Finding

The installed extension runtime, Codex 0.155.0-alpha.16, loses WSLg/interop
masking options when building the restricted /proc preflight. The preflight then
rejects the duplicate WSLg root before the requested command or filesystem
helper runs. Both tagged source inspection and real-host reproduction support
this diagnosis. No Symphony process or application was required for the
reproduction: it ran in a new disposable directory.

OpenAI already fixed this in [PR #46125](https://github.com/openai/codex/pull/46125),
commit 1bd1bfa7ca4cd15f0dbf5efb8a28b9142c961d37. The important change passes the
complete BwrapOptions into preflight instead of retaining only network_mode.
The WSLg duplicate view remains masked; isolation checks are preserved.
The reserved privileged socket directory is /tmp/codex-daemon-<uid>, per
codex-rs/uds/src/daemon_directory.rs. This is not a freely configurable listener
path. No relocation or host unmount is needed for the isolated verified repair.

The previous exact process-to-socket tracing gap is narrowed by source and
reproduction, not by a newly captured syscall trace. No syscall trace was taken.
The historical 0.159.3 observation remains unattributed.

## Source and binary provenance

| Artifact | Identity |
| --- | --- |
| Baseline source tag | rust-v0.155.0-alpha.16 |
| Baseline peeled source commit | 0e2f848bf4a4e8d41a02d848a851ba126c09d185 |
| Installed baseline binary SHA-256 | b385b08da83c598f0e6db7eea545093aeea9f2569c7994165a67c2d62cc230b4 |
| Tested official release | rust-v0.160.0 |
| Release source commit | a956835d020762cb2b570053af06f643a11c0ecc |
| Official Linux musl archive SHA-256 | 306865417d4ee7a927785852910a527f41e1e159add390ac5ae3accb67d44a13 |
| Candidate executable SHA-256 | 12eb3e81114588aca3b7998f4f19e8997b056aca08e57a7ca7c8a3ec8c652aad |

The archive hash matched GitHub's release asset digest before extraction.
Download the official codex-x86_64-unknown-linux-musl.tar.gz asset from
[release 0.160.0](https://github.com/openai/codex/releases/tag/rust-v0.160.0).
The locally tested executable is
/tmp/codex-mount-patch.Nxw50i/codex-x86_64-unknown-linux-musl.
This temporary path is not a persistent installation.

## Patch artifact and ownership

[issue-35-upstream-preflight.patch](issue-35-upstream-preflight.patch) is an
extracted two-file subset of OpenAI's existing correction, not newly authored
upstream code. Base: 0e2f848bf4a4e8d41a02d848a851ba126c09d185.
It changes linux_run_main.rs and linux_run_main_tests.rs only (41 additions,
12 deletions). OpenAI Codex, Copyright 2025 OpenAI. See the accompanying
[Apache 2.0 license](CODEX-UPSTREAM-LICENSE.txt).

The extracted files do not include Ratatui code. The original repository's
NOTICE also credits Ratatui and its MIT-licensed contributors; this subset
contains only Linux sandbox preflight code.

In an isolated checkout at the base revision, these commands succeeded:

~~~bash
git apply --check /home/chris/template/docs/operations/evidence/issue-35-upstream-preflight.patch
git apply /home/chris/template/docs/operations/evidence/issue-35-upstream-preflight.patch
git diff --check
~~~

The subset was not locally compiled: Rust is not installed on this host, and
we selected the available official release containing the correction.
Consequently, the official release is the tested repair candidate; do not call
the extracted standalone backport a locally built or verified binary.

Upstream includes proc_mount_preflight_preserves_wsl_masks plus existing
network-isolation and minimal-filesystem preflight tests. These were inspected,
not executed locally. The release contains other changes too; this was a
release-to-release regression test, not a controlled single-commit build.

## Real-host proof

The machine-readable [runtime comparison](issue-35-runtime-comparison.json)
was captured at its embedded UTC timestamp. WSLg remained enabled throughout.
The outer harness used approved terminal execution, but the tested child
operations explicitly used managed filesystem and network restrictions.
The result is not an escalated child-operation success.

| Boundary | Baseline 0.155.0-alpha.16 | Official candidate 0.160.0 |
| --- | --- | --- |
| Filesystem-helper write | Exact mount error | 10/10 passed |
| Filesystem-helper read and delete | Unreached after failed write | 10/10 each passed |
| Normal CLI sandbox command with file round trip | Exact mount error | 10/10 passed |
| Explicit denied read/write fixtures | Sandbox could not start; no denial proof | Both permission-denied as expected |
| Read through WSLg alias to denied fixture | Sandbox could not start | Permission-denied |
| Outside-workspace command write | Sandbox could not start | Blocked in all 10 command trials |
| Connection to a live host loopback listener | Sandbox could not start | Blocked in all 10 command trials |
| Listing privileged daemon socket directory | Sandbox could not start | Blocked in all 10 command trials |
| Fresh executor process | Not a recovery test | Additional filesystem cycle, command cycle and denial checks passed |
| Disposable files and canary | Clean; canary unchanged | Clean; canary unchanged |
| Active VS Code editor session | Still uses original executable | Not activated; unobserved |
| Live Symphony dispatch | Not exercised | Not exercised |

The loopback listener was actually bound and listening outside the child
sandbox. This establishes the tested network denial; it does not establish
every possible network restriction. Denial checks use disposable fixtures,
not user data. Cleanup removed only the harness-owned temporary directories.

Initial harness errors (invalid windowsSandboxLevel=unelevated and a CLI
-C option requiring a permission profile) were corrected before this valid
capture. They were protocol mistakes, not repair evidence. The final harness
rejects unrelated baseline errors, missing trials, failed denial checks and
failed cleanup. Its regression tests validate evidence acceptance, not Rust
implementation behavior.

## Reproduction

From the template repository root, run the checked-in harness with explicit
executable paths after verifying candidate provenance:

~~~bash
.venv/bin/python scripts/prove_codex_wslg_repair.py --baseline /absolute/path/to/affected/codex --candidate /absolute/path/to/official-0.160.0/codex
~~~

It emits a JSON report to stdout and exits zero only for the expected baseline
failure plus complete isolated candidate success. Keep the report in the
incident evidence record after reviewing it. The baseline and candidate test
directories are created fresh, outside Symphony, and removed at exit. No
thread/model turn or provider request is made by this harness.

The source-level proof plan remains
[the incident ExecPlan](../../../.agent/execplans/2026-10-01-repair-wsl-sandbox-mounts.md).

## Activation and completed editor acceptance

On 2026-10-02 the user requested application and testing. The supported command
`code --install-extension openai.chatgpt --force` successfully updated only the
Codex extension from 26.5917.61114 to 26.928.40906. No manual binary replacement,
developer executable override, WSLg setting or mount change was made.

The new bundled executable is
`/home/chris/.vscode-server/extensions/openai.chatgpt-26.928.40906-linux-x64/bin/linux-x86_64/codex`.
It reports 0.159.2 and SHA-256
1748767b230ebfc3d4ab7e4e254920d0c0ad9691fd8c11f190e7d44511a4a92e.
Source tag rust-v0.159.2 resolves to ff6aec96948b70d94983af2641a6b67c94faeff5;
its preflight preserves the full options, including WSL masks. This differs
from the earlier standalone 0.160.0 candidate, so we tested the installed
binary separately rather than assuming equivalence.

The [installed-extension report](issue-35-installed-extension-comparison.json),
captured 2026-10-02T02:35:16.867535+00:00, records the exact baseline failure,
10 successful helper write/read/delete cycles, 10 successful sandbox commands,
denied read/write and WSLg-alias checks, blocked network/outside writes/daemon
access, fresh-process success, cleanup and unchanged canaries. The harness
exited 0. WSLg remained enabled. This proves the installed binary in isolated
execution, not activation in the editor. The earlier official 0.160.0 comparison
was also repeated successfully during this session.

On 2026-10-02 at 02:52Z, after the requested reload, a fresh user-directed
Codex session performed ten actual editor-mediated create/delete cycles using
the disposable repository path `.agent/execplans/.issue-35-aftertest-probe`.
Every creation and deletion succeeded and the probe was absent after the final
cycle. The installed extension binary reported `codex-cli 0.159.2`; the five
evidence-acceptance tests also passed. The sandboxed terminal could not
connect to the VS Code IPC socket (`EPERM`), so direct live-child executable
fingerprinting was unavailable. The requested reload plus successful work
through the current editor session is the active-editor proof; the saved
installed-binary report supplies the ten restricted command cycles,
fresh-process check, cleanup, and isolation checks. No WSL shutdown occurred.

The human operator owns recovery: if the updated extension fails to load, use
the extension's Install Another Version action or run
`code --install-extension openai.chatgpt@26.5917.61114 --force`, then reload.
That restores the known affected version, not a working repair. The original
extension directory remains present; no removal was attempted. Actual activation
rollback is untested. If no new session starts, leave the criterion unobserved;
there is no automatic restart, timeout action or rollback.

The installed extension manifest explicitly marks chatgpt.cliExecutable as
DEVELOPMENT ONLY, restricted, and application-scoped. It warns that manually
setting it may break parts of the extension. This rules out the earlier
assumption that a workspace-only setting could safely switch this repository.
If an extension update does not provide a corrected runtime, an application-wide
developer override is a separate integration trial: prepare a persistent
candidate package, verify companion executable needs, record the exact
application-setting diff and backup, and obtain approval for its broader scope
and session reload. Do not point a permanent setting at /tmp.

The active-editor acceptance boundary is complete. Direct helper RPC success
alone would not establish IDE integration, which is why the separate fresh
editor-session cycles are recorded above. A functional rollback was not run:
it would deliberately reinstall the known affected extension and is not needed
to establish the successful repair. The documented recovery procedure remains
available if a future regression requires it.

Rollback of the earlier isolated test is complete because that test did not
change the installation. Rollback of activation must restore the prior package
and verify the running executable. An editor reload ends the active session;
use the repository handoff rule if that is required. A WSL shutdown is not
required by the verified isolated repair.

## Upstream report draft (not submitted)

Title: WSLg preflight regression reproduced in 0.155.0-alpha.16; 0.160.0 verified locally

The VS Code bundled 0.155.0-alpha.16 runtime on WSL2 rejects
/mnt/wslg/distro during restricted command and filesystem-helper setup.
We reproduced the same error without Symphony using an isolated executor and
managed filesystem policy. The source tag drops WSLg mask options during
proc preflight; PR #46125 restores them. Official Linux 0.160.0 passes 10
filesystem and command cycles with WSLg active, denial fixtures intact,
and a fresh executor-process check. IDE runtime activation remains pending.
No new upstream patch is proposed because the correction is already merged.
Attach only the sanitized reproduction script/report and exact binary hashes
if a report about extension release propagation is still needed.

## Repository verification

After the supported extension installation on 2026-10-02, the canonical
verification again passed: Ruff lint/format, 66 tests in 3.33 seconds,
Markdown links, and `git diff --check`. No active-editor repair is inferred.

On 2026-10-02, `.venv/bin/python scripts/verify.py` passed Ruff lint/format,
66 tests in 3.27 seconds, and Markdown links. `git diff --check` passed.
Five of the tests cover evidence acceptance, including rejection of missing
trials, protocol errors, unrelated baseline errors, and failed cleanup/security
results. These do not assert that the running editor has been upgraded.

After the active-editor after-test at 02:52Z, the focused command
`.venv/bin/python -m pytest -q tests/unit/test_codex_wslg_proof.py` passed
(5 tests). Ruff lint/format, Markdown-link validation, and `git diff --check`
also passed. A fresh full-suite attempt did not complete within 20 seconds;
verbose output showed its first stall at
`tests/unit/symphony/test_dashboard.py::test_dashboard_exposes_status_and_pause_controls`.
That unrelated result is recorded as unobserved rather than treated as a
passing canonical verification; no Symphony source or test was changed here.
