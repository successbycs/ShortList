# Document lightweight delivery tiers

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Give a template user a simple way to select appropriate planning evidence
without turning documentation into a custom scheduler policy. Small tasks stay
as a well-scoped GitHub Issue; material work has a short specification; risky
or multi-session work has that specification plus the existing living ExecPlan.
Afterward, upstream Symphony eligibility remains based on its supported
repository/workflow configuration and clear Issue evidence, not a custom SDD
validator, model routing, or mandatory framework.

## Progress

- [x] (2026-10-04 04:42Z) Inspect #16, readiness definition, Issue template,
  ExecPlan contract, active workflow guide, and active terminology.
- [x] (2026-10-04 04:43Z) Replace the custom SDD eligibility requirement with
  concise planning tiers and links to existing templates.
- [x] (2026-10-04 04:44Z) Walk one representative task through each tier and
  run Markdown/canonical verification.
- [ ] (2026-10-04 04:43Z) Commit scoped documentation and record #16 evidence
  while leaving the Issue open for human review.

## Surprises & Discoveries

- Observation: The repository already has the required reusable templates.
  Evidence: `.github/ISSUE_TEMPLATE/feature.md` carries outcome, scope,
  acceptance, code-packet, dependency, and verification prompts; `.agent/PLANS.md`
  is a detailed living-ExecPlan contract.
- Observation: Active Symphony readiness still includes a custom SDD artifact
  as queue admission condition.
  Evidence: `docs/harness/DEFINITION_OF_READY.md` says an eligible Issue needs
  “the required specification artifact for its declared SDD tier,” and the
  feature template contains the related checkbox.

## Decision Log

- Decision: Keep three planning levels as documentation guidance only; do not
  encode them in upstream queue admission.
  Rationale: #16 explicitly rejects a custom Symphony policy engine. An Issue
  needs clear scope and exact verification before deliberate dispatch, but the
  artifact form is selected by work risk and the existing ExecPlan rules.
  Date/Author: 2026-10-04 / Codex and repository owner.

## Outcomes & Retrospective

The active workflow now describes all three planning levels and links existing
Issue/ExecPlan templates. The readiness and Issue-template language no longer
requires a custom SDD artifact for upstream queue admission. A small command
correction is Issue-only; a material configuration/documentation integration
uses a concise specification; #41's cross-cutting Python-runtime retirement
uses its living ExecPlan. Markdown links, Ruff, and the full 36-test canonical
suite passed. Remaining work is a scoped local commit and #16 open review
handoff. No runtime or scheduler behavior changes are part of this plan.

## Context and Orientation

`docs/harness/GITHUB_ISSUE_WORKFLOW.md` is the canonical user-directed Issue
process. `.github/ISSUE_TEMPLATE/feature.md` is the reusable bounded-work
template. `.agent/PLANS.md` determines when a living ExecPlan is required.
`docs/harness/DEFINITION_OF_READY.md` distinguishes user-directed sessions from
deliberately started upstream Symphony dispatch. `docs/workflows/DEVELOPMENT_WORKFLOW.md`
is the high-level visual flow.

The old “SDD tier” wording risks two false claims: that a new framework is
required for normal work, and that the upstream scheduler parses repository-
specific planning levels. Neither is true. The retained upstream workflow uses
Issue state, a deliberate label, one-worker configuration, and its own
configuration/prompt; it does not run a custom validator or Terra/Astra router.

## Plan of Work

Add a compact “planning evidence by work size” section to the workflow guide:
small Issue-only work, material short spec, and risky/multi-session spec plus
ExecPlan. Each level will show a representative existing task/example and exact
evidence expectation. Link the Issue template, `docs/specs/`, `.agent/PLANS.md`,
and Definition of Done rather than creating duplicate templates.

Update Definition of Ready to require clear outcome, non-goals, acceptance,
code packets, dependencies, and exact verification for deliberate upstream
dispatch, while stating that the chosen planning artifact follows the work-size
guidance and is not a queue-enforced SDD tier. Remove the old template checkbox
and replace it with a neutral prompt to link a spec/ExecPlan when applicable.

Run link/canonical checks and manually apply each row: a one-file maintenance
Issue needs only its Issue; the actual #13 targeting change is a material
documentation/configuration example needing a concise spec/plan; #41's runtime
retirement is a risky multi-session example needing its living ExecPlan. The
walkthrough is documentation evidence only and does not alter any Issue label.

## Concrete Steps

From `/home/chris/template`:

    .venv/bin/python scripts/check_markdown_links.py
    .venv/bin/python scripts/verify.py
    rg -n -i 'SDD|Terra|Astra|required specification artifact' .github docs .agent WORKFLOW.md

Expected result: no active custom SDD eligibility requirement or Terra/Astra
route. The check may retain historical records under `docs/specs/`,
`docs/retrospectives/`, or evidence; those must be clearly historical rather
than active process instructions.

Actual evidence (2026-10-04):

    .venv/bin/python scripts/check_markdown_links.py
    # Markdown links: passed
    .venv/bin/python scripts/verify.py
    # Ruff lint/format, 36 tests, and Markdown links passed

The active-policy audit found no SDD requirement, custom artifact validator,
or runtime Terra/Astra routing. Search results mentioning those terms are the
new explicit non-goal sentence or historical plans/evidence, not active runtime
instructions.

## Validation and Acceptance

| Requirement | Evidence | Expected result |
| --- | --- | --- |
| Small work stays lightweight | Workflow guide example and Issue template | Issue outcome, code packet, and exact verification; no separate spec |
| Material work is concise | Guide example and `docs/specs/` link | Short outcome/non-goals/constraints/scenarios/verification artifact |
| Risky work is durable | Guide example and `.agent/PLANS.md` link | Spec plus living ExecPlan according to risk test |
| Upstream alignment | Definition of Ready and text audit | No custom queue validator, model routing, Terra/Astra, or required framework |
| Documentation quality | Link check and canonical verifier | All checks pass |

## Idempotence and Recovery

This is documentation-only. Reapplying the policy text makes no scheduler or
GitHub state change. Git revert restores prior wording. Do not change Issue
labels or simulate a dispatch to verify documentation.

## Artifacts and Notes

Durable evidence will be this plan and the open #16 Issue comment. Historical
SDD references are retained only where they document superseded work; active
guidance owns current operator behavior.

## Interfaces and Dependencies

- Issue template: links optional planning artifacts rather than asserting a
  mandatory named tier.
- Definition of Ready: clear Issue evidence remains the deliberate upstream
  admission standard; planning-level selection is documented guidance.
- ExecPlan: `.agent/PLANS.md` remains the existing risky/multi-session
  contract; no new spec framework, CLI, validator, or scheduler component is
  added.
