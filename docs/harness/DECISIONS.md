# Decisions

**Status:** active
**Responsible role:** template maintainer
**Update when:** a material template decision is made or reversed.

- Python 3.12, `uv`, Pydantic, standard-library SQLite, Ruff, pytest, Compose, Dev Containers, and Mermaid are the baseline.
- The baseline service is non-root, unprivileged, has no Docker socket, and exposes no ports.
- Optional technologies are documented extension packs, not default dependencies or services.
- The existing `LICENSE` is MIT and is retained unchanged. CODEOWNERS ownership
  and a consuming project's licence decision remain unresolved; this template
  does not invent either.
- GitHub Issues are the canonical task queue. A user-started Codex session may work on one eligible Issue at a time; plans record technical execution and verification, not a competing task status.
- The active GitHub repository lives in `pyproject.toml` at `[tool.app-template.github]`. Bootstrap requires an explicit replacement target for a copied project so it cannot act on `successbycs/template` by mistake.
