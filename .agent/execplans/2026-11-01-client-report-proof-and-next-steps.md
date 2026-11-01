# Make every client report provable and useful for next steps

**Status:** Active (2026-11-01): Issue #97 is planned from the javln.com report; Chris has requested planning only, so no product change is authorised.

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList should give a small-business owner or marketer a report they can
check and act on, not a collection of opaque model labels. The report sent for
`javln.com` did neither: it counted questions that already named JAVLN as
"mentions", showed ShortList's summaries rather than the AI's words, called
missing website information "inaccurate", gave vague "Recommendation unclear"
labels, and ended with reviewer notes rather than prioritised website work.

After this change, a reader can see a concise, exact extract of the current-web
AI answer for each buyer question, the sources cited for that extract, one
plain-language verdict and its reason, and three to five website actions tied
to the questions those actions should help. The headline will measure only the
questions that did not already contain the business name. The browser report,
HTML email, and plain-text email will use one stored report view model, so a
repeat visit and an emailed report say the same thing without another AI call.

### For Chris — decision summary

Recommend a lean, evidence-first implementation:

1. Capture the existing current-web research response already paid for, split
   it deterministically into nine labelled per-question answers, retain each
   bounded raw answer with the provider citations attached to that answer, and
   derive a displayed quote as a contiguous substring. Do not quote
   `answerSummary`: it is a later structured classification, not the original
   answer.
2. Generate actions by deterministic rules from stored findings, buyer
   questions, and captured website-page metadata. This is less eloquent than a
   sixth/seventh model stage but is auditable, costs nothing, and cannot turn a
   plausible model suggestion into a fact. It will say exactly what question
   to answer, on which existing page (or what new page to create), and what
   finding made it a priority. Its effect statement remains conditional.
3. Remove the client-facing "From AI's own memory" section for MVP. Retain
   the no-web finding in D1 as methodology evidence, but do not call a
   structured assessment of supplied material the model's "memory". A later
   separately approved experiment may expose a real no-live-web answer as
   "AI without live web search", with its freshness limitation and no sources.
4. Integrate this report projection with Issue #96 rather than maintaining two
   renderers. #96's `report-email.ts` is present in commit `d02547f` / branch
   `issue/96-email-teaser`, but is not in this worktree or `main`; merge or
   rebase that work first, then make both renderers consume the shared view
   model.

This changes no consent, address, IP-digest, retention, provider-secret, or
deployment policy. A new D1 migration and an approved prompt-package version
are required, so implementation needs Chris's later approval and a separate
authorised remote-migration/deployment step.

## Progress

- [x] (2026-11-01 09:00Z) Read repository/product instructions, the approved
      GEO method, Issue #97 and the report/email implementation on #96's
      unmerged branch; identified the raw-answer retention gap.
- [x] (2026-11-01 09:00Z) Wrote the Issue #97 implementation plan only in
      this file; no application file, migration, prompt, Issue, PR, commit, or
      remote resource changed.
- [ ] (YYYY-MM-DD HH:MMZ) Chris approves the bounded implementation scope and
      the merge/order decision with Issue #96.
- [ ] (YYYY-MM-DD HH:MMZ) Implement and locally prove the evidence capture,
      report projection, on-page report, and email renderers; update this plan
      at each milestone.
- [ ] (YYYY-MM-DD HH:MMZ) Obtain independent review, green required CI, and
      Chris's separate authority for any remote D1 migration and deployment.
- [ ] (YYYY-MM-DD HH:MMZ) With Chris watching, create one new authorised real
      report and inspect the browser/email boundary; record the result here.

## Surprises & Discoveries

- Observation: The requested `apps/web/src/server/report-email.ts` is not in
  this worktree. It exists only in unmerged Issue #96 commit `d02547f`.
  Evidence: `git log --all -- apps/web/src/server/report-email.ts` returns
  `d02547f`; `git ls-tree -r HEAD` has no report-email path.
- Observation: `prompt_execution_records.output_json` does retain each
  validated structured stage output, but it does not retain the current-web
  research response. The temporary research notes are passed to the second,
  structured Claude call and then discarded.
  Evidence: `apps/web/src/server/geo-assessment-execution.ts:69-84` records
  `execution.output`; `apps/web/src/server/geo-claude-messages.ts:82-106`
  creates `notes` then returns only the structured `output`; the finding
  contract has `answerSummary` only at
  `apps/web/src/server/geo-assessment-types.ts:68-78`.
