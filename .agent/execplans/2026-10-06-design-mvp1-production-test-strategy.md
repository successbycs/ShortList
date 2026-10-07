# Design MVP 1 production test strategy

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList needs a release-quality test design that proves the actual public
service, rather than treating a green build, screenshot, or fake database test
as proof. After this design is accepted, a reader can see exactly what must be
tested, what evidence counts, what data may be observed, and which small code
packets are needed before one real Green Gecko assessment and cached replay can
be honestly called passed.

The public boundary is only `https://shortlist.successbycs.com`. This design
does not create a staging site, second Worker, second D1 database, CI service,
Cloudflare Access layer, or test-only customer route.

## Progress

- [x] (2026-10-06 04:20Z) Reviewed Issue #10, Issue #48, the current release
  test documents, the public failure, and the server-function boundary.
- [x] (2026-10-06 04:20Z) Astra independently reviewed the approach and found
  that the handler suppresses all operational exceptions with `catch {}`.
- [x] (2026-10-06 04:20Z) Defined the required test layers, evidence rules,
  diagnostic schema, and six dependency-ordered child packets below.
- [ ] Obtain Chris's review of this test-design plan before implementation.

## Surprises & Discoveries

- Observation: the production browser reached `assessment_unavailable` after
  Turnstile was removed, but no supporting diagnostic was emitted.
  Evidence: Chris's production screenshot on 2026-10-06 and
  `apps/web/src/functions/submit-domain-assessment.ts`.

- Observation: the current handler converts every thrown error into the same
  safe public response without logging it.
  Evidence: the empty `catch` at the server-function boundary. The existing
  global error helper cannot see an exception which is already caught.

- Observation: the prior automated-E2E plan proposed separate infrastructure
  and does not satisfy the requirement to prove the actual public URL.
  Evidence: `.agent/execplans/2026-10-06-build-repeatable-production-e2e-test.md`.

## Decision Log

- Decision: MVP 1's automated browser proof will use the real public hostname,
  a real public domain, existing Chromium/Playwright, and read-only scoped D1
  evidence.
  Rationale: this is the boundary the product claims and avoids fabricated test
  environments.
  Date/Author: 2026-10-06 / Chris.

- Decision: Turnstile is deferred to MVP 3+. Existing domain validation,
  safe-fetch restrictions, active-domain lease, two-slot concurrency control,
  and privacy-minimised IP/day limit remain in MVP 1.
  Rationale: it blocked the primary user journey and cannot be exercised by
  automated Chromium without a separate test environment.
  Date/Author: 2026-10-06 / Chris.

- Decision: production diagnostics must be correlation-safe and privacy-safe.
  Rationale: the operator must classify failures without exposing secrets,
  personal data, website content, raw IP addresses, model prompts, responses,
  or stack traces to visitors or GitHub.
  Date/Author: 2026-10-06 / Codex and Astra recommendation.

## Outcomes & Retrospective

The test design is complete but awaiting Chris's review. It does not claim
that the service, logging, or E2E verifier exists yet. The next plan implements
the approved design in bounded packets and enables Terra's real production run.

## Context and Orientation

`apps/web/` is a TanStack Start application deployed as Cloudflare Worker
`shortlist-web`; it uses D1, safe public-website retrieval and OpenAI calls.
`apps/web/src/functions/submit-domain-assessment.ts` is the private request
boundary. `docs/product/MVP1_RELEASE_TEST_PLAN.md` and
`docs/product/MVP1_DEFINITION_OF_DONE.md` are the release gates. Issue #10 is
the parent delivery task; Issue #48 remains a focused visitor-message
correction.

An *opaque support reference* is a newly generated random identifier returned
to a visitor only when an internal service failure occurs. It reveals nothing
about the business, database, provider, configuration, or exception. A
*diagnostic event* is a single structured Worker log record containing that
reference, a coarse phase, outcome class, and duration. It exists so an
operator using `wrangler tail` can correlate the public failure with its
internal phase.

## Plan of Work

### Milestone 1 — Establish test evidence rules

