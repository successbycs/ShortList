# Plan a supervised upstream Symphony host service

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Implement the optional host-service requirement in GitHub Issue #43 so an
operator can deliberately start the existing upstream Symphony runtime, close
the launching terminal and VS Code, and inspect or stop the owned service from
another terminal. The host service manager will own the process, provide logs,
and allow a bounded number of recoveries after a crash. Symphony will continue
to supply scheduling, the one-worker limit, GitHub integration, Codex execution,
and its dashboard.

This document is a design-only deliverable requested on 2026-10-04. It does not
authorize implementation, service installation or startup, credential access,
GitHub changes, host configuration, or WSL restarts. All future commands below
are instructions for a subsequently authorized implementation session. The
service is not implemented or operationally verified by creating this plan.

The proposed first deployment is an explicitly started, transient systemd user
service. Systemd is Linux's service manager; a user service runs under the
operator's existing Linux account, and a transient service is created for a
particular run rather than installed to start at boot. After a host or WSL
restart, the operator deliberately starts a new run. On WSL, keeping a Linux
service alive does not itself keep the WSL virtual machine alive. Terminal
independence therefore needs real host proof before it can be promised.

## Progress

- [x] (2026-10-04 05:07Z) Read the planning contract, operating model, completion
  policy, current workflow, installer, launcher, specification, and operator
  guide; inspect the working tree without changing existing work.
- [x] (2026-10-04 05:10Z) Read the current #43 requirement from the verified
  `successbycs/template` target; inspect upstream-operation and restart evidence.
- [x] (2026-10-04 05:14Z) Record the proposed host model, credential boundary,
  operator commands, bounded recovery, WSL limitations, and acceptance proof.
- [x] (2026-10-04 05:14Z) Validate the documentation: the Markdown link checker
  passed and `git diff --check` reported no errors. Stop at the requested
  planning boundary; no service or host configuration was changed.
- [ ] After implementation authorization, verify dependency acceptance and
  prototype the host service manager and credential provider without Symphony
  dispatch; record the supported host decision.
- [ ] Implement the optional service control and launch adapter, with focused
  tests and no new scheduler or application dependencies.
- [ ] Prove actual service lifecycle, dashboard access, detached operation,
  bounded recovery, credential handling, and explicit restart behavior.
- [ ] Update the specification, operator guidance, verification matrix, and #43
  evidence, leaving human review and any unobserved host boundary explicit.

## Surprises & Discoveries

- Observation: Merely finding `systemctl` is not proof that a user service will
  work. The parent session observed both user and system managers reporting
  `degraded`; this can mean unrelated failed units, not necessarily an unusable
  manager. Evidence: planning-session read-only host observations. Recheck the
  exact failed units and session lifecycle during the prototype; do not repair
  unrelated units or alter system configuration as part of diagnosis.
- Observation: WSL's systemd services do not themselves keep a WSL instance
  alive. Evidence: Microsoft's current WSL systemd documentation, checked on
  2026-10-04, linked in Artifacts and Notes. A user service alone cannot justify
  an unconditional claim that closing every WSL application preserves it.
- Observation: The current operator guide forbids automatically embedding the
  preview acknowledgement in service definitions. Evidence:
  `docs/guides/SYMPHONY_OPERATOR.md`, “Install and start the dashboard.” The
  service must carry a caller-supplied acknowledgement for one deliberately
  started run and its bounded recoveries, never add it by default.
- Observation: A completed worker response is not a durable stop condition if
  its GitHub Issue remains open and eligible. Evidence:
  `.agent/execplans/2026-10-04-prove-upstream-symphony-execution.md` records
  additional turns for #42 and preserved workspaces after restart. Service
  recovery may reselect such an Issue; it does not establish exactly-once work.
- Observation: #43 still names retired #17/#18 dependency identifiers and its
  deferred Set-up status. Evidence: `gh issue view 43 --repo
  successbycs/template --json body,state,milestone` returned OPEN, no milestone,
  and dependencies #40/#41/#13/#16/#5/#17/#18. Before implementation, reconcile
  the current acceptance records, including replacement retrospective/review
  #44/#45. Planning does not change Issue status or release eligibility.

## Decision Log

- Decision: Plan only; stop after the plan is written and checked.
  Rationale: The user's latest instruction explicitly excludes implementation.
  Date/Author: 2026-10-04 / Astra.
