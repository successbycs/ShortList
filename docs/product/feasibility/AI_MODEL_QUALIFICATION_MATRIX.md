# AI model qualification matrix

**Status:** documentation-only evidence register for GitHub Issue #23; no provider account, credential, or API request used
**Retrieved:** 2026-10-05 (Pacific/Auckland)  
**Companion review:** [AI-search and website-analysis capability review](AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md)

## How to read this register

This register is the authoritative per-candidate evidence record for the 67
configurations named in the companion review. `Pending` means no claim has
been made; it is not a pass. This Issue does not include a provider test route:
the register records only cited documentation and its limits.

| Status | Meaning |
| --- | --- |
| pending | The exact configuration has not yet been verified from official documentation. |
| partial | Some exact official evidence is captured, but at least one documentary gate remains open. |
| documentary pass | Official documentation establishes the required API/search/provenance/format route; it is not a performance or production qualification. |
| excluded | Official evidence establishes that the configuration cannot form the required workflow. |

## Provider evidence register

| Candidate IDs | Provider | Server-side API evidence | Search and provenance evidence | Structured format evidence | Documentary state | Issue #23 scope status |
| --- | --- | --- | --- | --- | --- | --- |
| 1–28 | OpenAI | [Model catalogue](https://developers.openai.com/api/docs/models) | [Web-search tool](https://platform.openai.com/docs/quickstart/make-your-first-api-request); verify tool support for each 5.x/6.x configuration | [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs); verify per model | pending per configuration | documentation only |
| 29–39 | Google | [Gemini API models](https://ai.google.dev/gemini-api/docs/models) | [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search); verify per model | [Structured output](https://ai.google.dev/gemini-api/docs/structured-output); verify per model | pending per configuration | documentation only |
| 40–50 | Mistral | [Model catalogue](https://docs.mistral.ai/models/) | [Agents web-search connector](https://docs.mistral.ai/studio/agents/introduction); verify model/agent compatibility and citations | [Model comparison](https://docs.mistral.ai/getting-started/models/compare); verify per model | pending per configuration | documentation only |
| 51–53 | Anthropic | [Claude API pricing/model source](https://docs.anthropic.com/en/docs/about-claude/pricing) | Official web-search capability and exact model compatibility pending | Official structured-output capability and exact model compatibility pending | pending per configuration | documentation only |
| 54–57 | Cohere | [Command model pricing and API overview](https://docs.cohere.com/docs/how-does-cohere-pricing-work) | No native server-side web-search path evidenced in this register; evaluate a named paired retrieval provider | [Command A+ capabilities](https://docs.cohere.com/docs/command-a-plus); verify other Command models | pending per configuration | documentation only |
| 58–62 | xAI | [Grok 4.7 API guide](https://docs.x.ai/developers/grok-4-7) | Grok 4.7 documents server-side web and X search; capture citation/provenance behaviour and regional difference | Grok 4.7 documents structured outputs | pending exact effort/region evidence | documentation only |
| 63–64 | DeepSeek | [Models and pricing](https://api-docs.deepseek.com/quick_start/pricing/) | No native server-side web-search path evidenced in this register; evaluate a named paired retrieval provider | Exact structured-output evidence pending | pending per configuration | documentation only |
| 65–67 | Moonshot AI / Kimi | [Kimi API overview](https://www.kimi.ai/help/kimi-api/api-overview) | [Kimi Web Search APIs](https://www.kimi.ai/academy/best-practices-for-web-search); verify exact K3/K2.6 pairing | [Kimi JSON mode](https://www.kimi.ai/ja/help/kimi-api/api-model-capabilities); verify exact K3/K2.6 pairing | pending per configuration | documentation only |

## Individual evidence capture: OpenAI first pass

### What this means in plain English

OpenAI has the clearest documented building blocks for ShortList: several
current models are described as supporting the server-side Responses API, web
search, and structured output. That makes them sensible **future design
candidates**, not chosen providers. This Issue made no provider request, so it
does not prove that any one of them produces a useful Auckland result or a good
website assessment.

The simple answer is: OpenAI's current GPT-6 and GPT-5.6 family has the most
complete paperwork; GPT-5.4 is also documented; older and Pro entries have
gaps. Nothing here is a recommendation to buy, configure, or use a model.

### What the documentation says

| Candidate IDs | Plain-English position | Documented model price (input / output) | Important gap |
| --- | --- | --- | --- |
| 1–4 | **GPT-6 Astra**: documented API, web search, structured output, and several effort settings. | US$10 / $50 per million tokens | Tool cost, citation storage, Auckland control, account availability, and real-world output are not established here. |
| 5–7 | **GPT-6.1 Sol**: same documented building blocks, at a lower listed token price than Astra. | US$2 / $10 per million tokens | Same gaps as Astra. |
| 8–10 | **GPT-6 Sol**: documented API, built-in tools, structured output, and web search. | US$2 / $10 per million tokens | Exact effort availability and the same operational gaps remain. |
| 11–13 | **GPT-5.6 Terra**: documented API, web search, and structured output. | US$2 / $12 per million tokens | Tool cost, citation behaviour, location control, availability, and actual results are unknown. |
| 14–16 | **GPT-6 Luna**: documented API, web search, structured output, and several effort settings at the lowest listed token price in this group. | US$0.10 / $0.50 per million tokens | Low price is not proof of a useful result or total assessment cost. |
| 17–19 | **GPT-5.6 Sol, GPT-5.6 Luna, GPT-5.5**: each has documented API, structured-output, and web-search support. | Sol: US$4 / $20; Luna: price not yet extracted; GPT-5.5: US$5 / $30 per million tokens | The same tool, location, availability, and real-world behaviour gaps remain. |
| 21–22 | **GPT-5.4 and GPT-5.4 Mini**: documented API, web search, and structured output. | GPT-5.4: US$2.50 / $15; Mini: US$0.75 / $4.50 per million tokens | The same operational and output-quality gaps remain. |
| 20 and 23 | **GPT-5.5 Pro and GPT-5.4 Pro**: pricing is documented, but the full ShortList capability route is not yet evidenced in this review. | US$30 / $180 per million tokens | API, web search, structured output, availability, and lifecycle evidence are incomplete. |
| 24–25 | **GPT-5.2 and GPT-5.2 Pro**: some catalogue/API evidence exists. | Not fully extracted | The required search and structured-output route is not established. |
| 26–28 | **GPT-5, GPT-5 Mini, GPT-5 Nano**: older family entries retained for comparison. | Not fully extracted | Exact current API/tool support, lifecycle, and pricing evidence are incomplete. |

Official sources: [OpenAI model catalogue](https://developers.openai.com/api/docs/models), [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra), [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5), [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4), and [all models](https://developers.openai.com/api/docs/models/all).

## Individual evidence capture: Google Gemini first pass

All entries below remain **partial** and untested. Google's model catalogue
provides the current API identifiers and lifecycle state; its Grounding with
Google Search guide explicitly names the configurations with native search
support. Its structured-output guide demonstrates JSON-schema response formats
with Gemini 3.8 Flash, but this documentation pass does **not** establish that
every listed configuration supports the exact combined grounded-search plus
structured-analysis workflow. This Issue does not invoke that combined route.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Remaining documentary work | Observed state |
| --- | --- | --- | --- | --- | --- |
| 29 | Gemini 3.8 Flash (`gemini-3.8-flash`) | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding](https://ai.google.dev/gemini-api/docs/google-search), [structured output](https://ai.google.dev/gemini-api/docs/structured-output), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Current stable API model; native Google Search grounding is documented. The response includes executed queries and inline URL citations with source URL/title and text offsets. JSON-schema response format is documented; listed at US$0.75/M input and US$4.50/M output. Paid search is 5,000 shared Gemini 3.x requests/month then US$14/1,000 requests; one request can create multiple billable search queries. | Auckland/location control is not documented in the cited Search-grounding guide; combined tool-and-schema compatibility, selected-account availability, and normalized cost remain open | not tested |
| 30–33 | Gemini 3.7 Flash, 3.6 Flash, 3.5 Flash, 3.5 Flash-Lite | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Current stable API identifiers and native Google Search grounding are documented. | exact structured-output support, per-model token price extraction, citation payload retention, Auckland/location control, and normalized cost | not tested |
| 34 | Gemini 3.1 Flash-Lite | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Current stable API model and token prices are documented; it is absent from Google's native Search-grounding supported-model table. | an approved named paired-retrieval path, exact structured-output support, provenance, availability, and normalized combined cost | not tested |
| 35–36 | Gemini 3.1 Pro Preview, Gemini 3 Flash Preview | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search) | Native Google Search grounding is documented. Both are preview endpoints; Google says preview models can have tighter rate limits and shorter deprecation notice. | exact structured-output support, pricing, citation payload retention, Auckland/location control, and acceptance of preview lifecycle risk | not tested |
| 37–39 | Gemini 2.5 Pro, 2.5 Flash, 2.5 Flash-Lite | [Model catalogue access note](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Native Google Search grounding is documented, but Google limits 2.5 API access to users who actively used those models in the past and recommends 3.5 Flash-Lite or 3.8 Flash for new projects. | evidence that the intended ShortList account qualifies for access; exact structured-output support, pricing, provenance, location control, and normalized cost. Do not treat these as available to a new project without that evidence. | not tested |

## Individual evidence capture: Mistral first pass

Mistral documents web search, structured outputs, and citations for its Agents
and Conversations API at product level. It does not, in the cited page, map
those functions to each named model. That is insufficient to qualify an exact
configuration for ShortList's workflow. The current model catalogue does,
however, identify five named configurations as deprecated; those are excluded
from a new-production path.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- |
| 40–45 | Mistral Large 3; Mistral Medium 3.5; Mistral Small 4; Ministral 3 14B, 8B, 3B | [Current model catalogue](https://docs.mistral.ai/models/), [pricing](https://docs.mistral.ai/inference/pricing), [Agents and Conversations](https://docs.mistral.ai/studio/agents/introduction) | Listed as current models with published standard input/output prices respectively: US$0.50/$1.50; $1.50/$7.50; $0.15/$0.60; $0.20/$0.20; $0.15/$0.15; and $0.10/$0.10 per million tokens. Mistral's agent product documents web search, citations, and structured outputs at product level. | partial — exact model-to-Agent/Search/Structured Output compatibility, web-source payload, location control, agent/tool charges, availability for the selected account, and normalized workflow cost are not established | not tested |
| 46–50 | Magistral Medium 1.2; Magistral Small 1.2; Mistral Medium 3.1; Mistral Small 3.2; Devstral 2 | [Deprecated-model list](https://docs.mistral.ai/models/) | Each exact named configuration is listed by Mistral as deprecated. | excluded — do not select for a new ShortList production dependency; retain only as market-screen evidence | documentation only |

## Individual evidence capture: Anthropic first pass

Anthropic documents a server-side Claude web-search tool that returns source
citations and usage/error data. The cited web-search guide does not itself
provide an exact compatibility table for all three named configurations, so
this pass does not assume any of them can form the final workflow. The pricing
page supplies a current token-cost signal and a separate US$10/1,000-search
charge.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- |
| 51 | Claude Opus 4.7 | [Pricing](https://platform.claude.com/docs/en/about-claude/pricing), [web-search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) | First-party API pricing is US$5/M input and US$25/M output. The web-search tool returns source citations, URL/title/cited text, usage counts, and typed errors; web search costs US$10/1,000 searches plus token charges. | partial — exact model/tool compatibility, structured-output support, location control, availability, and normalized workflow cost | not tested |
| 52 | Claude Sonnet 4.6 | [Pricing](https://platform.claude.com/docs/en/about-claude/pricing), [web-search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) | First-party API pricing is US$3/M input and US$15/M output. The web-search guide says dynamic filtering is available on Claude 4.6 and later. | partial — exact web-search tool version/structured-output compatibility, provenance retention, location control, availability, and normalized workflow cost | not tested |
| 53 | Claude Haiku 4.5 | [Pricing](https://platform.claude.com/docs/en/about-claude/pricing), [web-search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) | First-party API pricing is US$1/M input and US$5/M output. | partial — the cited documentation does not yet establish exact web-search or structured-output compatibility, provenance, location control, availability, or normalized workflow cost | not tested |

## Individual evidence capture: Cohere first pass

No native, current-web retrieval tool is established for the four named
Cohere models in this register. Model capability, citation, and structured
output documentation therefore does not make an entry a search candidate by
itself: any qualifying workflow must name, price, and test a separate
retrieval provider.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- |
| 54 | Command A+ | [Model page](https://docs.cohere.com/docs/command-a-plus), [pricing overview](https://docs.cohere.com/docs/how-does-cohere-pricing-work) | Cohere documents citations, tool use, and structured outputs for Command A+; its model page says it can be used in production through Model Vault and is free until the relevant rate limit. | partial — approved paired retrieval, current commercial/API path and price after rate limits, source/provenance retention, location control, and normalized combined cost | not tested |
| 55–57 | Command A; Command R7B; Command R | [Model/pricing overview](https://docs.cohere.com/docs/how-does-cohere-pricing-work) | Cohere lists these as generative API models priced on input/output tokens. | partial — exact structured-output/citation support, approved paired retrieval, API availability and price, provenance/location control, and normalized combined cost | not tested |

## Individual evidence capture: xAI first pass

The exact Grok 4.7 API model page documents the named reasoning efforts,
Responses API, native web-search tool, token prices, and a separate US endpoint.
The web-search guide shows a server-side API request and citations. This is
still **partial**: documentation does not prove the ShortList result quality,
Auckland relevance, total tool charge, or that the exact combined search and
structured-analysis request is reliable.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- |
| 58–61 | Grok 4.7 standard endpoint — low, medium, high, xhigh effort | [Grok 4.7 model page](https://docs.x.ai/developers/grok-4-7), [web search](https://docs.x.ai/developers/tools/web-search) | `grok-4.7` supports the Responses API, low/medium/high/xhigh effort, native web search and a cited response. Published price is US$2/M input and US$6/M output. | partial — structured-output request details, web-tool pricing, citation retention, Auckland/location control, account availability, and normalized workflow cost | not tested |
| 62 | Grok 4.7 US regional endpoint — high effort | [Grok 4.7 model page](https://docs.x.ai/developers/grok-4-7), [web search](https://docs.x.ai/developers/tools/web-search) | xAI documents `https://us.api.x.ai/v1` as keeping inference in the United States with a 10% token-price premium; model/tool evidence is otherwise as above. | partial — same requirements as IDs 58–61, plus whether the US-only data route meets the selected product/data policy | not tested |

## Individual evidence capture: DeepSeek first pass

DeepSeek's current API documentation confirms both named models have
server-side OpenAI- and Anthropic-compatible API routes, JSON output, tool
calls, and published peak/off-peak token prices. No native current-web search
or source-provenance service is established in this register. The models can
only enter a ShortList workflow with an approved, named, separately costed
retrieval provider.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- |
| 63 | DeepSeek-V4.1-Flash (`deepseek-flash`) | [Model/pricing reference](https://api-docs.deepseek.com/quick_start/pricing/), [JSON output](https://api-docs.deepseek.com/guides/json_mode/) | Server-side API, JSON output, tool calls, 1M context; peak US$0.30/M cache-miss input and US$1.20/M output, half that off peak. | partial — approved paired retrieval, source/citation retention, location control, availability, JSON schema reliability, and normalized combined cost | not tested |
| 64 | DeepSeek-V4-Pro-0813 (`deepseek-v4-pro`) | [Model/pricing reference](https://api-docs.deepseek.com/quick_start/pricing/), [JSON output](https://api-docs.deepseek.com/guides/json_mode/) | Server-side API, JSON output, tool calls, 1M context; peak US$1.32/M cache-miss input and US$3.96/M output, half that off peak. | partial — approved paired retrieval, source/citation retention, location control, availability, JSON schema reliability, and normalized combined cost | not tested |

## Individual evidence capture: Moonshot AI / Kimi first pass

Kimi documents a model API and a distinct Web Search API. The model API does
not access the internet by default. The separate search API returns a title,
URL, site, date, snippet and relevance-scored chunks. That creates a named
retrieval-plus-analysis candidate, but not evidence that the model itself
performs web search.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- |
| 65 | Kimi K3 (`kimi-k3`) | [API overview](https://www.kimi.ai/help/kimi-api/api-overview), [Web Search API](https://www.kimi.ai/academy/best-practices-for-web-search), [JSON mode](https://www.kimi.ai/help/kimi-api/api-model-capabilities) | Chat Completions API is documented; K3 has a stated 1M-token context. Kimi documents valid-JSON mode. Its separate Web Search API returns source URLs and dates. | partial — confirm K3-to-Search API pairing and commercial pricing, source/citation presentation, location controls, search timeout/cost, and normalized combined cost | not tested |
| 66–67 | Kimi K2.6 — thinking and non-thinking modes | [API overview](https://www.kimi.ai/help/kimi-api/api-overview), [Web Search API](https://www.kimi.ai/academy/best-practices-for-web-search), [JSON mode](https://www.kimi.ai/help/kimi-api/api-model-capabilities) | K2.6 is documented with thinking and non-thinking modes; the same separate Kimi Web Search API and JSON mode are documented. | partial — exact endpoint/model-mode pairing, commercial pricing, source/citation presentation, location controls, search timeout/cost, and normalized combined cost | not tested |

## Documentation completion checkpoint

The following is a count of the recorded states, not a quality ranking:

| Documentary state | Configuration count | Consequence |
| --- | ---: | --- |
| partial | 62 | Missing exact capability, provenance, pricing, availability and/or paired-retrieval evidence remains visible. |
| excluded | 5 | Mistral IDs 46–50 are deprecated in its current catalogue. |
| documentary pass | 0 | No exact configuration has complete documentary evidence for the whole workflow. |

No provider call is part of #23. The absence of a `documentary pass` does not
turn into an implied failure of a provider; it records that documentation alone
does not support a production selection for this workflow.

## Required fields for each individual configuration

The next collection pass expands each candidate ID into these fields. It must
not copy a vendor-level assertion to a model without official support:

1. exact provider model ID, variant/effort, endpoint, and retrieval date;
2. commercial API eligibility, region and current deprecation status;
3. native search tool or approved paired retrieval provider;
4. source URL/citation behaviour and Auckland-location control;
5. structured-output mechanism and context/output limits;
6. published token, search/tool, storage, and platform prices;
7. documentary qualification outcome and source links; and
8. any future implementation evidence separately, without treating it as
   evidence that was collected under #23.

## Current evidence limits

The evidence is documentation-only. It is enough to identify possible routes
and their limits; it is not enough to mark a single candidate production-ready
or to calculate comparable completed-assessment cost. No credentials, external
requests, customer data, or charges have been used.
