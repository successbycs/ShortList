# ShortList MVP 1 evidence, report, and delivery contracts

**Status:** draft for #7 review; no schema, service, or provider is configured  
**Owner:** Chris / SuccessByCS  
**Canonical requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)  
**Architecture:** [SDD.md](SDD.md)

## 1. Contract conventions

All records carry `contract_version`, an opaque ID, `created_at_utc` in ISO
8601 `Z` form, and an explicit status. Store observation time separately from
receipt/processing time where they differ. A record is immutable evidence once
used in a report; later processing creates a revision or linked new record.

Machine-readable `reason_code` values are stable, safe for operators, and are
mapped to approved customer wording rather than exposed verbatim. `observed`
means a source was captured; `inference` means a qualified conclusion supported
by listed evidence IDs. Neither type may be generated without source IDs.

## 2. Identity, access, and assessment records

| Contract | Required fields | Producer / consumers | Validation and access rule |
| --- | --- | --- | --- |
| Customer v1 | `customer_id`, `normalised_domain`, original submission, UTC created/reused time | Domain admission -> assessment | `normalised_domain` is unique. It is never a login, report URL, or authorisation key. |
| Assessment run v1 | `assessment_id`, `customer_id`, input URL, UTC trigger/display timezone, status, reason code, evidence IDs, reference-data version | Assessment service -> teaser/report/operator | One dated attempt. It retains the exact input/outcome and cannot expose recipient data. |
| Website evidence v1 | `evidence_id`, `assessment_id`, source URL, observation time, bounded excerpt/metadata, content type, fetch/extraction outcome | Safe fetch/extractor -> assessment/prompt/report | Public-source only; page content is untrusted data, not instructions. |
| Auckland context v1 | `assessment_id`, dataset version, matched value/alias, outcome, source evidence IDs | Deterministic matcher -> assessment/report | No free-text/AI-only match. Missing match is `context_unavailable`. |
| Attribution/event v1 | pseudonymous visitor ID, recognised UTM fields, landing path, referrer when supplied, event kind, privacy-minimised IP representation, UTC time | Admission -> measurement/support | Reject arbitrary query parameters; raw IP/retention need owner approval. |
| Recipient v1 | `recipient_id`, normalised email, customer relationship, separate delivery/marketing consent records, entitlement state | Email capture -> delivery | Recipient data is private. A second recipient for the same domain learns nothing about the first. |

Normalisation is deterministic: trim/canonicalise a domain before customer
creation; trim and case-normalise email only, without provider-specific dot or
plus rewriting. Invalid domain input creates at most a privacy-approved
validation/rate event, never a customer record.

## 3. Evidence and AI-search contract

### Website assessment input/output v1

Input is a bounded list of `Website evidence v1` IDs plus run metadata. Output
contains business name, apparent services, service-area outcome, observed trust
signals, evidence-backed strengths/opportunities, and up to three buyer
situations. Every material field has `kind` (`observed`, `inference`, or
`insufficient`) and non-empty supporting evidence IDs. A renderer rejects an
unsupported field rather than inventing copy.

### Dated AI-search evidence v1

| Required field | Rule |
| --- | --- |
| `search_evidence_id`, `assessment_id` | Opaque IDs; one defined test per successful free assessment. |
| `question` | Exact Auckland-wide business-type question used for this run. |
| `executed_at_utc`, `displayed_at_auckland` | Preserve both; display follows Pacific/Auckland. |
| `model_id`, `search_configuration_ref`, `location_context` | Record actual configuration without credentials. GPT-6 Luna is selected; exact configuration remains owner-approved input. |
| `observed_results` | Ordered list as returned, including actual count; never manufacture three results. |
| `citations` | Available source URL/title/reference plus association to an observed result where possible. |
| `outcome`, `reason_code`, `usage` | `completed`, `limited`, or `failed`; usage/limit evidence contains no secret or raw credential. |

