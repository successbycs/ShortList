# Reconcile and preserve the uncommitted ShortList worktree

This ExecPlan is a living document and must be maintained under
`.agent/PLANS.md`.

## Purpose / Big Picture

Turn the mixed uncommitted ShortList worktree into safe, reviewable packets
without discarding substantive product, architecture, marketing, or runtime
work. After completion, each retained packet has a clear purpose, reconciled
documentation, scoped verification, and a separate commit. Generated artifacts
and caches are excluded without deleting independent ignored workspaces.

## Progress

- [x] (2026-10-07) Recorded the worktree inventory and obtained an independent
  Astra review; no source files were changed by that review.
- [x] (2026-10-07) Preserved a non-destructive, auditable inventory of the
  existing tracked and untracked source work, separately from generated files.
- [ ] (2026-10-07) Reconcile stale product, marketing, request-flow, and
  ExecPlan status statements before committing documentation packets.
- [ ] (2026-10-07) Separate and validate the marketing/governance, product,
  architecture, and release-workflow documentation packets.
- [ ] (2026-10-07) Repair and verify the runtime/admission and GEO feature
  defects before considering source-code commits. The schema-before-audit and
  website-evidence provenance controls are now covered by focused tests;
  cumulative budget and remaining runtime/replay controls remain open.
- [x] (2026-10-07) Replaced the static assessment progress card with a
  customer-readable staged animation and focused UI evidence. It is not a live
  server-side trace.
- [ ] (2026-10-07) Reconcile the requested website-assessment-led LLM report
  journey with the GEO runner, stored evaluation modes, requirements, and
  result renderer; retain the real website assessment and do not mislabel its
  provenance. The local renderer and stored-graph grouping are now implemented
  and tested; final source packet review/commit remains.
- [ ] (2026-10-07) Remove only confirmed generated, untracked artifacts and
  leave ignored runtime workspaces intact; create scoped commits after review.

## Surprises & Discoveries

- Observation: The Source Control badge is 189 individual changes: 51 tracked
  differences and 138 untracked files. Earlier directory-collapsed status
  output showed only 48 untracked entries.
  Evidence: Astra inventory on 2026-10-07.
- Observation: The GEO assessment runner can exceed the 70-second admission
  lease because it now performs three serial model stages before the two
  parallel evaluations.
  Evidence: `apps/web/src/server/assessment-admission.ts` and
  `apps/web/src/server/geo-assessment-runner.ts` reviewed on 2026-10-07.
- Observation: Generated `.playwright-cli/`, root `.wrangler/`, and
  `erl_crash.dump` are untracked review noise. Ignored `var/` contains nested
  Symphony workspaces and must not be included in a source cleanup.
  Evidence: Astra inventory found roughly 47 Playwright artifacts, a 4 MiB Erlang
  crash dump, and approximately 1.8 GiB under ignored `var/`.
- Observation: A completed stage was persisted before its model output had
  passed the applicable schema, so an invalid response could have looked like
  a successful audited stage.
  Evidence: `apps/web/src/server/geo-assessment-runner.ts` inspection and its
  new focused regression test on 2026-10-07.
- Observation: The explanatory progress animation described a “Current AI
  ranking in your area”, despite the current report increment prohibiting a
  customer-facing external-search ranking outcome.
  Evidence: `apps/web/src/routes/index.tsx`, `docs/product/REQUIREMENTS.md`
  INC-04, and `docs/product/website/PAGE_COPY.md` reviewed on 2026-10-07.
  Repair: renamed the stage to “Local context checked” and retained its
  service-area evidence explanation; focused journey test passed.
- Observation: An unavailable result can be emitted after server-side work
  starts, so saying “No assessment was made” is not always truthful.
  Evidence: `apps/web/src/server/assessment-submission.ts` catches failures
  after `runLiveAssessment`; `apps/web/src/routes/index.tsx` formerly made
  that absolute claim. Repair: the public message now says the assessment
  could not be completed; focused journey test passed.

## Decision Log

