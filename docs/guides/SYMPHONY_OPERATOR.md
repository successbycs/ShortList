# Upstream Symphony Operator Guide

**Status:** active template | **Owner:** operator | **Update:** upstream release, workflow, or operation change.

This repository uses the official OpenAI Symphony reference executable rather
than a repository-owned scheduler. It polls the configured GitHub Issues queue,
creates one isolated workspace per eligible Issue, and starts `codex app-server`
there. Its own optional loopback dashboard is the supported operational view.

The checked-in integration pins upstream `v0.0.3` for Linux x86_64. Symphony is
prototype software intended for evaluation by its upstream authors. Do not treat
the template integration as a hardened unattended production service.

## Safe baseline

`WORKFLOW.md` is upstream configuration with Markdown prompt instructions. Its
safe baseline is deliberately narrow:

- It targets only `successbycs/template` and uses a `GITHUB_TOKEN` supplied at
  process start; no credential belongs in Git.
- An Issue must be open and have `symphony:ready` before it is a candidate.
  Symphony reads that label; it does not change labels, assign work, close an
  Issue, or create eligibility itself.
- `agent.max_concurrent_agents: 1` limits the upstream scheduler to one active
  worker.
- Codex runs in `workspace-write` sandbox mode. Network access is enabled for
  normal repository setup, but approvals and MCP elicitation are rejected.
- The worker workspace and runtime logs live below ignored `var/`; they are not
  the repository checkout.
- The workspace hook clones the current committed local checkout by default.
  This permits review of unpushed local integration commits without exposing
  the operator's uncommitted files. Set `SYMPHONY_SOURCE_REPO` to an explicit
  committed source repository only when an operator intends a different base.

An empty eligible queue is the normal safe state. Starting the service in that
state proves connectivity and the dashboard only; it does not prove task
execution. The dedicated #40 proof is the only authorized first dispatch.

## Install and start the dashboard

Run from the repository root on Linux x86_64. The installer downloads the exact
official v0.0.3 release and verifies its published SHA-256 before making it
executable below ignored `var/tools/`.

```bash
scripts/install_upstream_symphony.sh --dry-run
scripts/install_upstream_symphony.sh
SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" \\
  GITHUB_TOKEN="$(gh auth token)" scripts/run_upstream_symphony_dashboard.sh
```

The final command stays in the foreground and does not write the token to a
file. Its acknowledgement is intentionally required by upstream before the
launcher passes the upstream preview-warning flag. It serves the dashboard at <http://127.0.0.1:8765/> and its JSON state at
<http://127.0.0.1:8765/api/v1/state>. Stop it with `Ctrl-C` in the same
terminal. Use `SYMPHONY_DASHBOARD_PORT`, `SYMPHONY_WORKSPACE_ROOT`, or
`SYMPHONY_LOGS_ROOT` only when an operator needs a different host-local path or
port; never commit their values if they contain sensitive locations.

Before any start, confirm `codex` and `gh auth status` work on the host. The
upstream binary also requires `git`. Failure to start is a safe failure: no
Issue becomes eligible merely because the process was attempted. Never set the
acknowledgement automatically in a shell profile, service definition, or CI;
the person starting each preview must make that explicit decision.

## Dashboard and restart behaviour

The dashboard and JSON API are supplied by upstream Symphony, not by this
template. `GET /api/v1/state` is the concise machine-readable operational
state; `GET /api/v1/refresh` asks upstream to refresh its tracker view.

Upstream keeps active blocked-session state in memory. If the process stops,
that map is cleared; after restart it polls GitHub again and can reconsider a
still-open eligible Issue. Preserved workspaces and logs may assist diagnosis,
but this integration intentionally does not add a duplicate SQLite event store
or claim-recovery layer. Do not assume a stopped Codex turn has a durable
upstream session resume. #40 records the actual observed restart behaviour.

## Bounded task proof and recovery

Do not add `symphony:ready` to an Issue or start the service against an eligible
Issue except under the approved #40 proof or a later explicitly authorized
operation. A worker may use the upstream `github_api` tool with the permissions
of the temporary GitHub token, so every eligible Issue needs clear scope and
human review.

If Symphony or Codex blocks, stop the foreground process, preserve ignored logs
and the workspace, and record the state in the relevant GitHub Issue. Do not
start duplicate services, delete a workspace, or use a label change to force a
retry. The normal coding-session policy remains
[GITHUB_ISSUE_WORKFLOW](../harness/GITHUB_ISSUE_WORKFLOW.md).
