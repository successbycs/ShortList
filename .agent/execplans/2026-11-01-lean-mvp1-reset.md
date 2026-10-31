# Lean MVP 1 reset: prove one report with ten real businesses

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList is meant to answer one question: **will a small-business owner find
an automated, evidence-based report on their website useful enough to give
their email for it, and later pay for more?** After a month of work, nobody
outside the team has seen a report. The live site has every stage deployed,
but no successful run has ever been recorded. A second report engine sits
unpushed on Chris's PC, and its last two model runs failed the quality check.
Most of the effort went into process: scheduler tooling, policies, governance
documents and multi-Issue diagnosis plans.

This plan resets the work to a minimum viable product (MVP): the smallest thing
that tests the question. When it is done, Chris will have:

1. watched one real assessment complete on https://shortlist.successbycs.com;
2. read and scored reports for three businesses he chose;
3. collected an email and consent from a visitor who wanted the full report;
4. put ten real businesses through it and recorded what they said.

Everything else waits until those ten answers are in.

The architecture picture
[`docs/architecture/shortlist-mvp1-status.png`](../../docs/architecture/shortlist-mvp1-status.png)
shows what exists today and whether it works. Its source is the HTML file next
to it.

## Rules for this plan (read before every step)

1. **One engine.** The live website engine (Cloudflare Worker, "Engine A"
   below) is the product. The Python "Version 1" proof ("Engine B") is backed
   up and parked. Its lessons may change prompts in Engine A; its code is not
   ported.
2. **One plan.** This file is the only active ShortList plan. Do not write new
   ExecPlans, policies or architecture documents for MVP 1. Record decisions in
   the Decision Log here and a one-line Issue comment.
3. **Each step takes a day or less and ends with something Chris can see**: a
   page, a report, a number. A step that runs past its time box stops and is
   brought to Chris; it does not grow.
4. **Proof means a real report in a browser.** Unit tests and local builds are
   needed but prove nothing on their own. A dedicated verifier tool is not built
   for MVP 1.
5. **Keep the safety that exists; add none.** Safe website fetch, domain
   checks, run limits, no secrets in code or logs, and the cost cap all stay.
   No new protection layers before real visitors exist.
6. **Manual before automated.** Chris follows up with people by hand. PDFs,
   delivery emails, retries and alerts wait until ten people have said the
   report is worth having.
7. **Spending and deploys need Chris's OK each time**, as the release workflow
   (`docs/workflows/RELEASE_WORKFLOW.md`) already requires.

## Progress

- [x] (2026-10-31 23:30Z) Inventoried the repository, live Worker, database
      migrations and the unpushed proof branch; drew the status picture.
- [ ] Step 0 — Back up and freeze.
- [ ] Step 1 — One live run, with Chris watching.
- [ ] Step 1b — Fix only the failure Step 1 found (if any).
- [ ] Step 2 — Chris scores three reports.
- [ ] Step 3 — Fix report quality (only if Step 2 fails its gate).
- [ ] Step 4 — Make the email worth something.
- [ ] Step 5 — Cost and limits for real visitors.
- [ ] Step 6 — Ten real businesses.
- [ ] Step 7 — Tidy the Issues (alongside Steps 2–6).

## Surprises & Discoveries

