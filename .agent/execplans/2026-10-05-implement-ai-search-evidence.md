# Implement bounded dated AI-search evidence

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #5 will give ShortList a server-side, testable way to turn two approved
AI-model response modes into dated evidence records that the later teaser and
Minimum Assessment can consume. One mode is current-web and preserves its
citations/order; the other is model knowledge with no web tool and an explicit
not-current/not-verified notice. A developer will be able to run fixture-driven
tests without an OpenAI key or a network request and see safe reason-coded
outcomes for every provider or limit failure.

This is not a launch or a live provider integration. It deliberately stops
short of adding a credential, making a billable request, storing a customer
record, calling an email/PDF provider, or exposing a public API route.

## Progress

- [x] (2026-10-05 02:05Z) Confirmed native GitHub prerequisites #7, #8, and
  #9 are closed and the adopted Cloudflare frontend is in `apps/web/`.
- [x] (2026-10-05 02:05Z) Created this implementation plan and identified the
  owner decisions that must be recorded before provider-specific code.
- [x] (2026-10-05 03:10Z) Recorded Chris's requirement for two distinct
  result modes in the canonical product documents: current-web and no-web
  model knowledge. The exact GPT-6 Luna configuration/limits remain open.
- [x] (2026-10-05 03:12Z) Recorded the product decision and its implementation
  boundary in GitHub #5 for human review.
- [x] (2026-10-05 06:02Z) Chris resumed #5. Corrected the GitHub Project item
  from Done to In Progress and recorded the bounded implementation scope in
  Issue #5.
- [ ] Record Chris's exact GPT-6 Luna reasoning/tool/location/limit decisions
  for both modes in the canonical product documents and #5.
- [x] (2026-10-05 06:11Z) Implemented provider-independent evidence types,
  limits, normalisation, and fixture-driven tests under
  `apps/web/src/server/ai-search/`.
- [ ] Add the selected OpenAI adapter behind a configuration interface with no
  credential value or live request in tests.
- [x] (2026-10-05 06:11Z) Ran test, generated binding types, lint, build, and
  whitespace verification. Local Worker HTTP proof remains pending until an
  adapter/route exists; it is not implied by this pure-contract milestone.
- [x] (2026-10-05 06:24Z) Chris approved reuse of the existing ShortList-only
  local API key. Added the isolated OpenAI Responses adapter with mocked
  transport tests; no live request, server route, or browser import was added.

## Surprises & Discoveries

- Observation: `apps/web/` is a TanStack Start application packaged for a
  Cloudflare Workers module; it has no current server-side assessment service.
  Evidence: `apps/web/src/server.ts` delegates only to TanStack Start, and
  `apps/web/wrangler.jsonc` has only the static-assets binding.

- Observation: the requirements already define the durable evidence fields
  and safety outcomes, but not concrete OpenAI invocation values.
  Evidence: `docs/product/CONTRACTS.md`, section “Dated AI-search evidence
  v1”; `docs/product/DELIVERY_PLAN.md`, section 5.

- Observation: the app has no existing provider adapter or assessment route;
  the new contract can be proved with fixture providers without exposing a
  runtime credential or beginning a network request.
  Evidence: `apps/web/src/server/ai-search/collect.test.ts` covers the bounded
  contract; source inspection found no OpenAI SDK import.

## Decision Log

- Decision: OpenAI GPT-6 Luna is the selected MVP 1 model family.
  Rationale: recorded product-owner decision in
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
  Date/Author: 2026-10-05 / Chris.

- Decision: Do not make a real provider request or add credentials in #5.
  Rationale: #5 acceptance requires fixture/test-double evidence; credentials
  and authorised real-boundary proof belong to later explicit authority.
  Date/Author: 2026-10-05 / Chris and Codex.

- Decision: Reuse the existing ShortList-specific local API key when a later
  server route is explicitly authorised to invoke the adapter.
  Rationale: Chris confirmed that the existing key was created specifically for
  this project. The key remains in an ignored local environment file and is not
  read, printed, committed, or used by fixture verification.
  Date/Author: 2026-10-05 / Chris.

