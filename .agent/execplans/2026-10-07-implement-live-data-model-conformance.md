# Implement the approved ShortList data model in safe live-system phases

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList now has a human-readable logical schema design in
`docs/architecture/DATA_MODEL.md`. This plan describes how to make the live
Cloudflare Worker and D1 database conform to that design without treating SQL
as the design authority or bundling unrelated product capabilities into a
single unsafe deployment.

The end state is not merely “a database has tables.” A reviewer will be able to
follow an approved logical entity through its tested local D1 representation,
server repository boundary, customer journey/access rule, and—where separately
authorised—observed production evidence. The public GEO assessment, private
recipient/result access, report delivery, and deletion/recovery capabilities
will be delivered in deliberately separate packets because they have different
privacy, external-service, and rollback risks.

This is a plan only. It does not alter a migration, database, Worker, binding,
credential, provider configuration, email service, R2 object, Workflow, DNS
record, or GitHub Issue. It does not run a real assessment.

## Progress

- [x] (2026-10-07 00:00Z) Inspected the candidate logical design, current
      local migrations `0001`–`0008`, Worker configuration, the public assessment
      entry point, existing GEO and production-E2E ExecPlans, and GitHub #35.
- [x] (2026-10-07 00:00Z) Requested an independent Astra implementation review.
      It confirmed that the candidate design must be approved and partitioned before
      it can govern live schema changes.
- [x] (2026-10-07 00:00Z) Chris approved the logical data-model baseline.
      It now governs future schema work; its named open-policy register remains
      deliberately deferred rather than silently decided in code.
- [x] (2026-10-07 00:00Z) Added the design-to-implementation conformance
      matrix for the public GEO boundary and explicitly separated deferred private
      delivery work.
- [ ] Establish a clean, reviewed implementation baseline without absorbing
      unrelated shared worktree changes.
- [ ] Execute Packet A only after its bounded issue, design decisions, tests,
      and production approvals are in place.
- [ ] Execute later private-result, delivery, and retention packets only after
      their specific dependencies and external-resource approvals are in place.

## Surprises & Discoveries

- Observation: The current candidate data model intentionally includes logical
  entities not represented in migrations `0001`–`0008`, including recipient,
  consent, protected journey, entitlement, report artefact, delivery attempt,
  deletion lifecycle, and operator-support records.
  Evidence: `docs/architecture/DATA_MODEL.md` marks them candidate/deferred;
  the local migration inventory contains no corresponding tables.

- Observation: The existing GEO graph is valuable local implementation evidence
  but is not complete conformance to the whole data model.
  Evidence: `0006_geo_assessment_foundation.sql` provides prompt, source,
  profile, ICP, question, evaluation, finding, and report-rendering tables, but
  not the private-recipient/delivery model.

- Observation: The public assessment remains a bounded Worker request.
  Cloudflare Workflows is a selected future recovery mechanism for delivery
  attempts only, not an assessment orchestrator.
  Evidence: `docs/product/ARCHITECTURE_DECISION.md` and
  `docs/architecture/ARCHITECTURE.md`.

- Observation: The ShortList worktree contains substantial unrelated and
  uncommitted change. It cannot safely be committed or deployed as one unit.
  Evidence: `git status --short` before this plan listed existing modifications,
  deletions, and untracked migrations/source/docs across several work streams.

- Observation: `assessment_runs.displayed_timezone` has a historic
  `Pacific/Auckland` constraint while the approved product presentation policy
  is UTC.
  Evidence: `apps/web/migrations/0001_assessment_core.sql` and
  `docs/product/REQUIREMENTS.md` requirement `MVP1-JNY-004`.

## Decision Log

- Decision: The data-model design is authoritative; migrations and TypeScript
  are conformance artefacts, and remote D1 is a runtime record store only after
  separate observation.
  Rationale: This preserves reviewable product design and prevents existing SQL
  from silently defining future policy.
  Date/Author: 2026-10-07 / Chris direction, hardened by Astra review

