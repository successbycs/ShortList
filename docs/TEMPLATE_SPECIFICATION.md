# Reusable Project Template Specification

**Status:** approved planning baseline
**Owner:** template maintainer
**Last reviewed:** 2026-09-29
**Update when:** template scope, supported platform, toolchain, or optional pack policy changes.

This is the canonical requirements record for the `successbycs/template` repository. It specifies a reusable Python-first development harness, not a Forex product. Product-domain decisions belong in a consuming project.

## Purpose and scope

| ID | Requirement |
| --- | --- |
| RQ-001 | Provide a generic, Python-first repository and complete AI development harness that can grow into a system as complex as a Forex application, without shipping trading logic or broker integration. |
| RQ-002 | Remain suitable for small applications without starting or requiring unnecessary services. |
| RQ-003 | Treat the minimal working code as a template self-test: it requires no API keys or external application calls. |

## Platform and execution boundaries

| ID | Requirement |
| --- | --- |
| RQ-010 | Support Windows T16, WSL2, and Docker Desktop. VS Code desktop connects through a Dev Container. |
| RQ-011 | Keep source in WSL and bind-mount it into Docker. Run Python tools and project services inside Docker; manage containers with host Docker/Compose commands. |
| RQ-012 | Do not embed WSL in a Docker image, mount the Docker socket into the development container, run privileged containers, or run containers as root. |
| RQ-013 | Keep each project’s services standalone. GitHub supplies source control, Issues, pull requests, and CI; GitHub-hosted CI is the sole remote-execution exception. |
| RQ-015 | Provide a user-started, session-driven GitHub Issue workflow. Its target must be configurable when the template is copied; GitHub Issues are the sole task-status queue, and local technical plans hold implementation detail and evidence. |
| RQ-014 | Defer T480/cloud deployment and container-image publication. |

## Active and optional technology

| ID | Requirement |
| --- | --- |
| RQ-020 | Pin a supported Python minor version explicitly; use `uv`, commit `uv.lock`, and use locked installs. |
| RQ-021 | Use Pydantic, Python-standard-library SQLite, Ruff, pytest, Docker Compose, VS Code Dev Containers, and Mermaid in Markdown. |
| RQ-022 | Provide documented extension packs for OpenAI Agents SDK, Prefect, FastAPI, FastAPI + Jinja/HTMX UI, PostgreSQL, RAG, and background/scheduled workers. Do not install or start them by default. |
| RQ-023 | Use `pyproject.toml` for native Python/tool configuration. Add `.codex/config.toml` or development-agent configuration only after verifying their current official schemas and registration mechanisms; do not invent native formats (for example, `prefect.toml`). Record official sources and their verification dates. |

## Architecture and safety boundaries

| ID | Requirement |
| --- | --- |
| RQ-030 | Keep business logic independent from orchestration and web frameworks; use explicit adapter interfaces for external integrations. |
| RQ-031 | Let deterministic code own hard limits and external actions. Keep AI recommendations distinct from enforcement, and model “no action” as a valid result. |
| RQ-032 | Document idempotency, duplicate actions, retries, and reconciliation. Separate Codex development agents from runtime application agents. |
| RQ-033 | Distinguish documented policy from implemented enforcement; documentation alone must never be presented as a safety capability. |

## Foundation, code, and configuration

