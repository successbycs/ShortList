# Build a configurable, ICP-led GEO assessment package

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList must assess how AI systems understand and recommend a submitted
small-business website, not operate as a generic business-search front end.
After this work, one assessment will use bounded public website evidence to
create a reviewable business profile, three labelled Ideal Customer Profile
(ICP) hypotheses, three buyer questions per ICP, and two dated LLM evaluations
of the same nine questions. A shared, validated report object will supply both
the responsive website result and a later PDF renderer.

The prompt method must be configurable and reviewable. Prompt templates,
versions, approved status, runtime field definitions, rendered prompt records,
and actual web-enabled question strings will be stored in D1. An operator can
review or update an approved template through a deliberate future management
surface without editing application source. No browser receives a provider key,
prompt-management authority, or another customer's assessment data.

## Progress

- [x] (2026-10-06 05:00Z) Chris clarified the intended core product: website
      evidence → three ICPs → three buyer questions per ICP → equivalent current-
      web and no-web LLM tests → GEO findings/actions → website/PDF report.
- [x] (2026-10-06 05:05Z) Astra reviewed the current implementation and found
      it is a generic comparable-business search, not the intended GEO product.
- [x] (2026-10-06 05:10Z) Created GitHub #55 as the product task and expanded
      its acceptance criteria to require a reusable field-driven prompt package.
- [x] (2026-10-06 05:15Z) Chris required that prompts and web-search questions
      be stored in the database for review and updates.
- [x] (2026-10-06 05:35Z) Chris approved this ExecPlan for execution.
- [x] (2026-10-06 05:45Z) Started Milestone 1 without production effects:
      added `docs/product/GEO_PROMPT_CONTRACT.md`; reconciled the central
      requirements, data contracts, SDD, request-flow explanation and runtime-
      configuration document away from the generic comparable-business prototype.
- [x] (2026-10-06 05:50Z) Ran `git diff --check`; it passed. Confirmed the
      retired generic comparable-business phrases are absent from the core GEO
      requirement, contract, SDD and request-flow documents.
- [x] (2026-10-06 06:00Z) Chris approved the ExecPlan and clarified the ICP
      rule: derive every ICP from the submitted website's own copy and structured
      evidence—who that copy appears designed to persuade—not from a fixed
      vertical or generic persona list.
- [x] (2026-10-06 06:05Z) Chris required prompts to be exposed as readable
      documents as well as retained in D1. Added the draft four-stage package at
      `docs/product/prompts/GEO_ASSESSMENT_V1.md`; D1 will hold the approved,
      immutable counterpart and execution audit record.
- [x] (2026-10-06 06:15Z) Added the additive local D1 GEO-assessment
      foundation migration `0006_geo_assessment_foundation.sql`. Applied all six
      migrations to a fresh disposable local D1 database: all succeeded. Confirmed
      that an edit to a template in an approved package fails with the expected
      SQLite immutability trigger. No remote database was accessed.
- [x] (2026-10-06 06:25Z) Added and tested the server-only prompt package
      repository. It requires an explicit approved package/version, rejects a
      partial package, and records parameter-bound prompt executions. Focused
      Vitest: 3/3 passed; `npx tsc --noEmit` and quiet ESLint passed.
- [x] (2026-10-06 06:45Z) Chris removed the Auckland product constraint.
      Canonical product documents and the prompt package now define a global
      assessment; unknown geography is honest uncertainty. The privacy-minimised
      admission key now uses a UTC calendar day in local source, with reviewed
      additive migration `0007_use_utc_rate_limit_day.sql` for the existing D1
      schema. Focused tests: 28/28 passed; TypeScript and quiet ESLint passed.
- [x] (2026-10-06 06:55Z) Added the typed, fake-provider-tested GEO runner and
      a server-only OpenAI Responses adapter. The runner executes profile → ICP →
      question stages, stops on honest insufficient evidence, then sends the exact
      same nine questions to current-web and model-knowledge modes. The adapter
      requests strict JSON Schema output and enables a web tool only for the
      current-web mode. No provider call was made.
