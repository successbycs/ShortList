# Implement bounded dated AI-search evidence

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #5 will give ShortList a server-side, testable way to turn one approved
AI-search response into a dated evidence record that the later teaser and
Minimum Assessment can consume. A developer will be able to run fixture-driven
tests without an OpenAI key or a network request, see a normalised result with
ordered citations and UTC time, and see safe reason-coded outcomes for every
provider or limit failure.

This is not a launch or a live provider integration. It deliberately stops
short of adding a credential, making a billable request, storing a customer
record, calling an email/PDF provider, or exposing a public API route.

## Progress

- [x] (2026-10-05 02:05Z) Confirmed native GitHub prerequisites #7, #8, and
  #9 are closed and the adopted Cloudflare frontend is in `apps/web/`.
- [x] (2026-10-05 02:05Z) Created this implementation plan and identified the
  four owner decisions that must be recorded before provider-specific code.
- [ ] Record Chris's exact GPT-6 Luna reasoning/tool/location/limit decisions
  in the canonical product documents and #5.
- [ ] Implement provider-independent evidence types, limits, normalisation,
  and fixture-driven tests under `apps/web/src/`.
- [ ] Add the selected OpenAI adapter behind a configuration interface with no
  credential value or live request in tests.
- [ ] Run the code, lint, test, build, and local Worker evidence; record the
  results in this plan and #5 for human review.

## Surprises & Discoveries

- Observation: `apps/web/` is a TanStack Start application packaged for a
  Cloudflare Workers module; it has no current server-side assessment service.
  Evidence: `apps/web/src/server.ts` delegates only to TanStack Start, and
  `apps/web/wrangler.jsonc` has only the static-assets binding.

- Observation: the requirements already define the durable evidence fields
  and safety outcomes, but not concrete OpenAI invocation values.
  Evidence: `docs/product/CONTRACTS.md`, section “Dated AI-search evidence
  v1”; `docs/product/DELIVERY_PLAN.md`, section 5.

## Decision Log

- Decision: OpenAI GPT-6 Luna is the selected MVP 1 model family.
  Rationale: recorded product-owner decision in
  `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
  Date/Author: 2026-10-05 / Chris.

- Decision: Do not make a real provider request or add credentials in #5.
  Rationale: #5 acceptance requires fixture/test-double evidence; credentials
  and authorised real-boundary proof belong to later explicit authority.
  Date/Author: 2026-10-05 / Chris and Codex.

- Decision required: exact GPT-6 Luna reasoning level, native OpenAI search
  tool configuration, Auckland location context, timeout, and per-assessment
  spend cap.
  Rationale: these values change customer-visible result behaviour and cost;
  the repository must not invent them.
  Date/Author: pending / Chris.

## Outcomes & Retrospective

Pending implementation. The plan will be complete when fixture tests prove the
versioned evidence contract and every external boundary is explicitly either
passed under authority or recorded unobserved. It does not make a customer
claim, production deployment, or provider-readiness claim.

## Context and Orientation

The canonical product requirements are in `docs/product/REQUIREMENTS.md`.
`MVP1-JNY-003` requires one dated AI-search test after the business type is
evidenced. `MVP1-ABUSE-001` requires server-side token and spend controls.
`docs/product/CONTRACTS.md` defines “Dated AI-search evidence v1”: exact
question, UTC timestamp, model/search configuration, location context,
observed order, citations, outcome, reason code, and safe usage data.

The frontend foundation lives in `apps/web/`. Its `src/routes/index.tsx` is
currently a local-state prototype; it must not be presented as a live search.
The future adapter belongs in server-only modules, not browser code, so an API
key can never be sent to a visitor.

## Plan of Work

### Milestone 1: Freeze the invocation boundary

Update `docs/product/SDD.md`, `docs/product/DELIVERY_PLAN.md`, and Issue #5
only after Chris records the five exact choices. Add a small typed configuration
shape that has names and validation only; it must reject absent/invalid values
without printing any value. Do not create `.env` values or configure Cloudflare
secrets in this Issue.

### Milestone 2: Add provider-independent evidence logic

Under `apps/web/src/server/ai-search/`, add types and pure functions for:

- request input: evidenced business type, normalised public domain, question,
  UTC timestamp, and approved Auckland context;
- response normalisation: ordered result positions, citation URL/title, source
  association, model/tool configuration, and safe usage;
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

### Milestone 4: Verify and hand off

Add focused Vitest cases for valid ordered/cited evidence and each safe failure.
Run the app lint, test, type-generation, production build, and local Worker
preview. Record warnings honestly. The live OpenAI boundary remains unobserved
until Chris supplies credentials and explicitly authorises a bounded call.

## Concrete Steps

From `/home/chris/ShortList/apps/web` after the decision is recorded:

```sh
npm run lint
npm test
npm run types
npm run build
npm run dev:worker -- --local --port 8787
```

Expected evidence: lint has no errors; new tests cover normalisation and safe
reason codes; the Cloudflare-module build succeeds; the local Worker responds
on loopback. These commands must not initiate an OpenAI request.

Before any real-boundary test, Chris must separately approve the account,
credential storage path, exact request, maximum spend, and redacted evidence
record. That check is not a prerequisite for fixture-based completion.

## Validation and Acceptance

| Requirement | Proof | Current status |
| --- | --- | --- |
| Dated result carries exact question, UTC, context, order and citations | Fixture test against the v1 contract | Pending |
| Bad provider data is safe | Tests for malformed, uncited, error and timeout outcomes | Pending |
| Token and spend guard acts before unbounded processing | Tests using synthetic usage/estimate values | Pending |
| Key cannot reach browser code or logs | Static scan plus configuration tests with synthetic values | Pending |
| App stays buildable as a Cloudflare Worker | Existing local commands plus HTTP loopback proof | Pending |
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

Expected new internal interfaces are server-only and named during Milestone 2:
an `AiSearchEvidenceV1` value, `AiSearchProvider` adapter interface, a typed
`AiSearchRunRequest`, and typed safe reason codes. They must conform to the
field meanings in `docs/product/CONTRACTS.md` and expose no provider secret to
the route bundle. OpenAI-specific request/response types remain isolated from
the stable evidence contract so later provider changes do not alter report or
teaser inputs.
