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
target, or is ready for production. Issue #23 deliberately makes no provider
request, so those questions remain unobserved rather than silently assumed.

The product owner retains control of the customer-facing name for this result.
This review records technical capability and provenance only.

## Assumptions and decisions required

| Topic | Current position | Documentation-only disposition |
| --- | --- | --- |
| Runtime boundary | A production candidate must be a commercially usable, server-side API integration. Consumer chat use and browser automation are outside scope. | retained working boundary |
| Candidate coverage | The 67 configurations are a market screen. A configuration means a base model plus a materially different reasoning effort or endpoint where applicable. | retained working boundary |
| Qualification coverage | Every configuration must have documented API, search-path, provenance, structured-output, pricing, and availability/deprecation evidence. | required evidence |
| Observed quality and cost | Usefulness, ordering, latency, actual token use, and completed-assessment cost cannot be established from documentation. | explicitly unobserved in #23 |
| Evaluation workload | Input/output allowance, search-query cap, retries, timeouts, evaluation set, and retrieval pairing are not product decisions made by this Issue. | deferred to a later implementation/design decision |
| Provider authority | No account, credential, provider configuration, or API request is in scope. | no live-test route |
| Provider terms | Commercial eligibility, data handling, regional availability, quotas, and current prices must be proven from official sources per configuration. | required evidence |

No unresolved item in this table is silently converted into a product decision.

## Documentation comparison

| Candidate approach | Documented search/provenance capability | Documented structured-analysis capability | Documented cost signal at retrieval | Documentation limit |
| --- | --- | --- | --- | --- |
| OpenAI Responses API with web search | The server-side web-search tool can return URL citations and accepts approximate user-location context. | Structured Outputs can constrain a response to a JSON schema. | Web search is listed at US$10 per 1,000 calls, in addition to model and search-content token charges. | It does not prove useful dated Auckland output, ordering, latency, or completed-assessment cost. |
| Google Gemini API with Google Search grounding | Grounding can expose search queries, web results, citations, and grounding metadata. | Gemini structured output supports JSON-schema-shaped results with built-in tools. | Search-grounding pricing is documented per search request, with model-token pricing separate; model execution may involve more than one search query. | It does not prove location fit, combined tool/schema behaviour, or a bounded assessment cost. |
| Perplexity Search API plus a separately selected analysis model | Search API returns structured, ranked, real-time results and offers domain, language, and region controls. | The Search API is a retrieval API; a separate structured-analysis step is required. Perplexity also documents an Agent API for generated cited answers, but that is a distinct evaluation option. | Standard Search is listed at US$5 per 1,000 successful requests and Fast Search at US$1 per 1,000; generated-answer/Agent use has separate invocation and model-token charges. | It does not prove that a retrieval-plus-analysis combination is useful, attributable, or economical for the product. |

