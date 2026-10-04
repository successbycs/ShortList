# Set-up milestone final retrospective

**Status:** final review draft | **Owner:** Chris | **Snapshot:** 2026-10-04 UTC | **Source task:** [Issue #44](https://github.com/successbycs/template/issues/44)

## Scope and method

This final report supersedes the earlier interim baseline that was intentionally
captured before the upstream migration was complete. It reconciles current
GitHub Issue state, child evidence comments, the local commit graph, the
published `origin/main` boundary, active source/configuration, and local
verification results. It does not change runtime operation, GitHub labels,
deployment, or Issue state.

`Passed` means the named command or real operational boundary was observed and
recorded in the linked Issue. `Local only` means a commit exists in this
checkout but has not been pushed since the last explicit publication approval.
`Deferred` means deliberately out of the Set-up acceptance scope.

## Outcome

The template now uses official upstream OpenAI Symphony `v0.0.3` as its sole
coding-work runtime. The retained interface is:

- `WORKFLOW.md`: upstream GitHub tracker, deliberate `symphony:ready` queue
  admission, one worker, local isolated workspaces, and Codex app-server policy.
- `scripts/install_upstream_symphony.sh`: pinned Linux x86_64 installer with a
  published SHA-256 verification.
- `scripts/run_upstream_symphony_dashboard.sh`: explicit foreground launcher
  with an ephemeral `GITHUB_TOKEN` and upstream preview acknowledgement.
- `docs/guides/SYMPHONY_OPERATOR.md`: the active operator contract, including
  copied-project targeting, dashboard/restart limitations, and recovery.

The prior repository-owned Python Symphony scheduler, GitHub tracker, Codex
client, dashboard, SQLite event store, SMTP notifications, model routing, and
related CLI/test surface have been removed. The ordinary Python template audit
store remains unrelated and retained.

## Evidence matrix

| Delivery outcome | Evidence | Status |
| --- | --- | --- |
| Pin upstream installation, GitHub connectivity, and dashboard | [#39 dashboard proof](https://github.com/successbycs/template/issues/39#issuecomment-5976416984), commit `560964f` | Passed |
| Select and execute one real code-changing Issue | [#40 end-to-end proof](https://github.com/successbycs/template/issues/40#issuecomment-5976587000), isolated #42 workspace | Passed |
| Observe upstream restart behavior | [#40 restart proof](https://github.com/successbycs/template/issues/40#issuecomment-5976587000) | Passed: workspace persisted; state was reconstructed from tracker eligibility, not a custom history store |
| Retire duplicate Python runtime | [#41 evidence](https://github.com/successbycs/template/issues/41#issuecomment-5976622386), commit `deb96fd` | Passed, local only |
| Safe copied-project target and operator guide | [#13 evidence](https://github.com/successbycs/template/issues/13#issuecomment-5976641958), commit `241525d` | Passed, local only |
| Lightweight planning guidance without custom policy engine | [#16 evidence](https://github.com/successbycs/template/issues/16#issuecomment-5976656964), commit `aec8375` | Passed, local only |
| Parent delivery acceptance | [#5 matrix](https://github.com/successbycs/template/issues/5#issuecomment-5976672972), commit `e3e5028` | Passed, local only |

The current canonical local verification result is `36 passed`, with Ruff
lint/format and Markdown links passing. The copied-project bootstrap regression
has `4 passed` and confirms that both `pyproject.toml` and `WORKFLOW.md` change
to the supplied `OWNER/REPOSITORY`. Empty-queue upstream dashboard smoke tests
on ports 8765, 8766, and 8767 returned empty `blocked`, `running`, and
`retrying` arrays; each owned process was stopped after the observation.

## Current review and publication state

The following Set-up records are intentionally open for human review: #5,
#13, #16, #39, #40, #41, #44, and #45. #39 and #40 were reopened after the
parent audit found they had been closed contrary to this review policy; their
evidence remains intact.

`origin/main` currently ends at `fef8599`. The following verified commits are
local only and need a separate explicit push decision:

- `deb96fd refactor: retire duplicate python symphony runtime`
- `241525d docs: document upstream symphony operation`
- `aec8375 docs: define lightweight delivery tiers`
- `e3e5028 docs: record upstream symphony setup acceptance`

No remote CI claim is made for those four commits. A future push/review should
observe CI for the exact published revision rather than reuse historical green
runs as substitute evidence.

## Deliberate exceptions and limitations

- [#42](https://github.com/successbycs/template/issues/42) is a review artifact
  from the real #40 worker test. Its proposed offline installer `--check` change
  remains uncommitted in its isolated workspace and was not silently integrated.
- [#43](https://github.com/successbycs/template/issues/43) is deferred host-
  service hardening. It would add operator-owned supervision, status, bounded
  restart, and logs independently of VS Code or a terminal; it is not required
  for the foreground upstream baseline.
- Upstream Symphony does not provide an exact durable continuation of an
  interrupted Codex turn. It preserves local workspace/log evidence and polls
  GitHub eligibility after restart. The template deliberately adds no duplicate
  SQLite claim-recovery or event-history runtime.
- The one-worker setting is intentional. Multi-worker qualification, custom
  model routing, custom SMTP, and a Prefect wrapper are excluded from this
  milestone.

## What worked

1. Treating upstream as the executable reference removed duplicate scheduler,
   dashboard, storage, and routing responsibilities from the template.
2. A deliberately labelled single child Issue made the real scheduler-to-Codex
   proof bounded and inspectable.
3. Separating user-directed GitHub sessions from deliberate upstream queue
   admission preserved review control.
4. Retargeting both `pyproject.toml` and `WORKFLOW.md` in the existing bootstrap
   command removed a significant copied-project safety gap without inventing a
   second setup path.
5. Keeping completed Issues open produced a durable human-review record rather
   than conflating evidence collection with acceptance.

## Improvements for a future milestone

1. Decide whether to review, integrate, or reject #42's isolated installer
   proposal through a normal scoped change.
2. Decide whether #43's supervised host service is warranted for the target
   host; it should preserve explicit credentials and upstream boundaries.
3. If the four local commits are accepted, authorize a separate push and
   observe remote CI at that exact commit.
4. Keep future release work bounded by the lightweight planning guidance: an
   Issue for small work, a concise spec for material work, and an ExecPlan when
   the risk test requires one.

## Final review requested

Issue #45 is the final human-review record. Chris should decide whether the
Set-up milestone is accepted, whether the locally verified follow-up commits
should be published through a separately authorized workflow, and whether #42
or #43 becomes a newly scoped follow-up. This retrospective does not make any
of those decisions or close an Issue.
