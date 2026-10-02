# Assess native Windows Codex sandbox feasibility

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #34](https://github.com/successbycs/template/issues/34)

## Purpose / Big Picture

This assessment determines whether the same computer can run Codex directly in
Windows with its native sandbox while retaining the existing WSL2 workspace and
WSLg. It does not migrate the template repository. A successful result would
show a disposable Windows-local workspace can be inspected and can safely
create and remove a disposable file under the native sandbox. It does not prove
the WSL editor repair, live Symphony dispatch, or that Windows should replace
the existing workflow.

## Progress

- [x] (2026-10-02 02:44Z) Claimed #34, reread its scope and the repository proof rules. No Windows configuration, UAC request, clone, migration, credential, or WSLg change occurred.
- [x] (2026-10-02 02:46Z) Read the official Windows sandbox guidance. It defines elevated as the preferred mode and unelevated as an explicitly weaker fallback.
- [x] (2026-10-02 02:49Z) Collected minimal read-only Windows capability evidence. Windows 11 Pro build 26200.9457, PowerShell 5.1, Git and VS Code command were discoverable; `codex.exe`, ChatGPT executable and the OpenAI.ChatGPT Appx package were not. The WSL checkout maps to `\\wsl.localhost\\Ubuntu\\home\\chris\\template`, a UNC path unsuitable as the required Windows-local disposable workspace.
- [ ] (requires explicit human approval) Create one Windows-local disposable workspace and start the native elevated sandbox setup, accepting any UAC prompt. Record only sanitized mode/result/error-class evidence.
- [ ] (requires explicit human approval) Run the bounded real proof in that disposable workspace: sandbox start, `git status --short`, create/read/delete a unique disposable file, verify cleanup, then remove only the owned workspace.
- [ ] (after proof) Compare the native boundary with the WSL editor boundary, record rollback/cleanup, run repository verification if repository files change, commit evidence, and move #34 to human review. Otherwise, leave #34 blocked with the exact missing approval or policy condition.

## Surprises & Discoveries

- Observation: The active WSL extension uses Codex 0.159.2, whose WSLg preflight repair was separately installed and tested; native Windows is therefore an optional alternate execution surface, not a required repair.
  Evidence: `docs/operations/evidence/issue-35-installed-extension-comparison.json` and Issue #35 handoff.

