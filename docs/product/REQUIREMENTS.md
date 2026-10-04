# ShortList MVP 1 requirements

**Status:** approved MVP 1 baseline (product-owner approval recorded in #1 and #2 on 2026-10-04)
**Owner:** Chris / SuccessByCS
**Last reconciled:** 2026-10-04
**Detailed decision record:** [MVP 1 requirements candidate](MVP_1_REQUIREMENTS_CANDIDATE.md)

## 1. Purpose and scope

ShortList helps a small-business owner understand how their public website
appears to customers and in one dated, defined AI-search test. The MVP 1
journey is automated: domain entry, evidence-based teaser, email capture after
value, and a free Minimum ShortList Assessment PDF attachment.

MVP 1 validates the free inbound journey. It does not implement payment,
Stripe, a paid Basic Assessment, consulting, recurring monitoring, customer
accounts, a complex dashboard, manual report fulfilment, or production launch.
Those are later decisions, not implied commitments.

Auckland is the initial validation focus. The first learning cohort is ten
Auckland lawn-mowing businesses; further landscaping/garden maintenance,
exterior cleaning, and residential painting are later cohorts. The live
inbound service does not reject a business solely because it serves another
region. It states honestly when Auckland context cannot be determined.

## 2. Requirement baseline

| ID | Requirement | Priority | Owner | Observable acceptance evidence |
| --- | --- | --- | --- |
| MVP1-PR-001 | The active product name is ShortList. Historical GEO Check and AI Shortlist names remain source-record terminology only. | Must | Product owner | Current product documents and public-copy drafts use ShortList consistently. |
| MVP1-JNY-001 | A visitor submits one public domain/website and sees useful assessment value before email capture. | Must | Product owner | A valid public-domain scenario produces the teaser before any email field is required. |
| MVP1-JNY-002 | The teaser and report use only evidence or clearly marked inference; they do not guarantee enquiries, revenue, a stable rank, or an official provider result. | Must | Product owner | Review of a representative output finds page-level evidence/provenance or an explicit inference label for each material finding. |
| MVP1-JNY-003 | Each successful assessment runs one defined, dated AI-search test based on the evidenced business type and may show the observed returned order. | Must | Product owner | Stored record contains question, response, ordering, available citations, timestamp, model/search context, and product-owner-approved customer terminology. |
| MVP1-JNY-004 | The teaser and report display Pacific/Auckland date/time while all stored machine times are UTC ISO 8601. | Must | Product owner | A test record shows UTC storage and correct Auckland display across daylight-saving boundaries. |
| MVP1-DOM-001 | Incorrectly formatted domains are rejected before fetch, search, or customer-record creation. Private/internal targets and unsafe redirects/DNS changes are refused safely. | Must | Technical design owner | Valid, malformed, private-target, redirect, and DNS-change cases have specified safe outcomes. |
| MVP1-DOM-002 | The service captures the business name, apparent services, available service-area evidence, page-based buyer hypotheses, trust evidence, strengths, and opportunities without inventing facts. | Must | Product owner | Representative output contains required fields and cites supporting page evidence or says evidence is insufficient. |
| MVP1-DOM-003 | Auckland context uses a deterministic, versioned suburb reference set where available; it is not inferred solely from free text or an AI guess. | Must | Product owner | An assessment records matched suburb/outcome and dataset version, or an honest unable-to-determine result. |
| MVP1-ABUSE-001 | Before and after email capture, server-side bot, IP, normalised-domain, concurrency, bounded-fetch, token, and spend controls prevent excessive or unsafe processing. | Must | Technical design owner | Repeated/concurrent costly-submission tests return reason-coded safe outcomes before unbounded processing. |
| MVP1-DATA-001 | A normalised domain uniquely identifies one customer record. Each assessment is a dated assessment run; domain identity never grants report or recipient access. | Must | Technical design owner | Duplicate-domain tests reuse the customer record but do not expose other recipients or prior private data. |
| MVP1-DATA-002 | A recipient record is private to one normalised email address and stores its report-delivery consent, optional marketing consent, attribution, entitlement use, delivery attempts, and support events. | Must | Technical design owner | Cross-recipient tests demonstrate isolation of consent, attribution, delivery status, stored PDF, and identity. |
| MVP1-EMAIL-001 | Report-delivery consent is separate from optional marketing consent. Marketing consent is optional, unchecked by default, and separately retained. | Must | Product owner | A recipient can request delivery without marketing consent; the two purposes are separately recorded. |
| MVP1-EMAIL-002 | A normalised email address has three Minimum Assessment report-delivery requests for the lifetime of MVP 1. It is not a daily allowance. | Must | Product owner | A fourth request is refused with the approved feedback route; the entitlement decision is stored. |
| MVP1-EMAIL-003 | The same normalised email/domain does not create another assessment or consume another allowance. One retained attachment may be automatically resent within 30 days; after that, show support. | Must | Product owner | Repeat-request tests show no new assessment/allowance use and a distinct recipient-specific resend delivery attempt. |
| MVP1-EMAIL-004 | A different email may request the same public domain under its own allowance without learning that another recipient exists or receiving their data/report. | Must | Technical design owner | Cross-recipient test shows no recipient, consent, attribution, report, or delivery-state leakage. |
| MVP1-EMAIL-005 | Chris's internal test address bypasses only the email entitlement through secret server-side configuration. It remains subject to all safety, bot, rate, and spend controls. | Must | Technical design owner | Configuration review proves the address is absent from source/browser/public output and controls still apply. |
| MVP1-PDF-001 | The Minimum Assessment is retained as a polished, accessible, professionally reviewed PDF with versioned template metadata and a private attachment-delivery path. | Must | Product/design owner | Representative PDFs pass the approved visual rubric and are private to the requesting recipient. |
| MVP1-PDF-002 | Customer-facing **sent** means the email provider accepted the attachment; it never claims inbox receipt or reading without provider evidence. | Must | Product owner | Delivery records distinguish provider acceptance from later/beyond-scope receipt signals. |
| MVP1-PDF-003 | Make one delivery attempt and no more than three temporary-failure retries at approximately 5, 20, and 60 minutes after the UTC report trigger. Permanent failures are terminal and reason-coded. | Must | Product owner | Temporary and permanent failure tests show the bounded retry/no-retry rules. |
| MVP1-PDF-004 | At two hours without provider acceptance, mark the attempt `escalated`, attempt one honest update email, send Chris a privacy-minimised Discord alert, and stop automatic retries. | Must | Product owner | Time-based test retains timestamps, state, reason, retry count, attempted update result, and alert status without falsely claiming delivery. |
| MVP1-ATTR-001 | Retain recognised first-landing UTM values, landing path, and supplied referrer as a sanitised first-party attribution record. Use privacy-minimised visitor/abuse events; do not store arbitrary query parameters as attribution. | Must | Technical design owner | UTM/referrer test links permitted values to the resulting run and rejects unrecognised arbitrary parameters. |
| MVP1-SEC-001 | Browser forms expose no provider key, backend credential, or Codex capability. Credentials remain server-side and are not returned in outputs, errors, or logs. | Must | Technical design owner | Static and runtime security checks find no client secret/access path. |
| MVP1-FAIL-001 | Unreadable, blocked, unsafe, sparse, or insufficient-evidence sites return an honest automated result with a stored reason code and support route; normal delivery never depends on a person preparing a report. | Must | Product owner | Controlled failure cases show a safe customer outcome, stored status, and no invented finding. |
| MVP1-UX-001 | The public journey is mobile-first, accessible, distinctive, and clear. Loveable.dev may be used for design exploration but is not a production architecture decision. | Should | Product/design owner | Approved desktop/mobile references meet usability/accessibility criteria and do not obscure submission, consent, outcome, or failure states. |
| MVP1-OUT-001 | Inbound self-service is delivered before any outreach. Later cohort outreach requires documented consent, sender identity, unsubscribe handling, suppression, and feedback evidence. | Must | Product owner | No outreach occurs before separate consent-gated protocol approval; inbound journey can complete independently. |

## 3. MVP 1 acceptance scenarios

The detailed scenarios are maintained as `M1-AC-01` through `M1-AC-18c` in the
[candidate](MVP_1_REQUIREMENTS_CANDIDATE.md#7-candidate-acceptance-scenarios).
They are the required acceptance evidence for this baseline and cover valid and
invalid domains, evidence limitations, AI-search results, duplicate/recipient
isolation, abuse, timestamps, privacy, attribution, mobile experience, PDF
generation, delivery/retry/escalation, and consent-gated outreach.

## 4. Explicit deferrals and open decisions

The following are intentionally unresolved and must not be silently chosen by
implementation work:

1. **OpenAI GPT-6 Luna is the selected MVP 1 model.** Its search configuration,
   location method, cost ceiling, timeout, failure threshold, and
   product-owner-approved public terminology remain implementation decisions
   (#23 decision record).
2. Evidence threshold for a buyer question versus an insufficient-evidence
   outcome.
3. Authoritative Auckland-suburb reference source, update owner, aliases, and
   boundary-change policy.
4. Support email, internal notification address, privacy notice, data
   retention/deletion/backup policy, and deletion path.
5. Quantified success measures for each ten-business cohort.
6. MVP 2 pricing research, Stripe implementation, and paid Basic Assessment
   scope.
7. Exact IP-rate threshold, visitor-event retention period, and approved
   token/timeout/per-assessment spend limits.
8. Product web domain, authenticated sending/support domain, and email address.
9. Approved PDF visual examples and Loveable design references/tone boundaries.
10. Consented outreach channel, cohort data fields, and feedback question.

## 5. Traceability and delivery boundary

This document is the canonical MVP 1 requirements baseline once approved in
GitHub #2. The detailed candidate preserves the underlying decision wording and
acceptance scenarios until then. Design/feasibility Issues #23–#28 determine
provider, security, data, visual, and contract implementation choices. Build
Issues must map to the requirement IDs above and may not turn a deferred item
into an implied commitment.

Symphony may execute a deliberately approved, bounded future implementation
Issue. It does not choose any unresolved item here, approve a release, send
customer communications, take payment, or change production systems.
