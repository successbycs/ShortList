# Lean MVP 1 reset: make the live assessment work well for a real visitor

**Status:** Active (2026-11-01): scope agreed by Chris; Step 0 next.

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList's website, https://shortlist.successbycs.com, is meant to give a
small-business owner a useful, evidence-based report on how their website
explains them to buyers and AI search. Every stage is deployed, but no
successful live run has ever been recorded, and no one outside the team has
seen a report. Most of the past month went into process: scheduler tooling,
policies, governance documents and multi-Issue diagnosis plans.

Chris's direction (1 Nov 2026): **focus on the critical path of the live
website engine working, from the visitor's point of view.** Anything that
does not help a visitor get a good report, smoothly, is a future requirement.

When this plan is done:

1. a visitor can enter their website and reliably get a report;
2. Chris has judged the report good enough to show a business owner;
3. the wait, the wording and any error make sense on a phone and a laptop;
4. the visitor sees the whole report on the page, with nothing asked of them;
5. a bad day cannot run up an unexpected bill;
6. ten real business owners have used it, and Chris knows what to build next.

The architecture picture
[`docs/architecture/shortlist-mvp1-status.png`](../../docs/architecture/shortlist-mvp1-status.png)
shows what exists today and whether it works. Its source is the HTML file next
to it.

## Rules for this plan (read before every step)

1. **One engine: the live website.** All work goes into the engine behind the
   website ("Engine A" below). The separate Python experiment ("Engine B") is
   backed up and left alone. Its lessons may shape prompts in Engine A; its
   code is not ported.
2. **One plan.** This file is the only active ShortList plan. Do not write new
   ExecPlans, policies or architecture documents for MVP 1. Record decisions in
   the Decision Log here and a one-line Issue comment.
3. **Every step states what will have improved for Chris or the visitor**, in
   plain words, and ends with something Chris can see: a page, a report, a
   number. A step takes a day or less. If it runs over, it stops and comes
   back to Chris; it does not grow.
4. **Proof means a real report in a browser.** Unit tests and local builds are
   needed but prove nothing on their own. No dedicated verifier tool is built.
5. **Keep the safety that exists; add only what real visitors need.** Safe
   website fetch, domain checks, run limits, per-call token limits, and no
   secrets in code or logs all stay. The only new safeguard is the daily
   spending cap (Step 6). There is no spending cap today.
6. **The report lives in the database.** Every part of the report shown on
   the page is read back from the D1 database, both for a new run and for a
   repeat visit. Nothing is shown straight from an AI answer held in memory.
   This is how it works today (`runLiveAssessment` saves the run, then reads
   it back with `findStoredGeoAssessment`), and no step may change that.
7. **Future requirements stay future.** The list at the end of this plan is
   not built, partly built or "prepared for" during this plan.
8. **Spending and deploys need Chris's OK each time**, as the release workflow
   (`docs/workflows/RELEASE_WORKFLOW.md`) already requires.

## Progress

- [x] (2026-10-31 23:30Z) Inventoried the repository, live Worker, database
      migrations and the unpushed proof branch; drew the status picture.
- [x] (2026-11-01) Chris set the scope: the critical path of the live website,
      with email storage, PDF and delivery as future requirements.
- [x] (2026-11-01) Step 0 — Back up the Version 1 experiment and freeze.
      Backup 439 MB with `data/core-proof-runs/`; local stash only; `main` clean;
      no Symphony process running.
- [ ] Step 1 — One live run, with Chris watching. First attempt (2026-11-01
      05:03Z) failed in 0.2 s at `d1_cache`: see Surprises. No AI call, no cost.
