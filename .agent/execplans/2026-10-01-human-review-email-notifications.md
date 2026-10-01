# Add safe human-review email notifications

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #19 adds an optional operator email when Symphony has completed a task and
places its GitHub Issue in human review. After this work, a template user can
configure SMTP through runtime environment variables, enable notifications
explicitly, and inspect durable delivery outcomes without exposing credentials
or making email availability part of task completion.

## Progress

- [x] (2026-10-01 00:00Z) Re-read Issue #19, repository target, current workflow, and Scheduler/EventStore seams; claimed the Issue and recorded the progress note.
- [x] (2026-10-01 00:00Z) Create the required short specification at `docs/specs/2026-10-01-human-review-email-notifications.md`.
- [x] (2026-10-01 00:00Z) Add typed disabled-by-default notification configuration and a safe SMTP notifier boundary.
- [x] (2026-10-01 00:00Z) Persist idempotent delivery results after human-review transitions, add dashboard exposure and focused fake-notifier tests.
- [x] (2026-10-01 00:00Z) Document operation, validate, record durable evidence, and prepare the Issue handoff for human review.
- [x] (2026-10-01 00:00Z) Review the proposed operational activation steps against the actual Compose, CLI, notification, and Issue #19 state.
- [ ] (2026-10-01 00:00Z) Implement the approved secret-injection boundary, one-shot receipt-test command, recovery semantics, documentation, and tests.
- [ ] (2026-10-01 00:00Z) After separate human authority and SMTP configuration, run exactly one receipt test and record human confirmation without recording secrets or message content.

## Surprises & Discoveries

- Observation: `Scheduler` currently calls `EventStore.append` during an
  attempt, before it changes a successful run to `HUMAN_REVIEW`.
  Evidence: `src/app_template/symphony/scheduler.py`, `_attempt` and `_execute`.
- Observation: The actual `WORKFLOW.md` requires both `status:ready` and
  `symphony:ready` only for the continuous service. This user-directed GitHub
  Issue session follows `docs/harness/GITHUB_ISSUE_WORKFLOW.md` and may claim a
  properly scoped `status:ready` Issue without enabling continuous dispatch.
  Evidence: `WORKFLOW.md`; `docs/harness/GITHUB_ISSUE_WORKFLOW.md`.
- Observation: After the initial human-review handoff, the repository owner
  moved Issue #19 back to `status:in-progress` and added the requirement that a
  human must check a received email before closure.
  Evidence: GitHub Issue #19 event history, 2026-09-30T21:18:36Z through
  2026-09-30T21:18:41Z; owner comment at 2026-09-30T21:09:54Z.
- Observation: The current `symphony` Compose service does not pass any SMTP
  credential environment variables, mount Docker secrets, or reference a
  secret file. A Git-ignored `.env.symphony` file would therefore not activate
  email by itself.
  Evidence: `compose.yaml`, `symphony.environment` and service definition,
  inspected on 2026-10-01.
- Observation: The current CLI has no one-shot notification-test command.
  Starting `symphony serve` does not prove email delivery because dispatch is
  off by default and the service container lacks the host Codex/GitHub runtime
  needed for full task execution.
  Evidence: `src/app_template/cli.py`; `WORKFLOW.md`; Issue #8 blocker record.
- Observation: A crashed process after `EventStore.claim_notification()` and
  before `complete_notification()` leaves an idempotency row in `pending` and
  currently prevents a later delivery for that same transition.
  Evidence: `src/app_template/symphony/service.py`, `claim_notification()` and
  `complete_notification()`.

## Decision Log

- Decision: Use the Python standard library `smtplib` behind a protocol and
  fake implementation rather than an email-provider dependency.
  Rationale: SMTP compatibility is required, the template must remain generic,
  and tests must not contact an external service.
  Date/Author: 2026-10-01 / Codex
