# Local Runbook

**Status:** active template | **Owner:** operator | **Update:** startup or verification changes.

Use [GETTING_STARTED.md](../../GETTING_STARTED.md) for Compose build, locked install, checks, self-test, demo, and stop commands. Docker Desktop WSL integration is required.

## Symphony local runtime

`WORKFLOW.md` keeps Symphony dispatch disabled by default. Validate its contract
with `uv run app-template symphony validate-workflow`, then inspect local
prerequisites without printing credentials with `uv run app-template symphony
preflight --require-dispatch`. The latter requires host `codex` and authenticated
`gh`; it does not perform a task or enable dispatch.

To expose the loopback-only operator API while dispatch remains disabled, run
`docker compose --profile symphony up`. It binds the dashboard to
`127.0.0.1:8765` and persists local state under ignored `var/symphony/`. Issue worktrees are created separately under `../var/symphony/workspaces`, outside the shared checkout; inspect them with `git worktree list` and remove only a clean task worktree through Symphony or `git worktree remove`.
Stop it with `docker compose --profile symphony stop symphony`. Enable live
dispatch only after the dedicated end-to-end demonstration is approved.

## Optional human-review email

Symphony can send a concise email only when an Issue has already moved to
`status:human-review`. It is disabled by default. The checked-in
`WORKFLOW.md` names `chris@successbycs.com` as the requested initial recipient;
change `notifications.email.human_review_email` for a copied project before
enabling delivery.

To enable an SMTP-compatible provider, set `notifications.email.enabled: true`
and `notifications.email.smtp_host`, then provide these environment variables
only in the runtime environment (never in `WORKFLOW.md`, Git, screenshots, or
Issue comments): the variables named by `smtp_username_env`,
`smtp_password_env`, and `smtp_from_env`. The default names are
`SYMPHONY_SMTP_USERNAME`, `SYMPHONY_SMTP_PASSWORD`, and
`SYMPHONY_SMTP_FROM`. STARTTLS is enabled by default; adjust only if the
provider explicitly requires another configuration.

The notifier tries at most `max_attempts` (default two) for one human-review
transition. Its result is stored in the local dashboard’s `/api/status`
`notifications` data. A missing or failed mail configuration records a
sanitized `failed` outcome, leaves the Issue in human review, and never reruns
the completed implementation. Disable the capability again by setting
`notifications.email.enabled: false`.
