# Alert Chris when evidence is insufficient

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Make the MVP 1 insufficient-evidence outcome visible to Chris through a private Discord alert while keeping the visitor journey automated and honest. After this documentation change, a future implementation has one clear trigger, privacy boundary, and test expectation instead of treating a limited report as an unnoticed outcome.

## Progress

- [x] (2026-10-05 00:00Z) Inspected the existing failure, delivery escalation, safe-assessment, and recovery-task contracts.
- [x] (2026-10-05 00:00Z) Recorded the insufficient-evidence Discord-alert requirement in the canonical requirements, detailed candidate, contracts, safety design, delivery plan, PDF standard, and illustrative report source.
- [x] (2026-10-05 00:00Z) Validated, committed/pushed the design decision as `afddfcf`, and handed it to Issue #13 without starting the blocked implementation.

## Surprises & Discoveries

- Observation: Existing Discord alerts apply only when a report has not received email-provider acceptance by the two-hour delivery deadline.
  Evidence: `docs/product/REQUIREMENTS.md` requirement `MVP1-PDF-004` and `docs/product/CONTRACTS.md` delivery state contract, inspected 2026-10-05.

## Decision Log

- Decision: A final `evidence_insufficient` assessment outcome generates one private, privacy-minimised Discord alert for Chris.
  Rationale: Chris needs visibility of genuine evidence gaps, while the visitor still receives a complete automated and non-promissory result.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: The alert is internal operational behaviour and is not displayed in the customer PDF.
  Rationale: A customer should not be led to expect manual preparation or recovery; the report remains focused on their honest outcome and next step.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.

## Outcomes & Retrospective

The design/requirement decision was delivered and handed off in [Issue #13](https://github.com/successbycs/ShortList/issues/13#issuecomment-5986199144). Discord is not configured, no alert is sent, and the live implementation remains blocked behind Issue #13's dependencies.

## Context and Orientation

`docs/product/REQUIREMENTS.md` is the MVP 1 requirement baseline and `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` preserves the detailed acceptance scenario. `docs/product/CONTRACTS.md` defines stored assessment and failure records. `docs/product/SAFE_ASSESSMENT_DESIGN.md` defines safe failure handling and private alert boundaries. `docs/product/DELIVERY_PLAN.md` assigns the eventual recovery implementation to Issue #13, which remains blocked by #11 and #27.

`evidence_insufficient` means the final safe assessment outcome did not contain enough public website evidence to support a meaningful result. It differs from a temporary report-delivery failure: no recipient or email provider need be involved. The new alert must therefore be assessment-run scoped, happen once after the final outcome is stored, and contain no report content, credential, raw IP, or recipient information.

## Plan of Work

Add `MVP1-FAIL-002` and `M1-AC-06a` to make the alert and its observable acceptance evidence explicit. Add an `Operator alert v1` contract with the minimum safe fields and idempotency rule. Extend the safety failure matrix and delivery plan so the future #13 implementation must send/record one alert but does not turn the outcome into manual fulfilment.

Update the limited-evidence mockup HTML with a non-rendered implementation note, and its linked visual standard with the same boundary. The customer-facing PDF itself remains unchanged: an internal alert is not a customer promise.

After validation, commit/push the documentation and post a concise `Decision` comment to #13. Do not change #13's Project status, apply a queue label, configure Discord, or send a real alert because its implementation dependencies remain unmet.

## Concrete Steps

From `/home/chris/ShortList`:

1. Update the canonical requirement, contracts, safety design, delivery plan, and example source.
2. Run `git diff --check`, search the touched documents for `evidence_insufficient` and `Discord`, and regenerate the illustrative PDF only if its visible design changes.
3. Inspect the diff; commit and push the documentation-only decision.
4. Re-read Issue #13 and post an owner-decision handoff with the implementation boundary and dependencies.

Actual result: `git diff --check` passed; `afddfcf` was pushed to `origin/main`; and the decision handoff was posted on Issue #13 on 2026-10-05.

## Validation and Acceptance

The decision is documented correctly when:

- a final `evidence_insufficient` outcome has one named alert trigger and no duplicate-alert ambiguity;
- the alert contains only an assessment ID, normalised public domain, UTC time, safe reason code, and private operational-record reference;
- the visitor outcome stays automated and makes no manual-completion promise;
- the future implementation path is #13 after #11 and #27; and
- the report example remains explicitly fictional and contains no customer-visible internal alert claim.

No live Discord event, provider configuration, alert retry policy, or customer delivery is claimed by this plan.

## Idempotence and Recovery

Documentation edits are repeatable. A future service must make alert generation idempotent per assessment/run and record an alert delivery outcome without re-running the assessment. If Discord is unavailable, record the internal alert failure without changing the visitor-facing assessment result or exposing internal error details.

## Artifacts and Notes

- Requirements: `docs/product/REQUIREMENTS.md`.
- Detailed scenario: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`.
- Contracts: `docs/product/CONTRACTS.md`.
- Safety design: `docs/product/SAFE_ASSESSMENT_DESIGN.md`.
- Delivery order: `docs/product/DELIVERY_PLAN.md`.
- Illustrative source: `docs/product/design/mockups/2026-10-05-minimum-assessment-limited-v1.html`.
- Future implementation: `https://github.com/successbycs/ShortList/issues/13`.

## Interfaces and Dependencies

No runtime interface changes now. A future #13 implementation adds an internal alert adapter with an idempotent operation conceptually equivalent to `send_insufficient_evidence_alert(assessment_id, normalised_domain, occurred_at_utc, reason_code, operational_record_ref)`. Its Discord credential and webhook/configuration remain server-side, unselected, and outside this documentation task.
