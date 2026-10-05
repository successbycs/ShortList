# Definition of Ready

**Status:** template | **Owner:** change owner | **Update:** planning policy changes.

A material change has an outcome, scope/non-goals, owner, acceptance evidence, affected boundaries, and known decisions or questions before implementation begins.

User-directed coding sessions require no readiness or agent labels; select work
from the request, actual dependencies, and acceptance evidence.

## Symphony runtime eligibility (separate from coding sessions)

An Issue is eligible for deliberately started upstream Symphony dispatch only
when it is open and has `symphony:ready`. This is an explicit operator opt-in
to automation. Creating an Issue or adding it to a Project never enables it.

Before applying `symphony:ready`, confirm that the Issue has:

- a human accountable owner when the work needs one;
- a concise outcome, non-goals, acceptance evidence, and exact verification;
- code packets under a `## Code packets` heading, or an explicit statement that
  the work is unscoped and must be serialized;
- no unsatisfied native GitHub dependency; and
- planning evidence appropriate to the work's risk, as described in
  [Development Workflow](../workflows/DEVELOPMENT_WORKFLOW.md#planning-evidence-by-work-size).

The upstream workflow selects Codex execution; it does not route work through
repository-defined model labels or enforce a custom planning-artifact tier.
GitHub Assignees remain human accountability.

The checked-in upstream workflow uses a full-access Codex worker because the
supported `workspace-write` policy protects `.git` and therefore cannot make
the required local handoff commit. Treat every `symphony:ready` admission as
an explicit opt-in to that full-access worker policy. The operator must make
the separate per-launch acknowledgement documented in
[Symphony Operator Guide](../guides/SYMPHONY_OPERATOR.md#install-and-start-the-dashboard).

## Symphony human-review handoff

Once a Symphony worker has made its bounded local commit and recorded the
required verification/evidence comment, it removes only `symphony:ready` from
that same Issue and leaves the Issue open for human review. This is the one
tracker-visible stop condition for an otherwise open Issue. It does not grant
authority to change any other label, status, assignee, milestone, dependency,
Project field, Issue state, remote branch, deployment, or external service.

A human re-applies `symphony:ready` only when a reviewed follow-up packet is
deliberately ready for another upstream run.