- Decision: Use upstream Symphony unchanged with an optional systemd user
  service, started using `systemd-run --user` as a transient unit.
  Rationale: This delegates process supervision to the host's standard manager,
  adds no scheduler, and avoids root access, boot enablement, and a persistent
  unit containing an acknowledgement or secret.
  Date/Author: 2026-10-04 / Astra.
- Decision: Use explicit start and manual recovery after host/WSL restart;
  bounded process recovery applies only to the already authorized run.
  Rationale: The preview acknowledgement and credentials must be available at
  the deliberate start boundary. Boot startup, lingering user managers, and a
  Windows scheduled task are different lifecycle decisions with host effects.
  Date/Author: 2026-10-04 / Astra.
- Decision: Prototype an existing secure credential provider first. The service
  adapter may obtain a GitHub token from an explicitly selected `gh` account
  backed by the host's secure store; it must never save that returned token.
  Rationale: A systemd service does not inherit an interactive shell's token.
  Retrieving a token inside the service avoids token-bearing unit properties,
  manager environment, configuration files, and process command arguments.
  Plaintext GitHub CLI fallback storage is not an accepted service prerequisite.
  The scope and limitations of this decision are detailed below.
  Date/Author: 2026-10-04 / Astra.
- Decision: Allow three total process starts per armed unit, separated by ten
  seconds on failure, with no automatic reset of the budget.
  Rationale: `Restart=on-failure`, `RestartSec=10s`,
  `StartLimitIntervalSec=infinity`, and `StartLimitBurst=3` provide a finite
  initial start plus at most two retries without a custom recovery loop.
  Date/Author: 2026-10-04 / Astra.

## Outcomes & Retrospective

Planning is complete; implementation and every service capability remain
unobserved. The design preserves the generic template and makes two prerequisites
explicit: a usable service-manager lifecycle and a credential source available
without a terminal or new token persistence. WSL terminal independence is a
host-specific acceptance gate, not an assumed feature of systemd. A failed gate
must remain visible rather than be replaced with a narrower claim of success.

## Context and Orientation

The repository is `/home/chris/template`, with both Git origin and
`[tool.app-template.github].repository` in `pyproject.toml` identifying
`successbycs/template`. Copied projects use the bootstrap workflow to change
that target and `WORKFLOW.md` together. New service code must derive its checkout
and repository identity rather than hard-code Chris's path or account.

`scripts/install_upstream_symphony.sh` pins the official Linux x86_64 upstream
v0.0.3 asset and SHA-256. `scripts/run_upstream_symphony_dashboard.sh` requires
`GITHUB_TOKEN`, `SYMPHONY_UNSAFE_PREVIEW_ACK="I understand"`, and `codex`, verifies
the installed binary, and replaces its shell with the upstream executable.
It supports `SYMPHONY_DASHBOARD_PORT`, `SYMPHONY_WORKSPACE_ROOT`,
`SYMPHONY_LOGS_ROOT`, and `SYMPHONY_SOURCE_REPO`. Defaults keep logs and isolated
Issue clones below ignored `var/symphony-upstream/`. A workspace is a separate
clone where a worker edits code; preserving it does not commit, integrate,
publish, or resume that change automatically.

`WORKFLOW.md` configures the GitHub tracker, open Issues bearing
`symphony:ready`, `max_concurrent_agents: 1`, and `max_turns: 20`. It uses Codex
app-server and rejects interactive approval requests. The prompt requires human
review and forbids unapproved push, merge, deploy, or Issue closure. The service
does not alter that workflow, grant new GitHub authority, manage labels, detect
business completion, or spawn a parallel worker itself.

`docs/specs/2026-10-04-symphony-coordinator-dashboard.md` is the active product
contract despite its historical filename. `docs/guides/SYMPHONY_OPERATOR.md`
defines foreground operation. `docs/quality/VERIFICATION_MATRIX.md` records
requirement evidence; `docs/operations/TROUBLESHOOTING.md` defines the two-session
handoff for approved disruptive WSL restarts. Existing Codex authentication and
GitHub authentication are host prerequisites; this feature does not provision
either identity.

At inspection, unrelated changes existed in the WSLg plan, upstream proof plan,
`docs/INDEX.md`, an untracked readiness plan, `.playwright-cli/`, and
`erl_crash.dump`. Preserve them. Treat the crash dump as potentially sensitive;
do not print it or include it in a commit. This planning task creates only this
ExecPlan.

## Plan of Work

### Milestone 1: Prove the supported host and credential model

