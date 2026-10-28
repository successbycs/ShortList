# Getting Started

**Status:** active
**Responsible role:** project maintainer
**Update when:** the local startup, verification, or bootstrap workflow changes.

ShortList has two parts, each with its own checks. See [AGENTS.md](AGENTS.md)
for what each part is and how changes are reviewed and merged.

## Prerequisites

Use Windows with WSL2, Docker Desktop with this distro enabled for WSL integration, and VS Code with Dev Containers. Keep the checkout inside the WSL filesystem. For the web app you also need Node.js 22 and npm 11 (`apps/web/package.json` pins `npm@11.13.0`).

## The web app (`apps/web`)

From `apps/web`:

    npm ci
    npm run lint
    npm test
    npm run typecheck
    npm run build
    npm run dev:worker

`npm run dev:worker` runs the Worker locally with Wrangler and a local D1
database. It does not deploy anything. The full command list, the D1 migration
steps and the deployment boundary are in the
[Local Runbook](docs/operations/LOCAL_RUNBOOK.md#the-web-app-appsweb).
CI runs the same checks as the `web-quality` job.

## The Python harness (repository root)

From the repository root, create the lockfile in the container only if `uv.lock`
is absent. For ordinary verification, keep the lock unchanged and use the
locked install:

    docker compose build
    docker compose run --rm app uv sync --locked --group dev
    docker compose run --rm app uv run python scripts/verify.py
    docker compose run --rm app uv run shortlist health
    docker compose run --rm app uv run shortlist self-test
    docker compose run --rm app uv run shortlist demo --no-op

`scripts/verify.py` runs Ruff lint and format checks, pytest and the Markdown
link check. CI runs it as the `verify` job. The self-test and demo use only a
local SQLite audit database and never call an external service. Stop the
baseline service with:

    docker compose down

VS Code attachment is a manual check: run **Dev Containers: Reopen in Container**, then run the same commands from the integrated terminal.

## Using the template for a new project

The root Python harness is also a reusable template. In a fresh, unbootstrapped
copy of the template repository, set the project name and GitHub target first,
so the copy cannot act on the source template's Issues:

    docker compose run --rm app uv run python scripts/bootstrap_template.py \
      --project-name my-project --package-name my_project \
      --github-repository OWNER/REPOSITORY
    docker compose run --rm app uv lock
    docker compose run --rm app uv sync --locked --group dev
    docker compose run --rm app uv run python scripts/verify.py

The command requires an explicit `OWNER/REPOSITORY`; it changes only the
bounded template markers and records the selected values in an ignored local
state file. ShortList itself is already bootstrapped, so the script refuses to
run here. See [the GitHub Issue workflow](docs/harness/GITHUB_ISSUE_WORKFLOW.md).

After the bootstrapped baseline passes verification, follow the
[New Project Guide](docs/template/NEW_PROJECT_GUIDE.md).

## Configuration

Copy only the values you need from [config/app.example.toml](config/app.example.toml) into ignored `config/app.toml`, or select a file with `--config`. Precedence and safety behavior are documented in [docs/architecture/CONFIGURATION.md](docs/architecture/CONFIGURATION.md). The web app's Worker secrets are separate; see [apps/web/README.md](apps/web/README.md).
