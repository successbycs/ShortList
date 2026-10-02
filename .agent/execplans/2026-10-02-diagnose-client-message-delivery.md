# Diagnose and hand off delayed or missing Codex client messages

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #36 reports that the Codex client sometimes does not deliver user messages
to the active agent promptly, or does not deliver them at all, until the client
is restarted. After this investigation, a reviewer will have a sanitized,
reproducible account of the affected client boundary, the locally installed
runtime identity, and an evidence-backed conclusion: a locally remediable
configuration/workspace defect, an extension defect requiring a supported
update, or an upstream client/platform defect requiring an owner handoff.

The observable outcome is deliberately not a claim that the template's Python
application can fix a hosted chat transport. The repository is a Python-first
template and contains no chat composer, conversation transport, or VS Code
extension source. It can instead preserve durable sanitized evidence and the
exact verification gap in the Issue.

## Progress

- [x] (2026-10-02 00:00Z) Verified `successbycs/template` is both the configured GitHub target and `origin`; re-read Issue #36 and found no overlapping open issue.
- [x] (2026-10-02 00:00Z) Inspected repository sources and existing Codex runtime incident evidence; no client message-delivery implementation exists in this repository.
- [x] (2026-10-02 09:15Z) Identified installed extension package versions and collected only allowlisted aggregate local-log metadata; saved the sanitized result in `docs/operations/evidence/issue-36-client-delivery-20261002.md`.
- [x] (2026-10-02 09:20Z) Correlated the symptoms with open upstream `openai/codex` Issue #26683; no supported local repair or fixed version was identified.
- [x] (2026-10-02 09:25Z) Ran Markdown-link and explicit untracked-file whitespace validation; both passed.
- [x] (2026-10-02 09:30Z) Re-read Issue #36 and posted the sanitized evidence handoff at issue comment 5948934385; Issue #36 remains open for human review.

## Surprises & Discoveries

- Observation: The current repository has no chat UI, conversation store, WebSocket/stream transport, or hosted service implementation to patch.
  Evidence: `rg -n -i 'client|message|delivery|delay|stream|conversation|reboot|restart|websocket|transport|session' src tests docs README.md pyproject.toml` returned only template, Symphony notification, and existing WSL Codex-runtime material.
- Observation: The existing WSL incident records a supported extension update and successful fresh-editor file-operation checks, but it did not test chat message delivery.
  Evidence: `docs/operations/evidence/issue-35-repair-result.md`, section “Activation and completed editor acceptance”.
- Observation: The most recent local Codex log contains broad transport, timeout, retry, auth, and server-error classifications, but aggregate counts cannot identify an individual message or establish causation.
  Evidence: Sanitized counts in `docs/operations/evidence/issue-36-client-delivery-20261002.md`; no raw log line was retained.
- Observation: An open upstream extension/session issue has the same reported follow-up-message loss, delayed processing, and restart recovery symptoms.
  Evidence: `gh issue view 26683 --repo openai/codex --json url,state,createdAt,updatedAt,closedAt,labels,comments,title` on 2026-10-02; source link recorded in the evidence artifact.

## Decision Log

- Decision: Treat Issue #36 as a client/platform incident, not a template application bug.
  Rationale: The reported boundary is the client message composer and agent delivery path; the checked-in application does not implement that boundary.
  Date/Author: 2026-10-02 / Codex
- Decision: Collect only sanitized, allowlisted diagnostic evidence before considering an update or an upstream handoff.
  Rationale: Client logs can contain conversation content, authentication data, and identifiers. A broad log dump would be unsafe and does not establish a reproducible delivery fault.
  Date/Author: 2026-10-02 / Codex
- Decision: Do not restart the client, alter global client settings, or reinstall/downgrade an extension as part of initial diagnosis.
  Rationale: A restart terminates the affected session and is only the reported temporary workaround; configuration or installation changes have an application-wide external effect and require a specific evidence-backed proposal and authorization.
  Date/Author: 2026-10-02 / Codex
- Decision: Do not remove the user-level `model` setting as an attempted workaround.
  Rationale: The reported upstream workaround is anecdotal, requires a `model_context_window` setting that is absent locally, and explicitly does not correct disappearing follow-up messages. A global configuration edit would be unsupported and could change user behavior without proving the defect resolved.
  Date/Author: 2026-10-02 / Codex

## Outcomes & Retrospective

The investigation has established a high-confidence symptom match with an open
upstream extension/session defect and has saved sanitized local evidence. No
repository or local-client repair was authorized or evidenced. The live
message-delivery criterion remains unobserved because service-side correlation
and a controlled client submission are unavailable. Repository documentation
validation passed, and the Issue #36 handoff is complete. The issue remains
open for human review and upstream/client-owner action.

## Context and Orientation

Issue #36 in `successbycs/template` is the durable bug record. The repository
target is declared in `pyproject.toml` under `[tool.app-template.github]` and
matches the `origin` remote. `docs/harness/GITHUB_ISSUE_WORKFLOW.md` requires
re-reading the issue and verifying that target before each GitHub write;
`docs/harness/DEFINITION_OF_DONE.md` requires durable evidence in the Issue
and this plan for a risky or multi-session investigation.

`src/app_template/` is a generic Python package. Its `symphony/` modules are
local orchestration examples and notification delivery records; they do not
own this interactive client’s user-message transport. Existing files in
`docs/operations/` describe a distinct WSL sandbox mount incident. They are
relevant only because they record the current local VS Code Codex extension
runtime and establish a precedent for sanitizing diagnostics. A successful
sandbox file-operation test is not proof that a chat message reaches the
agent.

