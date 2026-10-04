# AI model qualification matrix

**Status:** active evidence register for GitHub Issue #23; no provider calls made  
**Retrieved:** 2026-10-05 (Pacific/Auckland)  
**Companion review:** [AI-search and website-analysis capability review](AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md)

## How to read this register

This register is the authoritative per-candidate evidence record for the 67
configurations named in the companion review. `Pending` means no claim has
been made; it is not a pass. A configuration may enter the controlled live test
only after all documentary gates are evidenced from the cited official source.

| Status | Meaning |
| --- | --- |
| pending | The exact configuration has not yet been verified from official documentation. |
| partial | Some exact official evidence is captured, but at least one documentary gate remains open. |
| documentary pass | Official documentation establishes the required API/search/provenance/format route; it remains untested. |
| excluded | Official evidence establishes that the configuration cannot form the required workflow. |
| observed pass/fail | A separately approved live test has run and its evidence is linked here. |

## Provider evidence register

| Candidate IDs | Provider | Server-side API evidence | Search and provenance evidence | Structured format evidence | Documentary state | Observed state |
| --- | --- | --- | --- | --- | --- | --- |
| 1–28 | OpenAI | [Model catalogue](https://developers.openai.com/api/docs/models) | [Web-search tool](https://platform.openai.com/docs/quickstart/make-your-first-api-request); verify tool support for each 5.x/6.x configuration | [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs); verify per model | pending per configuration | not tested |
| 29–39 | Google | [Gemini API models](https://ai.google.dev/gemini-api/docs/models) | [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search); verify per model | [Structured output](https://ai.google.dev/gemini-api/docs/structured-output); verify per model | pending per configuration | not tested |
| 40–50 | Mistral | [Model catalogue](https://docs.mistral.ai/models/) | [Agents web-search connector](https://docs.mistral.ai/studio/agents/introduction); verify model/agent compatibility and citations | [Model comparison](https://docs.mistral.ai/getting-started/models/compare); verify per model | pending per configuration | not tested |
| 51–53 | Anthropic | [Claude API pricing/model source](https://docs.anthropic.com/en/docs/about-claude/pricing) | Official web-search capability and exact model compatibility pending | Official structured-output capability and exact model compatibility pending | pending per configuration | not tested |
| 54–57 | Cohere | [Command model pricing and API overview](https://docs.cohere.com/docs/how-does-cohere-pricing-work) | No native server-side web-search path evidenced in this register; evaluate a named paired retrieval provider | [Command A+ capabilities](https://docs.cohere.com/docs/command-a-plus); verify other Command models | pending per configuration | not tested |
| 58–62 | xAI | [Grok 4.7 API guide](https://docs.x.ai/developers/grok-4-7) | Grok 4.7 documents server-side web and X search; capture citation/provenance behaviour and regional difference | Grok 4.7 documents structured outputs | pending exact effort/region evidence | not tested |
| 63–64 | DeepSeek | [Models and pricing](https://api-docs.deepseek.com/quick_start/pricing/) | No native server-side web-search path evidenced in this register; evaluate a named paired retrieval provider | Exact structured-output evidence pending | pending per configuration | not tested |
| 65–67 | Moonshot AI / Kimi | [Kimi API overview](https://www.kimi.ai/help/kimi-api/api-overview) | [Kimi Web Search APIs](https://www.kimi.ai/academy/best-practices-for-web-search); verify exact K3/K2.6 pairing | [Kimi JSON mode](https://www.kimi.ai/ja/help/kimi-api/api-model-capabilities); verify exact K3/K2.6 pairing | pending per configuration | not tested |

## Individual evidence capture: OpenAI first pass

All entries below are **partial** rather than viable. The cited official model
pages establish a server-side Responses API route, structured outputs, and
native web-search support. They do not establish Auckland usefulness,
provenance quality in the ShortList workflow, latency, or a normalized
per-assessment cost.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Remaining documentary work | Observed state |
| --- | --- | --- | --- | --- | --- |
| 11–13 | GPT-5.6 Terra, no/low/medium effort | [Model page](https://developers.openai.com/api/docs/models/gpt-5.6-terra) | Responses API; structured outputs; web search; US$2/M input and US$12/M output listed | tool-call price, citation behaviour, location control, current availability, and normalized cost | not tested |
| 17 | GPT-5.6 Sol | [Model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol) | Responses API; structured outputs; web search; US$4/M input and US$20/M output listed | tool-call price, citation behaviour, location control, current availability, and normalized cost | not tested |
| 18 | GPT-5.6 Luna | [Model page](https://developers.openai.com/api/docs/models/gpt-5.6-luna) | Responses API; structured outputs; web search documented | exact price extraction, citation behaviour, location control, current availability, and normalized cost | not tested |
| 19 | GPT-5.5 | [Model page](https://developers.openai.com/api/docs/models/gpt-5.5) | Responses API; structured outputs; web search; US$5/M input and US$30/M output listed | tool-call price, citation behaviour, location control, current availability, and normalized cost | not tested |
| 21 | GPT-5.4 | [Model page](https://developers.openai.com/api/docs/models/gpt-5.4) | Responses API; structured outputs; web search; US$2.50/M input and US$15/M output listed | tool-call price, citation behaviour, location control, current availability, and normalized cost | not tested |
| 22 | GPT-5.4 Mini | [Model page](https://developers.openai.com/api/docs/models/gpt-5.4-mini) | Responses API; structured outputs; web search; US$0.75/M input and US$4.50/M output listed | tool-call price, citation behaviour, location control, current availability, and normalized cost | not tested |
| 24 | GPT-5.2 | [Model page](https://developers.openai.com/api/docs/models/gpt-5.2) | Responses API and structured outputs documented | native web-search support is not established by this cited page; pricing, availability, and other gates remain open | not tested |

## Individual evidence capture: Google Gemini first pass

All entries below remain **partial** and untested. Google's model catalogue
provides the current API identifiers and lifecycle state; its Grounding with
Google Search guide explicitly names the configurations with native search
support. Its structured-output guide demonstrates JSON-schema response formats
with Gemini 3.8 Flash, but this documentation pass does **not** establish that
every listed configuration supports the exact combined grounded-search plus
structured-analysis workflow. A live test is still required after approval.

| Candidate IDs | Exact configuration(s) | Official evidence | Current documented result | Remaining documentary work | Observed state |
| --- | --- | --- | --- | --- | --- |
| 29 | Gemini 3.8 Flash (`gemini-3.8-flash`) | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding](https://ai.google.dev/gemini-api/docs/google-search), [structured output](https://ai.google.dev/gemini-api/docs/structured-output), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Current stable API model; native Google Search grounding with citations is documented; JSON-schema response format is documented; listed at US$0.75/M input and US$4.50/M output. Paid search is 5,000 shared Gemini 3.x requests/month then US$14/1,000 requests. | citation payload retention, Auckland/location control, combined tool-and-schema compatibility, current availability for the selected account, and normalized cost | not tested |
| 30–33 | Gemini 3.7 Flash, 3.6 Flash, 3.5 Flash, 3.5 Flash-Lite | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Current stable API identifiers and native Google Search grounding are documented. | exact structured-output support, per-model token price extraction, citation payload retention, Auckland/location control, and normalized cost | not tested |
| 34 | Gemini 3.1 Flash-Lite | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Current stable API model and token prices are documented; it is absent from Google's native Search-grounding supported-model table. | an approved named paired-retrieval path, exact structured-output support, provenance, availability, and normalized combined cost | not tested |
| 35–36 | Gemini 3.1 Pro Preview, Gemini 3 Flash Preview | [Model catalogue](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search) | Native Google Search grounding is documented. Both are preview endpoints; Google says preview models can have tighter rate limits and shorter deprecation notice. | exact structured-output support, pricing, citation payload retention, Auckland/location control, and acceptance of preview lifecycle risk | not tested |
| 37–39 | Gemini 2.5 Pro, 2.5 Flash, 2.5 Flash-Lite | [Model catalogue access note](https://ai.google.dev/gemini-api/docs/models), [Search grounding supported-model table](https://ai.google.dev/gemini-api/docs/google-search), [pricing](https://ai.google.dev/gemini-api/docs/pricing) | Native Google Search grounding is documented, but Google limits 2.5 API access to users who actively used those models in the past and recommends 3.5 Flash-Lite or 3.8 Flash for new projects. | evidence that the intended ShortList account qualifies for access; exact structured-output support, pricing, provenance, location control, and normalized cost. Do not treat these as available to a new project without that evidence. | not tested |

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
8. approved live-test result, including prompt, UTC/Auckland time, sources,
   result, schema validation, latency, usage, cost, and failure state.

## Current evidence limits

Only the provider-level documentation above has been collected. It is enough to
start per-configuration evidence capture; it is not enough to mark a single
candidate as viable or to calculate comparable cost. No credentials, external
requests, customer data, or charges have been used.