- Decision: Preserve substantive uncommitted work and split it into coherent
  review packets instead of resetting the worktree.
  Rationale: The worktree includes approved design decisions, imported
  marketing skills, migrations, tests, and unfinished implementation that a
  blanket reset would destroy.
  Date/Author: 2026-10-07 / Chris direction following Astra review
- Decision: Do not commit the GEO implementation until lease, budget,
  validation/audit, provenance, and real-boundary verification gaps are
  resolved or explicitly scoped as unfinished.
  Rationale: A passing source review would otherwise overstate operational
  correctness and customer-journey readiness.
  Date/Author: 2026-10-07 / Codex recommendation accepted by Chris
- Decision: Show the assessment's known stages as a paced frontend animation
  while the current request contract supplies only a final result.
  Rationale: the homepage needs to explain the work in progress, but a green
  frontend stage is not treated as evidence that the corresponding remote
  operation has completed. A future live trace requires an explicit streaming
  or persisted-progress contract.
  Date/Author: 2026-10-07 / Chris direction and Codex implementation note
- Decision: Retain the real public-website assessment as the report's input,
  then use an LLM to interpret the assessed website content into a business
  overview, three ICP hypotheses, buyer questions, and a report incentive.
  Rationale: Chris clarified that the website assessment is valuable. The
  product should avoid presenting web-search rankings as the customer outcome,
  while preserving truthful provenance for any website-derived evidence.
  Date/Author: 2026-10-07 / Chris
- Decision: Publish the favicon as a separate, clean production release rather
  than allowing the broader uncommitted assessment/report packet into the
  build.
  Rationale: Chris explicitly authorised a production deployment after the
  public hostname still served the legacy icon. A detached worktree at
  `c919924` was built and deployed, then the source was pushed; no uncommitted
  assessment/report files were part of the release.
  Date/Author: 2026-10-07 / Chris authorisation; Codex execution

## Outcomes & Retrospective

Pending. The worktree must remain recoverable until every retained packet is
committed and generated artifacts are deliberately handled.

The first isolated runtime repair extends the admission lease from 70 seconds
to 220 seconds, covering the documented 20-second retrieval budget, three
serial 45-second GEO stages, two parallel 45-second evaluations, and a small
completion margin. It is verified by the focused admission suite and strict
TypeScript, but remains uncommitted with its broader admission packet.

The checking view now animates known assessment stages from yellow clocks to
green checks and includes buyer-profile, buyer-question, and local-context
stages. Focused journey and domain-admission suites passed 36 tests together
with strict TypeScript on 2026-10-07. This is explanatory frontend state, not
proof that an individual backend operation has completed.

The runner now validates each stage before its completion hook can write the
durable audit record, and rejects profile/ICP citations that do not identify a
captured website source. Focused runner/execution tests passed eight tests and
strict TypeScript passed on 2026-10-07. Cumulative model-usage budget
enforcement and replay evidence remain open.

The Responses adapter now extracts the documented input/output usage metadata
and the execution writer persists those values only after the stage has passed
validation. Focused runner/provider/execution coverage passed 11 tests and
strict TypeScript on 2026-10-07. This improves the audit record but does not
create a dollar estimate: the approved model-plus-web-tool pricing policy and
therefore a truthful cumulative spend ceiling remain open.

The local evidence and remaining boundary were recorded on GitHub #55 on
2026-10-07. The on-page report acceptance evidence and review handoff were
recorded on GitHub #57 the same day. Neither comment authorizes a release.

The local report journey now ends explanatory progress at “Compiling results
for you”, asks for a browser-local email solely to reveal the report, and shows
the assessed domain, business overview, exactly three ICPs, three persisted
questions per ICP, and stored no-web LLM findings. Old saved result shapes are
not repurposed as customer-facing web-search reports. The focused UI and
stored-graph repository coverage prove the grouping and local boundary; the
increment remains uncommitted and undeployed.

