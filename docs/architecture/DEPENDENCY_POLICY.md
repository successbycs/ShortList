# Dependency Policy

**Status:** active template policy
**Responsible role:** dependency owner
**Update when:** a dependency or toolchain policy changes.

Declare runtime and development dependencies in `pyproject.toml`; commit the generated `uv.lock`; install with `uv sync --locked`. Add a dependency only with a stated need, compatible licence/security review, and focused tests. Dependencies for an optional capability pack stay outside the default group unless a recorded template decision promotes the underlying library; installing a library never enables its runtime service or external integration.

When a dependency or its supported integration is deprecated, migrate to the
supported replacement and update the lockfile. Do not pin an obsolete version
or suppress its warning solely to keep tests passing. If no safe migration is
available, record a tracked exception with the affected version, rationale,
owner, review/expiry date, and the smallest approved temporary mitigation.
