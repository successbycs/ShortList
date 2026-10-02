# Complete the read-only operator dashboard

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Finish [Issue #10](https://github.com/successbycs/template/issues/10): operators can inspect sanitized persisted Symphony evidence in a browser without executing tasks. Closed prerequisites are #8 and #25–#28. The current API exists but has no operator page and still exposes mutation routes.

## Progress

- [x] (2026-10-02) Read live Issue, current service, tests and Compose configuration. Preserve the separate uncommitted label-policy cleanup.
- [x] (2026-10-02) Implemented read-only HTML/API, read-only SQLite access, no POST controls, escaped text, direct bind validation and guide.
- [x] (2026-10-02) Focused dashboard tests: 13 passed in 0.53s outside the sandbox. The same tests hit the 20-second timeout inside it; this isolates the earlier test stall to the execution environment, not a demonstrated application deadlock.
- [x] (2026-10-02) Canonical verifier outside sandbox passed Ruff lint/format, 68 tests in 3.22s and Markdown links. Browser screenshots remain pending.
- [x] (2026-10-02 04:14Z) Real Chromium browser loaded disposable loopback servers on ports 8876 and 8877. Populated snapshot showed all seven event kinds plus active reservation 11; empty snapshot showed no evidence. Screenshots saved and populated image visually inspected. Only browser console error was the harmless missing favicon (HTTP 404); no application JavaScript is used.
- [ ] Run focused tests, canonical verifier and real local browser proof; commit only this task and post evidence.

## Surprises & Discoveries

The existing dashboard includes POST pause/resume/tick controls contrary to the current Issue scope. EventStore already provides allow-listed operational fields; legacy run summaries contain free text and must not be rendered as trusted markup.

The Playwright wrapper is not executable directly; invoking through bash reaches Windows npx, which fails to locate its Node installation in this environment. Browser proof needs a Linux CLI path. No packages were changed by these failed attempts.

## Decision Log

- Decision: Use a small server-rendered HTML page and existing SQLite operations, removing HTTP execution controls.
  Rationale: No frontend dependencies or external calls are needed for a read-only inspection surface.
  Date/Author: 2026-10-02 / Codex
- Decision: Preserve Compose's internal 0.0.0.0 bind with loopback-only published port; validate direct dashboard binds.
  Rationale: Containers need internal reachability while the operator interface remains local.
  Date/Author: 2026-10-02 / Codex

## Outcomes & Retrospective

Implemented the read-only page and safe persisted-evidence API, removed mutation routes, and passed focused and canonical tests. Browser proof used synthetic records through actual SQLite, Uvicorn HTTP and Chromium boundaries. No live worker or provider capability is inferred. Screenshot artifacts are committed with this task; final commit and GitHub handoff pending.

## Context and Orientation

`src/app_template/symphony/service.py` owns SQLite EventStore and dashboard construction; the dashboard factory uses ReadOnlyTracker/Runner. `tests/unit/symphony/test_dashboard.py` covers persistence and service boundaries. `compose.yaml` publishes 127.0.0.1:8765 and uses an internal 0.0.0.0 bind. `WORKFLOW.md` disables live dispatch. Historical full-suite attempts inside the sandbox stalled and require a bounded rerun with appropriate permissions if needed.

## Plan of Work

Implement an escaped HTML table at `/`, expose only sanitized durable operations plus active reservations at `/api/status`, and remove the three POST controls. Test every requested event kind, reopening persistence, empty state, HTML escaping and refused mutation routes. Add `docs/guides/SYMPHONY_DASHBOARD.md` with startup, refresh, data provenance and limits. Validate direct loopback configuration without breaking existing container binding.

## Concrete Steps

From `/home/chris/template`, run `.venv/bin/pytest -q tests/unit/symphony/test_dashboard.py`, `.venv/bin/python scripts/verify.py`, and `git diff --check`. Use the Playwright CLI against a disposable loopback server seeded with all seven event kinds; record browser output and stop the owned process after proof.

## Validation and Acceptance

API tests must show observation, claim, reservation, worker_stop, reviewed_revision, queue_age and admission_decision, including persisted evidence after reopening. Browser must show these same records as escaped text; mutation requests must fail without contacting runner/tracker. Missing databases must produce an empty state without creating a database. Local server and browser are the real operational boundary; no external GitHub dispatch is part of proof. Canonical checks and issue handoff remain required.

## Idempotence and Recovery

No database migration or historical record deletion. Disposable proof uses a unique temporary directory. Stop only owned server/browser processes. Code rollback is reviewable through Git; preserve unrelated work and never enable live dispatch.

## Artifacts and Notes

Evidence will be appended here before the GitHub handoff. Labels are unchanged under the current session workflow.

Screenshots: [populated dashboard](../../output/playwright/issue-10-populated.png) and [empty dashboard](../../output/playwright/issue-10-empty.png). These contain disposable fixtures, not real task execution. Browser commands used Linux Node v22.22.0 with the Playwright CLI wrapper, session `issue10`, and installed Chromium at `/home/chris/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`. `open http://127.0.0.1:8876`, `goto http://127.0.0.1:8877`, and `screenshot --filename=output/playwright/issue-10-{populated,empty}.png` completed. The latest CLI's default browser was absent, so its documented executable-path environment override selected the installed Chromium. No browser installation was required.

## Interfaces and Dependencies

GET `/` returns HTML; GET `/api/status` returns read-only persisted operations and active reservations. POST pause/resume/tick are removed. Existing FastAPI, SQLite and standard-library html escaping suffice; no new packages.
