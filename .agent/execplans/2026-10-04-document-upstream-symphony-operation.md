# Document and retarget upstream Symphony operation

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Let a fresh operator safely run the pinned upstream Symphony integration in this
repository and let a copied project retarget both user-directed GitHub work and
the upstream Symphony queue to its own `OWNER/REPOSITORY`. After this change,
the active guide gives the actual supported commands, safe one-worker queue
policy, dashboard/restart limits, review handoff, update/rollback path, and
copied-project bootstrap behavior without referring to the retired Python
runtime.

## Progress

- [x] (2026-10-04 04:38Z) Inspect #13, active operator/runbook/start guides,
  bootstrap implementation, and #39–#41 evidence.
- [x] (2026-10-04 04:39Z) Extend standard bootstrap to retarget `WORKFLOW.md`
  alongside `pyproject.toml`; add copied-project regression coverage.
- [x] (2026-10-04 04:40Z) Update fresh-operator and copied-project guidance
  with upstream-only operation, update/rollback, and evidence references.
- [x] (2026-10-04 04:40Z) Run bootstrap, Markdown, canonical, and real empty-
  queue upstream dashboard verification; record #13 review handoff.

## Surprises & Discoveries

- Observation: Bootstrap changes the user-directed repository target but did
  not retarget the upstream Symphony workflow's tracker repository.
  Evidence: `scripts/bootstrap_template.py` includes `pyproject.toml` but not
  `WORKFLOW.md` in its plan; it has no replacement for `repo: successbycs/template`.
- Observation: The #13 operator guide already correctly documents upstream-
  only operation and restart limits after #41.
  Evidence: `docs/guides/SYMPHONY_OPERATOR.md` names `WORKFLOW.md` and the two
  shell scripts, and says no custom SQLite event store or claim-recovery layer
  exists.

## Decision Log

- Decision: Extend the existing explicit bootstrap command rather than add a
  second Symphony-specific setup command.
  Rationale: The repository target is a single copied-project identity; the
  normal bootstrap operation already validates and records it. A second target
  prompt would be a divergent and error-prone configuration path.
  Date/Author: 2026-10-04 / Codex and repository owner.

## Outcomes & Retrospective

Both target surfaces now change through the standard bootstrap command. The
focused copied-template proof passed (4 tests), canonical verification passed
(36 tests), and a real upstream dashboard on temporary port 8767 returned an
empty healthy state with no eligible Issue. The owned test process exited after
its listener closed. Remaining work is a scoped local commit and #13
human-review handoff; no task dispatch, push, merge, deploy, or Issue closure
is part of this work.

## Context and Orientation

The retained official upstream interface consists of `WORKFLOW.md`,
`scripts/install_upstream_symphony.sh`, and
`scripts/run_upstream_symphony_dashboard.sh`. `WORKFLOW.md` is both official
upstream configuration and the worker prompt. Its `tracker.provider.repo` is
currently `successbycs/template`; after copying this template it must be the
new project repository before an operator starts Symphony.

`scripts/bootstrap_template.py` is the standard explicit personalization
command. It validates project, Python package, and GitHub repository names;
rewrites bounded template markers; renames the Python package; and writes
`.template-bootstrap-state.json`. Its test suite has a copied-tree fixture.
The change will add `WORKFLOW.md` to that same bounded list and substitute only
the known tracker line. It must preserve the upstream YAML/prompt format.

The current guide and local runbook are active documents. Historical Issue
records are not operator contracts and remain untouched. #39 proves install and
dashboard baseline, #40 proves upstream task/restart behavior, and #41 removes
the duplicate Python runtime.

## Plan of Work

Edit `scripts/bootstrap_template.py` so `_build_plan` includes `WORKFLOW.md`
and `_replace` replaces the exact upstream tracker repository marker with the
validated bootstrap repository. Make the copied-project test assert the updated
workflow target and preserve the existing repeatability guarantee.

