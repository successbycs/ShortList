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
