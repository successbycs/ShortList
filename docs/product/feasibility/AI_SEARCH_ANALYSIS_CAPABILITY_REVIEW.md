# AI-search and website-analysis capability review

**Status:** documentation-only evidence; provider and customer-facing terminology remain open for product-owner decision  
**Issue:** [#23](https://github.com/successbycs/ShortList/issues/23)  
**Retrieved:** 2026-10-05 (Pacific/Auckland)  
**Scope:** MVP 1 feasibility only. No credentials, provider configuration, live API calls, charges, customer data, or public result claims were used.

## Decision this evidence supports

ShortList needs two distinct capabilities:

1. a dated, source-backed AI-search result for an Auckland business-type query; and
2. a structured assessment of supplied public website evidence.

Official documentation establishes that several server-side options can be
evaluated. It does **not** establish that any option produces useful Auckland
results, follows the desired meaning of “top three”, meets a latency or cost
target, or is ready for production. Those questions require a separately
approved, capped live test.

The product owner retains control of the customer-facing name for this result.
This review records technical capability and provenance only.

## Documentation comparison

| Candidate approach | Documented search/provenance capability | Documented structured-analysis capability | Documented cost signal at retrieval | What live evidence must establish |
| --- | --- | --- | --- | --- |
| OpenAI Responses API with web search | The server-side web-search tool can return URL citations and accepts approximate user-location context. | Structured Outputs can constrain a response to a JSON schema. | Web search is listed at US$10 per 1,000 calls, in addition to model and search-content token charges. | Whether a dated Auckland query returns adequate sources, useful ordering, repeatable evidence, latency, and total per-assessment cost. |
| Google Gemini API with Google Search grounding | Grounding can expose search queries, web results, citations, and grounding metadata. | Gemini structured output supports JSON-schema-shaped results with built-in tools. | Search-grounding pricing is documented per search request, with model-token pricing separate; model execution may involve more than one search query. | Whether location and citation detail meet the product need, and how many billable searches/tokens a bounded assessment uses. |
| Perplexity Search API plus a separately selected analysis model | Search API returns structured, ranked, real-time results and offers domain, language, and region controls. | The Search API is a retrieval API; a separate structured-analysis step is required. Perplexity also documents an Agent API for generated cited answers, but that is a distinct evaluation option. | Standard Search is listed at US$5 per 1,000 successful requests and Fast Search at US$1 per 1,000; generated-answer/Agent use has separate invocation and model-token charges. | Whether raw retrieved results are sufficient for the product experience, or whether a cited-answer path is needed; quality, provenance, latency, and total combined cost. |

Primary documentation: [OpenAI web-search quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request), [OpenAI pricing](https://platform.openai.com/pricing), [OpenAI Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs), [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search), [Google structured output](https://ai.google.dev/gemini-api/docs/structured-output), [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [Perplexity Search quickstart](https://docs.perplexity.ai/docs/search/quickstart), and [Perplexity pricing](https://docs.perplexity.ai/docs/getting-started/pricing).

Pricing is a documented signal, not a ShortList budget or a promise. It can
change and must be rechecked immediately before any live test or provider
selection.

## Expanded 20-model evaluation

**Working assumption:** “AI CI implementation” means a server-side,
commercially usable API integration for this product. It does not mean a
consumer-chat subscription, a browser automation workaround, or a model that
can generate code but has no suitable runtime API. Chris should correct this
interpretation if “CI” means something else.

The comparison will have two deliberately separate stages.

### 1. Documentation screen: 20 named model configurations

The next evidence update will catalogue 20 currently offered, server-side
model configurations across multiple providers. Each entry must have a direct
official source and record:

- model and provider identity, availability date checked, and API endpoint;
- commercial/API eligibility and any material access limitation;
- web-search or retrieval method, source/citation support, and location control;
- structured-output support and usable context limit;
- published input, output, tool/search, storage, and any mandatory platform
  charges; and
- whether it is suitable for search, website analysis, or only one part of the
  assessment.

The screen explicitly includes OpenAI **Astra**, **Terra**, and **Luna** where
their current API availability and pricing are documented. They provide a
useful high-capability, balanced, and cost-sensitive comparison within one
provider family. OpenAI documents latest models as available through the
Responses API and SDKs, and documents Astra with web-search and structured-
output support; the exact model IDs, availability, and current pricing will be
captured against the official model catalogue at the time of the screen.

Twenty models are a market screen, not a promise that all twenty are
interchangeable candidates. A model without source-backed retrieval cannot by
itself satisfy the dated-search result. A search provider can still be paired
with a different analysis model, which creates a provider *combination* rather
than a single-model choice.

### 2. Controlled quality test: a smaller comparable shortlist

Documentation cannot tell us whether a result is meaningful for ShortList.
After the 20-model screen, the evidence should nominate a small shortlist for
the same, approved live test. Each result will be scored against a published
rubric:

| Dimension | Passing evidence |
| --- | --- |
| Auckland relevance | The response uses the stated Auckland context and records any location limitation. |
| Source provenance | It retains usable source URLs/citations and makes clear what is observed versus inferred. |
| Meaningful business result | It answers the fixed business question without inventing unsupported companies, claims, or certainty. |
| Website assessment quality | Required structured fields are complete, grounded in supplied public-page evidence, and useful to a small-business owner. |
| Operability | Server-side secret boundary, bounded inputs/outputs, usage data, latency, and reason-coded failure can be recorded. |

The rubric must be applied to the same public, non-sensitive test set and
reviewed before any provider is declared preferable. A real result is evidence
for that exact time, prompt, model, and configuration only.

## Cost comparison: two units, not one

The review will report both of these, in USD and with the retrieval date:

1. **1,000 provider API calls:** a normalized request profile applied to every
   eligible model. This makes published per-token and per-tool prices
   comparable, but is not a customer journey.
2. **1,000 completed Minimum Assessments:** the observed full workflow cost,
   including each search/retrieval call, website-analysis call, model tokens,
   retries, and any required storage or delivery step. This is the product
   decision measure.

Before calculating either number, the review must lock one explicit request
profile: input-token allowance, output-token allowance, whether retrieval is a
separate call, maximum search queries, and whether reasoning/tool tokens count
inside the cap. Otherwise a “price for 1,000 calls” comparison would be false
precision. Provider prices and tool charging rules differ: for example,
OpenAI lists web search separately from model tokens, Gemini documents
grounding/search charges separately from model tokens, and Perplexity separates
retrieval and generated-answer pricing.

## What is deliberately not concluded

- No provider is selected.
- No claim is made about a stable, official, or universally correct ranking.
- No customer-facing terminology is selected.
- No “lowest cost” conclusion is possible until the actual search count, token
  use, latency, failure rate, and result quality are observed under the same
  bounded test.
- Anthropic, DeepSeek, consumer ChatGPT use, and other options are not excluded;
  they are simply outside this first official-documentation comparison.

## Proposed controlled test, pending approval

Before a live test, Chris should approve the providers to compare, a total
spend cap, and the test set. The test should use the same small set of public,
non-sensitive Auckland business queries for each chosen option and retain:

- exact question and Auckland-local and UTC time;
- configured location/context and capability or model identity;
- returned result, source URLs/citations, and any declared ordering;
- structured website-analysis output from the same supplied public-page
  evidence;
- latency, token/usage data, billed cost, and reason-coded failures.

The outcome is a decision record for #23: select a bounded provider design,
run a further spike, narrow the feature promise, or defer the AI-search part of
MVP 1. It is not a customer-facing benchmark or outreach activity.
