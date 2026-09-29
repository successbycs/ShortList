# App Template

A generic Python-first project template with a local, Docker-based development harness. It contains no product-domain logic, external integrations, or optional services by default.

## Intended workflow

Use [GETTING_STARTED.md](GETTING_STARTED.md) to create the local environment, then run the safe self-test and deterministic no-op demo. Read [docs/INDEX.md](docs/INDEX.md) for the template documentation catalogue and [AGENTS.md](AGENTS.md) for development-agent instructions.

## Current implementation status

The Python self-test foundation and local Docker verification are implemented.
Interactive VS Code Dev Container attachment and observed remote GitHub Actions
results still require their respective environments. Cloud deployment, image
publication, runtime AI agents, and optional capability packs are deferred.
