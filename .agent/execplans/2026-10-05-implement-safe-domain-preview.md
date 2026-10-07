# Implement safe domain assessment and immediate preview

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

GitHub Issue #10 makes the first real ShortList assessment journey possible. A
visitor will submit a public domain and receive an honest immediate teaser from
safe website evidence and the two dated AI evidence modes. Invalid input,
private targets, unreadable sites, insufficient evidence and safety-limit
failures will show clear public-safe states rather than causing uncontrolled
fetches or invented claims.

This V1 slice includes the live Cloudflare deployment, `shortlist.successbycs.com`,
the existing D1 record store, server-side secrets, rate/concurrency controls,
and real, bounded OpenAI evidence calls. Turnstile is deferred until MVP 3+.
It excludes PDF/R2 delivery, Discord, Workflows, dashboards, and other
advanced automation.

## Progress

- [ ] (2026-10-06 04:35Z) Apply the approved temporary increase from five to
  100 privacy-minimised IP assessment starts per Auckland calendar day. This
  requires both the server constant and a D1-compatible ordered schema migration,
  because the existing database CHECK constraint disallows a sixth start.

- [x] (2026-10-06 03:35Z) Chris withdrew Turnstile from MVP 1 after both the
  automated live browser and normal-browser path proved it blocked assessment
  completion. Removed the widget, browser token state, server Siteverify
  boundary, and related runtime contract; retained domain, safe-fetch, domain
  lease, concurrency and privacy-minimised IP/day controls. The Cloudflare
  widget and secret are intentionally left untouched but unused for possible
  MVP 3+ work.
- [ ] (2026-10-06 04:04Z) Run the approved real public Green Gecko assessment
  without Turnstile, record its D1 evidence, then repeat the domain to prove
  cache reuse without a second costly assessment. The first actual rebuilt
  Worker request reached D1 admission within the 30-second browser limit, but
  the five earlier diagnostic attempts consumed the test browser IP's daily
  five-start allowance. The only remaining production blocker is explicit
  owner approval to remove that single test-only rate-limit row.
- [x] (2026-10-06 04:07Z) With Chris's explicit approval, removed only the
  single confirmed test-only rate-limit row, then ran Green Gecko through the
  rebuilt public Worker. The browser reached the truthful limited-evidence
  outcome in under 13 seconds. Remote D1 contains one `limited` run and one
  website-evidence record with reason `size_limit_exceeded`; it contains no AI
  evidence. This proves the real domain, safe fetch, D1 persistence and public
  failure journey, but not the full-result or cache-replay path.

- [x] (2026-10-05 05:55Z) Inspected the frontend, Worker configuration,
  contracts, delivery plan and private-record architecture.
- [x] (2026-10-05 06:00Z) Confirmed prerequisite #5 is closed by Chris; #10
  is now eligible to begin.
- [x] (2026-10-05 05:54Z) Moved #10's existing GitHub Project item to In
  Progress and linked this plan in an Issue decision comment.
- [x] (2026-10-05 06:56Z) Implemented offline deterministic domain admission
  and fixture tests. It accepts an ordinary public hostname or pasted HTTP(S)
  URL, normalises the hostname, and rejects malformed input, credentials,
  non-HTTP(S) schemes, ports and syntactically local/private targets before a
  network operation.
- [x] (2026-10-05 07:10Z) Added the additive D1 migration source for the
  Customer, Assessment run and Website evidence contracts. It is not applied:
  the Worker has no D1 binding or named local/test database yet.
- [x] (2026-10-05 07:12Z) Added a bounded, fixture-tested HTML evidence
  extractor. It is non-networking and requires explicit caller-supplied content
  and byte limits; it cannot bypass the pending safe-fetch configuration.
- [x] (2026-10-05 07:15Z) Connected the existing public prototype to the
  tested domain-admission gate. It stops invalid/local/private input before the
  checking state and displays the normalised submitted domain during checking.
- [x] (2026-10-05 07:45Z) Chris approved the conservative MVP safe-fetch,
  abuse, Auckland-context and public-limited-state policy recorded in
  `docs/product/SAFE_FETCH_POLICY.md` and GitHub #10.
- [x] (2026-10-05 07:46Z) Implemented the policy's server-only single-page
  fetch boundary with injected fake transport tests: manual redirects, target
  validation at every hop, abort timeout, allowed-content enforcement and
  byte-bounded streamed reads.
- [x] (2026-10-05 07:52Z) Implemented a D1-compatible customer, assessment-run
  and website-evidence repository with a fake-D1 contract test. The binding and
  migration application remain unobserved until a named local/test D1 target is
  configured.
