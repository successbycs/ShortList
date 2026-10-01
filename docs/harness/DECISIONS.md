# Decisions

**Status:** active
**Responsible role:** template maintainer
**Update when:** a material template decision is made or reversed.

- Python 3.12, `uv`, Pydantic, OpenAI Agents SDK, Prefect, FastAPI, standard-library SQLite, Ruff, pytest, Compose, Dev Containers, and Mermaid are the baseline. The installed AI, workflow, and web libraries do not configure credentials or start runtime services.
- The baseline service is non-root, unprivileged, has no Docker socket, and exposes no ports.
- Optional capability packs are documented extensions, not default services; FastAPI + Jinja/HTMX UI, PostgreSQL, RAG, and background workers remain opt-in.
- The existing `LICENSE` is MIT and is retained unchanged. CODEOWNERS ownership
  and a consuming project's licence decision remain unresolved; this template
  does not invent either.
- GitHub Issues are the canonical task queue. A user-started Codex session may work on one eligible Issue at a time; plans record technical execution and verification, not a competing task status.
- The active GitHub repository lives in `pyproject.toml` at `[tool.app-template.github]`. Bootstrap requires an explicit replacement target for a copied project so it cannot act on `successbycs/template` by mistake.