- Decision: Implement conformance through small packets rather than a single
  database release.
  Rationale: Public GEO, private recipient access, PDF/delivery, and retention
  have different privacy, cost, resource, and recovery boundaries.
  Date/Author: 2026-10-07 / Astra recommendation, proposed for Chris review

- Decision: Do not extend the open #10 public-GEO task to include recipient,
  PDF, delivery, Workflow, or deletion implementation.
  Rationale: #10 owns public domain-to-GEO assessment. Combining the other
  boundaries would make its acceptance, security review, and rollback unsafe.
  Date/Author: 2026-10-07 / Astra recommendation, proposed for Chris review

## Outcomes & Retrospective

Planning is complete. No implementation or external action has begun. The next
safe outcome is an owner-approved data model with its open decisions resolved
or deliberately deferred, followed by one small, separately reviewed Packet A.

## Context and Orientation

The following documents have distinct authority:

- `docs/product/REQUIREMENTS.md` defines product outcomes.
- `docs/architecture/DATA_MODEL.md` defines logical entities, relationships,
  invariants, privacy classification, lifecycle status, and open decisions.
- `docs/product/CONTRACTS.md` defines behavioural and access rules over those
  entities.
- `docs/product/ARCHITECTURE_DECISION.md` selects Workers + Static Assets, D1,
  later private R2 objects, and later Workflow delivery recovery.
- `docs/product/SDD.md` explains the application architecture.
- `apps/web/migrations/0001_assessment_core.sql` through
  `0008_seed_geo_assessment_v1.sql` and `apps/web/src/server/*repository*.ts`
  are local implementation evidence. They must conform to the design.

The public request currently flows through
`apps/web/src/functions/submit-domain-assessment.ts` and
`apps/web/src/server/live-assessment.ts`: normalise/safely admit a public
domain, reuse a cached completed result when available, capture bounded website
evidence, execute the stored GEO methodology, and render the saved result.
The named D1 binding in `apps/web/wrangler.jsonc` is `SHORTLIST_DB` for
`shortlist-mvp1`. Naming a binding is not proof that its schema is current or
that a Worker deployment is live.

The data model divides the work into four areas:

1. public identity, submitted-domain input, assessment runs, evidence, and GEO
   methodology/results;
2. operational admission/rate controls, separate from customer identity;
3. private recipient consent/entitlement and protected active-journey result
   access; and
4. private PDF artefacts, delivery/retry recovery, alerts, retention and
   deletion.

Only area 1 and part of area 2 have meaningful local implementation evidence.

## Plan of Work

### Phase 0 — Approve the design and create a clean baseline

Before implementing a logical entity, Chris reviews the open-policy register
in `docs/architecture/DATA_MODEL.md`. The required decisions are:

- canonical/alias/redirect relationship for `www`, redirects, and later domain
  changes;
- email protection and lookup approach;
- retention/deletion rules for evidence, provider/prompt output, report,
  recipient, session, delivery and pseudonymous admission records;
- entitlement, duplicate/resend, and active-session expiry policy;
- report claim ledger versus immutable report-view-model relationship;
- R2 object metadata, delivery state machine, retry limits, and Workflow
  linkage;
- attribution/UTM and visitor identifier design;
- bounded prompt/output retention; and
- safe compatibility approach for historic Auckland display metadata.

Record each owner decision in the data model, requirements/contracts where it
changes behaviour, and the appropriate child Issue. Items deliberately not
needed for Packet A stay explicitly deferred.

Then inventory the shared dirty worktree. Identify an exact reviewed set of
files belonging to each packet, preserve unrelated changes, and use a narrow
commit or isolated worktree. Never use `git add .`, reset, or merge unrelated
files merely to obtain a deployable baseline.

Observable result: a reviewer can identify which design decisions govern the
next packet and which source files are actually proposed for it.

### Phase 1 — Build a design-to-implementation conformance matrix

