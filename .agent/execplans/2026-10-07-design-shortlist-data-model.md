# Design the ShortList data model

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList needs one human-readable, product-owned description of the records
that make up an assessment. Today the real shape is distributed across the
MVP requirements, the Software Design Document (SDD), contracts, and D1 SQL
migrations. The existing `docs/architecture/DATA_MODEL.md` is still a generic
template about synthetic `schema_metadata` and `audit_events`; it does not
describe ShortList. That makes it difficult for Chris to review what is stored,
why it is stored, and how a browser request becomes a private assessment
result.

After this work, a reader can open one document and understand the approved
MVP 1 logical data model: customer identity, assessment history, public website
evidence, the GEO assessment graph, versioned prompt/model configuration,
private recipient/delivery data, and operational admission records. The reader
can trace each logical record to local implementation evidence or identify it
honestly as future design work. The document is the design authority; D1
migrations and TypeScript are implementation-conformance evidence only.

This plan is deliberately documentation-and-design only. It does not create,
alter, migrate, seed, query, or deploy a Cloudflare D1 database. It does not
run OpenAI, send email, create a PDF, or expose customer data.

## Progress

- [x] (2026-10-07 00:00Z) Inspected the repository instructions, ExecPlan
      standard, existing data-model placeholder, product SDD/contracts, and D1
      migrations `0001` through `0008`.
- [x] (2026-10-07 00:00Z) Requested and incorporated Astra's independent
      governance review: the design, not SQL, is authoritative; added missing
      logical boundaries for input, session, entitlement, consent, claims and
      report/delivery separation.
- [x] (2026-10-07 00:00Z) Replaced `docs/architecture/DATA_MODEL.md` with the
      reviewed logical model and an explicit implementation-status matrix.
- [x] (2026-10-07 00:00Z) Cross-linked the SDD, contracts, architecture
      decision and GEO prompt contract to the canonical data-model design without
      duplicating field definitions.
- [x] (2026-10-07 00:00Z) Reviewed all current D1 table names and repository
      read/write boundaries against the design. Named every logical table and
      identified `assessment_ip_day_limits_next` as migration-only replacement
      machinery rather than a product record.
- [x] (2026-10-07 00:00Z) Ran `git diff --check` and Prettier across the
      changed documents. Both passed after formatting.

## Surprises & Discoveries

- Observation: A file named `docs/architecture/DATA_MODEL.md` already exists,
  but it is the generic template content rather than a ShortList schema design.
  Evidence: Its opening says the schema has only `schema_metadata` and
  synthetic `audit_events`, whereas `apps/web/migrations/0001_assessment_core.sql`
  creates ShortList customer/assessment/evidence tables and
  `apps/web/migrations/0006_geo_assessment_foundation.sql` creates the GEO
  assessment tables.

- Observation: The SDD intentionally leaves database field names, migrations,
  indexes, retention and deletion mechanics as later design/implementation work.
  Evidence: `docs/product/SDD.md`, section 5, says precisely that; the current
  migrations have subsequently supplied a partial physical implementation.

- Observation: Some approved product contracts are not yet backed by a D1
  table in migrations `0001`–`0008`, including recipient, consent,
  entitlement, attribution, report delivery, retention/deletion, and operator
  alert records.
  Evidence: `docs/product/CONTRACTS.md` sections 2, 4 and 5 specify those
  records; the enumerated `CREATE TABLE` statements in the migrations do not.

- Observation: Current D1 implementation contains both historical generic AI
  evidence and the new GEO graph. The former must be retained for audit but
  must not be mistaken for the current customer outcome.
  Evidence: `docs/product/CONTRACTS.md` describes `ai_evidence` as a legacy
  generic-search prototype, and migration `0006` adds versioned GEO records.

## Decision Log

- Decision: Make `docs/architecture/DATA_MODEL.md` the canonical human-readable
  logical data-model design for ShortList.
  Rationale: It is the intuitive architectural home, already exists, and avoids
  asking reviewers to reconstruct the model from SQL. Migrations must conform
  to it and provide implementation evidence; they cannot silently redefine it.
  Date/Author: 2026-10-07 / Codex, proposed for Chris's review

- Decision: Separate logical records into three clearly labelled states:
  implemented now, designed but not implemented, and historical/legacy.
  Rationale: This prevents the documentation claiming recipient delivery,
  reports, or Cloudflare Workflows are already live simply because they are in
  the product contract.
  Date/Author: 2026-10-07 / Codex, proposed for Chris's review

