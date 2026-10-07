# Define MVP 1 release quality gates

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList needs a single, human-readable way to decide whether MVP 1 is ready to release. Current tests and requirements are useful but scattered across source files, GitHub Issues, and implementation plans. This work creates a release test plan and a definition of done that make the minimum bar explicit: unit tests, local integration tests, a real public end-to-end test, and Chris's human review.

## Progress

- [x] (2026-10-06 02:45Z) Inspected the MVP requirements, request-flow document, current #10 implementation plan, test-suite structure, and repository Definition of Done.
- [x] (2026-10-06 02:55Z) Identified the gap: tests exist, but there is no single MVP 1 release-quality pack or explicit release decision record.
- [x] (2026-10-06 03:05Z) Added the product-specific MVP 1 release test plan and definition of done. No application behaviour, live service, configuration, credentials, database, or dispatcher state changed.
- [ ] Use the quality pack to create and execute the remaining bounded test packets; record actual evidence against each gate.

## Surprises & Discoveries

- Observation: `apps/web` has focused Vitest tests for domain admission, safe fetch, D1-compatible repositories, AI adapters, admission control, and prototype journey states.
  Evidence: source inventory on 2026-10-06 found 13 current test files and `npm test` previously recorded 74 passing tests.

- Observation: the public Green Gecko submission displayed an insufficient-evidence message while remote D1 had no assessment rows.
  Evidence: `docs/product/REQUEST_FLOW.md`, current diagnostic finding dated 2026-10-06. This is an unproven live boundary, not evidence of a sparse website.

## Decision Log

- Decision: Keep the generic repository Definition of Done authoritative for process rules, and add product-specific release gates in `docs/product/`.
  Rationale: ShortList needs concrete customer-journey tests without changing the reusable template policy.
  Date/Author: 2026-10-06 / Codex, in response to Chris's request.

- Decision: Separate automated test success from release acceptance. A public deployment is not releasable until its live assessment, D1 persistence, cached replay, and truthful failure outcomes are directly observed.
  Rationale: the current Green Gecko evidence demonstrates why a generic error screen and passing unit tests cannot stand in for the real boundary.
  Date/Author: 2026-10-06 / Codex, based on observed MVP 1 behaviour.

## Outcomes & Retrospective

The quality pack is documented. It is intentionally not a claim that MVP 1 is releasable. The next outcome is to execute its remaining test gates in dependency order and record their passed, failed, blocked, or unobserved status in the associated GitHub Issues and this plan.

## Context and Orientation

`docs/product/REQUIREMENTS.md` is the approved source of product requirements. `docs/product/REQUEST_FLOW.md` explains the browser-to-Worker request path and records the live diagnostic gap. `apps/web/` is the Cloudflare Workers + Static Assets application and uses Vitest for unit and component tests.

The generic `docs/harness/DEFINITION_OF_DONE.md` prevents a mock, screenshot, or terminal result being misrepresented as operational proof. The two new product documents apply that policy to ShortList MVP 1.

## Plan of Work

Create `docs/product/MVP1_RELEASE_TEST_PLAN.md`, which makes the test layers explicit, lists each release scenario, names the proof expected, and distinguishes what can be automated from what needs a real browser against the deployed Worker.

Create `docs/product/MVP1_DEFINITION_OF_DONE.md`, which states the non-negotiable conditions for a release candidate, what is not enough, who accepts the release, and where evidence lives.

Link both documents from `docs/product/REQUEST_FLOW.md` so an engineer debugging an assessment sees the release standard.

## Concrete Steps

From `/home/chris/ShortList`:

1. Read the requirements, request flow, existing implementation plan, and test strategy.
2. Add the two product quality documents and request-flow links.
3. Check Markdown references and whitespace:

   ```bash
   rg -n "MVP1_RELEASE_TEST_PLAN|MVP1_DEFINITION_OF_DONE" docs/product
   git diff --check
   ```

Expected result: both product documents are discoverable and whitespace check returns no output.

## Validation and Acceptance

Documentation acceptance requires a reader to be able to see the unit, integration, end-to-end, security, and human-acceptance layers without reading source. Each release test must have a clear input, expected result, proof location, and status vocabulary. The plan must mark the Green Gecko live assessment and cached replay unproven, rather than passed. The definition of done must refuse release if a required real boundary is failed, blocked, or unobserved.

This work does not run a live assessment, modify a provider, deploy code, or claim a release.

## Idempotence and Recovery

The documentation edits are additive and safe to repeat. If a test scenario changes, update the two quality documents and record the decision in this plan. If a test discovers a defect, create or update the relevant issue and mark the gate failed; do not weaken the expected outcome to make a release appear ready.

## Artifacts and Notes

- `docs/product/MVP1_RELEASE_TEST_PLAN.md` — release scenarios and evidence matrix.
- `docs/product/MVP1_DEFINITION_OF_DONE.md` — release acceptance standard.
- `docs/product/REQUEST_FLOW.md` — technical flow and current live diagnostic status.

## Interfaces and Dependencies

No source-code interfaces, credentials, deployment settings, or external services change. The quality pack depends on the product requirements, Cloudflare Worker request flow, D1 records, Turnstile verification, and the existing Vitest suite. A later real-browser proof requires a valid Turnstile response and explicit authority to run the live assessment.
