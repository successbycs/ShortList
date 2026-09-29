# Getting Started

**Status:** template guide
**Responsible role:** project maintainer
**Update when:** the local startup, verification, or bootstrap workflow changes.

## Prerequisites

Use Windows with WSL2, Docker Desktop with this distro enabled for WSL integration, and VS Code with Dev Containers. Keep the checkout inside the WSL filesystem. Docker commands run from WSL; do not install project dependencies on the host.

## Start and verify

From the repository root, create the lockfile in the container only if `uv.lock`
is absent. If bootstrap changes the distribution or package name, regenerate the
lockfile with `uv lock`, review it, and commit it with that bootstrap change.
For ordinary verification, keep the lock unchanged and use the locked install:

    docker compose build
    docker compose run --rm app uv sync --locked --group dev
    docker compose run --rm app uv run python scripts/verify.py
    docker compose run --rm app uv run app-template health
    docker compose run --rm app uv run app-template self-test
    docker compose run --rm app uv run app-template demo --no-op

The self-test and demo use only a local SQLite audit database and never call an external service. Stop the baseline service with:

    docker compose down

VS Code attachment is a manual check: run **Dev Containers: Reopen in Container**, then run the same commands from the integrated terminal.

## Configure the copied project

Before running a Codex Issue session in a copied template, set the GitHub target
during bootstrap. This prevents a copied repository from operating on the
source template's Issues:

    docker compose run --rm app uv run python scripts/bootstrap_template.py \
      --project-name my-project --package-name my_project \
      --github-repository OWNER/REPOSITORY
    docker compose run --rm app uv lock
    docker compose run --rm app uv sync --locked --group dev
    docker compose run --rm app uv run python scripts/verify.py

The command requires an explicit `OWNER/REPOSITORY`; it changes only the
bounded template markers and records the selected values in an ignored local
state file. See [the GitHub Issue workflow](docs/harness/GITHUB_ISSUE_WORKFLOW.md).

## Configuration

Copy only the values you need from [config/app.example.toml](config/app.example.toml) into ignored `config/app.toml`, or select a file with `--config`. Precedence and safety behavior are documented in [docs/architecture/CONFIGURATION.md](docs/architecture/CONFIGURATION.md).