- Observation: Current-web sources are not per-question citations today. One
  source list collected from all web-search tool results is copied to each of
  nine findings.
  Evidence: `apps/web/src/server/geo-claude-messages.ts:178-191` collects all
  sources; `apps/web/src/server/geo-assessment-runner.ts:271-277` applies that
  same list to every finding.
- Observation: The page currently presents only `model_knowledge` findings;
  the email renderer on #96 shows a live summary plus a wrongly labelled
  no-web summary. Neither renderer has an exact answer quote or question-level
  source association.
  Evidence: `apps/web/src/components/assessment/journey-screens.tsx:260-344`;
  `d02547f:apps/web/src/server/report-email.ts:168-275`.
- Observation: There is no complete javln.com report payload in this worktree
  or Issue #97. The Issue preserves only the emailed-report diagnosis and
  examples, so an honest mock must mark exact answers, sources, question text,
  and ranked actions as new-capture data.
  Evidence: `gh issue view 97 -R successbycs/ShortList --comments`; repository
  search finds the issue text and planning references, not its D1 result.

## Decision Log

- Decision: Use the current-web research response as the proof source; capture
  it at the provider boundary and derive a quote without rewording it.
  Rationale: It is the only response that actually used web search and can
  carry provider citations. `answerSummary` is a model-produced classification
  field and cannot honestly be formatted as a quote.
  Date/Author: 2026-11-01 / Codex Terra (recommendation awaiting Chris approval)
- Decision: Require one short labelled answer per buyer-question research
  block and provider citation association, then fail the current-web evaluation
  safely if all nine blocks cannot be parsed and evidenced.
  Rationale: A single aggregate source list cannot prove a particular claim.
  A safe failed/limited result is preferable to inventing the linkage.
  Date/Author: 2026-11-01 / Codex Terra (recommendation awaiting Chris approval)
- Decision: Build the report's actions and plain verdicts deterministically,
  without an extra model call.
  Rationale: Each action remains traceable to a stored question, status, gap,
  and captured page. It avoids marginal report cost and avoids ungrounded
  action-copy. The model already supplies the findings used by the rules.
  Date/Author: 2026-11-01 / Codex Terra (recommendation awaiting Chris approval)
- Decision: Exclude business-name questions from headline metrics and show
  them in a separate "How AI describes you" section.
  Rationale: A business name embedded in a prompt makes a mention unsurprising;
  including it inflates the customer-facing measure.
  Date/Author: 2026-11-01 / Chris, requested in Issue #97
- Decision: Remove the no-web "From AI's own memory" client section in MVP;
  retain the existing no-web stored finding as non-rendered methodology data.
  Rationale: It did not present an unaided answer and its label is misleading.
  This keeps the report focussed on evidence a client can inspect.
  Date/Author: 2026-11-01 / Codex Terra (recommendation awaiting Chris approval)

## Outcomes & Retrospective

Planning outcome: a single implementation path is defined, including why the
existing saved data cannot meet the proof promise and how the new report stays
within MVP scope. Implementation, customer review, independent code review,
CI, remote migration, deployment, and a real new-report proof are pending.

## Context and Orientation

`apps/web` is the ShortList TanStack Start application running as the
`shortlist-web` Cloudflare Worker. A public domain is fetched safely, website
evidence is stored in D1, then the GEO (generative-engine optimisation)
pipeline creates a business profile, three inferred buyer groups (ICPs), three
buyer questions per group, and two evaluations of the same nine questions.
`current_web` may search the live web; `model_knowledge` is the no-live-web
comparison. The product must make dated observations rather than promise an
AI ranking, recommendation, lead, or outcome.

The approved method is `docs/product/GEO_PROMPT_CONTRACT.md` and
`docs/product/prompts/GEO_ASSESSMENT_V1.md`. It requires stored provenance and
practical evidence-linked content actions, but the approved `1.0.0` prompt
package is immutable. A changed evaluation output is therefore a new reviewed
prompt-package/version with a new seed migration, not an edit to migration
`0008`.

Important current paths and facts are:

- `apps/web/src/server/geo-claude-messages.ts` uses two Claude messages for a
  current-web evaluation. The first searches and returns free text; the second
  turns those notes into JSON because Claude cannot combine structured output
  and citations. The adapter currently retains sources only at run level.
