# Define ShortList MVP 1 evidence and report contracts

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #7 converts the approved ShortList SDD into versioned, provider-neutral
contracts. After completion, a reviewer can trace every teaser or PDF report
claim to stored evidence and a later engineer can implement records, prompts,
rendering, and failure handling without deciding privacy or truthfulness rules
on the fly. This work defines documents only; it neither stores customer data
nor calls a model, sends email, or configures a service.

## Progress

- [x] (2026-10-05 00:40Z) Verified #7 is open and marked it In Progress after
  Chris approved the SDD in #6.
- [x] (2026-10-05 00:42Z) Inspected the approved SDD, requirements candidate,
  delivery policy, and generic contract guidance.
- [x] (2026-10-05 00:50Z) Added `docs/product/CONTRACTS.md` with versioned
  evidence, assessment, claim/report, recipient/delivery, prompt-boundary, and
  failure contracts.
- [ ] Add acceptance examples and claim-to-evidence rules; validate documents,
  commit/push, and record #7 review evidence without closing it.

## Surprises & Discoveries

- Observation: `docs/architecture/DATA_CONTRACTS.md` is reusable template
  guidance, not a product schema.
  Evidence: It has `Status: template` and no ShortList entities.
- Observation: GPT-6 Luna is selected, but its exact API/search configuration
  and limits remain owner decisions; a contract must parameterise them rather
  than invent defaults.
  Evidence: `docs/product/REQUIREMENTS.md`, section 4; `docs/product/SDD.md`,
  sections 3.2 and 9.

## Decision Log

- Decision: Put product contracts in `docs/product/CONTRACTS.md`, alongside
  requirements and the SDD, without overwriting template contract guidance.
  Rationale: This is ShortList-specific durable design evidence.
  Date/Author: 2026-10-05 / Codex.

## Outcomes & Retrospective

Pending. The desired result is a reviewable contract that unblocks #8 and
supplies the record/evidence semantics for #5, #10, #11, and #27.

## Context and Orientation

`docs/product/REQUIREMENTS.md` is the approved baseline and
`docs/product/SDD.md` is the approved architecture. A **contract** here means
the required fields, producer, consumer, validation, retention decision,
provenance, idempotency, and safe failure behaviour for a product record or
rendered claim. It is not a database migration or an API implementation.

Critical boundaries are: normalised domain uniquely identifies a customer but
never authenticates a recipient; every assessment run is dated; a claim is
observed evidence or marked inference; all machine time is UTC ISO 8601;
customer output displays Pacific/Auckland; `sent` means email-provider
acceptance only; and one recipient must not learn another recipient's data.

## Plan of Work

First add the versioning and shared value conventions: IDs, UTC time,
normalisation, provenance, evidence/inference labels, reason codes, and
retention/deletion placeholders. Then define a compact data dictionary for
customer, assessment run, website evidence, AI-search evidence, Auckland
reference, attribution/abuse event, recipient/consent/entitlement, report, and
delivery attempt.

Next define provider-neutral prompt input/output contracts. Website-analysis
and dated AI-search inputs contain only bounded, sanitised evidence; outputs
must cite source IDs, mark inference, preserve the observed returned order, and
reject unsupported recommendations. Provider tool settings remain explicit
configuration inputs.

Finally specify the report template boundary, claim ledger, and reason-coded
outcomes for invalid/unsafe input, sparse evidence, provider/tool limits,
duplicate requests, rendering/storage/delivery failures, retry, terminal
failure, and escalation. Map those to M1 acceptance scenarios and future
Issues. Do not select a database, provider endpoint, PDF renderer, retention
period, or customer wording beyond approved text.

## Concrete Steps

From `/home/chris/ShortList`:

    gh issue view 7 --repo successbycs/ShortList --comments
    sed -n '1,320p' docs/product/SDD.md
    sed -n '1,220p' docs/product/REQUIREMENTS.md
    git diff --check
    python3 scripts/check_markdown_links.py

Expected: contracts are reviewable without a live service. `git diff --check`
passes; any repository-wide historical Markdown-link failures are recorded and
not repaired incidentally.

## Validation and Acceptance

- Every report/teaser claim points to a stored evidence record or a clearly
  marked inference with source IDs.
- Contracts distinguish a domain customer record, dated assessment, and private
  recipient; no field or access rule allows cross-recipient disclosure.
- The AI-search contract retains question, ordered result, citation/source,
  configuration context, timestamp, and limit/failure outcome without claiming
  an objective rank.
- Delivery records distinguish generated, stored, attempted, provider accepted,
  retrying, terminal failure, and escalated outcomes.
- No live data, provider request, email, storage, payment, or deployment is
  attempted.

## Idempotence and Recovery

This is additive documentation. If an owner decision changes, preserve the
old GitHub decision comment, amend the canonical contract, and add a
superseding decision. Do not retrofit a speculative schema or provider SDK.

## Artifacts and Notes

- Output: `docs/product/CONTRACTS.md`.
- Inputs: `docs/product/REQUIREMENTS.md`, `docs/product/SDD.md`,
  `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`, and the #22 delivery-policy
  ExecPlan.
- Future consumers: #5, #10, #11, #25, and #27.

## Interfaces and Dependencies

The future system will consume contract versions for assessment evidence,
AI-search evidence, claim ledgers, report payloads, consent/entitlement,
private delivery attempts, and reason-coded outcomes. Exact table names,
HTTP paths, SDK types, object-store keys, and provider payloads remain future
implementation decisions under #8/#9 and their bounded packets.
