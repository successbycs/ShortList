# Implement the static prototype reveal journey

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Update `apps/web` so a reviewer can see useful evidence before entering an email, see the fuller result locked/blurred, supply separate delivery and optional marketing consent, confirm a masked address or change it, and reveal the complete on-page result. Nothing sends email, calls a model, persists data, or creates a paid MVP 2 flow.

## Progress

- [x] (2026-10-05) Inspected repository guidance, GH-29, its comments, the closed #34 dependency, the existing prototype, and the clean worker workspace.
- [x] (2026-10-05) Replaced the superseded post-teaser sequence and added focused interaction tests.
- [x] (2026-10-05) Ran tests, lint, build, and responsive local rendering at desktop and 375px.
- [x] (2026-10-05) The worker recorded evidence on #29, removed only `symphony:ready`, and left the issue for human review.
- [x] (2026-10-05) Chris approved and closed #29; its isolated-workspace result was integrated into the main repository.

## Outcomes & Retrospective

The prototype has a reviewable local sequence from useful teaser through a deliberately locked preview, separate consent, masked-address confirmation/change, and a revealed full result. The full result retains distinct current-web and model-knowledge warnings and carries a disabled MVP 2 location. Automated interaction coverage is included. The browser rendered responsive entry/navigation at both required widths; interaction tests cover remaining transitions.

## Context and Orientation

`apps/web/src/routes/index.tsx` is the adopted Loveable React prototype. The prototype remains fixture/local-state only. `apps/web/src/test/` uses Vitest and Testing Library. No API, configuration, credential, server route, data schema, or third-party dependency is added.

## Validation and Acceptance

The bounded deliverable is a local frontend prototype. Passing means a reviewer can traverse teaser -> locked preview -> consent -> masked confirmation/change -> revealed full result, view both result-mode limitations, and see the disabled future-only MVP 2 location. External delivery, database, PDF, payment, and deployment are deliberately out of scope.

## Evidence

Worker validation on 2026-10-05: `npm test` passed (2 files, 3 tests); `npm run lint` passed with 0 errors and 6 unchanged Fast Refresh warnings; `npm run build` passed with existing Vite/Nitro/Cloudflare warnings; `git diff --check` passed. Source inspection found no route-level network, provider, credential, persistence, or payment code.
