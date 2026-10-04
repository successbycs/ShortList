# Prove the Symphony single-worker baseline

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Before enabling the requested multi-worker Symphony runtime, establish one trustworthy baseline: at most one eligible Issue is admitted per scheduler tick, durable reservations survive a restart, and the bounded #12 demonstration acts only on one dedicated GitHub Issue. This establishes the reference behavior that #24 will later extend to multiple workers.

## Progress

- [x] (2026-10-04 03:55Z) Changed checked-in and typed default concurrency from two to one and added a regression test for two independent eligible Issues.
- [x] (2026-10-04 03:57Z) Focused scheduler/workflow suite passed 12 tests and workflow validation passed. Full canonical verification remains to run after the dedicated test Issue preparation is recorded.
- [x] (2026-10-04 04:00Z) Created dedicated child Issue [#38](https://github.com/successbycs/template/issues/38) under #12 with no labels and an explicit no-general-dispatch safety contract.
- [x] (2026-10-04 04:08Z) Completed the disabled-dispatch baseline against #38: live GitHub observation, durable reservation/reopen/worker-stop proof, and a sanitized #38 evidence comment. No task was claimed or executed.
- [ ] Obtain explicit authority for the separately bounded live #38 execution before attempting it; leave dispatch false until then.
- [ ] Record any authorized live result in #12, the verification matrix, and this plan; leave dispatch false afterward.

## Surprises & Discoveries

- Observation: The prior default and checked-in runtime allowed two workers immediately, without #24’s eight-gate evidence.
  Evidence: `WORKFLOW.md:13`, `src/app_template/symphony/workflow.py:50`, and `src/app_template/symphony/scheduler.py:144` inspected on 2026-10-04.

## Decision Log

- Decision: Set the effective baseline to exactly one worker in configuration and model defaults.
  Rationale: A default must fail safe even in copied projects or minimally specified workflows; #24 is the only route to an increased value.
  Date/Author: 2026-10-04 / Chris and Codex

## Outcomes & Retrospective

The disabled-dispatch baseline is complete: local default enforcement,
single-admission/recovery tests, a host preflight, a live #38 observation, and
a durable reservation/reopen/stop record. The parent Issue #12 is not complete:
no real implementation task or temporary live dispatch was attempted. The first
accidental check attempted to pass `WORKFLOW.md` to Ruff and failed parsing; the
corrected Python-only lint passed and the failure is not counted as a product
check.

## Context and Orientation

`WORKFLOW.md` is the checked-in runtime contract. `AgentSettings.max_concurrent_agents` in `src/app_template/symphony/workflow.py` supplies the default for minimal workflows. `Scheduler.tick()` derives available slots from this value. `tests/unit/symphony/test_scheduler.py` uses a fake tracker/runner to prove deterministic admission without external calls. The #12 external proof may mutate one dedicated test Issue only; it must leave `runtime.live_dispatch: false` afterward.

## Plan of Work

Validate the configuration change and focused scheduler admission test. Create one plainly marked dedicated test Issue with no labels or permission for general dispatch. Re-read its state before each external write. For the real proof, use only the host scheduler after confirming prerequisites, record the GitHub observation and limited transition/comment evidence, restart the owned process to demonstrate reservation recovery, and verify no unrelated Issue changed. Stop with dispatch false.

## Concrete Steps

From `/home/chris/template`:

    docker compose run --rm app uv run pytest -q tests/unit/symphony/test_scheduler.py tests/unit/symphony/test_workflow.py
    docker compose run --rm app uv run python scripts/verify.py
    docker compose run --rm app uv run app-template symphony validate-workflow

Expected: focused suite and canonical verifier pass; workflow reports valid. A later externally authorized step will create the dedicated Issue and record its URL.

## Validation and Acceptance

| Boundary | Required evidence | Status |
| --- | --- | --- |
| Default configuration | Checked-in and typed values are one | pending focused tests |
| Admission | Two independent eligible candidates result in one running worker | pending focused tests |
| Recovery | Existing reservation/restart tests pass | pending focused tests |
| #12 external demonstration | Dedicated Issue only, GitHub read/write, restart evidence, no unrelated dispatch, dispatch false afterward | pending dedicated target and authority |

## Idempotence and Recovery

Local tests are repeatable. The dedicated test Issue will be explicitly named and isolated; never mutate another Issue. If the scheduler process is interrupted, preserve its database and identify its reservation before retrying. Do not raise concurrency or enable dispatch as part of baseline preparation.

## Artifacts and Notes

Store exact test counts, dedicated Issue URL, local commit `dede0fb`, and external observations in this plan and #12. Do not include credentials, prompts, transcripts, or email content.

Executed baseline evidence: host preflight returned `live_dispatch: False`,
both executables present, authenticated GitHub access, and `dispatch_ready:
True`; a disabled scheduler tick returned without admission. A live #38
observation was persisted to `var/symphony/issue-12-proof.sqlite3`, reservation
reopen was asserted before the explicit stop, and the final record was
`worker_stop`. The sanitized handoff is
https://github.com/successbycs/template/issues/38#issuecomment-5975930788.

## Interfaces and Dependencies

`AgentSettings.max_concurrent_agents` default and `WORKFLOW.md` value become one. The public `symphony serve` command remains a scheduler-only command. #24 owns any later multi-worker configuration increase and concurrency gate enforcement.
