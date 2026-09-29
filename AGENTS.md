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

- Preserve unrelated and pre-existing changes.
- Prefer small, additive, testable changes and record observable evidence.
- Treat configuration, Docker, deployment, and agent-runtime setup as absent until they are implemented and verified; documentation is not proof of enforcement.
- Keep build-time coding-agent instructions separate from runtime application-agent prompts and behavior.