- `apps/web/src/server/geo-assessment-runner.ts` validates the nine findings
  and `apps/web/src/server/geo-assessment-execution.ts` persists them. The
  prompt execution record stores the structured output JSON, while
  `model_question_findings` stores `answer_summary`, statuses, JSON sources,
  content gaps, limits and confidence.
- `apps/web/src/server/geo-assessment-repository.ts` reconstructs an
  assessment from D1. `StoredGeoFinding` has no raw answer, proof excerpt,
  page evidence or question-level citation provenance.
- `apps/web/src/components/assessment/journey-screens.tsx` is the current
  on-page report. It renders the no-web finding summaries in three unlabeled
  grid cards, not a reader-verifiable live-web report.
- Issue #96 implements `apps/web/src/server/report-email.ts` on an unmerged
  branch. It counts all nine questions, renders the global source list once,
  exposes the three confusing label sets, and calls a second structured
  summary "From AI's own memory." This plan makes that code a dependent
  integration target, not a source to copy.

The report data boundary after this work is:

```text
Claude current-web research blocks + provider citation annotations
  -> validate 9 labelled answers / per-answer citations
  -> bounded raw answer and exact display excerpt in each stored current-web finding
  -> stored assessment + captured website page metadata
  -> deterministic ClientReportViewModel (metrics, verdicts, actions, sources)
  -> on-page cards, HTML email, plain-text email
```

`raw answer` means the literal answer text returned by the provider for a
question. An `exact display excerpt` is a contiguous slice of that retained
text (target 280 visible characters, cut at a whitespace/sentence boundary;
an ellipsis is UI punctuation outside the quoted span). The implementation
must test that removing the display ellipsis leaves a byte-for-byte substring
of the raw answer. It must never turn `answerSummary` or an action into a
quote.

### Options considered

| Option | Consequence | Recommendation |
| --- | --- | --- |
| Capture and parse the current research response already made for each run | Adds bounded D1 fields and stricter response validation; no new provider call | **Choose.** It gives real answer text and source linkage at no added model-call cost. |
| Quote `answerSummary` / continue copying every source to every question | Cheap but misleading; neither is proof of what AI said or cited | Reject. |
| Make nine separate web-search calls | Easier source isolation but longer, dearer, and more failure-prone | Reject for MVP unless the provider cannot expose response citation annotations. |
| Ask a separate model to write actions | Better prose but another ungrounded model output, cost, and latency | Reject for MVP; revisit after real report feedback. |

## Plan of Work

### Milestone 1 — Freeze the proof contract and capture it at the source

**Goal:** A new completed current-web finding contains an attributable AI answer
and only the sources cited with that answer.

1. Before code changes, revise the human-readable evaluation stage in
   `docs/product/prompts/GEO_ASSESSMENT_V1.md` and prepare a new `1.1.0` D1
   package. The current-web research instruction must require exactly nine
   short blocks, one headed with the immutable buyer-question ID, each with a
   direct answer and citation-bearing text. It must say not to use a business
   name in a question as evidence that the business was found or recommended.
   The structured evaluation contract gains only the fields necessary for an
   honest verdict: `websiteSupport` (`supported`, `not_on_site`, `unclear`) and
   evidence IDs for a `not_on_site` conclusion where available. The existing
   data remains source history; no prior report is altered.
2. Add a new numbered D1 migration after the already-merged migration sequence
   is known. If #96's `0011_report_email_requests.sql` is merged first, this
   change is `0012_...sql`; otherwise resolve the collision before any PR. Add
   nullable, backwards-compatible fields to `model_question_findings`:
   `answer_text` (bounded literal current-web answer) and, if distinct from
   the raw answer is preferred for storage, `answer_excerpt`. Keep
   `sources_json` as a per-finding JSON array, now with only direct provider
   citations. Add no recipient, consent, secret, or raw-IP columns.
3. In `geo-claude-messages.ts`, preserve the research content blocks before
   creating the second structured request. Parse provider text/citation
   annotations into nine `{ questionId, answerText, sources }` proof records;
   validate IDs, exactly one block per question, non-empty answer text, valid
   URLs/titles, bounded size, and no duplicate question. Do not infer a source
   from a search tool result if it was not cited in the text. Pass this as
   explicit provider metadata, separate from the structured JSON.
