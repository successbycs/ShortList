# Backport the proven Symphony handoff to ShortList

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList needs to run bounded engineering Issue #29 through upstream Symphony
without repeating the prior continuation loop. The reusable template proof
showed that a worker must create a local commit, record Issue evidence, and
remove its own admission label before the open Issue can become a human-review
handoff. After this change, the operator can deliberately run one reviewed,
full-access worker and observe a safe tracker-visible stop condition.

## Progress

- [x] (2026-10-05 05:50Z) Confirmed template #46 proof passed and #29's #34
  dependency is closed.
- [x] (2026-10-05 06:00Z) Chris explicitly approved full access for deliberately
  started Symphony workers in ShortList only; update the workflow, launcher,
  and operator/readiness guides accordingly.
- [ ] Commit only those policy files, admit #29, and run it in a fresh
  host-local workspace.
- [ ] Record actual result and stop the foreground process.

## Surprises & Discoveries

- Observation: Codex protects `.git` recursively in `workspace-write` mode.
  Evidence: template proof Issue #47 failed at `.git/index.lock` until the
  explicitly acknowledged full-access policy was used.

## Decision Log

- Decision: Backport the template's full-access label-release handoff to
  ShortList for the deliberately admitted #29 worker.
  Rationale: Chris explicitly instructed execution of the missing policy and
  admission work after the template proof passed. There is no supported narrow
  Git-metadata write exception in `workspace-write`.
  Date/Author: 2026-10-05 / Chris and Codex.

## Outcomes & Retrospective

Pending live #29 evidence. This plan does not authorize a push, deployment,
provider credential use, customer communication, or closure of #29.

The documentation-only backport is committed separately as `2e3ad6c`. The
runtime backport remains intentionally uncommitted: it changes ShortList from
the protected `workspace-write` sandbox to unrestricted worker access and
requires a direct human authorization for this repository, not only the prior
template proof authorization.

## Context and Orientation

`WORKFLOW.md` configures upstream Symphony for `successbycs/ShortList`.
`scripts/run_upstream_symphony_dashboard.sh` is the explicit foreground
launcher. `docs/guides/SYMPHONY_OPERATOR.md` and
`docs/harness/DEFINITION_OF_READY.md` describe the human operating boundary.
The workflow clones the committed source into a per-Issue directory below
ignored `var/`; a new workspace root is used for this proof to avoid reuse of
the earlier GH-29 workspace.

## Plan of Work

Set both Codex thread and turn policies to the upstream-supported full-access
values, then require a separate exact acknowledgement in the launcher. Update
the worker prompt so it can remove only its own admission label after a local
commit and an evidence comment. Explain the broader host trust boundary in the
operator and readiness documents.

Commit only these policy files. Record the human decision in #29, add the
existing `symphony:ready` label, and start one foreground upstream process with
a fresh ignored workspace and log location. Observe worker output, Issue
evidence/label state, and leave the Issue open for human review.

## Concrete Steps

From `/home/chris/ShortList`, validate YAML and shell syntax, then commit only
`WORKFLOW.md`, `scripts/run_upstream_symphony_dashboard.sh`, this plan, and the
two updated guidance files. Start with:

```sh
SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" \\
SYMPHONY_FULL_ACCESS_ACK="I understand" \\
SYMPHONY_WORKSPACE_ROOT="$PWD/var/symphony-upstream/workspaces-20261005-gh29" \\
SYMPHONY_LOGS_ROOT="$PWD/var/symphony-upstream/logs-20261005-gh29" \\
GITHUB_TOKEN="$(gh auth token)" scripts/run_upstream_symphony_dashboard.sh
```

## Validation and Acceptance

The configuration is valid when YAML parses, shell syntax passes, and the
launcher rejects a start missing the full-access acknowledgement. The live
proof passes only if #29 creates a local worker commit, records evidence,
removes only `symphony:ready`, remains open for review, and has no product
provider/deployment/payment effect. A failure is recorded honestly in #29 and
the foreground process is stopped.

## Idempotence and Recovery

Do not delete or reuse the old GH-29 workspace. The labelled Issue is the only
candidate. If the worker blocks or exceeds scope, stop the exact foreground
process, preserve ignored logs/workspace, remove the admission label only as
the defined handoff permits, and record the blocker. Do not push or deploy.

## Artifacts and Notes

The template evidence is Issue #46 and its disposable Issue #47 in
`successbycs/template`. ShortList records the reusable summary in
`docs/product/BACKPORT_CANDIDATES.md`.

## Interfaces and Dependencies

The changed interfaces are the `codex.thread_sandbox` and
`codex.turn_sandbox_policy` fields in `WORKFLOW.md` plus the required
`SYMPHONY_FULL_ACCESS_ACK` launcher environment variable. No application API,
Cloudflare binding, credential, or deployment interface changes.
