# Retire the duplicate Python Symphony runtime

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Make the pinned official OpenAI Symphony executable the only coding-work
runtime retained by this template. A copied project will keep its ordinary
Python self-test harness, but it will no longer receive a second repository-
owned Python scheduler, GitHub tracker, Codex app-server client, dashboard,
SQLite event store, SMTP notifier, or Terra/Astra routing configuration. An
operator will still install and start upstream Symphony with `WORKFLOW.md` and
the checked-in scripts, then observe its upstream dashboard.

## Progress

- [x] (2026-10-04 04:33Z) Inspect #41, #40 evidence, current runtime code,
  active documentation, bootstrap tests, and canonical verifier.
- [x] (2026-10-04 04:34Z) Remove the duplicate Python runtime and its runtime-
  specific CLI and tests without deleting ignored evidence/workspaces.
- [x] (2026-10-04 04:35Z) Update the copied-project proof to name upstream
  scripts/configuration as the only Symphony interface; no active document
  required content changes because its runtime references were historical.
- [x] (2026-10-04 04:36Z) Run stale-reference detection, focused bootstrap
  proof, canonical verification, and an upstream dashboard smoke check.
- [ ] (2026-10-04 04:34Z) Commit scoped changes and record #41 evidence while
  leaving the Issue open for human review.

## Surprises & Discoveries

- Observation: The Python package has a complete parallel runtime, not merely
  a compatibility shim.
  Evidence: `src/app_template/symphony/` contains domain, tracker, runner,
  scheduler, workspace manager, service, notification, and workflow modules;
  tests under `tests/unit/symphony/` import them directly.
- Observation: The active upstream integration is already independent of the
  Python runtime.
  Evidence: `scripts/run_upstream_symphony_dashboard.sh` executes the pinned
  upstream binary against `WORKFLOW.md`; `docs/guides/SYMPHONY_OPERATOR.md`
  documents that path.
- Observation: The #42 `--check` implementation remains only in its isolated
  review workspace and is not part of `main`.
  Evidence: main's installer reports supported usage as `--dry-run|--print-path`;
  `var/symphony-upstream/workspaces-granular/GH-42` contains the uncommitted
  proposed change. #41 must not silently integrate that separate review item.

## Decision Log

- Decision: Delete the repository-owned `src/app_template/symphony/` package
  and its direct unit tests rather than preserve an unused compatibility layer.
  Rationale: #41 explicitly makes upstream Symphony the sole coding-work
  runtime. Retaining imports, command paths, SQLite code, or notifier code
  would contradict that architecture and confuse copied projects.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Retain historical evidence and specifications, but mark stale
  runtime documentation as historical rather than presenting it as active.
  Rationale: Historical records explain prior decisions without being an
  executable or operator-facing contract.
  Date/Author: 2026-10-04 / Codex and repository owner.

## Outcomes & Retrospective

The duplicate Python runtime is removed and upstream remains the only active
Symphony interface. The source/runtime reference audit returned no active
matches. The focused bootstrap test passed (4 tests), canonical verification
passed (36 tests), and a real upstream dashboard on temporary port 8766 returned
an empty state with no eligible Issue. The temporary listener closed after the
owned process was stopped. Remaining work is a scoped local commit and #41
human-review handoff; no push, merge, deployment, Issue closure, or runtime
task dispatch is part of this plan.

## Context and Orientation

`WORKFLOW.md`, `scripts/install_upstream_symphony.sh`, and
`scripts/run_upstream_symphony_dashboard.sh` are the retained upstream
integration. The workflow has a deliberate `symphony:ready` GitHub admission
label, one worker, and an ignored workspace root. #40 proved the actual
upstream scheduler-to-Codex-to-code path and a clean stop/restart path; it
remains open for human review.

The obsolete runtime is `src/app_template/symphony/`, exposed through the
`app-template symphony` subcommands in `src/app_template/cli.py`. It maintains
its own SQLite records under `var/symphony/events.sqlite3`, scheduler, GitHub
adapter, Codex client, workspace manager, and SMTP notification layer. The
matching direct tests are `tests/unit/symphony/`. The bootstrap assertion in
`tests/unit/test_bootstrap_template.py` currently assumes the obsolete package
is copied and must instead prove that a copied template keeps upstream files
and removes the old command surface.

The normal application audit store is not part of the obsolete runtime and
must remain. Ignored `var/` workspaces, tools, logs, databases, and existing
historical evidence are not deletion targets.

## Plan of Work

First remove the Python runtime directory and the direct runtime test directory.
Simplify `src/app_template/cli.py` to its generic health, self-test, and demo
commands; remove no-op imports only if the resulting lint/test checks show they
are unused. Do not alter the upstream `WORKFLOW.md` or launcher except if a
stale reference blocks the intended copied-project operation.

