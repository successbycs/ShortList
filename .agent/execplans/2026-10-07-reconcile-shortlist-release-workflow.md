# Reconcile the ShortList release and decision workflow

This ExecPlan is a living document and must be maintained under
`.agent/PLANS.md`.

## Purpose / Big Picture

Make the repository's delivery governance clear for ShortList contributors.
After this work, a contributor can distinguish local implementation and CI
verification from a human-authorized deployment, record a material customer
journey decision durably, and know the proof required before a customer-facing
delivery claim is made. The outcome is documentation only: it changes no
runtime, provider, deployment, credentials, Issue, or external resource.

## Progress

- [x] (2026-10-07) Inspected the operating model, Issue workflow, development
  workflow, Definition of Done, current release/CI guidance, delivery plan,
  and working-tree state.
- [x] (2026-10-07) Reconciled the release workflow and CI/CD strategy without
  granting deployment or provider authority.
- [x] (2026-10-07) Validated scoped whitespace and direct local links; recorded
  the repository-wide Markdown-checker limitation below.
- [x] (2026-10-07) Added bidirectional traceability between the request-flow
  customer journey and the release workflow.
- [x] (2026-10-07) Added bidirectional traceability between the website
  experience, request-flow/SDD journey diagrams, and architecture/data
  boundary documents.
- [x] (2026-10-07) Established the architecture map as the ShortList-specific
  solution-architecture dossier, with known system functions/status and links
  to the journey, experience, data, safety, delivery, and release documents.

## Surprises & Discoveries

- Observation: `docs/workflows/RELEASE_WORKFLOW.md` labels release deployment
  deferred, while the active ShortList delivery plan and existing worktree
  describe a manually authorized Cloudflare deployment path.
  Evidence: `docs/workflows/RELEASE_WORKFLOW.md` and
  `docs/product/DELIVERY_PLAN.md` read on 2026-10-07.
- Observation: CI is intentionally verification-only and must not be described
  as deployment automation.
  Evidence: `docs/operations/CI_CD_STRATEGY.md` says CI calls
  `scripts/verify.py` and does not deploy.
- Observation: `scripts/check_markdown_links.py` has no file-scope option and
  traverses generated `var/symphony-upstream` workspaces and `node_modules`.
  It therefore fails on pre-existing third-party and generated Markdown links,
  including placeholder tokens, rather than the two edited documents.
  Evidence: the 2026-10-07 invocation reported unrelated paths under
  `var/symphony-upstream/workspaces/GH-10/` and `apps/web/node_modules/`.

## Decision Log

- Decision: Keep CI verification-only; define deployment and provider delivery
  as separate, explicitly human-authorized release steps.
  Rationale: This aligns the release guidance with the repository authority
  boundary and avoids implying that merge, CI success, or an ExecPlan can
  deploy or send customer reports.
  Date/Author: 2026-10-07 / Chris direction implemented by Codex
- Decision: Material customer-facing decisions belong in the applicable
  canonical document and the owning GitHub Issue when one is identified; an
  unassigned decision cannot authorize external implementation or release.
  Rationale: The GitHub Issue workflow requires a durable review trail without
  treating chat context as approval for external action.
  Date/Author: 2026-10-07 / Codex interpretation of repository workflow

## Outcomes & Retrospective

The repository now has one explicit release sequence for ShortList: durable
scope and decision record, local verification, human review, explicit release
authority, target verification, narrow deployment, real-boundary proof, and
recovery evidence. CI remains source verification only. The documentation does
not enable deployment or email/PDF delivery, and it does not make a GitHub
write for the earlier customer-journey decision because no owning Issue was
identified. The customer journey in `docs/product/REQUEST_FLOW.md` now points
to this release sequence, and the release workflow points back to the request
flow and website-experience controls. The website-experience brief now points
to the request-flow, SDD, architecture and data/contract diagrams, while the
architecture map points back to those experience documents. The architecture
map now distinguishes the ShortList-specific solution dossier from reusable
template policy documents and records each known system function and its design
or implementation boundary.

## Context and Orientation

`AGENTS.md` makes the repository's guidance binding for local work. The active
`docs/harness/CODEX_OPERATING_MODEL.md` requires an agent to establish scope
and the execution target before acting. `docs/harness/DEFINITION_OF_DONE.md`
requires real-boundary proof for a claimed runnable, deployed, persistent, or
external capability; it treats unavailable proof as blocked or unobserved.

`docs/harness/GITHUB_ISSUE_WORKFLOW.md` describes the durable decision record:
the canonical document holds detail and the owning Issue records a concise
decision or evidence comment. `docs/workflows/DEVELOPMENT_WORKFLOW.md` defines
the normal implementation progression from Issue and plan through verification
and human review.

The two files changed by this plan are currently clean in the worktree:
`docs/workflows/RELEASE_WORKFLOW.md` and
`docs/operations/CI_CD_STRATEGY.md`. Other product and Issue documents have
pre-existing edits and are deliberately out of scope.

## Plan of Work

### Milestone 1 — Define the release boundary