| ID | Requirement |
| --- | --- |
| RQ-040 | Create the foundation files and directory layout listed in [Required documentation and repository layout](#required-documentation-and-repository-layout). Preserve the existing `LICENSE`; do not choose a replacement or invent `CODEOWNERS` entries. Record its actual status and unresolved ownership decisions. |
| RQ-041 | Supply `config/app.example.toml` and a real typed application loader that rejects unknown keys and invalid values. Document and test configuration precedence. Keep secrets in ignored `.env` files and use safe placeholders only in `.env.example`; identify inactive TOML examples clearly. |
| RQ-042 | Implement typed configuration loading, structured correlation-ID logging with secret redaction, and a safe CLI health/self-test command. |
| RQ-043 | Implement SQLite-backed synthetic audit-event recording with schema-version metadata and transactional writes. |
| RQ-044 | Include a zero-side-effect test adapter and deterministic no-op demo that records its result. |

## Required documentation and repository layout

The implementation must create `docs/INDEX.md` as a catalogue. Every catalogue entry records purpose, status, responsible role, and update trigger. Documents must contain useful templates, questions, and instructions—not empty headings—and use one canonical source per policy with related-document links and update triggers. Application-specific material is explicitly marked **template** or **deferred**.

| ID | Requirement |
| --- | --- |
| RQ-050 | Create repository foundations: `README.md`, `GETTING_STARTED.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `pyproject.toml`, `uv.lock`, `.python-version`, `.gitignore`, `.dockerignore`, `.env.example`, `compose.yaml`, `.devcontainer/devcontainer.json`, `.devcontainer/Dockerfile`, `.github/workflows/ci.yml`, `.github/pull_request_template.md`, and feature, bug, research, and decision issue forms. |
| RQ-051 | Create `src/app_template/`, `tests/unit/`, `tests/integration/`, `tests/fixtures/`, `evals/cases/`, `evals/datasets/`, `scripts/`, `templates/`, `config/`, `optional/`, and the documentation tree below. |
| RQ-052 | Create product documents: `PRODUCT_BRIEF.md`, `REQUIREMENTS.md`, `USER_STORIES.md`, `ASSUMPTIONS.md`, `ROADMAP.md`, and `GLOSSARY.md`. |
| RQ-053 | Create architecture documents: `ARCHITECTURE.md`, `DATA_MODEL.md`, `DATA_CONTRACTS.md`, `INTEGRATIONS.md`, `CONFIGURATION.md`, `SECURITY_ARCHITECTURE.md`, `THREAT_MODEL.md`, `LIFECYCLE_AND_APPROVALS.md`, `FAILURE_MODES.md`, and `DEPENDENCY_POLICY.md`. `ARCHITECTURE.md` links to and incorporates the workflows. |
| RQ-054 | Create harness documents: `DECISIONS.md`, `OPEN_QUESTIONS.md`, `CODEX_OPERATING_MODEL.md`, `DEVELOPMENT_AGENT_CATALOGUE.md`, `AUTHORITY_AND_GUARDRAILS.md`, `DEFINITION_OF_READY.md`, `DEFINITION_OF_DONE.md`, `ISSUE_STATE_MODEL.md`, `AUTOMATION_CONTRACT.md`, `DOCUMENTATION_MAINTENANCE.md`, `SOURCES.md`, and `adr/`. |
| RQ-055 | Create workflow documents: `DEVELOPMENT_WORKFLOW.md`, `PLANNING_WORKFLOW.md`, `AI_CHANGE_WORKFLOW.md`, `DATA_CHANGE_WORKFLOW.md`, `RELEASE_WORKFLOW.md`, `INCIDENT_WORKFLOW.md`, and `RECONCILIATION_WORKFLOW.md`. |
| RQ-056 | Create planning layout: `docs/plans/README.md`, `docs/plans/active/`, and `docs/plans/completed/`. |
| RQ-057 | Create AI documents: `AI_SYSTEM_DESIGN.md`, `APPLICATION_AGENT_CATALOGUE.md`, `AGENT_CONTRACTS.md`, `MODEL_POLICY.md`, `PROMPT_REGISTRY.md`, `CONTEXT_POLICY.md`, `TOOL_POLICY.md`, `SAFETY_POLICY.md`, and `STRUCTURED_OUTPUTS.md`. Explain that build-time Codex guidance is separate from runtime prompts. |
| RQ-058 | Create quality documents: `TEST_STRATEGY.md`, `EVALUATION_STRATEGY.md`, `REPLAY_TESTING.md`, `REGRESSION_LOG.md`, `DEMO_CHECKLIST.md`, and `VERIFICATION_MATRIX.md`. |
| RQ-059 | Create operations documents: `LOCAL_RUNBOOK.md`, `OBSERVABILITY.md`, `AUDIT_TRAIL.md`, `DATA_RETENTION.md`, `BACKUP_RESTORE.md`, `TROUBLESHOOTING.md`, `INCIDENT_RESPONSE.md`, `KILL_SWITCH_AND_RECOVERY.md`, `CI_CD_STRATEGY.md`, and `RESOURCE_BUDGET.md`. |
| RQ-060 | Create template documents: `NEW_PROJECT_GUIDE.md`, `OPTIONAL_PACKS.md`, and `TEMPLATE_UPGRADES.md`. |
| RQ-061 | Include Mermaid diagrams for environment boundaries, development workflow, and runtime component relationships. |
| RQ-062 | Automatically check internal Markdown file links. |

## Initial decisions and unresolved decisions

Agreed now: Python, `uv`, Pydantic, standard-library SQLite, Ruff, pytest, Compose, Dev Containers, and Mermaid are the default foundation. Optional capability packs are opt-in and isolated. Local Docker is verified on the T16 WSL2 host with Docker Desktop. The GitHub task workflow is session-driven: a user starts Codex, which selects one eligible ready Issue and leaves it in human review after verification. It does not poll, run unattended, or automatically spawn agents.

The existing repository `LICENSE` is an MIT License, retained without change.
Repository ownership/CODEOWNERS assignments and a consuming project's licence
decision remain unresolved; this template does not fabricate either.

## Cross-references

Execution order, acceptance criteria, and blockers are in [the bootstrap plan](plans/active/template-bootstrap.md). Requirement-to-evidence status is in [the verification matrix](quality/VERIFICATION_MATRIX.md).
