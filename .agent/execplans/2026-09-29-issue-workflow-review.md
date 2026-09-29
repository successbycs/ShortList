# Repair the template and activate a user-started GitHub Issue workflow

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

The template needs reliable current-state evidence and a reusable way for a
user-started Codex session to work through one GitHub Issue safely. After this
work, a copied project can configure its own GitHub target during bootstrap,
run one canonical local verification command, and follow documented Issue state
transitions without unattended automation.

## Progress

- [x] (2026-09-29) Inspected branch, commit, clean worktree, repository
  instructions, required documentation, implementation, GitHub CLI, and Docker.
- [x] (2026-09-29) Confirmed Docker CLI/Compose are installed; sandboxed daemon
  access was denied but the approved host check reached Docker 29.2.0.
- [x] (2026-09-29) Confirmed `gh` exists but its active account token is invalid;
  no GitHub read or write is possible until the user re-authenticates.
- [x] (2026-09-29) Added a bounded configurable GitHub target to bootstrap,
  canonical local verification entry point, CI formatting/image checks, and
  session-workflow documentation/skill.
- [x] (2026-09-29) Ran container verification: locked sync, canonical verifier
  (17 tests), health, self-test, and demo passed after correcting one Ruff line.
- [x] (2026-09-29) Created local commit `d07f506`, then verified its isolated
  archive: build, locked install, verifier, health/self-test/demo, two-container
  SQLite persistence, and renamed bootstrap/re-lock/verifier all passed.
- [ ] (2026-09-29) Amend the local commit with final evidence-only records and
  attempt live Issue tracking only if authentication becomes valid without
  credential handling.

## Surprises & Discoveries

- Observation: The original active plan still said Docker was unavailable even
  though the current WSL CLI reports Docker 29.2.0 and Compose 5.0.2.
  Evidence: `docker --version` and `docker compose version` passed; direct
  sandbox socket access was denied.
- Observation: GitHub CLI authentication is invalid for the configured account.
  Evidence: `gh auth status` reports an invalid token; no token value was read.
- Observation: CI did not previously check Ruff formatting or build the
  development image.
  Evidence: `.github/workflows/ci.yml` only ran locked sync, lint, pytest, and
  link checking.
- Observation: One-shot Compose commands recreate the `/tmp` virtual
  environment and therefore re-download packages.
  Evidence: each `docker compose run --rm app uv run …` reported a new virtual
  environment and package downloads. This affects speed, not correctness.

## Decision Log

- Decision: Keep the original bootstrap documents as clearly labelled history
  and use this plan plus GitHub Issues for current technical work and task state.
  Rationale: A local status table would conflict with the authorised canonical
  Issue queue.
  Date/Author: 2026-09-29 / Codex
- Decision: Require `--github-repository OWNER/REPOSITORY` when bootstrapping a
  copied project.
  Rationale: An implicit inherited target could cause a new project to mutate
  the source template's Issues.
  Date/Author: 2026-09-29 / Codex

## Outcomes & Retrospective

Local repair and clean-archive verification passed. Live GitHub workflow
activation remains blocked only by invalid local GitHub CLI authentication, not
by a missing repository workflow design. Interactive VS Code attachment and an
observed remote CI run remain manual checks.

## Context and Orientation

`pyproject.toml` holds the active GitHub target at
`[tool.app-template.github]`. `scripts/bootstrap_template.py` makes a bounded
project/package/target rename in a copy. `scripts/verify.py` is the single
Python verification entry point after a locked dependency sync.

`docs/harness/GITHUB_ISSUE_WORKFLOW.md` is the canonical session procedure;
`docs/harness/ISSUE_STATE_MODEL.md` defines labels. GitHub state must be read
and written only through the configured target after authenticating successfully.

## Plan of Work

First validate the revised static files and focused tests. Next build and run
the Compose service with current and non-default UID/GID identities, using a
temporary explicitly selected database to prove persistence across two distinct
containers. Then create a disposable copied project, bootstrap it with a
different name/target, perform a locked install and run the full verification
entry point. Finally archive the committed source in an isolated Compose project
and repeat clean-start checks. Update evidence only for checks actually run.

## Concrete Steps

Run from `/home/chris/template`:

    docker compose build
    LOCAL_UID=$(id -u) LOCAL_GID=$(id -g) docker compose run --rm app uv sync --locked --group dev
    LOCAL_UID=$(id -u) LOCAL_GID=$(id -g) docker compose run --rm app uv run python scripts/verify.py

For a copied-project check, use an isolated temporary directory and pass an
explicit non-source GitHub target to `scripts/bootstrap_template.py`, then run
`uv lock`, locked sync, and the verifier. For clean verification, archive a
committed source and use a unique Compose project name.

## Validation and Acceptance

The revised bootstrap must reject an invalid GitHub target, preserve files on
dry run and conflict, update package/CLI/configuration/GitHub target references,
and be repeatable. `scripts/verify.py` must pass Ruff lint and formatting,
pytest, and link checking inside a locked container environment. The non-root
container must write a uniquely identified synthetic event to a temporary
runtime location and a second container must read it. No command may use the
Docker socket inside the development container.

## Idempotence and Recovery

Verification uses `mktemp -d`, unique Compose project names, and explicitly
named temporary runtime paths. It may be repeated. Stop only the named Compose
project and remove only its temporary directory after inspecting it. Do not
glob-delete Docker resources or alter GitHub auth. If GitHub remains unauthenticated,
leave the workflow documentation and proposed queue local and report the exact
login command the user must run.

## Artifacts and Notes

Observed starting commit: `b38df7dd0308f015077780457cfad545d52f3e7f`; repair
commit: `d07f506214066cc25e77ea410dcd2b4bbba60769`, both on `main`. Remote
points to the expected `successbycs/template` target without exposing
credentials. Current `gh auth status` is invalid. Docker host check reports
29.2.0 and Compose 5.0.2. Archive project `template-clean-prompt3` passed the
clean start and two-container persistence test; the renamed bootstrap archive
also passed after re-locking.

## Interfaces and Dependencies

`scripts/bootstrap_template.py` accepts `--project-name`, `--package-name`,
`--github-repository`, `--root`, and `--dry-run`. Its bootstrap state contains
all three identity values. `scripts/verify.py` executes the project’s Ruff lint,
Ruff format check, pytest, and Markdown-link check without external side
effects. `.codex/skills/github-issue-session/SKILL.md` is an advisory Codex
skill; it cannot grant GitHub permissions or start a background process.