4. Extend `GeoStageExecution` / `GeoModelProvider` in
   `geo-assessment-runner.ts` so provider-specific proof metadata remains
   associated with the `current_web` execution. Match it by question ID during
   `withProviderSources`; reject a completed current-web result with missing
   proof instead of silently populating a global source list. The no-web mode
   continues to save no citations and gets no client quote.
5. Extend schemas and persistence in `geo-assessment-types.ts`,
   `geo-assessment-execution.ts`, and `geo-assessment-repository.ts`. Save the
   bounded literal answer plus source list with each current-web finding; load
   it into `StoredGeoFinding`. Older rows with null `answer_text` load as
   `proofUnavailable`, not as an invented quote. New reports must show an
   explicit "This older report did not retain the original AI answer" notice
   rather than substitute a summary.

**Observable result:** a fake provider returning two distinct sources for two
questions produces two stored findings whose quotes are literal substrings of
their own answer text and whose source lists do not overlap unless the provider
actually cited the same URL.

**Proof:** focused adapter, runner, execution and repository tests plus a
fresh local migration application.

### Milestone 2 — Create one deterministic client-report projection

**Goal:** The report is a small, testable view model rather than presentation
logic split between React and HTML string concatenation.

1. Add `apps/web/src/server/client-report.ts` (name to be finalised during
   implementation) as a pure server/shared module that accepts a
   `StoredGeoAssessment` plus its stored website-source metadata and returns a
   `ClientReportViewModel`. It must make no fetch, AI request, D1 write, or
   inference beyond documented deterministic rules. Both new and cached runs
   read the same stored records.
2. Classify whether the business is named in a buyer question using a
   case-insensitive, Unicode-normalised exact business name and normalised
   domain label; retain `businessNamedInQuestion` in the view model for tests.
   Do not try to recognise aliases the website did not establish. Headline
   denominators and numerator counts include only current-web findings where
   this value is false. The named findings appear under **How AI describes
   you**, with an explanation that their wording names the business and so is
   excluded from discovery metrics.
3. Map each finding to one client verdict using this precedence and a one-line
   reason assembled only from stored values:

   | Stored evidence | Verdict | Reason pattern |
   | --- | --- | --- |
   | `recommendationFit=appropriate` | Recommended | "The answer named [business] as suitable for this question." |
   | `submittedBusinessMention=mentioned` and not recommended | Mentioned, not recommended | "The answer named [business], but did not recommend it for this question." |
   | `submittedBusinessMention=absent` | Not mentioned | "The answer did not name [business]." |
   | `submittedBusinessMention=contradicted` or `descriptionAccuracy=inaccurate` | Described wrongly | "The answer conflicts with the website evidence captured for this report." |
   | `websiteSupport=not_on_site` | Your site doesn't say | "We could not find this information in the captured pages." |
   | otherwise | Couldn't tell | "The answer or evidence did not support a clear conclusion." |

   A contradictory/incorrect answer wins over a generic missing-information
   label; a clearly `not_on_site` answer wins over an `uncertain`
   recommendation label. The source IDs/evidence required for "Your site
   doesn't say" must be stored and exposed to the action builder. Do not render
   internal enum terms, confidence codes, "Recommendation unclear", or
   "Described you inaccurately".
4. Derive three to five actions by priority score, deduplication key, and a
   fixed template. Candidates come only from unnamed current-web findings with
   `Not mentioned`, `Described wrongly`, or `Your site doesn't say`; sort first
   by the number of buyer questions helped, then missing-site-information,
   then wrong description, then original ICP/question order. Group candidates
   only when they share the same tested claim/gap and proposed destination.
   Use captured `website_sources.page_type`, title, and URL to choose a real
   destination: pricing question -> captured pricing page -> services/product
   page -> home; migration/onboarding/implementation question -> services or
   product page -> home; all others -> relevant services/product page -> home.
   If no suitable captured page exists, say "Create a page that answers
   '[buyer question]'" rather than invent a product fact.

   Every action has: `priority`, `whatToChange` (answer the literal buyer
   question; add only content categories evidenced as missing), `where` (a
   captured page title/URL or a clearly new page), `helpsQuestions` (IDs and
   displayed wording), `evidence` (finding IDs, gaps, source IDs), and this
   fixed effect: "This gives buyers and AI more information to use. It does
   not guarantee a mention or recommendation." Stop at five; if fewer than
   three supported actions exist, show fewer rather than make any up.
