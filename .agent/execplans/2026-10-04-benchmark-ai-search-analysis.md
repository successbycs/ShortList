# Benchmark ShortList AI-search and analysis capability

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Determine whether ShortList can truthfully offer the approved MVP 1 experience:
one dated Auckland-wide business-type AI-search result alongside a structured,
evidence-based website assessment. After this work, Chris can review a
reproducible comparison and choose a lowest-cost viable production direction—or
narrow the public promise if no option meets the evidence, provenance, and cost
requirements.

## Progress

- [x] (2026-10-04 13:25Z) Created this design/research ExecPlan after the
  Discovery gate (#4) was closed.
- [x] (2026-10-05) Collect official, current provider documentation and pricing
  evidence for candidate web-search and structured-analysis capabilities;
  record the documentation-only comparison in
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
- [ ] Define neutral, reproducible evaluation inputs and a safe local evidence
  format; obtain any required product-owner authority before making billable or
  live provider calls.
- [ ] Compare candidate capabilities, record observed limits and public wording,
  and recommend a viable direction or product-promise narrowing.
- [ ] Update requirements/Issue #23 with evidence and leave the decision open
  for product-owner review.

## Surprises & Discoveries

- Observation: The approved customer journey uses the generic term
  “AI-search test”; the product owner controls its public terminology.
  Evidence: `docs/product/REQUIREMENTS.md` MVP1-JNY-003 and
  `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` section 3.4.
- Observation: Codex is a development tool in this repository, not a
  customer-facing runtime candidate.
  Evidence: GitHub #23 non-goals and `docs/product/REQUIREMENTS.md`
  MVP1-SEC-001.

## Decision Log

- Decision: Separate web-search evidence acquisition from structured website
  analysis in the evaluation.
  Rationale: A capable text model alone does not establish current web-search
  provenance, citations, or location context; each boundary needs independent
  evidence.
  Date/Author: 2026-10-04 / Chris's approved requirements, recorded by Codex.
- Decision: Record the product-owner-approved customer terminology alongside
  reproducible capability evidence.
  Rationale: The observed answer from one prompt/time/provider is a dated
  result, not a stable rank or a provider endorsement.
  Date/Author: 2026-10-04 / Chris's approved requirements, recorded by Codex.

## Outcomes & Retrospective

Pending research and product-owner review. This plan does not select a
provider, create credentials, incur provider charges, change public wording, or
authorise implementation.

## Context and Orientation

Issue #23 is a child of feasibility Issue #5 and was unblocked when Discovery
gate #4 closed. It must produce a reviewable recommendation for the
web-search/analysis capability; it is not an application build task.

`docs/product/REQUIREMENTS.md` is the approved MVP 1 baseline. Its relevant
requirements are MVP1-JNY-002/003/004 (truthful, dated, evidence-based results),
MVP1-DOM-002 (structured website assessment), MVP1-ABUSE-001 (cost controls),
MVP1-SEC-001 (server-only secrets), and MVP1-FAIL-001 (honest failures).
`docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` holds the detailed product
language and required stored provenance.

“Web-search acquisition” means obtaining current search-grounded material with
available citations/source URLs. “Structured analysis” means producing the
defined website assessment from supplied public-page evidence without inventing
facts. A provider may supply one or both capabilities, but the evaluation must
not assume that it does.

## Plan of Work

First, create a comparison matrix from official provider documentation. Include
only providers with an available API/product suitable for server-side use; do
not use consumer interfaces as an undocumented production dependency. For each
candidate, record current model/capability identity, web-search mechanism,
citation/source support, geographic/location controls, structured-output
support, input/output limits, documented pricing, data/retention terms where
relevant, authentication boundary, and known limitations.

Second, define a small neutral evaluation set from public, non-sensitive
representative Auckland business domains. Use the same business-type question
shape for each candidate, for example “What are the top three lawn-mowing
companies in Auckland today?” Record the exact question, Auckland-time test
time, input URLs/evidence, model/capability version, returned text/order,
citations, latency, token/usage data where available, and failures. Do not
contact businesses, publish results, or treat a test result as a commercial
claim.

Third, assess separate capability dimensions:

1. Search grounding: can it expose dated sources/citations and an observed
   ordering without claiming a stable rank?
2. Auckland context: can it support or honestly limit location-specific
   questions?
3. Website analysis: can it produce required structured findings with clear
   evidence/inference separation?
4. Safety and operability: can use remain server-side with bounded input/output,
   timeout, cost, logging, and reason-coded failure paths?
5. Cost and latency: can an approved per-assessment budget and user experience
   be supported with evidenced assumptions rather than estimates presented as
   fact?

Fourth, provide a recommendation with alternatives and exact public wording.
The recommendation can be: a qualified provider combination; a provider-neutral
architecture with a follow-up spike; a website-only MVP if search is not viable;
or deferral of the AI-search feature. It must explain what evidence supports
each conclusion and what needs Chris’s approval before any paid/API test.

## Concrete Steps

From `/home/chris/ShortList`:

    gh issue view 23 --repo successbycs/ShortList --comments
    rg -n -C 2 "AI-search|provider|cost|timeout|citation|Auckland" \
      docs/product/REQUIREMENTS.md docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md
    git diff --check
    python3 scripts/check_markdown_links.py

After explicit authority for web research, use only official provider
documentation for documented capability and pricing claims. After explicit
authority for a billable/live spike, record the exact account, cap, test input,
timestamp, result, and cost before each call. Expected outcome before that
authority: a reviewable research design, not a provider result.

## Validation and Acceptance

- The comparison uses direct official evidence for capability/pricing claims and
  distinguishes documentation from observed test results.
- Every observed test is reproducible: question, time, model/capability,
  inputs, output, citations, latency, usage/cost, and failures are retained.
- The recommendation explicitly separates search grounding from website
  analysis and identifies unsupported requirements.
- Public wording is truthful, dated, and does not claim a universal/official
  rank or misname a provider capability.
- A provider option is not marked viable unless it has an accountable cost,
  timeout, failure, secret, and provenance story.
- No provider credential, production integration, customer report, external
  contact, payment, deployment, or Symphony dispatch occurs under this plan.

## Idempotence and Recovery

Documentation research and local evidence collection are repeatable. Record
each source's retrieval date and do not overwrite earlier observed results;
append a new dated entry when a provider changes. A live/billable test requires
an approved budget cap and can be stopped after any unexpected cost, missing
provenance, unsafe output, or error. Do not reuse an unverified consumer
session, expose a key, or infer a successful test from an SDK import.

## Artifacts and Notes

- Parent feasibility Issue: GitHub #5.
- Research/decision Issue: GitHub #23.
- Approved requirements: `docs/product/REQUIREMENTS.md`.
- Detailed evidence/provenance language:
  `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`.
- Future dependent design: #24, #6, #7, and #8.

## Interfaces and Dependencies

No runtime interface changes in this planning stage. A later design must define
server-side interfaces for `search(question, locationContext)` and
`analyseWebsite(pageEvidence)` only after provider selection. Both interfaces
need typed result/provenance, citations/source URLs where available, model or
capability identity, UTC timestamp, usage/cost, timeout, and a safe
machine-readable failure outcome. Provider credentials must remain server-side.
