# Template Bootstrap Plan

**Status:** active
**Owner:** template maintainer
**Update when:** a task status, acceptance criterion, command, or dependency changes.
**Canonical requirements:** [TEMPLATE_SPECIFICATION.md](../../TEMPLATE_SPECIFICATION.md)

Status vocabulary: `pending`, `active`, `passed`, `blocked`, `deferred`. A task becomes `passed` only when its listed evidence is captured in [the verification matrix](../../quality/VERIFICATION_MATRIX.md).

| Order | Task | Requirement IDs | Status | Acceptance criteria | Verification commands |
| ---: | --- | --- | --- | --- | --- |
| 1 | Establish planning baseline and inspect repository/instructions | RQ-001–RQ-062 | passed | Specification, plan, and matrix exist; no app or Docker implementation is introduced; existing work is preserved. | `git status --short`; `test -f docs/TEMPLATE_SPECIFICATION.md`; `test -f docs/plans/active/template-bootstrap.md`; `test -f docs/quality/VERIFICATION_MATRIX.md` |
| 2 | Restore local Docker prerequisite | RQ-010–RQ-013 | blocked | Docker Desktop WSL integration is enabled and both host-management commands return versions. | `docker --version`; `docker compose version` |
| 3 | Establish foundations, Python lockfile, repository hygiene, and CI metadata | RQ-020–RQ-021, RQ-040, RQ-050–RQ-051 | pending | Pinned supported Python, locked `uv` install, required paths, issue forms, ignored secrets, CI, and link checker are present. Licence and ownership remain unresolved. | `uv sync --locked`; `ruff check .`; link-check command defined and run |
| 4 | Build core configuration, logging, CLI, and test seams | RQ-023, RQ-041–RQ-042 | pending | Typed loader validates example config and precedence; unknown/invalid values fail; log records carry correlation IDs and redact secrets; self-test is safe. | `uv run pytest tests/unit -q`; `uv run app-template self-test` |
| 5 | Build deterministic self-test persistence and demo | RQ-030–RQ-033, RQ-043–RQ-044 | pending | Transactional SQLite audit event includes schema metadata; test adapter has no external effects; deterministic no-op records its outcome. | `uv run pytest tests/unit tests/integration -q`; `uv run app-template demo --no-op` |
| 6 | Implement local Dev Container and Compose boundaries | RQ-010–RQ-014 | pending | Non-root, unprivileged services bind-mount WSL source; no Docker socket/WSL-in-image; only standalone baseline services start. | `docker compose config`; `docker compose up --build --wait`; `docker compose down` |
| 7 | Author the required documentation catalogue and templates | RQ-052–RQ-061 | pending | Every required document is useful, catalogued, linked, assigned a role/status/update trigger, and marks application-specific content template/deferred. Three Mermaid diagrams exist. | internal link check; `rg '```mermaid' docs` |
| 8 | Document extension packs and verified agent configuration | RQ-022–RQ-023, RQ-057, RQ-060 | pending | Optional packs are documented but absent from default install/start; any Codex configuration uses current verified official schema with source/date. Build-time and runtime agents are separated. | `uv sync --locked`; dependency/service inspection; source review |
| 9 | Complete quality, CI, and end-to-end verification | RQ-021, RQ-041–RQ-044, RQ-058, RQ-062 | pending | Unit/integration tests, lint, link check, self-test, demo, and Compose checks pass with evidence. | `uv run ruff check .`; `uv run pytest -q`; link check; `docker compose config` |
| 10 | Prepare deployment and publishing work for a later phase | RQ-014 | deferred | No T480/cloud deployment or image publication is implemented in this bootstrap. | N/A — explicitly deferred |

## Current blocker

Task 2 is blocked by this environment: `docker` is not installed or exposed to the current WSL2 distro. Enable Docker Desktop’s WSL integration, then rerun the two version commands. This does not block the planning baseline, but it blocks container implementation and verification.
