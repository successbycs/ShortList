# Classify Symphony failures before Astra review and Terra repair

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #26](https://github.com/successbycs/template/issues/26)

## Purpose / Big Picture

Issue #26 prevents global, provider, approval, and cancellation failures from being mistaken for a task defect. Only two evidence-bearing task-local Terra failures may invoke Astra review; Astra receives an immutable snapshot, then Terra applies the repair and resumes the original task.

## Progress

- [x] (2026-10-01 07:00Z) Verified #8 and #25 closure, claimed #26, and inspected runner, scheduler, domain, and focused tests.
- [x] (2026-10-01 07:00Z) Identified that every failed `RunResult` currently consumes the retry budget and Astra has no named immutable snapshot.
- [ ] Add failure kind and immutable review snapshot; protocol classification and scheduler routing remain.
- [ ] Add focused classification/routing tests, canonical verification, local commit/push, and human-review handoff.

## Surprises & Discoveries

- Observation: current runner summaries flatten approvals, protocol failures, cancellations, and task failures into unstructured text.
  Evidence: `src/app_template/symphony/runner.py` and `scheduler.py`.

## Decision Log

- Decision: classify failures at the runner boundary and carry the classification in immutable `RunResult` data.
  Rationale: scheduler routing must not parse human-readable summaries or infer that infrastructure failure is task-local.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

Pending implementation and verification.

## Context and Orientation

`runner.py` receives app-server JSON-RPC messages. `scheduler.py` retries Terra twice then invokes Astra. `domain.py` defines `RunResult` and run records. The existing fake tests establish the happy escalation path but not safety classifications. No live dispatch will occur.

## Plan of Work

Add a `FailureKind` enum and optional immutable failure snapshot to `domain.py`. Runner protocol events classify approval as human approval, abnormal cancellation as cancelled, process and initialization errors as provider or environment, and terminal implementation failures as task-local only when an active turn reports failure. Scheduler retries only task-local failures; all other failures block without Astra. After two task-local failures, freeze a snapshot containing Issue identity, attempts, workspace, sanitized results, and revision marker for Astra; Terra receives that snapshot with repair and resume prompts.

Add fake runner and protocol tests for each class, snapshot immutability, two task-local failures, and no escalation for non-task-local failures. Run focused tests and the canonical verifier. No GitHub task dispatch or real Codex turn is permitted.

## Concrete Steps

From `/home/chris/template`, run `docker compose run --rm app uv run pytest tests/unit/symphony/test_runner.py tests/unit/symphony/test_scheduler.py -q`, then `docker compose run --rm app uv run python scripts/verify.py`.

## Validation and Acceptance

Tests must prove exactly two task-local failures route Terra to Astra to Terra repair/resume; approvals, cancellation, unavailable provider, and environment errors block without consuming those attempts; the Astra input is an immutable named snapshot. Canonical verification must pass.

## Idempotence and Recovery

Classification is pure and repeatable. Non-task-local failure stops further task execution; later recovery requires a new observed admission, not automatic retry. No external state is mutated by tests.

## Artifacts and Notes

- Parent #5 remains open in the live API despite a user message claiming closure; that state does not alter #26 technical dependency evidence.

## Interfaces and Dependencies

`FailureKind`, `FailureSnapshot`, and `RunResult.failure_kind` will be defined in `domain.py`; runner emits them and scheduler consumes them. No new service or dependency is introduced.
- 2026-10-01 07:10Z: added `FailureKind`, immutable `FailureSnapshot`, and optional `RunResult.failure_kind`. Ruff format/check and focused runner/scheduler tests passed (7). Routing and protocol emission remain incomplete.
