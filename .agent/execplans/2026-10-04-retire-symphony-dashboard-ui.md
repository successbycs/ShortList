# Retire the non-required Symphony dashboard UI

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

The repository owner has removed the value case for the #10 browser dashboard. This change removes the FastAPI/HTML dashboard, its CLI command, loopback Compose profile, UI documentation, and dashboard-only proof code. It preserves the local `EventStore`, reservation recovery, scheduler callbacks, and human-review notification persistence because these support safe worker execution and the agreed multi-worker goal. Afterward, Symphony can still run as a scheduler with dispatch disabled by default, but it no longer exposes an empty browser evidence viewer.

## Progress

- [x] (2026-10-04 03:22Z) Revalidated that the dashboard is not a product-template requirement and identified every current UI-specific source, test, configuration, Compose, guide, specification, and proof reference.
- [x] (2026-10-04 03:44Z) Removed dashboard-only runtime/UI code while retaining `EventStore`, scheduler callbacks, reservation recovery, and notification persistence.
- [x] (2026-10-04 03:44Z) Removed dashboard-specific configuration, Compose service, CLI command, active documentation/specification, tests, bootstrap rewrite assertion, and proof-harness row.
- [x] (2026-10-04 03:49Z) Updated #12, #13, and #16 contracts to remove dashboard criteria and closed #10 as `not planned` with the scoped-removal evidence.
- [ ] Run focused scheduler/event-store/CLI/bootstrap tests plus the canonical verifier, then record evidence in the plan and Issues.

## Surprises & Discoveries

- Observation: `EventStore` is not only dashboard storage. `SymphonyService` wires it into scheduler callbacks for run records, admission observations, reservations, and worker-stop recovery.
  Evidence: `src/app_template/symphony/service.py` constructor and `tests/unit/symphony/test_scheduler.py` read on 2026-10-04.
- Observation: The dashboard tables are empty because `Scheduler.tick()` exits while `runtime.live_dispatch` is false, not because no producer exists.
  Evidence: Astra’s read-only review of `src/app_template/symphony/scheduler.py` and current disabled `WORKFLOW.md` configuration.
- Observation: The bootstrap test asserted an import containing the removed dashboard-only `Issue` adapter type.
  Evidence: Focused container tests failed only `test_bootstrap_renames_package_and_is_repeatable` after UI removal; the copied service correctly imports only `RunRecord` and `RunResult`.
- Observation: Removing the named dashboard service left one Compose orphan, which was stopped and removed with `docker compose up --detach --remove-orphans`.
  Evidence: `docker compose ps` afterward listed only the normal `app` service.

## Decision Log

- Decision: Remove the dashboard UI, not the durable event/reservation mechanism.
  Rationale: The owner rejected the UI’s value but retained the multi-worker objective; duplicate-execution prevention and restart recovery are required for that objective.
  Date/Author: 2026-10-04 / Chris and Codex
- Decision: Convert `serve` into the scheduler-only runtime entry point.
  Rationale: A background scheduler is the actual Symphony worker surface; an HTTP server is neither needed nor useful for this scope.
  Date/Author: 2026-10-04 / Codex

## Outcomes & Retrospective

The dormant dashboard is removed and #10 is cancelled. The retained scheduler
remains disabled for dispatch by default and preserves its durable safety
records. Focused tests passed 43 tests; the canonical verifier passed Ruff,
format, 70 tests, and Markdown links. #12, #13, and #16 now exclude UI
requirements. Human review remains required for later worker activation work.

## Context and Orientation

`src/app_template/symphony/service.py` contains both the durable `EventStore` and the dashboard-specific `FastAPI` routes, `ReadOnlyTracker`, `ReadOnlyRunner`, and Uvicorn server lifecycle. `src/app_template/cli.py` exposes the `symphony dashboard` command. `compose.yaml` contains the profile-gated dashboard service and loopback port. `WORKFLOW.md` contains dashboard host/port settings. `scripts/prove_deployed_software.py`, `docs/guides/SYMPHONY_DASHBOARD.md`, `docs/specs/2026-10-02-read-only-dashboard.md`, and `tests/unit/symphony/test_dashboard.py` are #10 artifacts.

