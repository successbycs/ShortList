# ShortList web application

This is the adopted starting frontend for ShortList. It began as a Loveable
prototype and is now the source for the local Cloudflare Workers + Static
Assets foundation.

It is deliberately **not yet a working assessment service**. It makes no AI,
database, email, PDF, Discord, payment, credential, or deployment call. The
screens use fictional local state so the public journey can be reviewed before
those later delivery packets are implemented.

## Run it locally

From this directory:

```sh
npm install
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

## What is intentionally not configured

No account id, route, production environment, secret, database/D1, R2, AI
provider, email provider, PDF delivery, Discord alert, payment service, or
deployment command is included. Those choices belong to later approved GitHub
Issues and must not be inferred from this foundation.

## History note

This source is connected to Lovable history. Do not force-push, rebase, amend,
or squash published commits.