- [x] (2026-10-05 08:02Z) With Chris’ explicit approval, created the empty
  `shortlist-mvp1` Cloudflare D1 database in the Oceania region and generated
  the checked-in `SHORTLIST_DB` Worker binding. `npm run types`, TypeScript,
  and the repository fixture tests passed. No Worker deployment, database
  migration, customer data, DNS change, or live provider request occurred.
- [x] (2026-10-05 08:07Z) Repaired the production build: the public route had
  imported domain validation from `src/server/`, which TanStack Start correctly
  rejects in the browser bundle. The offline, non-secret input validator now
  lives in `src/lib/` and remains shared with the server fetch boundary. Focused
  tests, typecheck, lint (0 errors), whitespace check and production build pass.
- [x] (2026-10-05 08:10Z) Applied and queried `0001_assessment_core.sql` in
  Wrangler's local D1 emulator only. The `customers`, `assessment_runs` and
  `website_evidence` tables and both application indexes were observed. The
  remote database remains empty and unmigrated.
- [x] (2026-10-05 08:16Z) Added an additive second D1 migration which records
  website extraction separately from fetch outcome, and a fixture-tested
  website-assessment coordinator. It admits a domain, records a dated run,
  safely fetches and extracts bounded evidence, and stores either a
  `preview_ready` or honest limited outcome. It remains unexposed to public
  traffic until the route's abuse controls are implemented.
- [x] (2026-10-05 08:23Z) With Chris' explicit approval, applied both reviewed
  migrations to remote `shortlist-mvp1` D1 and queried the schema. The three
  application tables are present in the Cloudflare Oceania/Auckland-serving
  database and all customer, assessment and evidence counts are zero.
- [x] (2026-10-05 08:31Z) Chris created the approved managed Turnstile widget
  through Cloudflare Dashboard Turnstile Spin. Cloudflare displayed a site key
  and private secret, neither of which is recorded in this repository or plan.
- [x] (2026-10-05 09:16Z) Chris approved the browser-to-server Turnstile
  contract: the domain form supplies a one-time token; the server requires a
  successful Siteverify result for `domain_assessment` and the actual approved
  hostname before D1 persistence or a website fetch.
- [x] (2026-10-05 09:30Z) Added the explicit browser widget, server-only
  Siteverify boundary, Worker binding adapter, server-function route, and
  journey tests. The prior prototype-only completion button is removed.
- [x] (2026-10-05 09:30Z) Added `docs/product/REQUEST_FLOW.md` and an Issue #10
  flowchart comment so a human reader can trace each request boundary and D1
  write without reading source code.
- [ ] (2026-10-05 09:30Z) Run the real local Worker proof with a fresh
  Turnstile response once the ignored root `.env` values are visible to the
  local runtime. It must prove one accepted request and one rejected replay
  without exposing either credential or creating production customer data.
- [x] (2026-10-05 10:10Z) Chris clarified that a live site, DNS, the existing
  D1 database, server-side secrets and Turnstile are V1 completion work. R2,
  PDF storage, Discord, Workflows, dashboards and advanced automation are not.
- [x] (2026-10-05 10:14Z) Chris approved reuse of the existing project-specific
  `OPENAI_API_KEY` for bounded live V1 assessment calls. Its value was only
  presence-checked in ignored local configuration and was not displayed.
- [ ] (2026-10-05 10:14Z) Extend the existing server route and D1 schema to
  persist the two approved AI-evidence records, then run one explicit local
  live assessment against a chosen public domain before deployment.
- [x] (2026-10-05 10:14Z) Added the `ai_evidence` migration and the
  server-side assessment path, including cache-first reuse by normalised domain,
  two separately labelled AI evidence modes, and fixture tests.
- [x] (2026-10-05 10:20Z) Applied `0003_ai_evidence.sql` to the named remote
  `shortlist-mvp1` D1 database. The additive table and index are present; no
  customer assessment has been created.
- [x] (2026-10-05 11:14Z) Confirmed ignored local configuration contains the
  OpenAI key, public Turnstile site key and server-only Turnstile secret without
  printing any value. Full test, lint and production build validation passed.
- [x] (2026-10-05 11:35Z) Re-read the user-authorised #10 scope, configured
  GitHub target, current Issue, baseline and existing implementation. The
  request narrows this session to Packet A/B: no deployment, live assessment,
  secret inspection, Project mutation or real provider call.
- [x] (2026-10-05 11:35Z) Added `0004_assessment_admission_limits.sql` and
  deterministic D1-fake tests for a domain lease, two global slots and a
  five-start Auckland-day HMAC-IP limit. The live coordinator checks cache
  first, reserves all three controls before website/AI work, and releases
  leases in `finally`.