- [x] (2026-10-06 07:00Z) Removed the remaining Auckland default from the
      customer-facing header/footer, metadata, current-web request builder, and
      current result timestamp. The live path now sends no default location to the
      web-search tool and labels observation times in UTC. Focused Vitest: 27/27
      passed; TypeScript, quiet ESLint, and `git diff --check` passed. The legacy
      D1 `displayed_timezone` field remains unchanged because it is not used for
      scope or rendered output; changing its historical constraint would require a
      separately reviewed, data-preserving database migration.
- [x] (2026-10-06 08:10Z) Added the server-only GEO execution bridge. It loads
      the explicit approved package/model/market configuration, captures the
      configuration snapshot, writes each executed prompt and persists the profile,
      ICPs, buyer questions, evaluations and findings. The live source path now
      selects this bridge instead of constructing the retired comparable-business
      requests. The public component can render the persisted GEO result while
      retaining the former view only for historic cached prototype records.
- [x] (2026-10-06 08:15Z) Hardened the current-web citation boundary: the GEO
      adapter extracts citations only from provider `web_search_call` metadata and
      the runner discards URLs authored in model JSON. Focused provider, runner and
      persistence tests: 8/8 passed; TypeScript, quiet ESLint and whitespace checks
      passed. No provider call, D1 migration, deployment or live website fetch was
      performed.
- [ ] Prove the complete persisted GEO graph against a fresh local D1
      migration set, then validate the rendered GEO result with a fake provider.
      Remote migration, provider calls, email and deployment remain out of scope.
- [x] (2026-10-06 08:20Z) Applied the corrected complete sequence of
      migrations `0001` through `0008` to a newly created disposable local D1
      store. The approved `geo-assessment-v1` version `1.0.0` was present after
      the run. An intentional update of its approved profile template failed with
      the expected immutability trigger. An earlier local-only run used two stale
      filenames and was discarded rather than counted as evidence; no remote D1
      database was accessed.
- [x] (2026-10-06 08:25Z) Added a public-journey regression fixture for a
      persisted GEO graph. It proves that the revealed result renders the business
      profile, ICPs and both nine-question modes rather than the retired generic
      comparable-business list. Focused UI suite: 9/9 passed. The complete local
  suite remains 98/98 passing with a successful production build.
- [x] (2026-10-06 08:30Z) Added persistence/replay regression coverage for a
  completed GEO run. It proves that a complete graph writes three ICPs, nine
  buyer questions, two model evaluations and eighteen findings, and that a
  cached replay is accepted only when both modes retain all nine findings.
  Focused graph/replay suite: 7/7 passed with TypeScript, quiet ESLint and
  whitespace checks.

## Surprises & Discoveries

- Observation: the current production prompt is a generic comparable-business
  finder.
  Evidence: `apps/web/src/server/live-assessment.ts` constructs prompts asking
  for up to three similar businesses. It no longer supplies a default city.

- Observation: the current data model cannot represent the intended GEO
  assessment graph.
  Evidence: D1 currently has `customers`, `assessment_runs`,
  `website_evidence`, and `ai_evidence`; `ai_evidence` stores one question and
  an `observed_results` list per mode, but no profile, ICP, buyer question,
  prompt-template version, per-question finding, or report-view record.

- Observation: a strict 3 ICP × 3 question × 2 mode design implies eighteen
  answers, which is incompatible with the current two-call/under-30-second
  prototype if executed as separate provider calls.
  Evidence: Astra review dated 2026-10-06. The plan batches the nine questions
  per mode, making four staged calls rather than eighteen, subject to a real
  cost/latency proof.

- Observation: the safe fetch policy permits up to three pages and 5 MiB of
  decoded HTML per page, while the current workflow fetches only the homepage
  and preserves title/meta/visible text only.
  Evidence: `docs/product/SAFE_FETCH_POLICY.md` and
  `apps/web/src/server/website-assessment.ts`.

## Decision Log

- Decision: The customer outcome is a GEO assessment, not a generic list of
  comparable businesses or a claimed search ranking.
  Rationale: Chris clarified that the product must assess how AI finds,
  understands, describes and recommends the submitted business for likely
  buyers.
  Date/Author: 2026-10-06 / Chris

- Decision: A normal assessment produces three labelled ICP hypotheses and
  three buyer questions per ICP.
  Rationale: Nine consistent buyer questions create a useful and comparable
  evaluation set across LLM modes.
  Date/Author: 2026-10-06 / Chris