- Decision required: exact GPT-6 Luna reasoning level, native OpenAI search
  tool configuration, Auckland location context, timeout, and per-assessment
  spend cap.
  Rationale: these values change customer-visible result behaviour and cost;
  the repository must not invent them.
  Date/Author: pending / Chris.

- Recommendation: use `gpt-6-luna` with no reasoning, the Responses API
  `web_search` tool forced as required, low search context, approximate
  Auckland/New Zealand location (`Pacific/Auckland`), a 45-second timeout, and
  a US$0.03 per-assessment cap.
  Rationale: the MVP needs one bounded dated observation with citations, not
  an open-ended research loop. The selected model and current OpenAI API
  documentation support this route. This is not approved configuration until
  Chris accepts it.
  Date/Author: 2026-10-05 / Codex.

- Decision: MVP 1 will retain two separately labelled AI-model result modes:
  `web_grounded`, which runs with a web-search tool, and `model_knowledge`,
  which runs with no web-search tool. The latter must say it is not current-web
  verified and may be incomplete or out of date.
  Rationale: Chris wants to compare current web-grounded output with an answer
  based on the model's learned knowledge without representing them as the same
  type of evidence.
  Date/Author: 2026-10-05 / Chris.

## Outcomes & Retrospective

The first bounded milestone is complete. A server-only, provider-independent
contract now emits dated evidence for either the cited current-web mode or the
explicitly non-current model-knowledge mode. It blocks over-limit work before
calling a provider and turns malformed, uncited, timed-out, failed, and
over-limit responses into safe records. The OpenAI adapter, exact configuration
values, route integration, persistence, credentials, live response, deployment,
and customer use remain outside this milestone.

## Context and Orientation

The canonical product requirements are in `docs/product/REQUIREMENTS.md`.
`MVP1-JNY-003` requires two dated AI-model result modes after the business type
is evidenced. `MVP1-ABUSE-001` requires server-side token and spend controls.
`docs/product/CONTRACTS.md` defines “Dated AI-model evidence v1”: mode, exact
question, UTC timestamp, model/configuration, current-web location context,
observed order/citations where available, model-knowledge freshness notice,
outcome, reason code, and safe usage data.

The frontend foundation lives in `apps/web/`. Its `src/routes/index.tsx` is
currently a local-state prototype; it must not be presented as a live search.
The future adapter belongs in server-only modules, not browser code, so an API
key can never be sent to a visitor.

## Plan of Work

### Milestone 1: Freeze the invocation boundary

Update `docs/product/SDD.md`, `docs/product/DELIVERY_PLAN.md`, and Issue #5
after Chris records the exact configuration choices for both modes. Add a small
typed configuration shape that has names and validation only; it must reject
absent/invalid values without printing any value. Do not create `.env` values
or configure Cloudflare secrets in this Issue.

### Milestone 2: Add provider-independent evidence logic

Under `apps/web/src/server/ai-search/`, add types and pure functions for:

- request input: evidenced business type, normalised public domain, question,
  UTC timestamp, and approved Auckland context;
- response normalisation: a current-web mode with ordered result positions,
  citation URL/title and source association, plus a model-knowledge mode with
  its mandatory freshness notice; model/tool configuration and safe usage;
- reason-coded outcomes for malformed output, missing citations, timeout,
  provider failure, and token/spend limit rejection; and
- a provider interface so a fixture fake can produce deterministic outcomes.

No database is added. The returned object is the in-memory contract consumed by
future #10/#27 work.

### Milestone 3: Add the isolated OpenAI adapter

Implement the selected Responses API route only in a server-only module. It
must receive its credential through a runtime binding/configuration interface,
never an importable frontend constant. It must make no request during build,
test, or local browser preview. Test doubles exercise all outcomes.

**Status:** Implemented as `openai-responses.ts`. It requires every provider
choice at construction time (model, timeout, retention, search controls and
instructions) and has no product-setting default. It translates the official
Responses API `web_search` and structured-output shape to the stable evidence
contract. No route creates the adapter yet.

