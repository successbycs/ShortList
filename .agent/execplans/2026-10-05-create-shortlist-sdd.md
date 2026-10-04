# Create the ShortList MVP 1 software design document

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Issue #6 turns the approved ShortList MVP 1 requirements into a lightweight,
reviewable Software Design Document (SDD). After this work, Chris can see the
proposed end-to-end system, the data and trust boundaries, the delivery order,
and every decision that remains his rather than an agent's to make. The SDD is
design evidence only: it does not create an account, call a provider, configure
a secret, or implement the public website.

## Progress

- [x] (2026-10-05 00:00Z) Verified Issue #6 is open, has no remaining native
  dependency, and is marked In Progress in the ShortList Project.
- [x] (2026-10-05 00:00Z) Inspected the approved requirements, detailed
  candidate, product brief, assumptions, user stories, delivery policy, and
  model-selection record.
- [x] (2026-10-05 00:10Z) Created `docs/product/SDD.md` with the proposed
  architecture, state flow, records, trust boundaries, requirement trace,
  owner decisions, and delivery sequence.
- [x] (2026-10-05 00:12Z) Ran `git diff --check` successfully and inspected
  the new document's two repository-relative Markdown links.
- [x] (2026-10-05 00:15Z) Confirmed `docs/product/REQUIREMENTS.md` and
  `docs/product/GLOSSARY.md`, the only repository-relative links used by the
  new SDD, exist; `git diff --check` remains clean.
- [x] (2026-10-05 00:20Z) Committed and pushed the SDD as `6705b5f` (`docs:
  add ShortList MVP 1 SDD`), then recorded the evidence/handoff in #6 without
  closing the Issue.
- [x] (2026-10-05 00:30Z) Added the product-design evidence directory,
  mockup/review-register guidance, and SDD link so #28 has a durable home for
  exported Loveable/mockup artefacts.
- [x] (2026-10-05 00:35Z) Chris approved the MVP 1 SDD, feature list,
  technology-decision position, and design-evidence structure in the Codex
  session; record the decision in #6 and leave Issue closure to Chris.

## Surprises & Discoveries

- Observation: The repository's `docs/architecture/` documents are reusable
  template guidance, not a ShortList application design.
  Evidence: `docs/architecture/ARCHITECTURE.md` states `Status: active
  template` and describes template SQLite, not the product.
- Observation: GPT-6 Luna is an approved model selection, but its exact search
  configuration, location method, cost, timeout, and public terminology are
  explicitly unresolved.
  Evidence: `docs/product/REQUIREMENTS.md`, section 4.
- Observation: #5 is a future Symphony implementation packet, not a completed
  feasibility gate. It remains blocked by #7 and #9 and must not receive the
  upstream admission label yet.
  Evidence: GitHub Issue #5, observed 2026-10-05.
- Observation: The repository-wide Markdown checker currently reports six
  invalid placeholder links in the historical discovery `Workflow.md`.
  Evidence: `python3 scripts/check_markdown_links.py` on 2026-10-05 reported
  `URL`, `IMAGE_PATH_OR_URL`, `{{ thread_url }}`, a `plugin://` target, a
  `sites-project://` target, and a `sandbox:/` target. None is linked from the
  new SDD or this plan.

## Decision Log

- Decision: Put the product-specific SDD at `docs/product/SDD.md` rather than
  overwriting generic template architecture documents.
  Rationale: A copied template must retain its reusable guidance while
  ShortList needs a concrete, reviewable application design.
  Date/Author: 2026-10-05 / Codex, derived from repository boundaries.
- Decision: Record unresolved operational and commercial choices as owner
  decisions, not inferred technical defaults.
  Rationale: The requirements explicitly reserve them for product-owner
  approval and Symphony cannot make them.
  Date/Author: 2026-10-05 / Codex.

## Outcomes & Retrospective

The SDD is ready for Chris's review. It makes the end-to-end journey, proposed
components, state boundary, evidence/access model, trust boundary, unresolved
decisions, and dependency order visible without claiming a configured service.
It enables #7, #24, and #28 to start as their separate design tasks. It does
not make #5 dispatch-eligible; only #8 can supply its bounded code packet after
the required design and foundation work.

The human-review evidence is GitHub #6 comment
`https://github.com/successbycs/ShortList/issues/6#issuecomment-5985551460`.
Design evidence is organised in `docs/product/design/README.md`; no mockup has
been added or approved yet.

Chris approved the SDD on 2026-10-05. The remaining work is deliberately
separated into #7 (contracts), #24 (safe/data/access design), and #28 (website
experience); the Project owner closes #6 after reviewing this record.

## Context and Orientation

ShortList MVP 1 is an automated, free inbound journey: a visitor submits a
public domain, receives a concise website-and-dated-AI-search teaser before
email capture, and may request a private Minimum Assessment PDF attachment.
`docs/product/REQUIREMENTS.md` is the canonical approved baseline; its detailed
candidate preserves exact behavioural scenarios. `docs/product/PRODUCT_BRIEF.md`
states the commercial intent and non-goals, while `ASSUMPTIONS.md`,
`USER_STORIES.md`, and `GLOSSARY.md` define the human context.