- Decision: An ICP is inferred from the audience the captured website copy
  appears written to attract. Every ICP must preserve supporting evidence IDs,
  confidence and uncertainty; insufficient evidence is preferable to an
  invented persona.
  Rationale: ShortList must reveal how the submitted business presents itself,
  not apply a generic industry template.
  Date/Author: 2026-10-06 / Chris

- Decision: Prompt templates, prompt versions, rendered prompt inputs, and
  web-enabled question strings must be D1 records available for review and
  controlled updates.
  Rationale: The assessment method is a core product asset and cannot remain
  hidden in hard-coded TypeScript strings.
  Date/Author: 2026-10-06 / Chris

- Decision: Website text and structured data are untrusted evidence, never
  instructions.
  Rationale: A submitted webpage must not be able to alter the prompt method
  or obtain privileged behavior.
  Date/Author: 2026-10-06 / Chris and existing safe-fetch policy

- Decision: ShortList is global. It has no default Auckland, New Zealand, city
  or vertical product constraint; geographic context comes only from an
  approved global market profile and/or evidence-supported service area.
  Rationale: Chris removed the Auckland aspect from the product.
  Date/Author: 2026-10-06 / Chris

## Outcomes & Retrospective

The GEO prompt package, migrations, repository, runner, execution bridge,
rendering path, and focused local regression coverage were implemented as
recorded in Progress. This is not a completed production capability: remote
migration, provider calls, email/PDF delivery, and deployment remain outside
this plan's observed evidence. A later worktree review also identified
admission-lease, cumulative-budget, audit-validation, and finding-provenance
gaps that must be repaired and verified before the GEO runtime is promoted.

The remaining product decisions and real-boundary proof are recorded below. No
implementation, migration,
provider call, PDF, email, or deployment is performed by this planning change.

## Context and Orientation

`apps/web/` is the deployed TanStack Start / Cloudflare Workers application.
The existing server entrypoint is `apps/web/src/server/live-assessment.ts`.
It safely fetches public website evidence, creates a bounded excerpt, then
calls OpenAI GPT-6 Luna in two modes: `web_grounded` and `model_knowledge`.
The legacy path still asks for similar businesses. That behaviour must be
retired from customer-facing GEO reports.

The current safe website policy in `docs/product/SAFE_FETCH_POLICY.md` permits
only public HTML/text, up to 5 MiB decoded HTML per page, at most three
same-origin pages, validated redirects, and no forwarded visitor credentials.
The current Worker/D1 data is real production data, so schema changes require
an explicit, reviewed migration and deployment approval.

An **observed fact** is a value directly supported by captured website evidence
and source IDs. An **inference** is a cautious conclusion that names the
supporting evidence. An **ICP hypothesis** is an inference about a plausible
buyer segment, their situation, needs and decision criteria; it is not claimed
as an observed customer fact. A **buyer question** is a realistic question a
member of that ICP may ask an AI assistant when seeking a provider. A **GEO
finding** is the dated, mode-specific evaluation of whether the submitted
business was mentioned, accurately described and appropriately recommended.

GitHub #55 is the controlling product task for this work. It precedes the
customer-value claims in #10 and the email/PDF delivery work in #11/#27.

## Plan of Work

### Milestone 1 — Reconcile the product contract

Update `docs/product/REQUIREMENTS.md`, `docs/product/CONTRACTS.md`,
`docs/product/SDD.md`, `docs/product/REQUEST_FLOW.md`, related UI copy, and
GitHub #55 so the canonical outcome is the ICP-led GEO assessment. Retire the
generic "top three similar businesses" result as a customer-facing feature.
Keep any historical prototype runs marked `search-prototype-v1`; do not relabel
them as GEO reports.

Observable result: a reader can identify the profile, ICP, questions, modes,
findings, and report as the required product sequence without interpreting
source code.

### Milestone 2 — Define the D1 prompt registry and assessment graph

Add versioned D1 contracts and migrations for:

