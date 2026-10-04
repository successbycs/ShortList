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

## Expanded 50-configuration evaluation

**Working assumption:** “AI CI implementation” means a server-side,
commercially usable API integration for this product. It does not mean a
consumer-chat subscription, a browser automation workaround, or a model that
can generate code but has no suitable runtime API. Chris should correct this
interpretation if “CI” means something else.

The comparison will have two deliberately separate stages.

### 1. Documentation screen: 50 named model configurations

The next evidence update will catalogue 50 currently offered, server-side
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

### Initial 50-configuration candidate list

This is the named market-screen list. “Configuration” is intentional: where a
provider bills or behaves materially differently by reasoning effort or region,
that combination is a separate comparison entry. It is not a quality ranking,
provider selection, or a claim that every entry has the same search capability.
Each entry must still pass official capability and pricing capture before it can
enter the live-test shortlist.

| # | Provider | Candidate model configuration |
| ---: | --- | --- |
| 1 | OpenAI | GPT-6 Astra — low effort |
| 2 | OpenAI | GPT-6 Astra — medium effort |
| 3 | OpenAI | GPT-6 Astra — high effort |
| 4 | OpenAI | GPT-6 Astra — max effort |
| 5 | OpenAI | GPT-6.1 Sol — low effort |
| 6 | OpenAI | GPT-6.1 Sol — medium effort |
| 7 | OpenAI | GPT-6.1 Sol — high effort |
| 8 | OpenAI | GPT-6 Sol — low effort |
| 9 | OpenAI | GPT-6 Sol — medium effort |
| 10 | OpenAI | GPT-6 Sol — high effort |
| 11 | OpenAI | GPT-5.6 Terra — no reasoning |
| 12 | OpenAI | GPT-5.6 Terra — low effort |
| 13 | OpenAI | GPT-5.6 Terra — medium effort |
| 14 | OpenAI | GPT-6 Luna — no reasoning |
| 15 | OpenAI | GPT-6 Luna — low effort |
| 16 | OpenAI | GPT-6 Luna — medium effort |
| 17 | Google | Gemini 3.8 Flash |
| 18 | Google | Gemini 3.7 Flash |
| 19 | Google | Gemini 3.6 Flash |
| 20 | Google | Gemini 3.5 Flash |
| 21 | Google | Gemini 3.5 Flash-Lite |
| 22 | Google | Gemini 3.1 Flash-Lite |
| 23 | Google | Gemini 3.1 Pro Preview |
| 24 | Google | Gemini 3 Flash Preview |
| 25 | Google | Gemini 2.5 Pro |
| 26 | Google | Gemini 2.5 Flash |
| 27 | Google | Gemini 2.5 Flash-Lite |
| 28 | Mistral | Mistral Large 3 |
| 29 | Mistral | Mistral Medium 3.5 |
| 30 | Mistral | Mistral Small 4 |
| 31 | Mistral | Ministral 3 14B |
| 32 | Mistral | Ministral 3 8B |
| 33 | Mistral | Ministral 3 3B |
| 34 | Mistral | Magistral Medium 1.2 |
| 35 | Mistral | Magistral Small 1.2 |
| 36 | Mistral | Mistral Medium 3.1 |
| 37 | Mistral | Mistral Small 3.2 |
| 38 | Mistral | Devstral 2 |
| 39 | Anthropic | Claude Opus 4.7 |
| 40 | Anthropic | Claude Sonnet 4.6 |
| 41 | Anthropic | Claude Haiku 4.5 |
| 42 | Cohere | Command A+ |
| 43 | Cohere | Command A |
| 44 | Cohere | Command R7B |
| 45 | Cohere | Command R |
| 46 | xAI | Grok 4.7 — standard endpoint, low effort |
| 47 | xAI | Grok 4.7 — standard endpoint, medium effort |
| 48 | xAI | Grok 4.7 — standard endpoint, high effort |
| 49 | xAI | Grok 4.7 — standard endpoint, xhigh effort |
| 50 | xAI | Grok 4.7 — US regional endpoint, high effort |

Provider sources for this initial list: [OpenAI model catalogue](https://developers.openai.com/api/docs/models), [Google Gemini models](https://ai.google.dev/gemini-api/docs/models), [Mistral model catalogue](https://docs.mistral.ai/models/), [Anthropic model pricing](https://docs.anthropic.com/en/docs/about-claude/pricing), [Cohere model documentation](https://docs.cohere.com/docs/how-does-cohere-pricing-work), and [xAI models](https://docs.x.ai/developers/models). The formal pricing pass will replace provider-level references with a direct price source and retrieval date for every entry.

Fifty configurations are a market screen, not a promise that all fifty are
interchangeable candidates. A model without source-backed retrieval cannot by
itself satisfy the dated-search result. A search provider can still be paired
with a different analysis model, which creates a provider *combination* rather
than a single-model choice.

### 2. Controlled quality test: a smaller comparable shortlist

Documentation cannot tell us whether a result is meaningful for ShortList.
After the 50-configuration screen, the evidence should nominate a small shortlist for
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