Update `docs/workflows/RELEASE_WORKFLOW.md` from a deferred-template statement
to an active ShortList release workflow. State the ordered gates: an approved
scope and durable decision record; implementation and local verification;
human review; separately authorized deployment to a verified target; and
post-deployment real-boundary proof with rollback or a recorded blocker. State
that CI, merge, a local commit, or a plan does not itself deploy.

The workflow will include the separate customer-report-delivery boundary: no
customer-facing copy may claim a report was sent until the approved provider
acceptance boundary is observed. The document will direct contributors to the
Definition of Done and the delivery plan rather than inventing a provider.

Observable result: a reader knows exactly which action needs human authority
and what evidence distinguishes deployed software from an unproven release.

### Milestone 2 — Align CI/CD terminology

Update `docs/operations/CI_CD_STRATEGY.md` to label CI as active source
verification and CD as deliberately manual/authorization-gated. Link to the
release workflow for the deployment sequence. Do not add pipeline automation,
configuration, secrets, or a release command.

Observable result: the CI/CD document no longer makes a blanket deferred-CD
statement that conflicts with the repository's manually authorized deployment
practice.

### Milestone 3 — Validate and document the result

Run the Markdown-link checker and `git diff --check` for the two changed files.
Inspect the scoped diff for accidental authority expansion, implementation
claims, or provider-specific statements. Update this plan's Progress, Outcomes
and Artifacts sections with actual output.

## Concrete Steps

Run all commands from `/home/chris/ShortList`.

1. Inspect target documentation and the working-tree state:

   ```bash
   git status --short -- docs/workflows/RELEASE_WORKFLOW.md docs/operations/CI_CD_STRATEGY.md
   sed -n '1,260p' docs/workflows/RELEASE_WORKFLOW.md
   sed -n '1,260p' docs/operations/CI_CD_STRATEGY.md
   ```

   Expected: the targets are clean before this plan's changes; release is
   labelled deferred and CI is verification-only.

2. Edit only the two target documentation files using `apply_patch`.

3. Validate the result:

   ```bash
   python3 scripts/check_markdown_links.py docs/workflows/RELEASE_WORKFLOW.md docs/operations/CI_CD_STRATEGY.md
   git diff --check -- docs/workflows/RELEASE_WORKFLOW.md docs/operations/CI_CD_STRATEGY.md
   git diff -- docs/workflows/RELEASE_WORKFLOW.md docs/operations/CI_CD_STRATEGY.md
   ```

   Expected: link and whitespace checks pass; the diff contains only
   documentation that preserves explicit human authority for external actions.

## Validation and Acceptance

- The release workflow names planning, verification, human review,
  authorization, target verification, deployment proof, and recovery as
  distinct steps.
- It states that a plan, CI, merge, or local commit is not deployment authority.
- It differentiates provider acceptance from inbox receipt and does not claim
  that an email/PDF service is already live.
- The CI/CD strategy accurately calls CI active and deployment manual/
  authorization-gated.
- Markdown links and whitespace checks pass for both changed documents.
- No external target, credential, Issue, provider, deployment, or code is
  changed.

## Idempotence and Recovery

These are additive Markdown edits and validation commands; they are safe to
repeat. If review rejects a wording change, restore only the affected paragraph
with a follow-up patch. No external state is created or changed. The remaining
manual action is to add a concise decision comment to the owning GitHub Issue
when Chris identifies it and authorizes that write.

## Artifacts and Notes

- 2026-10-07 baseline: `docs/workflows/RELEASE_WORKFLOW.md` was a deferred
  template; `docs/operations/CI_CD_STRATEGY.md` stated CI does not deploy.
- 2026-10-07: `git diff --check` passed for the two workflow documents and
  this ExecPlan after removal of Markdown hard-break whitespace.
- 2026-10-07: direct local-link targets in both changed documents were checked
  as regular files. The repository-wide link script remains unscoped and
  currently fails on pre-existing generated/third-party content; this task did
  not change that checker or those generated workspaces.
- 2026-10-07: `docs/product/REQUEST_FLOW.md` links to the release workflow;
  `docs/workflows/RELEASE_WORKFLOW.md` links to the request flow and website
  experience. This establishes bidirectional journey-to-release traceability.
- 2026-10-07: `docs/product/design/WEBSITE_EXPERIENCE.md` links to the request
  flow, SDD, architecture map, data model, and contracts; the architecture map
  links back to the website experience, request flow, SDD, data model, and
  contracts. This establishes explicit experience-to-architecture traceability.
- 2026-10-07: `docs/architecture/ARCHITECTURE.md` is the solution-architecture
  entry point. It links product intent, user experience, request flow, SDD,
  architecture decision, data/contract, safety, delivery, and release sources,
  and records the role/status of every known system function.

## Interfaces and Dependencies

No code interface, dependency, configuration, library, or external service
changes. The documentation depends on the authority model in
`docs/harness/AUTHORITY_AND_GUARDRAILS.md`, the issue-record rules in
`docs/harness/GITHUB_ISSUE_WORKFLOW.md`, and the proof standard in
`docs/harness/DEFINITION_OF_DONE.md`.