```text
geo_prompt_packages
geo_prompt_package_versions
geo_prompt_stage_templates
model_test_profiles
market_profiles
assessment_configuration_snapshots
prompt_execution_records
website_sources
extracted_website_facts
business_profiles
icp_hypotheses
buyer_questions
model_evaluations
model_question_findings
report_renderings
```

`geo_prompt_package_versions` stores an immutable package version. Its
`geo_prompt_stage_templates` store the stable template body, JSON-schema
version, permitted named fields, checksum, lifecycle state (`draft`,
`approved`, `retired`), reviewer and approval timestamp. Application runtime
selects only an approved package version by an explicit configuration
reference. No customer request can select a draft or arbitrary template.

`prompt_execution_records` stores the template/version/checksum, selected
model/mode, safe typed input snapshot, rendered customer question, execution
time, usage and outcome. It excludes API keys, raw visitor headers, raw IP,
and unbounded raw provider payloads. For a web-enabled provider that internally
chooses search terms, record only provider-returned query/action metadata when
available; do not invent a search string that the provider did not expose.

Observable result: an operator can reconstruct what was sent, why, and under
which reviewed template version for a specific assessment.

### Milestone 3 — Upgrade deterministic website extraction

Extend the existing safe fetch boundary without weakening its controls. For
each accepted HTML page, store a bounded source record containing URL,
observation time, content type, title, meta description, visible text, parsed
JSON-LD blocks, extraction version and source ID. JSON-LD is evidence subject
to validation, not automatic truth.

Define a deterministic page-selection policy before implementation. The
recommended MVP rule is homepage plus up to two linked same-origin pages chosen
from a fixed preference order (`/about`, `/services`, `/contact`) only if they
pass the same safe-fetch checks. The owner may instead approve homepage only.

Observable result: Green Gecko-style fixture pages have traceable source IDs
for each fact and structured JSON-LD where present.

### Milestone 4 — Implement the four-stage prompt package

Define strict JSON schemas and server-only template renderers for:

1. evidence package → business profile;
2. profile/evidence → exactly three ICP hypotheses inferred from whom the
   captured website copy appears written to persuade;
3. ICPs → three buyer questions each, unless the approved contract says that
   an evidence-insufficiency outcome supersedes a forced hypothesis;
4. the same nine questions → two batch evaluations, one `current_web` and one
   `model_knowledge`.

Stable template instructions must be stored as approved D1 prompt versions and
loaded only by the server. All website content, optional operator context, and
prior-stage outputs enter as delimited typed data fields. Each schema requires
evidence IDs, provenance labels, limitations and explicit uncertainty rather
than invented information.

The batch evaluation returns per-question findings: submitted-business mention
status, description accuracy, recommendation fit, answer summary, available
sources, model inference, website-content gaps and limitations. Alternatives
may appear as supporting context only, never the report headline.

Observable result: tests show that Green Gecko-style evidence yields three ICP
hypotheses, nine consistent questions and two distinct, comparable evaluation
sets.

### Milestone 5 — Assemble one report view model and renderers

Create one validated GEO report view model from the stored assessment graph.
The responsive website result and PDF renderer consume that model without
re-running the assessment or separately composing claims. The website displays
the business profile, labelled ICP hypotheses, buyer questions, current-web and
no-web comparison, limitations, evidence and prioritised actions. A later
private PDF/delivery packet consumes the same model.

Observable result: fixture report output is consistent between a web-renderer
snapshot and a PDF-ready semantic model.

### Milestone 6 — Verify in layers and at the real boundary

Add unit tests for template lifecycle selection, field validation, prompt
rendering safety, JSON-LD parsing, profile/ICP/question schemas, batch response
normalisation and report assembly. Add fake-D1 repository tests for isolation,
version immutability and reconstruction. Add browser tests for the updated
journey and visual state. Only after Chris explicitly authorises it, run one
real Green Gecko assessment against the public URL, record bounded cost/latency
and D1 evidence, and compare the stored prompt executions with the report.

## Concrete Steps