Revise `GETTING_STARTED.md` to state that bootstrap retargets both the
user-directed workflow and upstream Symphony queue. Add a concise upstream
operator section that links the canonical guide instead of duplicating launch
instructions. In `docs/guides/SYMPHONY_OPERATOR.md`, add a copied-project
section, cite #39–#41 as the evidence path, and give exact update/rollback
guidance: inspect the pinned release/checksum before changing them; use Git
revert for checked-in integration changes; preserve ignored workspaces/logs.
Ensure the docs retain the current one-worker, credentials, start/stop,
dashboard, review, and restart limitations.

Run focused bootstrap tests, the canonical verifier, Markdown links, and a
real loopback upstream smoke test only when the GitHub eligibility queue is
empty. The process starts on a temporary port, its state endpoint is queried,
and the exact owned process is stopped.

## Concrete Steps

From `/home/chris/template`:

    .venv/bin/pytest -q tests/unit/test_bootstrap_template.py
    .venv/bin/python scripts/verify.py
    rg -n 'repo: successbycs/template|repository = "successbycs/template"' WORKFLOW.md pyproject.toml
    scripts/install_upstream_symphony.sh --dry-run
    SYMPHONY_DASHBOARD_PORT=8767 \
      SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" \
      GITHUB_TOKEN="$(gh auth token)" \
      scripts/run_upstream_symphony_dashboard.sh

Expected copied-project proof: after bootstrap with
`--github-repository example-owner/demo-app`, both `pyproject.toml` and
`WORKFLOW.md` name `example-owner/demo-app`; a repeat invocation changes
nothing. Expected smoke state is empty `blocked`, `running`, and `retrying`
arrays. Record actual evidence here before the #13 handoff.

Actual evidence (2026-10-04):

    .venv/bin/pytest -q tests/unit/test_bootstrap_template.py
    # 4 passed in 0.25s
    .venv/bin/python scripts/verify.py
    # Ruff lint/format, 36 tests, and Markdown links passed
    scripts/install_upstream_symphony.sh --dry-run
    # ready: v0.0.3 symphony-v0.0.3-linux_x86_64

The temporary upstream process on port 8767 returned:

    {"blocked":[],"running":[],"retrying":[],...,"counts":{"blocked":0,"running":0,"retrying":0}}

No open Issue carried `symphony:ready`. The owned process PID was 98574; its
listener closed after termination and the PID was absent after five seconds.

## Validation and Acceptance

| Capability | Proof | Required result |
| --- | --- | --- |
| Repository targeting | Copied-tree bootstrap test | Both user-directed and upstream tracker targets become the supplied repository |
| Fresh operation | Guides plus shell dry-run | Pinned version, prerequisites, ephemeral secret, queue, one worker, start/stop, dashboard, review, update/rollback are explicit |
| Runtime alignment | Text audit | No retired Python commands, custom SQLite/history guarantee, SMTP, or Terra/Astra active instruction |
| Documentation quality | `scripts/verify.py` | Lint, tests, and Markdown links pass |
| Retained real runtime | Upstream loopback smoke | Empty eligible queue returns healthy empty state and process stops cleanly |

## Idempotence and Recovery

Bootstrap stays idempotent for the same saved project/package/repository tuple.
It fails before overwriting a differently bootstrapped copy. The target rewrite
uses the exact source-template marker and is limited to `WORKFLOW.md`; Git
revert recovers the checked-in change. Never delete ignored `var/` workspaces,
logs, or tools to rerun this work. A dashboard port conflict requires a new
temporary port, never termination of an unknown process.

## Artifacts and Notes

Durable artifacts are this plan and #13's evidence comment. Evidence will cite
#39, #40, and #41 without treating old comments that advertised retired CLI
commands as current verification. No GitHub token or runtime log body is
committed.

## Interfaces and Dependencies

- Changed bootstrap input/output: `--github-repository OWNER/REPOSITORY` now
  writes the exact target to both `[tool.app-template.github].repository` and
  `WORKFLOW.md`'s `tracker.provider.repo`.
- Retained upstream launch: `scripts/install_upstream_symphony.sh --dry-run`,
  followed by the foreground launcher with `GITHUB_TOKEN` and explicit preview
  acknowledgement.
- Removed interface: no `app-template symphony` command exists after #41.
