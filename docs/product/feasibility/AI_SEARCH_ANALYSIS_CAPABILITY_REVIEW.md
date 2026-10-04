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