- Decision: Persist a notification-delivery record keyed by Issue ID and a
  human-review transition timestamp.
  Rationale: This makes duplicate callback delivery idempotent while allowing a
  later, distinct transition to be notified.
  Date/Author: 2026-10-01 / Codex
- Decision: Do not activate email by merely changing `WORKFLOW.md` or turning
  on live dispatch.
  Rationale: The current Compose service cannot receive credentials, and live
  dispatch is unrelated to a controlled external-email test. Enabling either
  would create a misleading or unsafe partial activation.
  Date/Author: 2026-10-01 / Codex
- Decision: The approved implementation should use Docker Compose secrets
  sourced from explicitly provided host environment variables, with the
  notifier reading file paths rather than secret values from its process
  environment.
  Rationale: This keeps credential values out of `WORKFLOW.md`, repository
  files, normal container environment inspection, logs, and Compose command
  output. A compatibility proof on the target Docker Compose version is a
  mandatory first implementation milestone.
  Date/Author: 2026-10-01 / proposed design; requires implementation review

## Outcomes & Retrospective

Implemented an SMTP-compatible, disabled-by-default human-review notifier. It
is invoked only after Symphony records the Issue transition to human review,
uses a stable per-transition SQLite reservation to avoid duplicate delivery,
and stores `disabled`, `sent`, or sanitized `failed` results for the dashboard.
The sender reads all SMTP-sensitive values at runtime from named environment
variables and never logs them. No external email was sent.

The implementation-only acceptance evidence is complete, but Issue #19 is no
longer in human review. The owner added a new acceptance condition: a human
must confirm receipt of a real email before closure. That requires separately
authorized SMTP configuration and an external send; neither is authorized by
the original Issue boundary or this plan. The task therefore remains in
progress pending an explicit delivery configuration and human test procedure.

The work intentionally remains uncommitted because the working tree already
contains the larger parent Symphony implementation from Issue #5; creating a
partial commit would not be cleanly separable from that ongoing code packet.

## Context and Orientation

`WORKFLOW.md` is the repository-owned Symphony configuration. It is loaded and
validated by `src/app_template/symphony/workflow.py`. `Scheduler` in
`src/app_template/symphony/scheduler.py` changes successful runs to
`RunStatus.HUMAN_REVIEW` and updates the GitHub Issue. `SymphonyService` in
`src/app_template/symphony/service.py` composes the scheduler and an
SQLite-backed `EventStore`, whose rows are already visible from the local
dashboard API.

The new notification component will be a narrow boundary: a notifier returns a
sanitized outcome (`disabled`, `sent`, or `failed`) and never raises through the
completion path. SMTP credentials are read only from named environment
variables at send time. The default recipient is deliberately recorded in
`WORKFLOW.md` because Issue #19 requires it; a copied project must override it
before enabling delivery.

## Plan of Work

### Milestone 1: typed safe configuration and notification boundary

Extend `workflow.py` with nested notification models. The default state is
disabled and requires no SMTP values. Add `notifications.py` with a protocol,
a result type, an SMTP adapter, and a disabled adapter. Use TLS when configured
and avoid logging the subject/body/credentials.

Observable result: the workflow accepts a documented disabled configuration;
an enabled missing configuration produces a returned failure rather than a
configuration crash.

### Milestone 2: transition handling and durable outcome

Add a `Scheduler` callback that runs only after a human-review status
transition. Have `SymphonyService` call the notifier, catch all notification
errors, and write an idempotent row to `EventStore`. Expose recent notification
outcomes in `/api/status`.

Observable result: a fake notification is sent once per transition and a
failure remains visible without changing the Issue's `HUMAN_REVIEW` status.

### Milestone 3: documentation and evidence

Add the configuration/preflight/recovery procedure to
`docs/operations/LOCAL_RUNBOOK.md`, update the verification matrix if it
proves a template requirement, and add focused unit tests. Record actual
commands and results here before the Issue handoff.

### Milestone 4: complete the real activation boundary (pending approval)

