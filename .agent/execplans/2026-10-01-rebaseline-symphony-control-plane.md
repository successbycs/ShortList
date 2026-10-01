# Re-baseline the Symphony control-plane design

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Design task:** [GitHub Issue #22](https://github.com/successbycs/template/issues/22)
**Authority:** design and read-only review only. This plan does not authorize
application, runtime, configuration, GitHub task-state, deployment, or secret
changes.

## Purpose / Big Picture

The repository is intended to preserve the supplied Symphony design: GitHub is
the source of truth, Terra is the normal implementation worker, Astra performs
architecture/diagnosis/review after two evidenced Terra failures, and an
operator can see and control safe autonomous throughput. The current work has
useful foundations but does not yet prove the complete control plane. In
particular, fresh state observation and active blocker reconciliation are not
implemented.

This design review will produce a human-approvable, evidence-backed blueprint
before any additional Symphony implementation starts. A reviewer will be able
to see exactly which specification capabilities exist, which are incomplete,
the correct host/container authority boundary, the required state machine, the
revised Issue dependency graph, and the tests that must prove safe activation.

## Progress

- [x] (2026-10-01 00:00Z) Create Issue #22 as a design-only Set-up subtask with `agent:astra` and no implementation authority.
- [x] (2026-10-01 00:00Z) Create this living ExecPlan and link it to Issue #22.
- [x] (2026-10-01 03:45Z) Collected read-only evidence from current source, workflow, parent plan, live Issue states, dependencies, and handoffs.
- [x] (2026-10-01 03:45Z) Produced the requirement compliance matrix, identified contradictions, and assigned corrective delivery ownership.
- [x] (2026-10-01 03:45Z) Defined the target control plane, state machine, authority boundaries, and failure/recovery path.
- [x] (2026-10-01 03:45Z) Proposed corrected Issue ordering, code packets, and validation evidence; pending human approval only.

## Surprises & Discoveries

- Observation: `Scheduler.reconcile()` currently checks only queued or retry
  records and can cancel them if GitHub changes; it does not re-evaluate a
  blocked record, live-check dependencies, or return a resolved task to ready.
  Evidence: `src/app_template/symphony/scheduler.py`.
- Observation: `WORKFLOW.md` requires both `status:ready` and
  `symphony:ready` for continuous dispatch, while the user-started GitHub Issue
  workflow selects a scoped `status:ready` task. The target design must make
  this directed-versus-continuous distinction explicit and testable.
  Evidence: `WORKFLOW.md`; `docs/harness/GITHUB_ISSUE_WORKFLOW.md`.

## Decision Log

- Decision: Treat the supplied Symphony specification as the gold standard,
  rather than extending the current partial implementation incrementally.
  Rationale: The user explicitly requested Symphony wholesale behavior and the
  current partial implementation has central control-plane gaps.
  Date/Author: 2026-10-01 / operator direction
- Decision: This task is design-only and uses the Astra role.
  Rationale: The agreed operating model reserves Astra for design, diagnosis,
  ExecPlans, and review; Terra remains the implementation worker.
  Date/Author: 2026-10-01 / operator direction

## Outcomes & Retrospective

Completed design review. The plan below now supplies an implementation-ready control-plane architecture and corrected Issue order. It remains design evidence only: no runtime code, configuration, dispatch, or implementation-Issue state was changed. Completion means a reviewed architecture/implementation design and
corrected delivery graph exist. It does not mean any Symphony code has changed
or continuous dispatch has been enabled.

## Context and Orientation

The relevant parent is GitHub Issue #5, whose existing broad implementation
plan is `.agent/execplans/2026-09-30-implement-symphony-service.md`. The
current code lives in `src/app_template/symphony/`: `workflow.py` loads
`WORKFLOW.md`; `tracker.py` represents GitHub access; `scheduler.py` manages
candidate selection/retries; `runner.py` invokes Codex; and `service.py`
composes the runtime, SQLite event store, and dashboard. Focused tests are in
`tests/unit/symphony/`.

The present task graph contains an uncertified runner boundary (#8), dashboard
and durable-event work (#10), safe activation verification (#12), operator
guidance (#13), lightweight SDD policy (#16), optional email notification work
(#19), and fresh-state evidence (#20). Issue #20 follows an observed stale
status error: Issue #11 was closed but still carried an old
`status:human-review` label. The target design must treat live Issue state as
authoritative over a stale label or remembered chat state.

The design must retain safe defaults. `live_dispatch` is off until a dedicated
safe demonstration succeeds. Reading GitHub, changing GitHub Issue state,
dispatching Codex, sending notifications, and exposing an operator dashboard
are distinct capabilities with distinct authority and proof requirements.

## Plan of Work

### Milestone 1: establish the factual baseline

Read the original Symphony specification and existing parent ExecPlan in full.
Inspect the current source, workflow contract, tests, and live GitHub Issue
graph. Capture a compliance matrix for each required capability: intended
behavior, current code/evidence, gap, issue owner, and proof needed.

Observable result: a reviewer can identify incomplete work without relying on
remembered Issue comments or vague labels.

### Milestone 2: design the control plane

Specify a state machine with these distinct concepts: GitHub observation
(`fresh`, `unknown`, or stale/unusable), task lifecycle (backlog, ready,
in-progress, human review, blocked, terminal), and worker lifecycle. Define
the exact rule that a task-state claim is valid only after a fresh, timestamped
tracker observation. Define whether an Issue can re-enter ready, what writes
are allowed in a directed session versus a live service, and how native GitHub
dependencies are resolved.

Design the blocker-reconciliation loop. A dependency change or re-check trigger
must live-observe the task and every dependency, run the declared safe check,
then either return the task to ready, route a technical repair through
Terra/Astra/Terra, or surface one precise human/external action. A GitHub read
failure must produce `unknown`, not a fabricated blocked/waiting state.

Observable result: an unambiguous design shows how #8 and any later block are
actively reconciled without unsafe dispatch.

### Milestone 3: design interfaces, evidence, and delivery graph

Name proposed data types and interfaces—not implementation details: tracker
observations, dependency observations, scheduler reconciliation decisions,
event-store schemas, dashboard views, and workflow configuration. Define how
host-side Codex/GitHub authority relates to the containerized dashboard and
persistence process. Define preflight, clean-start, persistence, failure,
recovery, and end-to-end proof scenarios.

Correct the Issue graph and code packets: #8 must be certified before shared
runner/scheduler changes; #20 must provide fresh observation before blocker
reconciliation; dashboard/event work must expose durable evidence; #12 must
prove the final safe path. Split only genuinely separate work packages.

Observable result: Terra can implement against approved artifacts without
inventing architecture decisions, and an operator can inspect proof.

### Milestone 4: review handoff

Update this plan with the completed design, matrix, proposed Issue edits, and
validation mapping. Post a concise Issue #22 handoff for human review. Do not
change implementation Issue states, push, merge, deploy, or implement the
proposed design.

## Concrete Steps

All commands are read-only and run from `/home/chris/template`.

1. Inspect existing plans/source:
   `sed -n '1,400p' .agent/execplans/2026-09-30-implement-symphony-service.md`
   and `rg -n "class |def |reconcile|eligible|blocked|human_review" src/app_template/symphony tests/unit/symphony`.
2. Inspect policy:
   `sed -n '1,260p' WORKFLOW.md`, `sed -n '1,260p'
   docs/harness/GITHUB_ISSUE_WORKFLOW.md`, and `sed -n '1,260p'
   docs/harness/DEFINITION_OF_DONE.md`.
3. Read live Issue state and native relationships with explicit
   `gh --repo successbycs/template` reads. Do not infer current state from
   Issue-body prose.
4. Produce the matrix/design in this plan. Validate Markdown links with
   `python3 scripts/check_markdown_links.py` if available; otherwise record
   that the container verifier is required.

Actual command results are pending the Astra design review.

## Validation and Acceptance
The design is accepted only if a human reviewer can answer from this plan:

- Which original Symphony requirements are satisfied, partial, missing, or
  deliberately deferred, with evidence for each?
- What is the source of truth and refresh rule for task state/dependencies?
- How does a blocked task re-enter ready or escalate, and what prevents stale
  GitHub data from producing a false status?
- Which actions are read-only, which write GitHub state, and which require
  explicit `live_dispatch` enablement?
- Where does Codex run, where do credentials remain, and how is the dashboard
  safely exposed?
- Which Issue/code-packet order and tests prove the design before dispatch?

This task must not run implementation tests as a claim of code completion,
mutate application files, enable dispatch, or send external requests beyond
read-only GitHub inspection.

## Idempotence and Recovery

Read-only inspection and plan updates can be repeated. If the live GitHub API
cannot be read, record state as unknown and stop design claims that depend on
it; do not change Issue states. If the reviewer rejects the design, keep #22
open, record the rejection/revised decision in this plan, and do not implement.

## Artifacts and Notes

- Parent implementation plan: `.agent/execplans/2026-09-30-implement-symphony-service.md`.
- Freshness-control task: GitHub Issue #20.
- This plan is design work only, not implementation proof for #5 or children.

## Interfaces and Dependencies

The design must define, but not implement, these interfaces:

- `Tracker.observe_issue(issue_id) -> TaskObservation`, including GitHub source
  time, canonical Issue state, labels, and read failure classification.
- `Tracker.observe_dependencies(issue) -> tuple[DependencyObservation, ...]`,
  sourced from GitHub-native relationships rather than prose parsing.
- `Scheduler.reconcile_blocked(...) -> ReconciliationDecision`, read-only until
  an explicitly allowed state transition is applied.
- `EventStore.record_observation(...)` and `record_reconciliation(...)`, with
  durable sanitized data for dashboard and handoff.
- `WorkflowConfig` settings separating read-only reconciliation, GitHub state
  writes, and live worker dispatch.

No interface is implemented by this design task.

## Completed control-plane design

### Compliance matrix

| Capability | Current evidence | Design decision and owner | Required proof |
| --- | --- | --- | --- |
| GitHub source of truth and fresh observations | Partial: `GitHubTracker` lists/gets Issues, but scheduler reconciles only queued/retry records. | #20/#7: persist timestamped observation envelopes; unknown read failures block writes; re-read immediately before claim/transition. | Fake stale/read-failure/restart tests plus a read-only GitHub discovery record. |
| Single claim and ownership | Partial: `tracker.claim` exists, but no durable cross-process claim lease or competing directed-session check. | #24: GitHub status transition plus durable claim token/lease; directed session and service use one compare-and-recheck protocol. | Competing-session and dispatcher-restart duplicate-claim tests. |
| Isolated workspaces and resource conflicts | Partial: task workspace and path overlap exist; shared config/locks/ports/volumes/contracts are not reserved. | #24: typed resource reservations, worktree/branch lifecycle, and exclusive integration lane. | Real-worktree cwd, collision, cleanup, and integration serialization tests. |
| Terra/Astra routing | Partial: scheduler attempts Terra twice then Astra then Terra, but does not classify environment-wide failures or retain review snapshots. | #8: normalize evidence-bearing failures; only two task-local Terra failures escalate; Astra reviews a named immutable commit/snapshot; environment/auth failures use backoff. | Fake runner protocol, two-failure, approval, cancellation, and snapshot-staleness tests. |
| Host/container boundary | Contradicted: service creates `CodexAppServerRunner` in the container, yet preflight documents host `codex`/`gh`; container verification shows `codex: not found`. | #8: host execution broker owns `codex`, `gh`, auth, worktrees, and GitHub writes. Container owns only loopback dashboard and SQLite/event display; it receives sanitized broker events/API data. | Host preflight, child credential-sanitization, host cwd/worktree proof, and container dashboard smoke test. |
| Blocker reconciliation | Missing for blocked/human-review records; `reconcile()` ignores them. | #20 then #8: observe task/dependencies afresh, classify unknown/external/task-local blocker, and re-enter ready only after explicit reconciliation. | Dependency-close, stale-label, unknown-read, and restart-recovery tests. |
| Durable events/dashboard | Partial: SQLite events/dashboard exist but omit observations, claims, reservations, queue age, stop confirmation, reviewed revision, and admission decisions. | #10: schema migration/versioning and operator views for those fields; dashboard controls request broker actions, never bypass policy. | Persistence/reopen/API/browser tests with disabled dispatch. |
| Safe activation | Missing: live dispatch remains false and no dedicated Issue proof exists. | #12 after #8/#10: dedicated test Issue only, all guards pass, then explicit human enablement. | Clean-start, end-to-end, no-unrelated-dispatch, and verification-matrix evidence. |

### Authoritative state machine

Each task carries an observation freshness state (`fresh`, `unknown`, `stale`) separate from its lifecycle (`backlog`, `ready`, `claimed`, `running`, `retry-queued`, `escalating`, `human-review`, `blocked`, `closed/cancelled`). A claim is valid only after a fresh task and dependency observation and an immediate compare-and-transition. A failed read is `unknown`; it is never inferred as ready, blocked, or closed.

A blocked reconciliation obtains fresh task/dependency observations and a bounded safe check. Resolved dependencies return a task to `ready` only by an explicit authorized transition; task-local failures retain reservations through Astra diagnosis and Terra repair; host/provider-wide failure stops compatible admission and retries after backoff; human/external approval remains blocked with a single action request. A worker capacity slot releases only after process stop confirmation. Claims and reservations persist until reconciliation explicitly releases them.

Directed sessions may make one user-authorized claim and transition after the fresh re-check; they never enable continuous dispatch. The continuous service may read while disabled, but may claim/execute only when `live_dispatch`, `status:ready`, `symphony:ready`, configured repository scope, artifacts, admission limits, and all safety gates are true.

### Corrected delivery graph

1. Complete and approve this design (#22). 2. Implement fresh observations/reconciliation (#20) and correct #8 to the host-broker boundary; do not put Codex credentials in the container. 3. Complete #8 runner certification. 4. Implement #10 dashboard/event schema against the resulting observation model. 5. Publish #13 operator guidance, then #16 SDD policy. 6. Run #12 only against a dedicated safe Issue. 7. Implement #24 concurrency only after the #12 baseline and every stated concurrency gate pass. #19 remains independent but cannot send mail without separate credential/enablement authority.

### Migration, rollback, and review gates

Keep `live_dispatch: false` throughout migration. Add schema versions and additive event tables; retain prior events and migrate/rebuild only from validated local data. A broker failure must stop admission rather than cause a container fallback. Rollback is disabling the broker/dispatch and retaining observations for diagnosis; do not delete worktrees or event records until ownership is reconciled. Human approval of this plan is required before changing #8/#10/#12/#13/#16/#20/#24 implementation state or code.

## Final evidence

- 2026-10-01 03:45Z: read-only inspection of `scheduler.py`, `service.py`, `WORKFLOW.md`, focused tests, parent ExecPlan, and live Issues #5, #8, #10, #12, #13, #16, #22, #23, and #24 completed. The Dev Container reported `codex: not found`; `docker compose run --rm app uv run python scripts/check_markdown_links.py` reported `Markdown links: passed`.
