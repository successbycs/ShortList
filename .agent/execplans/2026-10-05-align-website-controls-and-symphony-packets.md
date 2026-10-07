# Align website controls and Symphony implementation packets

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList has an approved MVP 1 customer journey, but the public-website
implementation controls and the GitHub/Symphony task graph do not yet fully
express it. After this documentation-and-planning change, a reviewer can find
one canonical website-control set, see which future packets own persistence and
durable PDF delivery, and see that no product Issue is accidentally dispatched
while the upstream Symphony label-release policy remains unproven.

This work does not build a database, configure a Cloudflare resource, send
email, render a PDF, run Symphony, deploy a website, or select a provider. It
creates durable requirements/design inputs and GitHub planning records only.

## Progress

- [x] (2026-10-05 02:35Z) Read the ShortList Issue workflow, configured target,
  planning rules, current delivery plan, and current native dependencies.
- [x] (2026-10-05 02:35Z) Obtain independent Astra and Terra read-only reviews.
- [x] (2026-10-05 03:10Z) Create the `docs/product/website/` control documents
  and reconcile the delivery-plan dependency graph.
- [x] (2026-10-05 03:10Z) Create the website-control and combined
  architecture-decision Issues; nest them under Design & Feasibility and record
  their native dependencies.
- [x] (2026-10-05 03:10Z) Remove `symphony:ready` from #29, correct its code
  packet, and record the no-dispatch blocker.
- [x] (2026-10-05 03:10Z) Correct native dependencies for #10, #11, and #27;
  move #5 to Build & Verify without admitting it to Symphony.
- [x] (2026-10-05 03:10Z) Create a separate template/V1 task for the offline
  label-release proof; do not alter runtime policy or start the scheduler.
- [x] (2026-10-05 03:45Z) Validate local documentation links/whitespace and
  read back #29, #10, #11, #27, and #35 from GitHub. #35 is closed/Done, its
  downstream native dependency links remain recorded, and #29 has no labels.
- [x] (2026-10-05 03:35Z) Record Chris's approval of #35: D1 is the private
  record system of record, R2 stores private PDFs, and Workflows manages only
  durable delivery/retry recovery; no remote resource or provider was created.

## Surprises & Discoveries

- Observation: #29 still carries `symphony:ready`, but its code packet names
  an old Loveable mockup directory rather than the adopted `apps/web/` source.
  Evidence: GitHub Issue #29 body and `WORKFLOW.md` inspected 2026-10-05.
- Observation: the current frontend prototype does not implement masked-email
  confirmation/change, blurred-to-full result reveal, or the MVP 2 CTA
  placeholder.
  Evidence: `docs/product/design/README.md` records the prototype boundary and
  Issue #29 contains the review handoff.
- Observation: Before Chris approved #35, D1/R2/Workflows were candidates, not
  approved configured services; #27's retry policy therefore had no selected
  durable runtime.
  Evidence: Pre-decision `docs/product/SDD.md` technology table and Issue #27
  scope, superseded by the #35 decision recorded 2026-10-05.

## Decision Log

- Decision: Use one combined architecture-decision Issue for private records,
  result access, private PDF objects, and durable retry/escalation.
  Rationale: the concerns share identity, storage, idempotency, privacy, and
  observability boundaries; splitting them would leave #10/#11/#27 with
  incompatible assumptions.
  Date/Author: 2026-10-05 / Chris, based on Terra review.
- Decision: Keep the requested website artefacts under `docs/product/website/`
  as a reviewable canonical set, rather than duplicating implementation code
  or historical discovery material.
  Rationale: current material is useful but scattered across requirements,
  contracts, and design briefs.
  Date/Author: 2026-10-05 / Chris, based on Astra and Terra reviews.
- Decision: Do not restart #29 or alter the live Symphony scheduler in this
  change.
  Rationale: upstream label-release/restart behaviour has not yet been proved
  on an isolated offline Issue.
  Date/Author: 2026-10-05 / Chris, via prior approved handoff policy.
- Decision: Select Cloudflare D1 for relational product records, R2 for
  private PDF objects, and Workflows for delayed report delivery/retry.
  Rationale: Records, files, and durable waits have different responsibilities;
  using the managed Cloudflare products avoids a custom scheduler or public
  report store while retaining clear D1-based access and idempotency rules.
  Date/Author: 2026-10-05 / Chris, approved by executing #35.

## Outcomes & Retrospective

Completed 2026-10-05. The canonical website controls, D1/R2/Workflows
architecture decision, and downstream implementation boundaries are now
reviewable in repository documents and GitHub. No remote product capability was
created: D1/R2/Workflow resources, bindings, migrations, credentials, email,
PDF rendering, deployment, and Symphony dispatch remain outside this work.

## Context and Orientation