The first implementation must prove that secret material can reach the
`symphony` service without becoming repository content or normal service
environment data. Add Compose secrets sourced from three explicitly exported
host variables, mounted as files under `/run/secrets/`. The Compose profile
must remain optional; normal `app` service startup and disabled notifications
must continue to work without a mail secret source.

Extend `EmailNotificationSettings` and `SmtpHumanReviewNotifier` with
file-environment names. The notifier must prefer a configured file path, read
and strip the file once for the send, and never return the path or value in
`NotificationResult`, logs, exceptions, dashboard data, or CLI output. The
existing direct-environment form may remain as a documented host-only fallback
only if security review accepts it; it must not be the Compose default.

Add `app-template symphony test-human-review-email` as a one-shot operation.
It must require an explicit acknowledgement flag such as
`--acknowledge-external-email`, use the configured recipient only (no recipient
CLI argument), require `enabled: true`, and create a dedicated synthetic
notification record marked as a test. It must not start the scheduler, call
GitHub, claim/change an Issue, enable `live_dispatch`, or use a real work-item
transition. Its stdout must contain only a safe test identifier and final
`sent`/`failed` state.

Repair delivery recovery semantics: a stale `pending` reservation needs a
bounded, visible recovery policy. Store `claimed_at`, allow a new attempt only
after a configurable short lease expires, and record the prior attempt as
`abandoned`. It must prevent simultaneous duplicate sends and never retry
automatically after a confirmed `sent` result.

Observable result: an operator can inject secrets only at runtime, deliberately
send one controlled test message without live dispatch, confirm receipt, and
inspect a sanitized durable record. The normal template remains disabled and
requires no secret files.

### Milestone 5: authorised external receipt proof (pending human authority)

Only after Milestone 4 passes unit/container checks may the operator provide a
permitted SMTP account and explicitly authorise one test send. Before sending,
validate the configured recipient and sender by showing only redacted/nonsecret
configuration status. Run the one-shot command once. The recipient confirms
receipt by recording the safe test identifier and timestamp in Issue #19; do
not paste message content, SMTP provider details, headers, credentials, or
authentication output. Then return Issue #19 to `status:human-review` for
human closure.

## Concrete Steps

All commands run from `/home/chris/template`.

1. `uv run pytest tests/unit/symphony -q` should run focused unit tests without
   network access.
2. `uv run python scripts/verify.py` should pass lint, formatting, tests, and
   Markdown-link validation.
3. `git diff --check` should return no output.

Actual results will be recorded after implementation.

Observed on 2026-10-01 in the local Docker Compose development container:

1. `docker compose run --rm app uv run pytest tests/unit/symphony -q`
   reported `17 passed in 2.72s`. These tests use fake notification adapters or
   disabled/incomplete local configuration; they did not contact SMTP.
2. `docker compose run --rm app uv run python scripts/verify.py` reported Ruff
   lint and formatting passing, `34 passed in 2.89s`, Markdown links passing,
   and `Verification: passed`.
3. `git diff --check` exited with no output.

These results do not prove actual external delivery. A future authorized
delivery check must record only safe evidence of human receipt, never SMTP
credentials, message content, or authentication output.

The activation implementation will add these concrete commands, all from the
repository root and only after the code is reviewed:

1. Export the three approved secret variables in the operator's current WSL
   shell; do not put values in a command history, `.env`, or a terminal
   screenshot. The exact source depends on the mail provider and is not a
   repository artifact.
2. `docker compose --profile symphony config --quiet` must pass with secret
   sources present and must not print resolved configuration.
3. `docker compose run --rm symphony uv run app-template symphony preflight`
   must report only boolean/sanitized readiness information.
4. `docker compose run --rm symphony uv run app-template symphony
   test-human-review-email --acknowledge-external-email` is the sole external
   send. Expected safe output: a test identifier and `sent`; an SMTP failure
   must be safe output plus a durable failed event, never a leaked exception.
