# Rebuild the Set-up delivery graph into small proof-bearing tasks

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

The current Set-up queue contains a broad parent (#5), overlapping implementation issues (#8, #10, #12), and stale label/dependency prose. This plan rebuilds it into a simple chain of small tasks. Each task has one outcome, limited code packets, an explicit predecessor, a test or bounded demonstration, and a human-review handoff. A person will be able to look at the board and know exactly what can start next and exactly what evidence completes it.

## Progress

- [x] (2026-10-01 04:00Z) Read repository planning/readiness/done rules and the complete live GitHub Issue history.
- [x] (2026-10-01 04:00Z) Identified the parent/child overlap, stale state evidence, and missing proof boundaries.
- [x] (2026-10-01 04:00Z) Designed the replacement Set-up graph, issue templates, dependencies, and verification gates.
- [ ] (2026-10-01 04:00Z) Obtain review of this rebuild plan before creating/re-scoping GitHub task records.
- [x] (2026-10-01 04:15Z) Re-scoped #5, #8, #10, #12, #13, and #24; created focused backlog issues #25–#28 without deleting or reopening historical evidence.
- [ ] (2026-10-01 04:15Z) Execute one ready task at a time, recording durable proof before unblocking its successor. #8 is the only active implementation packet.

## Surprises & Discoveries

- Observation: #5 is both a parent program and an implementation task; its unchecked plan lines duplicate work assigned to #6–#12.
  Evidence: live #5 body/ExecPlan and child issue bodies on 2026-10-01.
- Observation: closed #20 retains `status:blocked`, proving a label cannot be treated as canonical task state.
  Evidence: live `gh issue view 20` returned `CLOSED` with the blocked label.
- Observation: #8 was blocked because the container cannot run Codex, but approved #22 establishes that execution belongs on the host; the old issue needs a precise host-broker scope rather than a container repair.
  Evidence: #8 handoff, #22 design, and Dev Container `codex: not found` observation.

## Decision Log

- Decision: Keep existing closed issues as audit evidence; do not reopen or delete them. Replace vague work with additive, clearly linked issues and update #5 to a parent/program tracker.
  Rationale: historical evidence remains useful, while reopening/rewriting completed records would obscure what was actually observed.
  Date/Author: 2026-10-01 / Astra design review
- Decision: Use strict serial delivery until #12 proves a safe single-worker baseline. Concurrency (#24) is a separate post-baseline program.
  Rationale: isolated-worktree, claim, and recovery evidence is missing; parallel work would recreate the current ambiguity.
  Date/Author: 2026-10-01 / Astra design review

## Outcomes & Retrospective

The target queue is defined below. No GitHub task records have been changed by this plan. Implementation begins only after this task graph is reviewed and applied.

## Context and Orientation

GitHub Issues are the task source of truth. `status:ready` means a directed user session may claim a scoped task; `symphony:ready` is a separate continuous-dispatch opt-in and must not be added during Set-up. `status:human-review` is an open verified handoff. A closed Issue is terminal even when a stale label remains. `WORKFLOW.md` keeps live dispatch false. The active code is under `src/app_template/symphony/`, and the current parent plan is `.agent/execplans/2026-09-30-implement-symphony-service.md`.

## Plan of Work

### Milestone 1: stabilize the record of work

Update #5 so it becomes a program tracker only: purpose, child graph, current safe default, and parent acceptance handoff. Do not use it for implementation. Preserve #6, #7, #20, and #22 as completed evidence, but add one factual note where a closed Issue has a stale label. Re-scope #8 to the first executable host-broker packet; do not retain unrelated dashboard, worktree, or concurrency requirements in it.

Observable result: no live issue has both parent-program and implementation responsibilities, and each active status agrees with the canonical GitHub open/closed state.

### Milestone 2: create the small implementation packets

Create the following issues under parent #5, each with an explicit `## Code packets`, `## Dependencies`, `## Non-goals`, `## Acceptance criteria`, `## Verification`, and authority boundary. Use `status:ready` only when all predecessors are human-reviewed or closed, and do not add `symphony:ready`.


| ID / title | Depends on | Code packets | Complete when |
| --- | --- | --- | --- |
| S1 — Host execution broker and safe preflight | #22 | `runner.py`, `service.py`, `cli.py`, focused runner/service tests | Container dashboard construction cannot instantiate Codex/GitHub adapters; host broker preflight and bounded initialize-only probe pass; child environment strips tokens. |
| S2 — Real Git worktree lifecycle | S1 | `workspaces.py`, `workflow.py`, workspace tests, runbook | One Issue creates an isolated worktree/branch; cwd is proven; cleanup/recovery is scoped and repeatable. |
| S3 — Terra run classification and Astra review handoff | S1, S2 | `runner.py`, `scheduler.py`, domain types, runner/scheduler tests | Two task-local Terra failures produce an immutable Astra review snapshot then Terra repair/resume; approval/cancel/environment failures are bounded and classified. |
| S4 — Fresh GitHub observation and reconciliation | S1 | `tracker.py`, `scheduler.py`, `service.py`, tests | Every claim/blocked/review decision has a timestamped live observation; read failure is `unknown`; stale closed labels are terminal. Reuse #20 evidence only after coverage review. |
| S5 — Durable operations event model | S2, S3, S4 | `service.py`, event tests, migration notes | Persist claims, reservations, observations, worker stop, reviewed revision, admission decision, and sanitized errors across restart. |
| S6 — Read-only operator dashboard | S5 | `dashboard/service.py`, dashboard tests, operator guide | Loopback dashboard reads durable evidence and pause/resume request state; it contains no Codex/GitHub credentials or execution path. |
| S7 — Safe single-worker end-to-end demonstration | S1–S6 | `tests/`, `scripts/`, verification matrix | Dedicated test Issue only; clean start, restart, dashboard, GitHub read/write, and no-unrelated-dispatch proof pass with live dispatch false afterward. |
| S8 — Operator and delivery documentation | S7 | `docs/guides/`, `docs/harness/`, `docs/quality/` | Guides match proven behavior, commands, limits, recovery, and issue workflow; links pass. |
| S9 — Controlled concurrency safety gates | S7, S8 | scheduler/workspaces/tracker/event/dashboard packets | #24’s eight gates pass before any second Terra slot can be configured or admitted. |
| S10 — Operator board categorisation | S8 | GitHub labels, issue metadata, operator guide | Apply the reviewed `status`/`kind`/`area`/`gate` taxonomy to open tasks; remove stale workflow labels from closed issues; publish a one-page operator legend. |

### Milestone 3: retire overlap and use a simple dependency order

After reviewing the new task bodies, change #8 to S1 scope or replace it with S1 and mark #8 superseded with a link. Re-scope #10 as S6, #12 as S7, #13 as S8, and #24 as S9; #16 becomes an independent documentation-policy task after S8 or is folded into S8 only if its acceptance criteria are preserved verbatim. Do not treat status labels in closed Issues as current blockers. Every replacement issue references its predecessor by native GitHub dependency, not only body prose.

Observable result: the executable order is `S1 → S2/S4 → S3 → S5 → S6 → S7 → S8 → S9`, with S10 performed afterward as non-blocking board hygiene, with S2 and S4 allowed in parallel only after S1 is human-reviewed and code packets do not overlap.

### Milestone 4: execute and evidence

For each packet, create the required SPEC/ExecPlan tier before code, claim only one ready Issue, commit a separable change, run its focused tests and relevant canonical verifier, record date/command/result/limits in the artifact and Issue, then move it to human review. The next issue is not made ready merely because code exists; it becomes ready after its predecessor evidence has been reviewed or its native dependency is terminal and accepted.

## Concrete Steps

All commands run from `/home/chris/template`.

1. Re-read `pyproject.toml` target and `git remote get-url origin`; run `gh issue list --repo successbycs/template --state all` before every planning write. Expected: target values agree.
2. Draft every replacement Issue body locally from the task schema above; review for one outcome, code packets, non-goals, acceptance, exact verification, dependencies, and no authority expansion. Expected: no broad “implement Symphony” language.
3. After plan approval, apply GitHub issue edits/creates with explicit `--repo successbycs/template`; re-read each result. Expected: no existing historical evidence is deleted, closed, or relabeled as active.
4. For every implementation packet, run only its exact focused tests before the canonical `docker compose run --rm app uv run python scripts/verify.py`. Expected: durable pass/failure evidence before the status handoff.

## Validation and Acceptance

This task-graph rebuild is accepted when: #5 is a parent-only tracker; each executable issue has one observable outcome and non-overlapping code packets; every dependency is native and current; the board exposes one safe next task; #24 is excluded from the single-worker baseline; the issue bodies name exact proof commands; and no issue is marked complete from a plan, label, or remembered status alone. Review the graph against the table above and run Markdown link validation after documentation edits.

## Idempotence and Recovery

Read-only inventory and local drafts are repeatable. Before an Issue write, re-read its canonical GitHub state. If an existing Issue already matches one target packet, re-scope it rather than create a duplicate. If a proposed dependency is uncertain, leave the child backlog/unlabelled and record the question rather than marking it ready. Never delete an Issue; preserve history with a “superseded by” comment/link when replacement is needed. Rollback means restoring a prior body/label from the recorded before-state, not reopening closed evidence tasks.

## Artifacts and Notes

- Live inventory date: 2026-10-01. #5 is open/in-progress; #8 is open/in-progress; #10/#12/#13/#16 are ready but have unmet body dependencies; #20 and #22 are closed; #24 is blocked.
- Mandatory global invariant: `runtime.live_dispatch` remains false. No task creation authorizes external mail, push, merge, deployment, or unattended dispatch.

## Interfaces and Dependencies

The rebuild changes GitHub task records and parent planning documents, not runtime APIs. New implementation Issues may later define `HostExecutionBroker`, worktree lifecycle, observation envelopes, reconciliation decisions, durable event schemas, and dashboard read models. Each must name exact module signatures in its own SPEC/ExecPlan before implementation. GitHub CLI authentication is required only for task-record writes; no credentials are stored in issue text or repository files.

## Applied graph (2026-10-01)

- Parent #5 is now a programme tracker with no active worker label.
- S1 is #8, Host execution broker and safe preflight (active).
- S2 is #25, Create isolated Git worktree lifecycle for Symphony tasks (backlog).
- S3 is #26, Classify Terra failures and hand off Astra reviews (backlog).
- S4 is #27, Require fresh GitHub observations before Symphony decisions (backlog).
- S5 is #28, Persist Symphony operational evidence for safe recovery (backlog).
- S6 remains #10; S7 remains #12; S8 remains #13; #16 remains independent delivery-policy work; S9 remains #24.
- Operator categorisation is deferred as S10 until delivery graph work is stable. New category label definitions exist, but no Issue has been reclassified with them.

## Rebuild evidence

- 2026-10-01 04:15Z: live GitHub records #5, #8, #10, #12, #13, and #24 were re-read before scope updates. #5 became parent-only; #8 was narrowed to S1; dependent ready/blocked labels were removed from #10/#12/#13/#24; #25–#28 were created unlabelled as backlog. No closed Issue was reopened, deleted, or relabelled.
