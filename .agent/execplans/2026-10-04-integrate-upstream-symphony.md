# Integrate pinned upstream Symphony

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Replace the template's bespoke scheduler contract with a configuration and
operator path for the pinned, official OpenAI Symphony reference runtime. An
operator will be able to install the exact upstream release on a Linux host,
start its built-in local dashboard, and confirm that it can read the configured
GitHub repository without creating or assigning work. The later proof Issue
will deliberately enable a small eligible queue item; this Issue does not run
a code-changing task.

## Progress

- [x] (2026-10-04 00:00Z) Confirm the official upstream stable release and inspect the existing local runtime and documentation.
- [x] (2026-10-04 04:03Z) Add a reproducible, checksum-verified host installer and the upstream workflow configuration.
- [x] (2026-10-04 04:03Z) Replace local scheduler operator instructions, specification, and readiness policy with the upstream lifecycle and dashboard instructions.
- [ ] (2026-10-04 04:03Z) Obtain explicit operator acknowledgement of upstream's preview warning, then run the bounded dashboard/GitHub-read proof without dispatching an Issue.
- [ ] (2026-10-04 04:03Z) Record durable evidence in GitHub Issue #39 and this plan; leave #39 open for review.

## Surprises & Discoveries

- Observation: The current `WORKFLOW.md`, runbook, and operator guide describe a custom Python scheduler, a local SQLite event store, email notifications, custom Terra/Astra routing, and no dashboard.
  Evidence: `sed -n '1,240p' WORKFLOW.md` and the two Symphony documentation files on 2026-10-04.
- Observation: The official v0.0.3 executable refuses to boot until the operator passes its explicit `--i-understand-that-this-will-be-running-without-the-usual-guardrails` flag.
  Evidence: The bounded dashboard attempt printed the upstream preview warning and did not bind port 8765 on 2026-10-04.

## Decision Log

- Decision: Pin the official `openai/symphony` stable release rather than package, modify, or vendor the reference runtime.
  Rationale: The repository strategy is to align with upstream and avoid a second scheduler implementation. A release version and SHA-256 manifest make the host executable reproducible.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Keep one worker through upstream `agent.max_concurrent_agents: 1` and retain an explicit required GitHub queue label, without scheduler-side label transitions.
  Rationale: One worker is the approved baseline. A required label makes scheduler eligibility deliberate; the scheduler only reads it.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Do not remove the duplicate Python runtime until Issue #40 proves the upstream scheduler can perform one bounded task and survive the specified restart observation.
  Rationale: This creates a recoverable migration: the replacement is demonstrated before the old implementation is retired in Issue #41.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Preserve the upstream preview acknowledgement as an operator-supplied environment value rather than embedding its CLI flag unconditionally.
  Rationale: Starting the preview with its stated lack of usual guardrails is an explicit risk decision. The launcher must not conceal or automate it.
  Date/Author: 2026-10-04 / Codex.

## Outcomes & Retrospective

Pending. The intended outcome is an upstream-only operational configuration and an observed dashboard/GitHub-read proof with no task dispatch.

## Context and Orientation

`WORKFLOW.md` is currently parsed by `src/app_template/symphony/` and has a
custom YAML contract. `docs/guides/SYMPHONY_OPERATOR.md` and
`docs/operations/LOCAL_RUNBOOK.md` therefore currently describe behaviour that
will be retired in Issue #41. The official upstream implementation accepts a
Markdown workflow file with YAML front matter, starts Codex through `codex
app-server`, and exposes a local Phoenix dashboard only when its `--port`
option is supplied.

The template's target repository is `successbycs/template`. The host needs
`codex`, an authenticated GitHub CLI, and a temporary `GITHUB_TOKEN` only when
the upstream process reads GitHub. No credential is committed. `var/` is
ignored and holds downloaded executable state and service logs. The checked-in
workflow uses `symphony:ready` as a read-only eligibility marker, with no
eligible Issue expected during this Issue's proof.

## Plan of Work

