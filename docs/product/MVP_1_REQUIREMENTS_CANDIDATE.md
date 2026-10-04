# ShortList MVP 1 — Requirements Candidate

**Status:** detailed decision record supporting the canonical review draft in
[`REQUIREMENTS.md`](REQUIREMENTS.md) | **Owner:** Chris / SuccessByCS |
**Created:** 2026-10-04

This is the proposed MVP 1 scope for ShortList. It is based on the discovery
records and current owner Q&A. It is not implementation authority, a public
offer, an approved price, or a promise that a provider capability exists.

## 1. What MVP 1 is proving

MVP 1 tests whether a small-business owner will:

1. enter a public business domain;
2. receive immediate, automated, useful evidence about how the business appears
   to customers and the selected, defined AI-search test; and
3. provide an email address to receive a free Minimum ShortList Assessment.

It does **not** test payment conversion yet. The paid Basic Assessment and
Stripe payment are MVP 2. Consulting is a potential MVP 3 offer.

Validation runs in cohorts of **10 eligible businesses**. Each cohort is
reviewed before the next begins, so the product owner can inspect completion,
email-capture, usefulness, failure, cost, and abuse evidence before widening
the sample or moving to the next vertical. The numerical success threshold is
still to be agreed; a cohort of ten is the unit of learning, not proof of a
market by itself.

## 2. Customer and scope

The intended audience is small businesses. **Auckland is the initial
validation focus, not a public eligibility exclusion.** The initial cohort is
**10 Auckland lawn-mowing
businesses**. This is the first, narrow subcohort within landscaping and garden
maintenance. After it has been reviewed, the planned validation sequence is:

1. Further Auckland landscaping and garden-maintenance businesses if the
   first lawn-mowing cohort supports it.
2. Auckland exterior-cleaning businesses, including house washing, roof
   washing, gutter cleaning, and pressure washing.
3. Auckland residential painters, including interior and exterior painting.

These are deliberate validation cohorts, not a claim that every Auckland
business type is supported from day one. If the public website does not provide
enough evidence that the business serves Auckland and belongs to the active
cohort, the system must state that eligibility cannot be determined rather than
presenting an Auckland-specific assessment as fact.

The product must not claim a permanent, universal, official ChatGPT/OpenAI, or
provider rank. It may show the observed order returned by one precisely defined
AI-search test at a stated date and time. #23 must establish the actual
capability and the product owner approves the public terminology.

### 2.1 Pilot recruitment and feedback

The first cohort is recruited to test interest in the Minimum ShortList
Assessment and gather feedback. An email that promotes even a free assessment
is potentially a commercial electronic message in New Zealand. The pilot must
not send an unsolicited commercial email merely because an address is public
or has been collected from a website.

ShortList has two distinct acquisition channels:

1. **Inbound self-service:** a business owner finds the live website, submits
   their own domain, sees the teaser, and elects to provide an email for the
   requested free assessment.
2. **Pilot outreach:** a business is approached for feedback and receives any
   commercial email only after a recorded consent basis exists.

The first delivery priority is the live self-service website. Pilot outreach
is a separate, later activity and must not delay the inbound journey.

Before any recruitment or report email is sent, the pilot must have a recorded
lawful consent basis for that address. Safe candidate channels are an existing
consented contact, a referral that establishes consent, an inbound opt-in, or
a non-email conversation (for example a phone call) in which the business asks
to receive the assessment by email. The exact channel and consent wording must
be approved before outreach begins.

For every outreach candidate and recipient, retain the business/domain,
contact source, consent basis and evidence, consent time, message/report status,
feedback request/outcome, and any do-not-contact/unsubscribe status. Every
commercial email must accurately identify the sender and provide a functional,
free unsubscribe route. An unsubscribe must suppress future commercial email
within the applicable timeframe.

## 3. MVP 1 customer journey

```text
Public domain
    ↓
Automated website review
    ↓
Immediate teaser, including one dated AI-search test
    ↓
Email capture after value is shown
    ↓
Free Minimum ShortList Assessment by email
    ↓
Future Basic Assessment offer; no payment in MVP 1
```

