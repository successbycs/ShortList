# Prove deployed template software through real capability checks

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

**Implementation task:** [GitHub Issue #30](https://github.com/successbycs/template/issues/30)

## Purpose / Big Picture

Create repeatable, real-boundary proofs for the software this repository actually exposes: the command-line interface, typed configuration, SQLite audit persistence, disabled Symphony dashboard, Docker Compose environment, and verification tools. A reader can rerun the local proofs and see a passed, failed, or blocked result. Installed but inactive FastAPI, Prefect, and OpenAI Agents SDK libraries are not misrepresented as deployed services.

## Progress

- [x] (2026-10-02 00:30Z) Claimed #30 and inspected declared dependencies, active CLI, configuration, SQLite, dashboard, Compose, and verification paths.
- [x] (2026-10-02 00:42Z) Added the local proof harness, ignored sanitized result format, focused regression tests, and operator replay documentation.
- [x] (2026-10-02 00:44Z) Ran local CLI/configuration/SQLite/dashboard/Markdown proofs and isolated Docker Compose HTTP proof.
- [x] (2026-10-02 00:44Z) Classified PyYAML and Prefect runtime inactive and the OpenAI Agents SDK provider boundary blocked for missing explicit authority.
- [x] (2026-10-02 00:50Z) Re-ran the proof harness after formatting: zero failed supported rows. Canonical verification passed with 61 tests in 3.29 seconds; Markdown links passed.
- [ ] Human review decides whether the explicitly blocked OpenAI provider boundary should receive separate authority.

## Surprises & Discoveries

- Observation: FastAPI is used by the disabled-by-default Symphony dashboard, but the base CLI does not launch a web server.
  Evidence: `src/app_template/cli.py`, `src/app_template/symphony/service.py`, and `WORKFLOW.md`.

- Observation: Prefect and OpenAI Agents SDK are declared standard libraries but no default workflow or provider request is configured.
  Evidence: `pyproject.toml`, `docs/TEMPLATE_SPECIFICATION.md`, and `docs/template/OPTIONAL_PACKS.md`.

- Observation: Docker 29.2.0 and Docker Compose 5.0.2 are available on the WSL host.
  Evidence: `docker version --format '{{.Server.Version}}'` and `docker compose version` on 2026-10-02.

## Decision Log

- Decision: Treat inactive libraries as blocked or unsupported runtime claims rather than run a synthetic import/client proof.
  Rationale: Installation alone does not deploy an operational boundary.
  Date/Author: 2026-10-02 / Codex

- Decision: Make the proof harness create only disposable files beneath a caller-selected temporary directory and retain a sanitized JSON result in the repository artifact path.
  Rationale: Real local proofs need durable evidence without touching a user audit database, credentials, or external providers.
  Date/Author: 2026-10-02 / Codex

## Outcomes & Retrospective

Supported local boundaries passed: valid and invalid CLI configuration, SQLite reopen after CLI process exit, deterministic no-op demo, live loopback FastAPI dashboard with refusal after shutdown, good/bad Markdown checker behavior, and isolated Docker Compose dashboard HTTP. PyYAML and Prefect runtime are inactive by design. A real OpenAI Agents SDK provider request remains blocked because no approved account, credential, cost boundary, or test data was supplied.

## Context and Orientation

`pyproject.toml` declares the `app-template` CLI and its standard libraries. `src/app_template/cli.py` exposes `health`, `self-test`, `demo --no-op`, and disabled Symphony commands. `src/app_template/config.py` loads TOML and environment values with Pydantic validation. `src/app_template/audit.py` owns local SQLite audit durability. `src/app_template/symphony/service.py` exposes a FastAPI dashboard, but `WORKFLOW.md` keeps live dispatch false. `compose.yaml` defines a non-root app container and a profile-gated Symphony dashboard.

The active template promises installed libraries and safe local capabilities, not a provider account, running Prefect deployment, active agent, or default FastAPI application. The proof matrix below is therefore the scope contract.

| Component / claim | Real boundary | Prerequisite / authority | Expected evidence |
| --- | --- | --- | --- |
| CLI and configuration | Operator invokes installed `app-template`; valid config succeeds and invalid config exits 2 | Local virtual environment | JSON success plus configuration error |
| SQLite audit | CLI writes an event, process ends, SQLite reopens and event is read | Disposable local path | Event ID exists after reopen |
| No-op adapter | Operator invokes `demo --no-op` | Local virtual environment | Safe outcome with no external request |
| Symphony FastAPI dashboard | Separate loopback process, HTTP `/health`, refused connection after shutdown | Local port, live dispatch false | HTTP 200 then connection refusal |
| Docker/Compose | Defined image builds; profile dashboard reaches loopback HTTP then stops | Local Docker daemon | Build/start/HTTP/stop evidence |
| Verification tools | Actual Ruff, pytest, and Markdown commands on repository | Local virtual environment | Passed good path; safe bad link fixture refusal |
| Pydantic/PyYAML | Configuration route above; PyYAML has no active project boundary | Local CLI / no YAML feature | Pydantic proved; PyYAML inactive |
| Prefect | No configured flow/deployment | Explicit feature adoption | Blocked, not imported |
| OpenAI Agents SDK | Real approved non-production provider request | Credential, account, cost/data authority | Blocked unless separately approved |

## Plan of Work

### Milestone 1: harness and durable evidence

Add `scripts/prove_deployed_software.py`, which creates a caller-selected temporary evidence directory and writes a sanitized JSON report under `var/proofs/` only when explicitly requested. It will start the real CLI through the current interpreter, use a disposable TOML file and SQLite database, launch the disabled dashboard in a subprocess on a loopback ephemeral port, call HTTP using the standard library, and terminate the exact child process. It will not use an OpenAI key, Prefect API, GitHub, or network beyond loopback.

Add focused unit tests that exercise deterministic report parsing and ensure the harness refuses an unsafe output location. Add documentation describing command, report location, known blocked rows, and cleanup.

### Milestone 2: local real proofs

Run the harness from the repository root using a temporary directory. Confirm valid and invalid configuration, CLI exit codes, SQLite reopen, no-op result, dashboard HTTP and post-shutdown refusal. Run the canonical verifier. Run a disposable known-bad Markdown fixture against the link checker and retain only its expected nonzero result.

### Milestone 3: Docker proof

Build the declared image, start the `symphony` profile on its loopback-only port, request `/health`, stop the exact Compose project, and record status. Preserve existing containers and do not use a broad `docker compose down` against unrelated projects.

### Milestone 4: blocked external/inactive rows

Record Prefect, PyYAML runtime, and OpenAI Agents SDK rows as inactive/blocked with the exact activation or approval required. Do not make a client construction or credential-less request. Update the verification matrix only if an existing template requirement is truly proven by this Issue.

## Concrete Steps

From `/home/chris/template`:

1. Run `.venv/bin/python scripts/prove_deployed_software.py --output var/proofs/issue-30.json`.
   Expected: passed CLI/configuration/SQLite/no-op/dashboard rows; explicit blocked/inactive external rows.
2. Run a safe known-bad Markdown fixture through `scripts/check_markdown_links.py`.
   Expected: nonzero result naming the missing local target; remove only the exact temporary fixture.
3. Run `docker compose build`, then a uniquely named Compose project with the `symphony` profile; call its loopback health endpoint; stop that exact project.
4. Run `.venv/bin/python scripts/verify.py`.
   Expected: Ruff lint/format, tests, and links pass.

## Validation and Acceptance

The issue passes only when every in-scope row has executed real-boundary evidence or a precise blocked/inactive classification. The harness cannot classify imports, mocks, or version output as a passed operational boundary. The dashboard proof must be actual loopback HTTP while the child process is live and connection refusal after it stops. The SQLite proof must reopen the database. Docker proof must reach the running declared service. No external provider row passes without separate authorization.

## Idempotence and Recovery

The harness uses a newly created exact temporary directory and can be repeated after removing only that directory. Dashboard child processes are terminated in `finally`; if a process survives, identify its PID and port before stopping it. Docker uses a unique Compose project name and is stopped with its exact project name. No credentials are read or stored. The proof report contains command category, exit status, and sanitized outcomes only.

## Artifacts and Notes

Executed evidence on 2026-10-02: `.venv/bin/python scripts/prove_deployed_software.py --output var/proofs/issue-30.json` returned zero with no failed supported rows; `docker compose --project-name issue30proof --profile symphony up --build --detach` served `{"status":"ok","live_dispatch":false}` at loopback, then its exact `down` removed the containers and network.

The durable result will be `var/proofs/issue-30.json`, ignored from Git if it contains host-specific timestamps or paths; the ExecPlan and Issue handoff retain sanitized command/result summaries. Documentation will tell an operator how to recreate the proof. No proof record includes configuration contents, tokens, or full environment dumps.

## Interfaces and Dependencies

New local interface: `scripts/prove_deployed_software.py [--output PATH]` returns 0 only when all supported local proofs pass; returns 1 for a local proof failure and 2 when a requested output location is unsafe. The JSON report contains a schema version and component rows with `status`, `boundary`, `command`, `observed`, and `limitation`. It depends on the installed project virtual environment, local loopback, and standard library HTTP client. Docker is invoked separately because it is host-owned.