All implementation happens from `/home/chris/ShortList/apps/web` after plan
approval. Expected commands are:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
npx wrangler d1 execute shortlist-mvp1 --remote --file migrations/<reviewed-migration>.sql
npx wrangler deploy --config wrangler.jsonc --domain shortlist.successbycs.com --keep-vars
```

Expected local result: all targeted and full tests pass; TypeScript/build pass;
lint has zero errors, with any pre-existing warnings recorded rather than
suppressed. The D1 migration and deployment commands are examples only: both
need separate explicit approval after a migration review. A real provider call
and production browser proof also require separate approval because they incur
cost and create customer/assessment records.

## Validation and Acceptance

The completed change is accepted only when all of the following are evidenced
in this plan and GitHub #55:

1. Canonical product documents describe the ICP-led GEO outcome and no longer
   present generic comparable-business lists as the product result.
2. A prompt registry supports draft, approved and retired versions; only an
   approved server-side version can execute.
3. Every assessment stores the template/version/checksum and safe rendered
   inputs/questions needed to reconstruct its method.
4. Public website extraction retains safe, bounded text and JSON-LD source
   records with evidence IDs under the 5 MiB-per-page control.
5. Deterministic fixtures yield three labelled ICP hypotheses and nine buyer
   questions with evidence/uncertainty labels.
6. Both modes receive the same nine questions and save distinct, dated,
   structured findings with correct web/no-web provenance.
7. The report view model can be rendered by both the website and PDF paths
   without a second inference or provider call.
8. A real approved Green Gecko proof observes bounded latency/cost and stores
   an auditable assessment graph. If this authority is not granted, record the
   proof as unobserved rather than passed.

## Idempotence and Recovery

Planning, fixture tests and read-only schema inspection are repeatable. Prompt
templates must be append-only once approved: corrections create a new version
and preserve prior execution provenance. D1 migrations must be additive where
possible and tested locally before remote application. Never mutate or recast
historical generic-search prototype runs as GEO assessments.

If a new prompt version produces malformed output, timeout, excessive cost or
unsafe claim, mark that execution limited/failed, retain only the permitted
safe metadata, and fall back to the latest approved prior version only when
the approved policy explicitly permits it. Do not automatically retry costly
provider calls. Roll back a deployment to the prior Worker version only with
explicit owner authority; data migrations are not treated as automatically
reversible.

## Artifacts and Notes

- `docs/product/REQUIREMENTS.md` — currently retains old generic AI-search
  wording and must be reconciled.
- `docs/product/CONTRACTS.md` — current AI-search record is insufficient for
  the prompt/profile/question/finding graph.
- `docs/product/SDD.md` and `docs/product/REQUEST_FLOW.md` — must depict the
  new assessment sequence and report model.
- `apps/web/src/server/live-assessment.ts` — current hard-coded generic
  comparable-business prompt boundary to replace only after design approval.
- `apps/web/migrations/0001_assessment_core.sql` through
  `0006_geo_assessment_foundation.sql` — current local D1 migration sequence.
  Migration `0006` is locally proven only; it is not yet applied remotely.
- GitHub #55 — review and acceptance record for the new GEO prompt contract.

## Interfaces and Dependencies

The implementation will introduce server-only TypeScript types equivalent to:

```ts
type PromptTemplateVersion = {
  templateId: string;
  version: string;
  stage: "profile" | "icp" | "questions" | "evaluation";
  lifecycle: "draft" | "approved" | "retired";
  allowedFields: readonly string[];
  schemaVersion: string;
  checksum: string;
};

type GeoAssessmentInput = {
  assessmentId: string;
  domain: string;
  geography: string;
  websiteSources: readonly WebsiteSource[];
  optionalBusinessContext?: string;
  approvedIcpConstraints?: readonly string[];
};

type ModelQuestionFinding = {
  questionId: string;
  mode: "current_web" | "model_knowledge";
  mentionStatus: "mentioned" | "absent" | "uncertain" | "contradicted";
  descriptionAccuracy: "accurate" | "partial" | "inaccurate" | "not_applicable";
  recommendationFit:
    "appropriate" | "not_appropriate" | "uncertain" | "not_mentioned";
};
```

The exact names and fields are design candidates, not committed implementation
interfaces. Dependencies are the existing Cloudflare Worker/D1 boundary,
approved OpenAI API key, existing safe-fetch controls, and later PDF/email
work. The plan does not create a prompt-administration UI, PDF renderer, R2
bucket, email provider, admin account, provider call, migration, or deployment.
