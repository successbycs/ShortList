# Move Symphony execution to a host-side broker

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #8](https://github.com/successbycs/template/issues/8)

## Purpose / Big Picture

Issue #8 will make the host, rather than the Dev Container dashboard process, own authenticated `codex` and `gh` execution. The container remains an unprivileged, loopback-only dashboard/event surface. A user can run a host preflight and host broker without credentials entering child Codex environments; live dispatch remains disabled unless a later dedicated proof authorizes it.

## Progress

- [x] (2026-10-01 03:50Z) Re-read #8 after #22 closed; verified #6/#7 are closed; moved #8 from blocked to in-progress with a progress comment.
- [x] (2026-10-01 03:50Z) Inspected runner, service, CLI, workflow, focused tests, container configuration, and the approved #22 design.
- [x] (2026-10-01 04:35Z) Split host-broker and dashboard-only construction; Compose starts dashboard-only, while serve/preflight use explicit host adapters.
- [x] Add focused host-boundary, credential, protocol, and unavailable-prerequisite tests.
- [x] Run the host preflight/read-only app-server probe plus Dev Container canonical verification; record evidence and request human review.

## Surprises & Discoveries

- Observation: `SymphonyService.from_workflow()` constructs `GitHubTracker` and `CodexAppServerRunner` unconditionally, including when invoked by the `symphony` Compose service.
  Evidence: `src/app_template/symphony/service.py`; the Dev Container reports `codex: not found`.

## Decision Log

- Decision: A new host broker entry point owns tracker, runner, scheduler, GitHub writes, worktrees, and credentials; dashboard construction receives no production tracker or runner.
  Rationale: #22 approved this boundary. It preserves the non-root container security model and removes the false requirement to install authenticated Codex in the container.
  Date/Author: 2026-10-01 / #22-approved design

## Outcomes & Retrospective

Pending implementation and verification.

## Context and Orientation

`src/app_template/symphony/runner.py` invokes `codex app-server` using the assigned workspace and strips `GH_TOKEN`/`GITHUB_TOKEN`. `service.py` presently constructs that runner in `from_workflow`, and `cli.py` uses that method for both dashboard and serve commands. `compose.yaml` starts `symphony serve` inside the Dev Container, which cannot provide host Codex. `WORKFLOW.md` retains `live_dispatch: false`.

## Plan of Work

First, introduce explicit constructors/CLI entry points for a dashboard-only service and a host execution broker. The dashboard-only constructor must not create `GitHubTracker` or `CodexAppServerRunner`; it reads only local sanitized event evidence. The broker may construct those adapters only on the host after preflight. Second, replace directory-only task workspace preparation with a validated worktree-capable boundary or explicitly reject live execution until that capability is present. Third, extend runner/scheduler tests for host cwd, sanitized child environment, cancellation/approval, structured results, two task-local Terra failures followed by Astra diagnosis and Terra repair, and unavailable-host backoff. Fourth, prove host preflight and a bounded read-only app-server initialization; never send a billable task turn or enable dispatch.

## Concrete Steps

From `/home/chris/template`: run focused Symphony tests, `docker compose run --rm app uv run python scripts/verify.py`, host `app-template symphony preflight --require-dispatch` only after observing host prerequisites, and a bounded initialize-only app-server probe. Expected failures (missing host prerequisites) remain blocked evidence, not a reason to install credentials in the container.

## Validation and Acceptance

Acceptance requires: Terra normal/repair routing and two-failure Astra design/review behavior in fake tests; actual runner child cwd equals the assigned workspace; GitHub credentials absent from child environment; app-server protocol/cancellation/approval failures are bounded and structured; host preflight succeeds without exposing secrets; dashboard works without runner/credential access; and the canonical verifier passes. Live dispatch stays false and no Issue is automatically claimed.

## Idempotence and Recovery

Preflight, fake tests, and initialize-only probes are repeatable. The host broker fails closed when Codex/GitHub are unavailable; it records a sanitized blocked result and does not fall back to container execution. Worktree cleanup is scoped to the configured root and only occurs after the worker stops. Rollback is disabling/removing the broker entry point while retaining local event evidence.

## Artifacts and Notes

- #22 design: `.agent/execplans/2026-10-01-rebaseline-symphony-control-plane.md`.
- #8 previous blocker: container `codex` absence; superseded by the approved host-broker design, not by adding container credentials.

## Interfaces and Dependencies

Introduce a host-only broker factory/command and a dashboard-only factory/command in `service.py`/`cli.py`. `CodexAppServerRunner` remains responsible for its sanitized child environment and assigned workspace. `EventStore` is the container-readable boundary. No credential value is added to configuration, events, test fixtures, or logs.
- 2026-10-01 04:35Z: focused Dev Container checks passed: `ruff check src/app_template/symphony/service.py src/app_template/cli.py tests/unit/symphony/test_dashboard.py` and `pytest -q tests/unit/symphony/test_dashboard.py tests/unit/symphony/test_runner.py tests/unit/symphony/test_scheduler.py` (11 passed). A new dashboard-factory test passed (6 dashboard tests) and proves the dashboard constructor uses `ReadOnlyTracker`/`ReadOnlyRunner`, not production adapters.
- Remaining after #8: real Git worktree lifecycle (#25), fresh GitHub observations (#27), and full classification/resume coverage (#26); each remains a separately scoped packet.
- 2026-10-01 05:05Z: added host-factory and unavailable-prerequisite regression tests. Focused Dev Container checks (`ruff format --check`, `ruff check`, `pytest -q tests/unit/symphony/test_dashboard.py tests/unit/symphony/test_runner.py`) passed: 12 tests.
- 2026-10-01 05:10Z: canonical Dev Container verifier passed: Ruff lint/format, 39 tests, and Markdown-link validation. A rebuilt `symphony` Compose service returned loopback `/health` status `ok` with `live_dispatch: false`, then was stopped cleanly. The host-only preflight was run from an isolated temporary virtual environment: Codex and GitHub prerequisites were present, dispatch readiness was true, but workflow dispatch remained disabled. An initialize-only app-server probe also passed; no task turn or GitHub mutation was issued.
- 2026-10-01 05:10Z: discovered and fixed dashboard container reachability: `run_dashboard()` now honours `SYMPHONY_DASHBOARD_HOST`; Compose provides `0.0.0.0` internally while Docker publishes only `127.0.0.1:8765` externally. A regression test covers the override.