5. Build one source index that lists each cited source once and lets a
   per-question card link to its own subset. Website pages used to choose an
   action are labelled "Pages we read", never represented as web-search
   citations. The output's report version changes from `geo-web-v1` to a
   clearly named new report template version.

**Observable result:** a fixed report fixture with three named and six unnamed
questions yields a discovery headline out of six, a separate named-question
section, 3–5 actions, and no unsupported action/source relationship.

**Proof:** pure `client-report.test.ts` cases for name detection, all verdict
precedence paths, URL/page-type destination fallback, ranking/deduplication,
zero/under-three action cases, and deterministic identical output for a saved
report replay.

### Milestone 3 — Render the same readable report on screen and by email

**Goal:** A non-technical reader can scan the result in the intended order and
can inspect every claim in either delivery format.

1. Replace the body of `AssessmentResultScreen` in
   `apps/web/src/components/assessment/journey-screens.tsx` with the shared
   view model in this order: report title and dated scope; **Summary**;
   **What your website says** (short evidence-labelled overview); **Buyer
   groups** with a heading and concise audience description for each;
   per-question cards; **Next steps for your website**; **Sources**; existing
   limitation/footer/start-over content. Do not repeat a three-item "Top
   findings" section.
2. Each question card renders: question; a visually labelled exact quote
   ("AI's answer, checked [date]"); source links for that quote; one verdict
   badge; its one-line reason; and a modest "Why this matters" link to any
   action that helps it. For a legacy row with no proof, show its finding only
   as an older report notice, never a quote or a source claim.
3. After #96 is merged/rebased, replace `renderReportEmail`'s duplicate
   classification/count/action logic with the same view model. Use email-safe
   semantic headings and escaped text/URLs. The text rendering must be a true
   plain-text equivalent: no HTML, every source URL appears after the related
   quote, each action includes what/where/questions/effect, and headings are
   readable in a mail client. It must use the existing #96 consent footer
   unchanged.
4. Drop the email's `memory` map and its "From AI's own memory" paragraph. Do
   not replace it with a less precise synonym. The report can state in its
   footer that ShortList also ran a separate no-live-web methodological check,
   but it must not claim to show that answer.
5. Update fixtures in `prototype-journey.test.tsx` and #96's
   `report-email.test.ts` to contain real-looking, deliberately distinct raw
   answer texts, question-level citations, named/unnamed questions, and
   captured page metadata. Test accessible headings/card order, not Tailwind
   class names.

**Observable result:** a mobile-width browser report and a rendered HTML/text
email have the same six-question discovery count, evidence quote/source pairs,
verdicts, actions, and footer. A reader can tell the three buyer groups apart.

**Proof:** React Testing Library accessibility/content assertions, email
snapshot-style string assertions for escaping and plain text, and a manual
desktop/mobile local review with the synthetic fixture.

### Milestone 4 — Govern the change and prove the operational boundary

**Goal:** The change is reviewable, deployable only with authority, and proven
on a newly captured report rather than retroactively decorating old data.

1. Update `docs/product/GEO_PROMPT_CONTRACT.md` and
   `docs/product/prompts/GEO_ASSESSMENT_V1.md` with the approved proof and
   report-action contract. Update `docs/architecture/DATA_MODEL_CONFORMANCE.md`
   if the implementation adds the report-claim/projection mapping described in
   the data model. Record the final decision, source files, checks, and limits
   in this plan and an Issue #97 handoff comment. Do not claim report proof for
   older D1 rows.
2. Run all web checks and the root verifier. The builder opens a PR for #97
   that states `Closes #97`, lists the #96 dependency/merge order, says
   `Built by: Codex Terra`, includes check evidence and the unobserved
   production boundary. A different model must approve before merge.
3. Only after Chris explicitly authorises the named production target, verify
   the Worker/D1 target, apply the new migration, deploy, and submit one
   authorised fresh test domain. Inspect the received HTML/text email and the
   browser report. Confirm every displayed quote is a substring of the saved
   new `answer_text`, every displayed source is attached to that question, and
   named questions are excluded from the headline. Do not use a cached old
   report as proof.

## Concrete Steps

All implementation commands run from the repository root unless a command
explicitly changes directory. The following are planned commands; record their
actual date and concise output in this section when they are run.