The customer-facing result must say it is the order from one specific dated
test, not an official, objective, or permanent ranking. Missing citations,
malformed output, timeout, budget exhaustion, or fewer results produces a
limited/failure outcome and never an unsupported claim.

## 4. Claim ledger and report contract

Every teaser and PDF claim uses a `claim_id`, `assessment_id`, section, text or
structured value, `kind`, evidence IDs, contract version, and render outcome.
The claim ledger is the report provenance boundary:

- observed claim -> one or more website or AI-search evidence IDs;
- inference -> one or more evidence IDs plus an explicit inference label;
- insufficient evidence -> reason code and no positive/negative invented
  conclusion.

`Minimum Assessment report v1` contains report ID/version, assessment ID,
claim IDs, Auckland display time, PDF template version, generated time,
integrity-safe object reference, and render status. Its required sections are
business summary, source-linked evidence, labelled buyer hypotheses, dated
AI-search test/result, strengths/opportunities, limitations, and support path.
The renderer may not insert provider credentials, raw private recipient data,
or a statement that email was received/read.

## 5. Entitlement and private delivery contract

| Contract | Required state | Idempotency / privacy rule |
| --- | --- | --- |
| Entitlement decision v1 | recipient ID, request time, lifetime used count, allowlist decision, duplicate/resend/exhausted outcome | Same normalised recipient/domain is idempotent: no new assessment or allowance. Chris allowlist is server-only and does not bypass safety controls. |
| Delivery attempt v1 | attempt ID, recipient ID, report ID/version, UTC trigger/deadline/transitions, state, reason code, retry number, provider-acceptance reference, update/alert status | New recipient-specific attempt for a permitted resend; never disclose another recipient or their report. |
| Operator alert v1 | alert ID, assessment ID, normalised public domain, UTC occurrence time, safe reason code, private operational-record reference, alert outcome | A final `evidence_insufficient` outcome creates at most one alert per assessment run. It includes no recipient data, report content, raw IP, credential, or internal stack trace. |

States: `triggered`, `generating`, `stored`, `sending`, `provider_accepted`,
`retrying`, `terminal_failure`, and `escalated`. `provider_accepted` is the
only customer-facing `sent` state. Temporary failures may retry at approximately
5, 20, and 60 minutes; permanent failure does not retry. At two hours without
acceptance, record `escalated`, attempt one approved update email, alert Chris
with the approved minimum fields, and stop automatic retry.

Separately, when an assessment reaches final `evidence_insufficient`, record
and send one `Operator alert v1` to Chris. The alert is an internal observation
of a limited result, not an escalation of a delivery failure and not a promise
of manual customer fulfilment. If the alert channel fails, record that private
outcome; do not alter the customer result or re-run the assessment.

## 6. Failure contract

All public outcomes map to a safe category: `invalid_input`, `unsafe_target`,
`rate_limited`, `site_unreadable`, `evidence_insufficient`, `search_limited`,
`search_failed`, `entitlement_exhausted`, `report_failed`, `delivery_failed`,
or `delivery_escalated`. Detailed provider/internal causes remain private.

Each failure retains assessment/delivery ID, UTC time, safe reason code,
customer-visible outcome key, retry eligibility, and support-route eligibility.
No outcome promises manual completion, revenue/enquiries, a stable rank, or
inbox receipt.

## 7. Acceptance mapping and open decisions

These contracts directly support M1-AC-01–04 (assessment/evidence), 05 and
07–07c (consent/entitlement/isolation), 08–12 (context/safety/limits), 13–14
(report/attribution), 18–18c (delivery/retry/escalation), and `MVP1-FAIL-002`.

Still required from the product owner: exact GPT-6 Luna search configuration,
location method, token/timeout/spend limits, evidence threshold, suburb source,
retention/deletion policy, support/sender domain, and approved customer wording
for unsettled states. These are configuration inputs to later implementation,
not defaults chosen by this contract.
