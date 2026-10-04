# Accept the upstream Symphony Set-up programme

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Perform the parent acceptance audit for #5 after its five ordered delivery
children. A reviewer can confirm that the template uses official upstream
Symphony as its sole coding-work runtime, that the actual scheduler-to-Codex
path and restart model were observed, that copied-project targeting is safe,
and that lightweight planning guidance does not reintroduce custom
orchestration. This plan records evidence only; #5 and every child remain open
for human review.

## Progress

- [x] (2026-10-04 04:44Z) Re-read #5 and all current child Issue evidence;
  compare the actual open/closed states, local commits, source, and plans.
- [x] (2026-10-04 04:45Z) Reopen #39 and #40, which had been closed despite
  the explicit open-for-human-review policy.
- [x] (2026-10-04 04:46Z) Re-audit all five children as open, verify the local
  commit/source chain, and prepare the parent acceptance matrix and durable
  review handoff.

## Surprises & Discoveries

- Observation: #39 and #40 were closed even though their evidence says they
  remain open for review.
  Evidence: GitHub state audit at 2026-10-04 04:44Z showed both `CLOSED`; they
  were reopened after verifying their completed evidence.
- Observation: #42's offline installer proposal is intentionally separate from
  the accepted integration baseline.
  Evidence: its diff remains uncommitted in the isolated worker workspace; #41
  did not silently integrate it.

## Decision Log

- Decision: Treat local commits and durable Issue evidence as child completion
  evidence, with GitHub publication recorded separately.
  Rationale: the parent requires a relevant commit or snapshot and no push was
  implied by individual delivery tasks. The earlier upstream integration range
  was pushed with explicit user authority; later #41/#13/#16 commits are local
  pending future publication authority.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Do not close #5 or any child.
  Rationale: the active goal requires open human-review records.
  Date/Author: 2026-10-04 / Codex and repository owner.

## Outcomes & Retrospective

Pending the parent Issue handoff. The five required children have current
evidence: #39 upstream installation/dashboard, #40 real task/restart, #41
duplicate-runtime retirement, #13 copied-project operator operation, and #16
lightweight planning policy. The next execution task after this handoff is #44,
the replacement final retrospective; #45 is the final human review.

## Context and Orientation

#5 defines the current architecture: upstream Elixir/OTP, GitHub adapter,
upstream scheduler/Codex protocol/configuration/dashboard, one configured
worker, and upstream-only recovery semantics. It excludes Prefect wrappers,
custom Terra/Astra routing, custom Symphony SQLite history, SMTP, and a custom
concurrency framework.

Child evidence and commits:

- #39: `560964f` plus dashboard evidence comment `5976416984`.
- #40: real #42 worker proof and restart evidence comment `5976587000`.
- #41: `deb96fd`, 36 canonical tests, upstream smoke, evidence `5976622386`.
- #13: `241525d`, copied-project dual-target regression and upstream smoke,
  evidence `5976641958`.
- #16: `aec8375`, lightweight planning guidance and canonical checks, evidence
  `5976656964`.

The source now retains `WORKFLOW.md` and the upstream installer/launcher. The
former Python scheduler package, tests, CLI, SQLite, notifier, and routing code
are absent. `scripts/bootstrap_template.py` changes both the user-directed
target and upstream workflow tracker target in a copied project.

## Plan of Work

Verify the parent’s criteria directly from the child Issue comments, local
commit log, source reference audit, copied-project regression, canonical
verification results, and #40’s actual upstream endpoint transcript. Confirm
that #39–#41/#13/#16 remain open. Record publication accurately: `fef8599` and
its predecessors are on `origin/main`; later child commits are local and must
not be pushed without new authorization.

Post a concise #5 matrix listing each requirement, evidence, status, and limit.
The remaining work is the separately ordered #44 retrospective followed by #45
human final review. No runtime process starts, label changes, dispatch,
integration of #42's proposal, push, merge, deployment, or Issue closure occurs
as part of parent acceptance.

## Concrete Steps

From `/home/chris/template`:

    gh issue view 5 --repo successbycs/template --json body,comments,state
    gh issue view 39 --repo successbycs/template --json state,comments
    gh issue view 40 --repo successbycs/template --json state,comments
    gh issue view 41 --repo successbycs/template --json state,comments
    gh issue view 13 --repo successbycs/template --json state,comments
    gh issue view 16 --repo successbycs/template --json state,comments
    git log --oneline -12
    rg -n 'app_template\.symphony|app-template symphony|SYMPHONY_SMTP' src tests scripts

Expected result: each child is open with a durable handoff, current source has
no duplicate runtime, and the documented child commit/evidence chain exists.

## Validation and Acceptance

| Parent requirement | Evidence | Status |
| --- | --- | --- |
| Pinned upstream/dashboard/GitHub connectivity | #39 comment `5976416984`, `560964f` | Passed |
| Real code-changing scheduler task and restart | #40 comment `5976587000`, #42 workspace | Passed |
| Only upstream coding runtime remains | #41 comment `5976622386`, `deb96fd` | Passed |
| Copied-project setup/operator guide | #13 comment `5976641958`, `241525d` | Passed |
| Lightweight planning aligned upstream | #16 comment `5976656964`, `aec8375` | Passed |
| Human review record | GitHub Issue state | Passed after #39/#40 reopened; all five remain open |
| Publication authority | `origin/main` and local log | Partial by design: commits after `fef8599` are local, not pushed without new user approval |

## Idempotence and Recovery

The audit and Issue comment are repeatable. Reopening an accidentally closed
review record is safe and preserves comments. The Git commit is a durable audit
checkpoint and can be reverted if its factual record needs correction. Do not
use a parent acceptance comment to claim task dispatch, merge, deployment, or
publication authority.

## Artifacts and Notes

The durable outputs are this plan, the #5 comment, the child Issue comments,
and their local commits. The earlier historical programme plan
`2026-10-04-complete-symphony-setup-programme.md` describes the retired custom
runtime sequence and is historical, not the current parent contract.

## Interfaces and Dependencies

No interface changes. #5 has five completed evidence children and now gates
only #44 retrospective sequencing. #45 remains the final human review beneath
#44. #43 is explicitly deferred host-service hardening outside this milestone.