- [x] (2026-10-05 11:35Z) Ran focused tests, the complete suite, lint,
  Wrangler type generation, TypeScript, production build and whitespace check.
  Record the commit and GitHub review handoff next; no migration or live
  external boundary was invoked.
- [x] (2026-10-05 11:14Z) Committed the reviewed #10 implementation before
  Symphony admission as `0acf9cb`. Symphony received that committed baseline.
- [x] (2026-10-06 02:xxZ) Promoted the reviewed Symphony correction to the
  local `main` baseline as `a44a1bd`. The original handoff also changed this
  live plan, so its documentation hunk was deliberately retained here and only
  the two reviewed admission code files were applied.
- [x] (2026-10-06 02:xxZ) Confirmed the correction makes the admission lease
  70 seconds, protecting the documented maximum 65-second run. Its isolated
  worker evidence records 74 passing tests, 0 lint errors and a passing build;
  local revalidation remains required before external deployment.
- [x] (2026-10-06) Revalidated the correction locally: the focused admission
  suite passed 11 tests; the full suite passed 13 files / 74 tests; Wrangler
  types, strict TypeScript, production build and whitespace check passed. Lint
  retained 0 errors and the existing 8 warnings.
- [x] (2026-10-06) Read-only Cloudflare preflight confirmed authenticated
  Wrangler access and the remote D1 core/AI-evidence schema. The local OpenAI
  and Turnstile values are present without being displayed. The required
  `ASSESSMENT_IP_HASH_SECRET` is not yet configured.
- [x] (2026-10-06) Pushed the reviewed #10 commits; set the three Worker-only
  secrets; repaired the migration ledger for already-applied `0003`; applied
  `0004`; deployed `shortlist-web`; and attached
  `shortlist.successbycs.com`. Public HTTPS returned HTTP 200.
- [ ] (2026-10-06) Run the approved Green Gecko assessment with a fresh
  Turnstile response and prove cached replay. The initial `110200` hostname
  block was repaired by Chris in Cloudflare Dashboard. A later real-browser
  submission displayed the limited-evidence page, but remote D1 had no related
  row; therefore the request stopped before website retrieval and has not
  proved the assessment or cache boundary. Deploy the reviewed #48 truthful UI
  correction, then repeat the bounded real-browser proof.
- [x] (2026-10-06) Promoted the reviewed Symphony child packet #48 as local
  commit `26e80f7`. It maps early server results to truthful visitor messages
  instead of collapsing them into the limited-evidence screen. Focused journey
  tests passed 9 tests; the complete suite passed 13 files / 79 tests; strict
  TypeScript, Wrangler types and the production build passed. Lint retained 0
  errors and the existing 8 warnings. Deployment and real-browser proof remain
  separately unperformed.
- [x] (2026-10-06) With Chris's explicit deployment approval, rebuilt and
  deployed the #48 correction as Worker version
  `f94b4b4d-2100-491c-b8c3-74763cb57f99`. The existing custom domain remains
  attached, public HTTPS returned 200, and read-only metadata confirms the D1
  binding plus `OPENAI_API_KEY`, `TURNSTILE_SECRET`, and
  `ASSESSMENT_IP_HASH_SECRET` by name only. A real Green Gecko assessment and
  cached replay are still required; deployment does not prove them.
- [ ] Record the remaining owner safety choices: fetch/redirect/DNS budget,
  abuse limits, suburb-reference source/version and limited-state wording.
- [ ] Implement the admission, evidence, teaser and local tests below.
- [ ] Record verification and leave #10 open for Chris's review.

## Surprises & Discoveries

- Observation: Cloudflare D1 rejected `BEGIN TRANSACTION` before executing the
  limit migration; the table and all counters remained unchanged.
  Evidence: Read-only remote schema inspection at 04:36Z still reported the
  original `CHECK (start_count BETWEEN 1 AND 5)`, a count of five, and no
  replacement table. The migration therefore uses D1's supported ordered
  statement sequence, copying all rows before dropping the original table.

- Observation: `wrangler deploy` deploys the generated `.output` artifact; it
  does not build source files first. Earlier source-only deployments left the
  live Worker running the old server-function bundle. A fresh `npm run build`
  changed the server chunks, and Worker version
  `a0a523a4-3daa-4b6b-96b1-7a539f010c54` was the first rebuilt deployment.
  Evidence: the public server-function response omitted newly added diagnostic
  fields before the build, then the deploy output showed new generated module
  hashes after the build.

