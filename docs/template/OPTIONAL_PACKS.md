# Optional Packs

**Status:** active template | **Owner:** architect | **Update:** pack guidance changes.

The standard dependency set includes OpenAI Agents SDK, Prefect, and FastAPI, but installing a library does not configure credentials or start an agent, workflow worker, deployment, or web server. Available but inactive packs are FastAPI plus Jinja/HTMX, PostgreSQL, RAG, and background workers. Each pack adoption requires an ExecPlan, dependency/operational design, tests, and documentation; no pack is started by default.