The goal is to select a deployment that can satisfy #43 before writing a
production service adapter. Re-read current Issue dependencies and approval
records, inspect Linux distribution/architecture, systemd version, PID 1, user
manager connection, failed units, user session lifetime, and existing listeners.
Use bounded read-only observations first. A `degraded` result is a diagnosis
input, not permission to repair the host. Preserve any existing Symphony process;
do not reuse its PID or port without identifying its owner.

After implementation is authorized, use a disposable non-networking systemd
user unit to prove detached lifecycle, finite restart settings, process-group
cleanup, and manager support for each property below. Use only an isolated test
unit and synthetic secrets at this milestone. Do not use GitHub labels or a real
worker to test service-manager behavior.

The preferred supported host is Linux x86_64 with a functioning user manager
that remains alive for the intended session. On WSL, record the distribution
and Windows/WSL versions. Closing every terminal and VS Code must be tested from
an independent Windows observer; opening another WSL command to observe the
result can start WSL again and hide the failure. If WSL exits, record the WSL
acceptance as blocked. The two deployment choices are then a continuously
running Linux host or a separately reviewed Windows Task Scheduler entry that
owns an explicit `wsl.exe` invocation. Do not silently add that task, a keepalive
loop, root service, `loginctl enable-linger`, or `/etc/wsl.conf` changes. Any
Windows design must name its user, distribution, start trigger, stop behavior,
credential boundary, and whether it merely launches WSL or actually holds the
required lifetime; a task that starts WSL and exits proves none of this.

Prototype token retrieval from the selected existing GitHub CLI secure-store
account inside the transient user service, without printing or persisting the
value. Verify the provider works after the launching terminal closes. Run with
GitHub token environment overrides removed so the test does not accidentally
inherit shell credentials. Reject plaintext `hosts.yml` fallback and a provider
that prompts for unlock in the service. Do not run `gh auth login`, store a
token, or change the user's secret store as part of this prototype.

This service writes no new credential files. An existing secure provider or
Codex authentication may already store credentials outside the repository; that
is a separate, declared host boundary. If “no credentials written to disk” is
intended to forbid even these pre-existing stores, or the host only supplies an
ephemeral shell token, this provider model is not sufficient. Record the exact
gap and require an explicitly reviewed, memory-only credential mechanism before
real service execution. Do not weaken that requirement with an `EnvironmentFile`,
token in a transient unit, token on a command line, or new plaintext file.

Proof for this milestone is a supported-host decision and actual disposable-unit
results, plus a credential-provider availability result that reveals no secret.
No real service acceptance may be marked passed from these supporting tests.

### Milestone 2: Add a thin, optional operator interface

Add `scripts/symphony_service.py`, using Python's standard library only, with
subcommands `check`, `start`, `status`, `logs`, `stop`, and `disable`. Resolve a
canonical checkout path and derive a deterministic unit name from its SHA-256
prefix so two copies cannot accidentally share a unit. Use argument arrays for
subprocess calls, never shell evaluation. Service setup is opt-in; installation
of the Python template or a copied project must not start anything.

`check` performs local prerequisite checks without fetching credentials or
starting a process. It reports the unit name, target repository, checkout,
workspace path, dashboard address, pinned binary availability, service-manager
support, and applicable WSL limitation. Missing or conflicting paths, two
different repository targets, root execution, unsupported architecture, or
an occupied dashboard port yield an actionable failure. Validate spaces and
non-ASCII paths. Report other checkouts using the same tracker separately: one
worker is an upstream per-runtime limit, not a global distributed guarantee.

`start --acknowledge-preview 'I understand' --github-user ACCOUNT` requires the
exact acknowledgement on every newly initiated run and names the credential
identity deliberately. It creates a transient user unit, with no install/boot
target, whose `ExecStart` invokes the new adapter described below. Non-secret
unit properties bind the canonical repository/configuration paths and explicit
resolved executable paths; do not depend on interactive shell initialization.
Do not forward the caller's whole environment to systemd. Do not submit a token
in `--setenv`, service properties, or manager environment. A running unit with
the same name must yield “already running” without starting another instance.