1. Confirm the integration base and migration sequence before editing:

       git status --short --branch
       git log --oneline --decorate -12
       git log --all --oneline -- apps/web/src/server/report-email.ts
       ls apps/web/migrations | sort

   Expected: an otherwise clean `issue/97-report-plan` worktree; #96 is either
   merged into the selected base or named as a dependency; the next migration
   number is unambiguous. Stop and resolve the order if two branches both add
   `0011`.

2. Implement each milestone above and run focused tests while editing:

       cd apps/web
       npm test -- geo-claude-messages.test.ts geo-assessment-runner.test.ts geo-assessment-execution.test.ts geo-assessment-repository.test.ts
       npm test -- client-report.test.ts prototype-journey.test.tsx report-email.test.ts
       node scripts/prove-local-d1-migrations.mjs

   Expected: all named tests pass; the migration script applies the full local
   sequence to a throwaway database and reports its expected tables. If a
   focused command has no matching test yet, add the test before treating the
   milestone as proven.

3. Run the required web quality suite from `apps/web`:

       npm run types
       npm run lint
       npm test
       npm run typecheck
       npm run build

   Expected: exit status 0 with no new warning suppression. `npm run types`
   may change generated Worker types; include only the intentional generated
   diff in the PR.

4. Run repository verification from the root:

       uv run python scripts/verify.py

   Expected: exit status 0, including Markdown links. Record test totals and
   any failure honestly in this plan and Issue #97.

5. Local browser/email rendering proof uses fixtures/fake provider only unless
   Chris has separately authorised a real provider request. Start a fresh local
   D1 instance and Worker as documented in `apps/web/README.md`; inspect a
   fixed completed report at desktop and narrow mobile widths, and save no
   external website content or personal email in the repository.

6. Production commands are deliberately not pre-authorised. After a separate
   explicit Chris approval, use the release workflow's target-verification,
   remote-D1 migration and Worker-deploy commands for `shortlist-web`; then
   record the fresh real-report result and its limits here. A PR merge, CI
   success, or this plan is not that authority.

## Validation and Acceptance

### Behaviour acceptance

- For every new current-web question card, the visible quote (after removing
  UI ellipsis) is a contiguous exact substring of that finding's stored raw
  answer. No summary, verdict, action, or hand-written text appears inside
  quotation marks.
- Each quote has zero or more sources exactly as annotated by the provider for
  that answer. A source found in another question cannot appear on this card;
  current-web cards with missing/invalid proof cause an honest limited result
  or proof-unavailable notice, never a fabricated citation.
- A report fixture with three explicitly business-named questions and six
  unnamed questions uses six as its headline denominator. Named questions are
  visibly grouped under "How AI describes you" and excluded from all discovery
  mention/recommendation counts.
- Every question has exactly one verdict from the documented plain-language
  set and one factual reason. Missing website evidence uses "Your site doesn't
  say" only when the stored evaluation supports that conclusion; it is not
  labelled "Described wrongly." No client sees the phrases "Recommendation
  unclear", "Described you inaccurately", or "From AI's own memory."
- The report contains three to five actions when the evidence supports that
  many, otherwise fewer. Every action names an existing captured destination
  page or says to create a page, names the buyer question(s) it helps, links to
  the contributing findings/page evidence, and uses no guaranteed effect.
- Browser, HTML email and plain-text email contain the same stored data in the
  specified order: summary; buyer groups with headings; question cards; next
  steps; sources; unchanged appropriate footer. All untrusted model/site text,
  source title, URL and domain output remains escaped.
- Cached/new report replay does not call Claude or the web tool, does not
  regenerate actions, and renders the same view model from D1. Older rows are
  openly marked proof-unavailable; they are not silently upgraded.

### Test matrix

| Boundary | Test/proof | Pass condition |
| --- | --- | --- |
| Claude adapter | Fake `research.content` with labelled text/citations, missing label, duplicate label, unrelated search result, malformed citation | Exact per-question proof emitted only for the valid fixture; incomplete proof rejects safely. |
| Runner/execution/D1 | Fake provider plus D1 statement recorder and migration proof | Raw answer/source fields are written/read per finding; no-web source/quote stays absent; old null fields load safely. |
| Report projection | Pure fixture tests | Correct denominator, verdict precedence, deterministic actions/destinations, source grouping, quote-substring invariant. |
| React/email | jsdom and renderer tests | Headings/cards/actions/sources/footers are accessible, escaped, and equivalent in browser/HTML/text. |
| Build/CI | `npm run types`, `lint`, `test`, `typecheck`, `build`; `uv run python scripts/verify.py` | All exit 0; required `web-quality` and `verify` checks later green. |
| Fresh real report (operational boundary) | Authorised deployed Worker + new non-cached domain + received email | Browser/email report proves stored quote/source linkage and truthful count. **Unobserved until Chris authorises deploy, remote migration and test.** |

