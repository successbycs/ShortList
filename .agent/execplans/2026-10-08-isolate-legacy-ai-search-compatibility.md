# Isolate legacy comparable-business compatibility from the GEO assessment path

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Make the code reflect the approved ShortList assessment behaviour without
discarding historic records. A new domain assessment must use only the
evidence-led GEO (generative-engine optimisation) path: website evidence,
business profile, three ideal-customer-profile hypotheses, nine buyer
questions, and two dated finding modes. A historic `ai_evidence` comparable-
business record remains readable only as a named compatibility result so a
maintainer cannot mistake it for a current assessment format.

After this work, a reader can follow the current production path in
`live-assessment.ts` without encountering obsolete prompt construction, and
can find all retained historic-result handling in a deliberately named legacy
compatibility module. Local tests will prove new submissions do not use the
legacy reader and historic records receive the documented refresh outcome.

## Progress

- [x] (2026-10-08 02:45Z) Inspected the approved requirements, SDD, GEO
  contract, request flow, current implementation, and data-model conformance
  matrix.
- [x] (2026-10-08 03:07Z) Moved historic `ai_evidence` result typing and lookup
  behind an explicitly named compatibility module; removed obsolete request
  creation from the live GEO orchestration module.
- [x] (2026-10-08 03:08Z) Replaced the retired request-builder test with a
  focused compatibility-read regression test and ran local quality gates.
- [x] (2026-10-08 03:08Z) Recorded validation evidence and outcomes in this
  plan.

## Surprises & Discoveries

- Observation: the requirements intentionally retain generic comparable-
  business results only for historic cached records.
  Evidence: `docs/architecture/DATA_MODEL_CONFORMANCE.md` line 25 labels
  `ai_evidence` "legacy only" and requires the GEO path never to read it for a
  new assessment.
- Observation: `apps/web/src/server/live-assessment.ts` executes only the GEO
  path for new work, but still imports legacy types and lookup and also exports
  an unused legacy request builder.
  Evidence: `rg` found `createAiRequests` is used only by
  `live-assessment.test.ts`; the new submission path calls
  `executeAndPersistGeoAssessment`.

## Decision Log

- Decision: retain legacy comparable-business data as read-only compatibility,
  not as a current report or new-assessment implementation path.
  Rationale: this is the explicit current conformance requirement; deleting
  historic reading could strand existing records, while keeping it in the
  primary GEO orchestration obscures the current product behaviour.
  Date/Author: 2026-10-08 / Codex
- Decision: do not add a deletion date or data migration in this refactor.
  Rationale: the documentation authorises legacy retention but does not set a
  retention/removal policy. Changing persisted data requires a separate,
  explicitly authorised compatibility plan.
  Date/Author: 2026-10-08 / Codex

## Outcomes & Retrospective

The live coordinator now reads historic `ai_evidence` through
`legacy-ai-search.ts`, whose names and comments make its compatibility-only
status unambiguous. It no longer owns the retired generic-comparable-business
request builder or imports the legacy request contract. New work continues to
execute the GEO graph path after cache and admission checks.

`legacy-ai-search.test.ts` proves that a complete historic two-mode record can
still be read. The focused suite passed 22 tests; the complete Vitest suite
passed 109 tests. TypeScript and production build passed. ESLint had zero
errors and retained the eight pre-existing UI/generated-file warnings. No D1
migration, provider request, deployment, or customer data operation occurred.

## Context and Orientation

`docs/product/REQUIREMENTS.md` is the approved product baseline. Its current
increment requires an on-page GEO report; `MVP1-JNY-003` defines the successful
result as a profile, three ICP hypotheses, three questions per ICP, and two
dated AI modes. `docs/product/GEO_PROMPT_CONTRACT.md` says this replaces the
generic comparable-business prototype. `docs/architecture/DATA_MODEL_CONFORMANCE.md`
qualifies the apparent conflict: the `ai_evidence` table and old report shape
are retained for historic cached results only.

