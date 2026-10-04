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
- the required specification artifact for its declared SDD tier.

The upstream workflow selects Codex execution; it does not route work through
repository-defined model labels. GitHub Assignees remain human accountability.