- [ ] Step 1c — Switch the report engine to Claude (Issue #80), then repeat
      Step 1 on Claude.
- [ ] Step 1b — Fix only the failure Step 1 found (if any).
- [ ] Step 2 — Chris scores three reports.
- [ ] Step 3 — Fix report quality (only if Step 2 fails its gate).
- [ ] Step 4 — The wait, the wording and the errors make sense.
- [ ] Step 5 — Show the whole report on the page.
- [ ] Step 6 — Daily spending cap.
- [ ] Step 7 — Ten real businesses.
- [ ] Step 8 — Tidy the Issues and requirements (alongside Steps 2–7).

## Surprises & Discoveries

- Observation (corrected 2026-11-01 after Step 1): the live Worker runs the
  full GEO assessment code, but the remote `shortlist-mvp1` database has only
  migrations `0001`–`0004`. `0005`–`0008` (the report tables, the UTC rate
  limit and the approved prompts) were never applied, so every new assessment
  fails at the saved-report lookup. The earlier note here said `0001`–`0008`
  were applied; that was wrong.
  Evidence: support reference `sl-1d087ead-…`, phase `d1_cache`, 235 ms;
  `npx wrangler d1 migrations list shortlist-mvp1 --remote` lists 0005–0008
  as pending; remote `sqlite_master` has no `business_profiles` table.
- Observation: no Issue or plan records a successful live assessment. The last
  recorded production attempt (#50) failed on a code defect that was fixed
  locally afterwards.
- Observation: the email box on the live page keeps the address in the
  browser only. Nothing is stored or sent, and the page says so ("We do not
  send email or create a delivery record at this stage").
- Observation: the waiting screen is a set of fixed labels, not real progress,
  and one label says "Local context checked" although the assessment is
  global. A run makes five OpenAI calls, each allowed up to 45 seconds
  (`REQUEST_TIMEOUT_MS` in `live-assessment.ts`). Profile, ideal customers and
  questions run one after another; the two evaluation calls then run in
  parallel (`Promise.all` in `geo-assessment-runner.ts`). So the worst case is
  four 45-second waits, about three minutes. The report
  uses internal terms such as "UTC observation time" and "What the model
  returned".
- Observation: there is no teaser. A completed assessment goes straight to
  the email box (`use-assessment-journey.ts` moves `completed` and `cached`
  results to the `reveal` screen). Chris decided on 28 Oct (#71) that a
  teaser before the email is the MVP 1 end state (requirement MVP1-JNY-001).
  On 1 Nov he deferred it: the report is shown in full for now (Step 5).
- Observation: there is no spending cap. Each OpenAI call has token limits,
  but the run's cost is stored as empty (`estimatedSpendUsd: null`), and
  nothing limits total runs per day across the site.
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

- Decision: all MVP 1 work goes into the live website engine (Engine A).
  The Python Version 1 experiment (Engine B) is backed up and parked.
  Rationale: Chris, 1 Nov 2026: "focus on the critical path of A function and
  website working from a user experience perspective." Engine A is the one
  visitors use; Engine B runs only on Chris's PC and was tested on one site.
  Date/Author: 2026-11-01, Chris.
- Decision: the PDF report, delivery emails, the masked-email confirmation
  step, retries, the two-hour update email and the Discord alert become future
  requirements. They are not part of this plan.
  Date/Author: 2026-11-01, Chris.
- Decision: storing the visitor's email and consent becomes a future
  requirement. Until then, nothing the visitor types is stored.
  Date/Author: 2026-11-01, Chris.
- Decision: for now, the whole report is shown on the page as soon as it is
  ready, with no email box, button or teaser gate. All report content is held
  in the database, and the page shows what the database holds. The
  teaser-before-email journey (Chris, 28 Oct, #71; MVP1-JNY-001) becomes a
  future requirement, together with email storage.
  Date/Author: 2026-11-01, Chris.
- Decision (already made by Chris, 11 Oct): the report engine being proved is
  "Version 1"; fan-out analysis and deeper technical checks are "Version 2" and
  wait until Version 1 is proven.
- Decision: Issues #48–#54 are closed, replaced by Steps 1 and 1b.
  Rationale: seven Issues to observe one live run is more process than the
  product needs.
  Date/Author: 2026-11-01, Chris ("close them").
- Decision: the report engine moves from OpenAI to the Claude API (official
  `@anthropic-ai/sdk`), paid from the existing Claude API credit. The model is
  set by configuration: the Worker variable `SHORTLIST_MODEL_PROFILE` names an
  approved row in `model_test_profiles`, starting with Claude Haiku 5.5.
  Rationale: use the US$100 Claude credit; a cheap model first, and a switch
  to Sonnet or Opus later is a configuration change. The "AI search check"
  now reflects Claude rather than ChatGPT; the site never named ChatGPT.
  Date/Author: 2026-11-01, Chris (Issue #80).

## Outcomes & Retrospective

Not started. At each gate, record what happened, whether the gate passed, and
whether the "what will have improved" line came true.

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
6. The visitor goes straight to an email box
   (`apps/web/src/components/assessment/journey-screens.tsx`); there is no
   teaser yet. The email is not stored or sent anywhere.
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

The steps run in order, and each has a gate. Step 8 runs alongside Steps 2–7.

### Step 0 — Back up and freeze (30 minutes; Chris confirms before anything is stashed or stopped)

**What will have improved:** your Version 1 experiment is safely backed up on your PC, nothing in it can accidentally become public, and the working copy is clean for the live-site work.

The proof work on Chris's PC, in `/home/chris/ShortList` on branch
`discovery/core-assessment-proof`, is mostly uncommitted and includes a
third-party site crawl under `data/core-proof-runs/`. Nothing from it is
committed, staged or pushed: the repository is public.

1. Show Chris `git status --short` and confirm it is only the proof work, with
   no `.env` or key files. If anything else appears, stop and ask.
2. Copy the whole folder to a private backup outside any repository:

       cd /home/chris
       tar -czf /home/chris/backups/shortlist-version1-proof-2026-11-01.tar.gz \
         --exclude=ShortList/apps/web/node_modules --exclude=ShortList/.venv ShortList

3. Park the uncommitted work in a local stash. A stash never leaves the PC
   unless someone pushes it deliberately:

       cd /home/chris/ShortList
       git stash push --include-untracked -m "Version 1 proof work, parked 2026-11-01 (never push)"
       git switch main && git pull --ff-only

4. List any Symphony processes with `ps -ef | grep -i [s]ymphony`. If one is
   running, show Chris its PID and command line, and stop only that PID
   (`kill <pid>`) after he agrees.

Gate: the backup exists and is larger than 1 MB, `tar -tzf` lists
`ShortList/data/core-proof-runs/`, `git stash list` shows the parked entry,
and `git status` on `main` is clean.

### Step 1 — One live run, with Chris watching (1 hour; Chris approves one run)

**What will have improved:** we know for certain whether a visitor can get a report from the live site today, how long they wait, and what one report costs.

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

**What will have improved:** a visitor who enters their website gets a report instead of an error.

Use the diagnostic phase to find the failing part. Fix only that part, add one
test that reproduces the failure, run the checks below, deploy with Chris's
OK and repeat Step 1. If the cause is not found within a day, stop and report
it to Chris with the evidence.

### Step 2 — Chris scores three reports (1 hour of Chris's time)

**What will have improved:** we know, in your judgement, whether the report is good enough to put in front of a real business owner, and exactly where it falls short.

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

**What will have improved:** reports are specific and correct enough that you would be happy to send one to a client, and a business that checks again gets the improved report, not a stale one.

Change prompts and output rules only, in the `geo-assessment-v1` prompt
package (seeded by `apps/web/migrations/0008_seed_geo_assessment_v1.sql` and
read by `geo-assessment-runner.ts`). Prompts are versioned, so this means a
new version in a new migration, not an edit to `0008`. Apply the Version 1
lessons:

- give each stage only the evidence it needs, labelled by page;
- require a minimum number of items and reject answers that fall short;
- reject evidence IDs that were not in the input.

The new version also has to change which version runs, and what the cache
replays:

- **Which version runs.** The Worker is pinned to prompt package version
  `1.0.0` when it loads its configuration. Make the version label one setting
  (a constant in the same place it is set today). Moving to the new version is
  then a one-line change, reviewed in the PR.
- **What the cache replays.** `runLiveAssessment` in `live-assessment.ts`
  checks the cache (`findStoredGeoAssessment` in
  `geo-assessment-repository.ts`) *before* it loads the configuration. The
  query selects the latest run for the domain, whatever prompt version made
  it, so a domain replays its first report forever. Change the order: load
  the configuration first, then pass the current prompt package version ID
  into the lookup. The lookup joins the run's configuration snapshot
  (`assessment_configuration_snapshots`) and only returns reports made with
  that version. The older comparable-business fallback lookup stays as it is.
- **Tests:** a report made with the current version is replayed with no
  model calls; a report made with an older version is not replayed, and a new
  run starts.

Then re-run the same three domains, re-score, and record both rounds.
If the gate still fails after two rounds, stop. Chris decides whether the
report format, the model or the product question needs to change.

### Step 4 — The wait, the wording and the errors make sense (one day; deploy needs Chris's OK)

**What will have improved:** on a phone and a laptop, a visitor knows what is
happening while they wait and roughly how long it will take. The report reads
in plain English, and if something goes wrong they get a clear, honest message
and know what to do next.

1. Walk the journey on the live site at phone width (390 px) and desktop width
   (1440 px), using a domain already in the cache and one new domain. Take
   screenshots of every screen and note what is confusing, using the wait time
   measured in Step 1.
2. Fix, in `journey-screens.tsx` and the journey hook only:
   - the waiting screen tells the truth: it shows the measured typical wait
     ("usually about N minutes") and moves through its steps in line with that
     time; remove "Local context checked", because the assessment is global;
   - plain wording in place of internal terms: "UTC observation time" becomes
     "Checked on <date>" (the time is still stored in UTC), and "What the model
     returned" gets a plain heading;
   - each failure screen says what happened and what to do, and offers the
     right button (try again, or try another website);
   - nothing overflows or needs sideways scrolling at 390 px.
3. Keep the speed standard. The SuccessByCS lab scripts live in the
   successbycs/marketing-agent repository, not here, and need Playwright, which
   `cs-revenue-accelerator` has installed. After deploying, run on Chris's PC:

       cd /home/chris/projects/cs-revenue-accelerator
       S=/home/chris/projects/marketing-agent/.agents/skills/website-release/scripts
       node $S/perf-check.mjs https://shortlist.successbycs.com/ --runs 3

   It tests a 1440 × 900 desktop and a 390 × 844 slow phone. Pass: every phone
   run shows LCP (when the main content appears) of 2.5 s or less, and every
   run on both profiles shows CLS (how much the layout jumps) of 0.05 or less.
   Record the printed table in Artifacts and Notes. For the screens after
   submitting a domain, which the script does not reach, check by eye on Chris's
   phone and laptop: no sideways scrolling, and nothing jumps as results
   appear.

Gate: Chris walks the journey on his own phone and laptop and is happy with
every screen. Before and after screenshots are recorded in Artifacts and
Notes.

### Step 5 — Show the whole report on the page (half a day; deploy needs Chris's OK)

**What will have improved:** a visitor sees their complete report the moment
it is ready (business overview, three ideal customers, nine buyer questions
and the findings) with nothing to fill in first. Every word of it comes from
the copy saved in the database, so a repeat visit shows exactly the same
report.

Chris, 1 Nov 2026: display everything on the page for now. In
`use-assessment-journey.ts`, a `completed` or `cached` result goes straight to
the `result` screen instead of the `reveal` (email) screen. Remove the email
box screen from `journey-screens.tsx`; the future email work can rebuild it
when it is needed. The report screen itself does not change in this step
(Step 4 handles its wording).

Tests: a completed result and a cached result both open the full report with
no email field on the page; the report shown for a new run equals the report
read back from the database for that run, so a repeat visit is identical.

Gate: Chris runs one new domain and one repeat domain on the live site, on
phone and laptop, and sees the full report straight away both times, with the
same content.

### Step 6 — Daily spending cap (half a day; deploy needs Chris's OK)

**What will have improved:** a busy day, or someone abusing the form, cannot run up an unexpected OpenAI bill. You know the most ShortList can cost in a day, and a visitor who hits a limit is told plainly when to come back.

- **The price assumption.** Take the highest per-run cost measured in Steps
  1–3 and add 50%. Chris approves this figure and a daily budget (suggested:
  US$5). The cap is the budget divided by the per-run figure, rounded down.
  Record all three numbers in the Decision Log.
- **The cap.** Add one new migration with a `site_day_runs` table, one row per
  UTC day. At admission, after the per-visitor check passes, reserve a slot
  with the same atomic `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE count <
  cap` pattern that `assessment_ip_day_limits` uses. The update only happens
  while there is room, so two runs at once cannot both take the last slot. If
  the reservation fails, release the admission leases as the per-visitor check
  already does, and return a new `daily_capacity_reached` outcome.
- **Failed runs still count.** A run that fails after admission keeps its
  slot, because the money may already be spent. This errs on the side of
  spending less. Replays from the cache never reserve a slot.
- Lower `MAX_STARTS_PER_UTC_DAY` from the testing value of 100 to 5 per
  visitor.
- The page says plainly that today's free checks are used up and asks the
  visitor to try tomorrow.

**Tests:** with the cap set to 1, two reservations at once give exactly one
success; the second visitor sees the capacity message; a cached replay works
after the cap is reached; a failed run does not give its slot back.

Gate: the tests pass, and after deploy Chris sees the cap figure in the
Decision Log match the deployed setting.

### Step 7 — Ten real businesses (one to two weeks, led by Chris)

**What will have improved:** ten real business owners have used ShortList, and
you know from them whether the report is useful, what is wrong with it, and
whether anyone would pay for more. That tells you what to build next instead
of guessing.

Chris sends the link personally to ten business owners he knows (first-degree
contacts; no automation, and no LinkedIn tooling). He asks each three questions
afterwards:

1. Was anything in it new or useful to you?
2. Was anything wrong or confusing?
3. Would you pay for a deeper version, and roughly what would it be worth?

Record each answer in one line in Artifacts and Notes (business type, not
name). Watch the daily cost.

Gate (decision for Chris): at least five of ten found it useful, and at least
three would pay for more → choose which future requirements to build first.
Fewer → change the report or the question before building anything else.

### Step 8 — Tidy the Issues and requirements (half a day, alongside Steps 2–7; closing needs Chris's OK)

**What will have improved:** GitHub shows only the work that matters now.
Anyone opening the repo sees one active plan and a clear future list, not 30
open Issues and 78 plans.

On successbycs/ShortList, with Chris's approval:

- Done 2026-11-01: closed #48–#54 with a comment:
  "Replaced by the lean MVP 1 reset plan, Steps 1 and 1b."
- Mark #11 (email capture), #27 (PDF and delivery) and #14 (full end-to-end
  verification) "Future requirement (Chris, 1 Nov 2026)" in a comment, and
  leave them open.
- In `docs/product/REQUIREMENTS.md`, mark the affected requirement rows
  "Future (Chris, 1 Nov 2026)". Do not delete them. This covers the masked-email
  confirmation (MVP1-JNY-005), the teaser before the email (MVP1-JNY-001),
  the PDF and delivery rows, and email/consent storage.
- Leave the marketing Issues (#31–#45) open. Step 7 is their first real input.
- Add one line at the top of `docs/INDEX.md`: "Active plan:
  `.agent/execplans/2026-11-01-lean-mvp1-reset.md`. Symphony, harness and
  governance documents are parked for MVP 1."

No documents are deleted. Parking is enough.

## Future requirements (not in this plan)

Recorded so nothing is lost. Each needs its own decision after Step 7.

- **Store the visitor's email and consent** (Chris, 1 Nov): a required "send
  me this report" tick and an optional "you may contact me" tick. Before
  building it, Chris decides how long emails are kept, the contact for
  deletion requests, and the privacy wording. The design must bind each
  request to a completed run, limit requests per visitor, never return or log
  an email, and keep the list readable only by Chris.
- **PDF report and delivery** (Chris, 1 Nov): the PDF, the delivery email,
  bounded retries, the two-hour update email and the Discord alert (#27).
- **Masked-email confirmation step** (Chris, 1 Nov; MVP1-JNY-005).
- **Teaser before the email** (Chris decided it on 28 Oct, #71, and deferred it
  on 1 Nov; MVP1-JNY-001). It comes back together with email storage.
- **Version 2 report engine**: fan-out analysis and deeper technical checks
  (Chris, 11 Oct).
- **Version 2: crawl hardening** (Chris, 1 Nov; deferred from the lean crawl
  plan, `.agent/execplans/2026-11-01-site-crawl-and-page-store.md`):
  - **Retention of stored website pages:** how long the crawled page text is
    kept (proposal: full text 90 days, then keep only the address, type,
    title and date), with a deletion path. Website text can hold personal or
    copyrighted material; `docs/architecture/DATA_MODEL.md` lists this as
    open. Decide before ShortList is widely public.
  - **Cloudflare plan limits:** confirm whether `shortlist-web` is on the
    Workers Free plan (10 ms CPU, 50 outside requests per visitor request) or
    Paid, and measure the crawl's CPU on the live site. Upgrade or trim the
    crawl if it nears the limit.
  - **Full robots.txt rules:** per-bot groups, wildcards, `$` end markers,
    Allow exceptions and Crawl-delay (RFC 9309). The lean crawl honours
    only `Disallow` prefixes for all bots.
- **Bot protection** (Turnstile), deferred to MVP 3+ (#49).
- **Paid tier**, MVP 2.

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
- before and after screenshots of the journey on phone and laptop, and
  Chris's sign-off (Step 4);
- the full report shown straight away for a new and a repeat domain (Step 5);
- a daily spending cap in place and shown working (Step 6);
- ten business answers and Chris's decision on what comes next (Step 7).

## Idempotence and Recovery

- Steps 1–3 can be repeated. A repeated domain replays from the cache and
  costs nothing. After Step 3's cache change, it is assessed again only when
  the prompt version changes.
- Migrations are additive: a new prompt version, the daily-cap table. Rolling
  back the Worker leaves an unused table, which is harmless.
- Every deploy records the previous Worker version, so `wrangler rollback`
  restores it in one command.
- The Step 0 backup restores Engine B exactly, if it is ever needed.

## Artifacts and Notes

- Status picture: `docs/architecture/shortlist-mvp1-status.png` (source:
  `shortlist-mvp1-status.html` beside it). Redraw it when a step changes a
  box's status.
- Step 1 run record:
  - 2026-11-01 05:03Z, `successbycs.com`: failed at `d1_cache` after 235 ms
    (missing remote migrations 0005–0008). No website fetch, no AI call, no
    cost. Next: apply the migrations (Chris's OK) and switch to Claude (#80).
  - 2026-11-01 06:05Z, local proof on Chris's PC (`wrangler dev --local`,
    fresh local D1 with 0001–0009, Claude Haiku 5.5), `successbycs.com`:
    report completed in 58 s; 3 ICPs, 9 questions, 18 findings saved. Tokens:
    67,249 input, 13,332 output (about US$0.01) plus up to 3 web searches
    (US$0.03): roughly US$0.04 a report. The same domain again replayed in
    under 3 s with no AI call. Earlier local attempts found and fixed five
    real-API problems (#83): list lengths not guaranteed, invented evidence
    IDs, grammar too large, `$defs` not allowed under a root `anyOf`, and the
    4,000-token output limit.
- Step 2 scores: (empty)
- Step 4 screenshots and notes: (empty)
- Step 7 answers: (empty)

## Interfaces and Dependencies

- Cloudflare: Worker `shortlist-web`; D1 database `shortlist-mvp1`; existing
  secrets `OPENAI_API_KEY` and `ASSESSMENT_IP_HASH_SECRET`. `TURNSTILE_SECRET`
  is unused and stays, per #49.
- OpenAI: the model ID set by the live configuration (`gpt-6-luna`). No new
  provider.
- New in this plan: a new prompt version and the cache change (Step 3, if
  needed), journey wording and screens (Steps 4 and 5), and the `site_day_runs`
  daily-cap table (Step 6). Nothing else.
