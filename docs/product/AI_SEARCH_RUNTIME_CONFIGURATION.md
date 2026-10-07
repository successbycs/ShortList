# MVP 1 AI evidence runtime configuration — search-prototype baseline

**Status:** superseded for the customer-facing assessment method by the draft
[GEO prompt and assessment contract](GEO_PROMPT_CONTRACT.md); retained as the
historical generic-search prototype baseline.
**Decision owner:** Chris
**Recorded:** 5 October 2026
**Implementation Issue:** [#5](https://github.com/successbycs/ShortList/issues/5)

This document records the operating envelope used by the first generic
comparable-business prototype. It is not the target ShortList GEO method. The
future configurable prompt package will select approved model and market
profiles, subject to code-enforced maximum safety limits.

## Approved configuration

| Concern | MVP 1 decision |
| --- | --- |
| Model family | OpenAI GPT-6 Luna (`gpt-6-luna`) |
| Current-web result | Use the Responses API `web_search` tool and require the tool for this mode. Preserve source citations where supplied. |
| Model-knowledge result | Do not attach a web-search tool. Label the output as model knowledge: it is not current-web verified and may be incomplete or out of date. |
| Search context | Low. The product needs one bounded dated observation, not an open-ended research exercise. |
| Location context | Historical prototype used approximate Auckland, New Zealand context. This is retained only to explain prior records; `geo-assessment-v1` uses the approved global market profile and evidence-supported service area. |
| Request timeout | 45 seconds. A timeout becomes a clear, safe outcome rather than a silent retry loop. |
| Token boundary | At most 12,000 input tokens and 2,000 output tokens per assessment request. |
| Estimated spend boundary | At most US$0.03 per assessment request before processing continues. |
| Provider retention | Request `store: false`. |
| Output shape | Structured server-side evidence: dated question, mode, configuration, observed results, citations where available, and a safe reason-coded outcome. |

## Customer-facing honesty rules

- A current-web result is a dated observation from the selected AI-model route,
  not a permanent rank, guarantee, or exhaustive market list.
- A model-knowledge result must never be presented as live web evidence.
- Missing citations, a timeout, invalid provider output, or a spend/token limit
  must produce a truthful limited/failure state. The service must not invent a
  result or silently make an unbounded retry.

## Security and delivery boundary

`OPENAI_API_KEY` is a server-only runtime secret. It must be supplied through
local development configuration or a Cloudflare secret binding; it must not be
included in frontend code, logs, test fixtures, Git history, or customer
responses. The API adapter is isolated in `apps/web/src/server/ai-search/`.

No live OpenAI request has been made or is implied by this decision. A later
authorised server-route and deployment task will configure the binding and
record a redacted result. MVP 3+ execution telemetry is separately tracked in
[#46](https://github.com/successbycs/ShortList/issues/46).

## References

- [OpenAI web-search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- [OpenAI structured outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs)
- [AI-search capability review](feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md)