- Observation: Cloudflare's `crypto.randomUUID` must retain the `crypto`
  receiver. Detached callbacks caused the initial Worker failure. All three
  assessment-path defaults now use closures that invoke `crypto.randomUUID()`.
  Evidence: public browser error and source correction verified by focused
  assessment tests and strict TypeScript on 2026-10-06.

- Observation: remote D1 contains the complete assessment schema and no
  Green Gecko customer, run or evidence records. It does contain exactly one
  Auckland-day HMAC-IP row with `start_count = 5`, created by this session's
  diagnostic requests; no active domain lease or concurrency slot remains.
  Evidence: read-only scoped remote D1 queries on 2026-10-06.

- Observation: Green Gecko's origin advertises a 77 KB compressed HTML
  response, while the Worker sees 1.36 MiB after decoding. It therefore hit
  the former 1 MiB ceiling, rather than being unreachable or malformed. Chris
  revised the approved per-page limit to 5 MiB on 2026-10-06; this remains a
  firm decoded-body boundary and covers the measured page with headroom.
  Evidence: read-only `curl -I` response headers and the persisted D1 outcome
  from the 2026-10-06 public browser run.

- Decision: Chris approved a 16,000-input-token and 600-output-token boundary
  for each MVP 1 AI view, with a US$0.01 estimated per-view budget. The two
  views can therefore have a combined estimated budget of US$0.02. The limit
  was raised after the genuine current-web request used 13,189 input tokens;
  its 428-token output was already within the existing output boundary.
  Date/Author: 2026-10-06 / Chris.

- Observation: `apps/web/wrangler.jsonc` only contains the Static Assets
  binding, not D1, R2, secrets, Turnstile, Workflows or deployment settings.
  Evidence: direct file inspection on 2026-10-05.

- Observation: the adopted Loveable frontend is local-state prototype code;
  there is no assessment route, persistence layer or safe fetcher yet.
  Evidence: `apps/web/src/routes/index.tsx` and source inventory.

- Observation: the #5 evidence contract is now closed and supports fixture
  execution without a credential or network request.
  Evidence: GitHub Issue #5 state and its documented test results.

- Observation: a local syntactic guard cannot establish that a public-looking
  hostname will resolve publicly when fetched.
  Evidence: hostname validation has no DNS result. The later safe fetcher must
  validate resolved addresses and every redirect at connection time.

- Observation: creating D1 with Wrangler's named binding updated
  `apps/web/wrangler.jsonc` with the generated database ID. The ID identifies a
  Cloudflare resource but is not a secret; it is required for the Worker
  binding. The empty database has no schema until a migration is explicitly
  applied.
  Evidence: `npx wrangler d1 create shortlist-mvp1 --location oc --binding
  SHORTLIST_DB` on 2026-10-05.

- Observation: TanStack Start prevents browser modules from importing files
  inside `src/server/`, even if the specific export is pure. The generated
  Cloudflare deployment configuration preserves the D1 binding from the source
  Wrangler configuration.
  Evidence: successful `npm run build` on 2026-10-05 and generated
  `.output/server/wrangler.json`.

- Observation: Cloudflare Dashboard Turnstile Spin can create the approved
  widget without the project needing to invoke the Turnstile API. The dashboard
  returned the widget credentials only in Chris's browser.
  Evidence: Chris's confirmed “Turnstile is ready” dashboard screen on
  2026-10-05.

- Observation: upstream Symphony workers clone committed source, while the
  current #10 implementation remains in the active uncommitted worktree.
  Applying `symphony:ready` before a scoped commit would give the worker a stale
  baseline and could duplicate or conflict with the active implementation.
  Evidence: `WORKFLOW.md` uses `git clone` in `after_create`; `git status
  --short` on 2026-10-05 lists the active #10 changes.

- Observation: the current Worker request path requires a private
  `ASSESSMENT_IP_HASH_SECRET` in addition to OpenAI and Turnstile secrets.
  Evidence: `apps/web/src/functions/submit-domain-assessment.ts` calculates a
  day-scoped HMAC of the Cloudflare request IP and returns the public-safe
  unavailable state when the secret is absent; a 2026-10-06 presence check
  found it absent from ignored local configuration.

- Observation: the existing Turnstile widget does not yet authorise the
  deployed hostname. A real browser receives error `110200` before it can
  produce a token. The available Cloudflare API token has no
  `Account.Turnstile:Edit` scope, so it cannot repair the widget configuration.
  Evidence: public browser console and the Turnstile skill's authenticated
  scope probe on 2026-10-06. Cloudflare documents `110200` as “Domain not
  authorized”.

## Decision Log

