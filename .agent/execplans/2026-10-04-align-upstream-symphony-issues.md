# Align the upstream Symphony delivery queue

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Replace the obsolete custom-runtime backlog with an executable upstream integration sequence. Chris explicitly authorized Issue modifications, milestone and dependency changes, nesting, and closure of deferred or unnecessary work. This task changes planning records only.

## Progress

- [x] Inspected all seven open Issues, repository target and Set-up milestone.
- [x] Created #39 integration, #40 task/restart proof, and #41 retirement; revised #5/#13/#16/#17/#18 and the Set-up milestone, closed #21/#24 not planned and reconciled native links.
- [x] Audited native dependencies and sub-issue relationships for all 41 Issues. All eight open Issues match the intended graph and Set-up milestone; no dependency cycles exist. #39 alone has no prerequisites.

## Surprises & Discoveries

The open queue still requires custom Terra/Astra routing and concurrency gates, although the owner has selected upstream behaviour. Earlier closed demonstration Issues concern the old Python runtime.

## Decision Log

- Decision: Retain Set-up as the release milestone and #5 as delivery parent; make #17 the subsequent retrospective parent and #18 its final human-review child.
  Rationale: A delivery parent must not depend on a retrospective child that itself waits for parent acceptance.
  Date/Author: 2026-10-04 / Codex
- Decision: Close #21 and #24 as not planned, preserving incident and design history; narrow #16 to documentation.
  Rationale: The owner explicitly deferred email and bespoke concurrency qualification and requested closure of deferred tasks.
  Date/Author: 2026-10-04 / Chris and Codex

## Outcomes & Retrospective

External reconciliation is complete. The read-back audit passed for all 41 Issues; eight remain open in Set-up. Markdown links and whitespace checks passed. No runtime implementation was performed. Historical closed Issue evidence remains intact, and prior active bodies were preserved in comments before replacement.

## Context and Orientation

The target is successbycs/template, verified using pyproject.toml and origin. Existing active Issues are #5, #13, #16, #17, #18, #21 and #24. The milestone is Set-up (1). Historical closed work remains closed. Existing unrelated worktree edits must remain intact.

## Plan of Work

Create integration, real-task/restart proof, and duplicate-runtime retirement Issues. Sequence them, followed by #13 documentation and #16 lightweight policy. #5 waits for delivery evidence; #17 waits for #5 and #18 waits for #17. Use native GitHub dependency and sub-issue relationships as well as explicit body references. Remove deferred tasks from the active milestone. Preserve historical closed Issue evidence and do not change labels.

## Concrete Steps

Use gh issue/API calls with the explicit repository target. Re-read each Issue and verify target before writes. Read milestone and all active Issue bodies, dependencies and parents after mutation. Inspect historical Issue relationships for dependencies on retired tasks.

## Validation and Acceptance

Every open Issue has a clear outcome, Set-up membership and correct parent or intentional root status. Only upstream integration is initially executable. Native dependencies match body contracts and have no cycles. #21/#24 are closed not planned. #17 follows delivery acceptance and #18 comes last. Run the local Markdown link checker.

## Idempotence and Recovery

Reuse matching new Issue titles on retry. Add only missing links and remove only superseded links. Issue edits and not-planned closures are reversible; preserve previous scope in comments when revising existing records. No labels, source runtime, pushes or deployments change.

## Artifacts and Notes

Verified delivery sequence: #39 -> #40 -> #41 -> #13 -> #16 -> #5 delivery acceptance -> #17 final retrospective -> #18 human review.

Delivery children #39/#40/#41/#13/#16 belong to #5. #17 is a separate root with #18 as its child. #5 depends explicitly on all five delivery children; #17 depends on #5, and #18 depends on #17. #21 and #24 are closed with state_reason not_planned, no milestone and no remaining blocking prerequisites. Set-up (milestone 1) describes upstream-only scope and this order. The one dedicated code-changing test child will be created under #40 when its exact task is defined during execution; no placeholder task was dispatched.

Read-back commands used gh issue list --state all --limit 100 and the REST dependencies/blocked_by and sub_issues endpoints for all 41 Issues. Assertions verified the entire active Issue set, exact prerequisites, parents, milestone membership, closure reasons and acyclic dependency graph. Local validation: .venv/bin/python scripts/check_markdown_links.py returned Markdown links: passed; git diff --check returned no errors.

## Interfaces and Dependencies

GitHub Issues REST endpoints provide milestones, sub-issues and blocked-by dependencies. Local guidance remains docs/harness/GITHUB_ISSUE_WORKFLOW.md; this explicit owner request authorizes the requested closures.