### 3.1 Domain entry

The first page asks only for a public website/domain and provides a `Check my
website` action. It does not request an email before showing value. The MVP
initially reports Auckland context where the website evidence and a maintained,
deterministic suburb reference dataset support it—not an AI guess, a postcode
shortcut, or ad-hoc free text. Each assessment records the matched suburb
(where evidenced), matching outcome, and dataset version. A site that serves
another region is not rejected solely for that reason; the result must state
honestly when Auckland context cannot be determined.

The system must validate the input before any fetch, search, or customer-record
creation. Incorrectly formatted domain names are rejected with a clear message.
The system also refuses private/internal targets, limits unsafe redirects, and
applies layered abuse and cost controls. Those controls must include Cloudflare
edge DDoS/WAF protection where available, a server-validated bot check on the
form, and a server-enforced request limit keyed to the submitting IP address as
well as the normalised domain. The email entitlement does not control the
pre-email teaser cost: those pre-admission controls apply before any costly
work. The MVP 1 free entitlement is **three requested Minimum Assessment report
deliveries per normalised email address for the lifetime of MVP 1**. A request
uses an allowance when a syntactically valid email address asks the service to
deliver a report; it is not a daily allowance. A system delivery failure is
handled by the report-delivery policy and does not require a second allowance.
Chris's approved internal test email address is exempt only from this
entitlement. The IP limit and exact pre-admission thresholds remain to be
approved.

### 3.2 Business record and assessment run

Every accepted, syntactically valid submission must be stored. Rejected
malformed input may be retained only as a non-customer validation/rate-limit
event, subject to the approved privacy policy.

- A **customer record** represents a normalised primary domain. The normalised
  domain is the unique field for customer records: no two customer records may
  have the same normalised domain.
- An **assessment run** represents one dated attempt to assess that domain.
- A **recipient record** represents one normalised email address requesting a
  report. Its report-delivery consent, optional marketing consent, attribution,
  entitlement use, delivery events, and support events are private to that
  recipient.
- A customer may have multiple assessment runs and recipients over time.

The domain uniquely identifies the customer record, but it is never an identity
or report-access key. A recipient may request a public domain already requested
by another recipient, subject to their own entitlement; that request must never
reveal the earlier recipient, consent, attribution, report, or delivery state.

### 3.2.1 Visitor and abuse-event record

Use Cloudflare Web Analytics for free, privacy-first aggregate page and
referrer measurement. It is not sufficient for assessment attribution because
it does not capture UTM query parameters or custom conversion events. The
product must therefore store a small first-party attribution record as part of
its normal application data—not a separate analytics application.

On the visitor's first landing page, capture the landing path, HTTP referrer
where supplied, and recognised UTM fields (`utm_source`, `utm_medium`,
`utm_campaign`, `utm_term`, and `utm_content`). Preserve that attribution
through the domain and email journey, then link it to the assessment run and
customer record when they are created. Do not accept arbitrary query parameters
as analytics data.

The product also records lightweight visitor events for page visit, form view,
validation failure, bot-check result, submission, rate-limit decision, and
email-capture outcome. It must use a pseudonymous visitor identifier and a
privacy-minimised representation of the source IP address; raw IP retention,
retention period, and consent wording require approval. This is for conversion
measurement, abuse protection, and support diagnosis—not customer profiling or
advertising.

### 3.2.2 Time, AI cost, and secret boundaries

All machine timestamps are stored in UTC using a standard unambiguous format
(ISO 8601 with `Z`). Every customer-facing report, email, and operator view
converts them to Pacific/Auckland time, including daylight-saving changes.

Every AI request has approved maximum input and output token limits, a timeout,
and a per-assessment cost ceiling. The system records usage and a limit-exceeded
outcome without exposing provider responses or secrets unnecessarily.

Neither the domain nor email form may expose an AI-provider API key, backend
credential, or any access to Codex. The browser sends only the minimum form
data to a controlled server endpoint. Provider credentials remain server-side
secrets, are never placed in browser code or reports, and are never returned in
an error, log, or API response. Codex is not an application dependency or a
customer-accessible capability.

