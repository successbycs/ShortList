# Define conditional real-world proof policy

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #31](https://github.com/successbycs/template/issues/31)

## Purpose / Big Picture

This work makes evidence claims proportionate to what was actually observed. After it is complete, a task that claims a runnable, persistent, user-visible, deployed, or external capability must identify and exercise that capability's real operational boundary when that boundary is available and authorized. A task that cannot reach the boundary remains explicitly blocked or unobserved; it cannot use a mock, import, or source inspection as a substitute. Documentation-only, refactor-only, deferred, and deliberately disabled work remain eligible for their relevant non-operational evidence.

## Progress

- [x] (2026-10-01 05:35Z) Inspected the completion, quality, Issue-workflow, evidence-matrix, integration, and planning documents; created and claimed Issue #31.
- [x] (2026-10-01 05:40Z) Added the canonical conditional proof rule and aligned completion, testing, Issue-workflow, evidence-matrix, and planning documents without changing AGENTS or deferred integration architecture.
- [x] (2026-10-01 05:40Z) Verified wording, Markdown links, Ruff lint/format, and canonical tests; awaiting GitHub human-review transition.

## Surprises & Discoveries

- Observation: The Verification Matrix currently permits `passed` for an inspected artifact or a passed command without distinguishing an inspection requirement from an operational requirement.
  Evidence: `docs/quality/VERIFICATION_MATRIX.md`, inspected 2026-10-01.
- Observation: The Test Strategy permits synthetic data and disposable resources but does not say that a disposable environment can still exercise a real boundary.
  Evidence: `docs/quality/TEST_STRATEGY.md`, inspected 2026-10-01.

## Decision Log

- Decision: Put the normative rule in Definition of Done and use the other documents only to apply it in their own contexts.
  Rationale: Completion policy has one authoritative owner while test, planning, issue, and evidence documents retain their existing responsibilities.
  Date/Author: 2026-10-01 / Codex
- Decision: Require a real-world proof only for an operational claim whose boundary and authority are available.
  Rationale: Requiring live effects for documentation, deferred features, or unapproved external integrations would be misleading and unsafe.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

The repository now distinguishes real operational acceptance proof from supporting synthetic evidence without requiring unsafe or irrelevant external activity. Definition of Done is the normative source. Test Strategy, Issue Workflow, Verification Matrix, and ExecPlan contract apply that rule in their existing domains. `AGENTS.md` remains a link to the canonical source and deferred integration architecture remains unchanged.

## Context and Orientation

`docs/harness/DEFINITION_OF_DONE.md` governs completion and durable evidence. `docs/quality/TEST_STRATEGY.md` defines the purpose of test layers. `docs/harness/GITHUB_ISSUE_WORKFLOW.md` defines what a concrete Issue contains and when it moves to human review. `docs/quality/VERIFICATION_MATRIX.md` records requirement evidence and status meanings. `.agent/PLANS.md` defines how material work describes validation. `AGENTS.md` already directs coding agents to Definition of Done, so it needs no duplicate policy. `docs/architecture/INTEGRATIONS.md` is deferred and should remain scoped to external integrations.

A real operational boundary is the actual interface being claimed: for example, a running HTTP endpoint reached through HTTP, a CLI process run by an operator, a database reopened after persistence, a running container, or an explicitly approved external provider request. A mock, fake, import, screenshot, or source inspection can prove logic, safety, or design, but cannot prove the operational boundary itself.

## Plan of Work

First add a concise conditional evidence rule to `docs/harness/DEFINITION_OF_DONE.md`, including the distinction between a real boundary, supporting synthetic evidence, and a blocked/unobserved boundary. Then refine `docs/quality/TEST_STRATEGY.md` so synthetic data is compatible with a real integration or operational proof, not a replacement for it.

Next add small enforcement clauses where work is defined and reviewed: relevant GitHub Issues must declare their proof or exact blocker, material ExecPlans must name their claimed boundary and evidence outcome, and the Verification Matrix must not call an operational claim passed on static/non-boundary evidence alone. Link to the Definition of Done rather than repeating its full policy. Do not change AGENTS or external-integration architecture policy unless the final diff shows a missing reference.

## Concrete Steps

From `/home/chris/template`:

1. Ran `.venv/bin/ruff format --check .` and `git diff --check` after documentation edits.
   Result: 31 files formatted; no whitespace errors.
2. Ran `.venv/bin/python scripts/check_markdown_links.py`.
   Result: `Markdown links: passed`.
3. Ran `.venv/bin/python scripts/verify.py`.
   Result: Ruff lint/format passed; `55 passed in 3.05s`; Markdown links passed.
4. Reviewed the final diff against Issue #31.
   Result: one normative rule with contextual enforcement; no runtime code changed.

## Validation and Acceptance

The policy is accepted when a reader can determine: whether a task claims an operational capability; what counts as a real proof; that mock/synthetic tests are supporting rather than substituting evidence; when a criterion is blocked or unobserved; and that no external action is newly authorized. Documentation-only, refactor-only, deferred, or disabled work must remain exempt from invented operational tests. The required link, formatting, and canonical verification commands must pass.

## Idempotence and Recovery

The edits are documentation-only and safe to repeat. If wording creates an unintended obligation or conflicts with authority controls, revert only the affected documentation hunk before handoff; no runtime state, external service, credential, or Issue status is changed by the policy itself.

## Artifacts and Notes

Verification evidence: `.venv/bin/python scripts/check_markdown_links.py` reported `Markdown links: passed`; `.venv/bin/python scripts/verify.py` reported Ruff lint/format passing, `55 passed in 3.05s`, and Markdown links passing. The GitHub Issue is the durable task-status record; this plan stores technical rationale and validation evidence.

## Interfaces and Dependencies

This changes no code interface, package, configuration, or external integration. It changes these documentation interfaces: Definition of Done defines the completion rule; Test Strategy names the evidence layers; GitHub Issue Workflow requires proof/blocker declaration for relevant work; Verification Matrix constrains `passed`; and ExecPlans require operational-boundary evidence for material work that claims such capability.