### Cost, privacy and consent

The recommended path makes **no additional model calls**. It retains a bounded
portion of the current-web research response already obtained in the existing
two-call current-web path, so input/output token use and web-search call count
do not increase by design. The revised research format may add a small number
of output tokens for nine headings; measure real usage in the first authorised
new report before stating a dollar value. It does not alter
`MAX_WEB_SEARCHES`, model selection, `OPENAI_API_KEY`/provider secret handling,
email consent, marketing consent, recipient retention, or the privacy-minimised
IP-day digest. Raw AI answer text and cited public URLs are stored only with
the existing assessment record and follow its current retention/access model;
this is an additional bounded operational/model output, not a new personal-data
category. The plan must not introduce unbounded raw provider payload retention.

## Idempotence and Recovery

Local tests and the throwaway local migration proof are repeatable. The new
migration is additive: `answer_text`/proof fields remain nullable so pre-change
reports still load. No data backfill is planned; it would falsely imply that
an old report's original answer was retained. If an implementation defect is
found before release, revert the application PR; the additive columns may stay
unused. If a deployed renderer has a defect after an authorised release,
re-deploy the prior Worker only with Chris's authority; do not delete or edit
assessment evidence. The release handoff must state that reports made before
the new capture remain proof-unavailable.

If #96 has not merged, do not independently create a second email renderer or
choose a conflicting migration number. Rebase/merge in the agreed order, run
the combined test suite, and make one shared projection the dependency. A
provider response that cannot be parsed into every required answer/citation
pair is a safe assessment/report failure, with the existing generic error
boundary; it must not fall back to the old global-source display.

## Artifacts and Notes

### Evidence consulted while planning

| Evidence | Finding |
| --- | --- |
| Issue #97 | Six client-facing defects, including a javln.com email whose three of nine questions named JAVLN, and Chris's instruction to plan before build. |
| `apps/web/src/server/geo-claude-messages.ts:42-45, 82-106` | Current-web is research-with-search then structured JSON; research text is transient. |
| `apps/web/src/server/geo-assessment-execution.ts:69-84, 168-180` | Only structured stage output and `answerSummary`/global sources are persisted. |
| `apps/web/src/server/geo-assessment-repository.ts:42-66, 347-403, 705-735` | Stored/report finding contains no raw answer or proof relationship. |
| `apps/web/src/server/geo-assessment-runner.ts:160-174, 271-277` | Whole-evaluation sources are copied to every finding. |
| `d02547f:apps/web/src/server/report-email.ts:151-275` | #96's email has inflated headline count, confusing labels, raw-summary display, mislabelled memory section, deduplicated global sources and gaps rather than actions. |
| `apps/web/src/components/assessment/journey-screens.tsx:260-369` | Current on-page report displays only no-web summaries and repeats three as Top findings. |
| `docs/product/GEO_PROMPT_CONTRACT.md:117-171` | Evaluation package/version is controlled; source retention and report actions are contractual evidence responsibilities. |

### Mock: new javln.com report shape

This is a structure/content mock, not a reconstructed assessment. Issue #97
provides only the domain, the fact that 3 of 9 questions name JAVLN, and example
gaps involving migration, pricing, insurer connectivity/Unmand and trust
accounting. It does **not** provide the nine exact questions, actual AI answer
text, provider citation annotations, status values, captured page titles/URLs,
or priority order. Anything marked `[NEW CAPTURE REQUIRED]` must come from the
new evidence capture; nothing below is a claimed javln.com fact.

