# Remove session label gates

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

User-directed GitHub work must proceed from the user's request, actual dependencies and acceptance evidence without a prerequisite label or mandatory label transitions.

## Progress

- [x] (2026-10-02) Inspected a clean working tree and located session gates and separate Symphony runtime checks.
- [x] (2026-10-02) Removed session label policy and its supporting state/seed documents; repaired specification, index, template, restart and development-workflow references.
- [x] (2026-10-02) Markdown link checker and `git diff --check` passed. Targeted search of session entry points found no status-label requirements. No application code or remote metadata changed.
- [x] (2026-10-02) Final audit confirmed remaining readiness labels in Definition of Ready are explicitly limited to the separate Symphony runtime. Repeated Markdown link and whitespace checks passed; prepared a dedicated rollback commit, excluding browser scratch output.

## Surprises & Discoveries

The disabled Symphony scheduler independently uses labels for admission. Evidence: `src/app_template/symphony/scheduler.py` and `WORKFLOW.md`. Removing those checks would broaden automation, beyond removing the conversational workflow causing this incident.

## Decision Log

- Decision: Remove the user-started session label mechanism while preserving disabled runtime admission checks and existing remote metadata.
  Rationale: The requested rollback addresses the repeated label gate in this conversation; it does not authorize admitting all open issues to automated execution.
  Date/Author: 2026-10-02 / Codex

## Outcomes & Retrospective

Session selection now follows the user's request, real prerequisites and acceptance evidence. The label-state and seed documents were deleted; they remain recoverable in Git. Markdown links and whitespace checks passed on 2026-10-02. Symphony runtime gates and historical evidence remain intact, explicitly separate from coding sessions. The rollback is isolated in a local commit; no push or remote label changes are part of this work.

## Context and Orientation

`AGENTS.md`, `.codex/skills/github-issue-session/SKILL.md`, and `docs/harness/GITHUB_ISSUE_WORKFLOW.md` prescribe the session gate. `docs/harness/ISSUE_STATE_MODEL.md` and `docs/harness/ISSUE_QUEUE_PROPOSAL.md` support it. Documentation indexes, specification, feature template and restart instructions reference the same mechanism.

## Plan of Work

Replace session instructions with user-requested task selection, actual dependency assessment, and evidence comments. Delete the label state model and seed record. Repair document references and remove label requirements in session-facing templates. Preserve historical execution evidence and distinguish Symphony-only rules.

## Concrete Steps

From `/home/chris/template`, edit using apply_patch; run `.venv/bin/python scripts/check_markdown_links.py`, `git diff --check`, and review `git diff --stat` plus remaining label references.

## Validation and Acceptance

Session entry points must no longer require labels or mutate them. Links must resolve and whitespace checks pass. No executable code changes; runtime tests are unnecessary. Real external operations are not claimed by this policy change.

## Idempotence and Recovery

Edits are reversible through Git history. Deleted documents remain recoverable there. Preserve issues and their comments; no remote label deletion is performed.

## Artifacts and Notes

The prior readiness-label rule caused repeated empty-queue responses despite remaining work. The new rule uses acceptance evidence and real prerequisites.

## Interfaces and Dependencies

Only coding-agent policy and documentation change. Symphony runtime configuration and public APIs remain unchanged.
