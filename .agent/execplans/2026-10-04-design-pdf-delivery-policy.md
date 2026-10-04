# Design the Minimum Assessment PDF delivery policy

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Define an honest, automated customer experience when a ShortList Minimum
Assessment PDF is generated and emailed. After this design work, a product
owner can approve clear customer wording and an engineer can implement a
bounded delivery state machine without guessing whether a report was delivered,
when to retry, or when Chris must be alerted.

## Progress

- [x] (2026-10-04 12:40Z) Inspected open GitHub Issue #22 and the existing
  PDF, entitlement, and two-hour escalation requirements candidate.
- [x] (2026-10-04 12:50Z) Defined the delivery states, terminal outcomes, and
  evidence fields in the candidate.
- [x] (2026-10-04 12:50Z) Product owner approved retry cadence, provider-
  acceptance boundary, customer wording, no-retry failures, and safe Discord
  alert content.
- [x] (2026-10-04 12:50Z) Added testable requirements and acceptance scenarios
  to the candidate; record the approved decision in #22 and leave it open for
  review.
- [ ] Validate documentation; do not configure or call external services.

## Surprises & Discoveries

- Observation: The candidate commits to a PDF attachment, a UTC trigger time,
  bounded retries, a two-hour apology/update email, and a private Discord
  alert, but does not define the retry count, cadence, delivery-complete
  definition, or message contents.
  Evidence: GitHub #22 and `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`,
  section 3.7.
- Observation: The repeat-request policy in #21 permits a retained attachment
  resend for 30 days, so retention/access boundaries must distinguish an
  original delivery attempt from a later resend attempt.
  Evidence: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`, section 3.6.

## Decision Log

- Decision: PDF attachment is the initial customer delivery method; no account
  or public report portal belongs in MVP 1.
  Rationale: Product-owner agreement recorded in #21/#22 scope.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: The MVP 1 and future MVP 2 report flows share the same escalation
  principle: UTC trigger time, bounded automatic retry, honest two-hour update,
  and private alert to Chris.
  Rationale: Product-owner agreement recorded in the requirements candidate.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Provider acceptance of the attachment is the sent boundary; one
  initial attempt and retries at approximately 5, 20, and 60 minutes are
  allowed for temporary failures. At two hours, stop retries, attempt one
  apology/update, and send a privacy-minimised Discord alert.
  Rationale: This is an observable, bounded policy that does not falsely claim
  inbox receipt or create an unbounded automated loop.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.

## Outcomes & Retrospective

The approved policy is now testable in the candidate: it distinguishes
provider acceptance from inbox receipt, bounds retries, records terminal
failures, and limits the two-hour escalation's data. This plan still does not
authorise email, Discord, storage, queue, provider, or production changes.

## Context and Orientation

GitHub #22 is a human-led Discovery child of #1. It defines policy only.
`docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` is the detailed source;
`docs/product/REQUIREMENTS.md` is an intentionally stale earlier draft and is
not to be promoted or edited incidentally. #21 is closed and supplies the
recipient/30-day resend boundary. #7 will define report/data contracts; #27
will implement PDF generation and delivery only after the requirements,
design, and delivery plan are approved.

Terms used by this plan:

- **report trigger:** the UTC instant at which the system starts generating the
  requested report and creates its delivery attempt.
- **provider acceptance:** the email provider accepted the hand-off request;
  it is not proof that the recipient inbox received or read the attachment.
- **delivery attempt:** one generation/storage/attachment/provider-hand-off
  cycle for one recipient and report version.
- **terminal outcome:** a final recorded status: accepted-for-delivery,
  temporarily failed and queued for retry, failed after retries, or not
  generated/stored safely.

## Plan of Work

First, specify a provider-independent state model in the requirements: report
triggered, generating, generated, stored, sending, provider accepted,
retrying, failed, and escalation sent. Each transition needs a UTC timestamp,
safe reason code, report/attachment version, recipient-specific delivery
attempt ID, and no exposed credentials or raw provider payloads.

Second, ask the product owner to approve the exact policy choices that cannot
be inferred: retry count/cadence inside two hours; whether provider acceptance
is the customer-facing success boundary; the behaviour for a hard-bounced or
invalid recipient; the customer apology/update wording; the Discord alert's
minimum safe fields; and whether a successful retry sends a second customer
message.

Third, update the candidate with the approved policy and scenarios covering
generation, storage, attachment, provider rejection, retry exhaustion,
two-hour escalation, recipient isolation, and 30-day resend. Add a concise
Decision comment to #22 that links the candidate. Do not choose an email or
Discord provider, create a webhook, send a message, or promise manual repair.

## Concrete Steps

From `/home/chris/ShortList`:

    gh issue view 22 --repo successbycs/ShortList --comments
    rg -n -C 3 "PDF|delivery|retry|two-hour|resend" \
      docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md
    git diff --check
    python3 scripts/check_markdown_links.py

Expected result: policy decisions and acceptance evidence are reviewable in
the candidate and #22; `git diff --check` succeeds. The Markdown checker may
continue to report the known placeholder links in the supplied discovery
`Workflow.md`; do not alter that historical source as part of this work.

## Validation and Acceptance

- A reviewer can determine exactly when the two-hour clock starts and which
  stored state proves that it has been met or exceeded.
- Every generation, storage, provider-acceptance, and delivery failure has an
  honest customer-visible outcome, safe reason code, bounded retry path, and
  terminal state.
- The policy never equates inbox delivery/read with provider acceptance unless
  an approved provider capability proves it.
- Discord receives only the approved minimum operational detail; recipients
  never receive private operational errors or another recipient's information.
- The same policy can be applied by future MVP 2 work without making MVP 2 a
  prerequisite for MVP 1.
- No external service, customer message, payment, or Symphony state changes.

## Idempotence and Recovery

This is documentation/policy work and is safe to repeat. If a product-owner
decision changes, retain the prior Issue comment as history and add a
superseding Decision comment; update the candidate explicitly. If a later
implementation fails, it must preserve the stored delivery attempt and reason
code for diagnosis rather than silently re-running an unbounded delivery loop.

## Artifacts and Notes

- Decision Issue: GitHub #22.
- Requirement source: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` sections
  3.6, 3.7, 4, 5, and M1-AC-05/M1-AC-18.
- Related closed policy: GitHub #21.
- Future implementation: GitHub #27.

## Interfaces and Dependencies

The future implementation requires provider-independent records for an
assessment run, report version, private recipient, delivery-attempt ID, UTC
trigger/transition timestamps, state, safe reason code, retry number,
provider-acceptance reference where available, escalation timestamp, and
notification status. It must never store a credential in these records or use
the customer-visible domain as a recipient access key.
