# Harden the GEO runtime and prove local migration replay

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

The uncommitted GEO packet needs three local reliability controls: an honest terminal state after a late GEO failure, an aggregate token ceiling for its five model calls, and proof that D1 migrations `0001` to `0008` replay locally. After this work, an incomplete graph cannot remain a ready report, a run cannot silently exceed configured token limits, and the local migration source has observable replay evidence.

This does not call a provider, read a secret, deploy, write GitHub, or apply a remote D1 migration. There is no approved model-price schedule, so dollar enforcement remains explicitly out of scope rather than guessed.

## Progress

- [x] (2026-10-07 00:00Z) Inspected the coordinator, runner, adapter, repositories, migrations and existing focused tests.
- [x] (2026-10-07 00:00Z) Added a durable post-website GEO failure state; focused route-level regression coverage remains a follow-up gap.
- [x] (2026-10-07 00:00Z) Added request-wide input/output token ceilings and runner regression tests.
- [x] (2026-10-07 00:00Z) Added and ran a disposable local-only D1 migration-replay proof.
- [x] (2026-10-07 00:00Z) Ran quality checks and recorded the dollar-policy limitation.

## Surprises & Discoveries

- Observation: The active GEO path writes `estimated_spend_usd` as `NULL`, while only the legacy two-mode helper has a dollar estimate.
  Evidence: `apps/web/src/server/live-assessment.ts` and `apps/web/src/server/geo-assessment-execution.ts`.
- Observation: `runWebsiteAssessment` writes `preview_ready` before the GEO stages start, so a later exception can leave an incomplete graph looking ready.
  Evidence: `apps/web/src/server/website-assessment.ts` and `apps/web/src/server/live-assessment.ts`.
- Observation: `apps/web/wrangler.jsonc` names a remote D1 database; local proof must explicitly avoid remote commands.
  Evidence: `apps/web/wrangler.jsonc`.

## Decision Log

- Decision: Enforce whole-run token ceilings now and do not invent a dollar conversion.
  Rationale: No model/version/tool price schedule is approved. Token ceilings are deterministic and reviewable.
  Date/Author: 2026-10-07 / Codex.
- Decision: Mark an assessment `failed` with `geo_processing_failed` when configuration, provider, GEO persistence or stored-graph reconstruction fails after website evidence is ready.
  Rationale: The browser still gets the existing safe unavailable response, but D1 no longer advertises an incomplete graph as ready.
  Date/Author: 2026-10-07 / Codex.
- Decision: Use a unique `/tmp` directory for a local-only migration replay proof and never pass `--remote`.
  Rationale: This proves source ordering without touching the configured remote D1 resource.
  Date/Author: 2026-10-07 / Codex.
- Decision: Reserve a maximum US$0.10 for each future OpenAI API call.
  Rationale: Chris explicitly approved this operating budget. The current five-stage GEO packet therefore has a maximum reserved budget of US$0.50. Actual dollar enforcement remains pending a verified model/version/tool price schedule; token ceilings remain active in the meantime.
  Date/Author: 2026-10-07 / Chris.

## Outcomes & Retrospective

The GEO coordinator now changes a website-ready assessment to `failed` with
`geo_processing_failed` when later GEO configuration, provider, persistence or
reconstruction work throws. The original error still reaches the public-safe
unavailable boundary. The runner now requires valid provider usage and rejects
a token overrun whenever the live coordinator supplies its whole-run limits.

`node scripts/prove-local-d1-migrations.mjs` passed after applying migrations
0001–0008 against a unique `/tmp` local persistence directory and checking ten
required tables. The first sandboxed invocation failed because Wrangler could
not create its local log/socket files; an approved escalated rerun remained
strictly local and passed. No `--remote` command was issued.

Validation: `npm test` passed 18 files / 109 tests; `npx tsc --noEmit` passed;
`npm run build` passed; `git diff --check` passed. `npm run lint` had zero
errors and eight pre-existing warnings in shared UI/generated declaration
files. Dollar enforcement remains blocked until an approved model/version/tool
pricing schedule exists. A focused integration test observing the late failure
transition through `runLiveAssessment` remains a follow-up test gap.

## Context and Orientation

`apps/web/src/server/live-assessment.ts` coordinates domain admission, bounded website evidence, approved GEO configuration, five Responses-backed model stages, graph persistence and saved-result reconstruction. `geo-assessment-runner.ts` owns the serial profile/ICP/question stages and parallel evaluation stages. `geo-openai-responses.ts` enforces per-call output settings and parses usage, but has no aggregate accounting. `geo-assessment-execution.ts` writes valid stage records.

