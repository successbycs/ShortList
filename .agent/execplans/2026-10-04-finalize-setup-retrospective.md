# Finalize the Set-up milestone retrospective

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Turn the pre-migration interim snapshot into the final Set-up retrospective for
the completed upstream Symphony integration. The final report will distinguish
implemented and reviewed evidence from merely local publication status,
explicitly record separately deferred work, and give Chris a focused human
review decision in #45. It will not create new implementation scope.

## Progress

- [x] (2026-10-04 04:49Z) Verify deleted #17/#18, recreate the required final
  sequence as #44/#45, and repair #5/milestone references.
- [x] (2026-10-04 04:50Z) Refresh Issue states, commits, publication boundary,
  source/runtime configuration, and active documentation references.
- [x] (2026-10-04 04:51Z) Replace the interim retrospective with the final
  review draft and correct current stale #17/#18 references in active records.
- [x] (2026-10-04 04:52Z) Run Markdown/canonical validation: 36 tests, Ruff,
  formatting, and Markdown links pass; stale #17/#18 references are historical
  notes only.
- [ ] (2026-10-04 04:53Z) Commit the final report and hand off #44 for human
  review before publishing V1.

## Surprises & Discoveries

- Observation: Historical #17 and #18 were deleted, not merely closed.
  Evidence: GitHub REST endpoint requests returned HTTP 410. The Set-up
  milestone and #5 still referenced them.
- Observation: The delivery evidence records had accidentally been closed.
  Evidence: #39 and #40 were `CLOSED` at the parent audit, then reopened to
  meet the agreed open-for-human-review policy.

## Decision Log

- Decision: Use new #44 and #45 as successors to deleted #17 and #18 and name
  that replacement explicitly in the retrospective.
  Rationale: GitHub deleted Issues cannot serve as an auditable final task or
  review record; recreating the ordered pair preserves the agreed process.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Treat #42 and #43 as separate, deferred/review work rather than
  Set-up acceptance blockers.
  Rationale: #42 is an unintegrated isolated test artifact, while #43 is
  explicitly outside the milestone. Neither alters the verified upstream core.
  Date/Author: 2026-10-04 / Codex and repository owner.

## Outcomes & Retrospective

Pending handoff. The final report will state the current one-worker upstream
architecture, exact evidence, publication boundary, limitations, lessons, and
review decision. It will leave #44 open and direct #45 to be the final human
review without closing any Issue.

## Context and Orientation

The old `docs/retrospectives/2026-10-04-setup-milestone.md` was intentionally
changed to an interim baseline before the final delivery sequence. Its detailed
observations describe the retired custom Python runtime and deleted #17/#18
workflow; it cannot truthfully serve as the final record. The new report will
supersede it while retaining a short pointer to the interim nature of prior
observations.

The completed architecture is `WORKFLOW.md` plus
`scripts/install_upstream_symphony.sh` and
`scripts/run_upstream_symphony_dashboard.sh`, using official upstream v0.0.3,
one configured worker, a deliberate GitHub label, and foreground operation.
The source audit finds no custom Python Symphony code, old CLI, SMTP runtime,
or Terra/Astra routing. #39, #40, #41, #13, #16, and #5 contain current durable
evidence and remain open.

`origin/main` is `fef8599`. Four verified follow-up commits remain local:
`deb96fd`, `241525d`, `aec8375`, and `e3e5028`; they have not been pushed since
the last explicit push instruction. They must be reviewed and pushed only with
new authority. #42 remains an uncommitted worker-workspace proposal. #43 is
deferred host-service hardening outside Set-up.

## Plan of Work

Replace the final retrospective document with sections for scope, achieved
architecture, evidence matrix, current Issue/review state, deviations,
limitations, lessons, publication state, next-milestone recommendations, and
the exact #45 decision request. Correct the stale top `WORKFLOW.md` comment
that still describes a deleted transitional Python runtime. Correct the newly
created #5 acceptance plan to refer to #44/#45, not deleted #17/#18.

Run Markdown links and the canonical verifier. Audit no active source or doc
link points to deleted #17/#18 except clearly historical records. Commit only
the report, its ExecPlan, and directly related stale-reference corrections.
Post the concise evidence summary to #44 and leave it open.

## Concrete Steps

From `/home/chris/template`:

    gh issue list --repo successbycs/template --state open --milestone Set-up
    git log --oneline origin/main..HEAD
    .venv/bin/python scripts/check_markdown_links.py
    .venv/bin/python scripts/verify.py
    rg -n 'issues/17|issues/18|#17|#18' docs .agent GETTING_STARTED.md README.md

Expected report state: #5/#13/#16/#39/#40/#41/#44/#45 are open; #42 and #43
are separately open review/deferred work; the report names local unpublished
commits and makes no claim of remote CI for them.

## Validation and Acceptance

| Requirement | Proof | Expected result |
| --- | --- | --- |
| Current rather than interim report | Issue/commit/configuration audit | Final report reflects upstream-only architecture and #44/#45 sequence |
| Evidence traceability | Links to #39–#41/#13/#16/#5 | Each key claim has a durable child record |
| Honest boundary | Git log versus origin and limitations section | Local/unpublished changes and deferred work are explicit |
| Documentation quality | Markdown links and canonical verifier | Checks pass |
| Human handoff | #44 comment and #45 body | #44 stays open; #45 is the sole final decision point |

## Idempotence and Recovery

This is a documentation and evidence task. Re-running state collection updates
facts without changing runtime behavior. Git revert restores the prior report.
Do not push, merge, deploy, dispatch work, alter labels, or close Issues as
part of the retrospective.

## Artifacts and Notes

Durable artifacts are the final retrospective, this plan, and #44's open Issue
comment. Historical custom-runtime plans stay preserved as historical context;
the report must not treat them as current operator instructions.

## Interfaces and Dependencies

No runtime interface change other than correcting a stale explanatory comment.
#44 depends on #5 acceptance and precedes #45 human review. #43 remains
explicitly deferred outside the Set-up milestone.