Use `Type=exec`, `Restart=on-failure`, `RestartSec=10s`,
`StartLimitIntervalSec=infinity`, `StartLimitBurst=3`, `RestartPreventExitStatus=78`,
`TimeoutStopSec=30s`, `KillMode=control-group`, `UMask=0077`, and `LimitCORE=0`.
Exit 78 denotes invalid configuration, missing acknowledgement, or unavailable
credentials and prevents futile recovery. Verify support using the installed
manager; do not silently drop unsupported properties. Keep a failed unit
inspectable until the operator explicitly stops/disables or starts a newly
acknowledged run. A start may deliberately reset that unit's failed state only
after reporting the prior failure; nothing automatically resets the budget.

Add `scripts/run_upstream_symphony_service.sh`, which validates the bound
configuration and credential account, disables shell tracing, obtains the
GitHub token inside its process from the approved provider, exports it only to
the upstream process, and `exec`s the existing foreground launcher. Resolve
`codex`, `git`, and `gh` paths during setup and make them available in a minimal
service PATH. Do not change Codex authentication or broaden sandbox permissions.
Prevent core dumps for the owned process tree; record the limits of memory and
same-user process access rather than claiming protection from the host owner.
Do not download new software as a hidden recovery step: require the pinned
binary to be installed and verified before arming the service. If the existing
launcher needs a verified-install-only mode, add a small supported flag and
regression test there; retain its normal foreground interface.

`status` returns systemd state/result, owned PID, restart count/budget, dashboard
HTTP health, checkout, and configured tracker. Distinguish a running process
from a healthy HTTP endpoint or a successfully authenticated tracker. An HTTP
200 alone does not prove credentials work. `logs --lines 100` reads only the
owned unit's journal and identifies the upstream logs directory. Neither
command dumps environment variables, tokens, auth files, or arbitrary unit
properties. `stop` uses systemd's normal stop for exactly the derived unit and
verifies that its control group and dashboard listener are gone. It must not
restart the service after a deliberate stop. The documented 30-second stop may
end with systemd killing the owned process group; preserve workspaces/logs and
report that outcome plainly. `disable` performs that stop and removes only the
owned transient activation; no persistent boot enablement exists to undo.

Proof is focused tests for arguments, targeting, secret exclusion, idempotence,
failure reporting, and unchanged foreground behavior, plus real transient-unit
lifecycle checks. Avoid duplicating systemd or upstream logic in Python.

### Milestone 3: Prove actual operation and update guidance

With host prerequisites and authority established, verify an empty eligible
queue for the exact target, use the existing pinned runtime, and start one
supervised instance on an available loopback port. If an eligible Issue exists,
do not dispatch it incidentally or remove its label implicitly; use the
explicitly approved test scope or wait for the operator to resolve admission.

Record actual dashboard/API responses, service identity, process tree, and
restart count. Close the launch terminal and VS Code, then check the dashboard
from a genuinely independent observer after at least two minutes and beyond
any known host idle timeout. Record observer method and elapsed interval. On
WSL, this test must include closing all WSL terminals and account for VM exit.
Repeat using an actual controlled crash of the owned empty-queue service,
observing one replacement PID and no orphan Codex/BEAM processes; use a
disposable synthetic unit to exhaust the complete three-start budget safely.

Prove that an unavailable credential provider prevents startup without leaking
secrets. Use a distinctive synthetic sentinel to test logging/metadata
exclusion; do not print a real token while checking for leakage. Inspect only
owned artifacts. If upstream logs reveal secret material, record a failed gate
and stop before claiming service readiness.

Perform an intentional stop and a new explicit start. Retain before/after
workspace file hashes as evidence of preservation. This proves process
recovery, not durable Codex-turn resumption, exactly-once execution, or a live
task's correctness. #40 supplies earlier upstream code-task evidence; a new
live-task proof requires one separately authorized Issue and queue admission,
not another label change hidden inside service tests.

A disruptive WSL or host restart is a separate two-session proof. First record
baseline, stop/disable instructions, preserved workspace hashes, and the exact
human recovery steps in #43. Only the human performs the authorized shutdown.
In a new session, verify there is no automatically running service, explicitly
acknowledge and start it, and prove dashboard/tracker access and preserved
workspace. Missing new-session evidence leaves this criterion unobserved.

Update `docs/guides/SYMPHONY_OPERATOR.md` with the commands, the distinction
between installing the pinned binary and starting a transient service,
per-run acknowledgement, credentials, finite recovery, manual host-restart
behavior, and limits. Clarify that already-eligible open Issues can run again
and that a supervised service does not detect human-review handoff. Update
`docs/specs/2026-10-04-symphony-coordinator-dashboard.md` to permit this optional
deployment only where verified. Update `docs/operations/TROUBLESHOOTING.md`
with exact-unit recovery and the two-session handoff, and add scoped evidence
to `docs/quality/VERIFICATION_MATRIX.md` and #43. Do not claim WSL support if its
independence test failed. Preserve the foreground launcher as the supported
fallback and leave unsupported host decisions visibly open.