- Decision: Temporarily raise the per-IP Auckland-day assessment-start limit
  from five to 100 while Green Gecko and the real browser journey are tested.
  Rationale: Five earlier diagnostic starts exhausted the test browser's
  allowance before a successful current-web plus model-knowledge proof was
  possible. The limit continues to use only a daily HMAC of the visitor IP;
  it does not store raw IP addresses. The two global slots and one-active-
  domain controls remain unchanged.
  Date/Author: 2026-10-06 / Chris

- Decision: Use Cloudflare Workers + Static Assets with D1 as the later record
  source of truth; the normalised domain identifies a customer but is never an
  authorisation key.
  Rationale: this is the approved private-record architecture.
  Date/Author: 2026-10-05 / Chris.

- Decision: Reuse `apps/web/src/server/ai-search/` from #5. The assessment
  route will not duplicate provider request construction.
  Rationale: one evidence contract must serve both teaser and report work.
  Date/Author: 2026-10-05 / Chris and Codex.

- Decision required: exact fetch/redirect/DNS limits, IP/domain/concurrency and
  bot-control limits, Auckland suburb-reference source/version, and final
  public wording for unreadable/insufficient outcomes.
  Rationale: these affect safety, cost and customer experience and cannot be
  silently chosen in source code.
  Date/Author: pending / Chris.

- Decision: Approve the conservative MVP safe-fetch policy: entry page plus two
  same-origin pages, HTML/XHTML only, 5 MiB per page, 8 seconds per page,
  20 seconds per assessment, three validated redirects, two global runs, one
  active run per domain, five starts per privacy-minimised IP/day, server-side
  Turnstile before costly work, and versioned curated Auckland-suburb data.
  Rationale: Chris approved the recorded #10 recommendation to bound cost and
  abuse while retaining a useful small-business assessment path.
  Date/Author: 2026-10-05 / Chris.

- Decision: Protect the public domain-assessment submission with the managed
  Turnstile widget created in Cloudflare Dashboard. The browser receives only
  the site key; a TanStack Start server function verifies the one-time response
  against Siteverify before D1 persistence or a website fetch.
  Rationale: this enforces the approved bot-control boundary without exposing
  the private verification secret to browser code.
  Date/Author: 2026-10-05 / Chris and Codex (implementation approval pending).

- Decision: Treat the minimum Cloudflare delivery path as V1, not V3: Worker
  deployment, custom hostname, D1, server-side OpenAI secret and Turnstile are
  required for a real public assessment. Defer R2/PDF storage, Discord,
  Workflows, dashboards and advanced automation.
  Rationale: a website is not V1-complete until Chris can use the public URL.
  Date/Author: 2026-10-05 / Chris.

- Decision: Remove Turnstile from the MVP 1 request path and defer it until
  MVP 3+. Keep the existing server-side input, safe-fetch, domain-concurrency
  and privacy-minimised IP/day controls; do not delete the dashboard widget or
  its Worker secret during this change.
  Rationale: real normal-browser verification was rejected server-side and
  automated Chromium is deliberately classified as non-human. The gate blocks
  the MVP's primary assessment proof without providing an MVP-proportionate
  benefit.
  Date/Author: 2026-10-06 / Chris.

- Decision: Reuse the existing project-specific OpenAI API key for the first
  bounded live assessment proof.
  Rationale: Chris explicitly approved reuse; the key remains server-only.
  Date/Author: 2026-10-05 / Chris.

- Decision: This Packet A implementation uses a server-side HMAC digest of the
  connecting IP and its Pacific/Auckland calendar-day key. Raw IP addresses are
  never persisted; the digest can count starts for one day without becoming a
  customer identifier. Two fixed D1 lease rows enforce the global limit and a
  unique normalised-domain lease enforces the duplicate-active limit.
  Rationale: the Issue explicitly requires a privacy-minimised IP count,
  Auckland-day calculation, two global concurrent runs and no costly work for
  a rejected admission. Conditional D1 mutations make the allowed reservation
  observable and safely releasable without a live external test.
  Date/Author: 2026-10-05 / Codex.

- Decision: Preserve the full 70-second assessment-admission lease across the
  20-second website budget and the two parallel 45-second AI requests.
  Rationale: the previous 30-second lease could expire during a legitimate
  bounded assessment, allowing an overlapping run to bypass the duplicate and
  global-capacity controls. The correction has deterministic fake-D1 tests for
  maximum-duration protection and stale-lease recovery.
  Date/Author: 2026-10-06 / Codex, following Chris's correction re-admission.

## Outcomes & Retrospective

Planning is complete and implementation is ready to start. It will stop at a
locally verified, server-side assessment and teaser path. It cannot claim a
remote Cloudflare deployment, customer data, email delivery or a real provider
response until a separately authorised boundary test occurs.