The canonical journey is in `docs/product/REQUIREMENTS.md`: a visitor submits
a domain, receives a useful teaser and blurred fuller result, enters an email,
confirms or changes the masked address, sees the full responsive result, and
has the Minimum Assessment PDF sent. The address confirmation is deliberately
not mailbox ownership verification. Mobile and desktop use the same state
sequence. A future paid/full-assessment CTA is only an inert MVP 1 placeholder.

`docs/product/design/WEBSITE_EXPERIENCE.md` defines interaction/accessibility rules;
`docs/product/CONTRACTS.md` defines evidence and report/delivery records;
`docs/product/SDD.md` sets architecture boundaries; and
`docs/product/DELIVERY_PLAN.md` maps implementation Issues. The new website
documents consolidate—not replace—those sources for public-website work.

GitHub Issue #29 is the static frontend prototype review. It must not be
dispatched until its scope matches `apps/web/` and upstream label-release
behaviour is independently proved. Issue #5 implements AI evidence, #10 safe
assessment/preview, #11 confirmation/result records, and #27 PDF delivery.

## Plan of Work

First add the four website documents with clear draft/review status and links
to the canonical requirements. They will define a single-page assessment
journey plus future privacy/support/deletion utility pages; they will not
silently create account, report-portal, payment, or production SEO behaviour.

Second, update the delivery plan to remove its duplicated dependency line and
show the new website-control, architecture, and Symphony-proof gates. Create
two ShortList Design & Feasibility Issues: one for review/approval of the
website-control documents, and one for selecting/specifying records, private
result access, PDF object storage, and durable retry orchestration. Add native
Issue dependencies so #10, #11, and #27 cannot bypass the architecture gate.

Third, make #29 safe to leave open: remove only `symphony:ready`, replace its
outdated mockup-only code packet with a static `apps/web/` prototype packet,
and record a blocker comment. Correct #10's missing #5 dependency and move #5
to the Build & Verify milestone without changing its admission label.

Finally, create a template/V1 planning Issue for the disposable offline
upstream Symphony proof. It will explicitly require a later human operator to
start the test; this work does not itself launch a worker or modify `WORKFLOW`.

## Concrete Steps

From `/home/chris/ShortList`:

1. Add `docs/product/website/INFORMATION_ARCHITECTURE.md`, `PAGE_COPY.md`,
   `CONTENT_MODEL.md`, and `SEO_AND_GEO_PLAN.md` with links to the existing
   requirements, contracts, and experience design.
2. Update `docs/product/DELIVERY_PLAN.md` with the new gates and Issue mapping.
3. Use `gh issue create/edit`, GitHub native dependency endpoints, and project
   membership only after reading the configured target and current Issue state.
4. Run `git diff --check` and read back relevant GitHub Issue JSON. Expected:
   no whitespace errors, explicit blockers, and no `symphony:ready` label on
   #29.

From `/home/chris/template`:

5. Create the V1/template proof-planning Issue only. Do not change the runtime
   workflow or start the launcher. Record that an offline disposable Issue,
   a later deliberate operator start, and post-refresh evidence are required.

## Validation and Acceptance

The documentation is acceptable when a reviewer can answer: what public pages
exist; where customer-facing copy is controlled; which structured content feeds
the teaser, full result, and PDF; and which SEO/GEO claims are permitted before
launch. The new documents must label their unapproved public wording and
deployment choices as review gates.

GitHub acceptance is: #29 has no `symphony:ready` label and has a corrected
static-only packet; #10 is blocked by #5 and the architecture Issue; #11 and
#27 are blocked by the architecture Issue; #5 is in Build & Verify but still
not admitted; and the new tasks are nested under their correct parent/milestone
with clear non-goals and human-review boundaries.

No claim of persistence, email, PDF delivery, runtime scheduling, or deployed
SEO is made. Those boundaries remain unobserved until separately authorised
and proved.

## Idempotence and Recovery

Document changes are additive and can be revised through normal Git history.
Issue creation and native dependency mutation are externally visible; read each
target immediately before writing and record URLs/IDs. If a duplicate Issue is
found, do not create another; add a clarification comment instead. Removing
the #29 admission label is reversible only through a deliberate future operator
decision after the offline proof; do not re-add it in this plan.

## Artifacts and Notes

- `docs/product/website/` is the public-website control layer.
- GitHub #29 remains an unimplemented static prototype, not a service proof.
- The template proof Issue is not a request to run Symphony.

## Interfaces and Dependencies

The new website documents do not add runtime interfaces. They constrain later
routes, public copy, render data, and SEO configuration.

The architecture-decision Issue must choose or reject a concrete private-record
store, private PDF object store, and durable delayed-work runtime before #10,
#11, or #27 implement those boundaries. The decision is explicitly not made by
this ExecPlan.
