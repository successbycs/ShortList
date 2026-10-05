# Adopt the Loveable frontend as a Cloudflare Workers application

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList needs a real, locally runnable web-application foundation without
pretending that the future assessment, data, email, PDF, Discord, credential,
or deployment services already exist. After this work, a developer can build
and preview the adopted ShortList frontend locally as a Cloudflare Workers +
Static Assets application. They will see the supplied interactive journey,
but every assessment result remains clearly fictional frontend state.

## Progress

- [x] (2026-10-05 01:17Z) Inspected the approved #9 boundary, the committed Loveable export, Cloudflare static-assets guidance, and the existing build output.
- [x] (2026-10-05 01:19Z) Moved the adopted frontend source from the design-evidence location into `apps/web/` and updated the design register.
- [x] (2026-10-05 01:22Z) Added a reviewed Workers + Static Assets configuration, local commands, and source-only security boundaries.
- [x] (2026-10-05 01:23Z) Reconciled fictional content and unconfigured-service language with the MVP requirements.
- [x] (2026-10-05 01:25Z) Ran lint, tests, build, Worker type generation, local Worker preview, and static-boundary checks; recorded actual results.
- [ ] (2026-10-05 01:17Z) Record the handoff on #9 and leave it open for Chris's review.

## Surprises & Discoveries

- Observation: The Loveable export already builds to Nitro's Cloudflare module preset and produces a Worker module plus a `.output/public` static-assets directory.
  Evidence: `npm run build` in `docs/product/design/mockups/Loveable.dev/` passed on 2026-10-05. Its generated `.output/server/wrangler.json` contains an `ASSETS` binding and `directory: "../public"`.
- Observation: The prototype imports Google-hosted fonts and contains a generic package name plus generated Lovable configuration.
  Evidence: `src/routes/__root.tsx` lists `fonts.googleapis.com` and `fonts.gstatic.com`; `package.json` is named `tanstack_start_ts`.
- Observation: The source remains a frontend-only prototype at this point; no application service binding or credential exists.
  Evidence: The generated Worker configuration contains only the `ASSETS` binding and the issue scope explicitly excludes the external integrations.
- Observation: `npm run lint` passed with six inherited `react-refresh/only-export-components` warnings in generated UI components; it has no lint errors.
  Evidence: `apps/web/src/components/ui/{badge,button,form,navigation-menu,sidebar,toggle}.tsx` were named in the lint output on 2026-10-05.
- Observation: The local Worker served both the SSR page and a compiled static CSS asset successfully.
  Evidence: `wrangler dev --local --port 8787` reported `GET / 200 OK` and `GET /assets/styles-BVv2OF1F.css 200 OK`.
- Observation: Browser-level visual evidence is unobserved on this host because the available Playwright CLI has no installed Chromium distribution.
  Evidence: `playwright-cli open http://127.0.0.1:8787` failed with `Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`.

## Decision Log

- Decision: Use the supplied Loveable TanStack Start frontend as the starting application code rather than replacing it with a new generic scaffold.
  Rationale: Chris explicitly approved adoption, and its current Cloudflare-module build provides a small path to Workers + Static Assets while preserving the distinctive visual work.
  Date/Author: 2026-10-05 / Chris and Codex
- Decision: Use Cloudflare Workers + Static Assets with an explicit local `wrangler.jsonc` configuration, but do not authenticate, create a Cloudflare project, or deploy.
  Rationale: This is the explicitly approved #9 implementation boundary; local proof is useful without creating external state.
  Date/Author: 2026-10-05 / Chris and Codex
- Decision: Do not add AI, database, email, PDF delivery, Discord, credentials, payment, or deployment configuration.
  Rationale: Chris explicitly deferred every one of these service integrations.
  Date/Author: 2026-10-05 / Chris

## Outcomes & Retrospective

The starting frontend is now `apps/web/`, locally buildable and locally served
as a Worker with static assets. Lint has six non-fatal inherited Fast Refresh
warnings, and a real-browser visual check remains unobserved because this host
does not have Playwright Chromium installed. No Cloudflare account/project or
any external product service was configured. The final handoff comment and
human review remain pending.

