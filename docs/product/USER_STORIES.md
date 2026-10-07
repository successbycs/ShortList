# ShortList MVP 1 user stories

**Status:** review draft
**Owner:** Chris / SuccessByCS
**Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)

## Owner stories

### US-001 — Understand my public website

As a small-business owner, I want to submit my public domain and see a concise,
evidence-based teaser before sharing my email, so that I can decide whether a
fuller assessment is useful.

Acceptance examples: valid public domains progress; malformed/private/unsafe
targets refuse safely; findings distinguish observed evidence from inference.

### US-002 — Confirm my email and receive my assessment privately

As an owner who chooses to provide my email, I want to confirm or correct the
masked address before the fuller result is revealed and my Minimum Assessment
is sent as a private PDF attachment, so that I can review it without creating
an account.

Acceptance examples: delivery and marketing consent are separate; address
confirmation is not mailbox verification; another recipient cannot see my
report, consent, attribution, or delivery state.

### US-003 — Understand an uncertain or failed result

As an owner, I want honest wording when the website, AI-search test, or report
delivery cannot complete, so that I do not mistake uncertainty for a negative
claim about my business.

Acceptance examples: insufficient evidence is stated; no findings are
invented; report status never claims inbox receipt from provider acceptance.

### US-004 — Request a previously generated report again

As an owner who missed an attachment, I want one simple resend route for the
same domain and email, so that I do not spend another free request or trigger
unnecessary analysis.

Acceptance examples: within 30 days no new assessment is created; after that,
the support route is shown; no report portal is implied.

## Operator stories

### US-005 — Diagnose an automated failure safely

As the ShortList operator, I want reason-coded, recipient-private assessment,
address-confirmation, and delivery states, so that I can understand system health without exposing
customer content or credentials.

Acceptance examples: attempts have UTC state transitions and retry counts;
Discord alerts carry only the approved minimum operational detail.

### US-006 — Learn before widening the cohort

As the product owner, I want cohort-level evidence for completion, email
capture, usefulness, failure, cost, and abuse, so that I can decide whether to
widen beyond the initial ten businesses.

Acceptance examples: inbound measures are retained; outreach remains separate
and requires its own consent-gated protocol.