### 3.3 Automated website review

For an accessible public site, the system produces a structured assessment with:

- business name;
- apparent services/business type;
- apparent Auckland service area or a statement that this cannot be determined;
- plain-language website summary;
- up to three likely buyer situations/ICPs, each marked as an inference and
  supported by page-level website evidence;
- observed evidence of reviews, projects/case studies, owner/team identity,
  locations, contact details, FAQs, pricing/quote guidance, and
  credentials/memberships; and
- a small number of evidence-based strengths and opportunities.

The product must not invent demographic personas, missing website content, or
customer outcomes. A buyer situation is a hypothesis based on the website, not
a verified fact about the business's customers.

### 3.4 Dated AI-search teaser

Each successful free assessment runs **one** live, defined AI-search test: an
Auckland-wide question based on the evidence-supported business type. For
example: “What are the top three lawn-mowing companies in Auckland today?”
Lawn mowing is illustrative only; the question changes with business type.
Suburb-level, buyer-situation, and other segmented comparisons belong to the
future paid Basic Assessment, not the free MVP 1 result. **OpenAI GPT-6 Luna is
the selected MVP 1 model.** Its search configuration remains an implementation
decision; the product owner decides the public name and terminology for the
test.

The immediate teaser and free email show:

- the exact Auckland-wide business-type question tested;
- the date and time in Pacific/Auckland;
- the model/search context and terminology approved by the product owner;
- the first three businesses surfaced in the returned response, in the observed
  order; and
- whether the submitted business was surfaced, how it was described, and
  whether the available evidence is insufficient to determine this reliably.

The customer-facing qualifier is:

> This is the order returned in this specific dated AI-search test. Results may
> vary with question wording, time, location, provider behaviour, and future
> search behaviour.

The system records the full tested question, response, returned ordering,
available citations/source URLs, model/search context, run timestamp, and
extraction result. If fewer than three businesses are returned, it reports the
actual number rather than inventing results.

### 3.5 Immediate preview

Before email capture, the visitor sees a concise teaser containing:

- how the website currently appears to describe the business;
- likely buyer situations/ICPs and the evidence supporting them;
- one Auckland-wide business-type question tested;
- the dated AI-search result summary; and
- a limited number of evidence-based strengths or opportunities.

The preview must be useful without becoming the entire free report. It must not
make a fixed ranking claim or promise enquiries/revenue.

### 3.6 Email capture and free Minimum ShortList Assessment

After the preview, the visitor may provide a work email to receive the free
Minimum ShortList Assessment.

Report-delivery consent and optional marketing consent must be separate:

- the email address is required for requested report delivery;
- marketing consent is optional, unchecked by default, and separately stored.

An email address may request up to three Minimum Assessment report deliveries
for the lifetime of MVP 1. When that entitlement is exhausted, MVP 1 directs
the requester to send feedback to the SuccessByCS support address; it does not
silently run a fourth free assessment. When MVP 2 is live, the equivalent state
may instead offer a clearly labelled Basic Assessment purchase route.

If the same normalised email requests the same normalised domain again, the
system does not run a new assessment and does not use another allowance. It may
automatically resend one retained PDF attachment if the original report remains
available and is no more than 30 days old. After that window, the customer is
given the support route; MVP 1 does not create a permanent report portal. This
repeat path must not disclose whether another recipient has requested the same
domain. The internal Chris test address is allowlisted for unlimited report
requests, but only through secret server-side configuration. It still passes
domain safety, bot, IP/domain rate, and overall spend controls, and it is never
shown in browser code, source control, or public messages.

The free email contains the domain, Auckland date/time, business summary, buyer
hypotheses and evidence, the dated AI-search test/observed ordering, a few
evidence-based opportunities, and a clear future Basic Assessment offer.

### 3.7 Professional PDF report

