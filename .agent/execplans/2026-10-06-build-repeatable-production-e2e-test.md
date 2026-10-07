# Superseded — build repeatable deployed end-to-end verification

This ExecPlan is a living document and must be maintained under
`.agent/PLANS.md`.

> **Superseded on 2026-10-06.** This plan proposed a separate Worker, D1
> database and test environment. Chris rejected that approach because it does
> not prove the real public service. Do not implement it. The replacement
> sequence is:
>
> 1. `2026-10-06-design-mvp1-production-test-strategy.md`; then
> 2. `2026-10-06-implement-mvp1-production-e2e-verification.md`.
>
> Those plans require the existing public hostname, existing Worker and D1,
> visible Chromium, a short safe Worker-log observation, scoped read-only D1
> evidence, and a cache replay. They deliberately forbid the extra
> infrastructure proposed below.

## Purpose / Big Picture

ShortList needs a repeatable test that a developer can run on demand to prove
the real browser journey: enter a domain, receive an assessment result, record
the outcome in a deployed D1 database, repeat the request, and prove that the
second result is cached rather than paid work being repeated.

The test must run on Cloudflare's deployed platform, not merely in a local
browser, but it must not put test Turnstile credentials, synthetic records, or
test-only controls into the public customer service at
`shortlist.successbycs.com`. The outcome is a separately named, deployed
production-test Worker and database in the same Cloudflare account, driven by
an on-demand Playwright command. It is production-like infrastructure, not the
customer production endpoint.

After this work, a contributor can run one documented command and receive a
machine-readable plus human-readable report showing the browser outcome, test
assessment record, AI evidence count, and cached replay result. The test will
be safe to run repeatedly without contaminating customer data.

## Progress

- [x] (2026-10-06 03:05Z) Chris confirmed that automated end-to-end checking
  is a product requirement, not an optional manual checklist.
- [x] (2026-10-06 03:10Z) Confirmed Cloudflare provides official predictable
  Turnstile test credentials because automated browsers are intentionally
  detected by the normal widget. The credentials must remain confined to a
  test environment.
- [x] (2026-10-06 03:20Z) Created this design-only ExecPlan. No Cloudflare
  resource, credential, code, test record, provider call, or deployment has
  been created by this plan.
- [ ] Create a bounded GitHub child Issue under #10 and obtain Chris's
  implementation approval for this plan.
- [ ] Implement, deploy, and run the automated production-test journey.

## Surprises & Discoveries

- Observation: an ordinary automated browser cannot reliably solve the real
  ShortList Turnstile widget; that protection correctly treats test automation
  as bot-like behaviour.
  Evidence: Cloudflare Turnstile testing documentation, read 2026-10-06;
  `docs/product/MVP1_RELEASE_TEST_PLAN.md` records the same boundary.

- Observation: the current live Green Gecko submission stopped during
  Turnstile verification, before D1 wrote any assessment record.
  Evidence: live UI result and the remote D1 count query on 2026-10-06.

## Decision Log

- Decision: Add an isolated deployed production-test environment rather than
  weakening or bypassing Turnstile on the customer production hostname.
  Rationale: it gives repeatable automation while preserving the anti-bot
  boundary real visitors use.
  Date/Author: 2026-10-06 / Chris and Codex.

- Decision: Keep one intentionally small human smoke test for changes to the
  real Turnstile widget or its production secret/hostname configuration.
  Rationale: Cloudflare's official test credentials prove automation behaviour
  but do not prove a real customer widget configuration.
  Date/Author: 2026-10-06 / Codex recommendation accepted in principle by
  Chris's requirement for a repeatable automated test.

## Outcomes & Retrospective

Planning is complete; implementation has not started. The expected final
outcome is a documented `npm run test:e2e:deployed` command that returns a
clear report and a non-zero exit on any failed assertion. The customer
production Worker stays free of test credentials and test-only branches.

## Context and Orientation

`apps/web/` is the TanStack Start application deployed as the `shortlist-web`
Cloudflare Worker. It currently uses a real Turnstile widget, Worker secrets,
D1, bounded public fetching, and OpenAI calls. Its public hostname is
`shortlist.successbycs.com`. The current unit and component checks use Vitest;
they do not operate a deployed browser, D1 database, or real Turnstile
interaction.

Cloudflare publishes test-only Turnstile sitekeys and secrets which generate
predictable tokens for browser automation. Cloudflare states that those keys
must not be placed in customer production. The deployed test Worker therefore
has its own name, its own D1 database, its own Worker secrets, and a distinct
test-only URL. It uses the same reviewed application source and deployment
steps as the customer Worker.