5. `docker compose run --rm app uv run pytest tests/unit/symphony -q` and
   `docker compose run --rm app uv run python scripts/verify.py` must pass.

Steps 1 and 4 require separate explicit human authority at execution time;
this plan does not grant it.

## Validation and Acceptance

The focused tests must prove disabled, successful fake, duplicate-transition,
and failed-delivery behavior. They must assert that an SMTP failure leaves the
run at `HUMAN_REVIEW` and does not change the GitHub completion path. The
canonical verifier validates repository-wide linting, formatting, tests, and
documentation links. No real SMTP connection is permitted.

The activation implementation must additionally prove:

- Compose secret mounting succeeds on the supported Docker Compose version and
  normal service startup does not require mail secrets while delivery is off.
- Missing secret files/values yield a sanitized `failed` record and do not
  start dispatch, change GitHub state, or crash the dashboard.
- The one-shot test command rejects missing acknowledgement, disabled delivery,
  and missing configuration before any SMTP connection attempt.
- The command cannot override the configured recipient or cause an Issue state
  transition.
- A fake SMTP file-backed success is stored as one `sent` test delivery;
  duplicate invocation with the same test identifier is idempotent.
- A simulated crash/pending lease expiration is visible and recovers only
  according to the bounded policy.
- Real receipt confirmation is manual acceptance evidence, not a test-suite
  assertion or automated message-content capture.

## Idempotence and Recovery

Creating SQLite tables and persisting a delivery record are repeatable. A
duplicate callback with the same transition identifier returns the existing
outcome without sending again. A failed SMTP send creates a durable failed row;
the operator may correct runtime configuration and trigger a new human-review
transition through the documented retry/review flow. Disable delivery by
setting `notifications.email.enabled: false`; no credentials are removed or
modified by this code.

Compose secret sources and the one-shot test must be opt-in. If a secret source
is unavailable, leave notifications disabled and stop with a sanitized
preflight failure; do not fall back to checked-in files, prompt for values, or
enable live dispatch. If a test send fails, retain the durable failed record,
fix configuration outside the repository, then run a newly authorised test;
do not replay a previous unknown/pending send automatically.

## Artifacts and Notes

- Specification: `docs/specs/2026-10-01-human-review-email-notifications.md`.
- GitHub handoff will cite this ExecPlan and focused test output without
  including recipient details beyond the explicitly requested default.
- Activation design updated on 2026-10-01 after reviewing actual runtime
  behavior. It supersedes the earlier incomplete advice that a `.env.symphony`
  file or a `WORKFLOW.md` edit alone could make delivery active.

## Interfaces and Dependencies

- `WorkflowConfig.notifications`: typed optional email configuration loaded
  from `WORKFLOW.md`.
- `HumanReviewNotifier.notify(record) -> NotificationResult`: safe adapter
  boundary in `src/app_template/symphony/notifications.py`.
- `EventStore.record_notification(...)` and `.recent_notifications()`: durable
  SQLite evidence and dashboard data. The implemented methods are
  `claim_notification`, `complete_notification`, and `recent_notifications`.
- Remaining external acceptance: configure a permitted SMTP service outside
  version control, make one explicitly authorized handoff send, and have the
  configured human recipient confirm receipt. This is not an automated test.
- `Scheduler(on_human_review=...)`: invokes the completion-side callback after
  GitHub status update; callback failures cannot alter run completion.
- Proposed activation interfaces (not yet implemented):
  - `EmailNotificationSettings.smtp_username_file_env`,
    `smtp_password_file_env`, and `smtp_from_file_env`, whose values name
    mounted secret-file path variables rather than credentials.
  - `SmtpHumanReviewNotifier` file-backed secret reader with sanitized errors.
  - `EventStore.claim_test_notification(...)` and bounded pending-lease
    recovery fields/events.
  - `app-template symphony test-human-review-email
    --acknowledge-external-email`, a one-shot command isolated from scheduler
    dispatch and GitHub mutation.
