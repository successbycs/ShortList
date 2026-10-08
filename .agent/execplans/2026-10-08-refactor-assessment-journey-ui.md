# Refactor the assessment journey into components and a typed hook

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Make the homepage assessment journey easier to change without changing what a
visitor sees. The route will become page composition, screen components will
live under `apps/web/src/components/assessment/`, and a reducer-backed hook
will own the valid domain-to-report transitions. A person can still enter a
domain, see explanatory progress, reveal a completed report after local email
entry, and receive the same safe outcomes.

## Progress

- [x] (2026-10-08 03:12Z) Inspected the route, existing journey tests, and
  repository plan requirements.
- [x] (2026-10-08 03:35Z) Extracted entry, progress, reveal, failure, and
  report presentation into `components/assessment/`; the route now composes
  screens only.
- [x] (2026-10-08 03:23Z) Added a reducer-backed journey hook and integrated it
  into the route; added late-response reset coverage and changed the hook to a
  discriminated state union.
- [x] (2026-10-08 03:35Z) Extract entry, progress, reveal, failure, and report
  presentation into `components/assessment/` while retaining exact copy,
  classes, accessibility attributes, and test identifiers. Completed on
  2026-10-08; route now composes the extracted screen modules.
- [x] (2026-10-08 04:15Z) Proved the final refactor with 14 focused journey
  tests, 113 full Vitest tests, generated Cloudflare types, TypeScript,
  production build, and diff whitespace checks. Lint has no errors and eight
  pre-existing/generated warnings.
- [x] (2026-10-08 04:10Z) Reconstructed a buildable monolithic product
  baseline from recovered local Git objects and recreated the scoped refactor
  above it. The local-only backup remains at
  `backup-before-assessment-history-repair`.
- [x] (2026-10-08 04:15Z) Obtained an independent Astra review of the rebuilt
  refactor, fixed the reset-domain regression and commit-boundary documentation,
  and recorded approval.
- [x] (2026-10-08 04:20Z) Terra independently re-audited Option 1 without
  changing history: baseline `7c92591` and refactor `06c6544` are independently
  valid and the pair was retained.

## Surprises & Discoveries

- Observation: the route has six screens but stores screen, submitted result,
  form values, and errors as independent state variables.
  Evidence: `apps/web/src/routes/index.tsx` lines 54–111.
- Observation: an async result can arrive after a visitor resets the journey.
  Evidence: independent Astra review on 2026-10-08; fixed with a request
  generation ref and regression test.
- Observation: the route file overlaps with pre-existing product work, so a
  path-level `git add` would mix unrelated changes into the refactor commit.
  Evidence: working-tree review on 2026-10-08; the route must be staged by
  selected hunks after component extraction.
- Observation: the refactor hook consumes the new `DomainAssessmentSubmissionResult`
  contract from the uncommitted product increment, so it cannot be a standalone
  commit on the current parent.
  Evidence: Astra review of `fc28987` on 2026-10-08 found its parent still
  expects a Turnstile token and lacks the new unavailable-result fields.
- Observation: the initial Astra review also found missing coverage for a
  rejected server call and an old response arriving while a newer request is
  pending.
  Evidence: added focused journey regressions on 2026-10-08; 14 focused tests
  now pass.
- Observation: a second Astra review confirmed the current tip type-checks and
  focused journey suite pass, and found no functional defect in the extracted
  components or typed hook. It rejected the history only because the feature
  baseline was not reconstructed as an independently buildable monolithic
  route before extraction.
  Evidence: Astra review of `370d263` and `31d3fda` on 2026-10-08.
- Observation: the local Git object database retained the exact monolithic
  local-reveal route and matching product-test snapshot needed to reconstruct
  the product baseline without manually recreating presentation code.
  Evidence: recovered route blob `525d528` and test blob `80fd09e`, used in
  baseline commit `7c92591`.
- Observation: the final Astra review found reset initially returned the
  default domain, unlike the previous retry/back behaviour. The union now
  carries the submitted domain after entry, and the regression suite proves a
  retry keeps a non-default normalised domain.
  Evidence: independent review and test added on 2026-10-08.
- Observation: Terra's fresh Option 1 audit found the baseline worktree clean
  at `7c92591`; its full suite passed 109 tests. The refactor tip passed 14
  focused journey tests and 113 full tests; lint had zero errors and eight
  existing/generated warnings.
  Evidence: Terra read-only audit on 2026-10-08.

## Decision Log

- Decision: introduce a local reducer-backed hook, not global state or a
  state-machine library.
  Rationale: the bounded route has no cross-page consumers, while its current
  independently mutable state makes transition ownership unclear.
  Date/Author: 2026-10-08 / Codex
