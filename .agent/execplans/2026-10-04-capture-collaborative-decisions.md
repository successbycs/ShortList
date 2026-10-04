# Capture collaborative decisions in durable GitHub records

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Make the collaboration model reviewable and repeatable. A product owner and
Codex can explore work in VS Code chat, but material outcomes become durable
only when the relevant canonical document and GitHub Issue record them. After
this change, a new contributor can find one authoritative procedure that
explains decision capture, parent/child Issue roles, and the boundary between
human-led product decisions and upstream Symphony engineering dispatch.

## Progress

- [x] (2026-10-04 10:40Z) Reviewed the governance, harness, workflow, quality,
  and operations documentation and selected `docs/harness/GITHUB_ISSUE_WORKFLOW.md`
  as the single canonical procedure.
- [x] (2026-10-04 10:50Z) Added the collaborative decision-capture procedure,
  reusable comment format, and explicit user-directed/Symphony two-lane
  distinction. Preserved `symphony:ready` as an upstream dispatch requirement.
- [x] (2026-10-04 10:50Z) Changed `AGENTS.md` to point to that procedure rather
  than duplicate it.
- [x] (2026-10-04 10:50Z) Kept README as orientation and updated the V1
  backport candidate to preserve Symphony's admission requirement.
- [x] (2026-10-04 12:03Z) Ran the focused diff and Markdown validation; the
  governance links are valid. The repository-wide checker still reports only
  pre-existing placeholder links in supplied `docs/product/discovery/Workflow.md`.
- [x] (2026-10-04 11:58Z) Recorded the governance and MVP-path handoff in
  Issue #17 for human review.

## Surprises & Discoveries

- Observation: The repository already requires progress and verification in
  Issue comments, but does not explain how material chat agreements become
  durable decisions.
  Evidence: `docs/harness/GITHUB_ISSUE_WORKFLOW.md` inspected 2026-10-04.
- Observation: `DEFINITION_OF_READY.md` uses `symphony:ready` only for
  deliberately started upstream dispatch, while user-directed Codex sessions
  do not require labels.
  Evidence: `docs/harness/DEFINITION_OF_READY.md` and `AGENTS.md` inspected
  2026-10-04.

## Decision Log

- Decision: Make `docs/harness/GITHUB_ISSUE_WORKFLOW.md` the one canonical
  source for collaborative decision capture.
  Rationale: It already governs Issue comments, human review, authority, and
  the distinction between user-directed work and Symphony dispatch.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Keep AGENTS as a pointer and keep runtime audit logs, template
  architecture decisions, readiness, and Definition of Done in their existing
  separate documents.
  Rationale: One policy source prevents duplicated or contradictory rules.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Preserve the upstream `symphony:ready` requirement for deliberate
  dispatch while retaining label-free user-directed Codex sessions.
  Rationale: The rules govern different entry points. Making the distinction
  explicit resolves apparent conflict without weakening upstream admission.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.

## Outcomes & Retrospective

The repository now has one durable procedure for turning material chat
agreements into canonical documentation plus a concise Issue audit trail. It
preserves the separate upstream Symphony admission rule, so a chat decision or
user-directed Codex session cannot accidentally dispatch work. The remaining
Markdown-check failures belong to intentionally preserved discovery source
material and do not invalidate the changed governance links.

## Context and Orientation

`AGENTS.md` is the entry-point instruction file for coding agents.
`docs/harness/GITHUB_ISSUE_WORKFLOW.md` governs a user-started session that
reads, changes, and reports GitHub Issue work. `docs/harness/DEFINITION_OF_DONE.md`
requires durable evidence rather than terminal/chat-only claims.
`docs/harness/DEFINITION_OF_READY.md` defines separate, explicit eligibility
for deliberately started upstream Symphony dispatch. `docs/workflows/DEVELOPMENT_WORKFLOW.md`
already delegates Issue execution guidance to the GitHub workflow.

The changed policy must use the following terms consistently:

- **Chat:** collaborative but transient discussion.
- **Canonical document:** the requirements, specification, ExecPlan, or other
  repository file that holds full durable detail.
- **Issue comment:** concise GitHub audit trail that links the document and
  records decision, evidence, blocker, recommendation, or handoff.
- **Parent Issue:** phase-level concise summary and links.
- **Child Issue:** detailed work, acceptance evidence, and implementation
  record.

## Plan of Work

First, add a `Collaborative decision capture` section to
`docs/harness/GITHUB_ISSUE_WORKFLOW.md`. It will define the trigger for a
durable record, explicit comment types, parent/child placement, a reusable
comment template, and the fact that comments do not grant external authority
or start Symphony.

Second, replace the duplicated user-session wording in `AGENTS.md` with a
short pointer to the canonical workflow, while retaining its target-verification
and no-unattended-runner safeguards.

Third, simplify `README.md` to orientation-level Symphony guidance and link
to the canonical workflow. Update `docs/product/BACKPORT_CANDIDATES.md` to
name the generic decision-capture policy as a candidate for the V1 template.
No product-specific ShortList requirement belongs in the V1 backport.

Finally, verify Markdown links and a focused diff. Add a concise Issue #17
comment that links the commit and leaves the governance change open for human
review. Do not alter `WORKFLOW.md`, enable Symphony, apply labels, or change
any GitHub Issue status.

## Concrete Steps

From `/home/chris/ShortList`:

    git status --short
    rg -n "GitHub Issue|Symphony|decision" AGENTS.md README.md \
      docs/harness/GITHUB_ISSUE_WORKFLOW.md docs/harness/DEFINITION_OF_READY.md
    python3 scripts/check_markdown_links.py
    git diff --check

Expected result: the changed governance documents link correctly and have no
whitespace errors. Existing user-supplied discovery source links may remain a
known repository-wide Markdown-check limitation and must be reported rather
than edited incidentally.

## Validation and Acceptance

- `AGENTS.md` points to `docs/harness/GITHUB_ISSUE_WORKFLOW.md` as the one
  decision-capture procedure.
- The canonical workflow defines material triggers, comment types, a template,
  parent/child placement, and authority/Symphony boundaries.
- README is orientation only and links to the canonical workflow.
- No policy claims that chat alone is durable evidence or that an Issue comment
  starts Symphony.
- Markdown link checking and `git diff --check` are run; pre-existing source
  material failures are recorded accurately.
- Issue #17 contains a concise human-review handoff with the commit link and
  no claim that the policy has been operationally enforced beyond documentation.

## Idempotence and Recovery

Documentation edits are safe to repeat. If a wording change duplicates a
policy owned elsewhere, remove the duplicate and retain only a link to the
canonical workflow. Do not change upstream Symphony configuration, labels,
dispatch state, or external services. Revert only this change's files if human
review rejects the policy; preserve unrelated product-requirements edits.

## Artifacts and Notes

- Canonical target: `docs/harness/GITHUB_ISSUE_WORKFLOW.md`.
- Existing ShortList orientation: `README.md`.
- Existing V1 backport record: `docs/product/BACKPORT_CANDIDATES.md`.
- Phase review record: GitHub Issue #17.

## Interfaces and Dependencies

No runtime interface, service, dependency, GitHub label, or Symphony workflow
configuration changes. The public documentation interface changes only:
`AGENTS.md` and `README.md` link to `docs/harness/GITHUB_ISSUE_WORKFLOW.md`.
The generic V1 backport remains a candidate until a later explicit template
change.
