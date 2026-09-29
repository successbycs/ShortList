# Build the reusable Python project template

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Build a generic Python-first repository that a new project can copy and immediately validate. The template will provide a safe local Docker/Dev Container development foundation, typed configuration, a deterministic no-op self-test with SQLite audit evidence, documentation, a Codex/GitHub development harness, optional-pack guidance, and CI. It will not contain trading logic, external integrations, deployments, or optional services by default.

Someone using the completed template will be able to copy it, set a project name through the bounded bootstrap script, start the development environment with Compose, run `uv`-based verification inside the container, and run a self-test/demo that persists only synthetic audit events. In the current WSL session Docker is unavailable, so host Docker verification and VS Code attachment remain blocked and the plan records their exact rerun commands.

## Progress

- [x] (2026-09-29 00:00Z) Inspected repository instructions, root, branch, tracked and untracked files, planning documents, WSL/container state, Docker/Compose/daemon availability, remote presence without revealing its URL, and configured Git identity.
- [x] (2026-09-29 00:00Z) Verified the planned requirements cover Docker Python development, linked documentation, Codex configuration/skills, GitHub workflow and CI without deployment, optional packs, safe bootstrap, synthetic SQLite self-test, and deferred capability distinctions.
- [x] (2026-09-29 00:00Z) Confirmed this is `/home/chris/template` on branch `main`, with `origin` configured and only `LICENSE` tracked; all existing template/planning files are untracked baseline work that must be preserved.
- [x] (2026-09-29 00:00Z) Added Milestone 1 source/package, Compose, Dockerfile, Dev Container, hygiene, and test layout. `uv.lock` and container checks remain blocked by unavailable Docker/uv.
- [x] (2026-09-29 00:00Z) Added Milestones 2 and 3 code and focused tests: typed configuration, redacted logging, safe CLI, schema-versioned SQLite audit store, and no-op adapter. Runtime verification remains blocked.
- [x] (2026-09-29 00:00Z) Added documentation catalogue, architecture/workflow/AI/quality/operations/template documents, GitHub issue/PR/CI harness, link checker, and a narrow ExecPlan-maintenance Codex skill.
- [x] (2026-09-29 00:00Z) Implemented and tested bounded bootstrap: dry run, invalid-name rejection, conflict refusal, repeat execution, and renamed-package import all pass in disposable copies.
- [x] (2026-09-29 00:00Z) Generated `uv.lock` in Docker; locked install, Ruff, tests, link check, health, self-test, and no-op demo pass locally.
- [x] (2026-09-29 00:00Z) Completed clean-start verification from a temporary source snapshot with Compose project `app-template-clean2`; locked install, Ruff, 16 tests, and self-test pass.
- [ ] Update the public plan/matrix and commit only attributable changes if Git metadata becomes writable.

## Surprises & Discoveries

- Observation: Docker CLI, Compose, and daemon are unavailable in this WSL2 distribution, while this session is not inside a container.
  Evidence: `docker --version`, `docker compose version`, and `docker info` did not provide usable Docker access on 2026-09-29.
- Observation: The supplied active bootstrap plan marks its planning baseline passed but is not itself a self-contained ExecPlan.
  Evidence: `docs/plans/active/template-bootstrap.md` is a task table; this file is the operational living ExecPlan, while the document plan remains the requirement-facing milestone summary.
- Observation: This workspace permits editing files but denies Git index writes.
  Evidence: `git add …` failed with `fatal: Unable to create '/home/chris/template/.git/index.lock': Read-only file system`.
- Observation: A clean snapshot must retain the tracked empty `var/.gitkeep` runtime directory.
  Evidence: Excluding `var/` caused Docker to create its bind source as root-owned and the self-test could not open SQLite; the second snapshot including `var/.gitkeep` passed.

## Decision Log

- Decision: Use this file as the single operational TODO and retain `docs/plans/active/template-bootstrap.md` as the public requirement-to-milestone summary.
  Rationale: The repository’s `AGENTS.md` requires ExecPlans in `.agent/execplans/`, while the saved specification requires the documentation plan path. Keeping their scopes explicit avoids duplicate active plans.
  Date/Author: 2026-09-29 / Codex
