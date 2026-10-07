# ShortList MVP 1 evidence, report, and delivery contracts

**Status:** approved MVP 1 contract baseline; no schema, service, or provider is configured
**Owner:** Chris / SuccessByCS  
**Canonical requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)  
**Architecture:** [SDD.md](SDD.md)
**Logical records and relationships:** [DATA_MODEL.md](../architecture/DATA_MODEL.md)

Contracts define required behaviour, producer/consumer boundaries and access
rules. `DATA_MODEL.md` defines the authoritative logical records and
relationships that satisfy these contracts. SQL and TypeScript are conformance
evidence; they do not silently redefine the contract or the data model.

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

| Contract             | Required fields                                                                                                                                          | Producer / consumers                                    | Validation and access rule                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Customer v1          | `customer_id`, `normalised_domain`, original submission, UTC created/reused time                                                                         | Domain admission -> assessment                          | `normalised_domain` is unique. It is never a login, report URL, or authorisation key.             |
| Assessment run v1    | `assessment_id`, `customer_id`, input URL, UTC trigger/display timezone, status, reason code, evidence IDs, reference-data version                       | Assessment service -> teaser/report/operator            | One dated attempt. It retains the exact input/outcome and cannot expose recipient data.           |
| Website evidence v1  | `evidence_id`, `assessment_id`, source URL, observation time, bounded excerpt/metadata, content type, fetch/extraction outcome                           | Safe fetch/extractor -> assessment/prompt/report        | Public-source only; page content is untrusted data, not instructions.                             |
| Market context v1    | `assessment_id`, global market-profile version, evidence-supported service area, outcome, source evidence IDs                                            | Approved profile/evidence boundary -> assessment/report | No free-text/AI-only market assumption. Missing context is `context_unavailable`.                 |
| Attribution/event v1 | pseudonymous visitor ID, recognised UTM fields, landing path, referrer when supplied, event kind, privacy-minimised IP representation, UTC time          | Admission -> measurement/support                        | Reject arbitrary query parameters; raw IP/retention need owner approval.                          |
| Recipient v1         | `recipient_id`, normalised email, customer relationship, masked-email confirmation state, separate delivery/marketing consent records, entitlement state | Email capture -> result reveal and delivery             | Recipient data is private. A second recipient for the same domain learns nothing about the first. |

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

### GEO assessment and prompt-execution contract v1

The customer outcome is a versioned GEO assessment. The generic
comparable-business search prototype is historical evidence only and cannot be
rendered as a new GEO report.

| Required record        | Rule                                                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website source         | Retain source ID, public URL, observed time, bounded visible text, title, meta description, parsed JSON-LD and extraction version. Website content is untrusted data.                                                   |
| Business profile       | Every fact records `observed`, `inference`, or `insufficient`, plus non-empty source IDs where supported.                                                                                                               |
| ICP hypothesis         | Exactly three labelled hypotheses on a normal assessment. Each records buyer situation, needs, decision criteria, source IDs, confidence and uncertainty.                                                               |
| Buyer question         | Exactly three question records per ICP: immutable question ID/text, intent, test claim and question-package version. The same nine question IDs go to both modes.                                                       |
| Prompt package/version | An approved, immutable D1 version identifies the stage template, allowed named fields, input/output-schema versions, checksum, prohibited claims and approval metadata.                                                 |
| Prompt execution       | Retain package/version/checksum, safe typed input snapshot, rendered prompt/question, selected model/mode, execution time, usage and outcome. Never retain keys, raw IP/header data or unbounded raw provider payloads. |
| Model question finding | Store a dated per-question/mode finding: mention status, description accuracy, recommendation fit, answer summary, available sources, inference, content gaps and limitations.                                          |
| Report view model      | A versioned result built from the preceding records. The website and PDF renderer consume the same view model and may not trigger another AI call.                                                                      |

### Historical dated AI-model evidence v1

`ai_evidence` is the legacy generic-search prototype record. It records one
question and one list-shaped result per mode and cannot represent the required
GEO graph. Preserve it for audit; do not extend it as the primary GEO report
contract.