Primary documentation: [OpenAI web-search quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request), [OpenAI pricing](https://platform.openai.com/pricing), [OpenAI Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs), [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search), [Google structured output](https://ai.google.dev/gemini-api/docs/structured-output), [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [Perplexity Search quickstart](https://docs.perplexity.ai/docs/search/quickstart), and [Perplexity pricing](https://docs.perplexity.ai/docs/getting-started/pricing).

Pricing is a documented signal, not a ShortList budget or a promise. It can
change and must be rechecked before any future provider selection or
implementation.

## Expanded 67-configuration evaluation

**Working assumption:** “AI CI implementation” means a server-side,
commercially usable API integration for this product. It does not mean a
consumer-chat subscription, a browser automation workaround, or a model that
can generate code but has no suitable runtime API. Chris should correct this
interpretation if “CI” means something else.

The comparison will have two deliberately separate stages.

### 1. Documentation screen: 67 named model configurations

The next evidence update will catalogue 67 currently offered, server-side
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

### Initial 67-configuration candidate list

This is the named market-screen list. “Configuration” is intentional: where a
provider bills or behaves materially differently by reasoning effort or region,
that combination is a separate comparison entry. It is not a quality ranking,
provider selection, or a claim that every entry has the same search capability.
Each entry must still have official capability and pricing evidence before it
can inform a future provider-selection decision.

## Mandatory per-configuration qualification

Every one of the 67 entries must be classified against the ShortList workflow;
the candidate list alone is not evidence of eligibility. The qualification
record for each entry must answer all of the following.

| Gate | Required evidence | Possible outcome |
| --- | --- | --- |
| Server-side implementation | Official documentation shows a supported API route suitable for a commercial server-side integration. | eligible, conditional, or excluded |
| Search path | Official documentation shows either a native server-side web-search/grounding tool **or** a compatible, separately named retrieval-provider path. Consumer-chat browsing is not evidence. | native search, paired retrieval required, or no supported path |
| Provenance | The selected search path returns usable source URLs/citations or retains the underlying sources used to form the result. | passes, conditional, or fails |
| Structured website analysis | Official documentation establishes whether a schema-shaped response route is documented for supplied public-page evidence. | documented, conditional, or absent |
| Useful result | No provider request is made. Usefulness, Auckland relevance, and grounded assessment quality are unobserved. | explicitly unobserved |
| Cost and operation | Published prices and operational limits are recorded where documented. Actual usage, cost, latency, and failure behaviour are unobserved. | documentation-only or incomplete |

“Paired retrieval required” is valid only when the resulting combination is
designed and priced as one workflow. It must name both the retrieval provider
and analysis model. We will not imply that a text-only model has searched the
web when it has not.

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
| 17 | OpenAI | GPT-5.6 Sol |
| 18 | OpenAI | GPT-5.6 Luna |
| 19 | OpenAI | GPT-5.5 |
| 20 | OpenAI | GPT-5.5 Pro |
| 21 | OpenAI | GPT-5.4 |
| 22 | OpenAI | GPT-5.4 Mini |
| 23 | OpenAI | GPT-5.4 Pro |
| 24 | OpenAI | GPT-5.2 |
| 25 | OpenAI | GPT-5.2 Pro |
| 26 | OpenAI | GPT-5 |
| 27 | OpenAI | GPT-5 Mini |
| 28 | OpenAI | GPT-5 Nano |
| 29 | Google | Gemini 3.8 Flash |
| 30 | Google | Gemini 3.7 Flash |
| 31 | Google | Gemini 3.6 Flash |
| 32 | Google | Gemini 3.5 Flash |
| 33 | Google | Gemini 3.5 Flash-Lite |
| 34 | Google | Gemini 3.1 Flash-Lite |
| 35 | Google | Gemini 3.1 Pro Preview |
| 36 | Google | Gemini 3 Flash Preview |
| 37 | Google | Gemini 2.5 Pro |
| 38 | Google | Gemini 2.5 Flash |
| 39 | Google | Gemini 2.5 Flash-Lite |
| 40 | Mistral | Mistral Large 3 |
| 41 | Mistral | Mistral Medium 3.5 |
| 42 | Mistral | Mistral Small 4 |
| 43 | Mistral | Ministral 3 14B |
| 44 | Mistral | Ministral 3 8B |
| 45 | Mistral | Ministral 3 3B |
| 46 | Mistral | Magistral Medium 1.2 |
| 47 | Mistral | Magistral Small 1.2 |
| 48 | Mistral | Mistral Medium 3.1 |
| 49 | Mistral | Mistral Small 3.2 |
| 50 | Mistral | Devstral 2 |
| 51 | Anthropic | Claude Opus 4.7 |
| 52 | Anthropic | Claude Sonnet 4.6 |
| 53 | Anthropic | Claude Haiku 4.5 |
| 54 | Cohere | Command A+ |
| 55 | Cohere | Command A |
| 56 | Cohere | Command R7B |
| 57 | Cohere | Command R |
| 58 | xAI | Grok 4.7 — standard endpoint, low effort |
| 59 | xAI | Grok 4.7 — standard endpoint, medium effort |
| 60 | xAI | Grok 4.7 — standard endpoint, high effort |
| 61 | xAI | Grok 4.7 — standard endpoint, xhigh effort |
| 62 | xAI | Grok 4.7 — US regional endpoint, high effort |
| 63 | DeepSeek | DeepSeek-V4.1-Flash |
| 64 | DeepSeek | DeepSeek-V4-Pro-0813 |
| 65 | Moonshot AI | Kimi K3 |
| 66 | Moonshot AI | Kimi K2.6 — thinking mode |
| 67 | Moonshot AI | Kimi K2.6 — non-thinking mode |

The OpenAI 5.x entries are included for coverage, not presumed suitable for a
new production dependency. The pricing pass must record their then-current API
availability, deprecation state, and supported tools before they can inform a
future selection. An older model that remains callable but has a published
replacement or retirement date will be compared for evidence only and not
recommended as the default without an explicit exception.

Provider sources for this initial list: [OpenAI model catalogue](https://developers.openai.com/api/docs/models), [Google Gemini models](https://ai.google.dev/gemini-api/docs/models), [Mistral model catalogue](https://docs.mistral.ai/models/), [Anthropic model pricing](https://docs.anthropic.com/en/docs/about-claude/pricing), [Cohere model documentation](https://docs.cohere.com/docs/how-does-cohere-pricing-work), [xAI models](https://docs.x.ai/developers/models), [DeepSeek models and pricing](https://api-docs.deepseek.com/quick_start/pricing/), and [Kimi API overview](https://www.kimi.ai/help/kimi-api/api-overview). The formal pricing pass will replace provider-level references with a direct price source and retrieval date for every entry.

Sixty-seven configurations are a market screen, not a promise that all sixty-seven are
interchangeable candidates. A model without source-backed retrieval cannot by
itself satisfy the dated-search result. A search provider can still be paired
with a different analysis model, which creates a provider *combination* rather
than a single-model choice.

### 2. Documentation-only assessment limits

Documentation can establish API routes, stated provenance mechanics,
structured-output options, lifecycle notices, and published price components.
It cannot establish whether a ShortList result is useful, whether it reflects
the intended Auckland context, whether sources support the output, or actual
latency, token use, cost, and failure behaviour. Those are deliberately not
claimed by this Issue.

Published prices are retained as comparison signals only. A completed-
assessment price would require a fixed request profile and observed usage, so
this review does not calculate one. Provider price pages must be rechecked at
the point of any future implementation decision.

## What is deliberately not concluded

- No provider is selected.
- No claim is made about a stable, official, or universally correct ranking.
- No customer-facing terminology is selected.
- No “lowest cost” conclusion is possible from documentation because the actual
  search count, token use, latency, failure rate, and result quality are
  unobserved.
- Anthropic, DeepSeek, consumer ChatGPT use, and other options are not excluded;
  they are simply outside this first official-documentation comparison.

## Documentation-only conclusion and recommendation

No provider is selected by #23. The official sources establish that several
providers document server-side search, provenance, and structured-output
routes, but documentation alone cannot qualify a provider as production-ready
for ShortList.

The recommended direction is provider-neutral application design: keep search
acquisition and website analysis as separate interfaces, preserve sources and
timestamps, and decide a concrete provider only during a future implementation
decision. No public wording may infer a guaranteed ranking, result quality,
latency, price, or Auckland precision from this review. This narrows the claim
that #23 can honestly support while preserving the MVP requirement for dated,
source-backed results.
