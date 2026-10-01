# Example Specification: AgentClinic Tech Stack

**Status:** external example; non-canonical
**Responsible role:** template maintainer
**Update when:** the source link, attribution, or example-selection guidance changes.

This reference points to DeepLearning.AI’s AgentClinic technical-stack specification. It is useful for studying how a product specification can make system surfaces, configuration, processing pipeline, errors, components, persistence, and operational trade-offs explicit.

Read the source specification at [AgentClinic-Tech-Stack.md](https://github.com/https-deeplearning-ai/sc-spec-driven-development-files/blob/main/example_specs/AgentClinic-Tech-Stack.md).

## How to use this example

Use its level of technical detail as a model only after the consuming project has selected its own requirements and architecture. Keep technology selection separate from product intent, record assumptions, and verify real behavior with tests and operational evidence.

This template does **not** adopt the source’s Next.js, React, SSE, Anthropic SDK, API-key, SQLite ORM, background-job, endpoint, or LLM-call design. The template’s active baseline includes Python, Pydantic, OpenAI Agents SDK, Prefect, FastAPI, standard-library SQLite, `uv`, Ruff, pytest, Compose, and Dev Containers. Installing those libraries does not activate AI calls, web endpoints, or workers; optional FastAPI UI, PostgreSQL, RAG, and worker packs require explicit adoption under [OPTIONAL_PACKS.md](../OPTIONAL_PACKS.md).

## Attribution

Source repository: `https-deeplearning-ai/sc-spec-driven-development-files`
Source path: `example_specs/AgentClinic-Tech-Stack.md`
Retrieved for reference: 2026-09-29
