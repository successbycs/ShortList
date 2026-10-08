# Development Agent Catalogue

**Status:** active | **Owner:** template maintainer | **Update:** development harness changes.

The baseline agent is Codex, guided by `AGENTS.md`, `.agent/PLANS.md`, and the
project skills below. Skills are advisory instructions, not permission controls.

| Role | Coverage | Trigger / boundary |
| --- | --- | --- |
| `execplan-maintenance` | planning | Material multi-file work; creates or maintains an evidence-backed ExecPlan. |
| `github-issue-session` | implementation and review | User-directed GitHub task selection without label prerequisites; follows the session workflow and never runs unattended. |
| Marketing and website-design skills | product positioning, offer, customer research, site architecture, conversion design, copy, AI SEO and schema design | Read `docs/marketing/MARKETING_BRAIN.md` first; select only the applicable skill in `.codex/skills/`. The source/revision/licence notice is in `.codex/skills/MARKETINGSKILLS_NOTICE.md`. Skills are advisory and never authorise publishing, outreach, tracking, provider changes or deployment. |
| review-only development role | review, autonomous-system design, lightweight web development | Inspect and advise on changes in those areas; it must not modify files or external state unless separately authorized. |

## Bounded assistance roles

These are review patterns, not autonomous runtime agents or scheduler entries.
They do not change Symphony’s single-worker/human-handoff boundary.

| Role | Inputs and output | Authority and stop condition | Review owner |
| --- | --- | --- | --- |
| Issue evidence reconciler | Current Issue body/comments, requirements, commits and validation records; produces a criterion ledger and draft evidence comment. | Read-only until an explicitly authorised human/agent applies a reviewed comment or closure. Stop on missing evidence or conflicting criteria. | change owner |
| GEO contract evaluator | Versioned prompt contract and deterministic fixtures; produces schema/provenance, weak-evidence, compatible-question and prompt-injection results. | No provider call, secret, deployment, or customer input. Stop on schema/fixture ambiguity. | product and engineering owner |
| PR scope reviewer | Diff, linked Issue/ExecPlan and check results; produces scope/acceptance/rollback findings. | No merge, push, label, or Issue mutation. Stop when remote evidence is unavailable. | PR owner |
| Documentation-drift reviewer | Canonical requirements, SDD, README, release plan and implementation references; produces contradictory-claim findings. | No claim that local code is deployed. Stop on unresolved product decision. | product owner |
| Release-evidence collector | Explicitly approved command, target and redaction rules; produces a sanitised evidence artifact. | No deploy, retry loop, credential change, provider purchase, or production action outside the exact approval. Stop on unavailable/broken boundary. | release owner |

The review-only role is a documented behavior, not a separate native Codex
agent registration. No native agent definition or `.codex/config.toml` is
needed for these roles: current official documentation supports repo guidance
through `AGENTS.md` and skills through `SKILL.md`; this repository does not
claim discovery or enforcement testing beyond the currently loaded environment.
