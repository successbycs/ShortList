# Create a safe isolated Git worktree lifecycle for Symphony tasks

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #25](https://github.com/successbycs/template/issues/25)

## Purpose / Big Picture

Issue #25 replaces the current directory-only workspace manager with a Git worktree lifecycle. A host-side Symphony worker will receive one branch and checkout per Issue under a root outside the shared repository. The worktree can be inspected with Git, the runner uses that checkout as its current directory, and cleanup cannot delete the shared checkout or a path outside the configured root.

## Progress

- [x] (2026-10-01 05:30Z) Re-read closed dependency #8, verified the GitHub target, promoted and claimed #25, and inspected current workspace, scheduler, runner, tests, configuration, and runbook.
- [x] (2026-10-01 05:30Z) Identified that `WorkspaceManager.prepare()` creates ordinary directories, while the configured root is inside the shared checkout; neither meets #25.
- [ ] Implement a validated external worktree root, deterministic per-Issue branch naming, creation/recovery, and contained removal.
- [ ] Add focused lifecycle and runner-cwd tests plus a disposable-repository demonstration, update the operator runbook, run canonical verification, and hand #25 to human review.

## Surprises & Discoveries

- Observation: The current workspace manager calls `mkdir()` and `shutil.rmtree()`; it never invokes Git worktree commands.
  Evidence: `src/app_template/symphony/workspaces.py`, inspected 2026-10-01.
- Observation: `WORKFLOW.md` currently locates workspaces under `var/symphony/workspaces` inside the source checkout.
  Evidence: `WORKFLOW.md` workspace configuration, inspected 2026-10-01.

## Decision Log

- Decision: Resolve the configured workspace root outside the shared checkout and pass the source repository root explicitly from `Workflow.path.parent` through `Scheduler` to `WorkspaceManager`.
  Rationale: A nested directory can be deleted safely only with fragile containment logic; a sibling root gives a clear boundary and prevents accidental modifications to the source checkout.
  Date/Author: 2026-10-01 / Codex
- Decision: Use `git worktree add` with an Issue-derived branch name and validate existing worktrees through `git -C <workspace> rev-parse --show-toplevel` before reuse or removal.
  Rationale: Git, rather than pathname assumptions, proves checkout identity. Reuse permits recovery after an interrupted worker while validation blocks path substitution.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

Pending implementation and verification.

## Context and Orientation

`src/app_template/symphony/workspaces.py` owns per-Issue directories and hook execution. `src/app_template/symphony/scheduler.py` calls `prepare()` before every runner attempt and passes the returned path to `runner.run()`. `src/app_template/symphony/runner.py` already passes that path both to the child process `cwd` and the app-server thread/turn requests. `src/app_template/symphony/workflow.py` validates the workspace settings. `WORKFLOW.md` is the checked-in disabled-dispatch configuration. The only supported execution surface remains the host broker from #8; no task dispatch is enabled by this change.

A worktree is a Git-managed additional checkout connected to the source repository. This plan uses one deterministic branch and worktree per Issue. The worktree root is a configured directory outside the shared repository. A workspace is valid only if it is a direct child of that root, is a Git worktree whose top level equals the path, and belongs to the configured source repository. Hooks remain scoped to the validated worktree.

## Plan of Work

### Milestone 1: define and validate the Git boundary

In `workflow.py`, retain the typed workspace hooks and add only settings necessary to safely choose the external root and deterministic branch prefix. Change the checked-in `WORKFLOW.md` root and `docs/operations/LOCAL_RUNBOOK.md` so an operator can locate, inspect, and manually prune Git worktrees without touching the shared checkout. Reject a root equal to, within, or containing the source checkout when the manager is constructed.

Observable result: an invalid nested or shared root is rejected before Git or removal commands run.

### Milestone 2: create, reuse, and remove real worktrees

Replace `mkdir()` preparation in `workspaces.py` with validated Git commands. `prepare(issue)` will ensure the root exists, derive a collision-resistant direct-child path and branch, create a branch at `HEAD` on first use, reuse an existing valid worktree for recovery, then run the existing hooks. `remove(workspace)` will validate source-repository membership and direct-child containment, run its hook, remove the worktree with Git, and prune stale Git metadata. It will never recursively delete arbitrary paths or delete a branch.

Observable result: `git -C <workspace> rev-parse --show-toplevel` proves the workspace and the runner receives exactly that path.

### Milestone 3: prove recovery and containment

Expand `test_workspaces.py` using a disposable initialized Git repository. Cover creation, expected branch, reuse after manager reconstruction, removal, invalid root, foreign repository rejection, and no deletion of the shared checkout. Update the scheduler or runner-focused test only as necessary to prove the returned real worktree remains the runner cwd. Add a local disposable-repository demonstration command that creates then removes a worktree without using GitHub or Codex.

Observable result: all tests use local Git only and cleanup is repeatable.

## Concrete Steps

From `/home/chris/template`, first run focused tests through the Dev Container: `docker compose run --rm app uv run pytest tests/unit/symphony/test_workspaces.py tests/unit/symphony/test_runner.py -q`. After implementation, run the disposable-local-Git demonstration from a temporary directory and capture only branch/path/status evidence. Then run `docker compose run --rm app uv run python scripts/verify.py`. Expected: all focused tests and the canonical verifier pass; no GitHub write, Codex turn, or live dispatch occurs.

## Validation and Acceptance

Acceptance requires a local Git worktree and branch per Issue under a validated external root; runner cwd equality to that checkout; deterministic recovery of an existing valid worktree; and cleanup that rejects shared, foreign, nested, or uncontained paths. The tests must prove the source checkout remains after removal. The disposable demonstration must prove `git worktree list` shows the new checkout before removal and does not show it afterward. Canonical verification must pass. A local commit is made only if the pre-existing untracked Symphony work can be separated safely.

## Idempotence and Recovery

Preparing a valid existing worktree is safe and reruns hooks. If a worker stops, the operator can inspect it with `git worktree list`; a later prepare validates and reuses it. Removal is restricted to a direct child of the configured external root and uses Git first; an invalid or foreign path fails closed without filesystem removal. This issue does not delete branches, clear the root, modify the shared checkout, or perform force Git operations. Manual recovery is to inspect the named worktree and remove it with Git only after the task is no longer running.

## Artifacts and Notes

- Dependency evidence: GitHub #8 is closed; its closure unlocked #25 on 2026-10-01.
- Existing runbook and config must be revised because the current root is inside the shared checkout.

## Interfaces and Dependencies

`WorkspaceManager(settings: WorkspaceSettings, repository_root: Path)` will own Git command execution. It will expose `path_for(issue) -> Path`, `branch_for(issue) -> str`, `prepare(issue) -> Path`, `complete(workspace) -> None`, and `remove(workspace) -> None`. `Scheduler` will construct it from `workflow.config.workspace` and `workflow.path.parent`. The runner interface remains unchanged and receives the validated path. Only local `git` is required; no new Python dependency or external service is introduced.