The Minimum ShortList Assessment is also retained as a polished PDF report.
The PDF must use an approved, professional visual template with readable
typography, consistent branding, accessible contrast, sensible page breaks,
and a clear distinction between observed evidence and inference. It must show
the assessment's Auckland-local display time while retaining the source UTC
timestamp in stored data. A representative set of reports must pass human
visual review before public release; a technically generated PDF alone is not
acceptance evidence.

The report-delivery timer starts when PDF/report generation is triggered and is
recorded in UTC. A delivery is customer-facing **sent** only when the email
provider accepts the PDF attachment for delivery; provider acceptance is not
proof that an inbox received or read it.

The same escalation policy applies to the MVP 1 Minimum Assessment PDF and the
future MVP 2 Basic Assessment:

1. Make one initial delivery attempt, then retry temporary generation, storage,
   or provider-handoff failures no more than three times, approximately 5, 20,
   and 60 minutes after the report trigger.
2. Do not retry an invalid/malformed email, attachment-size limit, unsafe or
   invalid stored report, or permanent provider rejection. Record its
   reason-coded terminal failure immediately.
3. At exactly two hours after the trigger, if the provider has not accepted the
   report, mark the delivery attempt `escalated`, attempt one plain-language
   apology/update email to the recipient, and send Chris a private Discord
   alert. Stop automatic retries for that attempt. The apology attempt may
   itself fail and must be recorded honestly.

The customer wording is: “We’re still preparing your ShortList assessment and
will update you shortly.” It must not promise manual repair or a completion
time. The private Discord alert contains only the run ID, domain, masked or
hashed recipient identifier, failure stage/reason code, retry count,
trigger/deadline timestamps, and a private operational-record identifier. It
must not include report/PDF content, credentials, or full customer data. This
alert is an operational notification, not a promise that normal delivery
requires manual work.

The one permitted resend of a retained report within 30 days is a new,
recipient-specific delivery attempt with its own timer, states, retries, and
escalation. It does not create a new assessment run or consume a new email
entitlement.

### 3.8 Website design and voice

The first website-design exploration will be created in Loveable.dev. It must
not result in a generic AI/SaaS template. The approved experience should feel
distinctive, quirky, warm, and credible to a small Auckland business owner,
with purposeful small-business iconography and light visual humour about the
internet, AI, and search. Humour must support clarity rather than obscure the
domain entry, assessment result, consent, price, or failure messages.

The design remains accessible and mobile-first: readable text, sufficient
contrast, keyboard-operable form controls, meaningful non-text alternatives,
and a complete usable journey without relying on animation or jokes. Loveable
is an authoring/prototyping choice, not a production-hosting or application
architecture decision.

## 4. Automated failure and insufficient-evidence journey

MVP 1 must remain automated. It must not depend on a person manually preparing
a report or rescuing a customer journey.

For an unreadable, unreachable, blocked, unsafe, sparse, or
insufficient-evidence website—or for a failed AI-search test—the system must:

1. state clearly what could not be assessed and why, where safe to disclose;
2. avoid invented business, ICP, gap, or ranking findings;
3. create a stored assessment-run status and machine-readable failure reason;
4. offer the visitor a route to the SuccessByCS support email; and
5. send an automated internal support notification if an address is configured.

The support route is not a promise of manual report completion. The support
email address, notification behaviour, and customer wording are decisions still
required before implementation.

The same recorded-failure and escalation journey applies when report generation,
PDF storage, email-provider acceptance, or email delivery cannot complete. The
product must record a machine-readable reason and retry state, avoid falsely
claiming delivery, and apply the two-hour apology/Discord escalation policy.

## 5. Data required for MVP 1

For each business and assessment run, retain only the data needed to provide,
support, measure, and improve the requested assessment:

- normalised domain and submitted URL;
- UTC timestamps in ISO 8601 format and the Auckland-local display time used;
- matched Auckland suburb, eligibility outcome, and suburb-reference-dataset
  version used for the assessment;
- customer record, assessment-run, and privacy-minimised visitor/abuse-event
  records, including bot-check and rate-limit outcomes;
- first-landing attribution: recognised UTM fields, landing path, and referrer
  when provided, plus the attribution version and capture time;
