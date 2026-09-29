# Proposed GitHub Issue Queue

**Status:** local proposal only | **Owner:** template maintainer | **Update:** GitHub authentication or local findings change.

This is not a second task queue. GitHub Issues become canonical only after the
configured repository is successfully read and these proposals are created or
matched to existing Issues. At review time, `gh auth status` reported an invalid
active token, so no remote Issue, label, or comment was read or written.

## Required labels

Create or reuse these labels only after inspecting the configured repository:

| Label | Meaning |
| --- | --- |
| `status:ready` | Eligible for one user-started session. |
| `status:in-progress` | Being worked by one active session. |
| `status:blocked` | Cannot proceed; evidence and next action are recorded. |
| `status:human-review` | Acceptance checks complete; remains open for a person. |

## Proposed tracking Issue

**Title:** Template review and readiness tracking

**Purpose and scope:** Track the reviewed generic Python template and the
remaining environment-dependent checks. It covers no product implementation,
deployment, trading logic, or unattended automation.

**Requirements:** RQ-001–RQ-003, RQ-010–RQ-015, RQ-020–RQ-062.

**Completed baseline:** Local commit `b38df7d` created the initial template.
The subsequent local review adds a canonical verifier, configurable GitHub
target during bootstrap, CI image/format checks, and session-driven Issue
workflow guidance. Local-only commits cannot be reviewed by GitHub until a
person pushes them.

**Linked task proposals:** the three tasks below. The tracking Issue has no
authority to push, close, merge, deploy, change repository settings, or start a
background process.

## Proposed task: activate and demonstrate the live Issue workflow

**Requirements:** RQ-013, RQ-015, RQ-023, RQ-054.

**Acceptance criteria:** The configured remote is verified as the project
target; existing Issues and labels are inspected for duplicates; the four status
labels exist; the tracking Issue and only necessary concrete tasks exist; one
genuine task is moved ready → in-progress → human-review with a concise
evidence comment; unrelated labels are preserved.

**Dependencies:** Valid GitHub CLI authentication with repository Issues write
permission.

**Plans/documents:** `.agent/execplans/2026-09-29-issue-workflow-review.md`,
`docs/harness/GITHUB_ISSUE_WORKFLOW.md`, `docs/harness/ISSUE_STATE_MODEL.md`.

**Expected verification:** `gh auth status`, explicit read of the configured
repository, Issue and label listing, then visible Issue states/comments.

**Exclusions and authority:** No push, merge, closure, assignment, mention,
repository-settings change, unattended runner, or agent spawning. It is blocked
until the user re-authenticates locally.

## Proposed task: verify VS Code Dev Container attachment

**Requirements:** RQ-010–RQ-013.

**Acceptance criteria:** In VS Code on the T16, **Dev Containers: Reopen in
Container** attaches to `app`; the integrated terminal reports a non-root user;
the locked install and `uv run python scripts/verify.py` pass.

**Dependencies:** Docker Desktop running with WSL integration and a person at
the VS Code desktop.

**Plans/documents:** `GETTING_STARTED.md`, `.devcontainer/devcontainer.json`,
`docs/operations/LOCAL_RUNBOOK.md`.

**Expected verification:** Attach screenshot or terminal output; `id -u`; the
canonical verification command.

**Exclusions and authority:** No VS Code extension marketplace changes, Docker
socket mounts, privileged containers, or host dependency installation.

## Proposed task: observe remote CI for the reviewed template

**Requirements:** RQ-021, RQ-050, RQ-058, RQ-062.

**Acceptance criteria:** A human-approved push makes the GitHub Actions CI run
for the reviewed commit; the build-image, locked install, canonical verifier,
and Markdown checks all pass; the run URL and commit are recorded.

**Dependencies:** Review and an authorized push of the local commits.

**Plans/documents:** `.github/workflows/ci.yml`, `scripts/verify.py`,
`docs/operations/CI_CD_STRATEGY.md`.

**Expected verification:** Observed GitHub Actions result, not merely workflow
file inspection.

**Exclusions and authority:** No deployment, publication, branch-protection
change, retry flood, or merge.