Then change the copied-project bootstrap test so it verifies package renaming,
the generic Python import, the retained `WORKFLOW.md` upstream configuration,
and the retained installer/launcher scripts. It must assert that the copied
Python package has no `symphony` directory and that `app-template --help` has
no obsolete `symphony` command.

Update active operator and runbook documentation to remove language implying
that local Python SQLite, dashboard, mail, or scheduler code remains. Preserve
historic records, marking any residual references as historical if needed.
Use exact search patterns to distinguish the active retained upstream
integration from prior evidence.

Finally run `scripts/verify.py`, the focused bootstrap test, and shell syntax/
installer checks. With no open `symphony:ready` Issue, start the actual upstream
launcher on a temporary loopback port, query `/api/v1/state`, and stop only the
new process. This proves removal did not break the retained official runtime;
it does not dispatch work.

## Concrete Steps

Run from `/home/chris/template`:

    rg -n 'app_template\.symphony|app-template symphony|events\.sqlite3|SYMPHONY_SMTP|Terra|Astra' src tests scripts docs WORKFLOW.md
    .venv/bin/pytest -q tests/unit/test_bootstrap_template.py
    .venv/bin/python scripts/verify.py
    bash -n scripts/install_upstream_symphony.sh scripts/run_upstream_symphony_dashboard.sh
    scripts/install_upstream_symphony.sh --dry-run

For the real retained-runtime smoke test, only when the queue is empty:

    SYMPHONY_DASHBOARD_PORT=8766 \
      SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" \
      GITHUB_TOKEN="$(gh auth token)" \
      scripts/run_upstream_symphony_dashboard.sh

Query `http://127.0.0.1:8766/api/v1/state`. Expected response is JSON with
empty `blocked`, `running`, and `retrying` arrays. Stop the foreground process
that this command created. Actual outputs and failures will be appended to this
plan before #41 is claimed complete.

Actual evidence (2026-10-04):

    .venv/bin/pytest -q tests/unit/test_bootstrap_template.py
    # 4 passed in 0.24s
    .venv/bin/python scripts/verify.py
    # 36 passed; Ruff lint/format and Markdown links passed
    scripts/install_upstream_symphony.sh --dry-run
    # ready: v0.0.3 symphony-v0.0.3-linux_x86_64

The real upstream smoke endpoint returned:

    {"blocked":[],"running":[],"retrying":[],...,"counts":{"blocked":0,"running":0,"retrying":0}}

No open Issue carried `symphony:ready`. The temporary process was PID 96882;
after its controlled stop, port 8766 no longer had a listener and the process
was absent after a five-second confirmation wait.

## Validation and Acceptance

| Capability | Proof | Required result |
| --- | --- | --- |
| Duplicate runtime removed | Source/test directory listing and stale-import search | No active Python Symphony scheduler, tracker, runner, SQLite, SMTP, or CLI path |
| Generic template retained | Focused copied-project bootstrap test | Package rename and standard Python import succeed; upstream files survive copying |
| Active guidance aligned | Markdown-link check and targeted text audit | Operator instructions name only upstream `WORKFLOW.md` and scripts |
| Canonical Python quality | `scripts/verify.py` | Ruff, formatting, pytest, and Markdown-link checks pass |
| Upstream runtime retained | Real launcher plus loopback state endpoint | Empty eligible queue produces healthy empty upstream dashboard state |
| No unwanted side effect | Git/GitHub scope audit | No worker dispatch, data deletion, push, merge, deployment, or Issue closure |

## Idempotence and Recovery

Deletion is limited to tracked duplicate source and direct tests. `git restore`
of the named paths recovers them before commit; after commit, the commit is the
rollback point. Never remove `var/`, local workspaces, logs, tools, databases,
or historical evidence. The upstream smoke run is repeatable when no eligible
Issue exists; port conflicts are a safe failure and require choosing another
temporary port rather than stopping an unknown process.

## Artifacts and Notes

Durable evidence will be this ExecPlan and a concise #41 Issue comment. The
#40 evidence comment documents upstream task execution and restart proof. No
GitHub token, runtime log body, database, or worker workspace diff is committed.

## Interfaces and Dependencies

- Retained: `WORKFLOW.md`, `scripts/install_upstream_symphony.sh`, and
  `scripts/run_upstream_symphony_dashboard.sh` are the sole template-facing
  Symphony interface.
- Removed: `app-template symphony ...` and all `app_template.symphony` Python
  imports/classes, including the SQLite/SMTP/Terra/Astra-era runtime contract.
- Copied project: bootstrap retains generic Python package behavior and the
  upstream files. A copied project changes `pyproject.toml` repository target
  before an operator deliberately runs upstream Symphony.