The production-test environment is not a staging approximation on a laptop. It
is a Worker deployed in the actual Cloudflare account and exercised over HTTPS.
It is isolated so a failed test cannot expose a test credential to customers,
write synthetic data to the customer D1 database, or consume customer-facing
rate limits.

## Plan of Work

### Milestone 1 — Define the deployed test contract

Create a narrow GitHub child Issue under #10. Its outcome is an on-demand
automated verification of the deployed assessment journey. Its non-goals are
customer production changes, real customer data, changes to the public
Turnstile widget, email/PDF delivery, and unattended schedules.

Define the test report contract. Every run must write an ignored local JSON
report containing:

- UTC start/end time and deployed Worker version;
- normalised test domain;
- initial browser outcome and assessment/run identifier;
- D1 customer/run/evidence counts scoped to the test database;
- cached-replay outcome and proof that no extra assessment/evidence rows were
  created; and
- pass/fail/blocked state with a safe diagnostic code.

The report must never contain a secret, raw Turnstile token, raw IP address, or
customer production data.

### Milestone 2 — Isolated Cloudflare resources

With Chris's explicit resource-creation approval, create:

1. a D1 database named `shortlist-e2e` in the same region as the customer
   database;
2. a separately named Worker, proposed name `shortlist-web-e2e`; and
3. a dedicated deployed URL from the account's Workers development subdomain,
   or a specifically approved test hostname if the account has one.

Apply the reviewed schema migrations only to `shortlist-e2e`. The test database
contains no customer records. It may retain only clearly synthetic records for
diagnostics and is safe to reset with an explicit command defined later in this
plan.

Give the test Worker the following isolated configuration:

- Cloudflare's official passing Turnstile test sitekey at build time;
- Cloudflare's matching passing test secret as the test Worker's
  `TURNSTILE_SECRET` only;
- a separate `ASSESSMENT_IP_HASH_SECRET`; and
- a clearly documented choice between a limited, real OpenAI test key and a
  test-only deterministic AI adapter.

The preferred first implementation uses the deterministic adapter. It proves
the end-to-end application, browser, Worker, D1 and cache route without cost
or model variability. A separate, explicitly approved real-provider smoke
command may later use a bounded project key and records its provider result.

### Milestone 3 — Make the application deployment-aware and safe

Introduce a typed, server-only deployment mode with exactly two permitted
values: `customer` and `e2e`. Default and customer deployments must be
`customer`. A build or runtime configuration error must reject any other mode.

In `customer` mode:

- retain the existing real sitekey, secret, hostname/action validation, D1
  binding, admission limits, and real AI behaviour;
- reject test sitekeys, the test secret, test-only URL, and test adapter; and
- ensure no production response reveals test mode or a test credential.

In `e2e` mode:

- render only the official Turnstile test sitekey;
- use only the matching test secret;
- use the isolated D1 binding;
- use a deterministic AI-evidence adapter with the same stored contract as the
  production adapter; and
- mark every stored record with a non-public synthetic-test marker or reserve a
  unique normalised test domain so query/assertion scope cannot touch customer
  data.

Do not create a public header, query parameter, cookie, or browser-visible flag
that switches a customer request into test mode. The deployment's Worker
configuration alone selects its mode.

Resolve the Turnstile hostname contract from the selected deployment's public
hostname. Add tests for both modes and specifically prove that customer mode
cannot use a dummy Turnstile token or test adapter.

### Milestone 4 — Stable source domain and assessment proof

Deploy a small, separately named static test-fixture Worker that serves a
fixed public business website fixture over HTTPS. It should contain enough
ordinary public text for the existing bounded fetch/extraction policy to make a
completed preview. It has no private API or customer data.

Use that fixture URL as the only domain allowed by the E2E command. This avoids
depending on Green Gecko, a third-party website, DNS changes, or real-world
content changes for the automated release check. The fixture is intentionally
not a customer-facing product feature.

The first test run asserts one completed assessment with the expected fixture
claim/evidence shape. The second test run asserts `cached`, the same stored
assessment ID, and no increase in assessment or AI-evidence row counts.

### Milestone 5 — Playwright runner and evidence

Add Playwright as a locked development dependency using the project's existing
package manager. Add `npm run test:e2e:deployed`, which:

1. obtains the selected test Worker URL and fixture domain from ignored local
   environment variables;
2. opens the deployed test URL over HTTPS in Chromium;
3. enters the fixture domain and allows the test Turnstile widget to complete;
4. waits for and asserts the completed teaser state;
5. runs read-only, scoped D1 queries through a separate operator command to
   verify the stored outcome;