The first implementation slice is complete: the app can now make a safe,
offline accept/reject decision before any website request. It does not claim to
be a complete safe fetcher or to persist an assessment.

The second preparatory slice is also complete:
`apps/web/migrations/0001_assessment_core.sql` defines the first D1 tables,
foreign-key relationships, bounded evidence fields and query indexes. A later
configured local D1 run must apply and exercise the migration before persistence
can be claimed.

The third preparatory slice is complete:
`apps/web/src/server/website-evidence.ts` accepts an already-approved response,
does not execute page content, strips inactive script/style/noscript content,
and returns only bounded title, description and text evidence or an honest
limited reason. It is not a DNS resolver or HTTP fetcher.

The prototype now demonstrates the first part of the intended single-page
journey without pretending to fetch a real customer site: input is validated,
then the normalised domain remains visible above the checking steps. A later
server action replaces the prototype's manual completion control.

The project now produces a valid Cloudflare Worker package after the shared
domain-admission function was moved out of the server-only source tree. This
preserves a browser-side early error message while the future server route still
performs the authoritative check again before persistence or fetching.

The safe-fetch transport boundary is now implemented in
`apps/web/src/server/safe-website-fetch.ts`. It does not automatically follow
redirects, validates every submitted/redirected URL using the domain-admission
gate, sends no visitor credentials, accepts only the approved content types,
uses an abort signal, and cancels streamed reads above the byte limit. The
Cloudflare Worker platform, not application code, supplies public-outbound DNS
resolution; a platform-boundary test remains unobserved until a later approved
local/remote Worker invocation.

The D1 persistence boundary is now implemented in
`apps/web/src/server/assessment-repository.ts`. It uses parameter-bound queries
only, reuses an existing customer by normalised domain, creates a fresh dated
assessment run, and stores bounded website evidence separately. Tests supply a
fake D1 implementation. The empty `shortlist-mvp1` D1 resource is now bound in
the Worker configuration. Both reviewed migrations are proven locally and now
applied remotely; the remote database currently has its empty schema only.

The coordinator in `apps/web/src/server/website-assessment.ts` now joins these
boundaries without invoking AI: invalid input makes no database or fetch call;
captured evidence produces `preview_ready`; and a failed fetch or insufficient
evidence produces a stored, public-safe limited outcome. Its dependencies are
injected for deterministic tests. It is not yet a public server route, which
prevents bypassing the pending Turnstile, rate and concurrency gates.

## Stop point: Turnstile integration approval

The managed Turnstile widget has been created through Cloudflare Dashboard.
The next integration is to embed it on the domain form and verify its
one-time response inside the assessment's server function. The handler must
require a successful response, action `domain_assessment`, and the expected
frontend hostname before it creates any D1 record or fetches the submitted
website. Explicit approval is pending because this changes a visitor-facing
form and its server behavior.

Chris has chosen a V1 local-development exception for the short-lived widget
provisioning token: `CLOUDFLARE_API_TOKEN` may be kept in the already
Git-ignored root `.env` file. It remains out of source control and must not be
printed or copied to an Issue. Its lifecycle hardening (replacement by a
managed local secret store, expiry/rotation, and removal after provisioning)
is deferred to the existing credentials/security task #30. Once Cloudflare has
created the widget, its `TURNSTILE_SECRET` may also be placed in that ignored
local `.env` for local V1 development. A later deployment remains required to
use Cloudflare's Worker secret store rather than a checked-in configuration or
browser-exposed variable.

## Context and Orientation

`docs/product/REQUIREMENTS.md` defines the immediate journey as
`MVP1-JNY-001` to `MVP1-JNY-004`; safety and identity are
`MVP1-DOM-001` to `MVP1-DOM-003`, `MVP1-ABUSE-001` and `MVP1-DATA-001`.
`docs/product/CONTRACTS.md` defines Customer, Assessment run, Website evidence,
Auckland context and AI evidence records. The AI configuration is fixed in
`docs/product/AI_SEARCH_RUNTIME_CONFIGURATION.md`.

`docs/product/REQUEST_FLOW.md` is the human-readable system flow. It names the
browser, Turnstile, TanStack server function, Worker, D1 and public-website
boundaries, and lists exactly which D1 writes the domain-assessment path makes.

`apps/web/src/routes/index.tsx` is the public prototype. Its normal brand
header must remain while the screen transitions from submitted domain to
checking, teaser or safe limited state; developer-state navigation must remain
hidden. `apps/web/src/server/ai-search/` is server-only and produces the two
labelled AI evidence records when given an evidenced business type.

