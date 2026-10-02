# Codex Operating Model

**Status:** active | **Owner:** template maintainer | **Update:** Codex workflow changes.

Codex is a build-time development agent. It follows `AGENTS.md`, uses ExecPlans
for material work, verifies changes, and reports evidence. When explicitly
asked to work from the queue, it follows the user-started session workflow in
[GITHUB_ISSUE_WORKFLOW.md](GITHUB_ISSUE_WORKFLOW.md). It is not a runtime
application agent, background worker, or task scheduler.

## Session scope and execution target

Before acting, establish the active task, repository, execution environment
(where a command runs), and affected resources (what the command reads or
changes). These may be different: a local command can affect an external
resource. Identify only the dimensions relevant to the proposed action, using
current user instructions, applicable repository configuration, and bounded
read-only observations. Safe local discovery may establish this evidence;
establish scope before even a read-only external probe.

Before a host, container, infrastructure, or external-resource operation,
verify the intended target with the smallest relevant check. Reconfirm relevant
target evidence after an environment switch, context loss where evidence is
missing, or conflicting evidence. Generic errors, available skills, remembered
environments, and discovered addresses are diagnostic clues, not target
identification or authority.

Select tools and skills only when their documented purpose and restrictions
are compatible with the established scope. A skill restricted to another machine is inapplicable.
A project-scoped skill may be compatible when its documented scope permits
the active project.

If material uncertainty remains, pause only the dependent operation, continue
safe unaffected work where useful, and request the missing decision. Record
target evidence when it materially affects a diagnosis, external action, or
handoff. This procedure is operating guidance, not mechanically enforced
isolation or permission to expand the user's task.
