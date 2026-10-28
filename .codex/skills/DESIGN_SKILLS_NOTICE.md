# SDD, SEO audit and web-design skills: provenance

Added for ShortList Issue #60 on 2026-10-28. These skills are methods and checklists. They never authorise claims, pricing, publishing, outreach, tracking, provider changes or deployment. `docs/marketing/MARKETING_BRAIN.md`, approved requirements and explicit decisions from Chris take priority.

| Skill | Source | Licence | Notes |
| --- | --- | --- | --- |
| `sdd` | successbycs/marketing-agent `.agents/skills/sdd/` at `4ec7b69` | SuccessByCS original | See `sdd/UPSTREAM.md`. Use ShortList's own Issue, ExecPlan and review rules; it adds no second task system. |
| `seo-audit` | coreyhaines31/marketingskills `skills/seo-audit` (v2.2.2) at `17772c7`, via successbycs/marketing-agent `4ec7b69` | MIT (`seo-audit/LICENSE`) | Unchanged. Its `.agents/product-marketing.md` context file does not exist here; use `docs/marketing/MARKETING_BRAIN.md` instead. |
| `brand-designer` | magnus919/agent-skills `brand-designer`, via successbycs/cs-revenue-accelerator `b15d9cb` | MIT (declared in its `SKILL.md`) | Includes local `scripts/brand-book` (Python, files only, no network). Run it only when asked. |
| `design-critique`, `hierarchy-principles`, `type-selection`, `spatial-rhythm`, `quality-checklist` | Dragoon0x/taste-skills, via successbycs/cs-revenue-accelerator `b15d9cb` | MIT (upstream repository) | Labelled experimental upstream: judgement aids, not rules. Customer-facing results need human review. |

Paths and Issue numbers inside `sdd/UPSTREAM.md` and `seo-audit/NOTICE.md` (such as `.agents/skills/sdd/`, `.agents/product-marketing.md`, Issue 95/97/99) refer to successbycs/marketing-agent, not ShortList. `brand-designer/SKILL.md` names `agentskills/agent-skills` as its source; it was taken from `magnus919/agent-skills` and the upstream repo carries both names. Mentions of a vault or an `image_generate` tool in it describe its original setup and do not exist here.

## Codex and Claude Code

Each skill lives once in `.codex/skills/<name>/`. `.claude/skills/<name>` is a relative link to it, so Claude Code reads the same copy. Add a link whenever a skill is added. To roll back, revert the commit that added the skill and its link.