Create `docs/architecture/DATA_MODEL_CONFORMANCE.md`. For every logical entity
in `DATA_MODEL.md`, map:

`logical entity/invariant → migration/table/constraint → repository method →
service boundary → test → status`.

For deferred entities, use `not implemented by design` rather than leaving a
blank. For legacy `ai_evidence`, state that it is audit-only. For temporary
SQLite rebuild/replacement tables, state that they are migration machinery, not
product entities. Record every mismatch as either a proposed design amendment
or an implementation defect; do not change the design to fit code without
review.

Observable result: every later migration has an approved logical design row and
a specific proof obligation.

### Packet A — Reconcile the public assessment/GEO graph

This is the only candidate near-term live packet. It remains within #10/#55
scope and excludes recipient, email, R2, PDF, Workflow and deletion behaviour.

After Phase 0 approval, implement only the approved public-side gaps:

1. Add a submitted-domain request/input representation if approved, preserving
   raw submission, normalised form, validation outcome, request time, and
   explicit canonical/alias decision without silently merging domains.
2. Make the existing customer/run/evidence/GEO graph conform to the approved
   invariants. In particular, test final successful-run completeness: one
   profile, exactly three ICPs, exactly three questions per ICP, two modes, and
   one finding for each mode/question pair.
3. Resolve the UTC compatibility design with a dedicated data-preserving
   migration only if Phase 0 approves it. Rehearse any SQLite table rebuild on a
   production-shaped local fixture; do not rewrite historical data casually.
4. Keep prompt/output retention bounded according to the approved policy.
   Continue excluding API keys, raw IPs, headers, cookies, reusable tokens and
   unbounded provider payloads.
5. Keep `ai_evidence` legacy-only and ensure new GEO renders cannot read it as
   a product result.

Add forward-only, versioned migrations. A migration must be additive unless an
approved compatibility/rebuild plan is necessary. Build repositories with
parameter-bound SQL and an atomic service boundary where partial graph writes
could otherwise leave an assessment in an ambiguous state.

Observable result: a fresh local D1 database and a production-shaped fixture
both reach the reviewed public GEO schema, and tests prove the persisted result
is complete/reconstructable or honestly limited.

### Packet B — Add private recipient and active-journey access

Create a new bounded child Issue only after Phase 0 decides email protection,
entitlement, consent, session expiry and alias policy. It will implement:

- recipient identity/protected storage;
- separate delivery and marketing consent evidence;
- recipient-assessment entitlement/duplicate/resend decisions;
- short-lived server-side protected journey sessions; and
- cross-recipient isolation, expiry and changed-email tests.

It does not select an email provider, send email, create a PDF, create R2, or
start a Workflow.

Observable result: a confirmed active journey can see only its own permitted
result; no domain or report identifier grants access.

### Packet C — Add report provenance and private delivery records

Create a separate Issue after Phase 0 decides report-claim/view-model shape,
object metadata and delivery-state details. It will implement the chosen claim
provenance model, report artefact/private-object reference, recipient-specific
delivery attempt, idempotency and state transitions. It will use fakes/local
boundaries until explicit resource/provider authority is granted.

Observable result: a saved result can be rendered without another AI call, and
one logical delivery attempt is reconstructed safely without a public object or
access key.

### Packet D — Configure and prove external delivery/recovery

Only after Packet C, separate external-resource authority, and provider choices
are approved, configure the private R2 binding, email/Discord adapters and
Cloudflare Workflow recovery. A Workflow begins only after a D1 delivery
attempt exists. It re-reads D1 on each retry and cannot itself authorise or
become a source of customer state.

Observable result: the controlled real boundary proves one private artefact,
one provider hand-off per idempotency key, bounded retries, truthful failures,
and safe alert behaviour. This packet is not part of a public GEO deployment.

### Phase 2 — Local migration, integration and release proof

For each packet, prove in this order:

