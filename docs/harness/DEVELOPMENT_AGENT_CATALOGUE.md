# Development Agent Catalogue

**Status:** active | **Owner:** template maintainer | **Update:** development harness changes.

The baseline agent is Codex, guided by `AGENTS.md`, `.agent/PLANS.md`, and the
project skills below. Skills are advisory instructions, not permission controls.

| Role | Coverage | Trigger / boundary |
| --- | --- | --- |
| `execplan-maintenance` | planning | Material multi-file work; creates or maintains an evidence-backed ExecPlan. |
| `github-issue-session` | implementation and review | Explicit request to select one ready GitHub task; follows the session workflow and never runs unattended. |
| review-only development role | review, autonomous-system design, lightweight web development | Inspect and advise on changes in those areas; it must not modify files or external state unless separately authorized. |

The review-only role is a documented behavior, not a separate native Codex
agent registration. No native agent definition or `.codex/config.toml` is
needed for these roles: current official documentation supports repo guidance
through `AGENTS.md` and skills through `SKILL.md`; this repository does not
claim discovery or enforcement testing beyond the currently loaded environment.