| Required field                                             | Rule                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_evidence_id`, `assessment_id`                      | Opaque IDs; one current-web record and one model-knowledge record per successful free assessment.                                                                                                                                                  |
| `mode`                                                     | Exactly `web_grounded` or `model_knowledge`; report renderers must display the corresponding plain-language label.                                                                                                                                 |
| `question`                                                 | Exact historical generic-search question used for this run. It is retained for audit only and is not a GEO assessment input.                                                                                                                       |
| `executed_at_utc`, `displayed_at_utc`                      | Preserve the UTC observation time. Historical Auckland presentation metadata is not a product-market constraint.                                                                                                                                   |
| `model_id`, `search_configuration_ref`, `location_context` | Record actual configuration without credentials. GPT-6 Luna is selected; exact configuration remains owner-approved input. `location_context` applies to `web_grounded`; a no-web run records that no external location/search tool was available. |
| `observed_results`                                         | For `web_grounded`, ordered list as returned, including actual count; never manufacture three results. For `model_knowledge`, an unverified response representation, never a current ranking claim.                                                |
| `citations`                                                | For `web_grounded`, retain available source URL/title/reference and its association to an observed result where possible. It is absent/empty for `model_knowledge` rather than fabricated.                                                         |
| `freshness_notice`                                         | Required for `model_knowledge`: it states that the response did not use a live web search and may be incomplete or out of date.                                                                                                                    |
| `outcome`, `reason_code`, `usage`                          | `completed`, `limited`, or `failed`; usage/limit evidence contains no secret or raw credential.                                                                                                                                                    |

The customer-facing current-web result must say it is the order from one
specific dated test, not an official, objective, or permanent ranking. The
model-knowledge result must instead say that it did not use live web search and
is not a verified current result. Missing citations, malformed output, timeout,
budget exhaustion, or fewer results produces a limited/failure outcome and
never an unsupported claim.

## 4. Claim ledger and report contract

Every teaser, rendered result, and PDF claim uses a `claim_id`, `assessment_id`, section, text or
structured value, `kind`, evidence IDs, contract version, and render outcome.
The claim ledger is the report provenance boundary:

- observed claim -> one or more website or AI-search evidence IDs;
- inference -> one or more evidence IDs plus an explicit inference label;
- insufficient evidence -> reason code and no positive/negative invented
  conclusion.

`Minimum Assessment report v1` contains report ID/version, assessment ID,
claim IDs, labelled UTC observation time, PDF template version, generated time,
integrity-safe object reference, structured render data, and render status. Its
required sections are
business summary, source-linked evidence, labelled buyer hypotheses, dated
AI-search test/result, strengths/opportunities, limitations, and support path.
Neither the responsive renderer nor PDF renderer may insert provider
credentials, raw private recipient data, or a statement that email was
received/read.

## 5. Entitlement, email confirmation, private result, and delivery contract

| Contract                | Required state                                                                                                                                                      | Idempotency / privacy rule                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entitlement decision v1 | recipient ID, request time, lifetime used count, allowlist decision, duplicate/resend/exhausted outcome                                                             | Same normalised recipient/domain is idempotent: no new assessment or allowance. Chris allowlist is server-only and does not bypass safety controls.                               |
| Email confirmation v1   | confirmation ID, recipient ID, masked-address display value, submitted/confirmed/changed UTC time, outcome                                                          | It confirms the visitor's intended address only; it is not an email-ownership check. The visitor can change the address before confirmation.                                      |
| Result-access event v1  | event ID, recipient ID, report ID/version, UTC time, outcome, safe reason code                                                                                      | The blurred/full result transition is tied to confirmed consent in the active journey; the domain is never an access key or a permanent result portal.                            |
| Delivery attempt v1     | attempt ID, recipient ID, report ID/version, UTC trigger/deadline/transitions, state, reason code, retry number, provider-acceptance reference, update/alert status | New recipient-specific attempt for a permitted resend; never disclose another recipient or their report.                                                                          |
| Operator alert v1       | alert ID, assessment ID, normalised public domain, UTC occurrence time, safe reason code, private operational-record reference, alert outcome                       | A final `evidence_insufficient` outcome creates at most one alert per assessment run. It includes no recipient data, report content, raw IP, credential, or internal stack trace. |

Email-confirmation states are `submitted`, `changed`, `confirmed`, and
`cancelled`. A syntactically valid address and a confirmation click do not
prove inbox receipt or mailbox ownership. `confirmed` reveals the full result
in the active web journey and starts the report-delivery state machine:
`triggered`, `generating`, `stored`, `sending`, `provider_accepted`,
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
07–07c (confirmation/consent/entitlement/isolation), 08–12 (context/safety/
limits), 13–14 (report/attribution), 18–18c (delivery/retry/escalation), and
`MVP1-FAIL-002`.

The approved storage/recovery architecture is D1 for relational records, R2 for
private PDF objects, and Workflows for delayed delivery/retry. The logical data
model is the design authority; D1 is the runtime system of record once the
relevant records are implemented and observed. A Workflow instance and an R2
object key are never customer access keys. The active browser journey must use a short-lived protected server session
for the confirmed recipient/result relationship, not a domain or reusable
report link. See [ARCHITECTURE_DECISION.md](ARCHITECTURE_DECISION.md).

Still required from the product owner: exact GPT-6 Luna search configuration,
token/timeout/spend limits, evidence threshold, retention/deletion policy,
support/sender domain, and approved customer wording
for unsettled states. These are configuration inputs to later implementation,
not defaults chosen by this contract.
