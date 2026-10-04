# Symphony Operator Guide

**Status:** active template | **Owner:** operator | **Update:** scheduler, workflow, or recovery changes.

Symphony is an optional, GitHub-first scheduler for a template repository. It
is disabled in the checked-in configuration. It has no dashboard and does not
start, claim, or change GitHub work until an operator deliberately enables a
reviewed configuration outside this guide's safe baseline.

## Safe baseline

`WORKFLOW.md` is the source of the scheduler contract. The current baseline
has all of these properties:

- `runtime.live_dispatch: false` — calling `symphony serve` cannot admit work
  while this value is false.
- `agent.max_concurrent_agents: 1` — Symphony is deliberately single-worker.
  Parallel worker allocation is out of scope.
- GitHub queue admission requires both `status:ready` and `symphony:ready`.
  Do not add, remove, or use labels as a shortcut around user-started coding
  work or a human approval gate.
- Email notification is disabled. It is never a prerequisite for a completed
  implementation and must not be enabled without explicit provider, recipient,
  and send authority.

The proposed short form `app-template symphony run --issue <number>` is **not
implemented**. Until a separately approved implementation exists, the only
supported Symphony commands are workflow validation, prerequisite inspection,
and the disabled scheduler service described below.

## Lifecycle

For an eligible, explicitly enabled scheduler run, the service observes an
open GitHub Issue, applies its admission rules, obtains a local SQLite
reservation, prepares an isolated Git worktree, and invokes one Codex worker.
It then records a sanitized result, releases the reservation, and hands a
successful task to human review. The scheduler's normal queue path uses labels;
that label-changing path is deliberately distinct from a user-directed,
single-Issue safety demonstration.

Local scheduler evidence is stored under `var/symphony/` and is ignored by Git.
It may contain Issue IDs, status, model names, timing, sanitized summaries, and
worker lifecycle metadata. It must not contain prompts, full transcripts,
credentials, or email content.

## Fresh-operator walkthrough

Run these commands from the repository root. They validate the real checked-in
contract without enabling a worker or changing GitHub.

```bash
.venv/bin/python -m app_template.cli symphony validate-workflow
.venv/bin/python -m app_template.cli symphony preflight --require-dispatch
```

Expected results are a JSON workflow validation result, followed by a JSON
preflight result containing `live_dispatch: false` and `dispatch_ready: true`.
The second command only checks for host `codex`, authenticated `gh`, and the
configuration; it does not dispatch a task. If the host tools or GitHub
authentication are absent, it exits non-zero with no task mutation. Resolve
those prerequisites before any separately approved demonstration.

Do not run `app-template symphony serve` as a background or unattended process
from this guide. The checked-in configuration makes it inert, and changing that
configuration requires a reviewed operational change with a named target and
clear external authority.

## Bounded #12 demonstration

The completed #12 baseline used the dedicated disposable GitHub Issue #38. It
proved one real Codex worker in an isolated worktree, with a durable
reservation/event lifecycle, a clean worktree, disabled dispatch before and
afterward, and no label changes. Its evidence is recorded in #38 and #12.

That demonstration is not a general scheduler activation and must not be
re-run as a substitute for a real task. It establishes the one-worker safety
baseline for safe single-worker operation.

## Recovery

If a process ends after reserving an Issue, leave the SQLite database in place.
On restart, the scheduler reloads active reservations and refuses duplicate
work. Inspect the affected Issue, the local event/reservation record, and the
isolated worktree. Record the outcome in the normal recovery process; do not
delete the database or the worktree to clear a fence.

If a worker requests approval, fails due to its environment, or cannot make a
fresh GitHub observation, treat it as blocked. Do not retry by changing labels,
enabling dispatch broadly, or starting another worker. Preserve the evidence
and obtain the required human decision.

## Human-review handoff

After a bounded run, record the exact command, result, durable-event location,
worktree state, GitHub mutation scope, and whether dispatch remains disabled in
the relevant Issue and its ExecPlan. Leave successful work open for human
review. Do not push, merge, deploy, close Issues, or send email unless the
operator has separately authorized that action.

For broader local-operation guidance, see
[LOCAL_RUNBOOK](../operations/LOCAL_RUNBOOK.md). The policy for user-started
GitHub work is [GITHUB_ISSUE_WORKFLOW](../harness/GITHUB_ISSUE_WORKFLOW.md).