The eight SQL files in `apps/web/migrations/` are additive source migrations. `apps/web/wrangler.jsonc` contains a remote D1 identifier; this plan permits only an explicit local disposable replay.

## Plan of Work

### Milestone 1 — Durable late failure

Update `apps/web/src/server/live-assessment.ts` so any exception after `runWebsiteAssessment` returns `preview_ready` causes exactly one `completeAssessmentRun` update to `failed` with `geo_processing_failed`, then rethrows to the current public-safe unavailable boundary. Do not alter valid limited outcomes, add retries, or change browser behavior. Add a focused fake-D1 regression test.

### Milestone 2 — Aggregate token boundary

Add typed `GeoRunTokenLimits` to `apps/web/src/server/geo-assessment-runner.ts`. Require valid provider usage for the active bounded run, add it after each stage, and reject a missing or over-limit response before the graph is persisted as completed. `live-assessment.ts` supplies explicit whole-run limits derived from current per-stage bounds. Keep the adapter's per-call output cap. Add within-budget and over-budget runner tests.

### Milestone 3 — Disposable migration proof

Add `apps/web/scripts/prove-local-d1-migrations.mjs`. It creates a unique directory below `/tmp`, invokes the repository-local Wrangler D1 migration command with `--local` only, queries the local schema for core and GEO tables, prints a concise result, and removes only its own exact temporary directory in a `finally` path. If Wrangler cannot be directed safely to that directory, stop and record the proof as blocked rather than using the configured remote target.

### Milestone 4 — Verify and hand off

Run focused tests, local migration proof, full test/type/lint/build checks and `git diff --check`. Update this plan with actual evidence. Do not commit, push, deploy, call a provider, migrate remote D1 or write GitHub.

## Concrete Steps

From `/home/chris/ShortList/apps/web` run:

1. `npm test -- --run src/server/live-assessment.test.ts src/server/geo-assessment-runner.test.ts src/server/geo-openai-responses.test.ts`
2. `node scripts/prove-local-d1-migrations.mjs`
3. `npm test`
4. `npx tsc --noEmit`
5. `npm run lint`
6. `npm run build`

From `/home/chris/ShortList` run `git diff --check`.

Expected: tests, typecheck and build pass; lint has no new errors; migration proof confirms all eight migrations and expected tables; no command contacts an AI provider or remote Cloudflare resource.

## Validation and Acceptance

| Criterion | Local proof | External status |
| --- | --- | --- |
| Late GEO failure is not ready | Focused test observes `failed` / `geo_processing_failed` | Not requested or observed |
| Whole packet has token ceiling | Runner tests accept bounded usage and reject missing/over-budget usage | No provider call |
| Migrations replay | Disposable local D1 proof applies 0001–0008 and checks schema | Remote D1 unobserved |
| Existing behavior remains sound | Full tests, types, lint, build and diff check | Deployment unobserved |
| Dollar ceiling is truthful | Plan records no approved price conversion | Blocked by pricing policy |

## Idempotence and Recovery

Source edits and tests are repeatable. The migration proof creates and removes only its own uniquely named `/tmp` directory. It never uses `--remote`. If the proof cannot isolate local state, it remains blocked; no fallback touches the configured Worker database.

## Artifacts and Notes

Do not record any API key, raw provider response, remote D1 content, GitHub update or deployment evidence in this plan.

Commit handoff: the local reliability changes have been reviewed and verified,
but remain uncommitted. The GEO runtime and migrations are part of a larger
uncommitted packet, so a later commit must stage a reviewed coherent packet
rather than every changed path. Chris must explicitly authorise that commit.
The subsequent disposable local end-to-end proof and release/deployment review
remain separately authorised future milestones.

## Interfaces and Dependencies

- `apps/web/src/server/live-assessment.ts`: adds the failure transition and whole-run token configuration.
- `apps/web/src/server/geo-assessment-runner.ts`: adds typed aggregate usage limits.
- `apps/web/src/server/live-assessment.test.ts` and `apps/web/src/server/geo-assessment-runner.test.ts`: add regression fixtures.
- `apps/web/scripts/prove-local-d1-migrations.mjs`: new local-only validation script using the existing Wrangler dev dependency.
- No dependency, public endpoint, cloud binding, external service or remote migration is introduced.
