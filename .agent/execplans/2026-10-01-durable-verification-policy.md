# Establish durable verification and ExecPlan risk criteria

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Make completion claims auditable after a chat session ends. Terminal output and
chat updates will be treated as transient evidence, while each implemented task
records its proof in the appropriate durable artifact. Give Codex a clear,
repeatable risk test for deciding when an ExecPlan is mandatory.

## Progress

- [x] (2026-10-01) Identified the existing canonical completion, Issue-workflow,
  and ExecPlan documents; no new policy document is needed.
- [x] (2026-10-01) Added the durable-evidence rule and mandatory ExecPlan risk
  criteria across the canonical completion, Issue-workflow, and plan documents.
- [x] (2026-10-01) Added RQ-063 and RQ-064 to the template specification and
  recorded their durable evidence in the Verification Matrix.

## Surprises & Discoveries

- Observation: existing guidance requires evidence but does not explicitly
  distinguish transient terminal output from durable completion proof.
  Evidence: review of `AGENTS.md`, `docs/harness/DEFINITION_OF_DONE.md`, and
  `.agent/PLANS.md`.

## Decision Log

- Decision: Keep `docs/harness/DEFINITION_OF_DONE.md` as the canonical policy.
  Rationale: it applies to all tracked implementation tasks without adding a
  competing policy document.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

The policy now has one canonical source, with concise routing in `AGENTS.md`.
Agents must record durable verification before reporting progress, and use an
explicit risk test rather than intuition when deciding whether planning is
mandatory.

## Context and Orientation

`AGENTS.md` is always loaded, so it must contain only a concise routing rule.
`docs/harness/DEFINITION_OF_DONE.md` defines durable task completion,
`docs/harness/GITHUB_ISSUE_WORKFLOW.md` defines Issue handoff, and
`.agent/PLANS.md` governs material work. The risk criteria must be concrete
enough to avoid both missing dangerous work and requiring plans for typo fixes.

## Plan of Work

Add a concise pointer to `AGENTS.md`. Extend Definition of Done with the
durable-evidence hierarchy. Extend the Issue workflow with the same handoff
requirement. Add a mandatory ExecPlan risk checklist to PLANS. Update this plan
with validation evidence.

## Concrete Steps

Run from `/home/chris/template`:

    docker compose run --rm app uv run python scripts/check_markdown_links.py
    git diff --check

## Validation and Acceptance

The policy must name the durable artifact for small, material, risky, and
requirement-level work. The risk criteria must state that any listed condition
mandates an ExecPlan and that uncertainty resolves toward planning. Markdown
links and whitespace checks must pass.

## Idempotence and Recovery

Documentation changes are repeatable. Revert only the files in this plan if
the policy conflicts with a later approved governance decision.

## Artifacts and Notes

Policy edits are in `AGENTS.md`, `docs/harness/DEFINITION_OF_DONE.md`,
`docs/harness/GITHUB_ISSUE_WORKFLOW.md`, and `.agent/PLANS.md`.
The template requirements are RQ-063 and RQ-064 in
`docs/TEMPLATE_SPECIFICATION.md`, with evidence in the Verification Matrix.
On 2026-10-01, `docker compose run --rm app uv run python
scripts/check_markdown_links.py` reported `Markdown links: passed`; `git diff
--check` produced no output.

## Interfaces and Dependencies

No runtime interface changes. The policy affects agent task selection,
verification recording, and GitHub Issue handoff.
