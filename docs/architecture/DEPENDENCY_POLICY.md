# Dependency Policy

**Status:** active template policy
**Responsible role:** dependency owner
**Update when:** a dependency or toolchain policy changes.

Declare runtime and development dependencies in `pyproject.toml`; commit the generated `uv.lock`; install with `uv sync --locked`. Add a dependency only with a stated need, compatible licence/security review, and focused tests. Optional-pack dependencies never enter the default group.