- Observation: the live site already runs the full GEO assessment, not the
  older prototype. Database migrations `0001`–`0008` are applied to the remote
  `shortlist-mvp1` database, and the Worker was last deployed on 11 Oct (plus
  today's sitemap-only deploy).
  Evidence: `npx wrangler d1 migrations list shortlist-mvp1 --remote` shows
  no pending migrations; `npx wrangler deployments list --name shortlist-web`.
- Observation: no Issue or plan records a successful live assessment. The last
  recorded production attempt (#50) failed on a code defect that was fixed
  locally afterwards.
- Observation: the email box on the live page keeps the address in the
  browser only. Nothing is stored or sent, so the page collects no leads today.
- Observation: the saved-report lookup ignores the prompt version, so a
  domain replays its first report for good, even after the prompts change.
  Evidence: `findStoredGeoAssessment` selects the latest run by domain only.
- Observation: the per-person daily limit is still the testing value of 100
  (`apps/web/src/server/assessment-admission.ts`, `MAX_STARTS_PER_UTC_DAY`).
- Observation: the repository is public. The Version 1 proof branch
  (`discovery/core-assessment-proof`) holds a crawled copy of another company's
  website and has never been pushed. It must not be pushed as it stands.
- Observation: of 78 ExecPlans, about 40 concern the scheduler, the
  development harness, WSL and governance rather than the product. `docs/`
  holds 117 Markdown files.

## Decision Log

Decisions marked **Proposed** change the approved MVP 1 requirements
(`docs/product/REQUIREMENTS.md`). They take effect only when Chris approves
them, and the approval is recorded here and on the Issue.

- Decision (Proposed): Engine A, the live Worker, is the only MVP 1 engine.
  Engine B is backed up privately and parked.
  Rationale: Engine A is deployed, takes any domain, and already produces
  profile, ICPs, buyer questions and findings. Engine B covers one test site,
  runs only on a PC, and its two model runs failed quality.
  Date/Author: 2026-11-01, Claude Code (Opus 5.5) for Chris.
- Decision (Proposed): MVP 1 drops the masked-email confirmation step, the
  PDF, email delivery, retries, the two-hour update email and the Discord
  alert. The visitor sees the full report on the page after giving an email,
  and can use the browser's own "Save as PDF".
  Rationale: none of these tests whether the report is valuable. They are
  around a week of work, and #27 alone has five failure paths to prove.
  Date/Author: 2026-11-01, Claude Code (Opus 5.5) for Chris.
- Decision (Proposed): the email and a consent tick are stored in one new
  database table, so Chris can follow up by hand.
  Rationale: an email that goes nowhere tests nothing.
  Date/Author: 2026-11-01, Claude Code (Opus 5.5) for Chris.
- Decision (Proposed): Issues #48–#54 are replaced by Steps 1 and 1b of this
  plan; #11, #14 and #27 are narrowed or parked as Step 7 describes.
  Rationale: seven Issues to observe one live run is more process than the
  product needs.
  Date/Author: 2026-11-01, Claude Code (Opus 5.5) for Chris.
- Decision (already made by Chris, 11 Oct): the report engine being proved is
  "Version 1"; fan-out analysis and deeper technical checks are "Version 2" and
  wait until Version 1 is proven. This plan keeps that rule.

## Outcomes & Retrospective

Not started. At each gate, record what happened and whether the gate passed.

## Context and Orientation

**Which version is this?** Two names are in use, and both are unfinished:

- **The product is MVP 1**: a free, self-service assessment on
  https://shortlist.successbycs.com. MVP stands for minimum viable product. It
  has not launched, and no customer has used it. MVP 2 (a paid assessment) and
  MVP 3+ (bot protection, outreach) come later.
- **The report engine is "Version 1"**, Chris's name (11 Oct) for the core
  report being proved. Version 2 adds fan-out analysis and wider technical
  checks, but only after Version 1 is proven.

**Engine A: the live website.** Code is in `apps/web` (TypeScript,
TanStack Start, deployed as the Cloudflare Worker `shortlist-web`, with a D1
database called `shortlist-mvp1`). A visit runs:

1. The visitor types a domain on the one public page
   (`apps/web/src/routes/index.tsx`).
2. The safety gate (`apps/web/src/server/assessment-admission.ts`) allows one
   run per domain at a time, two runs at once across the site, and a daily
   count per visitor. It stores only a keyed hash of the visitor's IP.
3. The site is fetched safely (`apps/web/src/server/safe-website-fetch.ts`),
   and a short evidence excerpt is kept (`website-evidence.ts`).
4. Five OpenAI calls run in order (`geo-assessment-runner.ts`, model
   `gpt-6-luna`): business profile, then three ideal-customer profiles (ICPs),
   then nine buyer questions, then two evaluations in parallel: one with live
   web search, one from the model's own knowledge.
5. Everything is saved in D1 (`geo-assessment-repository.ts`). A repeat of
   the same domain replays the saved result without new model calls.
6. The visitor sees a teaser and an email box
   (`apps/web/src/components/assessment/journey-screens.tsx`). The email is not
   sent anywhere.
7. The full report is shown on the page.

**Engine B: the "Version 1" proof.** Python scripts in `scripts/` plus
documents in `docs/core-proof/`. They live only on Chris's PC, on the unpushed
branch `discovery/core-assessment-proof`, mostly uncommitted. Engine B
crawled one test website with Apify (47 pages), split the copy into 391
evidence blocks, trimmed them to fit the model, and asked GPT-4o for a full
report in one call. Both runs (about US$0.22 each) came back thin: one item
per section and one invalid evidence ID. The useful lesson is that a single
large prompt gives shallow answers unless each business question gets its own
evidence and a minimum answer count. Engine A already asks staged,
question-by-question prompts.

**Process tooling (parked, not deleted).** Symphony (a GitHub job scheduler
for coding agents), its dashboards and WSL fixes, the Python template harness
in `src/shortlist/`, and most of `docs/harness/`, `docs/ai/` and
`docs/architecture/`. None of it is needed to run or improve the product.

## Plan of Work

The steps run in order, and each has a gate. Step 7 runs alongside Steps 2–6.

### Step 0 — Back up and freeze (30 minutes, no approval needed)

On Chris's PC, in `/home/chris/ShortList`, save the proof work privately and
leave the checkout on `main`:

    cd /home/chris/ShortList
    git stash list   # note anything already stashed
    tar -czf /home/chris/backups/shortlist-version1-proof-2026-11-01.tar.gz \
      --exclude=apps/web/node_modules --exclude=.venv .
    git add -A && git commit -m "Park Version 1 proof work (local only, not for push)"
    git switch main && git pull --ff-only

Do **not** push `discovery/core-assessment-proof`. It contains a third-party
site crawl, and the repository is public. Confirm no Symphony process is
running (`ps -ef | grep -i symphony`); if one is, stop it by PID.

Gate: the backup file exists and is larger than 1 MB, and `git status` on
`main` is clean.

### Step 1 — One live run, with Chris watching (1 hour; Chris approves one run)

Chris picks the domain (suggested: `successbycs.com`, because it is ours). In
one terminal, from `apps/web`:

    npx wrangler tail shortlist-web --format pretty

Chris opens https://shortlist.successbycs.com in a normal browser, submits the
domain and waits. Record in this plan:

- whether the report appeared, and how long it took;
- the diagnostic line from the tail (support reference, phase, outcome); no
  IPs, keys or page text;
- the OpenAI cost of the run, from the OpenAI usage page for that hour.

Then submit the same domain again; it should replay instantly from the saved
result.

Gate: report appears and replay is instant → Step 2. Anything else → Step 1b.

### Step 1b — Fix only what Step 1 found (one day or less; deploy needs Chris's OK)

Use the diagnostic phase to find the failing part. Fix only that part, add one
test that reproduces the failure, run the checks below, deploy with Chris's
OK and repeat Step 1. If the cause is not found within a day, stop and report
it to Chris with the evidence.

### Step 2 — Chris scores three reports (1 hour of Chris's time)

Chris chooses three real business websites of different kinds, for example a
trade, a professional service and a software company. For each, run the
assessment and score the report from 1 (no) to 5 (yes) on:

1. Is it right about what the business does?
2. Are the three ideal customers believable?
3. Would real buyers ask these questions?
4. Are the findings specific, with evidence from the site?
5. Would the owner forward this to a colleague?

Record the scores, one line of comment per report and the cost per run in
Artifacts and Notes.

Gate: all three average 3.5 or more, and none scores 1 on question 1 → Step 4.
Otherwise → Step 3.

### Step 3 — Fix report quality (two rounds at most, a day each; spend and deploy need Chris's OK)

Change prompts and output rules only, in the `geo-assessment-v1` prompt
package (seeded by `apps/web/migrations/0008_seed_geo_assessment_v1.sql` and
read by `geo-assessment-runner.ts`). Prompts are versioned, so this means a
new version in a new migration, not an edit to `0008`. Apply the Version 1
lessons:

- give each stage only the evidence it needs, labelled by page;
- require a minimum number of items and reject answers that fall short;
- reject evidence IDs that were not in the input.

Today the cache lookup (`findStoredGeoAssessment` in
`geo-assessment-repository.ts`) returns the latest report for a domain
whatever prompt version made it. So a domain, once assessed, replays its old
report forever. Change the lookup so it only replays reports made by the
current approved prompt version, and add one test for that. Then re-run the
same three domains, re-score, and record both rounds.
If the gate still fails after two rounds, stop. Chris decides whether the
report format, the model or the product question needs to change.

### Step 4 — Make the email worth something (one day; deploy needs Chris's OK)

- Add one D1 table, `report_requests`: assessment run ID, email,
  `contact_ok` (the visitor ticked "you may contact me about this report"),
  created time (UTC). One new migration.
- The email box saves to it through a server function, then reveals the full
  report. Validation: a basic email format check and the existing rate limit.
  No confirmation step, no emails sent.
- Add a one-sentence privacy note under the box and ask Chris to approve its
  wording: what is kept, why, and that it is deleted on request.
- Add a print stylesheet so the browser's "Save as PDF" gives a clean report.
- Give Chris one command to list recent requests, run on his PC:

      npx wrangler d1 execute shortlist-mvp1 --remote --command \
        "SELECT created_at_utc, email, contact_ok FROM report_requests ORDER BY created_at_utc DESC LIMIT 50"

Gate: Chris submits a test request on the live site and sees it in the list.

### Step 5 — Cost and limits for real visitors (half a day; deploy needs Chris's OK)

- Using the per-run cost from Steps 1–3, set a site-wide daily run cap so the
  worst day costs no more than an amount Chris chooses (suggested: US$5 a
  day). The existing two-at-once limit stays.
- Lower `MAX_STARTS_PER_UTC_DAY` from the testing value of 100 to 5 per
  visitor.
- When the daily cap is reached, the page says so plainly and asks the
  visitor to try tomorrow.

Gate: a test that sets the cap to 1 shows the honest message on the second
run.

### Step 6 — Ten real businesses (one to two weeks, led by Chris)

Chris sends the link personally to ten business owners he knows (first-degree
contacts; no automation, and no LinkedIn tooling). He asks each three questions
afterwards:

1. Was anything in it new or useful to you?
2. Was anything wrong?
3. Would you pay for a deeper version, and roughly what would it be worth?

Record each answer in one line in Artifacts and Notes (business type, not
name). Watch the cost per day.

Gate (decision for Chris): at least five of ten found it useful and at least
three would pay for more → plan MVP 2 (paid tier, real PDF, delivery). Fewer →
change the report or the question before building anything else.

### Step 7 — Tidy the Issues (half a day, alongside Steps 2–6; closing needs Chris's OK)

On successbycs/ShortList, with Chris's approval:

- Close #48–#54 with a comment: "Replaced by the lean MVP 1 reset plan, Steps
  1 and 1b."
- Narrow #11 to Step 4; park #27 (PDF and delivery) and #14 (full end-to-end
  verification) until after Step 6.
- Leave the marketing Issues (#31–#45) open. Step 6 is their first real input.
- Add one line at the top of `docs/INDEX.md`: "Active plan:
  `.agent/execplans/2026-11-01-lean-mvp1-reset.md`. Symphony, harness and
  governance documents are parked for MVP 1."

No documents are deleted. Parking is enough, and deleting would take longer.

## Concrete Steps

Checks to run before every deploy, from `apps/web`:

    npm ci
    npm run lint        # expect 0 errors (6 existing warnings in src/components/ui)
    npm test            # expect all tests to pass (113 on 1 Nov 2026)
    npm run build       # expect .output/ with server and public folders

Deploy, only with Chris's OK for that deploy, from `apps/web` on an up-to-date
`main`:

    npx wrangler d1 migrations apply shortlist-mvp1 --remote   # only when a step adds a migration
    npx wrangler deploy --config wrangler.jsonc --message "<step and commit>"

Then open the live page, and record the Worker version ID and what was seen.
Roll back with `npx wrangler rollback <previous version ID>`; record the
previous ID before each deploy.

## Validation and Acceptance

The plan is complete when all of these are recorded in this file:

- one successful live run, timed and costed (Step 1);
- three scored reports that pass the Step 2 gate, first time or after Step 3;
- a live email request visible in `report_requests` (Step 4);
- a daily cost cap in place and shown working (Step 5);
- ten business answers and Chris's decision on what comes next (Step 6).

## Idempotence and Recovery

- Steps 1–3 can be repeated. A repeated domain replays from the cache and
  costs nothing. After Step 3's cache change, it is assessed again only when
  the prompt version changes.
- Migrations are additive: a new table, a new prompt version. Rolling back the
  Worker leaves an unused table, which is harmless.
- Every deploy records the previous Worker version, so `wrangler rollback`
  restores it in one command.
- The Step 0 backup restores Engine B exactly, if it is ever needed.

## Artifacts and Notes

- Status picture: `docs/architecture/shortlist-mvp1-status.png` (source:
  `shortlist-mvp1-status.html` beside it). Redraw it when a step changes a
  box's status.
- Step 1 run record: (empty)
- Step 2 scores: (empty)
- Step 6 answers: (empty)

## Interfaces and Dependencies

- Cloudflare: Worker `shortlist-web`; D1 database `shortlist-mvp1`; existing
  secrets `OPENAI_API_KEY` and `ASSESSMENT_IP_HASH_SECRET`. `TURNSTILE_SECRET`
  is unused and stays, per #49.
- OpenAI: the model ID set by the live configuration (`gpt-6-luna`). No new
  provider.
- New in this plan: the `report_requests` table (Step 4), a site-wide daily run
  cap (Step 5) and the print stylesheet (Step 4). Nothing else.