- Decision: Do independent file, code, documentation, and host-independent test work despite unavailable Docker; do not attempt a Docker bypass or host dependency installation.
  Rationale: The requested execution boundary requires Python tooling inside project containers and prohibits bypassing unavailable Docker access.
  Date/Author: 2026-09-29 / Codex
- Decision: Add project-scoped Codex skills only after recording their verified `.codex/skills/<name>/SKILL.md` format and only for a focused template workflow.
  Rationale: The current official documentation describes repo-scoped skills at that location; the prior Forex-specific skills are intentionally not portable.
  Date/Author: 2026-09-29 / Codex

## Outcomes & Retrospective

The foundation, core code, documentation, Codex skill, GitHub CI files, and bounded bootstrap are implemented and locally verified in Docker. The clean-start verification passed from an isolated uncommitted working-tree snapshot. Manual VS Code Dev Container attachment and an observed remote GitHub Actions run remain unverified.

The local commit requested by the implementation brief is also blocked by the workspace’s read-only `.git` metadata. No changes were staged or committed.

## Context and Orientation

The repository root is `/home/chris/template`, a WSL2 workspace on branch `main`. `LICENSE` is the only tracked file. `origin` exists but its URL was intentionally not displayed. Git identity is configured, but no global Git configuration was changed. The pre-existing untracked worktree contains `AGENTS.md`, `.agent/PLANS.md`, `.agent/execplans/.gitkeep`, `docs/TEMPLATE_SPECIFICATION.md`, `docs/plans/active/template-bootstrap.md`, and `docs/quality/VERIFICATION_MATRIX.md`; preserve and build on it.

`docs/TEMPLATE_SPECIFICATION.md` is the requirement source, with requirement IDs `RQ-001` through `RQ-062`. `docs/plans/active/template-bootstrap.md` summarizes ordered milestone status. `docs/quality/VERIFICATION_MATRIX.md` maps requirements to evidence. `AGENTS.md` and `.agent/PLANS.md` set repository instructions and this ExecPlan’s format.

The target baseline is Python with a pinned minor version, `uv`, Pydantic, standard-library SQLite, Ruff, pytest, Docker Compose, Dev Containers, and Mermaid. Optional capabilities—including OpenAI Agents SDK, Prefect, FastAPI, PostgreSQL, RAG, and workers—are documentation-only packs unless explicitly enabled later. A synthetic audit event is test data created by the template’s no-op demo; it never calls an external application or requires a secret.

## Plan of Work

Milestone 1 establishes the package, lockfile, Compose and Dev Container definitions, hygiene files, and minimal unit-testable import. It creates a non-root container with no privileged mode, Docker socket, or baseline port exposure. Static configuration checks can run in WSL without dependencies; the image build, lock installation, and in-container checks wait for Docker.

Milestones 2 and 3 add the core Python behavior. `src/app_template/config.py` will load Pydantic settings from explicit config file, environment, and explicit command-line overrides in documented order, reject unknown TOML keys, and report safe validation errors. `logging.py` will add correlation IDs and key-based recursive redaction. `audit.py` will own a versioned SQLite schema and transactional event recording. `cli.py` will expose health, self-test, and demo commands. Unit tests will prove valid/invalid config, precedence, redaction, audit persistence, rollback, and deterministic no-op behavior.

Milestones 4 and 5 create concise required documents and a linked catalogue, Mermaid diagrams, an internal-link checker, canonical policies, GitHub templates, and a narrowly-scoped project `execplan-maintenance` skill. Codex configuration will contain only a documented, verified project-scoped setting if it has a real consumer. Development-agent instructions remain distinct from runtime application-agent template documents.

Milestones 6 and 7 create inactive optional pack descriptions, a bounded bootstrap script that changes only explicit template markers, and GitHub Actions that use the same test/lint/link entry points. The bootstrap tests operate only in temporary directories and do not modify this repository. Clean-start and Compose verification use a separate Compose project and temporary data only after Docker is restored.

