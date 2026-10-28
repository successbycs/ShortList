# ShortList web application

This is the ShortList product: a website assessment that shows a small business
how AI systems understand its website and the people it wants to reach. It
began as a Lovable prototype and now runs as a Cloudflare Worker at
shortlist.successbycs.com.

## How it is built

- TanStack Start, React 19, TypeScript, Vite and Tailwind, built with Nitro's
  Cloudflare module target.
- Cloudflare Worker `shortlist-web` (`wrangler.jsonc`) with two bindings:
  - `SHORTLIST_DB`: the D1 database `shortlist-mvp1`;
  - `ASSETS`: the static files in `.output/public`.
- One page (`src/routes/index.tsx`), driven by `src/hooks/use-assessment-journey.ts`
  and one server function, `src/functions/submit-domain-assessment.ts`.
- Database schema in `migrations/` (`0001` to `0008` today).

## What an assessment does

For a submitted domain, the Worker:

1. validates that it is a public domain;
2. returns the saved result if this domain has already been assessed, without
   calling the provider again;
3. applies admission limits stored in D1: one active run per domain, a small
   number of global slots, and a daily limit per hashed IP address;
4. fetches the public website safely and extracts evidence;
5. runs the GEO (generative-engine optimisation) assessment with the live
   OpenAI Responses API: a business profile, ideal-customer hypotheses, buyer
   questions, then a current-web evaluation (with web search) and a
   model-knowledge evaluation;
6. saves the result in D1 and shows the report on the page.

Possible outcomes are `completed`, `cached`, `limited`, `invalid_input`,
`admission_rejected` and `assessment_unavailable` (which carries a support
reference and the failing phase and category, never internal details).

A **legacy path** (`src/server/legacy-ai-search.ts`,
`src/server/ai-evidence-repository.ts` and `src/server/ai-search/`) is kept only
so older "comparable business" results already in D1 can still be read. New
assessments never use it.

## Secrets

The Worker reads two secrets: `OPENAI_API_KEY` and `ASSESSMENT_IP_HASH_SECRET`.
Without them an assessment returns `assessment_unavailable`. Set them with
Wrangler for the deployed Worker and in an ignored `.dev.vars` file for a local
run. Never commit, log or paste their values. Tests do not need them.

## Run it locally

From this directory, with Node.js 22 and npm 11:

```sh
npm ci
npm run lint
npm test
npm run typecheck
npm run build
npm run dev:worker
```

`npm run dev:worker` runs the built Worker locally with Wrangler and a local D1
database. It does not deploy anything. To check the migrations, run
`node scripts/prove-local-d1-migrations.mjs`. The full command list is in the
[Local Runbook](../../docs/operations/LOCAL_RUNBOOK.md#the-web-app-appsweb).

## Deployment and migrations

There is no automatic deployment. Applying migrations to the remote database
and deploying the Worker are manual steps that Chris authorises each time,
following the [Release Workflow](../../docs/workflows/RELEASE_WORKFLOW.md).
Always run `npm run build` immediately before `wrangler deploy`.

## What is not built

- Email capture, recipient records and consent.
- PDF reports and email delivery.
- Payment (Stripe) and paid assessments.
- Discord or other operator alerts.
- Turnstile or any other bot check. The source does not use it.

These are planned in later Issues. The page must not claim them until they are
built and proven.

## History note

This source is connected to Lovable history. Do not force-push, rebase, amend,
or squash published commits.
