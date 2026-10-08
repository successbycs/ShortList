# ShortList web application

This is the adopted starting frontend for ShortList. It began as a Loveable
prototype and is now the source for the local Cloudflare Workers + Static
Assets foundation.

It contains a bounded local assessment/report runtime: safe assessment
validation and evidence processing, a typed GEO/report graph, deterministic
fixtures, and a browser-local on-page report reveal. The implementation is not
evidence of a configured or deployed service and does not make a real provider
call during normal tests.

## Run it locally

From this directory:

```sh
npm ci
npm run lint
npm test
npm run build
npm run dev:worker
```

`npm run dev:worker` runs Wrangler locally. It does not create a Cloudflare
project or deploy anything. Open the loopback URL that Wrangler prints.

## What is configured

- TanStack Start, React, TypeScript, Vite and Tailwind for the frontend.
- Nitro's Cloudflare module build target.
- `wrangler.jsonc` packages the built Worker module and `.output/public`
  directory as Workers Static Assets.
- Local server functions and D1-shaped interfaces used by the assessment
  journey; tests use deterministic fakes rather than external providers.

## What is intentionally not configured

No production route, secret, live AI provider, email provider, PDF delivery,
Discord alert, payment service, or deployment command is configured. Runtime
bindings and local interfaces do not prove an account-level resource or a
production database. Recipient persistence, consent, verified delivery, and
payment remain later approved work.

## History note

This source is connected to Lovable history. Do not force-push, rebase, amend,
or squash published commits.
