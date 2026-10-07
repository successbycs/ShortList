# Implement MVP 1 production E2E verification

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Implement the approved production-test design so ShortList failures can be
diagnosed safely and its real public domain-assessment journey can be proven by
a repeatable Chromium run. A successful final run will show the public browser
result, a correlated safe Worker event, the matching scoped D1 records, and a
cached replay with no new costly work.

This plan does not add a staging site, second Worker, second database, fake
customer route, Cloudflare Access, CI service, or automated schedule.

## Progress

- [x] (2026-10-06 04:20Z) Derived this implementation plan from the approved
  candidate test design in `2026-10-06-design-mvp1-production-test-strategy.md`.
- [ ] Chris reviews and accepts the test design before code implementation.
- [x] (2026-10-06 04:36Z) Implemented Packet B locally: typed redacted
  diagnostics, opaque support references, phase handoff, and focused tests.
- [ ] Deploy safe diagnostics, then classify one real fault.
- [ ] Repair the named fault and build the lean verifier.
- [ ] Terra performs the authorised public Green Gecko first-run and replay.

## Surprises & Discoveries

- Observation: the first post-Turnstile live request returned
  `assessment_unavailable`.
  Evidence: Chris's public browser screenshot on 2026-10-06.

- Observation: the existing handler has no correlated log event for caught
  assessment errors.
  Evidence: `apps/web/src/functions/submit-domain-assessment.ts`.

- Observation: local diagnostic coverage proves runtime configuration and a
  caught AI-boundary failure without logging the supplied domain or Error text.
  Evidence: `apps/web/src/server/assessment-diagnostics.test.ts`; 82 local
  tests passed on 2026-10-06.

## Decision Log

- Decision: Keep #48 limited to truthful UI mappings; do not turn it into the
  logging, repair, and E2E programme.
  Rationale: each fault and proof boundary needs independently reviewable
  acceptance evidence.
  Date/Author: 2026-10-06 / Chris and Astra recommendation.

- Decision: A live production action is never inferred from a passing local
  test. Deployment and each bounded paid/data-writing test run require Chris's
  explicit confirmation at that point.
  Rationale: live execution can incur provider cost and write production data.
  Date/Author: 2026-10-06 / repository authority rules.

## Outcomes & Retrospective

Packet B is locally complete: an unavailable response now has a generated
opaque support reference and exactly one structured Worker event contains the
reference, timestamp, last safe phase, category, outcome, and elapsed time.
The public service has not been deployed or exercised with this code, so the
live diagnostic, repair, and E2E proof remain pending.

## Context and Orientation

See the preceding design ExecPlan for terminology and constraints. The target
is Cloudflare Worker `shortlist-web`, custom hostname
`shortlist.successbycs.com`, and D1 database `shortlist-mvp1`. The browser
request enters `apps/web/src/functions/submit-domain-assessment.ts`, which
coordinates runtime checks, D1 cache/admission, safe website acquisition and
two stored AI evidence views.

## Plan of Work

### Packet A — Record the approved Turnstile scope change

Verify the widget/browser state and Siteverify server code are absent from the
MVP 1 path. Preserve server-side domain validation, rate/concurrency limits,
safe fetch, and IP-HMAC privacy controls. Update the release documents to make
the deferral explicit. Do not delete the Cloudflare widget or secret.

### Packet B — Add safe correlated diagnostics

Create a small server-only diagnostic helper. At most one event is emitted per
assessment attempt. It includes only opaque support reference, UTC timestamp,
phase, safe category, outcome, and elapsed milliseconds. The caught error is
classified internally but never logged verbatim. Return the existing public
`assessment_unavailable` response plus the opaque reference. Add unit tests
for redaction and one-event behaviour, and integration tests for every phase.

### Packet C — Classify the live fault

After Packet B is deployed with Chris's one-run approval, run a single public
Green Gecko request while short-lived `wrangler tail` is attached. Record only
support reference, phase and safe category. Perform a read-only D1 query scoped
to the normalised domain. Do not call this a successful assessment.

### Packet D — Repair the named fault