## Concrete Steps

Run from `/home/chris/template`.

1. Use `git status --short`, `git diff --check`, and `git diff --cached --check` before each commit to preserve unrelated work.
2. Create foundations, then run static `python3` syntax checks and the repository link checker. Once Docker is available, run `docker compose config`, `docker compose build`, `docker compose run --rm app uv sync --locked`, `docker compose run --rm app uv run ruff check .`, and `docker compose run --rm app uv run pytest -q`.
3. For core behavior, run focused tests inside the `app` Compose service and invoke `uv run app-template self-test` and `uv run app-template demo --no-op`; record concise output and audit database path.
4. Run the project link checker after documentation changes. Run bootstrap tests in disposable temporary copies. Run the CI-equivalent commands locally before commit.
5. For clean-start verification after Docker access is restored, create a temporary archive/copy containing tracked intended files, launch it with a distinct Compose project name, run startup/self-test/demo/checks, and stop only that project. Do not prune Docker globally.

## Validation and Acceptance

The package must import; lint and tests must pass under locked dependencies inside the container. `app-template self-test` must exit zero without an API key or network call. `app-template demo --no-op` must write and then display a deterministic `no_action` synthetic audit result including a correlation ID. Invalid and unknown configuration must fail safely without echoing secrets. An injected audit write failure must roll back its transaction. Reopening the same SQLite file must preserve the prior event.

Documentation acceptance is a catalogue entry for each required document with purpose, status, owner role, and update trigger; all local Markdown links resolve; architecture includes links to workflows; and three Mermaid diagrams exist. Optional packs must neither alter default dependencies nor appear in `compose.yaml` services. CI must have read-only permissions, pinned action revisions, timeouts, cancellation, and no deployment steps. Bootstrap must reject invalid names, report a dry run without edits, reject conflict by default, be repeatable, and rename the Python package only through explicit markers.

Docker acceptance remains blocked until `docker --version`, `docker compose version`, and `docker info` succeed in WSL. VS Code Dev Container attachment requires a human interactive check and remains not run unless observed.

## Idempotence and Recovery

All generated documentation and source edits are additive and can be reviewed or reverted through Git. The bootstrap script uses a manifest of explicit marker-bearing files, creates no repository-wide replacement, defaults to conflict failure, and validates before writes. Tests create their SQLite files inside test temporary directories. The demo’s database path is configurable and uses a template-owned local runtime directory ignored by Git. Compose uses a named project and volume; stop commands target only that project. If Docker installation fails partway, rerun the same Compose build after fixing Docker Desktop WSL integration; do not remove user images, volumes, or global Docker state.

## Artifacts and Notes

Starting state evidence: `/home/chris/template`; branch `main`; `origin` configured; Git identity configured; Linux kernel identifies WSL2; `/.dockerenv` absent; only `LICENSE` tracked; the untracked planning baseline listed above existed before this implementation turn. No credentials or remote URL were displayed.

Official source verification on 2026-09-29: OpenAI’s Skills documentation describes a skill as a directory containing `SKILL.md` with YAML front matter and instructions, and current Codex guidance identifies `.codex/skills/<skill-name>/SKILL.md` as the repo-scoped location. Sources are recorded in `docs/harness/SOURCES.md` during Milestone 5.

## Interfaces and Dependencies

The Python distribution is `app-template`, importing from `app_template`. Its supported CLI commands are `app-template health`, `app-template self-test`, and `app-template demo --no-op`. Configuration uses `config/app.example.toml` and the `APP_TEMPLATE_` environment prefix. The `AuditStore` interface creates and validates its own SQLite schema version and exposes `record_event` and `list_events`. The test adapter returns a deterministic no-action result and never performs I/O outside the local audit store.

The Compose `app` service is the only baseline service. It runs as a non-root user and has no exposed ports. `.devcontainer/devcontainer.json` attaches VS Code to that service. GitHub Actions invokes the project’s verification script rather than duplicating behavior. The `.codex/skills/execplan-maintenance/` skill is advisory repository guidance, not a runtime application agent or permission control.
