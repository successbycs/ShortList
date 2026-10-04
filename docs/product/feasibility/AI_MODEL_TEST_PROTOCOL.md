# AI model qualification test protocol

**Status:** proposed protocol for GitHub Issue #23 — no live tests authorised or run  
**Owner:** Chris approves the blank decision fields before any billable call  
**Companion evidence:** [AI model qualification matrix](AI_MODEL_QUALIFICATION_MATRIX.md)

## Purpose

This protocol makes a provider comparison repeatable. It tests a complete
ShortList workflow, not a generic chat prompt: dated, source-backed search
evidence followed by a structured website assessment based on supplied public
page material.

It does not authorise a provider account, API key, paid request, deployment,
customer contact, public claim, or model selection.

## Approval record — complete before a live test

| Decision | Approved value | Approved by / date |
| --- | --- | --- |
| Total maximum spend (USD, all providers combined) | **Not approved** | — |
| Maximum spend per configuration (USD) | **Not approved** | — |
| Maximum retries after a failure | **Not approved** | — |
| Fixed public Auckland business-type question | **Not approved** | — |
| Fixed, public, non-sensitive website evidence set | **Not approved** | — |
| Usefulness threshold / scoring rule | **Not approved** | — |
| Permitted native and paired retrieval paths | **Not approved** | — |
| Input/output token allowance and maximum search queries | **Not approved** | — |
| Timeout and stop conditions | **Not approved** | — |

No field may be inferred from a provider's documentation or from an earlier
chat discussion. Changing an approved value creates a new, dated test run.

## Entry and exclusion rules

1. A configuration enters testing only after the qualification matrix has direct
   official evidence for an active server-side API, a named retrieval path,
   source/provenance retention, structured-analysis route, and published cost.
2. A configuration that fails an availability or search-path documentary gate is
   marked `excluded` and receives **no paid live test**.
3. An entry requiring external retrieval must name the exact retrieval provider
   and configuration. Its cost and result are recorded as one workflow, never
   as though the analysis model searched the web itself.
4. Every documentary-qualified configuration receives the same approved test
   protocol. A cheaper or more familiar model is not allowed to skip it.

## Fixed workflow once approved

For each qualifying configuration:

1. Record the exact model identifier, effort/region, API endpoint, provider
   documentation URLs, and retrieval configuration.
2. Run the approved dated Auckland business-type search question once, with the
   same context, tool constraints, maximum queries and timeout.
3. Preserve the returned source URLs/citations and any provider query or
   ordering metadata. Do not present the result as a stable or official rank.
4. Provide the same approved public website evidence to the analysis step and
   request the approved JSON schema.
5. Validate JSON parsing and required schema fields without correcting a
   model's output by hand.
6. Capture latency, provider usage fields, billed charge, retries and any typed
   error. Stop immediately if an approved cost or safety limit is met.
7. Score output with the approved rubric. Separate source-backed observation
   from model inference.

## Required run record

Store one record for each attempt. Do not place API keys, personal data, or
unredacted account identifiers in Git.

| Field | Required value |
| --- | --- |
| `run_id` | Stable, non-secret identifier |
| `candidate_id` | One of the 67 identifiers in the matrix |
| `workflow_id` | Native search or exact retrieval-plus-analysis pairing |
| `started_at_utc` / `started_at_auckland` | Same instant in ISO 8601 UTC and Pacific/Auckland |
| `documentation_retrieved_at` | Source retrieval date used for the decision |
| `question` / `location_context` | Exact approved question and context, or `not supported` |
| `website_evidence_digest` | Hash/reference to the fixed public evidence set |
| `request_limits` | Token, query, timeout and retry limits |
| `source_evidence` | URLs/citations and provider metadata as returned |
| `analysis_output` | Stored result reference, JSON parse and schema result |
| `latency_ms` / `usage` / `cost_usd` | Measured duration, provider usage, complete workflow charge |
| `failure_state` | `none` or exact provider/application reason code |
| `rubric_result` | Per-dimension results and pass/conditional/fail outcome |

## Scoring rubric

The owner must specify a pass threshold before testing. A strong prose answer
cannot compensate for missing provenance or a schema failure.

| Dimension | Evidence to score |
| --- | --- |
| Auckland relevance | Uses the approved Auckland context or truthfully records a limitation. |
| Provenance | Retains usable source URLs/citations and distinguishes them from inference. |
| Business usefulness | Answers the fixed question without unsupported companies, claims or certainty. |
| Website assessment | Valid required schema and findings grounded in the supplied public evidence. |
| Operability | Bounded usage, latency, timeout and typed failure handling can be recorded. |
| Cost | Complete workflow cost is within the approved limit, including retrieval and retry. |

## Stop and recovery conditions

Stop the experiment and record evidence if a provider charge exceeds the total
or per-configuration cap, source provenance is missing, a secret would be
exposed, a prohibited result appears, or the test becomes unavailable. Mark the
attempt failed or unobserved; do not retry outside the approved retry rule. A
later owner-approved change starts a new dated run and retains the original.

## Decision output

After all documentary-qualified configurations have been tested, #23 publishes
observed quality, provenance, latency and complete workflow cost. It may select
a bounded option, request a further spike, narrow the customer promise, or
defer the capability. It must not claim that an answer establishes a universal
or enduring ranking.
