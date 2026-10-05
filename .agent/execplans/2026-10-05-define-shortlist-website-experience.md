# Define ShortList MVP 1 website experience

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #28 makes the public ShortList experience reviewable before code: every
journey state has a clear content purpose, accessibility expectation, truthful
claim boundary, and visual direction. It will give Chris a concise brief for
Loveable mockups and later implementation without creating a website or account.

## Progress

- [x] (2026-10-05 01:20Z) Verified #28, moved it In Progress, and inspected
  approved UX/journey requirements plus the design-evidence workspace.
- [x] (2026-10-05 01:30Z) Added the website experience, visual direction,
  journey-state, accessibility, mockup-rubric, and input/requirement brief.
- [x] (2026-10-05 02:10Z) Added a complete Loveable build brief and registered
  it as review evidence.
- [ ] Validate, push, and record review evidence; exported mockups remain a
  separate human/Loveable input before #28 can be accepted.

## Surprises & Discoveries

- Observation: No desktop/mobile mockup or Loveable export exists yet.
  Evidence: `docs/product/design/README.md` review register is `None yet`.

## Decision Log

- Decision: Store the design brief at `docs/product/design/WEBSITE_EXPERIENCE.md`.
  Rationale: It is the stable acceptance reference paired with exported mockups.
  Date/Author: 2026-10-05 / Codex.

## Outcomes & Retrospective

Pending. The desired result is a distinct, accessible and truthful design brief;
mockup approval remains a separate human review boundary.

## Context and Orientation

MVP 1 gives a business owner value before email capture. Its public states are
domain entry, validation/admission refusal, progress, evidence-based teaser,
email/delivery consent, entitlement/resend, and honest insufficient-evidence
or delivery-failure outcomes. Loveable is a design tool only, not the selected
runtime. The product uses warm, quirky small-business/search/AI references but
must remain clear, mobile-first, keyboard-operable, and readable without
animation.

## Plan of Work

Define visual voice and anti-patterns; page/state inventory; content and
truthfulness rules; mobile/accessibility acceptance; mockup coverage; and a
review rubric. Do not invent brand assets, provider wording, a production stack,
or customer copy for unresolved states.

## Concrete Steps

From `/home/chris/ShortList` run `git diff --check` and inspect
`docs/product/design/README.md`, `docs/product/REQUIREMENTS.md`, and the new
brief. Expected: no code or external service change.

## Validation and Acceptance

The brief must let Chris assess desktop/mobile mockups for all required states,
accessibility, evidence/inference distinction, dated-result truthfulness, and
the distinctive non-generic visual direction. Mockup exports remain required
before #28 is closed.

## Idempotence and Recovery

Documentation is additive. Keep superseded mockups as history in the register;
do not treat a design brief as production approval.

## Artifacts and Notes

- Output: `docs/product/design/WEBSITE_EXPERIENCE.md`.
- Mockup index: `docs/product/design/README.md`.

## Interfaces and Dependencies

No executable interface changes. The eventual public frontend consumes the
approved states/content rules; its framework and host remain #8/#9 decisions.
