# Reconcile the ShortList MVP 1 delivery path

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Turn the reviewed ShortList Issue hierarchy into an honest, dependency-ordered
MVP 1 path: free inbound assessment and report delivery first; paid assessment
and outbound cohort work later. A product owner can inspect GitHub and see
which work is human-led, which is a future bounded Codex/Symphony candidate,
and what remains unresolved before implementation.

## Progress

- [x] (2026-10-04 11:20Z) Completed Astra's read-only live review of the 26
  open Issues, native hierarchy, Project state, and upstream dispatch state.
- [x] (2026-10-04 11:43Z) Reconciled the candidate and Discovery/Build Issue
  wording with recorded owner decisions; retained unresolved #21/#22 matters
  as open questions.
- [x] (2026-10-04 11:46Z) Created and nested #27 (free PDF delivery) and #28
  (website experience acceptance); isolated #12 as deferred MVP 2 work.
- [x] (2026-10-04 11:51Z) Added the evidenced native GitHub dependency graph
  and corrected Issue scopes, non-goals, and readiness limits.
- [x] (2026-10-04 11:40Z) Reconciled Symphony operator guidance and V1
  backport notes without enabling dispatch or changing `WORKFLOW.md` admission.
- [x] (2026-10-04 12:03Z) Verified the live hierarchy/dependency graph and
  recorded the decision/handoff in #17; all Issues remain open and no
  `symphony:ready` label was added.

## Surprises & Discoveries

- Observation: Parent/child Issue nesting is correct, but native `blockedBy`
  dependency relationships are empty for all current Issues.
  Evidence: Astra live GitHub review on 2026-10-04.
- Observation: Current MVP 1 path is contaminated by paid MVP 2 Issue #12:
  #13 and #14 name it as a prerequisite, and #14 requires paid-job testing.
  Evidence: Issue bodies inspected by Astra on 2026-10-04.
- Observation: The MVP candidate currently treats Auckland as a hard exclusion,
  while the recorded owner decision says Auckland is an initial focus only.
  Evidence: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` and Issue #17.
- Observation: GitHub's supported `addBlockedBy` GraphQL mutation provides
  native, reviewable dependency edges; the CLI Issue editor provides native
  sub-Issue placement but not dependency editing.
  Evidence: GitHub schema query and successful mutation on 2026-10-04.
- Observation: The first bulk dependency mutation used #25's node ID for the
  final two #26 relationships. Verification exposed the mismatch; those two
  relationships were removed and correctly reattached to #26 before handoff.
  Evidence: live `blockedBy` query on 2026-10-04.

## Decision Log

- Decision: Preserve the user-approved, human-led #21/#22 decisions as open
  work rather than filling gaps with agent assumptions.
  Rationale: Task restructuring does not authorize commercial, privacy, or
  service-policy decisions.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Treat paid reports, Stripe, and outbound cohort activity as work
  outside the shortest MVP 1 inbound path.
  Rationale: MVP 1 validates free inbound value and email/report delivery;
  paid conversion is MVP 2 and outreach is later controlled learning.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: The product owner defines the customer-visible search terminology;
  #23 supplies evidence about the selected capability.
  Rationale: Product terminology is a product-owner decision, not an agent
  restriction.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.

## Outcomes & Retrospective

The reviewed delivery path is now a native GitHub dependency graph with two
missing work packets added: #27 owns MVP 1 free PDF delivery and #28 owns the
public website experience/visual acceptance. #12 is clearly deferred MVP 2
work, and it no longer blocks the free inbound path. The candidate records that
the product owner controls customer-facing terminology. The operator
guide now points to the copied project's configured tracker target, while the
upstream `symphony:ready` gate remains unchanged. All work is intentionally
open for human review.

## Context and Orientation

GitHub Issue #17 is the Discovery parent; #18 is Design & Feasibility; #19 is
Build & Verify; #20 is Release & Learn. Current requirement decisions live in
`docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`; the canonical
`docs/product/REQUIREMENTS.md` remains an intentionally stale earlier draft.

Relevant current children are #21/#22 under #1 (requirements), #23 under #5
(model/search benchmark), #24 under #6 (security/data architecture), #25 under
#7 (PDF evaluation), and #26 under #16 (later outreach protocol). Upstream
Symphony's `WORKFLOW.md` retains the deliberate `symphony:ready` label gate and
one-worker setting. The local operator guide must describe this copied
repository rather than the original template target.

## Plan of Work

First, amend the candidate and relevant Issue descriptions to match approved
MVP 1 direction: Auckland is an initial focus, not a rejection rule; MVP 1 is
free inbound assessment with email/PDF delivery; payment is MVP 2. Preserve
unresolved entitlement, retry, recipient-access, provider, and budget details
for #21/#22 and Design rather than choosing them.

Second, add two narrowly scoped native child Issues: one for approved website
experience/visual acceptance during Design, and one for the implementation of
Minimum Assessment PDF generation, storage, attachment delivery, bounded
retries, timer, and notifications during Build. Reposition #12 as explicit MVP
2 paid workflow. Rescope #13 and #14 to MVP 1 minimum privacy/support and free
inbound verification.

Third, use GitHub's supported native dependency capability to encode the
shortest path. Do not fabricate dependencies that are merely sequencing
preferences. Ensure every future Symphony candidate is marked as not-ready in
its body unless its dependencies, scope, code packets, verification, and human
authorization are complete.

Finally, update `docs/guides/SYMPHONY_OPERATOR.md` and
`docs/product/BACKPORT_CANDIDATES.md` to keep the upstream admission rule and
explain the copied-project target. Do not modify `WORKFLOW.md`, add labels,
start Symphony, contact customers, or configure providers.

## Concrete Steps

From `/home/chris/ShortList`:

    gh issue list --repo successbycs/ShortList --state open --limit 100
    gh issue view 1 --repo successbycs/ShortList --comments
    git diff --check
    python3 scripts/check_markdown_links.py

Then inspect native parent and dependency state through GitHub API/CLI after
the writes. Expected outcome: correct parent/child placement, explicit native
dependencies only where evidenced, all Issues open, and no `symphony:ready`
label.

## Validation and Acceptance

- MVP 1 has no dependency on #12 paid workflow or #26 outreach protocol.
- #14 verifies free inbound delivery and its real failure/timeout paths, not
  payment.
- A discrete build Issue owns free PDF delivery.
- A discrete Design Issue owns website visual/experience acceptance.
- #21/#22 remain human-led and unresolved decisions remain visible.
- Native dependencies represent the agreed path and are observable in GitHub.
- Symphony operator documentation accurately names the copied-project setup,
  preserves `symphony:ready`, and does not claim dispatch is enabled.
- No deployment, provider configuration, customer outreach, payment, or
  Symphony dispatch occurs.

## Idempotence and Recovery

Documentation and Issue-body edits are repeatable. Before creating a child
Issue, verify that an equivalent task does not already exist. If a native
dependency is wrong, remove only that relationship after confirming its exact
parent/child IDs; never close/delete Issues to repair structure. Keep all
changes open for human review.

## Artifacts and Notes

- Astra review recorded in GitHub Issues #1 and #17.
- Current hierarchy includes #21–#26 as native children.
- This plan uses no secrets and no live external product service.

## Interfaces and Dependencies

Changed external records are GitHub Issue bodies, native sub-Issue/dependency
relationships, and Project membership for newly created Issues. Changed local
documents are the MVP candidate, Symphony operator guide, V1 backport record,
and this plan. `WORKFLOW.md` remains unchanged; its `symphony:ready` gate is
retained.
