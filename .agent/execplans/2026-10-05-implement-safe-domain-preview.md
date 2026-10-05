# Implement safe domain assessment and immediate preview

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

GitHub Issue #10 makes the first real ShortList assessment journey possible. A
visitor will submit a public domain and receive an honest immediate teaser from
safe website evidence and the two dated AI evidence modes. Invalid input,
private targets, unreadable sites, insufficient evidence and safety-limit
failures will show clear public-safe states rather than causing uncontrolled
fetches or invented claims.

This is not email confirmation, the full result, PDF delivery, payment,
production deployment, or a live OpenAI request. Those are separate Issues and
authorities.

## Progress

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
- [ ] Record the remaining owner safety choices: fetch/redirect/DNS budget,
  abuse limits, suburb-reference source/version and limited-state wording.
- [ ] Implement the admission, evidence, teaser and local tests below.
- [ ] Record verification and leave #10 open for Chris's review.

## Surprises & Discoveries

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

## Decision Log

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

## Context and Orientation

`docs/product/REQUIREMENTS.md` defines the immediate journey as
`MVP1-JNY-001` to `MVP1-JNY-004`; safety and identity are
`MVP1-DOM-001` to `MVP1-DOM-003`, `MVP1-ABUSE-001` and `MVP1-DATA-001`.
`docs/product/CONTRACTS.md` defines Customer, Assessment run, Website evidence,
Auckland context and AI evidence records. The AI configuration is fixed in
`docs/product/AI_SEARCH_RUNTIME_CONFIGURATION.md`.

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

## Validation and Acceptance

| Capability | Required proof | Current status |
| --- | --- | --- |
| Domain admission | Tests cover malformed, private/local, scheme, credential and port outcomes before network access | Passed (offline boundary only) |
| Bounded website evidence | Fixtures cover content type, size ceiling, inert extraction and sparse page text | Passed (extractor only; safe fetch pending) |
| Record isolation | Local D1 tests cover customer uniqueness and no domain-as-authorisation | Planned |
| Honest teaser | UI/route tests cover checking, teaser, insufficient and safe failure states | Planned |
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

## Interfaces and Dependencies

Planned server-only interfaces are a domain-admission result, `SafeWebsiteFetcher`,
bounded evidence extractor, assessment repository and typed teaser view model.
They consume the existing #5 `AiSearchProvider`/`AiSearchEvidence` contract;
they do not copy provider request logic.

The work depends on closed #5 and #9, approved #35 architecture, an approved
D1 binding/migration packet and owner safety choices. It does not depend on
email, PDF, Stripe, R2, Workflows, Discord or production deployment.