`apps/web/src/server/live-assessment.ts` is the coordinator for a new domain
submission. It checks a saved GEO result, then currently checks legacy
`ai_evidence`, applies admission, captures website evidence, and executes the
GEO assessment. Its bottom-level `createAiRequests` helper constructs obsolete
comparable-business requests and is tested only by its dedicated test. The
public route uses `StoredAssessmentResult` to render GEO data or an honest
"earlier assessment needs a refresh" state for legacy data.

The refactor is local-only. It changes no D1 schema, configured binding,
provider request, deployment, or customer data. Existing uncommitted user work
must be preserved.

## Plan of Work

Milestone 1 — create a clear compatibility boundary. Move the legacy stored
result type and D1 lookup into `apps/web/src/server/legacy-ai-search.ts`, with
names that declare it is historic-only. The module will be read-only and will
not construct or execute provider requests. Update `live-assessment.ts` to
import the compatibility reader only for the cache check and to expose its
union type under a clear `LegacyComparableBusinessAssessment` name.

Milestone 2 — retire dead legacy request construction. Remove
`createAiRequests`, its legacy `AiSearchRunRequest` dependency, and its
dedicated test. Leave the `ai-search/` adapter modules untouched because they
remain part of pre-existing work and are outside the new-assessment path.

Milestone 3 — prove the boundary. Add/adjust tests to show a saved historic
assessment is returned as a legacy compatibility result and a new assessment
continues into GEO execution without calling the legacy reader beyond the
initial cache lookup. Keep route rendering coverage for the refresh outcome.

## Concrete Steps

Run from the repository root:

```bash
rg -n "createAiRequests|findStoredAssessment|StoredAiEvidence" apps/web/src
git diff --check
```

Run from `apps/web`:

```bash
npm test -- --run src/server/live-assessment.test.ts src/test/prototype-journey.test.tsx
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Expected result: focused and full tests pass, TypeScript and production build
pass, and lint has no errors. Existing generated/UI fast-refresh warnings may
remain; this work must introduce none.

Actual results on 2026-10-08: focused Vitest passed 3 files / 22 tests; full
Vitest passed 18 files / 109 tests; TypeScript, production build, and `git diff
--check` passed. ESLint had 0 errors and the same 8 existing warnings.

## Validation and Acceptance

- New submissions query a saved GEO result first and use GEO assessment
  execution for cache misses; they never construct a generic comparable-
  business request.
- A historic `ai_evidence` record remains readable as a clearly typed legacy
  result and the visitor route retains the safe refresh message rather than
  presenting it as a current GEO report.
- `live-assessment.ts` contains no `createAiRequests` helper or
  `AiSearchRunRequest` import.
- No schema/data migration, provider call, deployment, or D1 runtime claim is
  made. Those operational boundaries remain unobserved by design.

## Idempotence and Recovery

The refactor and its tests are repeatable and make no external changes. If a
compatibility test fails, restore the previous import arrangement through a
small source patch; do not delete the legacy table, migration, repository, or
historic records. Do not run a D1 migration or a real provider request.

## Artifacts and Notes

- Requirements authority: `docs/product/REQUIREMENTS.md`, especially current
  increment lines 8–22 and `MVP1-JNY-003`.
- Method authority: `docs/product/GEO_PROMPT_CONTRACT.md`, especially lines
  3–25 and 123–134.
- Compatibility authority: `docs/architecture/DATA_MODEL_CONFORMANCE.md` line
  25.
- Post-refactor checks: 109 Vitest tests, TypeScript, and production build
  passed on 2026-10-08; lint had eight pre-existing warnings and no errors.

## Interfaces and Dependencies

- `apps/web/src/server/legacy-ai-search.ts` (new): read-only legacy result
  type and `findLegacyComparableBusinessAssessment(database, normalisedDomain)`
  lookup, backed by the existing `ai-evidence-repository`.
- `apps/web/src/server/live-assessment.ts`: current GEO coordinator; imports
  the named legacy reader solely to return a saved historic result after no GEO
  result exists.
- `apps/web/src/server/live-assessment.test.ts`: removes retired generic
  request-builder coverage and adds compatibility-boundary coverage.
- `apps/web/src/routes/index.tsx`: consumes the stored-result union and keeps
  its existing legacy refresh UI; no copy or public journey behaviour changes.