Define four layers: static quality (lint/types/build), unit tests, fake-boundary
integration tests, and real public E2E. Declare that only the fourth layer,
with a matching D1 audit, proves the deployed assessment. Make every expected
failure a named, safe outcome rather than a silent fallback.

### Milestone 2 — Add observability before testing costly work

Specify one event per request attempt with fields: `supportRef`, UTC timestamp,
phase (`runtime`, `d1_cache`, `admission`, `website_fetch`, `d1_write`,
`ai_call`, `result_persist`), outcome (`completed`, `cached`, `limited`,
`rejected`, `unavailable`), safe category, and elapsed milliseconds. Do not log
domain, raw IP, API key, token, email, excerpt, provider request/response,
error body, or stack trace. The visitor sees only a safe message and support
reference.

### Milestone 3 — Define the real-run protocol

For the approved domain `greengeckogardens.co.nz`, run Chromium visibly (with
screenshots when a desktop display is unavailable), make one public request,
observe the correlated Worker event, then make only the needed read-only D1
queries. A completed result must create one customer, one completed run,
website evidence, and two AI-evidence rows. A limited result must create its
recorded limited run with no invented success. A repeat must return cached and
create neither a new run nor fresh AI evidence.

### Milestone 4 — Partition execution

Create the detailed child Issues below. They are serial; no later packet is
admitted to Symphony until its prerequisite has human-reviewed evidence.

1. Remove Turnstile from MVP 1 — already implemented/deployed but needs
   durable review evidence.
2. Add safe correlated diagnostics.
3. Classify one real unavailable fault.
4. Repair only the named fault.
5. Add a lean reusable real-production E2E verifier.
6. Have Terra execute the final public run and record release evidence.

## Concrete Steps

From `/home/chris/ShortList/apps/web`, the implementation plan must require:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run types
npm run build
```

For the final authorised public proof, it must run the existing Playwright
Chromium session against `https://shortlist.successbycs.com`, use `wrangler
tail` only for the short diagnostic window, and run only read-only D1 queries
scoped to `greengeckogardens.co.nz`. Actual commands and safe observations are
recorded in the implementation ExecPlan and Issue #10 after execution.

## Validation and Acceptance

The design is accepted when:

1. Each test layer has an explicit purpose and does not overclaim proof.
2. The diagnostic-event schema is bounded and redacted.
3. The live protocol defines completed, limited, unavailable, and cached
   evidence without treating a screenshot as proof.
4. The child Issue graph has no invented infrastructure or ambiguous fix.
5. The implementation plan names commands, rollback, and required explicit
   approval for production cost/data writes.

## Idempotence and Recovery

Planning and source review are safe to repeat. A diagnostic live submission is
not automatically repeated: one authorised attempt is made, then the category
is fixed before another costly attempt. The E2E verifier uses an already stored
completed result on replay. If a request fails, retain only its support
reference and safe phase/category; do not retry blindly or expose error data.

## Artifacts and Notes

- `docs/product/MVP1_RELEASE_TEST_PLAN.md` — release matrix to update.
- `docs/product/MVP1_DEFINITION_OF_DONE.md` — release gate to update.
- `docs/product/REQUEST_FLOW.md` — human-readable system flow to update.
- `.agent/execplans/2026-10-06-implement-mvp1-production-e2e-verification.md`
  — the successor implementation plan.
- GitHub #10 — parent review record; #48 — narrow UI correction only.

## Interfaces and Dependencies

The planned diagnostic interface is server-only, at
`apps/web/src/server/assessment-diagnostics.ts`, with a function conceptually
equivalent to `emitAssessmentDiagnostic(event)`. Its event type must contain
only the field set defined in Milestone 2. A browser result may include an
optional opaque `supportRef`; it must never include the event's internal
category, raw error, or private data.

Existing skills to use are `execplan-maintenance`, `github-issue-session`,
`playwright`, `wrangler`, and `workers-best-practices`. A project-specific
`shortlist-production-e2e` skill is optional only after this design is accepted;
it would codify redaction, go/no-go, visible Chromium, short Worker tail, D1
audit, cache replay, and local artifact format. A generic testing skill and a
Turnstile skill are out of scope.
