# Getting Started

**Status:** template guide
**Responsible role:** project maintainer
**Update when:** the local startup, verification, or bootstrap workflow changes.

## Prerequisites

Use Windows with WSL2, Docker Desktop with this distro enabled for WSL integration, and VS Code with Dev Containers. Keep the checkout inside the WSL filesystem. Docker commands run from WSL; do not install project dependencies on the host.

## Start and verify

From the repository root, first create the lockfile in the container only if `uv.lock` is absent, review it, and commit it with the dependency change:

    docker compose build
    docker compose run --rm app uv lock
    docker compose run --rm app uv sync --locked --group dev
    docker compose run --rm app uv run ruff check .
    docker compose run --rm app uv run pytest -q
    docker compose run --rm app uv run app-template health
    docker compose run --rm app uv run app-template self-test
    docker compose run --rm app uv run app-template demo --no-op

The self-test and demo use only a local SQLite audit database and never call an external service. Stop the baseline service with:

    docker compose down

VS Code attachment is a manual check: run **Dev Containers: Reopen in Container**, then run the same commands from the integrated terminal.

## Configuration

Copy only the values you need from [config/app.example.toml](config/app.example.toml) into ignored `config/app.toml`, or select a file with `--config`. Precedence and safety behavior are documented in [docs/architecture/CONFIGURATION.md](docs/architecture/CONFIGURATION.md).
