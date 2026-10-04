# Publish template v1 and prove a copied project

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Publish the reviewed upstream-Symphony template as `v1.0.0`, then prove it in a
separate private repository by having upstream Symphony complete one real
business-style Issue: a minimal hello-world website. The reusable template must
remain generic; website code belongs only in `successbycs/hello-world`. The
test will show an operator can start from the tagged template, bootstrap its own
GitHub target, create one bounded Issue, observe upstream selection and Codex
execution, verify the worker change, and hand it to human review.

## Progress

- [x] (2026-10-04 04:53Z) Finish #44 retrospective draft and validation; its
  scoped commit and open human-review handoff are the next release checkpoint.
- [ ] (2026-10-04 04:55Z) Push the verified template commits, create/push the
  `v1.0.0` tag, and confirm the remote tag points to the intended commit.
- [ ] (2026-10-04 04:55Z) Create private `successbycs/hello-world`, push the
  tagged template baseline, clone it in an isolated temporary directory, and
  bootstrap its distinct repository/package identity.
- [ ] (2026-10-04 04:55Z) Create one bounded real-world website Issue, make it
  the sole eligible item, and run one upstream Symphony worker.
- [ ] (2026-10-04 04:55Z) Verify the isolated website change and worker
  evidence, stop the owned process, remove temporary eligibility, and leave
  both the new-repo Issue and template records open for human review.

## Surprises & Discoveries

- Observation: Four verified template commits are local only after the prior
  explicit push.
  Evidence: `git log origin/main..HEAD` lists `deb96fd`, `241525d`, `aec8375`,
  and `e3e5028`; the retrospective completion commit will join this set.

## Decision Log

- Decision: Use a private repository named `successbycs/hello-world`.
  Rationale: It isolates domain code and tokens from the reusable template,
  while proving the actual copied-project path without public exposure.
  Date/Author: 2026-10-04 / Codex and repository owner.
- Decision: Leave the worker’s website change in its isolated workspace for
  human review rather than automatically merging it.
  Rationale: The template workflow and user goal require open review handoff;
  a successful worker turn is not authorization to merge or push its change.
  Date/Author: 2026-10-04 / Codex and repository owner.

## Outcomes & Retrospective

Pending. Success is a pushed `v1.0.0` tag, a bootstrapped private project with
correct tracker target, one real upstream worker selection, a verified website
change in its workspace, dashboard evidence, and human-review handoff. It does
not require deployment, public publication, or automatic merge.

## Context and Orientation

The source repository is `/home/chris/template`, remote
`successbycs/template`. Its active upstream integration uses `WORKFLOW.md`,
the pinned installer, foreground launcher, deliberate `symphony:ready` queue
label, and `max_concurrent_agents: 1`. The template's V1 baseline must include
the final #44 retrospective and must exclude unrelated dirty files, ignored
runtime data, and the unintegrated #42 worker proposal.

The copied test repository is `/tmp/hello-world` during this session, with
remote `successbycs/hello-world`. `scripts/bootstrap_template.py` changes the
project name, Python package name, `pyproject.toml` user-session target, and
`WORKFLOW.md` upstream tracker target. The business task is restricted to a
small FastAPI hello-world endpoint and its focused test; no deployment,
database, credentials in files, or unrelated template changes are allowed.

## Plan of Work

Complete #44’s final retrospective and only then create a scoped local commit.
Push the accumulated reviewed template commits to `origin/main`, create
annotated tag `v1.0.0`, push it, and verify remote refs. If `v1.0.0` already
exists and points elsewhere, stop for user direction rather than overwrite it.

Create the private test repository. Push the V1 tag as its `main` baseline,
clone it into `/tmp/hello-world`, and run bootstrap with
`--project-name hello-world --package-name hello_world --github-repository
successbycs/hello-world`. Commit/push that bootstrap state as the test project
baseline. Validate its standard tests before opening the Issue.

Create a new Issue in the test repository titled “Create a hello-world website”
with one code packet, `src/hello_world/web.py` and its test. It must expose a
FastAPI `GET /` response with a stable JSON greeting and test it using the
existing test client/dependencies. Create and apply only the existing-style
`symphony:ready` label for this expressly authorized real test. Start upstream
Symphony from the copied project; observe its dashboard and only that Issue.

Inspect the isolated worker workspace's diff, run the Issue’s test, and record
the review handoff in the test-repo Issue. Remove the temporary label under
explicit authorization given by this plan/user request, stop the exact owned
process, and confirm no port listener remains. Do not merge the website change.

## Concrete Steps

Template root:

    git push origin main
    git tag -a v1.0.0 -m 'Template version 1.0.0'
    git push origin v1.0.0

Copied-project root:

    python scripts/bootstrap_template.py --project-name hello-world \
      --package-name hello_world --github-repository successbycs/hello-world
    .venv/bin/python scripts/verify.py
    SYMPHONY_UNSAFE_PREVIEW_ACK="I understand" \
      GITHUB_TOKEN="$(gh auth token)" scripts/run_upstream_symphony_dashboard.sh

Expected dashboard state while the Issue is active: exactly one `running`
entry, then a worker workspace containing only the website packet and a passing
focused test. Actual commands and outputs will be recorded in the new Issue
and this plan.

## Validation and Acceptance

| Capability | Real proof | Required result |
| --- | --- | --- |
| Versioned template | Remote branch/tag refs | `v1.0.0` exists on the exact reviewed template commit |
| Copied project safety | Bootstrap test and file audit | New GitHub target appears in both configuration surfaces |
| Real-world dispatch | Upstream dashboard and Issue | One deliberately eligible new-repo Issue only |
| Website behavior | Focused HTTP client test in worker workspace | `GET /` returns documented greeting JSON |
| Review handoff | New-repo Issue comment and unmerged diff | Diff/test evidence recorded; Issue stays open |
| Cleanup | Port/process and queue audit | Owned launcher stopped; temporary label removed; no automatic merge/deploy |

## Idempotence and Recovery

Never overwrite an existing version tag or repository. The private test repo
can be reused only if its remote, bootstrap state, and Issue scope match this
plan; otherwise stop rather than overwrite. The workspace is evidence and is
never deleted. Git commits provide rollback points. The temporary label is
removed only after the worker reaches a stable handoff so a restart cannot run
another turn.

## Artifacts and Notes

Evidence belongs in #44, the new test-repo Issue, and this plan. No token is
written to a file or committed. The template repository retains only generic
runtime and documentation; `/tmp/hello-world` contains the business example.

## Interfaces and Dependencies

- Template release interface: remote `main` and annotated `v1.0.0` tag.
- Copied project runtime: upstream `WORKFLOW.md` targeting
  `successbycs/hello-world`, the retained installer/launcher, and one worker.
- Website packet: `src/hello_world/web.py` must export a FastAPI application
  and `tests/unit/test_web.py` must prove `GET /` returns the declared JSON.
