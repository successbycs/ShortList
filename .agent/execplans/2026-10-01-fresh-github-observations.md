# Require fresh GitHub observations before Symphony decisions

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #27](https://github.com/successbycs/template/issues/27)

## Purpose / Big Picture

Issue #27 makes GitHub state a fresh, explicit input to every Symphony eligibility, claim, blocked, and review decision. A read returns either a timestamped observed Issue or a timestamped unknown result. A network or CLI failure is never treated as closure, missing eligibility, or permission to mutate an Issue.

## Progress

- [x] (2026-10-01 06:20Z) Verified #8 closure, claimed #27, and inspected the current tracker, scheduler, service, domain, and tests.
- [x] (2026-10-01 06:20Z) Identified that `GitHubTracker.get()` catches read failures and returns `None`, while scheduler reconciliation treats `None` as cancellation.
- [x] Add typed observations, fresh decision gates, and non-mutating unknown handling.
- [x] Add stale-label, dependency, read-failure, and new-scheduler tests; verify and hand off.

## Surprises & Discoveries

- Observation: GitHub dependency state is fetched separately from Issue state, so an Issue view alone cannot safely prove eligibility.
  Evidence: `GitHubTracker._with_dependencies()` calls the dependency endpoint after parsing an Issue.

## Decision Log

- Decision: Represent a failed read as `IssueObservation(status="unknown")`, not `None` or a synthetic Issue.
  Rationale: callers must distinguish unavailable evidence from a terminal or ineligible Issue and fail closed without a GitHub write.
  Date/Author: 2026-10-01 / Codex
- Decision: Observe a candidate again immediately before claiming it, and observe an Issue immediately before a review or blocked transition.
  Rationale: listing is only a discovery snapshot; the second direct read protects against changes made between listing and mutation.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

Implemented timestamped known/unknown observations. A fresh direct observation now gates claim, review, and generic state transition writes; reconciliation preserves queued work when GitHub evidence is unknown. Tests cover stale closed labels, dependencies, unavailable reads, and reconstructed schedulers. A bounded live host read observed closed Issue #25 without any mutation.

## Context and Orientation

`tracker.py` wraps host `gh` reads and writes. `scheduler.py` currently calls `candidates()`, `claim()`, and `finish()` using `Issue` values that can become stale. `domain.py` holds immutable Issue values and run state. `service.py` composes the host tracker and dashboard-only tracker. This task alters decision evidence only; it does not enable dispatch or persist the broader operations event model reserved for #28.

## Plan of Work

Add an immutable `IssueObservation` in `domain.py`: source, fetch timestamp, observed/unknown status, Issue value when known, and sanitized reason when unknown. Make both production and read-only tracker implementations return it. `GitHubTracker.observe()` will fetch Issue state and dependencies together; command errors produce unknown results. Candidate discovery remains a list but scheduler will directly observe every candidate before eligibility and claim.

Make `claim`, `finish`, and `transition` gate their write on a new direct observation. Scheduler reconciliation will cancel only a known closed or known-ineligible Issue; unknown observations leave the run unchanged and record a bounded error. A successful runner result becomes human review only when a fresh observation permits that transition; otherwise it becomes blocked locally without guessing GitHub state.

Add fakes and focused tests for stale closed labels, individually closed dependencies, failed reads, and a reconstructed scheduler that obtains a new observation rather than reusing old state. Update the applicable harness documentation with the source-of-truth rule.

## Concrete Steps

From `/home/chris/template`, run `docker compose run --rm app uv run pytest tests/unit/symphony/test_tracker.py tests/unit/symphony/test_scheduler.py -q`, then `docker compose run --rm app uv run python scripts/verify.py`. Expected: fake GitHub observations prove no write occurs when state is unknown, and the canonical verifier passes without GitHub mutation or dispatch.

## Validation and Acceptance

Tests must prove: an observation records state, labels, source, and timestamp; a failed direct read is unknown; a closed Issue with stale labels is terminal; each dependency is individually fresh before admission; and a new scheduler instance performs new reads. The GitHub adapter test uses fake `gh` output only. No real Issue action, credential change, dashboard redesign, concurrency, or live dispatch occurs.

## Idempotence and Recovery

Observation reads are repeatable. Unknown observations do not cause writes, cancellation, or retry dispatch. A later scheduler tick performs a new read and may proceed only with known evidence. Existing records are retained for the later durable-recovery task; this task does not alter or delete them.

## Artifacts and Notes

- #20 remains historical stale-label evidence only; tests construct fresh fake observations instead of assuming its current remote state.

## Interfaces and Dependencies

`IssueObservation` is added in `src/app_template/symphony/domain.py`. `Tracker.observe(issue_id) -> IssueObservation` and boolean state-transition outcomes are implemented in `tracker.py`, including dashboard-safe no-op behavior. `Scheduler` consumes observations before eligibility and mutation. No new package or external service is added.
- 2026-10-01 06:30Z: added timestamped known/unknown observations, direct-read gates for claim/review/transition writes, and reconciliation behavior that preserves a run when a read is unknown. Focused tracker/scheduler tests passed (7); canonical verifier passed (48 tests, Ruff lint/format, Markdown links).
- Remaining: add explicit reconstructed-scheduler fresh-observation test and document the operator-facing decision-evidence rule before human-review handoff.
- 2026-10-01 06:45Z: focused tracker/scheduler checks passed (8 tests). A host-only read-only `GitHubTracker.observe("25")` reported a known closed Issue, no dependencies, a GitHub source, and a timestamp; no claim, edit, dispatch, or Codex turn occurred. Final canonical verifier passed: 49 tests, Ruff lint/format, and Markdown links.
