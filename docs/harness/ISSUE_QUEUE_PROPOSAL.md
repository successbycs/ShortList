# Historical GitHub Issue Queue Seed Record

**Status:** historical record (not a task queue) | **Owner:** template maintainer | **Update:** correct the creation evidence only.

This document was the local fallback while GitHub CLI authentication was invalid.
Authentication was later restored, the configured `successbycs/template` target
was read, and the proposed queue was created live. GitHub Issues are now the
sole canonical task-status source; do not update states here.

## Labels created live

After inspecting an empty open-Issue queue and existing labels, these four
labels were created on 2026-09-29 while preserving unrelated labels:

| Label | Meaning |
| --- | --- |
| `status:ready` | Eligible for one user-started session. |
| `status:in-progress` | Being worked by one active session. |
| `status:blocked` | Cannot proceed; evidence and next action are recorded. |
| `status:human-review` | Acceptance checks complete; remains open for a person. |

## Live records created from this seed

- [Template review and readiness tracking](https://github.com/successbycs/template/issues/1)
- [Repair template verification and activate Issue workflow](https://github.com/successbycs/template/issues/2)
- [Verify VS Code Dev Container attachment](https://github.com/successbycs/template/issues/3)
- [Observe remote CI for reviewed template commit](https://github.com/successbycs/template/issues/4)

Issue 2 received actual progress and verification comments and was moved through
the defined live status sequence. Issues 1 and 2 remain open for human review;
Issues 3 and 4 are blocked by their recorded external prerequisites. Those are
historical observations only—read the linked Issues for current state.
