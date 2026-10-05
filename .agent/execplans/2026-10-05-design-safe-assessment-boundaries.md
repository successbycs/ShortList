# Design ShortList safe assessment and private-access boundaries

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #24 turns the SDD safety principles into a concrete design for safe
public-domain assessment, privacy-minimised data, recipient isolation, report
access, and bounded automated processing. The resulting design lets a later
implementation prove dangerous targets and private data are refused rather
than merely documented as risks.

## Progress

- [x] (2026-10-05 01:00Z) Verified #24 and moved its Project status to In
  Progress after #6 approval.
- [x] (2026-10-05 01:02Z) Inspected the approved SDD and #7 contract draft.
- [x] (2026-10-05 01:12Z) Added `docs/product/SAFE_ASSESSMENT_DESIGN.md` with
  admission/fetch, data/access, privacy, bounded-control, failure, test, and
  owner-decision matrices.
- [ ] Validate, commit/push, and record #24 evidence for Chris's review.

## Surprises & Discoveries

- Observation: D1/R2 and Cloudflare edge controls are candidates, not selected
  or configured technologies.
  Evidence: `docs/product/SDD.md`, section 3.2.
- Observation: #7 has defined record/provenance semantics but intentionally
  leaves retention, deletion, exact limits, and providers to later approval.
  Evidence: `docs/product/CONTRACTS.md`, section 7.

## Decision Log

- Decision: Create `docs/product/SAFE_ASSESSMENT_DESIGN.md` rather than change
  generic template threat-model documentation.
  Rationale: This is product-specific design evidence that later maps to #9,
  #10, #11, and #27 implementation tests.
  Date/Author: 2026-10-05 / Codex.

## Outcomes & Retrospective

Pending. The design will make every security/data boundary testable while
keeping owner choices visible rather than inventing operational defaults.

## Context and Orientation

The SDD requires a visitor-submitted domain to be safe before any customer
record or costly operation. A normalised domain identifies a customer but never
authorises access. A recipient record controls private report access. Public
website text is untrusted input. Browser clients cannot receive provider keys
or Codex capability. The exact runtime, data store, edge product, retention,
limits, support address, and provider configuration remain unselected.

## Plan of Work

Define (1) admission and safe-fetch decisions, including URL normalisation,
DNS/IP checks before and after redirects, response/time/size bounds, and
untrusted-content handling; (2) data classification, record ownership,
recipient access, report-object access, attribution, retention/deletion; (3)
layered bot/rate/concurrency/token/spend controls; and (4) reason-coded
failure/recovery and implementation verification matrix. Explicitly mark the
decisions that Chris must approve.

## Concrete Steps

From `/home/chris/ShortList`:

    sed -n '1,320p' docs/product/SDD.md
    sed -n '1,260p' docs/product/CONTRACTS.md
    git diff --check
    python3 scripts/check_markdown_links.py

## Validation and Acceptance

- Every #24 threat/data boundary maps to an MVP requirement, a safe state, a
  later test, and an owner decision where unselected.
- The design prevents domain-only report access and cross-recipient disclosure.
- It defines bounded rejection paths for unsafe targets, malformed/untrusted
  content, abuse, cost/timeout, and storage/delivery failure.
- No external resource, secret, customer data, provider call, or deployment is
  created.

## Idempotence and Recovery

Documentation is additive. A changed owner decision supersedes rather than
erases prior evidence. A future implementation preserves failed state and
reason code instead of silently retrying unsafe or unknown operations.

## Artifacts and Notes

- Output: `docs/product/SAFE_ASSESSMENT_DESIGN.md`.
- Inputs: `docs/product/SDD.md`, `docs/product/CONTRACTS.md`, and approved
  requirements/candidate acceptance scenarios.

## Interfaces and Dependencies

Future components are an admission gate, safe URL fetcher, evidence extractor,
assessment orchestrator, private record repository, report-object gateway,
and reason-code mapper. Exact SDKs, database fields, HTTP routes, and platform
settings are deferred to approved implementation packets.