```text
ShortList report for JAVLN | javln.com | Checked [NEW CAPTURE REQUIRED]

SUMMARY
Of 6 buyer questions that did not name JAVLN, AI mentioned JAVLN in
[NEW CAPTURE REQUIRED] and recommended it in [NEW CAPTURE REQUIRED].
Three questions named JAVLN already. See "How AI describes you" below.

BUYER GROUP: [NEW CAPTURE REQUIRED — label and website evidence]
Question: [NEW CAPTURE REQUIRED — exact buyer question]
AI's answer: "[NEW CAPTURE REQUIRED — contiguous exact excerpt]"
Sources cited with this answer: [NEW CAPTURE REQUIRED — title + URL]
Verdict: Your site doesn't say
Why: We could not find the information in the captured pages.

HOW AI DESCRIBES YOU
Question: Does JAVLN meet [NEW CAPTURE REQUIRED — remainder from stored question]?
AI's answer: "[NEW CAPTURE REQUIRED]"
Sources cited with this answer: [NEW CAPTURE REQUIRED]
Verdict: [NEW CAPTURE REQUIRED]
Why: This question names JAVLN, so it is shown for context and excluded from
the discovery count.

NEXT STEPS FOR YOUR WEBSITE
1. Add a clear answer to the stored buyer question about migration/onboarding
   to [NEW CAPTURE REQUIRED — captured services/product page or new page].
   Helps: [NEW CAPTURE REQUIRED — question IDs/text].
   Expected effect: gives buyers and AI more information to use; it does not
   guarantee a mention or recommendation.
2. Add a clear answer to the stored buyer question about price/cost to
   [NEW CAPTURE REQUIRED — captured pricing/services page or new page].
   Helps: [NEW CAPTURE REQUIRED]. Expected effect: as above.
3–5. Only evidence-backed actions from the new stored findings.

SOURCES
Per-question cited sources, then Pages we read for action placement.

These findings are AI answers from the date checked, not a ranking or guarantee.
[Existing Issue #96 consent/reply footer, unchanged.]
```

No actual commands beyond planning discovery have been run against production,
and no test result is claimed by this plan.

## Interfaces and Dependencies

- **Prompt package:** a new reviewed `geo-assessment-v1` version (likely
  `1.1.0`) in `docs/product/prompts/GEO_ASSESSMENT_V1.md` and a new seed
  migration. The immutable `1.0.0` version remains selectable for historical
  reconstruction; `live-assessment.ts` must select the approved new version
  only after its review/approval is recorded.
- **Provider proof metadata:** extend `GeoStageExecution` in
  `apps/web/src/server/geo-assessment-runner.ts` with a current-web-only
  `findingProofs?: readonly { questionId: string; answerText: string; sources:
  readonly GeoProviderSource[] }[]`. `createClaudeGeoMessagesProvider` is its
  sole producer. The runner validates it against the existing nine question
  IDs before persistence.
- **Finding persistence:** add nullable `answerText` and a proof-availability
  value to `StoredGeoFinding` and `RecordModelQuestionFindingInput` in
  `apps/web/src/server/geo-assessment-repository.ts`; add matching schema
  fields in `geo-assessment-types.ts` and an additive D1 migration. Sources
  remain `{ title, url }[]` and become per-question provider citations.
- **Website-page metadata:** extend the report repository query/input with
  read-only `{ sourceId, sourceUrl, title, pageType }` records from existing
  `website_sources` (including `page_type` introduced by migration `0010`).
  This is evidence for placement only, distinct from external citations.
- **Report projection:** introduce a typed `ClientReportViewModel` and pure
  `buildClientReport(...)` shared by the on-page component and #96's
  `renderReportEmail`. It defines headline metrics, named-question grouping,
  `ClientVerdict`, `ClientAction`, question proof, source index and footer
  inputs. It has no model/provider/D1 side effect.
- **Issue #96 dependency:** `d02547f` changes `report-email.ts`, email
  transport, migration `0011`, the reveal screen and tests. The eventual #97
  PR must state whether it follows a merged #96 or includes an agreed
  conflict-free integration; it must not duplicate mail transport, consent or
  delivery behaviour.
- **Dependencies:** no new npm package is proposed. Use the installed
  Anthropic SDK's typed content/citation objects after checking the locked
  version at implementation time. If its current response type cannot supply
  text-level citations, stop after a small adapter prototype and bring Chris a
  revised evidence/cost option rather than silently treating tool-result URLs
  as citations.
- **Operational dependencies:** local D1 migration proof needs Node/npm and
  Wrangler local support. Remote D1 migration, deployment, real Claude calls,
  SMTP email delivery and a real recipient test remain outside this plan's
  authority and require Chris's explicit approval.
