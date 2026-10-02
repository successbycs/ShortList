# Codex WSL sandbox mount incident record

Status: unresolved. Owner: repository operator and Codex runtime maintainer.
Started: 2026-10-02 00:45 UTC. Related issues: [#29](https://github.com/successbycs/template/issues/29), [#32](https://github.com/successbycs/template/issues/32), [#33](https://github.com/successbycs/template/issues/33), [#34](https://github.com/successbycs/template/issues/34).

## Purpose and current conclusion

This is the detailed evidence record for the repeated Codex sandbox failure
naming /mnt/wslg/distro. It preserves observations, attempted remedies,
contradictions, and decisions for diagnosis and a possible upstream report.
The implementation record remains
[the incident ExecPlan](../../.agent/execplans/2026-10-01-repair-wsl-sandbox-mounts.md).
The operator procedure remains [Troubleshooting](TROUBLESHOOTING.md).

The failure is observed while Codex prepares its sandbox, before the requested
repository command or file edit executes. The sole root cause is not established.
The presence of the WSLg mount is confirmed; its necessity or sufficiency for
this failure has not been tested. No permanent repair has been demonstrated.
A terminal command run with approved escalation bypasses the failing setup and
is a workaround, not proof that normal sandbox execution is repaired.

## Evidence provenance and capture limits

The machine-readable [initial diagnostic snapshot](evidence/wsl-sandbox-20261002T004502Z.json)
was captured at 2026-10-02T00:45:02.457332+00:00. It contains allowlisted process
metadata, two mount records, and sanitized error excerpts from the five most
recently modified VS Code Codex extension logs. It is not a full trace or an
exhaustive search of historical logs. Zero matches in a selected log is not
proof of a healthy session.

Raw log lines, prompts, authentication files, command arguments, environment
dumps, socket payloads, and unrelated repository content were not copied.
The capture read only four named runtime-environment fields from the visible
Codex process: XDG_RUNTIME_DIR, TMPDIR, TMP, and TEMP. Only XDG_RUNTIME_DIR was
present. The user-home prefix in the executable path is replaced with
<USER_HOME>. PIDs are historical snapshot identifiers, not valid targets for
future process control.

Log timestamps lack a timezone suffix. They are preserved as logged and must
not be silently interpreted as UTC or sorted into the UTC experiment timeline.
Directory names also do not establish UTC. Earlier history below is reconstructed
from committed ExecPlans and Issue comments, not newly recovered raw traces.
Missing evidence is explicitly marked.

## Failure signature and affected boundary

Observed tool error, retained literally:

~~~text
error building bubblewrap command: app-server socket directory has an unsupported host mount at /mnt/wslg/distro; remove the bind-mount alias or nested mount before starting the sandbox
~~~

The normal file-edit tool also wraps this as:

~~~text
fs sandbox helper failed with status exit status: 1
~~~

The suggestion in an error message is not authorization to unmount anything.
A normal read-only terminal call in this conversation also returned the same
sandbox-construction error. The failure therefore is not limited to deleting
files, although a create-then-delete sequence was the earlier reproduction.

Historical normal editor probes created a disposable file successfully, then
failed on immediate deletion. We do not yet know whether creation and deletion
follow different helper paths or whether the difference is intermittent.
A successful creation alone is insufficient proof.

## Current environment observations

| Observation | Evidence and limits |
| --- | --- |
| Linux kernel | 6.6.87.2-microsoft-standard-WSL2, from os.uname().release. |
| Visible Codex process | PID 2420; executable under the VS Code extension openai.chatgpt-26.5917.61114-linux-x64. Its arguments include app-server; other arguments were not retained. |
| Executable version | Invoking that executable with --version returned codex-cli 0.155.0-alpha.16. This matches the current PATH command observation. Binary hashing and attribution of each historical error to this process remain pending. |
| Process working directory | Classified as a Windows-mounted path. This is the server process directory, not proof of the task working directory. |
| XDG_RUNTIME_DIR | /run/user/1000/. No TMPDIR, TMP, or TEMP value was present in that process snapshot. |
| WSLg parent | /mnt/wslg, tmpfs, rw,relatime, filesystem root /. |
| Nested WSLg mount | /mnt/wslg/distro, ext4, ro,relatime, filesystem root /. |
| Claimed socket path | Unknown. The error identifies a rejected mount, not the exact app-server socket. |
| Earlier version record | The original incident ExecPlan records 0.159.3. Its executable path/hash was not preserved there. It cannot be assumed to be the current extension executable. |

A previous socket listing showed GUI and VS Code sockets, but did not establish
which socket the sandbox rejected. Do not infer that the socket must reside
under WSLg simply because the error names a WSLg mount.

## Existing log trace excerpts

The snapshot records twelve lines matching the exact mount-error substring,
distributed across three of the five selected logs:

| Source relative to VS Code logs directory | Matching lines | Timestamps as logged |
| --- | --- | --- |
| 20261001T155241/exthost3/openai.chatgpt/Codex.log | 10 | 2026-10-01 16:20:54.703; 16:21:30.950; 16:22:05.795; 17:01:14.883; 18:18:38.987; 18:36:23.784; 18:42:03.255; 18:43:51.194; 18:45:11.706; 2026-10-02 10:40:19.649 |
| 20261002T105632/exthost2/openai.chatgpt/Codex.log | 1 | 2026-10-02 11:17:29.178 |
| 20261002T131302/exthost1/openai.chatgpt/Codex.log | 1 | 2026-10-02 13:35:50.967 |

Each of those twelve lines also matched the bubblewrap-construction and
filesystem-helper failure substrings. Counts represent matching log lines,
not twelve independently established user operations. No stack trace, syscall
trace, or resolved socket path has been captured yet. Verbose runtime logging
has not been enabled on the active process.

## Attempts and results

| Attempt | Observed outcome | Interpretation |
| --- | --- | --- |
| Read-only mount preflight | Live exit 2 and nested-mount warning; fixture tests passed in original incident work. | Detects topology; does not prove root cause or repair. |
| CLI sandbox /bin/true | Passed while nested mount existed. | Insufficient coverage of the failing boundary. |
| One-shot app-server JSON-RPC pipe | Initialization occurred; required command response was absent before stdin closed. | Inconclusive protocol experiment. |
| Persistent app-server command/exec /bin/true | Passed while normal editor deletion failed. | Supporting evidence only; must not be used as the decisive recovery test. |
| Normal editor disposable create/delete | Creation passed and deletion failed in recorded baseline attempts. | Reproduced the affected file-edit workflow; before-state only. |
| Approved terminal fallback | Repository reads and narrowly scoped edits could proceed. | Allows independent setup work; normal sandbox remains unproven. |
| First temporary WSLg-disable helper | Prior plan records configuration change, shutdown, restoration; agent died before after-test. | Safe recovery reported, effect on sandbox unobserved. |
| Second temporary WSLg-disable helper | Prior plan records Session B timeout, restoration, and another restart. | No disabled-state editor test; hypothesis still unobserved. |
| #33 design revision | Local plan and Issue acceptance criterion changed to normal editor create/delete; #34 created. | Documentation progress, not a runtime fix. |
| Repository patch attempt during design revision | Failed with the same mount error; terminal fallback applied the edit. | Failure occurs during documentation work too. |
| Fallback editing scripts during design revision | JavaScript syntax error, unavailable btoa helper, and assertion failures occurred before the eventual successful edit. | These were agent editing mistakes, not evidence about WSL or Symphony. No source file was written by the failed assertion-based attempts. |
| Native Windows Codex | #34 created; no native Windows experiment executed. | Alternative remains unobserved. |
| Source patch or supported runtime upgrade | No candidate built, installed, or tested. | Not attempted; no upstream fix can be claimed. |

Historical records: [incident plan](../../.agent/execplans/2026-10-01-repair-wsl-sandbox-mounts.md),
[design plan](../../.agent/execplans/2026-10-02-design-wslg-disable-experiment.md),
[execution plan](../../.agent/execplans/2026-10-02-run-wslg-disable-spike.md).
Relevant recorded commits include bcf6a54 (baseline), 7aa1534 (restart handoff),
and f91b7df (timeout/restoration). These references preserve earlier evidence;
they are not a replacement for missing after-state traces.

## Assumptions under review

| Hypothesis or earlier claim | Assessment | Evidence needed |
| --- | --- | --- |
| Symphony caused the failure | Not demonstrated. Failure during sandbox setup points toward tooling/environment, but no controlled comparison excludes a launch/configuration interaction. | Same runtime/settings in a disposable workspace without Symphony running. |
| Symphony cannot be involved | Earlier categorical claim was too strong. | Trace launcher, effective task directory, socket and runtime configuration before excluding involvement. |
| The affected version is 0.159.3 | Conflicts with current executable observation. | Resolve executable paths, versions, hashes, and correlation with each reproduction. |
| Disabling WSLg fixes it | Untested hypothesis. | Valid before/after editor evidence while the changed setting is verified active. |
| Socket relocation can fix it | Plausible, unproven. Public --listen controls a listener; it may not control the internal socket implicated here. | Trace source and runtime selection of the rejected socket before changing settings. |
| A single successful probe proves reliability | Too weak for the reported intermittent behavior. | Repeated normal read/create/delete checks, fresh-session confirmation, documented sample size and failures. |
| Native Windows is the best durable solution | Premature. | #34 feasibility plus repository/toolchain compatibility evidence. |
| Other repositories never failed | Operator history is relevant, but not a controlled comparison. | Same executable/session mode with matched settings and an isolated workspace. |

## Decisions and rationale

- 2026-10-02: preserve WSLg during initial diagnosis. Two restarts did not
  produce the required comparison; another identical attempt adds disruption
  without resolving the missing evidence.
- 2026-10-02: trace the actual runtime and socket before selecting a remedy.
  The executable discrepancy and missing socket path are material gaps.
- 2026-10-02: retain the normal file-edit path as a required recovery test,
  and include normal command execution because it now shows the same error.
  A lower-level command test cannot substitute for either affected interface.
- 2026-10-02: keep #34 independent of #32. Native Windows feasibility is
  an alternative investigation, not a prerequisite for the WSLg comparison.
- 2026-10-02: continue independent repository setup through approved tools,
  recording when fallback is used. Keep ordinary setup evidence separate from
  claims that normal sandbox execution or live dispatch works.
- 2026-10-02: do not remove the sandbox rejection check as a proposed fix.
  Any source change must preserve mount isolation and include regression tests.
- 2026-10-02: prepare an upstream submission only from a sanitized reproduction
  and tested diagnosis. No OpenAI report or pull request has been submitted.

## Next diagnostic sequence and stop conditions

First correlate the actual running executable, its version/hash, the failing
request, and the selected socket path. Locate the source code producing the
exact error and determine which mount relationship it rejects. Record the
source revision so current upstream code is not mistaken for installed code.

Next reproduce with the same runtime and sandbox settings in a disposable
workspace without Symphony. Include a normal read and create/delete sequence.
Record each trial, not just the successful trial. If the test cannot exercise
the same editor path, label it supporting evidence and retain the gap.

If existing logs cannot resolve the socket, propose scoped diagnostics for an
isolated child process. Record the exact logging modules, executable and command,
duration, output destination, redaction rules, and expected fields before capture.
Avoid global RUST_LOG=trace or dumping request bodies. Do not attach a broad
syscall trace to the active authenticated editor process. A restart-dependent
capture requires the existing human handoff procedure.

Only after that evidence choose a supported configuration adjustment, verified
runtime update, or source patch. State predicted behavior before testing.
If the next action would reproduce an already inconclusive test without changing
its missing prerequisite, stop that experiment and record the missing prerequisite.

For any candidate record before-state, exact change, after-state, repeated
affected-operation checks, isolation checks, rollback, and result. Keep
pass, fail, blocked, and unobserved distinct. A mount disappearance alone is not
success; an editor success is not end-to-end Symphony dispatch proof.

## Record format for each new event

Append a dated event containing: evidence ID; UTC capture time; source timestamp
and timezone confidence; executable path/version/hash; task working directory
class; exact sanitized tool request or command; sandbox and approval mode;
exit status; error excerpt; artifact path; before/after state; interpretation;
remaining uncertainty; next decision; and restoration/cleanup result.

Retain sanitized evidence under docs/operations/evidence and link it here.
If private raw diagnostics become necessary, keep them in ignored local
var/diagnostics with restricted permissions and record their retention owner.
Ignored files are not durable shared proof and are not safe to publish merely
because Git ignores them. Review the sanitized export before any upstream
publication. Do not collect login logs, tokens, prompts, or complete environments.

## Capture-session validation

During this capture the normal patch tool created both new evidence files, but
its subsequent update of existing documentation failed with the same mount
error. The exact document update succeeded using the patch executable through
approved terminal escalation. No equivalence between the two execution paths
is assumed. This adds another observed creation/update contrast, not an
explanation for it.

The initial snapshot is valid JSON and its twelve mount-error excerpts are
allowlisted strings with source timestamps. Documentation/link and whitespace
checks are recorded in the incident ExecPlan after execution. No runtime patch,
WSLg change, or restart was performed by this capture session.
