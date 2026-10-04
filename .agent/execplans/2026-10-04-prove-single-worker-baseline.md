# Prove the Symphony single-worker baseline

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Before enabling the requested multi-worker Symphony runtime, establish one trustworthy baseline: at most one eligible Issue is admitted per scheduler tick, durable reservations survive a restart, and the bounded #12 demonstration acts only on one dedicated GitHub Issue. This establishes the reference behavior that #24 will later extend to multiple workers.

## Progress

- [x] (2026-10-04 03:55Z) Changed checked-in and typed default concurrency from two to one and added a regression test for two independent eligible Issues.
- [x] (2026-10-04 03:57Z) Focused scheduler/workflow suite passed 12 tests and workflow validation passed. Full canonical verification remains to run after the dedicated test Issue preparation is recorded.
- [x] (2026-10-04 04:00Z) Created dedicated child Issue [#38](https://github.com/successbycs/template/issues/38) under #12 with no labels and an explicit no-general-dispatch safety contract.
- [x] (2026-10-04 04:08Z) Completed the disabled-dispatch baseline against #38: live GitHub observation, durable reservation/reopen/worker-stop proof, and a sanitized #38 evidence comment. No task was claimed or executed.
- [x] (2026-10-04 04:19Z) Chris explicitly authorized the separately bounded one-worker #38 execution, while preserving the no-label/no-general-dispatch contract.
- [x] (2026-10-04 04:20Z) Ran one real `CodexAppServerRunner` Terra turn in `/home/chris/var/symphony/workspaces/_38-6222b87cd34976af`; it completed successfully, recorded thread/turn identifiers in the durable store, and made no worktree changes.
- [x] (2026-10-04 04:21Z) Reopened `var/symphony/issue-38-live-worker.sqlite3`: the event records `human_review`, operations show one observation/reservation/admission/worker-stop lifecycle, and no active reservation remains. Checked-in dispatch remains false.
- [x] (2026-10-04 04:23Z) Posted and re-read sanitized evidence on #38 and parent #12. Final audit confirms #38 remains open and unlabelled; its reopened durable store contains only #38 records, no active reservation, and checked-in dispatch is false.

## Surprises & Discoveries

- Observation: The prior default and checked-in runtime allowed two workers immediately, without #24’s eight-gate evidence.
  Evidence: `WORKFLOW.md:13`, `src/app_template/symphony/workflow.py:50`, and `src/app_template/symphony/scheduler.py:144` inspected on 2026-10-04.

## Decision Log

- Decision: Set the effective baseline to exactly one worker in configuration and model defaults.
  Rationale: A default must fail safe even in copied projects or minimally specified workflows; #24 is the only route to an increased value.
  Date/Author: 2026-10-04 / Chris and Codex

- Decision: Invoke the authorized #38 worker directly rather than through `Scheduler.tick()`.
  Rationale: The scheduler's current production admission contract requires and mutates GitHub labels. Both the user-approved #38 safety contract and repository GitHub-session policy prohibit label changes. Direct invocation preserves the real Codex worker, isolated worktree, one-worker reservation, durable event store, and only permitted #38 evidence write without weakening those controls.
  Date/Author: 2026-10-04 / Chris and Codex

## Outcomes & Retrospective

The single-worker baseline and #12 demonstration are complete for human review:
local default enforcement, focused admission/recovery tests, host preflight,
live GitHub observation, durable reservation/reopen/stop evidence, one actual
Codex worker turn, and final GitHub handoffs. The run used
`CodexAppServerRunner` directly because scheduler admission requires labels
prohibited by the test contract. The worker was instructed to make no
implementation changes, and its isolated worktree was clean on inspection.
The final audit reconfirmed that #38 is open and unlabelled, its durable store
holds only #38 records with no active reservation, and dispatch remains false.
The first accidental check attempted to pass `WORKFLOW.md` to Ruff and failed
parsing; the corrected Python-only lint passed and the failure is not counted
as a product check.

## Context and Orientation

`WORKFLOW.md` is the checked-in runtime contract. `AgentSettings.max_concurrent_agents` in `src/app_template/symphony/workflow.py` supplies the default for minimal workflows. `Scheduler.tick()` derives available slots from this value. `tests/unit/symphony/test_scheduler.py` uses a fake tracker/runner to prove deterministic admission without external calls. The #12 external proof may mutate one dedicated test Issue only; it must leave `runtime.live_dispatch: false` afterward.

## Plan of Work

Validate the configuration change and focused scheduler admission test. Create one plainly marked dedicated test Issue with no labels or permission for general dispatch. Re-read its state before each external write. For the authorized real-worker proof, prepare that Issue's isolated worktree, acquire its local reservation, invoke exactly one `CodexAppServerRunner` turn, persist its sanitized result, reopen the store to prove the lifecycle, and write one concise evidence comment to #38. The checked-in workflow remains disabled throughout; direct invocation is deliberate because scheduler admission would otherwise require prohibited label transitions. Audit the before/after GitHub state and stop with dispatch false.

## Concrete Steps

From `/home/chris/template`:

    docker compose run --rm app uv run pytest -q tests/unit/symphony/test_scheduler.py tests/unit/symphony/test_workflow.py
    docker compose run --rm app uv run python scripts/verify.py
    docker compose run --rm app uv run app-template symphony validate-workflow

Expected: focused suite and canonical verifier pass; workflow reports valid. A later externally authorized step will create the dedicated Issue and record its URL.

## Validation and Acceptance

| Boundary | Required evidence | Status |
| --- | --- | --- |
| Default configuration | Checked-in and typed values are one | passed: focused suite and workflow validation |
| Admission | Two independent eligible candidates result in one running worker | passed: focused suite |
| Recovery | Existing reservation/restart tests pass | passed: focused suite and durable-store reopen |
| #12 external demonstration | Dedicated #38 only, one real Codex worker in its isolated worktree, GitHub read/write, durable lifecycle/reopen evidence, no unrelated dispatch, dispatch false afterward | passed; awaiting human review |

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

Authorized live-worker evidence: `CodexAppServerRunner` ran exactly one Terra
turn for #38 in `/home/chris/var/symphony/workspaces/_38-6222b87cd34976af`.
It returned success with summary `bounded-single-worker-test completed`; its
thread and turn identifiers were persisted in
`var/symphony/issue-38-live-worker.sqlite3` but are not repeated in GitHub
comments. Reopening that SQLite database showed exactly the bounded #38
observation, reservation, admission decision, one human-review event, and
worker-stop lifecycle, with no active reservation. `git -C <workspace> status
--short` and `git -C <workspace> diff --check` produced no output; checked-in
`WORKFLOW.md` still loaded with `live_dispatch: false`.

Final external audit: #38 remained open with no labels after the evidence
comment at https://github.com/successbycs/template/issues/38#issuecomment-5975996061;
the parent #12 handoff is
https://github.com/successbycs/template/issues/12#issuecomment-5975996218.
Reopening the durable store returned `event_issue_ids: ["38"]`,
`operation_issue_ids: ["38"]`, and no active reservation. This excludes
unrelated work from the locally recorded worker lifecycle; the only planned
GitHub writes in the run were those two evidence comments.

## Interfaces and Dependencies

`AgentSettings.max_concurrent_agents` default and `WORKFLOW.md` value become one. The public `symphony serve` command remains a scheduler-only command. #24 owns any later multi-worker configuration increase and concurrency gate enforcement.
