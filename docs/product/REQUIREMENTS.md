# ShortList MVP 1 requirements

**Status:** approved MVP 1 baseline (product-owner approval recorded in #1 and #2 on 2026-10-04)
**Owner:** Chris / SuccessByCS
**Last reconciled:** 2026-10-07
**Detailed decision record:** [MVP 1 requirements candidate](MVP_1_REQUIREMENTS_CANDIDATE.md)

## Current release increment — 2026-10-07

The approved broader MVP 1 baseline below remains the historical end-state
requirement. The active, bounded release increment is smaller: safely assess a
submitted public website; use retained website evidence and approved LLM stages
to create a business overview, exactly three ICP hypotheses, three buyer
questions per ICP, and structured findings; then render that assessment on the
page after a local email-reveal interaction.

The local email interaction is not recipient persistence, consent capture,
mailbox verification, entitlement, PDF generation, or delivery. Those remain
separate work under #11 and #27. The on-page increment must not claim that a
PDF was created or an email was sent. GitHub #55 owns assessment-graph
correctness; #57 owns this report journey; #14 verifies the approved release
increment only after its relevant safety and E2E prerequisites are accepted.

### Current-increment acceptance criteria

| ID | Acceptance criterion | Required evidence | Status |
| --- | --- | --- | --- |
| INC-01 | A valid completed assessment shows the explanatory checking sequence, ending with **Compiling results for you**. | Focused component test proves the ordered stages and that they do not claim a live server trace. | Implemented locally; release proof pending. |
| INC-02 | The report reveal accepts an email as local browser state and uses **See free report now**. | Focused journey test proves the transition and proves no recipient/delivery call is made. | Implemented locally; release proof pending. |
| INC-03 | The revealed on-page report renders the submitted domain, an evidence-based business overview, exactly three ICP hypotheses, and exactly three persisted buyer questions per ICP. | Stored-graph fixture and renderer test. | Implemented locally; release proof pending. |
| INC-04 | Each rendered finding is parsed/stored LLM output; website evidence, LLM interpretation, and uncertainty are visibly distinct. | Repository/renderer tests and copy review. | Implemented locally; release proof pending. |
| INC-05 | The current increment does not claim that an email was sent, a PDF was created, consent was retained, or an address was verified. | UI regression test and content review. | Implemented locally; release proof pending. |

## 1. Purpose and scope

ShortList helps a small-business owner understand how selected AI modes
understand and recommend their public website for plausible buyers. The MVP 1
journey is automated: domain entry, evidence-based teaser, email capture after
value, a clear masked-email confirmation with a change-email option, an
on-page full result, and a free Minimum ShortList Assessment PDF attachment.

MVP 1 validates the free inbound journey. It does not implement payment,
Stripe, a paid Basic Assessment, consulting, recurring monitoring, customer
accounts, a complex dashboard, manual report fulfilment, or production launch.
Those are later decisions, not implied commitments.

ShortList is a global self-service assessment. It does not restrict a valid
public business domain to Auckland, New Zealand, a predetermined vertical, or
an operator-selected city. An assessment may use the business's evidenced
service area or an approved global market context; where neither is supported,
it states that geographic context is uncertain.

## 2. Broader MVP 1 requirement baseline

| ID | Requirement | Priority | Owner | Observable acceptance evidence |
| --- | --- | --- | --- |
| MVP1-PR-001 | The active product name is ShortList. Historical GEO Check and AI Shortlist names remain source-record terminology only. | Must | Product owner | Current product documents and public-copy drafts use ShortList consistently. |
| MVP1-JNY-001 | A visitor submits one public domain/website and sees useful assessment value before email capture. | Must | Product owner | A valid public-domain scenario produces the teaser before any email field is required. |
| MVP1-JNY-002 | The teaser and report use only evidence or clearly marked inference; they do not guarantee enquiries, revenue, a stable rank, or an official provider result. | Must | Product owner | Review of a representative output finds page-level evidence/provenance or an explicit inference label for each material finding. |
| MVP1-JNY-003 | Each successful assessment creates an evidence-linked business profile, three labelled ICP hypotheses and three buyer questions per ICP. It tests the same nine questions in two separately identified, dated AI modes: current-web and no-web model knowledge. A list of alternatives may be supporting context only; it is not the customer outcome. | Must | Product owner | Stored records identify the profile, ICPs, questions, mode, response/finding, timestamp, approved configuration and customer terminology. The current-web record retains available citations; the no-web record carries the required freshness disclaimer and no invented citations. |
| MVP1-JNY-004 | The teaser and report show a clearly labelled UTC observation time while all stored machine times are UTC ISO 8601. A visitor-local display conversion is deferred. | Must | Product owner | A test record shows UTC storage and the same clearly labelled UTC observation time in the rendered result. |
| MVP1-JNY-005 | Before the full on-page Minimum Assessment is revealed or its PDF is sent, the visitor sees the submitted email in masked form and can confirm or change it. This is an intentional-address confirmation, not proof of mailbox ownership. Desktop and mobile use the same journey and state sequence; only the responsive layout changes. | Must | Product owner | The full result remains blurred before confirmation; the visitor can correct the address; confirmation records the selected address and then reveals the result while starting the private PDF-delivery path on both supported viewport classes. |
| MVP1-DOM-001 | Incorrectly formatted domains are rejected before fetch, search, or customer-record creation. Private/internal targets and unsafe redirects/DNS changes are refused safely. | Must | Technical design owner | Valid, malformed, private-target, redirect, and DNS-change cases have specified safe outcomes. |
| MVP1-DOM-002 | The service captures bounded public text and JSON-LD, then creates evidence-linked business facts, profile fields, ICP hypotheses, trust signals and opportunities without inventing facts. | Must | Product owner | Representative output contains required fields, source evidence IDs and confidence/uncertainty labels, or says evidence is insufficient. |
| MVP1-GEO-001 | The assessment method is a reviewable, versioned GEO prompt package. Approved templates, market/model profiles, rendered prompts and buyer questions are retained with each assessment; no customer request can choose an arbitrary template. | Must | Product owner | A stored assessment reconstructs the approved prompt/version, safe typed inputs, nine questions and two-mode configuration without exposing a secret or raw visitor data. |
| MVP1-GEO-002 | Geographic context is selected from an approved global market profile and/or evidence-supported service area; it is not inferred solely from free text or an AI guess. | Must | Product owner | An assessment records the market-profile version and evidenced service-area context, or an honest unable-to-determine result. |
| MVP1-ABUSE-001 | Before and after email capture, server-side bot, IP, normalised-domain, concurrency, bounded-fetch, token, and spend controls prevent excessive or unsafe processing. | Must | Technical design owner | Repeated/concurrent costly-submission tests return reason-coded safe outcomes before unbounded processing. |
| MVP1-DATA-001 | A normalised domain uniquely identifies one customer record. Each assessment is a dated assessment run; domain identity never grants report or recipient access. | Must | Technical design owner | Duplicate-domain tests reuse the customer record but do not expose other recipients or prior private data. |
| MVP1-DATA-002 | A recipient record is private to one normalised email address and stores report-delivery consent, optional marketing consent, attribution, entitlement use, delivery attempts, and support events. | Must | Technical design owner | Cross-recipient tests demonstrate isolation of consent, attribution, delivery status, stored PDF, and identity. |
| MVP1-DATA-003 | Each completed assessment retains structured claim/evidence/render data, the masked-email confirmation/change outcome, and its PDF/report-delivery linkage against the customer and assessment records. | Must | Technical design owner | A stored assessment can reproduce the on-page result and its PDF from versioned data; the record preserves confirmation and delivery linkage without making a domain or report reference a public access key. |
| MVP1-EMAIL-001 | Report-delivery consent is separate from optional marketing consent. Marketing consent is optional, unchecked by default, and separately retained. | Must | Product owner | A recipient can request delivery without marketing consent; the two purposes are separately recorded. |
| MVP1-EMAIL-002 | A normalised email address has three Minimum Assessment report-delivery requests for the lifetime of MVP 1. It is not a daily allowance. | Must | Product owner | A fourth request is refused with the approved feedback route; the entitlement decision is stored. |
| MVP1-EMAIL-003 | The same normalised email/domain does not create another assessment or consume another allowance. One retained attachment may be automatically resent within 30 days; after that, show support. | Must | Product owner | Repeat-request tests show no new assessment/allowance use and a distinct recipient-specific resend delivery attempt. |
| MVP1-EMAIL-004 | A different email may request the same public domain under its own allowance without learning that another recipient exists or receiving their data/report. | Must | Technical design owner | Cross-recipient test shows no recipient, consent, attribution, report, or delivery-state leakage. |
| MVP1-EMAIL-005 | Chris's internal test address bypasses only the email entitlement through secret server-side configuration. It remains subject to all safety, bot, rate, and spend controls. | Must | Technical design owner | Configuration review proves the address is absent from source/browser/public output and controls still apply. |
| MVP1-RESULT-001 | Before confirmation, the fuller Minimum Assessment is visibly blurred/locked after a useful teaser. On confirmation of the masked email, it is rendered responsively in the same web journey and the equivalent PDF-delivery path begins. | Must | Product/design owner | Desktop and mobile flows show the blurred/full transition, a change-email option before confirmation, and a complete responsive result without exposing another recipient's data. |
| MVP1-RESULT-002 | The completed Minimum Assessment reserves a clearly identifiable post-result CTA position for the future MVP 2 full/paid assessment. MVP 1 neither takes payment nor claims that the future offer is available. | Should | Product/design owner | The design identifies the post-result CTA location and labels it as a future MVP 2 decision; no checkout, price, active purchase promise, or lead-capture behaviour is implemented in MVP 1. |
| MVP1-PDF-001 | The Minimum Assessment is retained as a polished, accessible, professionally reviewed PDF with versioned template metadata and a private attachment-delivery path. | Must | Product/design owner | Representative PDFs pass the approved visual rubric and are private to the requesting recipient. |
| MVP1-PDF-002 | Customer-facing **sent** means the email provider accepted the attachment; it never claims inbox receipt or reading without provider evidence. | Must | Product owner | Delivery records distinguish provider acceptance from later/beyond-scope receipt signals. |
| MVP1-PDF-003 | Make one delivery attempt and no more than three temporary-failure retries at approximately 5, 20, and 60 minutes after the UTC report trigger. Permanent failures are terminal and reason-coded. | Must | Product owner | Temporary and permanent failure tests show the bounded retry/no-retry rules. |
| MVP1-PDF-004 | At two hours without provider acceptance, mark the attempt `escalated`, attempt one honest update email, send Chris a privacy-minimised Discord alert, and stop automatic retries. | Must | Product owner | Time-based test retains timestamps, state, reason, retry count, attempted update result, and alert status without falsely claiming delivery. |
| MVP1-ATTR-001 | Retain recognised first-landing UTM values, landing path, and supplied referrer as a sanitised first-party attribution record. Use privacy-minimised visitor/abuse events; do not store arbitrary query parameters as attribution. | Must | Technical design owner | UTM/referrer test links permitted values to the resulting run and rejects unrecognised arbitrary parameters. |
| MVP1-SEC-001 | Browser forms expose no provider key, backend credential, or Codex capability. Credentials remain server-side and are not returned in outputs, errors, or logs. | Must | Technical design owner | Static and runtime security checks find no client secret/access path. |
| MVP1-FAIL-001 | Unreadable, blocked, unsafe, sparse, or insufficient-evidence sites return an honest automated result with a stored reason code and support route; normal delivery never depends on a person preparing a report. | Must | Product owner | Controlled failure cases show a safe customer outcome, stored status, and no invented finding. |
| MVP1-FAIL-002 | When an assessment reaches the final `evidence_insufficient` outcome, send Chris one privacy-minimised private Discord alert. The alert never changes the automated customer outcome or implies manual fulfilment. | Must | Product owner | A controlled limited-evidence case records one alert outcome containing only the approved operational fields; a repeat/replay does not create another alert. |
| MVP1-UX-001 | The public journey is mobile-first, accessible, distinctive, and clear. Loveable.dev may be used for design exploration but is not a production architecture decision. | Should | Product/design owner | Approved desktop/mobile references meet usability/accessibility criteria and do not obscure submission, consent, outcome, or failure states. |
| MVP1-OUT-001 | Inbound self-service is delivered before any outreach. Later cohort outreach requires documented consent, sender identity, unsubscribe handling, suppression, and feedback evidence. | Must | Product owner | No outreach occurs before separate consent-gated protocol approval; inbound journey can complete independently. |

## 3. MVP 1 acceptance scenarios

The detailed scenarios are maintained as `M1-AC-01` through `M1-AC-18c` in the
[candidate](MVP_1_REQUIREMENTS_CANDIDATE.md#7-candidate-acceptance-scenarios).
They are the required acceptance evidence for this baseline and cover valid and
invalid domains, evidence limitations, AI-search results, duplicate/recipient
isolation, abuse, timestamps, privacy, attribution, mobile experience,
masked-email confirmation, on-page result reveal, PDF generation,
delivery/retry/escalation, and consent-gated outreach.

## 4. Explicit deferrals and open decisions

The following are intentionally unresolved and must not be silently chosen by
implementation work:

1. **OpenAI GPT-6 Luna is the selected MVP 1 model.** MVP 1 has a
   current-web mode and a separate no-web model-knowledge mode. Their exact
   reasoning/tool configuration, location method, cost ceiling, timeout,
   failure threshold, and product-owner-approved public terminology remain
   implementation decisions (#23 decision record).
2. Evidence threshold for a buyer question versus an insufficient-evidence
   outcome.
3. Approved global market-profile defaults, service-area evidence rules, and
   any future country/locale-specific reference-data policy.
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