- Decision: preserve copy, Tailwind classes, server boundary, and existing DOM
  test identifiers during extraction.
  Rationale: this is a maintainability refactor, not an approved product or
  visual change.
  Date/Author: 2026-10-08 / Codex
- Decision: reconstruct the local product baseline rather than squash the
  product and refactor commits.
  Rationale: this preserves the requested refactor-only review boundary and
  permits each prerequisite commit to be built and tested on its own.
  Date/Author: 2026-10-08 / Codex

## Outcomes & Retrospective

The route now contains metadata, shell layout, and an exhaustive screen switch;
entry and remaining assessment presentation are in
`components/assessment/`. The reducer hook has a discriminated state union,
so result and failure screens cannot render without their required data. A
request generation guard prevents late responses from overwriting a reset or
newer journey. The baseline commit `7c92591` independently passes its 10
focused journey tests, generated Cloudflare type check, and production build.
The final scoped refactor passes 14 focused journey tests, 113 full tests,
lint with no errors, TypeScript, production build, and whitespace checks.
Independent Astra review approved the code and commit boundary after the
reset-domain regression was fixed.

Terra subsequently re-verified the exact pair. It confirmed that `06c6544` is
the direct child of `7c92591`, the baseline is independently buildable and
tested, and the refactor changes exactly the six intended paths. No history
reconstruction was warranted. The three untracked 2026-10-07 ExecPlans are
unrelated historical files and remain deliberately uncommitted.

## Context and Orientation

`apps/web/src/routes/index.tsx` is the TanStack file route for `/`. It contains
the route shell and screen composition; presentation lives in
`apps/web/src/components/assessment/` and transitions live in the journey hook.
The server function remains
`apps/web/src/functions/submit-domain-assessment.ts`; it must not move into the
browser component tree. `apps/web/src/test/prototype-journey.test.tsx` supplies
the behaviour regression suite. The requirements’ current increment in
`docs/product/REQUIREMENTS.md` requires the same local-email reveal journey;
this plan changes no contract or customer wording.

## Plan of Work

First, extract presentational screens and report rendering into assessment
components, exporting narrow prop interfaces. Keep view-only helpers such as
failure-copy mapping and time formatting with the screens that use them.
Second, retain `useAssessmentJourney` as the only owner of the discriminated
state union, input validation, asynchronous submission generation, reset, and
email reveal. The route will retain route metadata, header/footer, and a
screen switch only. Preserve the current generic failure fallback when the
server function rejects.

Third, run focused and full local validation. Inspect the final commit against
its product baseline to confirm it contains only extraction/state-machine
changes: the new component files and hook, selected route/test changes, and
this ExecPlan. Do not include generated artefacts or unrelated product/docs
work. Finally, ask Astra to review that committed diff and record all findings
and fixes in this plan before declaring completion.

## Concrete Steps

Run from `apps/web`:

```bash
npm test -- --run src/test/prototype-journey.test.tsx
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Run from the repository root:

```bash
git diff --check
git diff --cached --check
```

## Validation and Acceptance

- Each existing route outcome, progress stage, local reveal, legacy refresh,
  and GEO report test remains passing.
- A rejected server-function call leaves progress and displays the existing
  safe unavailable outcome.
- The route contains route metadata and page composition, not report markup or
  transition logic.
- Each `JourneyState` variant carries exactly the data its screen needs; a
  result screen cannot exist without a stored result and a failure screen
  cannot exist without a safe failure outcome.
- The refactor commit contains only its hook, components, selected route/test
  hunks, and this ExecPlan.
- Astra has reviewed the committed diff; unresolved findings are recorded as
  incomplete rather than silently accepted.
- No provider call, deployment, schema mutation, or product-copy change occurs.

## Idempotence and Recovery

All edits and checks are local and repeatable. If extraction changes rendered
behaviour, restore the relevant component to the route through a narrow patch;
do not alter server contracts or persisted assessment data.

## Artifacts and Notes

This is a refactor-only task. Unit/component tests prove local behaviour; a
deployed journey remains unobserved and is outside this authority.

## Interfaces and Dependencies

- `apps/web/src/hooks/use-assessment-journey.ts`: local hook exposing form
  values, a discriminated `JourneyState`, submit/reveal/reset handlers, and
  generation-safe asynchronous completion.
- `apps/web/src/components/assessment/`: presentational screen components and
  report view helpers.
- `apps/web/src/routes/index.tsx`: route metadata and composition only.