## Plan of Work

### Milestone 1: Safe admission configuration

Define a server-only, typed configuration shape for the approved limits. It
must reject malformed domains before persistence or network access. The safe
fetch design must prevent local/private targets, unsafe redirects and DNS
changes, restrict response type/size/time, and translate all internals to the
approved public outcome. Test fixtures simulate every network condition; tests
must not fetch arbitrary public URLs.

Observable result: valid and unsafe fixture targets get deterministic
reason-coded admission decisions.

### Milestone 2: Private records and website evidence

Add additive D1 migrations and server-only repositories for Customer,
Assessment run, Website evidence, Auckland context and permitted attribution.
A valid normalised domain reuses one customer record and creates a dated
assessment run. Invalid input creates no customer. Extracted page evidence is
bounded metadata/excerpts and untrusted data; every material assessment finding
has evidence IDs or is marked insufficient.

Observable result: tests prove duplicate-domain reuse, invalid non-persistence
and evidence-backed versus insufficient fields.

**Status:** the migration source is prepared. Repository functions and a local
D1 test harness remain to be implemented after an approved binding/test target
exists.

### Milestone 3: Teaser route and journey

Add a server action/route that admits the domain, persists the safe run,
collects evidence, derives a supported business type, and consumes the #5
provider interface. Persist its dated AI evidence without exposing a credential
or raw provider object. Return a narrow teaser view model, never a record or
private report.

Update the prototype so checking appears below the stable header and a useful
teaser appears before email capture. Invalid, unsafe, unreadable and
insufficient outcomes must each use their public-safe wording. The blurred
continuation prepares for #11; it does not collect or confirm email yet.

Observable result: UI/route fixtures demonstrate valid checking-to-teaser and
every limited state with no internal navigation.

### Milestone 4: Abuse controls and local proof

Apply approved server-side IP/domain/concurrency controls before costly work.
Capture only allow-listed UTM/referral data. Add bot verification only when its
configuration and local test method are approved; browser-only checks are not a
security control. Verify UTC storage and Auckland display, including a
daylight-saving fixture.

Observable result: repeated/concurrent fixtures stop before AI processing and
the local Worker path passes without secret exposure.

**Packet A implementation detail:** `assessment_admission_leases` holds an
active normalised-domain claim and `assessment_concurrency_slots` has exactly
two seeded slot identifiers. An allowed request claims its domain, atomically
claims one empty slot, then atomically increments a per-Auckland-day HMAC-IP
counter only if it remains below five. Every claim is released by the
server-side coordinator in a `finally` block. The normal assessment row is
created only after all three claims succeed. Tests use a deterministic fake D1
and injected clock/digest; they do not fetch a website or contact OpenAI.

## Concrete Steps

From `/home/chris/ShortList`:

```sh
git status --short
gh issue view 10 --repo successbycs/ShortList
```

From `/home/chris/ShortList/apps/web` after implementation begins:

```sh
npm run types
npx tsc --noEmit
npm test
npm run lint
npm run build
```

Expected: type checking and tests pass; lint has no errors; existing warnings
are recorded rather than suppressed. A local Worker HTTP test is added only
when a route and test-safe local bindings exist. Fixture proof never proves a
remote Cloudflare deployment or a real OpenAI response.

Observed on 2026-10-05 for the domain-admission slice:

```text
npx tsc --noEmit          # passed
npm test -- domain-admission.test.ts
# Test Files  1 passed (1); Tests  17 passed (17)
npm run lint              # 0 errors; 8 existing warnings
git diff --check          # passed
```

Observed on 2026-10-05 for the bounded-extractor slice:

```text
npx tsc --noEmit                  # passed
npm test -- website-evidence.test.ts
# Test Files  1 passed (1); Tests  6 passed (6)
npm run lint                      # 0 errors; 8 existing warnings
git diff --check                  # passed
```

Observed on 2026-10-05 for the D1-compatible repository slice:

```text
npx tsc --noEmit                  # passed
npm test -- assessment-repository.test.ts safe-website-fetch.test.ts domain-admission.test.ts website-evidence.test.ts prototype-journey.test.tsx
# Test Files  5 passed (5); Tests  43 passed (43)
npm run lint                      # 0 errors; 8 existing warnings
git diff --check                  # passed
```

Observed on 2026-10-05 for the safe-fetch boundary:

```text
npx tsc --noEmit                  # passed
npm test -- safe-website-fetch.test.ts domain-admission.test.ts website-evidence.test.ts prototype-journey.test.tsx
# Test Files  4 passed (4); Tests  40 passed (40)
npm run lint                      # 0 errors; 8 existing warnings
git diff --check                  # passed
```

