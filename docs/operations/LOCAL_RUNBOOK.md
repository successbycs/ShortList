# Local Runbook

**Status:** active | **Owner:** operator | **Update:** startup, verification, migration or deployment steps change.

ShortList has two parts with separate commands: the web app in `apps/web` and
the Python harness at the repository root. [GETTING_STARTED.md](../../GETTING_STARTED.md)
has the short version.

## The web app (`apps/web`)

Run these from `apps/web` with Node.js 22 and npm 11.

| Command | What it does |
| --- | --- |
| `npm ci` | Install the locked dependencies. |
| `npm run dev` | Vite dev server for front-end work. |
| `npm run dev:worker` | Run the built Worker locally with Wrangler and a local D1 database. Run `npm run build` first. |
| `npm run lint` | ESLint. |
| `npm test` | Vitest, once. `npm run test:watch` keeps it running. |
| `npm run typecheck` | TypeScript, no output files. |
| `npm run types` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`. Commit the result if it changes; CI fails when it is out of date. |
| `npm run build` | Production build into `.output/`. |
| `node scripts/prove-local-d1-migrations.mjs` | Apply every migration to a throwaway local D1 database and check the expected tables exist. Never touches the remote database. |

CI runs `npm ci`, `types` (and checks the file is committed), `lint`, `test`,
`typecheck` and `build` as the `web-quality` job.

### Local secrets

The Worker reads two secrets: `OPENAI_API_KEY` and `ASSESSMENT_IP_HASH_SECRET`.
Without them an assessment returns "assessment unavailable"; tests do not need
them. For a local run that calls the real provider, put them in an ignored
`apps/web/.dev.vars` file. Never commit, paste or log their values.

### D1 migrations

Migrations live in `apps/web/migrations/` and are numbered (`0001_…sql`
onwards). Add a new numbered file; never edit one that has been applied. Prove
it locally with `node scripts/prove-local-d1-migrations.mjs`.

Applying a migration to the remote `shortlist-mvp1` database is a manual step
that **Chris authorises each time**. It is not part of CI or merge.

### Deployment

There is no automatic deployment. Deploying the Worker to
shortlist.successbycs.com is a manual step that **Chris authorises each time**,
after the PR has merged. `wrangler deploy` uploads whatever is in `.output/`,
so run `npm run build` from the same working tree immediately before it. Follow
the [Release Workflow](../workflows/RELEASE_WORKFLOW.md) and the
[MVP 1 release test plan](../product/MVP1_RELEASE_TEST_PLAN.md) for the order of
checks, target verification and the evidence to record.

## The Python harness (repository root)

Use [GETTING_STARTED.md](../../GETTING_STARTED.md) for Compose build, locked
install, checks, self-test, demo, and stop commands. Docker Desktop WSL
integration is required for Compose. `scripts/verify.py` is the single entry
point; CI runs it as the `verify` job.

### Real local capability proof

To exercise the template's active local deployment boundaries and create a
sanitized ignored result, run:

```bash
.venv/bin/python scripts/prove_deployed_software.py --output var/proofs/issue-30.json
```

The proof invokes the installed CLI with valid and invalid configuration, writes
and reopens a disposable SQLite audit database, runs the deterministic no-op
demo, and tests the repository Markdown checker against good and temporary bad
input. It does not call an external provider.

Prefect, PyYAML runtime, and OpenAI Agents SDK provider capabilities are not
default deployed services. The report labels them inactive or blocked; a real
provider request needs explicit account, credential, cost, data, and authority
approval. Docker Compose proof is a separate operator action because Docker is
host-owned: build an isolated project, request its loopback health endpoint,
then stop that exact project.
