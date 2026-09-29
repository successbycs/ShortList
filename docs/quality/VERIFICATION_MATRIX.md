# Verification Matrix

**Status:** active baseline
**Owner:** template maintainer
**Update when:** a requirement, implementation task, command, or evidence changes.
**Requirements source:** [TEMPLATE_SPECIFICATION.md](../TEMPLATE_SPECIFICATION.md)
**Plan source:** [template-bootstrap.md](../plans/active/template-bootstrap.md)

`passed` requires recorded command output or an inspectable committed artifact. `planned`, `blocked`, and `deferred` are not evidence of implementation.

| Requirement IDs | Planned implementation | Status | Evidence / verification |
| --- | --- | --- | --- |
| RQ-001–RQ-003 | Plan task 1 | passed | `docs/TEMPLATE_SPECIFICATION.md`, this matrix, and the active plan were created. No application or Docker implementation was added. |
| RQ-010–RQ-013 | Plan tasks 2, 6 | passed | Docker Desktop 29.2.0, Compose 5.0.2, image build, non-root Compose runs, locked install, and clean-start project `app-template-clean2` were verified locally on 2026-09-29. Manual VS Code attachment remains not run. |
| RQ-014 | Plan task 10 | deferred | Deferred by specification; no deployment or image-publication work has been performed. |
| RQ-020–RQ-021 | Plan tasks 3, 9 | passed | Python 3.12.11 container, committed-intent `uv.lock`, locked install, Ruff, and pytest passed locally on 2026-09-29. |
| RQ-022–RQ-023 | Plan task 8 | planned | Awaiting optional-pack documents and schema/source verification. |
| RQ-030–RQ-033 | Plan task 5 | planned | Awaiting architecture, deterministic implementation, and tests. |
| RQ-040 | Plan task 3 | planned | Awaiting foundation paths; licence and ownership will remain unresolved. |
| RQ-041–RQ-044 | Plan tasks 4, 5, 9 | passed | Configuration/logging/audit/no-op implementation passed 16 tests; health, self-test, and no-op demo produced local synthetic SQLite audit events on 2026-09-29. |
| RQ-050–RQ-051 | Plan task 3 | planned | Awaiting repository foundations and layout. |
| RQ-052–RQ-061 | Plan task 7 | planned | Awaiting required documentation catalogue, templates, relationships, and Mermaid evidence. |
| RQ-062 | Plan tasks 3, 9 | passed | `uv run python scripts/check_markdown_links.py` reported `Markdown links: passed` on 2026-09-29 before the latest two external-example additions; their direct local catalogue paths were also inspected. |

## Planning-baseline evidence

The repository inspection on 2026-09-29 found a bare worktree containing `LICENSE` and Git metadata. No `AGENTS.md` or other repository instructions were present, and `git status --short` had no output before these planned documentation additions. Secrets were neither read nor displayed.