The standalone favicon release `c919924` was built in a detached clean
worktree and deployed to the verified `shortlist-web` Cloudflare Worker as
version `c669ca3d-139d-4f2d-9507-9da019e303af`. The public hostname returned
`200 image/svg+xml` for `/favicon.svg`, with a downloaded SHA-256 matching the
release source. The commit was pushed to `origin/main`.

## Context and Orientation

The current `main` HEAD is `c919924`, which includes the isolated favicon
release on top of the D1-free marketing architecture and architecture/journey
documentation commits. The working tree still holds broad
pre-existing ShortList changes, including product/architecture documentation,
MVP 1 migrations, an expanded GEO assessment path, marketing-skill imports,
and numerous generated artifacts.

The repository requires an ExecPlan for cross-cutting or multi-session work.
`AGENTS.md`, `docs/harness/DEFINITION_OF_DONE.md`, and
`docs/harness/GITHUB_ISSUE_WORKFLOW.md` remain authoritative for change scope,
proof, and external authority. This plan authorizes only local repository
organization and verification; it does not authorize deployment, provider
calls, migrations against remote D1, email/PDF delivery, or GitHub writes.

The expected review packets are:

1. Marketing governance and imported skills.
2. Product, website/journey, GEO-method, and release-quality documentation.
3. Solution architecture, data-model, contracts, and conformance documents.
4. Release/workflow governance and linked request-flow documentation.
5. Admission, diagnostics, safe-fetch, and migration repairs.
6. GEO runtime implementation after its correctness gaps are repaired.
7. Confirmed generated artifacts excluded from source control.

## Plan of Work

### Milestone 1 — Preserve and classify

Create read-only inventories of tracked diffs and untracked source paths,
excluding ignored runtime trees. Record the baseline commit and checksums or
patch statistics needed to prove later cleanup did not silently lose source
work. Do not use `git reset`, `git clean`, broad stashes, or broad commits.

Observable result: a reviewer can see every candidate source packet and every
generated-artifact candidate before destructive cleanup is proposed.

### Milestone 2 — Reconcile document truth

Correct known stale contradictions: global geography wording in the Marketing
Brain, outdated Turnstile testing plans, implementation/outcome mismatch in
GEO and data-model plans, and request-flow distinctions between designed,
locally implemented, and observed deployed states. Preserve historical evidence
but label superseded approaches rather than rewriting history.

Observable result: customer-facing and architecture documents agree on current
approved scope and do not represent a prototype or proposed boundary as live.

### Milestone 3 — Commit document packets

Run scoped Markdown/whitespace/link checks and commit coherent documentation
packets only after their dependencies are present. Keep imported vendor skills,
licence, provenance, and their governing documentation in the same or a
preceding commit.

Observable result: a future reviewer can understand the product and solution
architecture without depending on an uncommitted worktree.

### Milestone 4 — Repair source packets

Inspect and repair the admission lease/runtime contract, cumulative AI budgets,
schema-before-success audit order, source-provenance validation, and the
approved evidence-first teaser. Add focused regression tests. Keep the live
email/PDF boundary explicitly deferred until recipient/session/provider work
is implemented and proven.

Observable result: the GEO path has bounded work, truthful audit events,
evidence-linked findings, and a customer journey consistent with approved copy.

### Milestone 4a — Build the website-assessment report journey

Keep safe retrieval and website-content extraction as the evidence boundary.
Use the LLM to interpret that assessed content into a business overview and
exactly three ICP hypotheses. Generate three buyer questions per ICP. Those
nine questions are customer-visible, are sent to the LLM, and their structured
findings are schema-validated, parsed, and persisted with the assessment. The
on-page report must distinguish website-derived evidence from LLM
interpretation and must not market external web-search rankings as the outcome.

Then replace the UI journey: the final checking stage reads “Compiling results
for you”; an inline email form leads to an on-page report with domain, business
overview, ICPs, grouped buyer questions, and qualified LLM findings. Use the
repository's marketing skills to structure and review the website-report
language before it is customer-facing. PDF generation and delivery remain
explicitly deferred; a future free-report incentive must not claim PDF or
email delivery until that boundary is implemented and proven. Revise product
requirements, request flow, contracts, page copy, and marketing context before
representing the new journey as live.