Journal retention follows the host's existing policy, which may be volatile;
report the actual policy without changing global journald settings. Document
the upstream log rotation behavior actually observed. If no bounded retention
exists, require an operator-reviewed per-service rotation setting before
long-running use, with explicit preservation of test evidence; do not add a
custom history database or automatically delete worker directories.

## Concrete Steps

During this planning task, source inspection and the read-only #43 fetch were
performed. No command below that starts a unit, reads a token, or changes host
state has been executed. All examples run from `/home/chris/template` unless a
copied project's root is stated instead.

After implementation authorization, re-establish the target and prerequisites:

    git status --short
    git remote get-url origin
    gh issue view 43 --repo successbycs/template --json body,state,comments
    uname -sm
    ps -p 1 -o comm=
    systemctl --version
    systemctl --user is-system-running
    systemctl --user --failed --no-pager
    systemctl --failed --no-pager
    scripts/install_upstream_symphony.sh --dry-run

Expected platform: `Linux x86_64`. A manager result `degraded` requires inspecting
the listed failures. “Failed to connect to bus” means the service option is
unavailable in that session. Neither result authorizes host reconfiguration.

Implement and verify the planned files, then use the proposed interface:

    .venv/bin/python -m pytest tests/unit/test_symphony_service.py
    bash -n scripts/run_upstream_symphony_service.sh scripts/run_upstream_symphony_dashboard.sh
    .venv/bin/python scripts/check_markdown_links.py
    .venv/bin/python scripts/verify.py
    git diff --check
    .venv/bin/python scripts/symphony_service.py check
    .venv/bin/python scripts/symphony_service.py start --acknowledge-preview 'I understand' --github-user successbycs
    .venv/bin/python scripts/symphony_service.py status
    .venv/bin/python scripts/symphony_service.py logs --lines 100
    curl --fail --silent --show-error http://127.0.0.1:8765/api/v1/state
    .venv/bin/python scripts/symphony_service.py stop
    .venv/bin/python scripts/symphony_service.py disable

`successbycs` is the explicit account candidate for this repository, not a
default to bake into the implementation; confirm the intended identity first.
New scripts and tests in this transcript do not yet exist. Expected successful
start output names only the unit, tracker, and dashboard, followed by an
`active` status and an empty-queue dashboard. A refused start should identify a
missing acknowledgement, credential source, binary, session manager, or occupied
port without returning sensitive contents. After stop, status reports inactive
or absent and the dashboard connection is refused. Save concise real results
in this plan, not assumed output.

## Validation and Acceptance

The operational boundary is the real Linux user service manager owning the
pinned upstream process, with an actual loopback dashboard and authenticated
GitHub reads. It requires subsequent implementation/start authority, an
approved credential source, an empty or explicitly scoped eligible queue, and
a host lifecycle that supports detached operation. All entries start unobserved.

| Claim | Required real evidence | Current result |
| --- | --- | --- |
| Explicit start only | Missing acknowledgement fails; fresh host session has no running or boot-enabled unit | Unobserved |
| Terminal/editor independence | Close actual launch terminal and VS Code; independent observer still reaches service/dashboard beyond host idle timeout | Unobserved |
| WSL support | Same proof with all WSL terminals closed; observe without a command that relaunches WSL | Unobserved |
| Credential boundary | Provider works in service context; no token in owned files, metadata, command arguments, journal, or upstream logs; negative provider case refuses startup | Unobserved |
| Existing upstream behavior | Actual pinned executable, same WORKFLOW, one-worker configuration, correct GitHub target, empty queue and healthy dashboard | Unobserved |
| Bounded recovery | Owned empty-queue runtime crash recovers; synthetic unit stops after three starts and stays failed until explicit operator action | Unobserved |
| Clean stop/disable | Unit and descendants terminate, listener closes, no restart after two retry intervals, workspace hashes remain unchanged | Unobserved |
| Host restart recovery | Before-state handoff plus new-session explicit start and actual endpoint/workspace proof; no auto-start claim | Unobserved |
| Generic template | Copied checkout yields distinct unit and correct tracker/paths; existing bootstrap tests and canonical checks pass | Unobserved |

