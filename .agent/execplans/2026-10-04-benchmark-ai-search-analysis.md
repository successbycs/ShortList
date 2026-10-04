# Benchmark ShortList AI-search and analysis capability

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Determine whether ShortList can truthfully offer the approved MVP 1 experience:
one dated Auckland-wide business-type AI-search result alongside a structured,
evidence-based website assessment. After this work, Chris can review a
documentation-only capability screen and decide whether to narrow the public
promise or defer concrete provider selection to implementation design.

## Progress

- [x] (2026-10-04 13:25Z) Created this design/research ExecPlan after the
  Discovery gate (#4) was closed.
- [x] (2026-10-05) Collect official, current provider documentation and pricing
  evidence for candidate web-search and structured-analysis capabilities;
  record the documentation-only comparison in
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
- [x] (2026-10-05) Expand the evidence design to a 67-configuration official-documentation
  screen, a controlled quality test set for documentary-qualified entries, and separate 1,000-API-call
  from 1,000-completed-assessment cost measures.
- [x] (2026-10-05) Define the initial named 67-configuration market screen,
  including OpenAI Astra, Terra, and Luna, in
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
- [x] (2026-10-05) Create the durable provider-level evidence register at
  `docs/product/feasibility/AI_MODEL_QUALIFICATION_MATRIX.md`; preserve every
  individual configuration as pending until exact official evidence is captured.
- [x] (2026-10-05) Capture first exact OpenAI evidence for GPT-5.6 Terra/Sol/
  Luna, GPT-5.5, GPT-5.4, GPT-5.4 Mini, and GPT-5.2 in the qualification matrix;
  retain every entry as partial and untested.
- [x] (2026-10-05) Capture first exact Google Gemini evidence: record supported
  native Search-grounding entries, Gemini 2.5's existing-user access condition,
  the 3.1 Flash-Lite paired-retrieval requirement, and preview lifecycle risk;
  retain every entry as partial and untested.
- [x] (2026-10-05) Capture first exact Mistral evidence: retain current models
  as partial while exact Agent/search compatibility remains unproven, and
  exclude five named deprecated models from a new-production paid-test path.
- [x] (2026-10-05) Capture first Anthropic and Cohere evidence: record
  Anthropic's cited server-side web-search/cost path without assuming exact
  model compatibility, and retain Cohere only as a paired-retrieval option.
- [x] (2026-10-05) Capture first xAI, DeepSeek, and Kimi evidence: document
  Grok 4.7's native tool path, retain DeepSeek as paired retrieval only, and
  distinguish Kimi's model API from its separate source-returning search API.
- [x] (2026-10-05) Define a proposed test protocol. **Superseded:** Chris
  removed the live-test route; the protocol was deleted and no provider request
  was made.
- [x] (2026-10-05) Expand OpenAI documentary evidence to all 28 named
  configurations: record GPT-6 native-search/structured-output paths and keep
  older/pro variants partial where the exact model page does not establish the
  complete workflow.
- [x] (2026-10-05) Audit the full matrix: 62 configurations are partial, five
  deprecated Mistral configurations are excluded, and no configuration has
  complete documentary evidence for the whole workflow.
- [x] (2026-10-05) Chris removed the live-test route. Delete the protocol and
  record that #23 has no provider account, credential, API request, spend, or
  performance claim in scope.
- [x] (2026-10-05) Compare documented candidate capabilities, make the
  unobserved limits explicit, and recommend provider-neutral design rather than
  selecting a provider.
- [x] (2026-10-05) Update Issue #23 with the documentary-only conclusion and
  leave it open for product-owner review. Evidence: GitHub comment
  `issuecomment-5984826269` and commit `9a444ff`.
- [x] (2026-10-05) Add a current published-price snapshot for every model that
  meets the narrow documented direct-route screen, and a clearly limited top
  three documentation shortlist. No provider request was made.
- [x] (2026-10-05) Add DeepSeek V4.1 Flash and V4 Pro to the pricing evidence
  as server-side paired-retrieval candidates rather than excluding them for
  lacking native web search.
- [ ] Complete official published-price capture for every eligible backend API
  in the 67-configuration list, then rank the three lowest model-token options
  using one stated comparison unit and a light documented MVP suitability
  screen. Keep optional search/retrieval charges separate; do not benchmark or
  score actual model results.
- [x] (2026-10-05) Derive illustrative prompts for MVP 1, MVP 2, and MVP 3;
  define an MVP 1 normal planning profile of 9,000 input and 1,600 output
  tokens with one search request; calculate rough model and published-tool
  components for the currently priced candidates.
- [x] (2026-10-05) Record Chris's confirmation of OpenAI GPT-6 Luna as the MVP
  1 model decision. Keep configuration, provider access, and production proof
  explicitly outside this documentation decision.

## Surprises & Discoveries

- Observation: The approved customer journey uses the generic term
  “AI-search test”; the product owner controls its public terminology.
  Evidence: `docs/product/REQUIREMENTS.md` MVP1-JNY-003 and
  `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` section 3.4.
- Observation: Codex is a development tool in this repository, not a
  customer-facing runtime candidate.
  Evidence: GitHub #23 non-goals and `docs/product/REQUIREMENTS.md`
  MVP1-SEC-001.
- Observation: A provider API-call price is not the cost of a completed
  ShortList assessment when the assessment uses more than one capability;
  documentation alone cannot calculate that cost honestly.
  Evidence: `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`,
  “Cost comparison: two units, not one”.
- Observation: Five named configurations currently have both an official
  direct-route record and published model-plus-search pricing: GPT-6 Astra,
  GPT-6.1 Sol, GPT-6 Luna, Gemini 3.8 Flash, and Grok 4.7.
  Evidence: the pricing snapshot in
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.

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
- Decision: Screen all 67 configurations and test every configuration that
  passes the documentary search-path gate, under an approved cap. **Superseded
  by Chris's later removal of the live-test route.**
  Rationale: Chris requires confirmation that every candidate which could form
  the ShortList search-and-analysis workflow is actually useful. Documentary
  failure excludes a configuration before it can create a billable test.
  Date/Author: 2026-10-05 / Chris's requested review scope, recorded by Codex.
- Decision: Include OpenAI Astra, Terra, and Luna in the 67-configuration screen where
  their current API availability and pricing are documented.
  Rationale: They are server-side model candidates as well as models familiar
  from Codex development sessions, and create a useful capability/cost range
  within one provider family.
  Date/Author: 2026-10-05 / Chris's clarification, recorded by Codex.
- Decision: Require a documented search-path gate and an observed usefulness
  test for every configuration before it can be marked viable for ShortList.
  **Superseded by Chris's later removal of the live-test route.**
  Rationale: API access or generic text quality does not prove that a model can
  obtain dated, source-backed Auckland evidence or produce a useful grounded
  assessment. A model may qualify only as part of a named retrieval-plus-
  analysis workflow.
  Date/Author: 2026-10-05 / Chris's clarified acceptance requirement, recorded
  by Codex.
- Decision: Remove the live-test route from #23.
  Rationale: Chris does not require a live test. The Issue is a
  documentation-only feasibility screen and must not create provider accounts,
  use credentials, make API calls, incur spend, or imply observed quality.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: Add published pricing only for configurations that meet the narrow
  documented direct-route screen, and label the resulting top three as a
  documentation shortlist rather than a quality ranking.
  Rationale: Chris requested usable pricing and a top-three summary without
  reintroducing provider calls or claiming unobserved quality.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: Include DeepSeek's backend API models in the price record as
  paired-retrieval candidates.
  Rationale: A native current-web-search tool is not required for a model to be
  a viable backend analysis component, provided the eventual retrieval provider
  is explicit and separately costed.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: Make server-side API availability and official published pricing,
  rather than native web search, the eligibility rule for #23's price screen.
  Rationale: Chris clarified that #23 compares model price, not a model's
  ability to perform web search or its answer quality.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: Add a light documented general-suitability assessment to the price
  screen.
  Rationale: The MVP needs a credible model that can return a relevant
  structured assessment, but #23 does not need an answer-quality benchmark.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: Use 9,000 input tokens, 1,600 output tokens, and one search
  request as the normal MVP 1 rough-price comparison unit.
  Rationale: The short query itself is not the material cost driver; bounded
  public-page evidence and the structured assessment are. A hard 12,000 input
  and 2,000 output planning cap remains visible for implementation design.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.
- Decision: Select OpenAI GPT-6 Luna as the MVP 1 model.
  Rationale: Chris confirmed the low-cost model as the appropriate MVP 1
  choice after reviewing the documented price comparison and general
  suitability screen.
  Date/Author: 2026-10-05 / Chris, recorded by Codex.

## Outcomes & Retrospective

The completed documentary screen records OpenAI GPT-6 Luna as the selected MVP
1 model. It does not create credentials, incur provider charges, select public
wording, configure an integration, or authorise deployment. Implementation
still needs explicit settings and real verification evidence.

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

Second, make the documentary boundary explicit. Do not create an evaluation
set or contact provider APIs. Record that documentation cannot establish a
dated returned order, actual citations, latency, token/usage data, failures, or
usefulness for a representative Auckland business question.

Third, assess separate capability dimensions:

1. Search grounding: what sources/citations and location controls are
   documented, and what remains unproven?
2. Website analysis: what structured-output mechanism is documented, and what
   exact compatibility remains unproven?
3. Safety and operability: what server-side and lifecycle constraints are
   documented?
4. Cost: what published components are visible, and why can no
   completed-assessment cost be calculated?

Fourth, provide a recommendation with alternatives and exact public wording.
The recommendation can be a provider-neutral architecture, a website-only MVP,
or deferral of the AI-search feature. It must explain what evidence supports
each conclusion and must not infer observed performance from documentation.

## Concrete Steps

From `/home/chris/ShortList`:

    gh issue view 23 --repo successbycs/ShortList --comments
    rg -n -C 2 "AI-search|provider|cost|timeout|citation|Auckland" \
      docs/product/REQUIREMENTS.md docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md
    git diff --check
    python3 scripts/check_markdown_links.py

Use only official provider documentation for documented capability and pricing
claims. The expected outcome is a reviewable documentation screen, not a
provider result.

## Validation and Acceptance

- The comparison uses direct official evidence for capability/pricing claims and
  clearly distinguishes documented features from unobserved product behaviour.
- The recommendation explicitly separates search grounding from website
  analysis and identifies unsupported requirements.
- Public wording is truthful, dated, and does not claim a universal/official
  rank or misname a provider capability.
- No provider option is marked selected or production-ready from documentation
  alone.
- No provider credential, production integration, customer report, external
  contact, payment, deployment, or Symphony dispatch occurs under this plan.

## Idempotence and Recovery

Documentation research and local evidence collection are repeatable. Record
each source's retrieval date and do not overwrite earlier documentation;
append a new dated entry when a provider changes. Do not use a consumer
session, expose a key, create a provider account, or infer runtime behaviour
from an SDK import.

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
