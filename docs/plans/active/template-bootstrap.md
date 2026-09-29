# Template Bootstrap Historical Record

**Status:** historical baseline (not a task queue)
**Owner:** template maintainer
**Update when:** correcting historical evidence only. New work belongs in a
GitHub Issue and, when material, an ExecPlan under `.agent/execplans/`.

This record captures the original template-bootstrap effort that produced local
commit `b38df7dd0308f015077780457cfad545d52f3e7f` on 2026-09-29. It is not a
source of current task status and must not compete with GitHub Issues.

## Historical outcome

The baseline implemented the Python package, configuration loader, structured
logging, SQLite synthetic audit store, deterministic no-op demo, Docker Compose
and Dev Container definitions, documentation catalogue, optional-pack guidance,
bounded bootstrap script, project skill, and GitHub Actions workflow. Docker
Desktop and Compose were subsequently available in WSL; local image build,
locked install, lint, tests, link checks, health, self-test, demo, and an
isolated clean-start check were reported as passing.

The original record was inaccurate in two ways: it still described Docker as
unavailable and it left implemented milestones marked pending. This document
does not retroactively convert file presence into verification evidence. Current
coverage and observed checks are maintained only in
[VERIFICATION_MATRIX.md](../../quality/VERIFICATION_MATRIX.md).

## Historical limitations retained

- Interactive VS Code **Dev Containers: Reopen in Container** was not observed.
- A remote GitHub Actions run was not observed because the local commit was not
  pushed.
- No cloud deployment, container publication, runtime AI agent, or optional
  pack was enabled.

For the currently authorised Issue workflow, see
[GITHUB_ISSUE_WORKFLOW.md](../../harness/GITHUB_ISSUE_WORKFLOW.md).