Focused tests in `tests/unit/test_symphony_service.py` cover parsing, path and
unit identity, finite policy, sanitized subprocess arguments, duplicate-start
handling, unsupported-manager reporting, stop targeting, and no implicit
enablement. Determine exact test names/counts during implementation; do not
invent a passing count. Tests that substitute a process or provider support
the design but do not replace the service, HTTP, credential, or WSL proofs.

There is no claim that a running but unresponsive upstream process is repaired:
`Restart=on-failure` responds to process exits, not arbitrary hangs. `status`
reports the failed HTTP health separately. There is no token-expiry auto-login,
host reboot automation, task completion detector, custom polling health daemon,
or exactly-once execution guarantee. Evidence must describe these limits.

## Idempotence and Recovery

`check`, `status`, and bounded `logs` are read-only. Starting an already running
owned unit is a no-op with clear output. A second checkout never controls the
first checkout's unit. Stopping or disabling an absent unit succeeds without
touching another service, a GitHub label, credentials, workspaces, or logs.
An occupied port is a refusal, never a reason to kill an unknown process.

Use the public stop/disable command to recover from a faulty unit. If the helper
itself fails, use `systemctl --user stop UNIT` for the exact unit printed by
`check`; inspect its control group and listener before further action. The
unit's 30-second stop policy may terminate a stuck worker and leave partial
files; preserve and review them. Do not recursively delete `var/`, reset a
worker checkout, or retry indefinitely. A fresh explicitly acknowledged start
may reset the finite failure budget only after reviewing the recorded failure.

Rollback stops/disables the service, preserves evidence, and returns to the
existing foreground launcher. Repository code can be reverted through a
reviewed commit. No systemd boot enablement, global environment changes, WSL
configuration, Windows tasks, or stored tokens should need removal in the
selected baseline. If a later authorized alternative adds any, record its
exact installation and undo steps before making that change.

## Artifacts and Notes

Planning evidence: current #43 is OPEN, titled “Deferred: run upstream Symphony
as a supervised host service,” with no milestone. Its acceptance requires
terminal/editor independence, real host evidence, recovery, and no new token
persistence. The current installer pins v0.0.3 Linux x86_64 with SHA-256
`ea35a04a54a6d37c0cafe3f195da871e47614a8c05765b90dbb4cac32e1435ee`.

Primary references checked during planning:

- [Microsoft WSL systemd guidance](https://learn.microsoft.com/en-us/windows/wsl/systemd):
  systemd availability and the WSL lifetime limitation.
- [GitHub CLI authentication manual](https://cli.github.com/manual/gh_auth_login):
  secure-store use and plaintext fallback, which must be distinguished here.
- Local `systemd.unit(5)` manual: `StartLimitIntervalSec=infinity` limits total
  start attempts; `reset-failed` resets the counter. Validate actual manager
  behavior during the prototype rather than relying only on this manual.

Record future service version, unit identity, scoped configuration hash,
timestamps, process results, endpoint responses, restart counts, and workspace
hashes here and in #43. Never attach token values, full environment dumps,
authentication files, or unsanitized crash dumps. Planning does not close #43
or establish that Version 1's release conditions have been met.

## Interfaces and Dependencies

New optional interface: `scripts/symphony_service.py
{check,start,status,logs,stop,disable}`; `start` accepts the exact preview
acknowledgement and explicit GitHub account. It manages one repository-derived
transient systemd unit through `systemd-run`, `systemctl`, and `journalctl`.
It adds no Python package dependency and no new runtime application module.

New internal adapter: `scripts/run_upstream_symphony_service.sh`, called only
by the owned unit, retrieves the approved token into process memory and executes
`scripts/run_upstream_symphony_dashboard.sh`. Preserve that launcher's public
foreground contract and the installer's pinned asset/checksum. Any required
verified-install-only option must be documented and tested rather than assuming
#42's unintegrated installer proposal exists.

External dependencies remain the supported Linux x86_64 host, working systemd
user manager, existing secure credential provider and GitHub CLI, authenticated
Codex CLI, Git, pinned upstream Symphony, and GitHub tracker availability.
Systemd controls process lifetime only. `WORKFLOW.md` and upstream Symphony
continue to own scheduling, worker protocol, workspace creation, and dashboard
state. No Windows Task Scheduler entry, host boot integration, SQLite store,
custom scheduler, or replacement dashboard is included in this plan's selected
implementation baseline.
