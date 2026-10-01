# GitHub Issue Workflow

**Status:** active template | **Owner:** engineering lead | **Update:** GitHub target, state model, or session workflow changes.

This is the canonical workflow for user-started Codex task execution. GitHub
Issues hold task status, priority, and dependencies. An ExecPlan holds the
technical design, decisions, exact changes, and verification evidence. Do not
duplicate status tables in local plans.

## Configure and verify the target

The active target is `pyproject.toml` at `[tool.app-template.github]`.
Before every GitHub read or write, compare that value to the Git remote and use
an explicit `--repo OWNER/REPOSITORY` with `gh`. A copied template must be
bootstrapped with `--github-repository OWNER/REPOSITORY`; do not rely on the
source template's target.

If `gh auth status` or a read of the configured target fails, do not attempt
GitHub writes. Record proposed Issues and labels locally, continue only local
work, and report the exact access blocker. Authentication, credentials, and
repository settings are outside this workflow.

## Select and execute one task

At the user’s request, a Codex session performs this sequence:

1. List open Issues at the configured target and inspect labels, body, linked
   dependencies, and active ownership. Select the highest-priority eligible
   `status:ready` Issue; an unlabelled open Issue is backlog, not eligible.
2. Re-read the Issue immediately before changing it. Change only its
   task-status label to `status:in-progress`, preserving unrelated labels, and
   add a concise progress comment.
3. Apply the ExecPlan risk test in [Definition of Done](DEFINITION_OF_DONE.md).
   Read or create the required plan in `.agent/execplans/`, linking it and the
   Issue in both directions. The plan does not grant new authority.
4. Make the smallest coherent change, run the Issue’s acceptance checks, review
   the diff, and immediately record command, result, date, and remaining limits
   in the durable evidence artifact before reporting progress in chat. Update
   the verification matrix when the result proves a template requirement.
5. Create a local commit when the work is safely separable. Post a concise
   evidence comment, replace `status:in-progress` with `status:human-review`,
   and leave the Issue open. If a required check is blocked, use
   `status:blocked` instead and state the next action.

Do not close Issues, push, merge, assign, mention people, or start another task
without explicit authority. The workflow is session-driven, not an unattended
or scheduled automation.

## Task Issue contents

Each concrete task Issue includes purpose and scope, requirement IDs,
acceptance criteria, dependencies, repository-relative plan/document paths,
expected verification, exclusions, and authority boundaries. A tracking Issue
summarises baseline work and makes clear that local-only commits are invisible
to GitHub until a person pushes them.

When a concrete task claims an operational capability, its expected verification
must name the real operational boundary and the evidence that will prove it. If
the boundary cannot be exercised within current authority, the Issue must name
the exact blocker, the required owner/action, and the criterion that remains
unobserved. Follow [Definition of Done](DEFINITION_OF_DONE.md); mocks and
synthetic checks may support regression coverage but do not replace that proof.

The four task labels are created or reused only after a live target read confirms
the repository and duplicate labels are absent. GitHub's documented CLI
supports non-interactive Issue creation with title/body and labels; labels
require repository write permission. See [Sources](SOURCES.md).
