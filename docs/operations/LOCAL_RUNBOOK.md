# Local Runbook

**Status:** active template | **Owner:** operator | **Update:** startup or verification changes.

Use [GETTING_STARTED.md](../../GETTING_STARTED.md) for Compose build, locked
install, checks, self-test, demo, and stop commands. Docker Desktop WSL
integration is required for Compose.

## Upstream Symphony local runtime

Read [SYMPHONY_OPERATOR](../guides/SYMPHONY_OPERATOR.md) before operating the
optional scheduler. The repository uses the upstream OpenAI Symphony executable
and its dashboard; it does not operate a repository-owned scheduler, dashboard,
or Symphony SQLite store.

From the repository root, verify the target platform then install the pinned
release into ignored local state:

```bash
scripts/install_upstream_symphony.sh --dry-run
scripts/install_upstream_symphony.sh
```

With no `symphony:ready` GitHub Issue, this foreground command is a safe
connectivity and dashboard check. It reads the configured repository but has no
dispatch candidate:

```bash
SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" \\
  GITHUB_TOKEN="$(gh auth token)" scripts/run_upstream_symphony_dashboard.sh
```

Open <http://127.0.0.1:8765/> or request
<http://127.0.0.1:8765/api/v1/state>. Stop the exact foreground process with
`Ctrl-C`. The acknowledgement is required by upstream's preview safety gate and
must be made deliberately for each start. No token is persisted by the launcher. `var/symphony-upstream/` holds
host-local logs and cloned worker workspaces, and remains ignored by Git.

The current worker capacity is one, configured in `WORKFLOW.md`. Do not change
the queue label or run a task merely to test the dashboard. Issue #40 owns the
first bounded code-changing proof and restart observation.

### Restart-safe operational boundary

The upstream reference runtime retains its blocked-session map only in memory.
After a process restart it polls GitHub again; it does not offer a template-owned
SQLite history or an assured continuation of an interrupted Codex turn. Preserve
the workspace and logs when diagnosing an interruption, then use the Issue
record and human review to decide whether to retry.

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
