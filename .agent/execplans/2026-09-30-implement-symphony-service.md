# Implement the GitHub-first Symphony orchestration service

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Implement the supplied Symphony Service Specification as a working, GitHub-first
builder service in this repository. The service will continuously reconcile
GitHub Issues, reserve independent code packets, execute eligible work through
Codex with Astra preferred and Terra fallback, recover from failures, and give a
human operator a live dashboard with run, token, rate-limit, retry, escalation,
and workspace visibility.

GitHub Issue #5 is the canonical task record. `WORKFLOW.md` is the repository
contract for runtime policy; GitHub remains authoritative for task state. Terra
is the default implementation runner. Astra is reserved for a blocked/failing
task's diagnosis, ExecPlan, and review. The service must not silently act on
existing repository Issues during testing: live dispatch is opt-in and the
default workflow label is a dedicated service label.

## Progress

- [x] (2026-09-30) Read the complete supplied Symphony Service Specification and
  confirmed its scheduler/service model supersedes the earlier manual-only
  workflow.
- [x] (2026-09-30) Verified installed `codex-cli 0.154.0` exposes experimental
  app-server schema generation; generated schema shows model, thread/turn,
  approval, rate-limit, and dynamic-tool protocol surfaces.
- [x] (2026-09-30) Verified GitHub queue, created eligible GitHub Issue #5, and
  recorded its scope and safety boundary.
- [ ] (2026-09-30) Define and validate `WORKFLOW.md`, typed service settings,
  GitHub adapter, normalized Issue model, code-packet rules, and durable local
  run record.
- [ ] (2026-09-30) Implement scheduler, workspace manager, Codex app-server
  runner, Astra/Terra routing, retry/escalation/resume state machine, and
  host-side GitHub tools.
- [ ] (2026-09-30) Implement required dashboard/API and test suite, then run a
  safe GitHub read-only integration demonstration and container verification.
- [x] (2026-10-01) Added a disabled-by-default local runtime profile and
  loopback dashboard health proof. Restart/persistence and host dispatch
  prerequisites remain before Issue #11 can enter human review.
- [x] (2026-10-01) Proved local SQLite event-store reopen behavior, host Codex
  and GitHub CLI prerequisites, disabled-dispatch preflight, and loopback
  runtime health. Issue #11 is ready for human review.
- [x] (2026-10-01) Repaired the app-server runner's initialization sequencing,
  schema-shaped thread ID extraction, and assigned-workspace binding; focused
  runner tests now prove the child process and both protocol requests use the
  validated issue workspace.

## Surprises & Discoveries

- Observation: the installed app-server is experimental and its protocol schema
  is version-dependent.
  Evidence: `codex app-server --help` and `generate-json-schema` under Codex CLI
  0.154.0; the runner must validate against this installed schema rather than
  hard-code undocumented message shapes.
- Observation: no existing ready Issue implements the service; Issues #1–#4 are
  human-review or genuinely blocked.
  Evidence: live `gh issue list` before Issue #5 creation.
- Observation: a container dashboard must bind beyond its internal loopback to
  be reached through a published Docker port.
  Evidence: host health probes succeeded only after binding Uvicorn to container
  `0.0.0.0` while Compose published only `127.0.0.1:8765`.
- Observation: the original runner sent `thread/start` before receiving the
  required `initialize` response, expected a legacy top-level `threadId` rather
  than the installed schema's `result.thread.id`, and never used its `workspace`
  parameter.
  Evidence: `codex app-server generate-json-schema --out /tmp/codex-app-server-schema`
  on 2026-10-01; `ThreadStartResponse` requires a nested `thread`, while
  `ThreadStartParams` and `TurnStartParams` each accept `cwd`.
- Observation: the focused container test initially exposed a test-only field
  typo (`RunResult.succeeded`, not `success`); no production failure occurred.
  Evidence: Docker `pytest tests/unit/symphony/test_runner.py` reported the
  exact `AttributeError`, then the assertion was corrected before rerun.
- Observation: with `approvalPolicy: on-request`, an app-server approval
  callback previously had no response path and therefore could wait until the
  runner's one-hour timeout.
  Evidence: the installed schema exposes `item/commandExecution/requestApproval`
  and file-change approval requests; the runner now returns a bounded,
  operator-actionable failure instead of auto-approving or hanging.

## Decision Log

- Decision: Implement Symphony wholesale as a GitHub-first profile, not a
  manual policy layer.
  Rationale: the builder requires autonomous throughput, bounded concurrency,
  dashboard visibility, retries, and reconciliation.
  Date/Author: 2026-09-30 / user and Codex
- Decision: Use Terra for normal implementation; use Astra only for failure
  diagnosis, ExecPlan design, and review.
  Rationale: user instruction. Astra's higher-capability reasoning is reserved
  for the point where a normal Terra implementation path needs intervention.
  Date/Author: 2026-09-30 / user and Codex