## Context and Orientation

Issue #9, `Establish the approved ShortList product foundation`, is the first
Build & Verify implementation packet. Chris selected Cloudflare Workers +
Static Assets and explicitly approved adoption of the committed Loveable
frontend as the starting code. The current export is at
`docs/product/design/mockups/Loveable.dev/`; it is a TypeScript, React,
TanStack Start, Vite, Tailwind application. Its `npm run build` generates a
Nitro Cloudflare module in `.output/server/` and static files in
`.output/public/`.

The existing MVP requirements are in `docs/product/REQUIREMENTS.md`; the
technical choices are in `docs/product/SDD.md`; and the delivery packet
boundary is in `docs/product/DELIVERY_PLAN.md`. The UI is only a prototype:
it may demonstrate screens using local React state but must not perform an
assessment, retain a user record, send a report, call an AI model, call
Discord, expose a secret, or claim any external action happened.

The adopted code will live at `apps/web/`. `docs/product/design/README.md`
will remain the human-readable design register and will identify that the
interactive source has been adopted at that application path. The original
source's `AGENTS.md` prohibition on rewriting published Git history remains
in force after the move.

`apps/web/wrangler.jsonc` will describe only an application name,
compatibility date, Node compatibility required by the generated module, and
the build output's static-asset directory. It will contain no account id,
route, environment variable, secret, database, bucket, queue, or remote
resource. Local `wrangler dev` is a simulation, not a deployment.

## Plan of Work

### Milestone 1 — make the frontend an application source tree

Move the tracked Loveable source to `apps/web/`, leaving generated/ignored
files untracked and rebuilding them in the new location. Update its package
name and human-facing README so a developer sees that it is ShortList code,
not an anonymous generator export. Update the design register to point to the
application source and preserve the design brief, PDFs, and other static
evidence under `docs/product/design/`.

Observable result: `apps/web/package.json` and `apps/web/src/` contain the
actual starting frontend code, and the design register tells a reviewer why
the move was made.

### Milestone 2 — make the Cloudflare boundary explicit

Add `apps/web/wrangler.jsonc` using the build's `.output/server/index.mjs` as
the Worker entrypoint and `.output/public` as Workers Static Assets. Use the
current compatibility date `2026-10-05`. Add package scripts for local
development, build, local Worker preview, and non-deploying configuration
validation. Add a small application guide explaining that `wrangler dev` is
local only and `wrangler deploy` is deliberately not an approved command in
this packet.

Observable result: a developer can use documented commands to build and run
the Worker locally, with public assets and the SSR module served together.

### Milestone 3 — keep the prototype honest and self-contained

Remove browser requests to Google Fonts so the foundation has no unrelated
external browser-service dependency. Replace clearly lawn-mowing-specific
fictional content with a broad Auckland small-business example. Correct the
email result state: it must say that the future service will send a private
PDF attachment after provider acceptance, rather than claim a seven-day
secure link has already been sent. Add distinct visual states for rate
limiting and exhausted entitlement. Preserve the insufficient-evidence state
without any Discord call or browser-visible operator alert.

Observable result: all visitor-facing statements make the frontend-only
boundary clear enough for a local demo without creating an unsupported service
promise.

### Milestone 4 — prove and record the local boundary

Run the app's lint, unit tests, build, and local Worker preview. Use a local
HTTP request and browser inspection to prove that `/` returns the ShortList
page and an asset request returns a static asset. Check source/configuration
for provider keys, bindings, deployment commands, and outbound URLs beyond
ordinary development metadata. Record successful and failed checks exactly,
then add a concise #9 Issue handoff without closing the Issue.

## Concrete Steps

Run from `/home/chris/ShortList` unless a step says otherwise.

1. Move tracked application source to `apps/web/`, then update the design
   register and application-specific files using `apply_patch`.