- Decision: The design will use a relationship diagram and concise entity cards
  rather than repeat every SQL column verbatim.
  Rationale: The design is for human review. Migrations remain the exact source
  for SQL column types, constraints and indexes; a diagram plus essential
  fields makes intent, identity, access boundaries and data flow easier to
  review.
  Date/Author: 2026-10-07 / Codex, proposed for Chris's review

- Decision: Do not resolve unimplemented retention, deletion, recipient,
  consent, attribution, PDF, delivery, or alert schema in this documentation
  pass.
  Rationale: Those need product/privacy decisions and associated issues. The
  data-model document will identify them as explicitly pending rather than
  inventing table shapes.
  Date/Author: 2026-10-07 / Codex, proposed for Chris's review

- Decision: Separate design authority, runtime record authority, and
  implementation conformance evidence.
  Rationale: “Source of truth” had been used ambiguously. `DATA_MODEL.md`
  defines intended entities and rules; a deployed D1 database is authoritative
  only for runtime records that are actually observed; SQL/types demonstrate
  whether local implementation conforms.
  Date/Author: 2026-10-07 / Chris direction, hardened by Astra review

## Outcomes & Retrospective

The hardened candidate design and its cross-links are complete. No runtime,
database, credential, provider, report or deployment action occurred. The next
safe milestone is Chris's review of the candidate design, especially its open
policy register, before it governs future schema changes.

## Context and Orientation

ShortList is a Cloudflare Workers application whose relational system of record
is Cloudflare D1. The product accepts a public business domain, safely captures
bounded website evidence, builds a cautious business profile, derives exactly
three ideal-customer-profile (ICP) hypotheses and three buyer questions per
ICP, evaluates those same nine questions in two AI modes, and renders an
evidence-linked result.

An **assessment** is one dated attempt for a normalised domain. A **customer**
is the durable business identity represented by that normalised domain; it is
never a login, a report link, or an authority check. The **GEO assessment
graph** is the set of source, profile, ICP, question, model-evaluation and
finding records that explains the assessment result. An **approved prompt
package** is a versioned, immutable set of reviewed AI instructions and
schemas. A **configuration snapshot** attaches the exact prompt package, model
profiles, market profile, evidence policy and report-template version to a
single assessment.

The sources to reconcile are:

- `docs/product/REQUIREMENTS.md`: approved behavioural requirements.
- `docs/product/SDD.md`, especially section 5: intended data and access model.
- `docs/product/CONTRACTS.md`: record contracts, data isolation and lifecycle
  rules.
- `docs/product/GEO_PROMPT_CONTRACT.md`: methodology and prompt provenance.
- `docs/product/ARCHITECTURE_DECISION.md`: Cloudflare D1/R2/Workflow choices.
- `apps/web/migrations/0001_assessment_core.sql` through
  `apps/web/migrations/0008_seed_geo_assessment_v1.sql`: local implementation
  evidence and current conformance boundary, not design authority.
- `apps/web/src/server/assessment-repository.ts` and
  `apps/web/src/server/geo-assessment-repository.ts`: application repository
  interfaces that read and write implemented records.
- `docs/architecture/DATA_MODEL.md`: the document to replace; it currently
  contains template content and is not a ShortList design.

The model has four areas:

1. **Assessment core:** `customers`, `assessment_runs`, and
   `website_evidence` establish durable domain identity and a dated attempt.
2. **Assessment control:** admission leases, two concurrency slots, and
   privacy-minimised per-IP UTC-day limits protect bounded processing. These
   are operational records, not customer identity or authorisation data.
3. **GEO methodology and results:** prompt packages, immutable approved
   versions/templates, model and market profiles, per-assessment configuration
   snapshots, website sources/facts, business profile, ICPs, buyer questions,
   evaluations, findings and report renderings.
4. **Future private delivery:** recipient, consent, entitlement, attribution,
   PDF/R2 object, delivery/retry, support and operator-alert records are
   required by product contracts but are not provided by migrations `0001`–
   `0008`.

## Plan of Work

### Milestone 1 — Make the present architecture reviewable

Replace `docs/architecture/DATA_MODEL.md` with a plain-language ShortList
logical data model. Its opening will explain what the document is and is not:
it describes approved data intent; D1 migrations are the physical source of
truth; it does not assert an unconfigured resource is live.

Add a compact Mermaid entity-relationship diagram. It will show durable
relationships and cardinality without exposing every implementation column:

`Customer → Assessment run → website evidence/source → profile → ICP → buyer
question → model evaluation → finding`, plus the configuration snapshot and
report rendering. Admission controls will be shown as a separate protective
boundary. Future recipient/delivery entities will be visually separate and
marked unimplemented.

