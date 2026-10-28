# Symphony archive

**Status:** historical. Nothing here is current guidance.

Symphony was OpenAI's open-source coding-agent scheduler. Between late September
and early October 2026 this repository (then the reusable template) used it to
pick up GitHub Issues labelled `symphony:ready` and run Codex on them
unattended, one worker at a time. It was configured by a root `WORKFLOW.md` and
started with `scripts/install_upstream_symphony.sh` and
`scripts/run_upstream_symphony_dashboard.sh`.

Chris retired Symphony on 28 October 2026. ShortList work now runs as
Issue → branch → pull request → review by a different model → merge on green
checks. See [Review and merge in AGENTS.md](../../../AGENTS.md#review-and-merge).

What is kept here:

- [SYMPHONY_OPERATOR.md](SYMPHONY_OPERATOR.md): the old operator guide.
- [2026-10-04-symphony-coordinator-dashboard.md](2026-10-04-symphony-coordinator-dashboard.md):
  the upstream Symphony integration contract. Its "#39–#41" refer to Issues
  in the original template repository (successbycs/template), not ShortList.
- [2026-10-01-human-review-email-notifications.md](2026-10-01-human-review-email-notifications.md):
  an email-notification specification retired with the custom runtime
  (successbycs/template #19).

`WORKFLOW.md` and the two Symphony scripts were deleted; they remain in Git
history. The related ExecPlans are in
[.agent/execplans/archive/](../../../.agent/execplans/archive/2026-10-04-integrate-upstream-symphony.md).