1. apply the full migration sequence to an empty disposable local D1 database;
2. apply the upgrade migrations to a fixture representing the known prior
   schema/data shape;
3. inspect table/index/trigger/foreign-key and status constraints;
4. run repository/service tests against local D1, including isolation,
   idempotence and partial-failure cases;
5. run browser integration tests for the relevant journey; and
6. run TypeScript, lint, Worker types, production build, Markdown/conformance
   checks and `git diff --check`.

Passing fakes and local D1 are necessary but do not prove production.

### Phase 3 — Remote D1, Worker deployment and real-user proof

Every remote action is a separate stop/go gate:

1. **Read-only preflight:** with permission, inspect the named D1 database's
   migration/schema state, table/index/trigger presence and safe aggregate row
   counts. Do not print secrets or customer records.
2. **Remote migration:** only after explicit approval naming the reviewed
   migration files and database. Apply in order and verify expected schema and
   safe aggregates. A failed migration is handled by a forward corrective
   migration; never by destructive ad-hoc rollback.
3. **Worker deployment:** only after a separate explicit approval. Deploy the
   reviewed build/binding configuration, record its version, and smoke-test
   public non-costly states first.
4. **Real assessment:** only after a separate explicit approval naming the
   domain and accepted spend/data effect. Run one browser-like production flow,
   capture sanitised evidence, verify its scoped D1 graph, then verify a cached
   replay creates no new provider work.
5. **Delivery proof:** only Packet D may request a real email/PDF/Workflow test,
   and it requires its own distinct approval.

Record human-readable evidence and remaining limits on the owning Issue. #35
receives the concise architecture-flow record; #10 receives public GEO proof;
future packets receive their own detailed evidence. Do not automatically close
any Issue.

## Concrete Steps

All local commands run from `/home/chris/ShortList/apps/web` unless stated
otherwise. Exact migration file names are supplied only after each packet is
reviewed.

1. Establish the narrow source baseline from `/home/chris/ShortList`:

   ```bash
   git status --short
   git diff --name-only
   git diff --check
   ```

   Expected result: an explicit inventory of packet-owned versus unrelated
   changes. Do not stage or discard anything as part of inspection.

2. Build and validate the conformance matrix before a new migration:

   ```bash
   rg -n "CREATE TABLE|CREATE INDEX|CREATE TRIGGER" migrations/000*.sql
   rg -n "export async function (create|record|load|find|complete)" src/server/*repository*.ts
   ```

   Expected result: every persistent table/repository boundary has a data-model
   row or an intentional legacy/deferred classification.

3. Run the local quality gate after each packet:

   ```bash
   npm test -- --run
   npx tsc --noEmit
   npm run lint -- --quiet
   npm run types
   npm run build
   git diff --check
   ```

   Expected result: relevant tests pass, TypeScript/build pass, lint has no
   errors, and no whitespace defects are introduced. Pre-existing warnings are
   recorded rather than suppressed.

4. Use a fresh, disposable local D1 directory for migration proof. The exact
   script/command must be checked into the packet before use so its database
   path and migration order are visible. Expected result: all migrations apply
   once, a second application behaves as documented, and schema assertions
   match the conformance matrix.

5. Do not run a remote command from this plan without the distinct authority
   described in Phase 3. The expected safe preflight/query, migration and
   deployment commands will be recorded in the relevant packet ExecPlan before
   they are executed.

## Validation and Acceptance

The overall programme is complete only when every approved entity has evidence
at the appropriate boundary:

