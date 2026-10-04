# Complete the Symphony Set-up delivery programme

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #5 is the parent record for the reusable-template Symphony Set-up programme. It is not an executable work item. This plan coordinates evidence for every remaining child task so that a reviewer can decide whether #5 is ready for human review without accidentally enabling unattended work or live task dispatch. After the work, the template will retain a demonstrably safe, default-disabled single-worker baseline, its operator documentation and delivery policy, and a clear account of any external or human-review gap.

## Progress

- [x] (2026-10-04 02:25Z) Re-read the repository Issue workflow, Definition of Done, configured GitHub target, remote, and every currently open Issue.
- [x] (2026-10-04 02:25Z) Established the live dependency order from #5 and individual Issue bodies: #10, then #12, then #13, #16, and #24; investigate #21 independently; preserve #14's duplicate-scope handoff.
- [x] (2026-10-04 02:34Z) Updated #10's existing ExecPlan with fresh container test, verifier, and loopback boundary evidence; Issue handoff remains to be posted.
- [x] (2026-10-04 02:31Z) Revalidated #10 in locked Docker: 13 focused dashboard tests and the 77-test canonical verifier passed; the loopback HTTP proof passed while dispatch stayed false.
- [x] (2026-10-04 02:36Z) Repaired the proof harness's ambient Compose audit-path interference, added a focused regression test, and re-ran its full local proof with zero failed supported rows.
- [ ] Obtain explicit human review of #10 and all its stated prerequisite safety work before attempting #12.
- [ ] Execute the dedicated safe #12 demonstration only after its human-review and dedicated-Issue prerequisites are satisfied; record its external GitHub boundary result.
- [ ] Complete #13, #16, and #24 in that order, with their required reviews and evidence.
- [ ] Diagnose #21 without sending external email; record the exact missing authority or evidence.
- [ ] Refresh #14's duplicate-scope verification if dependencies changed, then leave it for human review.
- [ ] Refresh the final #17 retrospective only after every earlier Set-up task is evidenced or explicitly blocked; #18 is the last human review and may scope, but not execute, next-milestone work.
- [ ] Post a #5 parent handoff listing evidence, commits, exact verification, reviews, and unresolved blockers. Leave all completed Issues open for human review.

## Surprises & Discoveries

- Observation: The parent Issue's declared order is stricter than the historical master implementation plan: #12 precedes #13, whereas the older plan describes #13 before #12.
  Evidence: Current Issue #5 and #12/#13 bodies read on 2026-10-04; the current Issue declarations and user instruction control this plan.
- Observation: #10 is implemented locally but remains open for human review, which prevents a truthful #12 completion claim.
  Evidence: Issue #10's 2026-10-02 handoff names commit `c3240c6` and explicitly says #12 must wait for review.
- Observation: `WORKFLOW.md` configures `max_concurrent_agents: 2`, while #24 requires effective Terra concurrency one unless all gates pass.
  Evidence: `WORKFLOW.md:13`; the #24 acceptance criteria read on 2026-10-04. This is a safety item for #24, not grounds to enable concurrency.
- Observation: The generic deployed-software proof failed only its SQLite reopen row inside Compose because `APP_TEMPLATE_AUDIT_DATABASE_PATH` overrides the disposable TOML database path.
  Evidence: `var/proofs/issue-5-dashboard-20261004.json` showed `exit=0; event_reopened=False`, while `compose.yaml` supplies that environment variable and `src/app_template/config.py` gives environment higher precedence than TOML.
- Observation: After removing only that ambient variable from the proof child environment, all supported proof rows passed, including SQLite reopen and actual loopback dashboard start/stop.
  Evidence: `docker compose run --rm app uv run python scripts/prove_deployed_software.py --output var/proofs/issue-5-dashboard-20261004.json` returned `{"failed": 0, ...}` on 2026-10-04.

## Decision Log

- Decision: Treat #5 as a coordination and evidence task, not a task to claim or close directly.
  Rationale: Its body expressly forbids direct implementation and requires child evidence and human review.
  Date/Author: 2026-10-04 / Codex
- Decision: Keep #17 after the delivery and incident work, with #18 as the final human review.
  Rationale: The user corrected the sequence and the current Issue #17 body defines it as the final execution task.
  Date/Author: 2026-10-04 / Codex
- Decision: Do not send a test email while investigating #21 without a recipient and explicit authority for an external message.
  Rationale: A real provider request is externally visible and the Issue supplies neither a test address nor current send authorization.
  Date/Author: 2026-10-04 / Codex

## Outcomes & Retrospective

Pending. The programme is not ready for a completion claim until the child evidence and required human reviews are present. This section will name any remaining blocked boundary explicitly.

## Context and Orientation

`pyproject.toml` configures `successbycs/template`, which matches `origin`. `docs/harness/GITHUB_ISSUE_WORKFLOW.md` requires an explicit target verification before each GitHub write, durable Issue evidence, and open handoffs for human review. `WORKFLOW.md` keeps `runtime.live_dispatch: false`; its disabled Symphony runtime must not be used as unattended automation.

