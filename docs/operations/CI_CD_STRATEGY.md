# CI/CD Strategy

**Status:** active CI; deployment remains manual and authorization-gated
**Owner:** release owner
**Update:** CI, release authority, or deployment procedure changes.

GitHub Actions runs two workflows on every pull request and on every push to
`main`. Both checks are required before a pull request can merge.

| Check | Workflow | What it runs |
| --- | --- | --- |
| `verify` | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | Builds the development image, performs a locked `uv` install, then calls `scripts/verify.py`: Ruff lint, Ruff formatting, pytest and Markdown links. |
| `web-quality` | [`.github/workflows/web-ci.yml`](../../.github/workflows/web-ci.yml) | In `apps/web` on Node.js 22 with npm 11.13.0: `npm ci`, `npm run types` (and fails if `worker-configuration.d.ts` is not committed), `npm run lint`, `npm test`, `npm run typecheck` and `npm run build`. |

Local checks call the same entry points: `scripts/verify.py` for the harness and
the npm scripts for the web app (see the [Local Runbook](LOCAL_RUNBOOK.md)).
The `main` branch accepts changes only through pull requests, with both checks
passing on an up-to-date branch. The review and merge rule is in
[AGENTS.md](../../AGENTS.md#review-and-merge).

CI is source verification only. It does not deploy, publish an image, migrate
data, configure an external provider, or send customer communications. A
passing CI run is necessary evidence where applicable, but it is not release
authority or proof of a deployed public boundary.

ShortList has no automatic continuous-deployment pipeline. Deploying the Worker
and applying remote D1 migrations are manual steps that Chris authorises each
time. An approved manual deployment follows the ordered gates in the [Release Workflow](../workflows/RELEASE_WORKFLOW.md):
scope and evidence, human review, explicit authorization, target verification,
the narrowly approved deployment, and real-boundary proof. Do not add a CI
deployment step, credential, or provider configuration without an approved
change that updates this document and the release workflow.

## Deferred: CI/CD delivery pipeline

**Status:** planned for a later, separately approved delivery phase; not a
current release prerequisite and not implemented.

A future pipeline may automate the already-approved, non-production source
checks and create a reviewable deployment candidate. It must not turn a merge
or successful CI run into production-release authority. Before implementing
it, define the target environments, protected-branch and review policy,
least-privilege deployment identity, secret custody, migration gate, artifact
provenance, rollback procedure, and required public-boundary verification.

Until those decisions and the resulting implementation are reviewed, ShortList
continues to use the manual, authorization-gated release sequence. The future
pipeline must be recorded as its own GitHub Issue and ExecPlan because it
changes delivery authority and production trust boundaries.