| Boundary                  | Proof required                                                                                       | Current state                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Logical design            | Chris approves the open-policy register and candidate model.                                         | Pending.                                                             |
| Local implementation      | Design-to-implementation matrix, local migrations, repository/service tests, quality gate.           | Partial for public GEO; pending for proposed packets.                |
| Public journey            | Browser flow proves a valid result, safe limitation, cached replay and no cross-customer leakage.    | Existing proof is not sufficient for the new full conformance claim. |
| Remote D1                 | Separate read-only preflight and named-migration verification.                                       | Unobserved for this programme.                                       |
| Worker deployment         | Versioned reviewed deployment and public non-costly smoke test.                                      | Unobserved for this programme.                                       |
| Real provider assessment  | One explicitly authorised bounded browser/OpenAI run with a matching stored graph and cached replay. | Unobserved for this programme.                                       |
| Private delivery/recovery | Packet D only: authorised R2/email/Workflow proof.                                                   | Deferred.                                                            |

Specific non-negotiable tests include:

- malformed/private/unsafe domains never create a customer or expensive call;
- a normalised domain is not an access credential;
- valid GEO runs contain exactly three ICPs, nine shared questions, two modes,
  and complete mode/question findings, or a truthful limited outcome;
- current-web citations originate only from provider metadata and model-knowledge
  has none invented;
- approved prompt methodology is immutable and a prior assessment remains
  reconstructable;
- admission records never reveal customer/recipient data or raw IP;
- Packet B proves recipient isolation, email-change, expiry and entitlement
  idempotence before any delivery capability is considered; and
- Packet C/D prove private-object and provider idempotency only after those
  boundaries are implemented and authorised.

## Idempotence and Recovery

Documentation review, source inventory, local tests, and disposable local D1
proofs are repeatable. Prompt-methodology corrections create new immutable
versions; they do not rewrite prior executions. New migrations are forward-only
and additive by default.

For a required SQLite rebuild—such as a historic time-zone constraint—first
rehearse against a production-shaped fixture, preserve data through a
compatibility copy, verify counts/constraints, and obtain specific remote
authority. Do not attempt a destructive rollback. If a Worker deployment fails,
rollback code to the prior known Worker version only with explicit approval;
repair database state through a new forward migration.

If a real assessment reaches an unknown failure, stop after recording sanitised
diagnostic/D1 evidence. Do not repeatedly spend provider budget while guessing.
Open a narrow corrective packet with a regression test before another authorised
production attempt.

## Artifacts and Notes

- Candidate design: `docs/architecture/DATA_MODEL.md`.
- Architecture map: `docs/architecture/ARCHITECTURE.md`.
- Existing local GEO implementation plan:
  `.agent/execplans/2026-10-06-build-configurable-geo-prompt-package.md`.
- Existing production-test plan:
  `.agent/execplans/2026-10-06-implement-mvp1-production-e2e-verification.md`.
- Public GEO parent: GitHub #10. Product methodology task: GitHub #55.
- Architecture-decision record: GitHub #35, closed after the platform decision.

No remote D1 inspection, migration, deployment, OpenAI request, email, PDF,
R2 operation, Workflow operation, or GitHub write was performed while creating
this plan.

## Interfaces and Dependencies

No new runtime interface is introduced by this plan. Later packet plans must
name each new schema/table, repository function, service boundary and test
fixture precisely before implementation.

Dependencies by packet:

| Packet                     | Required prior decisions/inputs                                      | External authority later required                                              |
| -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Phase 0 / 1                | Chris review of data model; clean reviewed baseline                  | None for documentation/local inspection.                                       |
| A: public GEO conformance  | Alias policy and UTC compatibility decision; #10/#55 scope and tests | Named D1 migration; then separate Worker deploy; then real assessment proof.   |
| B: private journey         | Email protection, entitlement, consent and session policy            | Only if a real deployment is later requested.                                  |
| C: report/delivery records | Claim/view-model, object and delivery-state decisions                | R2/provider selection when moving beyond fakes.                                |
| D: external recovery       | Packet C accepted; provider/resource configuration                   | Explicit R2, email, Discord, Workflow, deployment and real-delivery approvals. |

No packet is automatically Symphony-ready. A bounded Issue must have approved
scope, non-goals, dependencies, acceptance tests, a clean source baseline, and
the appropriate owner authority before it is deliberately admitted.