First inspect the upstream v0.0.3 assets and checksum manifest, then introduce
an installer script that obtains only that named Linux asset, verifies its
published hash, and places it under ignored `var/tools/`. The script will have
a dry-run mode that validates platform and the pinned metadata without a
download.

Next replace `WORKFLOW.md` with upstream front matter: the GitHub adapter,
repository, active/terminal states, required label, a repository-external
workspace root, one worker, `codex app-server`, and a prompt that identifies
the issue fields upstream supplies. It will not include application-specific
models, SQLite, emails, custom runtime switches, or label-mutation policy.

Then revise the operator guide and local runbook. They will clearly distinguish
the safe #39 connectivity/dashboard check from #40's authorized task proof,
show how to supply `GITHUB_TOKEN` ephemerally through `gh auth token`, and
document clean stop/restart commands. Documentation will state that upstream's
in-memory scheduler state is not a durable historical database.

Finally run static checks and, if the release asset works on this host, start
the dashboard with a label-gated empty queue, request its state endpoint, stop
the exact process, and record non-secret evidence in #39. No GitHub Issue will
be labelled, assigned, closed, or otherwise modified by the runtime proof.

## Concrete Steps

Run from `/home/chris/template`:

    gh release view v0.0.3 --repo openai/symphony --json tagName,targetCommitish,assets,publishedAt
    ./scripts/install_upstream_symphony.sh --dry-run
    ./scripts/install_upstream_symphony.sh
    SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" GITHUB_TOKEN="$(gh auth token)" ./scripts/run_upstream_symphony_dashboard.sh

The last command is bounded: it is foregrounded, writes logs below ignored
`var/`, and the operator ends it with `Ctrl-C` after the loopback state endpoint
returns a sanitized result. The acknowledgement is a required upstream preview
warning; it must not be automated. The endpoint must show zero active task
sessions for this Issue's proof. Commands will be updated with actual output
during execution.

## Validation and Acceptance

The operational boundary is an official Symphony v0.0.3 Linux executable
reading GitHub and serving its own loopback dashboard. It requires upstream
asset availability, host Linux x86_64, `codex`, authenticated `gh`, and a
temporary GitHub token. Passing evidence is a verified asset checksum, an
accepted workflow, HTTP 200 from the upstream dashboard state endpoint, and
zero task dispatches. A static parser or mock alone is insufficient.

| Capability | Proof | Result |
| --- | --- | --- |
| Reproducible installation | Dry run and SHA-256 verification of v0.0.3 asset | Passed: `ea35…35ee` verified |
| Upstream configuration | v0.0.3 starts with committed workflow after preview acknowledgement | Pending acknowledgement |
| Dashboard and GitHub read | Official executable returns loopback state with no task session | Pending acknowledgement |
| Code-changing task / restart | Deliberately excluded; Issue #40 | Not run |

## Idempotence and Recovery

The installer reuses a matching verified asset and replaces only a failed or
wrong-version asset below ignored `var/tools/`. The dashboard launcher uses a
new ignored log directory and records a PID; stopping that exact PID ends the
test. If GitHub access or the binary fails, retain sanitized logs under
`var/symphony-upstream/`, do not enable a queue label, and record the proof as
blocked or failed rather than falling back to the custom scheduler.

## Artifacts and Notes

The GitHub record for this work is Issue #39. No token, full worker transcript,
or downloaded binary is committed. The release version and hash are committed
in the installer so a reviewer can reproduce the host setup.

## Interfaces and Dependencies

- `WORKFLOW.md`: official upstream Markdown/YAML workflow contract, consumed by
  the pinned Symphony binary after the migration.
- `scripts/install_upstream_symphony.sh`: Linux x86_64 installer with options
  `--dry-run` and `--print-path`; installs only the pinned upstream executable
  under ignored `var/tools/`.
- `scripts/run_upstream_symphony_dashboard.sh`: explicit bounded launcher for
  the upstream dashboard; requires a caller-supplied `GITHUB_TOKEN` and the
  upstream preview acknowledgement.
- Upstream dependency: `openai/symphony` v0.0.3 release, host `codex app-server`,
  and GitHub API authentication supplied only in the process environment.