The SDD must treat a normalised domain as the customer-record key but never as
an access key; a recipient record owns private consent, delivery, attribution,
and report access. Machine time is UTC ISO 8601, while human output uses
Pacific/Auckland. AI-search results are a dated observed result, not an
objective or permanent ranking.

The technical architecture is a proposal. Cloudflare products, provider
accounts, a data store, email service, Discord, product domain, privacy
retention, and exact AI controls are not configured and must remain visibly
unresolved until approved.

## Plan of Work

### Milestone 1: create a reviewable product SDD

Add `docs/product/SDD.md`. It will define the MVP boundary, actors, flow,
system components, trust boundaries, data ownership, public API behaviours,
failure outcomes, and observability. A Mermaid diagram will show only proposed
boundaries and label every external service as unconfigured.

The document will map every requirement family to a design treatment and future
Issue, distinguish facts from inferences, and describe the AI-search result as
one dated query with evidence retention. It will state the security controls
that later design work must make concrete: URL/DNS safety, no client secrets,
bot/rate/cost controls, recipient isolation, safe rendering, and sanitised
attribution.

### Milestone 2: make decisions and dependencies explicit

The SDD will list unresolved product-owner decisions (provider settings,
suburb source, limits, support/retention, customer language, visual standards,
and launch measurements) and identify their owning Issues. It will show the
valid sequence: #6 -> #7 / #24 / #28 -> #8 -> #9 -> #5 / #10 and later build
work. It will not add a Symphony label or make any Issue dispatchable.

### Milestone 3: reviewable evidence

Run the repository Markdown-link checker and `git diff --check`. Inspect the
new document against Issue #6's acceptance evidence. Add an Evidence comment
to #6 linking the SDD and checks, then leave it open for Chris to review and
move to Done/close if satisfied.

## Concrete Steps

From `/home/chris/ShortList`:

    git status --short
    gh issue view 6 --repo successbycs/ShortList --json state,body,projectItems
    sed -n '1,260p' docs/product/REQUIREMENTS.md
    sed -n '1,260p' docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md
    git diff --check
    python3 scripts/check_markdown_links.py

Expected result: no unintended working-tree changes, #6 is open/In Progress,
the SDD has no malformed Markdown links, and `git diff --check` reports no
whitespace errors. A historical discovery document may have pre-existing link
exceptions; those must be reported rather than changed incidentally.

Actual result on 2026-10-05: `git diff --check` passed. The two
repository-relative SDD links resolve. The repository-wide checker still fails
only on six pre-existing placeholder links in `docs/product/discovery/Workflow.md`;
the new files add none.

## Validation and Acceptance

- A product owner can trace every MVP 1 requirement family to a proposed system
  boundary, data record, failure state, and future delivery Issue.
- The SDD contains an understandable architecture diagram and makes the
  website, provider, persistence, email, and operator boundaries visible.
- The SDD explicitly separates configured/observed facts from proposed design;
  it does not claim provider, Cloudflare, email, database, Discord, or
  production capability exists.
- Every unresolved owner decision remains listed with its consequence; no
  provider configuration, spend limit, retention period, public terminology,
  or commercial policy is guessed.
- `git diff --check` and the Markdown-link checker pass, or precise existing
  failures are retained as evidence.
- No external service, credential, provider call, production system, customer
  message, payment, or Symphony dispatch is attempted. Those boundaries remain
  unobserved.

## Idempotence and Recovery

The documentation changes are additive and safe to repeat. If Chris amends a
decision, update the canonical requirements and SDD, then add a superseding
GitHub Decision comment; do not erase prior decision evidence. Revert only the
new SDD/plan files if the design is rejected, never generic template
architecture guidance or unrelated working-tree changes.

## Artifacts and Notes

- Canonical baseline: `docs/product/REQUIREMENTS.md`.
- Detailed scenarios: `docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md`.
- Design output: `docs/product/SDD.md`.
- Delivery policy evidence: `.agent/execplans/2026-10-04-design-pdf-delivery-policy.md`.
- Model-selection evidence: `docs/product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md`.
- GitHub design Issue: #6; later contract/design Issues: #7, #24, #25, #28.

## Interfaces and Dependencies

The SDD introduces no executable interface. It specifies future boundaries:
browser-to-server domain submission; safe public-site acquisition; website
evidence extraction; AI-search adapter; assessment/persistence service;
recipient/consent service; PDF renderer/object store; email provider adapter;
and private operator alert. Each future adapter needs bounded inputs, a timeout,
idempotency/reconciliation behaviour, reason-coded outcomes, and tests. The
exact runtime, provider SDKs, schema, endpoint paths, and credentials remain
the responsibility of #7, #8, #9, #24, and their approved implementation
packets.