For every entity, add an entity card containing: business purpose, identity,
essential stored fields, parent/child relationship, access/provenance rule,
implementation status, and the migration or contract reference. Use exact
table names where they exist. Explain important integrity rules such as unique
normalised customer domains, unique assessment configuration snapshot, exactly
three ICP ordinals, three questions per ICP, one evaluation per mode, and
immutable approved prompt versions/templates.

Observable result: a non-engineer can trace one normal domain submission to
its stored result and distinguish public web evidence, model-produced
inference, private future recipient data and operational rate-control data.

### Milestone 2 — Surface the genuine design gaps

Add an implementation-status matrix to `docs/architecture/DATA_MODEL.md` with
these labels: **implemented locally in migrations**, **designed/contracted but
not implemented**, and **legacy retained for audit**. It will explicitly call
out that migrations are local reviewed source until separately authorised and
applied to remote D1.

Record schema decisions still requiring owner approval rather than selecting a
design silently:

- data retention and deletion periods/process;
- recipient, consent, entitlement and duplicate-domain access relationships;
- attribution/visitor record and privacy-minimised identifier policy;
- R2 PDF-object metadata, delivery-attempt/retry state and Workflow linkage;
- operator-alert record and retention;
- submitted-domain request and domain-alias/canonical relationship;
- protected active-journey session and recipient-assessment entitlement;
- versioned consent evidence and email-protection approach;
- report-claim ledger versus report-view-model relationship;
- report artefact/private object reference versus delivery-attempt separation;
- whether exact prompt-output JSON is retained in a customer assessment and
  for how long;
- legacy `ai_evidence` migration/retirement policy;
- a physical migration to replace historic `displayed_timezone` constraints
  with the approved UTC presentation policy, if needed.

Do not create a migration in this milestone. Each unimplemented contract will
link to its owning requirement or planned delivery packet.

Observable result: an owner can approve the existing schema design separately
from future delivery/data-governance choices and can see what is not yet real.

### Milestone 3 — Align architecture documents without duplicate truth

Update `docs/product/SDD.md`, `docs/product/CONTRACTS.md`,
`docs/product/ARCHITECTURE_DECISION.md`,
`docs/product/GEO_PROMPT_CONTRACT.md`, and `docs/architecture/ARCHITECTURE.md`
to point to the canonical data-model design. Clarify that Workflows are future
asynchronous delivery recovery, not assessment orchestration; do not change
the selected platform decisions.

Avoid duplicating entity definitions across these documents. The SDD remains
the architectural decision/intent, contracts remain behavioural and access
rules, the data-model document maps them to relationships/status, and SQL
migrations remain exact physical schema.

Observable result: a reviewer always knows which document answers which
question and does not need to infer whether future delivery tables exist.

### Milestone 4 — Validate the documentation against code, not production

Compare each documented implemented entity to migrations `0001`–`0008`, and
compare the stored GEO entities to the TypeScript repository interfaces.
Correct documentation mismatches. Run the repository's relevant Markdown/link
validation if configured. Use `git diff --check` to catch formatting defects.

No remote D1 query, Cloudflare deployment, migration, OpenAI call, email,
report delivery, or customer-data action is part of validation.

Observable result: the document accurately distinguishes local schema source
from deployed state and makes no unsupported operational claim.

## Concrete Steps

All commands run from `/home/chris/ShortList`.

1. Inspect the schema sources and the current placeholder:

   ```bash
   sed -n '1,260p' docs/architecture/DATA_MODEL.md
   rg -n "CREATE TABLE|CREATE INDEX|CREATE TRIGGER" apps/web/migrations/000*.sql
   sed -n '175,230p' docs/product/SDD.md
   sed -n '1,190p' docs/product/CONTRACTS.md
   ```

   Expected result: the placeholder is shown as generic content; the SQL lists
   the implemented D1 tables; SDD/contracts identify future records.

2. Draft and review the logical design before changing it:

   ```bash
   rg -n "customers|assessment_runs|website_evidence|geo_prompt_packages|recipient|delivery" \
     docs/architecture/DATA_MODEL.md docs/product/{SDD,CONTRACTS,REQUIREMENTS}.md \
     apps/web/migrations/000*.sql
   ```

   Expected result: every entity in the diagram/status matrix has a source
   reference, and future entities are not accidentally presented as tables.

3. After Chris authorises implementation of this ExecPlan, edit only the
   architecture/design documents named in Milestones 1–3. Do not edit a SQL
   migration, runtime source, secret file or Cloudflare configuration.

