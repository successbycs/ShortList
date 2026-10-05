# Plan dependency-ordered ShortList MVP delivery

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #8 turns the approved requirements, SDD, contracts, safety design, and
website/PDF design work into small implementation packets that Symphony or a
user-directed Codex session can execute without deciding product policy. After
this work, every MVP 1 requirement has an owner, dependency, code scope,
verification, and admission state.

## Progress

- [x] (2026-10-05 01:40Z) Verified #7 is closed/Done, #8 is open, and moved
  #8 to In Progress.
- [x] (2026-10-05 01:42Z) Inspected the approved SDD, contracts, and safe
  assessment design; #25 and #28 remain parallel design inputs.
- [x] (2026-10-05 02:00Z) Added `docs/product/DELIVERY_PLAN.md` with feature
  mapping, dependency order, packet boundaries, verification, gates, and the
  observed #5 Symphony-admission limitation.
- [ ] Validate, push, and record #8 evidence without closing the Issue.

## Surprises & Discoveries

- Observation: #5 currently carries `symphony:ready` at the owner's request
  despite its stated #9 dependency and unscoped code packet.
  Evidence: GitHub #5 observed 2026-10-05.
- Observation: The implementation Issues exist but several still defer exact
  verification to #8.
  Evidence: GitHub #9, #10, #11, and #27 bodies.

## Decision Log

- Decision: Add `docs/product/DELIVERY_PLAN.md` as the canonical map from
  requirement/design to implementation Issue and verification.
  Rationale: The Issue list is an execution queue; the document explains the
  cross-cutting dependency and admission rationale without duplicating code.
  Date/Author: 2026-10-05 / Codex.

## Outcomes & Retrospective

Pending. Completion means implementation work is bounded and reviewable; it
does not mean customer-facing features are built or any provider is configured.

## Context and Orientation

MVP 1 needs a product foundation (#9), safe domain assessment/preview (#10),
AI-search evidence (#5), email/consent (#11), PDF generation/delivery (#27),
privacy/support (#13), and end-to-end verification (#14). #25 supplies the
PDF visual contract and #28 supplies website mockups; their human approvals
are inputs before the affected implementation packets execute. #5 is the
future Symphony worker task and must not be dispatched merely because a label
exists when its code packet/dependencies remain incomplete.

## Plan of Work

First map each MVP feature and requirement family to existing Issue(s), planned
code boundary, exact test type, and human/external boundary. Then reconcile
native dependency language in Issues so tasks form an executable order. Add a
`## Code packets` and `## Verification` section to each eligible implementation
Issue only where design decisions support exact scope; leave remaining owner
decisions explicit. Reconcile #5's admission label with upstream readiness
requirements and ask the owner before any removal if it is unsafe to retain.

## Concrete Steps

From `/home/chris/ShortList`: inspect open Issues, the delivery map, `git diff
--check`, and Markdown links. Use explicit `--repo successbycs/ShortList` for
every GitHub mutation. Expected: no label/change starts Symphony or contacts
an external provider.

## Validation and Acceptance

- Every MVP requirement maps to one or more Issues, exact acceptance evidence,
  and a dependency order.
- Each potential Symphony packet has no unresolved product decision in scope,
  lists code packets and verification, and satisfies readiness before label use.
- External boundaries remain unconfigured until separately authorised.

## Idempotence and Recovery

Documentation/Issue edits are reviewable and additive. Do not close Issues,
start Symphony, or alter labels without the explicit applicable authority. A
superseded issue scope is retained by a clear comment rather than erased.

## Artifacts and Notes

- Output: `docs/product/DELIVERY_PLAN.md` and scoped Issue updates.
- Inputs: `REQUIREMENTS.md`, `SDD.md`, `CONTRACTS.md`,
  `SAFE_ASSESSMENT_DESIGN.md`, #25, and #28.

## Interfaces and Dependencies

The plan defines work boundaries only. Future code packets will name exact
modules/endpoints/tests after the technology/foundation decision is approved;
this plan does not select runtime technologies or create source interfaces.
