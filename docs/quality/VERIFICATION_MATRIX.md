# Verification Matrix

**Status:** active evidence record
**Owner:** template maintainer
**Update when:** a requirement, implementation, command, or observed result changes.
**Requirements source:** [TEMPLATE_SPECIFICATION.md](../TEMPLATE_SPECIFICATION.md)
**Workflow source:** [GITHUB_ISSUE_WORKFLOW.md](../harness/GITHUB_ISSUE_WORKFLOW.md)

`passed` means the cited artifact was inspected or the stated local command
passed. `partial` identifies a real implementation whose environment-dependent
check remains unobserved. `blocked` records a specific external prerequisite;
`deferred` is an agreed exclusion. File existence alone is never behaviour
evidence.

| Requirement IDs | Status | Observed evidence / remaining check |
| --- | --- | --- |
| RQ-001–RQ-003 | passed | Generic Python self-test source was inspected; baseline health, synthetic self-test, and no-op demo completed locally without API keys or external calls on 2026-09-29. |
| RQ-010–RQ-013 | partial | Docker 29.2.0 and Compose 5.0.2 were observed on the WSL host. Compose config resolves non-root user, source and `var/` binds, no ports, no Docker socket, dropped capabilities, and `no-new-privileges`; an isolated archive used UID/GID 1000 rather than the image's UID/GID 10001 and wrote synthetic runtime data. Interactive VS Code Dev Container attachment remains required. |
| RQ-014 | deferred | T480/cloud deployment and image publication are intentionally absent. |
| RQ-015 | blocked | Session-driven workflow, labels, configurable target, and local Issue proposal are implemented. Live repository/Issue/label inspection and writes are blocked because `gh auth status` reports an invalid active token. |
| RQ-020 | passed | `.python-version`, `pyproject.toml`, committed `uv.lock`, and locked container `uv sync --locked --group dev` were inspected/run. |
| RQ-021 | partial | Container local verification passed with Ruff lint/format, 17 pytest tests, and link checker; CI now builds the image then calls the same verifier. A remote GitHub Actions result is not observed. |
| RQ-022–RQ-023 | passed | Optional packs are documentation-only and absent from baseline dependencies/services. Official OpenAI skill/instruction sources and dates are registered; no unverified native Codex configuration was added. |
| RQ-030–RQ-033 | passed | Adapter, audit store, documentation, and tests show deterministic no-op behavior, explicit limits, and build-time/runtime-agent distinction. |
| RQ-040 | passed | Required foundation/layout paths were inspected. The existing MIT `LICENSE` was preserved; no CODEOWNERS entry was invented. |
| RQ-041–RQ-044 | passed | Container tests cover precedence, unknown/invalid config, safe token redaction, correlation IDs, transactional rollback, schema-version rejection, persistence, health, self-test, and no-op demo. |
| RQ-050–RQ-051 | passed | Required repository foundations, issue forms, source/test/evals/scripts/templates/config/optional paths, ignored secrets, and lockfile were inspected. A copied archive bootstrapped to `clinic-template` / `clinic_template` / `example-owner/clinic-template`, re-locked, and passed the canonical verifier. |
| RQ-052–RQ-061 | passed | Documentation catalogue and content were inspected; architecture/workflows are linked and three Mermaid blocks exist. Application material is marked template or deferred. |
| RQ-062 | passed | `python3 scripts/check_markdown_links.py` and the container canonical verifier reported `Markdown links: passed` on 2026-09-29. The checker validates relative local Markdown links; it does not validate external URLs, rendered anchors, or prose accuracy. |

## Command evidence

On the WSL host, Docker host configuration checks passed. Through the host
Docker daemon on 2026-09-29, `docker compose build`, locked `uv sync`, and
`uv run python scripts/verify.py` passed; the latter reported Ruff lint, Ruff
format, 17 tests, and Markdown links passing. `app-template health`, `self-test`,
and `demo --no-op` also exited successfully with synthetic SQLite evidence.

An isolated `git archive d07f506` used Compose project
`template-clean-prompt3`: image build, locked install, canonical verification,
health, self-test, demo, and a two-container synthetic SQLite persistence read
all passed. The archive then bootstrapped with a different project/package/
GitHub target, ran `uv lock`, locked sync, the canonical verifier, and the
renamed no-op demo successfully. It used the supported Compose fallback UID/GID
1000, which differs from the image's built-in 10001 identity.

The host sandbox cannot itself connect to `/var/run/docker.sock`; these Docker
checks were deliberately run through approved host access. No remote GitHub
Actions run or interactive VS Code attachment has been observed.
