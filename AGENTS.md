# Repository Instructions for Coding Agents

This repository is a reusable Python-first project template. Preserve its generic nature: do not add application domain logic, live external integrations, credentials, or optional services unless the active task explicitly requires them.

Read [`.agent/PLANS.md`](.agent/PLANS.md) before creating, updating, or implementing an ExecPlan.

## ExecPlans

For a complex feature, significant refactor, multi-file change with material design choices, migration, or work expected to span more than one focused session, first create an ExecPlan in `.agent/execplans/` using the exact requirements in `.agent/PLANS.md`. An ExecPlan is the task’s self-contained, living execution document; it is not a brief task list.

Use the filename `.agent/execplans/YYYY-MM-DD-<short-action-name>.md`. Before implementation, inspect the working tree and relevant repository guidance, then make the plan concrete. Keep the same plan updated throughout implementation, including every stop point. For small, low-risk changes, an ExecPlan is optional unless the user requests one.

To initiate one, use this prompt from the repository root:

    Create an ExecPlan for <desired outcome> following .agent/PLANS.md. Save it as .agent/execplans/YYYY-MM-DD-<short-action-name>.md. Inspect the repository first, resolve routine ambiguities in the plan, and do not implement the change yet.

An ExecPlan does not grant permission for destructive actions, production access, secret handling, or external side effects. Follow the user’s authorization and applicable repository instructions for those actions.

## Working conventions

- Before target-dependent operations, follow [Session scope and execution target](docs/harness/CODEX_OPERATING_MODEL.md#session-scope-and-execution-target).
- Preserve unrelated and pre-existing changes.
- Prefer small, additive, testable changes and record observable evidence.
- Treat configuration, Docker, deployment, and agent-runtime setup as absent until they are implemented and verified; documentation is not proof of enforcement.
- Keep build-time coding-agent instructions separate from runtime application-agent prompts and behavior.
- For work that changes ShortList positioning, offers, customer-facing website
  design or copy, SEO/GEO content, schema markup, marketing measurement,
  outreach, or sales material: read
  `docs/marketing/MARKETING_BRAIN.md` first, then use an applicable project
  skill in `.codex/skills/`. Product requirements, approved architecture,
  privacy/security controls, and explicit user decisions take priority.

## Disruptive host restart handoff

An approved host restart such as `wsl --shutdown` ends the active WSL Codex
session. It is a two-session procedure, not a resumable turn. Before the
restart, record the baseline and document the blocker in the Issue
with the exact human recovery action. A human reopens the workspace and starts
a new user-directed Codex session; that new session performs the after-test and
requests restoration. If either handoff or after-test is missing, record the
criterion as blocked or unobserved, not passed. Follow
`docs/operations/TROUBLESHOOTING.md`; do not add this manual host procedure to
Symphony runtime automation.

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

## User-started GitHub Issue sessions

When work involves a GitHub Issue, follow the canonical
[`docs/harness/GITHUB_ISSUE_WORKFLOW.md`](docs/harness/GITHUB_ISSUE_WORKFLOW.md).
It governs target verification, collaborative decision capture, comments,
human review, and the separate requirements for upstream Symphony dispatch.
