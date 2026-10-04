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

## Pricing snapshot

This Issue is a **price-led MVP screen** with a light general-suitability check.
It does not benchmark or score actual answers. A configuration is eligible when
it has a usable server-side API, official published model pricing, and
documentation that it can produce a structured, relevant text assessment from
supplied evidence. Native search and retrieval design are separate product
questions and do not exclude a backend model such as DeepSeek.

All amounts are USD, retrieved 2026-10-05. Token rates are per one million
tokens. Search rates are additional to model tokens. A single customer request
may cause more than one search, so these figures are components, not a customer
price or a cost estimate.

| Candidate configuration(s) | Model tokens: input / output | General MVP suitability from documentation | Optional provider web-search charge |
| --- | --- | --- | --- |
| OpenAI GPT-6 Astra (IDs 1–4) | $10.00 / $50.00 | Strong general reasoning, structured output, and server-side tools are documented; expensive benchmark option. | $10 per 1,000 calls |
| OpenAI GPT-6.1 Sol (IDs 5–7) | $2.00 / $10.00 | Documented as a balanced general-purpose model with structured output and server-side tools. | $10 per 1,000 calls |
| OpenAI GPT-6 Luna (IDs 14–16) | $0.10 / $0.50 | Documented for focused, high-volume tasks with structured output and server-side tools; a credible low-cost MVP candidate. | $10 per 1,000 calls |
| Google Gemini 3.8 Flash (ID 29) | $0.75 / $3.75 introductory rate through 2026-12-31 | Documented general API model with structured output and grounding support; credible MVP candidate. | First 5,000 shared Gemini 3.x search requests/month free, then $14 per 1,000 search requests |
| xAI Grok 4.7 (IDs 58–62) | $2.00 / $6.00 | Documented frontier general model with structured output and server-side tools; credible but not low-cost. | $5 per 1,000 web-search calls |
| DeepSeek-V4.1-Flash (ID 63) | Peak: $0.30 / $1.20; off-peak: $0.15 / $0.60 | Documented server-side model with JSON output and tool calls; credible low-cost MVP analysis candidate. | No provider search price recorded |
| DeepSeek-V4-Pro-0813 (ID 64) | Peak: $1.32 / $3.96; off-peak: $0.66 / $1.98 | Documented server-side model with JSON output and tool calls; credible higher-capability comparison candidate. | No provider search price recorded |