Observed on 2026-10-05 for the visible-domain journey slice:

```text
npx tsc --noEmit                  # passed
npm test -- prototype-journey.test.tsx domain-admission.test.ts website-evidence.test.ts
# Test Files  3 passed (3); Tests  27 passed (27)
npm run lint                      # 0 errors; 8 existing warnings
git diff --check                  # passed
```

## Validation and Acceptance

| Capability | Required proof | Current status |
| --- | --- | --- |
| Domain admission | Tests cover malformed, private/local, scheme, credential and port outcomes before network access | Passed (offline boundary only) |
| Safe public fetch | Fake-transport tests cover manual redirect, unsafe redirect, content and streamed byte limits | Passed (local/fake); Cloudflare boundary unobserved |
| Bounded website evidence | Fixtures cover content type, size ceiling, inert extraction and sparse page text | Passed (extractor only; safe fetch pending integration) |
| Record isolation | Fake-D1 tests cover unique customer reuse, new dated runs and bound evidence parameters | Passed (fake D1); real D1 binding unobserved |
| Honest teaser | UI tests prove malformed/private input is stopped and the normalised domain remains visible during checking | Partially passed (prototype; real route pending) |
| Dated AI modes | Integration uses the #5 fixture provider and preserves labels/citations/warnings | Planned |
| Abuse boundary | Repeated/concurrent tests stop before provider work | Awaiting owner limits |
| Real Cloudflare/OpenAI | Separately authorised remote test with redacted evidence | Unobserved |

## Idempotence and Recovery

Fixture tests, lint and builds are repeatable. Migrations must be additive and
run only against a named local/test D1 database until a remote migration is
explicitly authorised. Stable identifiers, transactions and unique constraints
must prevent a retry duplicating a customer or exposing recipient data. A fetch
or provider failure records only a safe reason-coded outcome and never falls
back to unrestricted fetching or unbounded retry.

No credentials, Cloudflare resources, customer data, external requests or
deployment are created by this plan. Recover from a local test failure by
discarding only isolated test data; never reset an uninspected working tree.

## Artifacts and Notes

- Implementation Issue: [#10](https://github.com/successbycs/ShortList/issues/10)
- Completed dependency: [#5](https://github.com/successbycs/ShortList/issues/5)
- AI envelope: `docs/product/AI_SEARCH_RUNTIME_CONFIGURATION.md`
- Architecture: `docs/product/ARCHITECTURE_DECISION.md`
- Contracts: `docs/product/CONTRACTS.md`
- Current frontend: `apps/web/src/routes/index.tsx`

The central risk is turning a simple URL field into an unrestricted server-side
fetch facility. The safety envelope and fixtures are therefore prerequisites,
not later polish.

Observed on 2026-10-05 for Packet A admission controls:

```text
npm test -- assessment-admission.test.ts ip-privacy.test.ts live-assessment.test.ts assessment-repository.test.ts
# Test Files  4 passed (4); Tests  16 passed (16)
npm test
# Test Files  13 passed (13); Tests  72 passed (72)
npm run lint
# 0 errors; 8 existing react-refresh/generated-types warnings
npm run types && npx tsc --noEmit
# passed; Worker type declarations regenerated
npm run build && git diff --check
# production build and whitespace check passed
```

The proof is deterministic and local. It exercises the server-side gate with a
fake D1 and injected network function, showing invalid/private, duplicate,
global-concurrency and rate-limit cases return before any assessment-run write
or website/AI fetch. It does not apply the additive migration, contact
Turnstile/OpenAI/a website, or prove a deployed Worker because this Issue
explicitly prohibits those operations.

Observed on 2026-10-05 for the live-assessment implementation:

```text
npm test       # 11 files passed; 60 tests passed
npm run lint   # 0 errors; 8 existing warnings
npm run build  # passed; generated Cloudflare Worker package
```

The build now reads the public Turnstile site key from the ignored root `.env`.
The OpenAI key and Turnstile secret remain server-only values and were only
presence-checked. This proves code packaging, not deployment, a real API call,
or a public-domain request.

## Interfaces and Dependencies

Planned server-only interfaces are a domain-admission result, `SafeWebsiteFetcher`,
bounded evidence extractor, assessment repository and typed teaser view model.
They consume the existing #5 `AiSearchProvider`/`AiSearchEvidence` contract;
they do not copy provider request logic.

The work depends on closed #5 and #9, approved #35 architecture, an approved
D1 binding/migration packet and owner safety choices. It does not depend on
email, PDF, Stripe, R2, Workflows, Discord or production deployment.
