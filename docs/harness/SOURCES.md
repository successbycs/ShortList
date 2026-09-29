# Sources

**Status:** active source register
**Responsible role:** template maintainer
**Update when:** an external configuration format, capability, or policy basis is adopted or re-verified.

| Subject | Source | Verified | Use |
| --- | --- | --- | --- |
| ExecPlans | https://developers.openai.com/cookbook/articles/codex_exec_plans | 2026-09-29 | `.agent/PLANS.md` living-plan convention; the recipe is archived, so no model recommendation is adopted. |
| Codex skills | https://developers.openai.com/blog/eval-skills | 2026-09-29 | Repo-scoped `.codex/skills/<name>/SKILL.md` format. |
| Codex project configuration | https://developers.openai.com/plugins/build/plugins | 2026-09-29 | Project `.codex/config.toml` is trusted-project configuration; use only documented keys. |
| Agent Skills | https://developers.openai.com/api/docs/guides/tools-skills | 2026-09-29 | A skill is a `SKILL.md` manifest plus optional resources; runtime registration differs from Codex project discovery. |

No source here authorizes a runtime AI agent, external integration, deployment, or secret handling.