The worker scheduler remains in `src/app_template/symphony/scheduler.py`; it persists evidence through `EventStore` and must not be removed. `runtime.live_dispatch` remains false during this change.

## Plan of Work

First, remove the web presentation and read-only web adapters from `service.py`, leaving `SymphonyService.from_host_workflow()`, scheduler construction, `tick`, `preflight`, and scheduler-only `serve`. Remove only imports used by the UI.

Next, remove UI command/configuration/deployment and documentation references. Replace the dashboard tests with event-store and notification tests under an accurately named test module; retain migration, reservation, notification, and host preflight coverage. Remove only the dashboard row from the general proof harness, keeping CLI, SQLite, no-op, and Markdown proof rows.

Finally, update the Issue contracts so #12 demonstrates a bounded single-worker scheduler path without a browser/dashboard criterion; #13 guides the scheduler workflow; and #16 no longer promises dashboard-aligned policy. Cancel #10 as a withdrawn programme scope, then verify the code and record the exact results.

## Concrete Steps

Run from `/home/chris/template`:

    docker compose run --rm app uv run pytest -q tests/unit/symphony tests/unit/test_cli.py tests/unit/test_bootstrap_template.py tests/unit/test_prove_deployed_software.py
    docker compose run --rm app uv run python scripts/verify.py
    docker compose run --rm app uv run app-template symphony validate-workflow
    docker compose run --rm app uv run app-template symphony preflight

Expected: all selected and canonical checks pass; `preflight` reports dispatch false unless host prerequisites are configured. The removed `symphony dashboard` command should be rejected by argparse, and no port 8765 service should remain.

Executed 2026-10-04:

    docker compose run --rm app uv run pytest -q tests/unit/symphony tests/unit/test_cli.py tests/unit/test_bootstrap_template.py tests/unit/test_prove_deployed_software.py
    # 43 passed in 3.38s
    docker compose run --rm app uv run python scripts/verify.py
    # Ruff and format passed; 70 tests passed; Markdown links passed
    docker compose run --rm app uv run app-template symphony validate-workflow
    # {"status": "ok", "workflow": "/workspace/WORKFLOW.md"}
    docker compose run --rm app uv run app-template symphony preflight
    # live_dispatch false; dispatch_ready false

## Validation and Acceptance

| Boundary | Required proof | Expected result |
| --- | --- | --- |
| UI removal | CLI parser and repository search | No dashboard command, Compose service, port publication, or FastAPI route remains. |
| Worker safety | Scheduler/event-store tests | Reservations survive restart; stopped reservations remain durable; operations are allow-listed. |
| Runtime default | Workflow validation and preflight | `live_dispatch` stays false and no external task action occurs. |
| Template quality | Canonical verifier | Ruff, formatting, tests, and Markdown links pass. |
| External scope | Updated GitHub Issues | #10 is cancelled as not planned; #12/#13/#16 do not retain obsolete dashboard dependencies. |

## Idempotence and Recovery

The source removal is reviewable in Git. Repeating tests and CLI validation is safe. If a previously started `symphony` Compose container exists, stop only the named `symphony` service; no data under `var/symphony/` is deleted. Restore the UI only by reverting this scoped commit, not by re-enabling dispatch.

## Artifacts and Notes

Record the local commit, commands, test counts, Issue URLs, and remaining human-review gates here. Do not treat local command output as the only durable evidence; add concise Issue handoffs.

## Interfaces and Dependencies

Removed interfaces: `app-template symphony dashboard`, `SymphonyService.dashboard()`, `SymphonyService.run_dashboard()`, the profile-gated `symphony` Compose service, and `GET /`/`GET /health`/`GET /api/status`. Retained interfaces: `app-template symphony validate-workflow`, `preflight`, and `serve`; `EventStore` reservation and persistence methods; scheduler APIs and notification adapter.
