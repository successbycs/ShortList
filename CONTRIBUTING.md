# Contributing

**Status:** active
**Responsible role:** contributor
**Update when:** development workflow or verification entry points change.

Work starts from a GitHub Issue and lands through a pull request. The full
rule (branch, PR, review by a different model, merge on green checks and an
approve verdict) is in [AGENTS.md](AGENTS.md#review-and-merge).

Use an ExecPlan for material changes as described in [AGENTS.md](AGENTS.md). Keep changes small, add focused tests, and report failures or blocked checks honestly. Do not commit credentials, generated runtime data, or unreviewed lockfile changes.

Before opening a PR, run the checks for the part you changed:

- **Web app (`apps/web`):** `npm ci`, `npm run types`, `npm run lint`,
  `npm test`, `npm run typecheck`, `npm run build`. CI runs these as
  `web-quality`.
- **Python harness and docs (repository root):** `uv run python scripts/verify.py`
  (in the container, see [GETTING_STARTED.md](GETTING_STARTED.md)). CI runs it as
  `verify`. It includes the Markdown link check, so run it after any docs change.

A pull request must identify its Issue or plan, validation evidence, limits,
deferred work and who built it. Deployments and remote D1 migrations are not
part of a PR; Chris authorises them separately. See
[docs/workflows/DEVELOPMENT_WORKFLOW.md](docs/workflows/DEVELOPMENT_WORKFLOW.md)
and the [Local Runbook](docs/operations/LOCAL_RUNBOOK.md).