Official sources: [OpenAI pricing](https://platform.openai.com/pricing) and
[GPT-6 Luna model page](https://developers.openai.com/api/docs/models/gpt-6-luna),
[Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and
[Gemini 3.8 Flash guidance](https://ai.google.dev/gemini-api/docs/latest-model),
and [Grok 4.7](https://docs.x.ai/developers/grok-4-7) with [xAI tool
pricing](https://docs.x.ai/developers/pricing).

Official source for DeepSeek: [DeepSeek models and pricing](https://api-docs.deepseek.com/quick_start/pricing/). Peak and off-peak periods are provider-defined and may change.

### Full all-model price ranking

Not determined yet. A valid cheapest-three ranking across all 67 candidates needs the official price
capture completed for all eligible backend APIs in the 67-configuration list,
using the same comparison unit and the same light MVP suitability screen. The
next section of this review will complete that vendor-by-vendor register. It
will rank published **model-token cost** with a general capability flag, and
will show optional search/retrieval charges separately rather than pretending
they are part of a model's price.

## Illustrative prompts and MVP 1 token budget

These are planning examples, not customer-facing wording or approved product
prompts. They show the difference in scope between the MVP stages. MVP 2 and
MVP 3 remain future product decisions.

| Stage | Illustrative prompt or search string | Purpose |
| --- | --- | --- |
| MVP 1 — free Minimum Assessment | `On 2026-10-05, identify three lawn-mowing businesses serving Auckland. Return only the business name, website URL where available, and source URLs. State uncertainty rather than inventing a rank.` | One dated, Auckland-wide comparison teaser based on the business type evidenced on the submitted website. |
| MVP 1 — website assessment | `Using only the supplied public-page extracts for [domain], return a structured assessment: business name, apparent services, Auckland evidence, buyer situations marked as inference, trust evidence, strengths, opportunities, and insufficient-evidence flags.` | Creates the evidence-based assessment behind the teaser and free PDF. |
| MVP 2 — future paid Basic Assessment | `For [domain], compare the available public evidence with businesses offering [business type] in [Auckland suburb]. Identify evidence-backed differentiation opportunities and cite the supplied sources. Do not state unsupported market facts.` | Illustrates the later, more segmented comparison; it is not approved MVP 1 scope. |
| MVP 3 — future consulting | `Create a consulting discussion brief for [domain] from the stored assessment evidence, stated goals, and approved business context. Separate observations, hypotheses, options, and decisions required.` | Illustrates a human-led consulting input, not an automated MVP 1 promise. |

### MVP 1 calculation basis

The literal search string is only roughly 50–90 tokens, depending on the
provider tokenizer. It is not the material cost driver. The website evidence,
the response schema, and the generated assessment are. For a normal successful
MVP 1 assessment, use this common comparison profile:

| Component | Input tokens | Output tokens | Reason for allowance |
| --- | ---: | ---: | --- |
| Instructions, safe-output schema, and run metadata | 450 | — | Fixed backend instruction and structured fields. |
| Dated Auckland search request and returned source context | 650 | 350 | One business-type query and a concise teaser/source response. |
| Sanitised public-page extracts | 7,000 | — | A bounded selection of useful website text, rather than an entire site. |
| Website-assessment instruction and evidence mapping | 900 | 900 | Structured findings, evidence/inference labels, strengths, and opportunities. |
| PDF-ready summary | — | 350 | Concise final summary; deterministic PDF rendering itself uses no model tokens. |
| **Normal planning total** | **9,000** | **1,600** | **One search request plus assessment.** |
| **Hard planning cap** | **12,000** | **2,000** | Limit for unusually content-heavy but accepted sites. |

The normal total is the comparison unit below. It is a planning estimate, not
an observed usage figure. A later implementation must enforce a token cap and
record actual provider usage, as already required by MVP1-ABUSE-001.

### Rough MVP 1 model-cost comparison

For each model: `9,000 / 1,000,000 × input price + 1,600 / 1,000,000 × output
price`. The **model-only** column excludes any search/retrieval tool charge.
The last column adds one provider-native search request only where that price
is published. This is deliberately not a customer price, because a provider
may execute more than one search and a paired retrieval service is not yet
selected.

| Model configuration | Model-only per MVP 1 assessment | Model-only per 1,000 assessments | With one published native-search request per assessment | Interpretation |
| --- | ---: | ---: | ---: | --- |
| OpenAI GPT-6 Astra | $0.1700 | $170.00 | $0.1800 / $180.00 | High-cost capability benchmark. |
| OpenAI GPT-6.1 Sol | $0.0340 | $34.00 | $0.0440 / $44.00 | Mid-cost OpenAI option. |
| OpenAI GPT-6 Luna | $0.0017 | $1.70 | $0.0117 / $11.70 | Lowest listed OpenAI model-token cost; search dominates the total. |
| Google Gemini 3.8 Flash | $0.0128 | $12.75 | $0.0268 / $26.75 after the shared free-search allowance | Introductory token rate ends 2026-12-31; provider may run multiple billable searches. |
| xAI Grok 4.7 | $0.0276 | $27.60 | $0.0326 / $32.60 | One web-search tool call included; US endpoint token use is higher. |
| DeepSeek-V4.1-Flash — peak | $0.0046 | $4.62 | Not calculated: retrieval partner not selected | Low model-token cost; add the chosen retrieval provider later. |
| DeepSeek-V4.1-Flash — off-peak | $0.0023 | $2.31 | Not calculated: retrieval partner not selected | Provider-defined off-peak rate; same retrieval caveat. |
| DeepSeek-V4-Pro-0813 — peak | $0.0182 | $18.22 | Not calculated: retrieval partner not selected | Higher-cost DeepSeek comparison. |
| DeepSeek-V4-Pro-0813 — off-peak | $0.0091 | $9.11 | Not calculated: retrieval partner not selected | Provider-defined off-peak rate; same retrieval caveat. |

At this planning profile, the initial price-focused shortlist is **GPT-6 Luna,
DeepSeek-V4.1-Flash, and Gemini 3.8 Flash**. This is a rough cost shortlist
with a documented MVP-suitability check—not a measured quality ranking or a
provider-selection decision. DeepSeek's final combined cost cannot be ranked
fairly until its retrieval source is chosen.

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

- **OpenAI GPT-6 Luna is selected for MVP 1.** This is a product decision, not
  proof of a configured provider account, API call, or production readiness.
- No claim is made about a stable, official, or universally correct ranking.
- No customer-facing terminology is selected.
- No “lowest cost” conclusion is possible from documentation because the actual
  search count, token use, latency, failure rate, and result quality are
  unobserved.
- Anthropic, DeepSeek, consumer ChatGPT use, and other options are not excluded;
  they are simply outside this first official-documentation comparison.

## Documentation-only conclusion and recommendation

OpenAI GPT-6 Luna is selected for MVP 1 by product-owner decision. The official
sources establish its server-side model, web-search, and structured-output
route, but documentation alone cannot qualify the configured integration as
production-ready for ShortList.

The implementation direction is to configure GPT-6 Luna behind separate search
acquisition and website-analysis interfaces, preserve sources and timestamps,
and enforce the approved token, timeout, and failure limits when those are
specified. No public wording may infer a guaranteed ranking, result quality,
latency, price, or Auckland precision from this review. This narrows the claim
that #23 can honestly support while preserving the MVP requirement for dated,
source-backed results.
