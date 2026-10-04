# Symphony coordinator and dashboard

**Status:** proposed product contract | **Owner:** operator | **Implementation:** not started

## Outcome

Symphony safely allocates explicitly authorized GitHub Issues to one isolated
Codex code worker at a time. A loopback dashboard shows the same durable
coordinator state: eligibility, worker ownership, verification, recovery,
capacity, and bounded history.

## Non-goals

- The dashboard does not start workers, claim Issues, mutate GitHub, change
  labels, send email, push, merge, deploy, or approve work.
- A completed Codex turn is not evidence of completed implementation.
- General dispatch remains disabled until its separate qualification and
  human-review gate passes.

## Coordinator contract

One coordinator owns one repository and state directory. It atomically stores
coordinator identity, run, attempt, worker, Issue snapshot, authorization,
approved base revision, worktree, packet locks, capacity, heartbeat, stop
state, verification evidence, and lifecycle transitions. A second coordinator
against the same state directory must refuse to start.

Each admitted Issue has a task envelope containing its identifier, title, body,
acceptance criteria, dependencies, code packets, linked spec/ExecPlan,
authority limits, verification commands, and approved base revision. The worker
receives that envelope and cannot allocate other work or widen authority.

Before admission, the coordinator freshly checks Issue state, authorization,
dependencies, required planning artifacts, normalized scope, capacity, and
packet locks. No label mutation is required for user-directed sessions.
Effective capacity is exactly one. Configuration must reject any value greater
than one rather than silently admitting parallel work.

The lifecycle is `queued → admitted → preparing → running → verifying →
awaiting review`, with `blocked`, `stopping`, `stopped`, `failed`, and
`recovery required` states. A completed turn advances only to verification.
Before review, record the result revision/diff, reject out-of-scope change, run
declared checks, and persist the outcomes. A lost heartbeat is recovery-required
and never frees capacity or proves a worker stopped.

## Single-worker allocation

Only one work item may be admitted or run at a time. A second eligible Issue
remains queued until the active worker reaches a terminal coordinator state and
its reservation is released. Scope checks and durable reservations still apply:
they prevent accidental duplicate execution and make restart recovery safe,
not parallel allocation. Resource pressure, provider limits, stale state, or
uncertain worker status suspend admission.

Stopping a worker means its process is confirmed gone. The runner needs
configured timeouts, bounded output handling, a minimal credential environment,
classified failures, a bounded termination escalation, and recovery records.
External GitHub and notification handoffs must be idempotent.

## Dashboard

The dashboard is loopback-only and reads coordinator state. It displays
coordinator health/mode/last observation, configured and effective capacity,
Issue → run → worker → worktree mapping, lifecycle/progress/block reasons,
revisions and verification outcomes, reservations/packet locks/recovery state,
and bounded newest-first history. It must show explicit empty and stale-data
states and hide credentials, prompts, transcripts, email bodies, and arbitrary
event payloads.

## Acceptance scenarios

1. A real small code-changing Issue is selected, admitted, run in an isolated
   worktree, verified using its declared checks, and handed to review with
   revision evidence. A bare completed turn cannot pass it.
2. Restarting at every lifecycle boundary preserves ownership and reservations;
   duplicate work is refused and uncertain work becomes recovery-required.
3. With two eligible Issues, only one is admitted. The second stays queued
   through worker execution, verification, and recovery until the first run is
   terminal and its reservation is released.
4. The dashboard shows disabled, empty, active, blocked, stopped, restart, and
   history states without mutating any worker, SQLite data, or GitHub Issue.

## Verification

First prove real coordinator allocation of one code-changing Issue. Then prove
restart/recovery, verification failure, scope rejection, duplicate coordinator
and claim prevention, stop confirmation, and credential redaction. Qualify two
allocation through conflict, duplicate-claim, stop, recovery,
failure-injection, and canonical-verifier gates. Finally exercise the dashboard
through real loopback HTTP/browser requests across run,
block, stop, restart, history, and empty states. Record results in the linked
ExecPlan, Issue, and verification matrix.

## Delivery sequence

This specification changes requirements only. It does not reopen closed #10,
restore UI code, enable dispatch, or authorize a worker. A governed delivery
Issue must reconcile the no-label session contract and implement coordinator
safety before dashboard work. Parallel worker allocation is deliberately out of
scope.