- Decision: Keep live dispatch disabled by workflow default until the service
  passes fake-adapter tests and an explicit safe GitHub integration check.
  Rationale: GitHub is authoritative, so a malformed scheduler must not consume
  unrelated ready work while the implementation is being validated.
  Date/Author: 2026-09-30 / Codex

## Outcomes & Retrospective

The local runtime can now be started through the explicit `symphony` Compose
profile with a loopback-only dashboard and disabled dispatch. It provides a
credential-safe preflight, persists local event evidence across EventStore
instances, and was validated in Docker and from the host. Actual task dispatch
remains disabled pending the separate execution integration and end-to-end
demonstration work.

## Context and Orientation

The current baseline is a generic Python package under `src/app_template/`,
with Docker Compose, typed Pydantic configuration, SQLite audit support, Ruff,
pytest, and a local GitHub Issue workflow. `pyproject.toml` sets the active
GitHub target. The supplied 2,311-line Symphony specification is the required
behavioral baseline; its generic adapter boundaries are implemented initially
as a GitHub adapter.

The service will add a package namespace such as `app_template.symphony`.
`WORKFLOW.md` will be a repository-owned YAML-front-matter plus Markdown-prompt
contract. It will define tracker scope/labels, polling, workspace root/hooks,
code-packet rules, agent routing and limits, runtime safety, and dashboard
binding. Runtime data belongs under ignored `var/symphony/`; no credential is
written to the repository or passed through issue text.

GitHub Issue labels are external task state. Scheduler claim/running/retry state
is internal and persisted as concise local run events/metadata for restart
reconciliation. Terra handles normal implementation. After two
evidence-bearing failures, Astra creates/reviews an ExecPlan and Terra performs
the repair before the original task resumes. Detailed execution context stays in
workspace metadata and local events; GitHub comments are milestone summaries
only.

## Plan of Work

### Milestone 1: Repository contract and domain core

Add `WORKFLOW.md` with a safe default that targets a dedicated label, disabled
live dispatch, single-worker concurrency, workspace root, retry thresholds, and
dashboard settings. Build a strict typed parser with explicit environment
indirection only for declared settings. Add normalized Issue, code-packet,
workspace, run-attempt, session-metrics, retry, and escalation types.

Implement a GitHub adapter around explicit `gh --repo` commands. It will list
candidate Issues, fetch individual current state, normalize labels/dependencies,
and perform guarded status/comment writes. Test it with a fake command transport
and fixture payloads; no test requires a real credential.

### Milestone 2: Scheduler and workspaces

Implement the one-authority scheduler tick: reload workflow, reconcile running
work, discover GitHub candidates, sort by priority, reserve non-overlapping code
packets, and dispatch to available slots. The workspace manager creates stable,
sanitized per-Issue directories under the configured root, validates containment,
runs configured hooks with timeout, and retains successful workspaces.

Persist minimal events and run metadata in the existing SQLite-capable local
runtime area. On restart, rebuild active context from GitHub plus workspace/run
metadata; it must not need verbose GitHub comments or a durable scheduler DB.

### Milestone 3: Codex runner and escalation

Implement an app-server client behind a runner interface. The production runner
starts `codex app-server` inside the validated workspace, uses the installed
schema/version as the protocol source, discovers models, and requests Terra for
normal implementation. It captures session/thread/turn IDs, streamed events,
token counts, and rate-limit notifications without logging secrets.

On two failed evidence-bearing Terra attempts, transition to an internal
escalation: Astra writes and reviews an ExecPlan with observed failure evidence
and repair acceptance criteria. Terra executes that repair plan in the linked
workspace, records verification, and returns control to the original task's
continuation. User input/approval events surface to the dashboard and cannot
stall indefinitely.

### Milestone 4: Operator dashboard and safe demonstration

Add a required local dashboard/API showing queue, claimed/running/retry states,
workspace/code packets, live session summaries, token/rate usage, errors,
escalations, and operator controls (pause, cancel, retry, escalate). It binds
only to loopback by default and has no public deployment configuration.

Add tests for parsing, workspace containment/hooks, overlap reservation,
priority and concurrency, retries/escalation, runner routing, GitHub adapter
normalization, dashboard snapshots, and restart reconciliation. Run Docker
verification. Finally run a read-only live GitHub discovery check against
`successbycs/template`; do not enable continuous dispatch or modify unrelated
Issues without a separate explicit operator action.

## Concrete Steps

From `/home/chris/template`:

    codex app-server generate-json-schema --out /tmp/codex-app-server-schema
    docker compose build
    docker compose run --rm app uv lock
    docker compose run --rm app uv sync --locked --group dev
    docker compose run --rm app uv run python scripts/verify.py
    docker compose run --rm app uv run app-template symphony validate-workflow
    docker compose run --rm app uv run app-template symphony dashboard --dry-run

The exact dashboard/start commands and expected test counts will be updated as
the implementation becomes concrete.

## Validation and Acceptance