The affected operational boundary is the currently running Codex client,
including the user’s submit action, client session/stream connection, and the
service that dispatches messages to this conversation. Only client-side
metadata and error signatures are locally observable here. Hosted-service
traces and the actual client source are outside this workspace and require
their owner’s access.

The workspace currently has an unrelated untracked `.playwright-cli/`
directory. It must remain untouched.

## Plan of Work

First, perform a bounded local identity check. Read the installed extension
manifest/version and process metadata only as needed to identify the active
client. Search recent extension logs through a narrow allowlist of transport
failure terms, retaining counts, filenames relative to the log directory,
timestamps, and short redacted error classifications only. Do not copy message
bodies, prompt text, headers, session identifiers, authorization values, or
complete command lines into tracked evidence.

Second, compare that evidence with the existing extension version evidence and
the client’s supported update state. If a known supported update applies, do
not install it automatically: record the candidate version, predicted outcome,
rollback method, and required approval. If no local cause or safe repair is
observable, create a concise upstream-ready handoff with the exact missing
server-side correlation evidence.

Third, write a sanitized Markdown evidence artifact under
`docs/operations/evidence/` only if it contains no sensitive data; otherwise
record the fact of unavailable/private evidence in this plan and the Issue.
Update every living-plan status section. Validate changed documentation links
and whitespace, then re-read and comment on Issue #36. Leave the issue open
for human review; do not close, label, deploy, restart, or change application
settings.

## Concrete Steps

All commands run from `/home/chris/template` unless stated otherwise.

1. Confirm GitHub target, permission, and current Issue #36 before each write:

   ```bash
   gh repo view successbycs/template --json nameWithOwner,url,viewerPermission
   gh issue view 36 --repo successbycs/template --comments
   ```

   Expected: `successbycs/template` and a permitted account; the current Issue
   body/comments are visible. A network or credential failure blocks only the
   corresponding GitHub write.

2. Identify installed extension metadata and run a sanitized log scan. The
   scanner must emit only version/path classifications, timestamps, counts, and
   predefined error categories. It must not print raw log lines.

3. Inspect the scanner result. If evidence is safe for version control, add a
   dated artifact at `docs/operations/evidence/issue-36-client-delivery-*.md`.
   Otherwise record the category and retention limitation without committing
   private logs.

4. Validate the actual changes:

   ```bash
   .venv/bin/python scripts/check_markdown_links.py
   git diff --check
   ```

   Expected: both commands exit zero. If a scanner/script is added, run its
   focused tests as well. No test can substitute for successful delivery at the
   live client/service boundary.

5. Re-read Issue #36, then post a concise evidence comment with the commands,
   observed result, affected boundary, and exact owner action still required.

Executed validation result on 2026-10-02:

```text
.venv/bin/python scripts/check_markdown_links.py
Markdown links: passed

git diff --no-index --check /dev/null \
  .agent/execplans/2026-10-02-diagnose-client-message-delivery.md
git diff --no-index --check /dev/null \
  docs/operations/evidence/issue-36-client-delivery-20261002.md
# Both commands had no whitespace-error output; exit status 1 was the expected
# new-file diff status and was asserted explicitly.
```

The verified handoff was posted at
https://github.com/successbycs/template/issues/36#issuecomment-5948934385.

## Validation and Acceptance

The local evidence acceptance criteria are:

- The active/installed client identity is recorded from bounded local metadata.
- Any retained diagnostic artifact contains no message contents, credentials,
  tokens, session IDs, or raw request/response bodies.
- The investigation distinguishes observed facts from inferences and does not
  claim a client delivery fix merely because a restart or unrelated sandbox
  repair succeeded.
- Markdown-link validation and `git diff --check` pass for repository changes.
- Issue #36 contains a current evidence handoff and remains open.

The claimed live operational boundary is prompt user-message delivery to the
active Codex conversation. A real proof would submit a controlled, uniquely
identifiable test message through the affected client, measure receipt and
ordering from service-side telemetry, and repeat without a restart. This
session lacks safe access to service telemetry and cannot send hidden test
messages into the user’s conversation. Until the client owner runs that test,
the live-fix criterion is **unobserved**, not passed.

## Idempotence and Recovery

Read-only manifest and allowlisted-log scans are repeatable. Generated evidence
will be additive and must be reviewed before it is tracked. No log source,
client setting, extension package, conversation, or host configuration is
modified. If a planned capture would require restart, global configuration,
or extension installation, stop and request explicit approval after recording
the exact change and recovery path. The user’s reported client restart remains
a temporary manual recovery action, not this plan’s rollback procedure.

## Artifacts and Notes

- `.agent/execplans/2026-10-02-diagnose-client-message-delivery.md`: this
  living investigation record.
- `docs/operations/evidence/issue-35-repair-result.md`: existing separate
  extension/sandbox evidence; it must not be cited as chat-transport proof.
- Issue #36: durable external handoff and review surface.

## Interfaces and Dependencies

No application interface changes are planned. The investigation depends on the
locally installed VS Code Codex extension for version metadata and on GitHub
CLI access to update Issue #36. The actual delivery path depends on proprietary
client and hosted-service components outside this repository. Any future
client-source fix, extension update, client restart, global configuration
change, or service-telemetry query needs separately established target evidence
and authorization.
