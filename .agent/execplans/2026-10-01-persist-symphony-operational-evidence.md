# Persist Symphony operational evidence

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #28 makes the local Symphony service safe to resume after a process restart.  After this work, an operator can inspect durable, sanitized operational facts—admission decisions, observations, reservations, worker stops, reviewed revisions, and queue age—and the scheduler will not start a duplicate run whose reservation survived a crash.  The evidence is stored in the existing local SQLite database; it does not write to GitHub or dispatch live work.

## Progress

- [x] (2026-10-01 00:00Z) Read the issue, planning contract, and existing SQLite service and scheduler code.
- [x] (2026-10-01 05:25Z) Added version-safe operational-event, queue-age, and reservation schemas with scalar-only payload validation.
- [x] (2026-10-01 05:25Z) Connected scheduler admission, observation, claim, reviewed-revision, reservation, and worker-stop lifecycle evidence.
- [x] (2026-10-01 05:25Z) Added SQLite migration/reopen, sanitization, reservation, restart, duplicate-prevention, and lifecycle tests.
- [x] (2026-10-01 05:25Z) Ran focused tests and full verification; awaiting GitHub human-review transition.

## Surprises & Discoveries

- Observation: The existing `EventStore` persists run and notification events but has no reservation ownership table or restart recovery API.
  Evidence: `src/app_template/symphony/service.py`, inspected 2026-10-01.

## Decision Log

- Decision: Model a surviving reservation as an active local safety fence, rather than automatically rerunning it after restart.
  Rationale: A stale reservation can delay work but cannot cause duplicate execution; an operator can resolve it once the worker outcome is known.
  Date/Author: 2026-10-01 / Codex
- Decision: Store structured, allow-listed operational fields only.
  Rationale: The evidence must support review without persisting prompts, credentials, or runner message bodies.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

The service now retains the local facts needed to explain scheduler decisions and safely fence an interrupted run. A recovered active reservation is intentionally not auto-released or auto-resumed, so restart recovery cannot create duplicate execution. The dashboard API exposes the resulting operational records without adding a new UI. The only environment discovery was that `uv` and project dependencies were absent; an ignored `.venv` was created for verification.

## Context and Orientation

`src/app_template/symphony/service.py` owns `EventStore`, a SQLite-backed local record used by the read-only dashboard. `src/app_template/symphony/scheduler.py` polls eligible GitHub Issues and starts a runner after the tracker claims an Issue. Today its in-memory `records` and `running` maps disappear on restart, so a new process cannot know whether an earlier process had reserved work. `src/app_template/symphony/domain.py` supplies the stable `Issue`, `RunRecord`, and `IssueObservation` types. `tests/unit/symphony/test_dashboard.py` is the existing persistence test location.

An operational event is a timestamped, allow-listed fact about local scheduling. A reservation is an atomic SQLite claim keyed by Issue ID. An active reservation recovered after a restart blocks dispatch of that Issue, which is the safe fallback when the prior worker state is unknown.

## Plan of Work

First, extend `EventStore` in `src/app_template/symphony/service.py` with idempotent SQLite schema creation for operational events and reservations. Add an allow-listed API for event kinds and JSON fields, a durable reservation acquisition method, a worker-stop method, and a recovery snapshot. Migration must work when the database already contains only the older event tables.

Second, pass these store operations into `Scheduler` through small callbacks so that candidate admission decisions, fresh observations, claims/reservations, queue age, reviewed-revision markers, and worker stop facts are persisted. Reserve before creating an async worker task. If the reserve already exists, skip the candidate. In `finally`, record a stopped reservation for normal terminal completion. On construction, load active reservations and keep them fenced from new dispatch.

Third, add focused tests in `tests/unit/symphony/test_dashboard.py` and scheduler tests as needed. Prove reopening a database works, an older database migrates, a second store cannot reserve the same Issue, a recovered active reservation prevents a duplicate task, and an injected interruption leaves a recoverable active reservation. Keep the dashboard presentation unchanged.

## Concrete Steps

From `/home/chris/template`:

1. Ran `.venv/bin/pytest -q tests/unit/symphony/test_dashboard.py tests/unit/symphony/test_scheduler.py`.
   Result: `19 passed in 2.73s`.
2. Ran `.venv/bin/python scripts/verify.py`.
   Result: Ruff lint and format passed; `55 passed in 3.68s`; Markdown links passed.
3. Ran `git diff --check`.
   Result: no whitespace errors.

## Validation and Acceptance

The acceptance proof must show that SQLite has durable records for sanitized observations, claims, reservations, worker stop, reviewed revision, queue age, and admission decision. It must demonstrate that reopening an existing database preserves the records and migrates from prior tables. A second scheduler/store instance must not acquire an already active reservation, and a simulated interruption must be recoverable as an active fence rather than triggering duplicate execution. The focused tests and full test suite must pass.

## Idempotence and Recovery

Schema creation uses `CREATE TABLE IF NOT EXISTS`, so reopening and migration checks are repeatable. Reservation insertion uses a unique Issue ID and is safe to retry: only the first acquisition succeeds. If a process ends before it records worker stop, recovery retains the active reservation and deliberately blocks dispatch. This avoids duplicates; resolving a genuinely stale reservation remains a manual, later-policy decision. The tests use temporary SQLite files only.

## Artifacts and Notes

Focused verification result: `19 passed in 2.73s`. Full verification result: `55 passed in 3.68s`, Ruff lint/format and Markdown-link checks passed. No production service, credentials, or external dispatch was used. The only GitHub mutations are the permitted Issue workflow labels and comments.

## Interfaces and Dependencies

`src/app_template/symphony/service.py` will expose `EventStore.record_operation(kind, issue_id, details)`, `EventStore.reserve(issue_id, details)`, `EventStore.stop_reservation(issue_id, outcome)`, and `EventStore.recover_reservations()`. Details are JSON-compatible allow-listed strings/numbers/booleans. `src/app_template/symphony/scheduler.py` will accept optional persistence callbacks so the existing public constructor remains compatible. No new package, service, configuration, or network dependency is introduced.