2. In `apps/web/`, run:

   ```text
   npm run lint
   npm test
   npm run build
   npx wrangler types
   npx wrangler dev --config wrangler.jsonc
   ```

   Expected: lint, tests, and build exit zero; the local preview reports a
   loopback URL. `wrangler dev` must never be invoked with `--remote`.
3. While the preview is running, request `/` and one emitted `/assets/...`
   URL. Expected: both return `200`; the HTML contains `ShortList`.
4. Run `npx wrangler deploy --dry-run --config wrangler.jsonc` only if it is
   a local packaging check and does not request or create remote resources.
   A real deploy is out of scope.

Actual commands and outcomes will be appended as implementation proceeds.

Completed local results on 2026-10-05:

```text
apps/web $ npm run lint
exit 0; 6 inherited react-refresh warnings; 0 errors

apps/web $ npm test
1 test passed

apps/web $ npm run build
exit 0; generated .output/server/index.mjs and .output/public/

apps/web $ npm run types
exit 0; generated local-only worker-configuration.d.ts (ignored)

apps/web $ npm run dev:worker -- --local --port 8787
Ready on http://localhost:8787
GET / 200 OK
GET /assets/styles-BVv2OF1F.css 200 OK
```

## Validation and Acceptance

| Claim | Proof boundary | Required evidence | Status |
| --- | --- | --- | --- |
| Adopted frontend builds | Local Node toolchain | `npm run lint` (0 errors; 6 inherited warnings), `npm test` (1 passed), and `npm run build` | Passed with warnings |
| Worker + Static Assets configuration is valid | Local Wrangler packaging / dev runtime | `wrangler types`, local `wrangler dev`, and HTTP 200 checks for `/` and compiled CSS | Passed locally |
| Prototype is service-free | Source/configuration inspection | `ASSETS` is the only binding; no browser font request, credential, provider call, or deployment configuration | Passed by static inspection |
| Product service works | Real provider/account boundary | Not authorised for this packet | Unobserved by design |
| Cloudflare deployment works | Real Cloudflare account/project | Not authorised for this packet | Unobserved by design |
| Browser visual check | Real local browser | Playwright CLI attempted but no Chromium distribution exists on host | Unobserved / host prerequisite missing |

Acceptance requires a human reviewer to be able to start the application
locally, see the adopted UI, and confirm the explicit no-service boundary.
The issue remains open for Chris to review and decide when to mark it Done.

## Idempotence and Recovery

`npm install`, lint, tests, and build are repeatable. The build directories
and `node_modules` are ignored, so deleting only those generated directories
and reinstalling recovers a broken local installation. The source move is
recorded as an ordinary Git rename and must not be rebased, amended, or force
pushed because the upstream Loveable workflow relies on published history.

No Cloudflare resources are created. If local Wrangler configuration is
invalid, revert only the new configuration source files and retain the
existing prototype in Git history; do not use `wrangler deploy`, remote dev,
or any credential command as a recovery action.

## Artifacts and Notes

- `apps/web/`: adopted frontend source and local Cloudflare Worker setup.
- `docs/product/design/README.md`: design register and source-location note.
- `docs/product/SDD.md` and `docs/product/DELIVERY_PLAN.md`: revised to record
  that this exact #9 foundation is now selected while external components
  remain deferred.
- GitHub Issue #9: human review handoff with commands and actual results.

## Interfaces and Dependencies

- `apps/web/wrangler.jsonc`: Worker packaging configuration. It has a
  `main` module at `.output/server/index.mjs`, a static-asset `directory` at
  `.output/public`, and the automatically provided `ASSETS` binding only.
- `apps/web/src/`: React/TanStack Start pages and UI components. It must not
  import or access any service credential or future runtime binding.
- `apps/web/package.json`: local scripts use the pinned package versions from
  the adopted export. It will not include a deploy script.
- Cloudflare account/project, AI provider, database/D1, R2, email, PDF,
  Discord, secrets, payment, domain routing, and production deployment are
  intentionally absent dependencies.
