# Issue 35: verified isolated runtime repair

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

## Activation, rollback and remaining acceptance

No installed executable, VS Code setting, WSLg setting or host mount was
changed. The active editor still needs an updated runtime. Prefer a supported
extension update that bundles this correction. Verify the newly running
executable and its hash/version after activation; terminal PATH alone is
insufficient.

The installed extension manifest explicitly marks chatgpt.cliExecutable as
DEVELOPMENT ONLY, restricted, and application-scoped. It warns that manually
setting it may break parts of the extension. This rules out the earlier
assumption that a workspace-only setting could safely switch this repository.
If an extension update does not provide a corrected runtime, an application-wide
developer override is a separate integration trial: prepare a persistent
candidate package, verify companion executable needs, record the exact
application-setting diff and backup, and obtain approval for its broader scope
and session reload. Do not point a permanent setting at /tmp.

After activation, a fresh user-directed editor session must perform repeated
normal command and actual editor create/delete tests. Direct helper RPC success
does not establish IDE integration. Keep #35 blocked on this final boundary
rather than close it as fully fixed.

Rollback of the isolated test is complete because the installed runtime never
changed. Rollback of a future activation must restore the prior setting/package
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

On 2026-10-02, `.venv/bin/python scripts/verify.py` passed Ruff lint/format,
66 tests in 3.27 seconds, and Markdown links. `git diff --check` passed.
Five of the tests cover evidence acceptance, including rejection of missing
trials, protocol errors, unrelated baseline errors, and failed cleanup/security
results. These do not assert that the running editor has been upgraded.
