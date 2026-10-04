# Decide MVP 1 email entitlement and recipient access

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Turn product-owner agreement on free-report limits and recipient privacy into
testable MVP 1 requirements. A reviewer will be able to see how a visitor gets
a report, when the three-report allowance is used, how a duplicate request is
handled, and why a domain never grants access to another person's information.

## Progress

- [x] (2026-10-04 12:20Z) Reviewed #21 and the current candidate requirements.
- [x] (2026-10-04 12:25Z) Product owner accepted the proposed lifetime
  three-report entitlement, duplicate handling, 30-day resend rule, recipient
  isolation, and narrow internal test allowlist.
- [x] (2026-10-04 12:32Z) Updated the candidate and recorded the full Decision
  in #21; the Issue remains open for product-owner review.
- [x] (2026-10-04 12:36Z) `git diff --check` passed; the Markdown checker
  reported only pre-existing placeholder links in supplied discovery material.
  #21 was closed by the product owner after the decision record was added.

## Surprises & Discoveries

- Observation: The teaser precedes email capture, so an email entitlement alone
  cannot limit the cost of the pre-email assessment.
  Evidence: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` section 3 customer
  journey and existing IP/domain/bot control requirements.

## Decision Log

- Decision: A normalised email address receives three requested Minimum
  Assessment report deliveries for the lifetime of MVP 1; this is not a daily
  allowance.
  Rationale: It is an understandable, finite customer allowance and a simple
  cost-control boundary.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: A repeat request for the same normalised email and domain does not
  run a new assessment or consume an allowance; a retained report may be
  automatically resent once within 30 days.
  Rationale: It avoids unnecessary cost while supporting a customer who missed
  an attachment, without creating a permanent report portal.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Separate recipients may request the same public domain, but their
  consent, attribution, delivery status, and report access remain isolated.
  Rationale: A domain is a customer-record key, not an identity or access key.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.

## Outcomes & Retrospective

The agreed entitlement and access policy is recorded in the requirements
candidate and #21, which the product owner has closed. It gives #1 a concrete
requirements input while keeping #22's delivery-mechanism decisions separate.
The documentation has no whitespace errors; unchanged discovery source
placeholders remain the known repository-wide Markdown-check limitation.

## Context and Orientation

Issue #21 is a child of #1 and blocks the Discovery requirements baseline. The
candidate is the detailed MVP 1 requirements source at
`docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`; #21 is the concise, reviewable
decision record. There is no customer account or public report URL in MVP 1.
The related #22 owns delivery retry and escalation policy, not entitlement.

## Plan of Work

Update the candidate's domain-admission, customer-record, email-capture, data,
and acceptance-scenario sections with the agreed rules. Update #21's scope and
acceptance evidence, then add a Decision comment that links the candidate and
states the remaining external boundaries. Do not configure an email provider,
store the test email, run an assessment, or enable Symphony.

## Concrete Steps

From `/home/chris/ShortList`:

    git diff --check
    python3 scripts/check_markdown_links.py
    gh issue view 21 --repo successbycs/ShortList --comments

Expected result: no whitespace errors; known source-only Markdown placeholders
may remain; #21 stays open and has no `symphony:ready` label.

## Validation and Acceptance

- Requirements specify the entitlement trigger, allowance, duplicate rules,
  resend window, access isolation, and allowlist scope.
- Acceptance scenarios distinguish same-recipient repeat, different-recipient
  same-domain, allowance exhaustion, and pre-email abuse controls.
- #21 contains a durable Decision comment and remains open for human review.
- No provider, outreach, payment, deployment, or Symphony state changes.

## Idempotence and Recovery

Documentation and Issue-comment changes are safe to repeat. If the owner
changes a policy decision, replace the candidate wording and post a superseding
Decision comment; do not silently rewrite the historical comment. No external
customer data is created by this work.

## Artifacts and Notes

- Canonical detail: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`.
- Decision Issue: GitHub #21.
- Related delivery-policy Issue: GitHub #22.

## Interfaces and Dependencies

Future implementation needs a normalised-email entitlement record, a
per-recipient report-delivery record, and private server-side report storage.
The internal test allowlist must be supplied only through secret server-side
configuration; it never appears in browser code, source control, or public
responses.