6. reloads/submits the same fixture domain;
7. asserts the cached journey and unchanged costly-work counts; and
8. writes the sanitised JSON report and a compact terminal summary.

The runner must fail closed: an unavailable host, failed verification,
unexpected limited result, missing D1 record, extra row/provider work, or
timeout fails the command and names the failed stage. It must not silently
fall back to customer production or an unscoped database.

### Milestone 6 — Documentation, recovery, and real-widget smoke check

Document initial setup, normal run, expected successful report, report
location, reset process, and safe failure diagnosis in
`docs/product/PRODUCTION_E2E_TESTING.md`. Link it from the MVP release test
plan and #10 evidence.

Document the intentionally separate real-widget smoke test: after a production
Turnstile secret, widget, hostname, or action change, Chris completes one
ordinary-browser submission and Codex verifies only the matching production D1
outcome. This is not the routine regression test and is never represented as
the automated test suite.

## Concrete Steps

After implementation authority, run from `/home/chris/ShortList/apps/web`:

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
npm test
npm run lint
npx tsc --noEmit
npm run types
npm run build
npm run test:e2e:deployed
```

Resource creation and migration commands will be added here only after their
exact names, configurations, and account targets have been read back and
approved. The production-test command must print a report path and pass/fail
summary such as:

```text
E2E deployed test: passed
Initial result: completed (assessment synthetic-…)
Replay result: cached (same assessment)
New assessment rows on replay: 0
Report: artifacts/e2e/deployed-2026-10-06T…Z.json
```

## Validation and Acceptance

This work is accepted only when all of the following are observed:

1. The customer Worker contains no test Turnstile key/secret, test fixture
   route, test D1 binding, or test-only behaviour.
2. The test Worker is deployed over HTTPS and its configuration proves it uses
   a separate D1 binding and test-only Turnstile secret by name, never value.
3. The normal test command controls an actual browser against the deployed
   test URL and passes without human form interaction.
4. Its first request creates exactly one synthetic assessment with expected D1
   evidence records.
5. Its replay returns cached data and creates no new costly-work record.
6. Deliberately failing test cases for Turnstile failure and missing runtime
   configuration produce the truthful public messages and non-zero command
   exit where appropriate.
7. Existing unit/component tests, lint, strict typecheck, Wrangler types, and
   production build pass.
8. The generated report is safe to retain locally and its summary is recorded
   in the GitHub child Issue. No secret or token appears in the report,
   terminal evidence, or Issue comment.
9. The real customer Worker remains at `shortlist.successbycs.com` and a
   pre-existing real-widget smoke test is not falsely replaced by this test
   environment.

## Idempotence and Recovery

The test command is idempotent: it can run again against the same fixture
domain and must report cached reuse. A separate explicit `reset` command may
delete only data in the `shortlist-e2e` database after printing the exact
database target and receiving user approval; it must never accept a database
name from an unvalidated environment variable or operate against
`shortlist-mvp1`.

If deployment fails, leave the customer Worker untouched, preserve the local
report and error text, and repair only the e2e configuration. If the live test
fails, retain its synthetic evidence for diagnosis and mark the test failed;
do not silently retry a costly first run.

## Artifacts and Notes

- `docs/product/MVP1_RELEASE_TEST_PLAN.md` — product quality matrix.
- `docs/product/MVP1_DEFINITION_OF_DONE.md` — release gate.
- `docs/product/REQUEST_FLOW.md` — customer live request architecture.
- `docs/product/PRODUCTION_E2E_TESTING.md` — operator guide to be created.
- `artifacts/e2e/` — ignored local run reports to be created.

## Interfaces and Dependencies

Planned interfaces, subject to implementation review:

- `apps/web/wrangler.e2e.jsonc`: test Worker name, isolated D1 binding, and
  selected deployment mode. It must not inherit the customer Worker name.
- `apps/web/src/server/worker-runtime.ts`: typed validated deployment mode and
  configuration boundary.
- `apps/web/src/server/ai-search/`: deterministic e2e adapter implementing
  the same stored evidence contract as production.
- `apps/web/e2e/deployed-assessment.spec.ts`: Playwright deployed journey.
- `apps/web/scripts/run-deployed-e2e.ts`: report creation and D1 assertion
  orchestration, if a shell command is insufficient.
- Ignored local environment variables: selected test Worker URL, fixture
  domain, account-safe operator credentials, and report directory.

No interface in this plan may expose production secrets, let a public request
choose E2E mode, or allow the test runner to query customer production data.