- business/site assessment and supporting page excerpts/URLs;
- inferred buyer situations and their evidence;
- tested AI-search question, complete response, ordered surfaced results,
  available citations/source URLs, model/search context, and outcome;
- email address when provided;
- free-entitlement counter, request timestamp, duplicate decision, resend
  decision, and allowlist decision for the normalised email address;
- separate report-delivery and marketing-consent records;
- private recipient/report-delivery records that link a recipient to only their
  own delivery events and stored attachment;
- pilot outreach contact source, consent basis/evidence, consent timestamp,
  delivery, feedback, and suppression/unsubscribe records where applicable;
- rate-limit events;
- assessment and email-delivery status; and
- recipient-specific delivery-attempt ID, state, safe reason code, retry
  number, UTC trigger/transition/deadline timestamps, provider-acceptance
  reference where available, and support/Discord-notification status where
  applicable.

The report document itself must be retained with its assessment run, including
the generated PDF, template version, generation timestamp, and integrity-safe
storage reference. A lightweight Cloudflare-oriented candidate is D1 for
relational customer, run, visitor, and metadata records plus R2 for the PDF
object; this is an implementation choice to be confirmed during design, not a
claim that those services are configured today.

Retention period, deletion scope, backup handling, and privacy notice wording
remain decisions required before public launch.

## 6. Explicit MVP 1 non-goals

MVP 1 does not include:

- Stripe checkout or a payment gateway;
- a fixed price or paid product promise;
- manually produced reports or manual review required for normal delivery;
- consulting delivery;
- automated website, Google Business Profile, or third-party profile changes;
- recurring monitoring;
- client login/accounts;
- a complex customer dashboard;
- multiple AI platforms; or
- a claim of an official, stable ChatGPT/OpenAI rank.

## 7. Candidate acceptance scenarios

