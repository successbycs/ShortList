# Issue State Model

**Status:** active template | **Owner:** engineering lead | **Update:** GitHub workflow, label, or authority changes.

GitHub Issues are the canonical task-status queue. An open Issue with no
task-status label is backlog; a closed Issue is done. Use exactly one of these
labels for an open task: `status:ready`, `status:in-progress`,
`status:blocked`, or `status:human-review`. Preserve all unrelated labels.

`status:ready` means the task is in template scope, has acceptance criteria,
has no unsatisfied dependency or conflicting owner, and needs no additional
authority. `symphony:ready` is a separate, explicit opt-in for continuous
dispatch; both labels are required before the service may claim an Issue.
`status:in-progress` is a single active claimed run. A disruptive host restart
that ends that run must transition the Issue to `status:blocked` before the
restart; it has no active owner until a new user-directed session claims it.
`status:blocked` records the evidence and required next action, including a
human recovery handoff when applicable. `status:human-review`
means implementation and required checks are complete, the Issue remains open,
and a person must decide whether to close or merge.

Labels are not an atomic lock. If another active owner is found, do not compete:
stop and report the contention. Task text and labels never expand the current
user authorization. The long-running Symphony service is separately configured
in `WORKFLOW.md`, defaults to disabled live dispatch, and never closes Issues.

## Fresh GitHub observations

A scheduler decision is valid only when the host tracker has just observed the relevant Issue and each dependency. An unavailable read is `unknown`, not closed or ineligible: it must prevent a GitHub write and leave the local run available for a later fresh check. Do not treat retained labels on a closed Issue as evidence that it can run.