### Milestone 4: Verify and hand off

Add focused Vitest cases for valid ordered/cited evidence and each safe failure.
Run the app lint, test, type-generation, production build, and local Worker
preview. Record warnings honestly. The live OpenAI boundary remains unobserved
until Chris supplies credentials and explicitly authorises a bounded call.

## Concrete Steps

From `/home/chris/ShortList/apps/web`:

```sh
npm run lint
npm test
npm run types
npm run build
npm run dev:worker -- --local --port 8787
```

Observed evidence: `npm test` passed 3 files / 10 tests; `npm run types`
generated bindings; `npm run lint` passed with 0 errors and 8 pre-existing
warnings; `npm run build` passed with existing Vite/Nitro/Wrangler warnings;
and `git diff --check` passed. These commands did not initiate an OpenAI
request. Local Worker HTTP evidence is deferred until an adapter/route exists.

After the adapter addition, `npm test` passed 4 files / 13 tests; lint remained
at 0 errors and 8 existing warnings; and the production Cloudflare-module build
passed with the same existing warnings. The OpenAI transport tests inject a
fake `fetch` implementation and make no network request.

Before any real-boundary test, Chris must separately approve the account,
credential storage path, exact request, maximum spend, and redacted evidence
record. That check is not a prerequisite for fixture-based completion.

## Validation and Acceptance

| Requirement | Proof | Current status |
| --- | --- | --- |
| Both modes carry exact question, UTC and configuration | Fixture tests against the v1 contract | Passed (fixture) |
| Current-web result carries order/citations; model knowledge carries its warning | Fixture tests for mode-specific normalisation and render data | Passed (fixture) |
| Bad provider data is safe | Tests for malformed, uncited, error and timeout outcomes | Passed (fixture) |
| Token and spend guard acts before unbounded processing | Tests using synthetic usage/estimate values | Passed (fixture) |
| Key cannot reach browser code or logs | Static scan plus configuration tests with synthetic values | Partially passed: adapter receives a server-only constructor value; no browser route exists |
| App stays buildable as a Cloudflare Worker | Existing local commands plus HTTP loopback proof | Build passed; HTTP proof remains pending because no route invokes the adapter |
| Actual OpenAI response | Explicitly authorised bounded request and redacted record | Unobserved |

## Idempotence and Recovery

Fixture tests and builds are repeatable. A failed configuration check must
return a safe local reason code, not make a fallback request. Do not add a
credential to Git or commit generated secret/configuration files. If a later
authorised live call fails, preserve only redacted diagnostics and return the
reason-coded outcome; do not silently retry beyond the approved limit.

## Artifacts and Notes

- Canonical requirements: `docs/product/REQUIREMENTS.md`.
- Evidence contract: `docs/product/CONTRACTS.md`.
- Provider comparison/selection evidence:
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
- Implementation Issue: GitHub #5.
- The upstream Symphony runtime is paused pending the separate
  `2026-10-05-harden-upstream-symphony-dispatch.md` decision; this plan does
  not admit #5 to that runtime.

## Interfaces and Dependencies

Implemented internal interfaces are server-only: `AiSearchEvidence`,
`AiSearchProvider`, `AiSearchRunRequest`, `AiSearchLimits`, and typed safe
reason codes. They conform to the field meanings in `docs/product/CONTRACTS.md`
and expose no provider secret to the route bundle. OpenAI-specific
request/response types remain unimplemented and will stay isolated from this
stable evidence contract so later provider changes do not alter report or teaser
inputs.

`createOpenAiResponsesProvider(config)` is the OpenAI-specific adapter. Its
configuration requires a server-only API key, model ID, timeout, explicit
provider-side retention choice, web-search controls, and mode-specific
instructions. It uses `POST /v1/responses` only if a future server caller calls
`run`; test code injects `fetchImplementation`. The current-web path sends the
official `web_search` tool and structured output schema; the no-web path omits
the tool. This adapter does not itself choose the unresolved values.