Acceptance requires an inspectable `WORKFLOW.md`; strict invalid-config errors;
fake-adapter tests for selection, labels, dependencies, code-packet conflict,
retry/reconciliation, and bounded concurrency; runner tests proving Terra normal
implementation and two-failure Astra-ExecPlan/Terra-repair
continuation tests; workspace path/hook tests; dashboard API/snapshot tests;
token/rate accounting tests; and the complete locked container verification.

The live GitHub demonstration must be read-only until the dashboard exposes an
explicit enable action and the user authorizes testing on a dedicated Issue.
The service must never push, merge, close an Issue, deploy, or publish an image
as part of this task.

## Idempotence and Recovery

Workflow validation, dashboard snapshots, and dry-run scheduling are safe to
repeat. Workspaces are task-keyed and retained; cleanup operates only on a
validated path under the configured root. Restart reads GitHub and local run
metadata, releases stale claims, and keeps terminal workspace cleanup scoped to
the configured root. Failed hooks, app-server starts, or API reads produce an
observable run result and bounded retry, never an infinite tight loop.

## Artifacts and Notes

Runtime evidence on 2026-10-01: `docker compose --profile symphony config
--quiet` passed; workflow validation returned status ok; the safe preflight
reported `live_dispatch: false` and no in-container `codex` or `gh`; the full
verifier passed (30 tests); and the rebuilt profile returned
`{"status":"ok","live_dispatch":false}` at the host loopback health endpoint.
The named test service was stopped. No Issue was claimed. Host prerequisites and
restart/persistence remain unproven.

Persistence evidence on 2026-10-01: `test_event_store_persists_across_instances`
creates an event with one `EventStore` instance and reads it through a second
instance backed by the same SQLite file. Focused dashboard/event tests passed
(2 tests), and the full verifier passed with 31 tests. This proves local event
store reopen behavior; it does not prove a live dispatch restart.

Runner repair evidence on 2026-10-01: an app-server schema generated from the
installed Codex CLI showed the current initialization, nested thread response,
and workspace `cwd` contract. The focused runner suite passed (3 tests), the
complete Symphony unit suite passed (18 tests), and `uv run python
scripts/verify.py` passed in the Compose app container (Ruff lint/format, 36
tests, and Markdown links). The test simulates protocol responses rather than
starting a billable agent turn; live dispatch remains disabled.

Host prerequisite evidence on 2026-10-01: `command -v codex` resolved the
installed Codex CLI, `codex app-server --help` exited successfully, and `gh auth
status` exited successfully. Output was suppressed for the latter two commands
to avoid recording credentials or account detail. This did not start dispatch.

GitHub task: https://github.com/successbycs/template/issues/5. Current installed
Codex CLI: 0.154.0. Official OpenAI verification on 2026-09-30: Astra is the
preferred complex-work model; Terra is an available lower-cost fallback. The
app-server protocol is experimental and must be schema-validated at runtime.

## Interfaces and Dependencies

New production interfaces will include a workflow loader, GitHub adapter,
scheduler, workspace manager, runner protocol, durable event store, and local
dashboard. FastAPI/Uvicorn and a YAML parser are required baseline dependencies
because the dashboard and `WORKFLOW.md` contract are required. `gh` and `codex`
are host/runtime prerequisites; their credentials remain host-side and must not
be propagated to agent child environments.

## Current delivery status and parent-milestone evidence

The three unchecked parent milestones remain intentionally unchecked. They are completed only by the following child evidence, not by the presence of partial code:

- `WORKFLOW.md`, typed settings, tracker/domain/code-packet logic, and durable records: #6 and #7 are closed; #20 is closed but has a stale `status:blocked` label, so its live closed state is terminal and its acceptance evidence must be re-read before this parent milestone is checked.
- Host runner, isolated worktrees, Terra/Astra/Terra flow, retries, cancellation, structured results, and credential-safe GitHub tooling: #8 is in progress. The approved #22 design requires a host-side Codex/GitHub broker; the container remains dashboard/event-only. This parent milestone cannot be checked until #8 has focused tests and a bounded host proof.
- Dashboard/API, durable observation evidence, safe GitHub demonstration, and container verification: #10 must follow the #8 host boundary; #12 then proves clean start, persistence, dashboard behavior, dedicated-Issue GitHub behavior, and no unrelated dispatch. This parent milestone cannot be checked until #10 and #12 have durable evidence.

The intended order is #8 → validate #20 evidence → #10 → #13 → #16 → #12 → #24. #24 must not raise concurrency until every stated safety gate has passed. Live dispatch remains false throughout this sequence except for a separately approved dedicated-Issue demonstration.

### Parent acceptance handoff

Before moving #5 to `status:human-review`, append a dated evidence entry naming the child Issue, local commit/snapshot, exact command, observed result, and limitation for each unchecked parent milestone. The final handoff must show that GitHub state was freshly observed, child status labels agree with canonical open/closed state, and no normal ready Issue was dispatched during proof.
