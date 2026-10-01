# Example Specification: AgentClinic Mission

**Status:** external example; non-canonical
**Responsible role:** template maintainer
**Update when:** the source link, attribution, or example-selection guidance changes.

This is a reference to the AgentClinic mission specification published by DeepLearning.AI. It demonstrates the level of product detail a consuming project may choose to capture: mission, motivation, state model, user workflow, API shape, data model, failure behavior, analytics, and acceptance scenarios.

Read the source specification at [AgentClinic-Mission.md](https://github.com/https-deeplearning-ai/sc-spec-driven-development-files/blob/main/example_specs/AgentClinic-Mission.md).

## How to use this example

Use it for structure and specificity, not as an implementation mandate. Before adopting any part, write the consuming project’s own requirements, authority boundaries, privacy/security design, data retention, model policy, evaluation plan, and deterministic enforcement.

In particular, this template does **not** adopt the source example’s domain model, REST endpoints, API-key authentication pattern, LLM triage/diagnosis behavior, dashboard, automated treatment behavior, or medical metaphor. OpenAI Agents SDK, Prefect, and FastAPI are installed libraries, but runtime AI and web capability packs remain unconfigured and opt-in under [OPTIONAL_PACKS.md](../OPTIONAL_PACKS.md).

## Attribution

Source repository: `https-deeplearning-ai/sc-spec-driven-development-files`
Source path: `example_specs/AgentClinic-Mission.md`
Retrieved for reference: 2026-09-29
