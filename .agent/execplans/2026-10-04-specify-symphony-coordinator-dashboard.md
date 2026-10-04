# Specify the Symphony coordinator dashboard

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Define the product contract required before Symphony can safely allocate real
coding work to one worker and expose that lifecycle in a dashboard.

## Progress

- [x] (2026-10-04 04:42Z) Astra reviewed the current scheduler, runner, tracker, worktree, event-store, and #38 evidence path without making changes.
- [x] (2026-10-04 04:43Z) Added the coordinator/dashboard specification with admission, verification, ownership, recovery, single-worker capacity, and dashboard requirements.
- [x] (2026-10-04 04:44Z) Removed multi-worker allocation from the product contract at Chris's direction; effective capacity is permanently one.
- [x] (2026-10-04 04:46Z) Enforced the single-worker upper bound in typed workflow validation and added a regression test rejecting `max_concurrent_agents: 2`; focused workflow/scheduler tests passed 13 tests and Markdown links passed.
- [ ] Create a governed delivery Issue before implementation; this plan grants no runtime authority.

## Surprises & Discoveries

- Observation: #38 proved one direct no-change Codex turn, not coordinator allocation of meaningful work.
  Evidence: `.agent/execplans/2026-10-04-prove-single-worker-baseline.md` and Astra's 2026-10-04 review.
- Observation: Workers do not receive Issue acceptance criteria and completed turns are not verified against actual changes.
  Evidence: `src/app_template/symphony/scheduler.py` and `src/app_template/symphony/runner.py`.

## Decision Log

- Decision: Specify coordinator correctness before dashboard restoration.
  Rationale: A display of incomplete allocation state would create unsafe confidence.
  Date/Author: 2026-10-04 / Chris, Astra, and Codex

## Outcomes & Retrospective

The requirement is explicit; no code, configuration, service, Issue, or
dispatch state changed. Implementation remains unstarted pending a governed
delivery scope.

## Context and Orientation

The proposed contract is
`docs/specs/2026-10-04-symphony-coordinator-dashboard.md`. Existing scheduler,
runner, tracker, worktree, and event-store components are in
`src/app_template/symphony/`.

## Plan of Work

Create a governed delivery Issue. Implement a verified one-worker coordinator,
then durable ownership/recovery, then the dashboard. Do not restore UI first.

## Concrete Steps

From `/home/chris/template`, run:

    .venv/bin/python scripts/check_markdown_links.py

Expected: `Markdown links: passed`.

## Validation and Acceptance

This documentation milestone passes when it defines safe single-worker
allocation, dashboard limits, and the required operational proofs. It
does not claim any runnable capability.

## Idempotence and Recovery

Documentation is safe to revise or revert. It does not authorize dispatch,
GitHub mutation, worker execution, or a dashboard service.

## Artifacts and Notes

The specification and this plan are durable design records. Astra's review was
read-only.

## Interfaces and Dependencies

No interface changes occur in this milestone. Future interfaces require a
governed delivery plan after the coordinator safety contract is implemented.
