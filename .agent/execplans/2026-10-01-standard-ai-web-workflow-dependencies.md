# Make the AI, web, and workflow libraries standard dependencies

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

GitHub Issue [#15](https://github.com/successbycs/template/issues/15) asks the reusable template to make the OpenAI Agents SDK, Prefect, and FastAPI standard Python dependencies, rather than optional capability packs. After this work, a newly created development environment installs all three libraries from the committed `uv.lock`; the template specification and adoption guide accurately distinguish those installed libraries from capabilities that still require explicit runtime configuration. No service, agent loop, server process, credential, or external connection is enabled by merely installing a dependency.

## Progress

- [x] (2026-10-01 00:00Z) Verified `origin` is `https://github.com/successbycs/template.git`, re-read Issue #15, and claimed it as `status:in-progress` with a progress comment.
- [x] (2026-10-01 00:00Z) Inspected the repository guidance, `pyproject.toml`, lockfile, optional-pack policy, and existing uncommitted changes.
- [x] (2026-10-01 03:24Z) Added `openai-agents>=0,<1` and `prefect>=3,<4`; regenerated the lock while retaining FastAPI and concurrent dependency entries.
- [x] (2026-10-01 03:24Z) Reconciled template documentation and added a focused direct-dependency manifest test.
- [x] (2026-10-01 03:24Z) Ran locked dependency, focused, and canonical verification; recorded durable results in this plan and the verification matrix.
- [x] (2026-10-01 03:24Z) Prepared the scoped local commit and human-review handoff without pushing or closing the Issue.

## Surprises & Discoveries

- Observation: FastAPI, Uvicorn, PyYAML, and related lockfile entries already exist as uncommitted work; FastAPI is no longer optional in the current checkout before this plan's implementation starts.
  Evidence: `git diff -- pyproject.toml uv.lock` on 2026-10-01 shows those additions, while `docs/template/OPTIONAL_PACKS.md` and RQ-022 still call FastAPI optional.
- Observation: `uv` is unavailable on the host shell.
  Evidence: `uv --version` returned `/bin/bash: uv: command not found` on 2026-10-01. The Dev Container or an existing project environment must supply it for lock and verifier checks.

## Decision Log

- Decision: Treat the existing FastAPI manifest and lockfile edits as concurrent work and build this Issue's additions on top of them.
  Rationale: The user asked to preserve pre-existing work. Removing or reconstructing those edits would exceed this Issue and risk losing an in-progress change.
  Date/Author: 2026-10-01 / Codex
- Decision: Install library dependencies only; do not create a FastAPI app, Prefect deployment/worker, OpenAI agent, credentials, or networked smoke test.
  Rationale: Issue #15 requests standard availability, while the reusable-template boundary and the Issue do not authorize runtime services or external integration.
  Date/Author: 2026-10-01 / Codex

## Outcomes & Retrospective

Completed locally: the three libraries are standard dependencies with an updated lock, policy, examples, and focused manifest coverage. The Dev Container locked install and canonical verifier passed. No credentials or runtime service were added; the remaining handoff is a scoped local commit and GitHub human-review transition.

## Context and Orientation

`pyproject.toml` is the project's sole native Python dependency manifest and `uv.lock` is its committed, reproducible resolution. The current working tree already declares `fastapi>=0.115,<1`; this plan will add the published `openai-agents` package (the Python OpenAI Agents SDK) and `prefect` to the same runtime dependency list using compatible major-version bounds determined from the resolver. `docs/TEMPLATE_SPECIFICATION.md` has the canonical RQ-022 technology requirement. `docs/template/OPTIONAL_PACKS.md`, `docs/harness/DECISIONS.md`, and the two `docs/template/examples/AgentClinic-*.md` files currently state that AI and web packages are optional, and therefore need compatible wording. `docs/architecture/DEPENDENCY_POLICY.md` governs dependency admission. `docs/quality/VERIFICATION_MATRIX.md` records requirement-level proof.

Issue #15 is a material multi-file dependency and policy change. It is tracked in GitHub as `status:in-progress`; this file is the implementation record. Other local changes are not part of the issue and must remain unstaged. The work neither sends requests to OpenAI nor starts a Prefect worker or web server. A standard dependency means it is installed by `uv sync --locked`, not that it is automatically configured or active.

## Plan of Work

Milestone 1 — resolve dependencies safely. From the repository root, invoke the environment-provided `uv` to add compatible `openai-agents` and `prefect` runtime requirements and update `uv.lock`. Confirm FastAPI remains declared and all three distributions appear in the locked application dependency metadata. If the resolver reports an incompatibility with Python 3.12 or the existing Pydantic/FastAPI constraints, do not force a version: record it and leave the issue blocked.

Milestone 2 — make the template policy truthful. Change RQ-022 so these three packages are standard installed libraries but their runtime capability remains inert by default. Remove them from the inactive-pack list, preserve still-optional packs (FastAPI+Jinja/HTMX UI, PostgreSQL, RAG, and background workers), and amend the dependency policy's categorical optional-dependency wording. Update template examples and the verification matrix so no document claims the baseline excludes these packages. Add a small test that parses `pyproject.toml` and asserts the three direct runtime requirements, plus an import test only if the resolved environment can run it without credentials or side effects.

Milestone 3 — verify and hand off. Run `uv lock --check`, `uv sync --locked --group dev`, the focused dependency test, and `uv run python scripts/verify.py`. Update this plan with date, commands, results, and any limits before posting a concise Issue comment. Re-read #15 and the remote, change only `status:in-progress` to `status:human-review`, then commit only this issue's file set locally. Do not push, merge, deploy, close an Issue, or contact external services.

## Concrete Steps

All commands run from `/home/chris/template`.

1. Inspect concurrent manifest changes with `git diff -- pyproject.toml uv.lock` before and after dependency resolution. Expected: existing FastAPI changes remain present.
2. In a Dev Container or environment that has `uv`, run `uv add 'openai-agents>=<resolved-major>,<next-major' 'prefect>=<resolved-major>,<next-major'`, followed by `uv lock --check` and `uv sync --locked --group dev`. Expected: the resolver updates only the manifest/lock resolution and the locked environment installs.
3. Run `uv run pytest -q tests/unit/test_standard_dependencies.py` and `uv run python scripts/verify.py`. Expected: no warning failures, formatting/lint/test/link checks pass, and the focused test proves all three direct manifest requirements.
4. Record actual command output summaries in `Artifacts and Notes`, update Progress and Outcomes, add scoped files with `git add`, then create one local commit. Expected: `git status --short` still shows unrelated existing work, while the commit contains only this Issue's planned paths.

## Validation and Acceptance

Acceptance is met when `pyproject.toml` declares OpenAI Agents SDK, Prefect, and FastAPI as direct runtime dependencies; the committed lock resolves all three under Python 3.12; `uv sync --locked` can install them; documentation correctly calls their libraries standard but leaves agent/API/server/worker execution opt-in; and the canonical verification suite passes. A focused test must inspect the manifest without relying on package-network access. No live API or Prefect/FastAPI runtime test is appropriate because dependencies alone must not cause external side effects.

## Idempotence and Recovery

`uv lock --check`, `uv sync --locked --group dev`, and all test commands are repeatable. `uv add` is repeatable after compatibility inspection but mutates the manifest and lock; it must run only in an environment where the current working tree is preserved. If resolution fails, do not hand-edit lock hashes or relax unrelated constraints; retain the original lockfile and record the incompatibility. If a documentation edit overlaps a concurrent user change, preserve the concurrent content and make the smallest reconciled edit. No database, remote service, credentials, or generated deployment artifact is involved, so no external rollback is required.

## Artifacts and Notes

- 2026-10-01 discovery: `git remote get-url origin` returned `https://github.com/successbycs/template.git`; `gh auth status` was authenticated as `successbycs`; Issue #15 was re-read before claiming.
- 2026-10-01 discovery: host `uv` is not available. Validation will use an available Dev Container/project environment or report this environmental limitation honestly.
- 2026-10-01 03:24Z validation: `docker compose run --rm app uv lock --check` resolved 122 packages; `uv sync --locked --group dev` installed 120 packages; focused `pytest -q tests/unit/test_standard_dependencies.py` passed (1 passed); `uv run python scripts/verify.py` passed Ruff lint/format, 37 tests, and Markdown links.
- Limitation: validation installed packages in the local Dev Container only. No OpenAI call, Prefect server/worker/deployment, or FastAPI listener was started, because this Issue authorizes dependency availability rather than runtime configuration.

## Interfaces and Dependencies

`pyproject.toml` gains direct runtime requirements for `openai-agents` and `prefect`; FastAPI is retained as a direct requirement already present in the working tree. `uv.lock` gains their complete transitive resolution, generated only by `uv`. The installed OpenAI Agents SDK is an importable library, not an OpenAI credential or an enabled agent. Prefect is an importable orchestration library, not a running worker, server, deployment, or API. FastAPI is an importable web framework, not an exposed listener. The direct requirements must support `requires-python = >=3.12,<3.13` and coexist with Pydantic 2.x.
