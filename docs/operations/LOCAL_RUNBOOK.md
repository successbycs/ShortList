# Local Runbook

**Status:** active template | **Owner:** operator | **Update:** startup or verification changes.

Use [GETTING_STARTED.md](../../GETTING_STARTED.md) for Compose build, locked install, checks, self-test, demo, and stop commands. Docker Desktop WSL integration is required.

## Symphony local runtime

Read [SYMPHONY_OPERATOR](../guides/SYMPHONY_OPERATOR.md) before operating the
scheduler. It defines the supported lifecycle, bounded demonstration limits,
recovery, and human-review handoff.

`WORKFLOW.md` keeps Symphony dispatch disabled by default. Validate its contract
with `uv run app-template symphony validate-workflow`, then inspect local
prerequisites without printing credentials with `uv run app-template symphony
preflight --require-dispatch`. The latter requires host `codex` and authenticated
`gh`; it does not perform a task or enable dispatch.

The scheduler has no web interface. Its durable local state remains under ignored
`var/symphony/`. Issue worktrees are created separately under
`../var/symphony/workspaces`, outside the shared checkout; inspect them with
`git worktree list` and remove only a clean task worktree through Symphony or
`git worktree remove`. Enable live dispatch only after the dedicated end-to-end
demonstration is approved.

### Restart-safe operational evidence

The local `var/symphony/events.sqlite3` database records sanitized scheduling
facts: fresh observations, admission decisions and queue age, claims,
reservations, reviewed revision markers, and worker stops. It contains no runner
prompts, transcripts, credentials, or email bodies.

If a host process ends after acquiring a reservation but before recording its worker
stop, the next service instance retains that Issue's active reservation and refuses
to dispatch it again. This is intentional: it prevents duplicate execution while the
operator determines the prior worker outcome. Do not delete or alter the SQLite file
to clear this fence. Record the outcome through the normal recovery workflow once it
exists; until then, the safe state is blocked local dispatch for that Issue.

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

For implicit TLS (typically port 465), set `use_ssl: true` and
`use_starttls: false`. Both TLS modes verify server certificates and hostnames;
enabling both modes is rejected. These transport settings do not enable delivery
or load a `.env` file automatically. Host-local credential loaders must remain
outside Git and must not execute the source file as shell code.

The notifier tries at most `max_attempts` (default two) for one human-review
transition. Its result is stored as a local durable notification record. A
missing or failed mail configuration records a sanitized `failed` outcome,
leaves the Issue in human review, and never reruns the completed implementation.
Disable the capability again by setting `notifications.email.enabled: false`.

## Real local capability proof

To exercise the template's active local deployment boundaries and create a
sanitized ignored result, run:

```bash
.venv/bin/python scripts/prove_deployed_software.py --output var/proofs/issue-30.json
```

The proof invokes the installed CLI with valid and invalid configuration, writes
and reopens a disposable SQLite audit database, runs the deterministic no-op
demo, and tests the repository Markdown checker against good and temporary bad
input. It does not call an external provider.

Prefect, PyYAML runtime, and OpenAI Agents SDK provider capabilities are not
default deployed services. The report labels them inactive or blocked; a real
provider request needs explicit account, credential, cost, data, and authority
approval. Docker Compose proof is a separate operator action because Docker is
host-owned: build an isolated project, request its loopback health endpoint,
then stop that exact project.