### Milestone 5 — Verify and commit source packets

Run the focused suites, full web test suite, lint, strict TypeScript, production
build, and disposable local D1 migration/replay proof appropriate to each
packet. Record limitations honestly. Commit only validated packets.

### Milestone 6 — Handle generated artifacts

After source packets are safe, remove only confirmed untracked generated
artifacts, using an explicit path list. Keep `.gitignore` policy changes
separate. Never remove ignored `var/` or nested workspaces without a fresh,
specific user authorization.

## Concrete Steps

Run from `/home/chris/ShortList`.

1. Record baseline and inventory:

   ```bash
   git rev-parse --short HEAD
   git status --short
   git diff --stat
   git ls-files --others --exclude-standard
   ```

2. Before each packet, inspect only its files with `git diff -- <paths>` and
   confirm no unrelated staged files are present.

3. For documentation packets, run `git diff --check -- <paths>` and direct
   local-link checks. The current repository-wide Markdown checker traverses
   generated/vendor trees, so record that limitation rather than treating its
   unrelated failures as packet failures.

4. For web/runtime packets, run the focused Vitest files first, then from
   `apps/web/`: `npm test`, `npm run lint`, `npx tsc --noEmit`, and
   `npm run build`. Add a fresh local D1 migration and replay check when a
   migration/repository boundary changes.

5. Stage exact reviewed paths and create one local commit per packet. Push or
   make GitHub Issue changes only with separate explicit user direction.

## Validation and Acceptance

- No substantive source/documentation path is removed without a recorded
  classification and review.
- Every retained commit has a focused purpose and excludes generated artifacts.
- Marketing/product/architecture documents agree on global scope, user journey,
  design-vs-live status, and D1's selected architecture role.
- GEO source changes demonstrate bounded lease/budget behavior, validated audit
  events, and provenance checks through focused tests.
- Customer-facing teaser behavior follows the approved evidence-first journey;
  delivery claims remain bounded by actual provider proof.
- No remote deployment, provider request, production migration, email send, or
  GitHub write occurs without new authority. The isolated favicon deployment
  and its source push were later explicitly authorised by Chris and recorded
  above.

## Idempotence and Recovery

Inventory and verification are read-only/repeatable. Each commit is additive
and uses exact staged paths. Before deleting a generated artifact, verify its
path is untracked and outside the approved source packets. If classification is
uncertain, leave the path untouched. Recovery is by retaining the existing
working tree and committing/archiving confirmed source packets before any
cleanup; do not use broad reset or clean commands.

## Artifacts and Notes

- Baseline: `0f414bb docs: add D1-free architecture marketing image`; current
  HEAD: `c919924 fix: publish ShortList favicon`.
- Astra review: 51 tracked changes + 138 untracked files; no source changed,
  tests run, or external call performed during review.
- Repository-wide Markdown checker limitation: it traverses generated Symphony
  workspaces and `node_modules`; validate changed document links directly until
  the checker is separately fixed.
- 2026-10-07: `npm test -- --run src/server/assessment-admission.test.ts`
  passed 11 tests; `npx tsc --noEmit` passed after the lease repair.
- 2026-10-07: `npm test -- --run src/server/geo-assessment-runner.test.ts
  src/server/geo-assessment-execution.test.ts` passed 8 tests; `npx tsc
  --noEmit` passed after the validation/audit and provenance repair.

## Interfaces and Dependencies

This plan may change TypeScript modules in `apps/web/src/server/`, React route
content in `apps/web/src/routes/index.tsx`, D1 migrations under
`apps/web/migrations/`, tests under `apps/web/src/**`, and ShortList
documentation/ExecPlans. It must preserve the existing public journey
contracts in `docs/product/REQUIREMENTS.md`, data/access rules in
`docs/product/CONTRACTS.md`, and platform choices in
`docs/product/ARCHITECTURE_DECISION.md`.