Open a focused child Issue only after Packet C identifies the failing boundary.
Implement no speculative changes. Add regression tests around that exact
configuration/logic boundary, complete quality checks, request deploy approval,
then rerun one bounded diagnostic request.

### Packet E — Add lean public-production E2E verification

Add a repository command that drives the real public URL in existing Chromium,
captures a sanitised JSON report and screenshot locally, and performs a
read-only scoped D1 audit. The command must:

1. fill and submit the approved domain;
2. wait for completed, cached, limited, rejected, or unavailable screen;
3. capture the safe public result and optional support reference;
4. query only the matching D1 rows; and
5. fail non-zero unless its expected scenario matches browser, diagnostic event
   and database evidence.

No test-only path, credentials, provider mock, or Cloudflare resource may be
introduced. The final first run remains intentionally operator-approved because
it can use OpenAI and write the real D1 database.

### Packet F — Execute and record the release proof

Terra runs the final command visibly against the public URL. The first request
must produce a truthful stored result; the second must return cached with the
same assessment identifier and no increase in assessment-run or AI-evidence
counts. Record a compact human-readable evidence comment on #10. Leave the
Issue open for Chris's review.

## Concrete Steps

All source checks run from `/home/chris/ShortList/apps/web`:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run types
npm run build
```

After Packet E, the exact checked-in command will be added here. It will run
against `https://shortlist.successbycs.com`; it will not accept an alternate
host by default. Production tail and D1 commands run only after reading their
target and receiving the explicit live-run authority recorded in Packet C/F.

## Validation and Acceptance

Acceptance is sequential:

1. Packet A: source scan and deployed browser show no Turnstile dependency.
2. Packet B: tests prove diagnostic redaction, correlation, phase mapping and
   exactly one event for a caught failure.
3. Packet C: a public failure has a known safe phase/category and a scoped
   D1 observation.
4. Packet D: the same classified defect has a focused regression and passes
   the full quality gate after deployment.
5. Packet E: a local report captures public-browser outcome, support reference,
   and scoped D1 audit without private values.
6. Packet F: first result and cached replay agree across browser, diagnostic
   event and D1. Only then can the applicable #10 release rows be passed.

## Idempotence and Recovery

Local checks and source scans are repeatable. Diagnostic production attempts
are one at a time: stop after an unknown category, fix it, and obtain fresh
approval before repeating. Cache replay deliberately reuses the stored result.
If deployment causes a new public fault, roll back to the immediately prior
known Worker version only with Chris's approval, then record the failed version
and safe diagnostic category in #10.

## Artifacts and Notes

- `artifacts/e2e/` (ignored): sanitised JSON report and screenshots.
- `docs/product/MVP1_RELEASE_TEST_PLAN.md`: test matrix and pass/fail status.
- `docs/product/MVP1_DEFINITION_OF_DONE.md`: release gate.
- `docs/product/REQUEST_FLOW.md`: current request flow.
- GitHub #10: durable parent evidence; child Issues: bounded implementation
  records. #48 remains the truthful-message regression packet.

## Interfaces and Dependencies

New planned interfaces:

- `apps/web/src/server/assessment-diagnostics.ts`: typed redacted diagnostic
  event and emitter.
- `apps/web/src/functions/submit-domain-assessment.ts`: returns an optional
  opaque support reference for `assessment_unavailable`; no raw error leaves
  the server.
- `apps/web/scripts/verify-live-assessment.ts` (or equivalent): invokes the
  existing Chromium session, records only sanitised local evidence, and runs
  scoped read-only D1 assertions.
- `apps/web/package.json`: one explicit `test:e2e:production` command.

Dependencies are the existing `playwright`, `wrangler`, and Cloudflare Worker
tooling. Add no generic testing framework unless its absence prevents the
specified command. Use `workers-best-practices` when implementing logs and
`github-issue-session` for Issue evidence.

Local validation on 2026-10-06 from `apps/web`:

```text
npm test       14 files, 82 tests passed
npm run lint   0 errors; 8 pre-existing warnings
npx tsc --noEmit, npm run types, npm run build   passed
```