4. Validate documentation integrity:

   ```bash
   git diff --check
   rg -n "schema_metadata|audit_events" docs/architecture/DATA_MODEL.md
   ```

   Expected result: no whitespace errors; the generic template terminology is
   absent unless explicitly retained under a historical-note heading (which is
   not planned).

5. If a Markdown checker is configured in `package.json` or repository
   scripts, run the smallest relevant command. Record the exact command and
   output in this plan. Do not install a documentation tool solely for this
   work.

## Validation and Acceptance

The design is accepted only when all of the following are true:

- `docs/architecture/DATA_MODEL.md` describes ShortList rather than generic
  template records.
- It contains a readable relationship diagram and a glossary-quality
  explanation of customer, assessment run, GEO assessment graph, configuration
  snapshot and future recipient/delivery boundary.
- Every implemented entity names its matching D1 table and migration. Every
  designed-but-unimplemented entity clearly says it is not yet a D1 table.
- The document represents the approved global/UTC service scope and does not
  claim an Auckland/suburb data model.
- The model records provenance: source/evidence versus inference, exact
  approved prompt/model configuration, mode-specific evaluation, and report
  rendering.
- The model makes the privacy boundary clear: a normalised domain is not an
  authorisation key; rate-limit records hold a privacy-minimised keyed digest;
  recipient/delivery data is separate and not yet implemented.
- It identifies all known missing contracts without inventing a technical
  solution.
- Cross-links in SDD/contracts are correct and no document claims remote D1,
  R2, Workflows, email, PDF delivery or OpenAI is operational merely because
  a local schema/design exists.
- `git diff --check` passes. Any configured Markdown/link validation passes or
  is recorded honestly as unavailable.

No migration, repository type or runtime implementation may be added or changed
until the relevant logical entity, relationship, invariant, lifecycle and
privacy classification are approved in `DATA_MODEL.md`.

This is a documentation-design boundary. No real external boundary is claimed
passed; remote D1 state remains **unobserved** and requires separate explicit
authorisation for any read or change.

## Idempotence and Recovery

Editing Markdown design documents is safe to repeat. Before replacing the
generic `docs/architecture/DATA_MODEL.md`, compare the diff to preserve any
ShortList-specific uncommitted work by another collaborator. If review finds a
relationship inaccurate, correct the design document and record the discovery;
do not modify migrations to force agreement.

If an apparent mismatch exposes a schema bug, stop at the documented gap. A
new data migration requires its own reviewed change, test plan, and explicit
authority to apply it remotely. Never repair a production D1 schema by editing
an already-applied migration.

## Artifacts and Notes

Planning evidence captured on 2026-10-07:

- `docs/architecture/DATA_MODEL.md` was a generic template that described
  `schema_metadata` and synthetic `audit_events`; it has been replaced by the
  candidate ShortList logical design.
- `0001_assessment_core.sql` supplies `customers`, `assessment_runs` and
  `website_evidence`.
- `0004_assessment_admission_limits.sql` supplies leases, concurrency slots
  and per-IP daily rate limits; `0007_use_utc_rate_limit_day.sql` changes the
  day key to UTC.
- `0003_ai_evidence.sql` is the historical generic-search record.
- `0006_geo_assessment_foundation.sql` supplies the reviewed GEO graph and
  immutable prompt-methodology controls. `0008_seed_geo_assessment_v1.sql`
  seeds the approved global/UTC version locally.
- Table-to-design conformance review found all persistent local tables mapped.
  `assessment_ip_day_limits_next` is explicitly documented as one-off
  migration replacement machinery, not a logical product record.
- Validation passed: `git diff --check`; `npx prettier --check` over all seven
  changed Markdown documents.
- No remote D1 inspection occurred while creating this plan.

## Interfaces and Dependencies

No new runtime interface is proposed by this plan. The documentation will
describe these existing interfaces and boundaries:

- D1 schema source: `apps/web/migrations/0001_assessment_core.sql` through
  `apps/web/migrations/0008_seed_geo_assessment_v1.sql`.
- Legacy repository: `apps/web/src/server/assessment-repository.ts`.
- GEO repository: `apps/web/src/server/geo-assessment-repository.ts`.
- GEO types: `apps/web/src/server/geo-assessment-types.ts`.
- Product record contracts: `docs/product/CONTRACTS.md`.
- Architecture and technology decisions: `docs/product/SDD.md` and
  `docs/product/ARCHITECTURE_DECISION.md`.

The execution dependency is Chris's review of the data-model design. Any
future physical schema work depends on approved logical entities, retention
and deletion policy, recipient/delivery design, migration tests, and separate
authorisation to modify remote Cloudflare D1.