| ID | Scenario | Required outcome |
| --- | --- | --- |
| M1-AC-01 | Owner submits a valid public Auckland small-business domain. | The system creates or reuses the one customer record for the normalised domain, stores an assessment run, and shows an automated, evidence-based preview before email capture. |
| M1-AC-02 | Website evidence supports a business type and Auckland context. | The system runs one dated Auckland-wide business-type AI-search test, records its complete provenance, and shows the actual surfaced order without claiming a universal rank. |
| M1-AC-03 | The AI-search test returns fewer than three identifiable businesses. | The product states the actual result and does not manufacture a top three. |
| M1-AC-04 | The submitted business is absent, mentioned, or described inaccurately. | The teaser states the observed outcome and cites/records the tested response. |
| M1-AC-05 | A visitor chooses to receive the free assessment without marketing consent. | The email is delivered or receives the defined delivery-failure escalation; no optional marketing consent is stored. |
| M1-AC-06 | Website analysis or search cannot complete. | The visitor receives an honest automated outcome, the run is stored with a reason, and a support route is offered without promising manual fulfilment. |
| M1-AC-07 | An email address has already used its three lifetime MVP 1 report requests. | The system does not run a fourth free assessment, records the entitlement decision, and shows the MVP 1 feedback route or the future MVP 2 Basic Assessment route when available. |
| M1-AC-07a | The same normalised email requests the same normalised domain again within 30 days. | The system does not create a new assessment run or consume another allowance; it may resend the retained recipient-specific PDF attachment without exposing other recipients. |
| M1-AC-07b | A different normalised email requests a domain already requested by someone else. | The request is evaluated against the new recipient's own allowance. The response, stored records, and delivered report do not disclose any earlier recipient, consent, attribution, report, or delivery state. |
| M1-AC-07c | A visitor repeats pre-email submissions or concurrent costly attempts. | Server-side bot, IP, domain, concurrency, spend, and bounded-fetch controls limit the work before an email entitlement could apply; each refusal is safely reason-coded. |
| M1-AC-08 | A site provides a service-area suburb. | The system determines eligibility from the versioned Auckland suburb dataset and records the match or an honest unable-to-determine outcome. |
| M1-AC-09 | Visitor enters an incorrectly formatted domain name. | The system rejects it before external processing or customer-record creation and explains the required format. |
| M1-AC-10 | One source IP repeatedly submits the form. | The bot check and server-side IP/domain limits prevent excessive processing, record the decision, and return a safe rate-limit response. |
| M1-AC-11 | A completed assessment is viewed by a customer. | Its stored machine timestamp is UTC ISO 8601; the teaser, email, and PDF show the equivalent Pacific/Auckland date and time. |
| M1-AC-12 | An AI request would exceed its approved token, timeout, or cost limit. | The system stops safely, records a machine-readable limit outcome, and does not expose credentials or internal detail. |
| M1-AC-13 | A free assessment report is generated. | The PDF and its versioned metadata are retained with the assessment run and meet the approved professional visual-template standard. |
| M1-AC-14 | A visitor arrives through a UTM-tagged link and completes an assessment. | The recognised first-landing UTM values, path, and referrer are retained with the resulting assessment/customer record; unknown query parameters are not stored as attribution data. |
| M1-AC-15 | A representative mobile and desktop visitor completes the MVP journey. | The approved Loveable design is recognisably ShortList rather than a generic template, uses purposeful small-business/search/AI visual references, and remains clear and accessible through submission, result, consent, and failure states. |
| M1-AC-16 | The 10-business lawn-mowing pilot recruits a company by email or sends it a report. | The recipient has recorded consent before the commercial email is sent; the sender is identified, a functional unsubscribe route is included, and the feedback outcome is retained. |
| M1-AC-17 | A business owner arrives at the live site and requests their own assessment. | They can complete the self-service domain, teaser, and opt-in email journey without pilot outreach or manual intervention. |
| M1-AC-18 | A triggered PDF report has not received provider acceptance within two hours. | The delivery attempt records its UTC trigger, transition/deadline timestamps, state, safe reason code, and retry count; it is marked `escalated`, one apology/update attempt is made, Chris receives the limited private Discord alert, retries stop, and the product does not falsely report inbox delivery. |
| M1-AC-18a | A temporary generation, storage, or provider-handoff failure occurs. | The system makes no more than three retries at approximately 5, 20, and 60 minutes after the trigger, retaining a reason-coded, recipient-specific delivery-attempt history. |
| M1-AC-18b | A malformed email, attachment-size limit, unsafe/invalid stored report, or permanent provider rejection occurs. | The system records an immediate terminal failure and does not retry indefinitely; any two-hour escalation/apology outcome is recorded honestly. |
| M1-AC-18c | A retained report is resent within the allowed 30-day window. | The resend is a new delivery attempt with its own timer and bounded retries; it does not create an assessment run or consume a new entitlement. |

## 8. Decisions still needed before requirements approval

1. For the selected OpenAI GPT-6 Luna model, what exact search configuration,
   location method, cost ceiling, timeout, and failure threshold are acceptable?
2. What counts as enough website evidence to generate a buyer question rather
   than issue an insufficient-evidence result?
3. What authoritative source and update owner define the versioned Auckland
   suburb reference dataset, including locality aliases and boundary changes?
4. What support email address, automated alert, privacy copy, retention period,
   and deletion path apply?
5. What constitutes MVP 1 success for each 10-business cohort: completed
   checks, email capture rate,
   qualitative value feedback, or a defined combination?
6. When MVP 2 begins, what pricing research must be complete before the Stripe
   Basic Assessment is offered?
7. What IP-rate limit and visitor-event retention period balance abuse control,
   conversion measurement, cost, and privacy?
8. Which product domain should be purchased, and which sending/support email
    address and mail domain should represent ShortList? These are separate
    decisions: a product web domain identifies the public service; a sending
    address is the authenticated origin for customer email.
9. What approved token, timeout, and per-assessment cost limits apply to the
    AI request?
10. What brand assets and visual acceptance examples define “beautiful and
    super-professional” for the PDF report?
11. What visual references, tone boundaries, and examples should the Loveable
    design use so that “quirky” remains credible for Auckland small-business
    owners?
12. Which consented recruitment channel and exact feedback question will be
    used for the first 10 lawn-mowing businesses?
