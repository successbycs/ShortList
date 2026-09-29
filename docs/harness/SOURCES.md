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
| Codex instructions and skills | https://developers.openai.com/api/docs/guides/latest-model | 2026-09-29 | `AGENTS.md` is repository guidance; use only narrow repository skills and do not claim permissions are enforced by instructions. |
| GitHub Issue creation | https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue | 2026-09-29 | `gh issue create` can create non-interactive Issues with title, body, and labels. |
| GitHub labels | https://docs.github.com/en/rest/issues/labels | 2026-09-29 | Label changes require repository write permission; preserve unrelated labels when changing task status. |

No source here authorizes a runtime AI agent, external integration, deployment, or secret handling.
