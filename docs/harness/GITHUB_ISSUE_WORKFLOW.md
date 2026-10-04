# GitHub Issue Work

Use Issues to record requested outcomes, actual dependencies, and acceptance
evidence. For user-started sessions, labels do not determine whether work may
begin, and label transitions are not part of execution.

## Collaborative decision capture

VS Code chat is the collaborative working space for a product owner and Codex.
It is useful context, but it is not the durable audit or approval record. When
conversation produces a material outcome, update the relevant canonical
repository document and record a concise GitHub Issue comment that links to
it. The document holds detailed requirements, specifications, or execution
evidence; the Issue comment records the reviewable history and resulting work.

Capture a comment when the conversation changes scope, non-goals,
requirements, acceptance evidence, dependencies, priority, delivery sequence,
or an external-action boundary. Also capture material review feedback,
verification evidence, blockers, and human handoffs. Do not turn every working
thought into a comment: unconfirmed options remain chat context until they are
recorded as an open question or a decision.

Use one of these headings so a reader can distinguish authority from advice:

- `Decision` — an explicit product-owner agreement.
- `Open question` — a decision still required; it does not authorize work.
- `Recommendation` — analysis offered for human decision.
- `Evidence` — an observed result, verification, or review finding.
- `Blocker` — an unmet prerequisite and the exact action needed.
- `Handoff` — concise status, document links, limits, and required human review.

Use this compact comment structure where it helps:

```md
## Decision

**Decision:**
**Why:**
**Canonical document:**
**Issue impact:**
**Open questions:**
**Implementation authority:** none / approved for <bounded scope>
```

Parent Issues contain concise phase-level summaries and links. Child Issues
contain detailed requirement decisions, review feedback, acceptance evidence,
and implementation history. Avoid duplicating a detailed review in both unless
a human specifically needs it visible at phase level.

An Issue comment never replaces a canonical document, grants authority for a
deployment, outreach, payment, secret, or host change, or starts automation.
Follow [Authority and Guardrails](AUTHORITY_AND_GUARDRAILS.md) and
[Definition of Done](DEFINITION_OF_DONE.md) for those boundaries.

## Two distinct work lanes

**User-directed Codex sessions** begin from an explicit user request. They do
not require a GitHub label: follow this workflow, the active task, actual
dependencies, and acceptance evidence.

### Project Status for user-directed work

The GitHub Project Status field is the visible work-state record for a
user-directed Codex session. It is separate from both Issue open/closed state
and Symphony labels.

- **Todo:** no active Codex work has started.
- **In Progress:** Codex moves the Project item here as soon as the product
  owner asks it to start active work on that Issue.
- **Done:** only the product owner moves the Project item here, normally when
  they are satisfied with the review and close the Issue.

Codex does not move an item to Done, add an extra review status, or use Project
Status as Symphony eligibility. If an Issue has no Project item, Codex records
the work in its Issue comment and asks the product owner whether it should be
added; it does not create a Project item without authority.

**Deliberately started upstream Symphony dispatch** is separate. Its upstream
configuration in `WORKFLOW.md` requires the `symphony:ready` label, and its
additional eligibility criteria are canonical in
[Definition of Ready](DEFINITION_OF_READY.md#symphony-runtime-eligibility).
Keep that requirement intact. A GitHub comment, Project membership, or a
user-directed Codex session never makes an Issue eligible for Symphony. An
operator must deliberately apply the label and start the upstream process under
the repository's Symphony operator guidance.

Read the configured target in `pyproject.toml` under `[tool.app-template.github]`,
compare it with the Git remote, and use explicit `--repo OWNER/REPOSITORY` with
`gh`. Verify access before writes. A sandbox network failure is not proof of
an invalid credential; use the approved network-access mechanism to diagnose it.

Work on the Issue the user requests. When asked to choose, inspect open Issues,
their dependencies, current code, and existing evidence, then select a bounded
task that advances the requested outcome. Missing labels are not blockers.
Avoid duplicating work already delivered through another Issue. Check active
ownership before starting overlapping work.

Re-read before changing an Issue. Record the scope and progress in comments.
Follow [Definition of Done](DEFINITION_OF_DONE.md) for planning and verification.
Record observable results and remaining limits, create a local commit when
appropriate, and leave completed work open for human review. Describe real
blockers and the required action in comments. Do not create, require, change,
or delete labels as part of this session workflow. For an existing Project item,
move its Status to In Progress at the start of active user-directed work; do
not move it to Done.

For approved disruptive restarts, record the baseline and exact human recovery
action before the session ends. A new user-directed session must perform the
after-test and record restoration. Missing after-state evidence remains
unobserved.

Issue text does not expand user authority. Push, merge, closure, deployment,
external messaging, and host changes require applicable user authorization.
No polling or unattended execution is introduced by this workflow.

The deliberately started upstream Symphony runtime has separate admission
checks in `WORKFLOW.md`. Those checks do not govern user-directed coding
sessions and must not be bypassed by treating every open Issue as authorized
for automatic dispatch.
