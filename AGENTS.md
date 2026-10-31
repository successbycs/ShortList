# Repository Instructions for Coding Agents

This repository is **ShortList**, a website assessment product by SuccessByCS.
It has two parts:

- **The product: `apps/web`.** A TanStack Start (React, TypeScript) app that
  runs as the Cloudflare Worker `shortlist-web`, with a D1 database
  (`SHORTLIST_DB`) and a live OpenAI Responses provider. It serves
  shortlist.successbycs.com. Read [`apps/web/AGENTS.md`](apps/web/AGENTS.md)
  and [`apps/web/README.md`](apps/web/README.md) before changing it.
- **The reusable Python harness and template: the repository root.**
  `scripts/verify.py` (lint, tests, Markdown links), the small `src/shortlist`
  package, Docker Compose, the Dev Container and `scripts/bootstrap_template.py`.
  This is development tooling and a template for new projects; the product does
  not import it. Keep it generic: no ShortList product logic, credentials or
  live integrations in the root Python code.

Read [`.agent/PLANS.md`](.agent/PLANS.md) before creating, updating, or implementing an ExecPlan.

## Review and merge

Every change follows one path:

1. **Issue.** Work starts from a GitHub Issue in `successbycs/ShortList` that
   states the outcome, the files in scope and how to tell it is done.
2. **Branch.** One Issue, one branch, named like `issue/<number>-<short-name>`.
   `main` accepts changes only through pull requests.
3. **Pull request.** Open a PR that links the Issue (`Closes #<n>`), says what
   changed and how it was verified, and names the builder
   (`Built by: <tool / model>`).
4. **Review by a different model.** A model other than the builder reviews the
   PR and gives a verdict. Codex (Astra) reviews normally. While Codex is
   unavailable, Claude Sonnet 5.5 stands in, and the PR records that.
5. **Merge** only when both required checks are green (`verify` from
   `.github/workflows/ci.yml` and `web-quality` from
   `.github/workflows/web-ci.yml`) and the review verdict is **approve**.

Merging is not deploying. **Chris authorises** every deployment, every remote
D1 migration and any other production change (secrets, routes, provider
settings), each time. A merged PR, a green check or an Issue comment is never
that authority. See the [Release Workflow](docs/workflows/RELEASE_WORKFLOW.md).

## ExecPlans

For a complex feature, significant refactor, multi-file change with material design choices, migration, or work expected to span more than one focused session, first create an ExecPlan in `.agent/execplans/` using the exact requirements in `.agent/PLANS.md`. An ExecPlan is the task’s self-contained, living execution document; it is not a brief task list.

Use the filename `.agent/execplans/YYYY-MM-DD-<short-action-name>.md` and start
it with a one-line status (Active, Complete or Superseded, with a date). Move a
plan to `.agent/execplans/archive/` when it is Complete or Superseded. Keep the
same plan updated throughout implementation, including every stop point. For
small, low-risk changes, an ExecPlan is optional unless the user requests one.

An ExecPlan does not grant permission for destructive actions, production access, secret handling, or external side effects. Follow the user’s authorization and applicable repository instructions for those actions.

## Working conventions

- Before target-dependent operations, follow [Session scope and execution target](docs/harness/CODEX_OPERATING_MODEL.md#session-scope-and-execution-target).
- Preserve unrelated and pre-existing changes.
- Prefer small, additive, testable changes and record observable evidence.
- Never commit secrets or put them in logs. Name secrets (for example
  `OPENAI_API_KEY`), never their values.
- Do not force-push or rewrite published history.
- Keep build-time coding-agent instructions separate from runtime application-agent prompts and behavior.
- For work that changes ShortList positioning, offers, customer-facing website
  design or copy, SEO/GEO content, schema markup, marketing measurement,
  outreach, or sales material: read
  `docs/marketing/MARKETING_BRAIN.md` first, then use an applicable project
  skill in `.codex/skills/` (Claude Code reads the same skills through the links
  in `.claude/skills/`). Product requirements, approved architecture,
  privacy/security controls, and explicit user decisions take priority.
- An approved host restart (for example `wsl --shutdown`) ends the agent
  session; record the baseline and recovery action first, as the
  [Definition of Done](docs/harness/DEFINITION_OF_DONE.md#disruptive-host-restart-evidence)
  describes.

## Quality warnings

For test warnings and dependency deprecations, follow
[`docs/quality/TEST_STRATEGY.md`](docs/quality/TEST_STRATEGY.md) and
[`docs/architecture/DEPENDENCY_POLICY.md`](docs/architecture/DEPENDENCY_POLICY.md).
Do not suppress warnings without explicit human approval.

## Durable verification

Terminal output and chat updates are not durable completion proof. Follow
[`docs/harness/DEFINITION_OF_DONE.md`](docs/harness/DEFINITION_OF_DONE.md) to
record verification, and its risk criteria before deciding whether an ExecPlan
is required.

## GitHub Issues

When work involves a GitHub Issue, follow
[`docs/harness/GITHUB_ISSUE_WORKFLOW.md`](docs/harness/GITHUB_ISSUE_WORKFLOW.md)
for target verification, decision capture and Issue comments.

## Agent architecture and imported builder skills

Read [the agent architecture charter](docs/architecture/agent-charter.md) when
changing application-agent objectives, tools, prompts, work selection or lifecycle.
It requires honest decision ownership and observable proof; it does not replace the
local product design or authorise new runtime agents/background execution.

Imported from Shipright and adapted to this repository: [start-issue](.agents/skills/start-issue/SKILL.md),
[investigate](.agents/skills/investigate/SKILL.md), [review-pr](.agents/skills/review-pr/SKILL.md),
[SDD reference](.agents/skills/shipright-sdd/SKILL.md), and
[project-charter](.codex/skills/project-charter/SKILL.md). Codex and Claude can discover
these through their skill directories. Existing local workflows, SDD, prompt approvals,
review/merge checks and production permissions take precedence over imported examples.
