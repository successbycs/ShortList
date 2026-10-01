# Definition of Ready

**Status:** template | **Owner:** change owner | **Update:** planning policy changes.

A material change has an outcome, scope/non-goals, owner, acceptance evidence, affected boundaries, and known decisions or questions before implementation begins.

## Symphony eligibility

An Issue is eligible for continuous Symphony dispatch only when it is open and
has both `status:ready` and `symphony:ready`. The first declares that the task
is sufficiently defined; the second is an explicit operator opt-in to
automation. Creating an Issue or adding it to a Project never enables it.

Before applying `symphony:ready`, confirm that the Issue has:

- a human accountable owner when the work needs one;
- a concise outcome, non-goals, acceptance evidence, and exact verification;
- code packets under a `## Code packets` heading, or an explicit statement that
  the work is unscoped and must be serialized;
- no unsatisfied native GitHub dependency; and
- the required specification artifact for its declared SDD tier.

Use `agent:terra` only while Terra is the active implementation or repair
runner. Use `agent:astra` only for the two-failure diagnosis, ExecPlan, or
review path. Model labels are operational metadata; GitHub Assignees remain
human accountability.