- Observation: OpenAI documents two distinct native Windows modes. Elevated is stronger and requires lower-privilege users, firewall rules and local policy changes; unelevated is an ACL/restricted-token fallback with weaker network isolation.
  Evidence: [OpenAI Windows sandbox documentation](https://learn.chatgpt.com/docs/windows/windows-sandbox), accessed 2026-10-02.

- Observation: No native Codex/ChatGPT client was discovered by bounded command and package checks. VS Code's `code.cmd` and Git are installed, but that does not provide native Windows Codex sandbox capability.
  Evidence: `where codex.exe`, `where ChatGPT.exe`, `where chatgpt.exe`, and `Get-AppxPackage -Name OpenAI.ChatGPT` returned no matching client on 2026-10-02; `Get-Command` found only `code.cmd` and `git.exe`.

- Observation: `cmd.exe` started from the WSL checkout warns that UNC working directories are unsupported and falls back to the Windows directory.
  Evidence: `wslpath -w /home/chris/template` and the bounded Windows inventory on 2026-10-02.

## Decision Log

- Decision: Begin only with read-only discovery and an explicit real-boundary proof design.
  Rationale: #34 forbids Windows sandbox setup, administrator prompts, cloning and host changes without separate human authority. A native executable being present is supporting evidence, not a feasibility pass.
  Date/Author: 2026-10-02 / Astra

- Decision: Prefer elevated native Windows sandbox; use unelevated only if elevated is refused or policy-blocked, and label its weaker network isolation clearly.
  Rationale: This follows official guidance and keeps the security comparison meaningful.
  Date/Author: 2026-10-02 / Astra

## Outcomes & Retrospective

Read-only discovery is complete. #34 is blocked before the real boundary:
this machine has no discovered native Codex/ChatGPT client and no approved
Windows-local disposable workspace. The current WSL setup and repository remain
the canonical working environment. Installing a native client, choosing a local
path, accepting elevated setup/UAC, and running the proof all require separate
human authority. No native Windows capability is claimed.

## Context and Orientation

The canonical checkout is `/home/chris/template` inside WSL2. The prior WSLg
mount incident is being addressed by a supported updated VS Code extension;
Issue #35 still needs a post-reload actual-editor test. This Issue is separate:
it evaluates Windows-native Codex without moving, copying over, or changing the
canonical checkout and without disabling WSLg.

OpenAI's native Windows sandbox is not Linux Bubblewrap. The preferred
`elevated` implementation makes Windows-local privilege, firewall and policy
changes during setup and can require a UAC prompt. The fallback `unelevated`
implementation uses a restricted token and ACL boundaries but provides weaker
network isolation. These differences mean a command passing in one environment
does not prove the other one works.

Any trial must use a new disposable directory on a Windows-local filesystem,
not `/mnt/c`, a UNC/WSL share, the repository path, or a synced/cloud folder.
The proposed directory must be displayed and approved before creation. The
trial may inspect Git read-only and create/read/delete only a unique file it
owns. It must not authenticate, clone, push, connect to GitHub, invoke a model
turn, enable live dispatch, or modify WSL/WSLg settings.

## Plan of Work

### Milestone 1: capability record

Run read-only Windows commands through the existing WSL-to-Windows bridge to
identify Windows edition/build, native executable availability and a translated
path for the canonical checkout. Record only version strings, executable names
and path classification. Do not capture environment dumps, account names,
registry data, configuration files or secrets. This establishes whether a
native trial is plausible, not that sandbox setup is allowed.

### Milestone 2: approval gate and isolated workspace

Before Windows writes, show the proposed exact directory and ask for approval
covering: creating that one disposable Windows-local directory, triggering the
official elevated setup and accepting its UAC prompt if the operator permits,
running bounded commands, and deleting only the owned directory after evidence
capture. Do not create the directory or invoke `windowsSandbox/setupStart`
until approval. If elevated is blocked, preserve its sanitized error class and
ask separately whether to assess the weaker unelevated fallback.

### Milestone 3: real native proof

In a new native Windows Codex session, select `Ask for approval` and the
elevated Windows sandbox. Run the setup path identified by the official client,
then prove the actual boundary in the approved disposable workspace:

1. `git status --short` must complete without writing.
2. Create a unique `native-sandbox-probe.txt`, read it back, and delete it.
3. Verify the path no longer exists and no other file was touched.
4. Attempt a harmless write outside the workspace only if the native client can
   express a safe denied fixture; a refusal is expected and must not fall back
   to unsandboxed execution.

Capture mode, result, timestamp, error class and cleanup result in a sanitized
JSON evidence record. Do not retain native Codex logs unless a later approved
diagnostic process filters secrets.

### Milestone 4: conclusion and recovery

Classify the result as passed only when the selected native sandbox actually
performs the bounded operations and cleanup. Classify elevated setup denial,
UAC/policy refusal, absent executable, unsupported filesystem, or missing
human approval as blocked with the exact next action. A passing unelevated test
is a limited fallback result, not proof of elevated security. Remove only the
approved disposable directory after evidence capture; no rollback is needed for
the repository because it was never altered. Native sandbox user/firewall setup
is host state and requires the operator's documented recovery path if it is
later removed or changed.

## Concrete Steps

From `/home/chris/template`, completed planning checks:

```bash
cat .agent/PLANS.md
cat docs/harness/DEFINITION_OF_DONE.md
gh issue view 34 --repo successbycs/template --json number,title,body,labels
```

Expected current result: #34 is `status:in-progress`; the plan exists and no
Windows state has changed.

Actual bounded discovery result, 2026-10-02:

```text
Windows 11 Pro; version 10.0.26200.9457; PowerShell 5.1.26100.9444
Git: C:\Program Files\Git\cmd\git.exe
VS Code command: C:\Users\chris\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd
Native Codex/ChatGPT executable or Appx package: not found
WSL checkout mapping: \\wsl.localhost\Ubuntu\home\chris\template (UNC; not Windows-local)
```

The next permitted read-only discovery is a Windows OS/executable inventory.
Expected result: a short OS/build and executable-presence report. A missing
native `codex.exe` is a blocker, not permission to install it.

The eventual approved proof has to be executed from native Windows, not by a
WSL command pretending to be the Windows sandbox. The exact client command is
chosen only after the installed native client and its documented sandbox mode
are known.

## Validation and Acceptance

| Claimed boundary | Required real proof | Status now |
| --- | --- | --- |
| Read-only capability inventory | Native Windows command reports version/executable availability without state change | passed: native Codex client absent |
| Elevated native sandbox availability | Human-approved official setup reaches a successful completion result | blocked on approval |
| Native bounded filesystem boundary | In a Windows-local disposable workspace, sandboxed Git inspection and owned create/read/delete/cleanup complete | blocked on approval |
| Isolation | Safe denied-fixture attempt is refused, or a documented platform limitation is recorded | blocked on approval |
| Canonical WSL checkout / WSLg preserved | Before/after path and configuration evidence show no change | pending read-only baseline |
| Live Symphony dispatch | Separate dedicated end-to-end proof | out of scope and unobserved |

Repository tests do not establish the Windows-native sandbox. If local files
change, run `.venv/bin/python scripts/verify.py` and Markdown-link checks; if
only an Issue comment/plan records a blocked boundary, record that explicitly.

## Idempotence and Recovery

Read-only discovery is repeatable. Never reuse a prior disposable workspace.
Before creating a new one, require a fixed explicit Windows-local path and
verify it does not exist. After a bounded trial, remove only that exact path
and verify its absence. Never remove the WSL checkout, an entire temp root, or
Windows sandbox users/firewall rules as part of repository cleanup. The human
operator owns UAC decisions and any host-level rollback.

## Artifacts and Notes

Relevant prior evidence is `docs/operations/evidence/issue-35-installed-extension-comparison.json`; it proves an isolated WSL runtime path only. The durable result for this Issue will be a new sanitized native-Windows evidence record only after an approved real trial. Use Issue #34 for concise handoff; do not duplicate host-specific details across unrelated runbooks.

The bounded discovery is durable in this ExecPlan. It stores no usernames,
environment values, package paths, logs, configuration content, or credentials.

## Interfaces and Dependencies

This plan adds no application interface. The eventual proof depends on an
installed native Windows Codex client that supports `[windows] sandbox =
"elevated"`, a Windows-local filesystem path, Git if `git status` is part of
the proof, and explicit operator/UAC authorization. OpenAI's supported modes
are `elevated` and `unelevated`; a configuration file is not created merely to
test availability.
