# Decisions

**Status:** active
**Responsible role:** template maintainer
**Update when:** a material template decision is made or reversed.

- Python 3.12, `uv`, Pydantic, standard-library SQLite, Ruff, pytest, Compose, Dev Containers, and Mermaid are the baseline.
- The baseline service is non-root, unprivileged, has no Docker socket, and exposes no ports.
- Optional technologies are documented extension packs, not default dependencies or services.
- Licence selection and CODEOWNERS ownership remain unresolved; this template does not invent either.
