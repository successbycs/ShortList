# Decisions

**Status:** active
**Responsible role:** repository owner (Chris)
**Update when:** a material engineering, template or governance decision is made or reversed.

## Template baseline decisions

- Python 3.12, `uv`, Pydantic, OpenAI Agents SDK, Prefect, FastAPI, standard-library SQLite, Ruff, pytest, Compose, Dev Containers, and Mermaid are the baseline. The installed AI, workflow, and web libraries do not configure credentials or start runtime services.
- The baseline service is non-root, unprivileged, has no Docker socket, and exposes no ports.
- Optional capability packs are documented extensions, not default services; FastAPI + Jinja/HTMX UI, PostgreSQL, RAG, and background workers remain opt-in.
- The existing `LICENSE` is MIT and is retained unchanged. CODEOWNERS ownership
  and a consuming project's licence decision remain unresolved; this template
  does not invent either.
- GitHub Issues are the canonical task queue. A user-started Codex session may work on one eligible Issue at a time; plans record technical execution and verification, not a competing task status.
- The active GitHub repository lives in `pyproject.toml` at `[tool.app-template.github]`. Bootstrap requires an explicit replacement target for a copied project so it cannot act on `successbycs/template` by mistake.

## Decisions by Chris, 28 October 2026

- **Symphony is retired.** ShortList no longer uses OpenAI Symphony or the
  `symphony:*` labels. `WORKFLOW.md` and the Symphony scripts are deleted; the
  Symphony documents are in [docs/archive/symphony/](../archive/symphony/README.md)
  and everything else remains in Git history (#64).
- **Review and merge rule.** Every change goes Issue → branch → pull request →
  review by a model other than the builder → merge only with green `verify` and
  `web-quality` checks and an approve verdict. Chris authorises deployments,
  remote D1 migrations and other production changes separately. See
  [AGENTS.md](../../AGENTS.md#review-and-merge).
- **Stand-in reviewer.** Codex (Astra) is the normal reviewer. While Codex is
  unavailable, Claude Sonnet 5.5 reviews instead, and the pull request records
  that.
- **The reusable template is kept.** The root Python harness,
  `scripts/bootstrap_template.py` and `docs/template/` stay in this repository
  and are not archived.
- **Raw ChatGPT transcripts stay local only.** They are not tracked in Git
  (#62).