The active Set-up parent is GitHub Issue #5. Existing closed foundation Issues include #6 through #9, #11, #15, #19, #20, #22, and #23. The remaining relevant Issues are #10 (read-only dashboard), #12 (dedicated safe single-worker GitHub demonstration), #13 (operator guidance), #16 (three-tier delivery policy), #21 (email incident), #24 (concurrency gates), and #14 (already-delivered duplicate scope). #17 is the final retrospective and #18 is Chris's final review.

The dashboard implementation resides in `src/app_template/symphony/service.py`, with tests in `tests/unit/symphony/test_dashboard.py`, specification in `docs/specs/2026-10-02-read-only-dashboard.md`, guide in `docs/guides/SYMPHONY_DASHBOARD.md`, and prior execution record in `.agent/execplans/2026-10-02-complete-read-only-dashboard.md`.

## Plan of Work

First, repeat #10's focused tests, canonical verifier, and a real loopback-only dashboard smoke test with live dispatch confirmed false. Update #10's existing ExecPlan and post a concise new Issue handoff identifying the local commit and exact results. This does not substitute for human review.

Make the deployed-software proof self-isolating by removing only the ambient Compose audit-database override from its disposable child environment. This preserves the production configuration precedence contract while ensuring the proof actually reopens the database it configured. Cover the helper with a focused unit test and repeat the full proof.

After review is explicitly supplied, select or create the one dedicated disposable GitHub test Issue authorized for #12, then run the documented clean-start, restart, dashboard, dedicated-Issue read/write, and no-unrelated-dispatch checks. Keep dispatch disabled before and after. Record the external boundary result in the verification matrix, #12 plan, and Issue comment.

Only after #12's review, update the documentation-only #13 packet, then the #16 policy and its eligibility tests. For #24, first repair or explicitly constrain the apparent two-worker configuration so the effective default is one; implement and prove the eight requested safety gates without live dispatch.

In parallel only as safe read-only diagnosis, inspect #21's notification configuration, persisted delivery evidence, and tests. Do not send mail. Record whether the reported notification corresponds to a persisted disabled/failed/sent state, plus the precise human action needed for any real-provider proof.

Finally, revise #17 with the actual end state; #18 follows as the last human review. Update #5's parent handoff rather than changing state or closing it.

## Concrete Steps

Run from `/home/chris/template`:

    .venv/bin/pytest -q tests/unit/symphony/test_dashboard.py
    .venv/bin/python scripts/verify.py
    .venv/bin/python scripts/prove_deployed_software.py

Expected results are passing focused dashboard tests, lint/format/tests/link checks, and an HTTP proof of a loopback dashboard whose health reports `live_dispatch: false`. Docker may be used only as a local proof boundary and does not authorize a GitHub task mutation or email.

Before every Issue comment, re-read the Issue and recheck `pyproject.toml` plus `origin`; use `gh ... --repo successbycs/template`. Record commands, result counts, date, relevant commit, and remaining human/external limit.

## Validation and Acceptance

| Capability | Required operational boundary | Status rule |
| --- | --- | --- |
| #10 dashboard | Loopback HTTP service backed by SQLite plus focused tests | Pass only if read-only snapshot works and health reports dispatch false. |
| #12 safe demonstration | Dedicated GitHub Issue read/write with no unrelated Issue mutation | Requires explicit human review and dedicated target; otherwise blocked, not passed. |
| #13 guide | Fresh operator walkthrough and Markdown links | Pass only after #12 review. |
| #16 policy | Representative tier walkthrough and eligibility tests | Pass only after #13. |
| #21 email | Approved provider send and recipient receipt | Unobserved unless explicit send authority and recipient confirmation exist. |
| #24 concurrency | Eight gate tests and one-worker effective configuration | Pass only after #12/#13 review. |
| #5 parent | All child durable evidence, local commit/snapshot, exact results, and human reviews | Hand off for human review; never self-close. |

## Idempotence and Recovery

Focused tests, verifier, and disposable loopback proof are repeatable. Preserve `runtime.live_dispatch: false`; if a command changes a temporary database or starts a local server, use a temporary directory and stop only processes launched by this session. Do not alter GitHub labels, close Issues, push, deploy, or send messages. If a required human review or external authorization is absent, stop only that dependent milestone, document it, and continue read-only or independent work.

## Artifacts and Notes

The resulting evidence belongs in this plan, the child ExecPlan/specification where applicable, `docs/quality/VERIFICATION_MATRIX.md` for requirement-level proof, and a concise Issue comment. Existing worktree changes unrelated to this programme are preserved: template bootstrap fixes, the WSL workaround plan, interim retrospective correction, and `.playwright-cli/`.

## Interfaces and Dependencies

No new public interface is introduced by this coordination plan. Existing Symphony control points are `WORKFLOW.md` (`agent.max_concurrent_agents`, `runtime.live_dispatch`), `src/app_template/symphony/workflow.py` (validated configuration), `src/app_template/symphony/scheduler.py` (admission), and `src/app_template/symphony/service.py` (dashboard). GitHub Issues are an external source-of-truth boundary; SMTP is optional, disabled by default, and requires separately authorized provider proof.
