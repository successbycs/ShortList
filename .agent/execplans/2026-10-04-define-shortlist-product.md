# Define the ShortList product before implementation

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Turn the owner-provided discovery material into a reviewable, lightweight
specification-driven delivery baseline for ShortList. After the first
milestone, a product owner can read `docs/product/REQUIREMENTS.md` and decide
whether the MVP scope is correct before architecture, integrations, GitHub
Issues, or application code are created.

ShortList is a proposed SuccessByCS product for Auckland small service
businesses. It accepts a public domain, gives immediate evidence-based value,
offers a free emailed snapshot, and may sell a dated AI web-search report. This
plan defines the product decision record; it does not implement, deploy, call
OpenAI, process payments, send email, or create public pages.

## Progress

- [x] (2026-10-04 08:45Z) Read the repository planning contract and the primary discovery source `docs/product/discovery/GEO_Check_MVP_Requirements.md`.
- [x] (2026-10-04 08:45Z) Inspected the existing product-document templates and the conversation transcript, which locks the product name as AI Shortlist.
- [x] (2026-10-04 08:45Z) Created [Issue #1](https://github.com/successbycs/ShortList/issues/1) in the GitHub Discovery milestone, then created the first draft of stable, testable MVP requirements in `docs/product/REQUIREMENTS.md`; no application code is in scope.
- [x] (2026-10-04 07:36Z) Product owner changed the working product name from AI Shortlist to ShortList; update the draft requirements and this plan, leaving discovery records intact.
- [x] (2026-10-04 07:36Z) Created `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md` from owner Q&A. It separates the automated free assessment from MVP 2 Stripe checkout and lists all remaining decisions for review.
- [x] (2026-10-04 08:55Z) Refined the candidate: MVP 1 has one dated, Auckland-wide business-type ChatGPT Search test; paid Basic Assessment can add segmented comparisons. Auckland eligibility uses a versioned deterministic suburb reference dataset, with its source and upkeep still subject to owner approval.
- [x] (2026-10-04 09:10Z) Added owner-directed safeguards and retention requirements to the candidate: Cloudflare edge and server-side anti-abuse controls, privacy-minimised visitor events, UTC storage/Auckland display time, AI token/cost limits, server-only provider secrets with no Codex access, and retained professionally designed PDF reports. D1/R2 are a lightweight design candidate only.
- [x] (2026-10-04 09:20Z) Added first-landing UTM and referrer attribution. Cloudflare Web Analytics is retained for free aggregate analytics; a minimal first-party attribution record is required because Web Analytics does not provide UTM or custom conversion-event capture.
- [x] (2026-10-04 09:25Z) Added Loveable.dev as the first design-authoring tool and set a reviewable visual requirement: distinctive, playful small-business/search/AI references without sacrificing clarity, credibility, or accessibility.
- [x] (2026-10-04 09:35Z) Product owner locked the validation vertical sequence: landscaping/garden maintenance first, exterior cleaning second, residential painting third. The MVP candidate now treats the first as the active cohort rather than an unresolved decision.
- [x] (2026-10-04 09:40Z) Product owner set the pilot unit: test eligible businesses in cohorts of ten and review evidence between cohorts before expanding or changing vertical.
- [x] (2026-10-04 09:50Z) Product owner narrowed the first cohort to ten Auckland lawn-mowing businesses and proposed outreach for assessment feedback. The candidate records outreach as consent-gated: public addresses alone do not authorise commercial email, and consent, sender identity, unsubscribe, delivery, and feedback evidence must be retained.
- [x] (2026-10-04 09:55Z) Product owner set two acquisition channels: inbound self-service via the live website and later consent-gated pilot outreach. The live self-service journey is now the first delivery priority.
- [x] (2026-10-04 10:05Z) Documented the generic Symphony operating model in the ShortList README and recorded it as a V1-template backport candidate, explicitly excluding ShortList product decisions.
- [x] (2026-10-04 10:20Z) Product owner set MVP 1 free entitlement to three domain-assessment requests per normalised email address, with an internal Chris test allowlist. Applied the same bounded-retry, two-hour apology, and private Discord escalation policy to MVP 1 PDF delivery and future MVP 2 report delivery.
- [x] (2026-10-04 13:05Z) Product owner closed #21 and #22. Deliberately
  replaced the stale paid-MVP draft in `docs/product/REQUIREMENTS.md` with a
  canonical review draft that maps the agreed MVP 1 baseline to stable IDs,
  owners, priorities, and observable evidence; deferred choices remain visible.
- [ ] (requires product-owner review) Approve or amend the canonical MVP 1
  requirements draft in Issue #1, then progress to Issue #2 for formal scope
  approval.
- [ ] (after requirements approval) Create the MVP scope, architecture, assumptions, user stories, data/prompt contracts, and delivery plan as separate reviewed documents.
- [ ] (after product-definition approval) Propose dependency-ordered GitHub milestones and Issues; do not create them without explicit approval.

## Surprises & Discoveries

- Observation: The primary source is named GEO Check, and the later discovery transcript records AI Shortlist as a prior locked product name; the product owner has now selected ShortList for the active product documents.
  Evidence: `docs/product/discovery/GEO_Check_MVP_Requirements.md` versus `docs/product/discovery/ai-shortlist-conversation-transcript.pdf`, pages 3 and 13.
- Observation: The discovery material contains both a narrow landscaping/garden-maintenance MVP and a later broader reference to trades/home services.
  Evidence: the primary source's sections 2 and 9 limit the MVP to Auckland landscaping/garden maintenance; the transcript's final page mentions future home-service businesses.
- Observation: The discovery folder is user-supplied, uncommitted source material.
  Evidence: `git status --short` reported `?? docs/product/discovery/` on 2026-10-04.
- Observation: The repository-wide Markdown-link check cannot currently pass because the uncommitted discovery file `docs/product/discovery/Workflow.md` contains placeholder and non-web links.
  Evidence: `python3 scripts/check_markdown_links.py` reported `URL`, `IMAGE_PATH_OR_URL`, `{{ thread_url }}`, `plugin://`, `sites-project://`, and `sandbox:/` links in that file on 2026-10-04. The requirements draft itself was not reported as broken.

## Decision Log

- Decision: Treat ShortList as the active product name; GEO Check and AI Shortlist are historical discovery terminology.
  Rationale: The product owner explicitly selected ShortList after the discovery records were added. Retaining older names only in source material preserves traceability without creating conflicting active identity.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Keep the first MVP limited to Auckland residential landscaping and garden-maintenance businesses.
  Rationale: A single vertical keeps buyer questions, website evidence, report examples, and commercial validation focused. Other trades remain future scope until explicitly approved.
  Date/Author: 2026-10-04 / Codex, based on the primary MVP requirements.
- Decision: Validate exterior cleaning next and residential painting after that.
  Rationale: Both are local, visual, evidence-rich small-business categories that reuse the initial assessment approach while proving it beyond landscaping before more complex trades are considered.
  Date/Author: 2026-10-04 / Chris, recorded by Codex.
- Decision: Draft requirements before selecting providers or implementing architecture.
  Rationale: Product value, customer journey, boundaries, acceptance evidence, and commercial claims must be agreed before Cloudflare, OpenAI, Stripe, email, database, or PDF implementation choices can be responsibly specified.
  Date/Author: 2026-10-04 / Codex with Chris's direction.
- Decision: Replace the known stale draft rather than merge it into the MVP 1
  baseline.
  Rationale: It made paid NZ$47, Stripe, and manual-recovery commitments that
  conflict with the approved free inbound MVP 1 decisions. The former detailed
  candidate remains as the decision record supporting the canonical review
  draft.
  Date/Author: 2026-10-04 / Chris's authorised Issue #1 continuation, recorded by Codex.

## Outcomes & Retrospective

The first requirements draft is ready for product-owner review. It converts the
GEO Check MVP source into ShortList requirements with stable identifiers,
observable acceptance evidence, explicit non-goals, and unresolved decisions.
No technical or external boundary has been claimed as implemented. Whitespace
validation passed. The repository-wide Markdown-link check remains blocked by
unreviewed source-material links, not by the draft. The next milestone is
approval or correction of the product requirements.

## Context and Orientation

The repository at `/home/chris/ShortList` was bootstrapped from the V1 template
and its configured GitHub target is `successbycs/ShortList`. The generic product
document templates are in `docs/product/`. Discovery records are in
`docs/product/discovery/` and include:

- `GEO_Check_MVP_Requirements.md`: primary MVP source, including the intended
  customer journey, paid report, admin, data, non-goals, success measures, and
  acceptance criteria.
- `ai-shortlist-conversation-transcript.pdf`: later conversation record that
  records the prior AI Shortlist brand, `getaishortlist.successbycs.com` as a
  proposed prior domain, evidence-first wording, and a Cloudflare-oriented direction.
- `Standard_Report_Template.md`, `GEO Chatgpt Chat.md`, and `Workflow.md`:
  supplementary discovery inputs that remain source material until individually
  incorporated into an approved product document.

`docs/product/REQUIREMENTS.md` is the canonical current requirements document.
The discovery artifacts are inputs, not authoritative build instructions. A
requirement is a durable statement of needed outcome and acceptance evidence;
it does not choose implementation unless that choice is itself a business
constraint.

## Plan of Work

Milestone 1 — establish reviewable MVP requirements. Replace the generic
template content in `docs/product/REQUIREMENTS.md` with a ShortList draft.
Include product boundary, user journey, report integrity rules, payment/report
workflow outcomes, administration, privacy, accessibility/mobile expectation,
success measures, non-goals, and acceptance evidence. Use stable IDs. Preserve
unresolved choices as explicit questions rather than inventing provider details.
The observable result is a single document a product owner can approve or edit.

Milestone 2 — turn approved requirements into the remaining lightweight SDD
artifacts. Update `PRODUCT_BRIEF.md`, `ASSUMPTIONS.md`, `USER_STORIES.md`,
`GLOSSARY.md`, and `ROADMAP.md`; add concise specifications for data contracts,
AI prompt/evidence rules, payments, email, and report generation only when
their risk warrants it. This milestone requires the owner to approve Milestone
1 first.

Milestone 3 — prepare delivery. Propose milestones and small, dependency-linked
GitHub Issues from approved documents. Each Issue will state outcome,
non-goals, code scope, dependencies, acceptance evidence, and exact
verification. No Issues, labels, automatic workers, merges, or deployments are
authorised by this plan.

## Concrete Steps

From `/home/chris/ShortList`:

    sed -n '1,320p' docs/product/discovery/GEO_Check_MVP_Requirements.md
    sed -n '1,260p' docs/product/REQUIREMENTS.md
    git diff --check
    python scripts/check_markdown_links.py

Expected result: the discovery source is preserved and the requirements document
uses stable IDs and review status. The first two commands were run during
discovery. After writing the draft, `git diff --check` passed. The Markdown
check is currently blocked only by unreviewed links in
`docs/product/discovery/Workflow.md`; do not change that source material
without product-owner direction.

## Validation and Acceptance

The requirements draft is accepted for the next planning stage only when the
product owner confirms all of the following:

- ShortList, its initial customer, business outcome, and first vertical are
  correctly stated.
- The domain-to-preview-to-email-to-paid-report journey reflects the intended
  offer and does not promise a fixed AI ranking.
- Every material requirement has an ID, priority, owner, and observable
  acceptance evidence.
- The report-evidence rule distinguishes observed information from inference.
- Out-of-scope items and unresolved decisions are explicit.
- No provider, credential, payment, email, model, web-search, deployment, or
  data-store implementation is implied to exist.

This is documentation-only work. There is no runnable product boundary to test
yet; live OpenAI web search, Stripe, email, Cloudflare, PDF generation, and
admin operations are deliberately unobserved.

## Idempotence and Recovery

The requirements draft can be revised repeatedly before approval. Discovery
files must be preserved as source records; do not overwrite them to make them
match the draft. If a decision is contested, mark its requirement as proposed
or move it to the unresolved-decisions section rather than deleting the source
history. No external system is changed and no data migration or credential is
involved.

## Artifacts and Notes

The durable artifacts for this milestone are this ExecPlan and
`docs/product/REQUIREMENTS.md`. The source PDF and discovery documents must not
be committed unless the product owner explicitly chooses to version-control
them. The initial requirements are based primarily on
`GEO_Check_MVP_Requirements.md`; the transcript resolves the product-name
conflict and reinforces the evidence/disclaimer boundary.

## Interfaces and Dependencies

- `docs/product/REQUIREMENTS.md`: canonical markdown requirements, using IDs
  `PRD-*`, `FR-*`, `NFR-*`, and `AC-*`.
- `docs/product/discovery/`: owner-provided inputs, not application interfaces.
- Future dependencies, not implemented: public website fetch/analysis; an
  OpenAI web-search capability; payment processing; transactional email; report
  generation/storage; protected administration; privacy/deletion handling.
