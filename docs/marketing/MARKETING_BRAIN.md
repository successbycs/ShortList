# ShortList Marketing Brain

**Status:** controlled context index | **Owner:** Chris | **Update when:** an
approved product, website, offer, claims, or go-to-market decision changes.

## Purpose

This is the one starting point for ShortList marketing and customer-facing
website work. It brings together approved context without becoming a second set
of product requirements.

It must not introduce or override product facts, prices, claims, guarantees,
privacy policy, architecture, or delivery decisions. If an answer is missing,
uncertain, or conflicts with a linked document, record an open decision in the
owning Issue or ExecPlan rather than making it up.

## Authority order

1. Explicit Chris decisions recorded in the owning GitHub Issue and canonical
   repository documents.
2. Product requirements, brief and user stories.
3. Approved architecture, data, privacy, security and delivery documents.
4. This Marketing Brain and the relevant specialist skill.

## Approved context

| Topic | Current context | Canonical source |
| --- | --- | --- |
| Product | ShortList is a bounded website assessment that helps small service businesses understand their visibility in AI-mediated discovery. | `docs/product/PRODUCT_BRIEF.md`, `docs/product/REQUIREMENTS.md` |
| Customer journey | A visitor supplies a valid public business domain, sees an explanatory assessment sequence, enters an email to reveal an on-page report, and receives a business overview, three ICP hypotheses, three buyer questions per ICP, and structured findings. The local reveal is not PDF or email delivery. | `docs/product/REQUEST_FLOW.md`, `docs/product/CONTRACTS.md`, `docs/product/website/PAGE_COPY.md`, GitHub #57 |
| Evidence | Reports distinguish website-derived evidence, LLM interpretation, and meaningful uncertainty. Any configured evaluation mode remains explicit provenance, not a customer-facing ranking promise. | `docs/product/GEO_PROMPT_CONTRACT.md`, `docs/product/SAFE_ASSESSMENT_DESIGN.md`, `docs/product/CONTRACTS.md` |
| Geography | ShortList is a global self-service assessment. It does not restrict valid public business domains to Auckland, New Zealand, a predetermined vertical, or an operator-selected city. Assessments use evidenced service-area context or the approved global market profile; otherwise they state that geographic context is uncertain. | `docs/product/REQUIREMENTS.md` |
| Paid offer | A later paid assessment is envisaged. Price, tax, guarantees and exact offer are not approved here. | `docs/product/ROADMAP.md` and a future pricing/offer decision |
| Outreach and tracking | Outbound, social publishing, CRM activity and analytics activation are deferred. | `docs/go-to-market/`, `docs/product/ROADMAP.md` |

## How to use this context

| Task | Read with this document | Select when useful |
| --- | --- | --- |
| Positioning, ICP or message pillars | Product brief, requirements and discovery evidence | `product-marketing`, `customer-research` |
| Offer framing | Requirements and approved pricing decision | `offers` |
| Website hierarchy or navigation | Website experience and SDD | `site-architecture` |
| Assessment conversion journey | User stories, contracts and privacy requirements | `cro` |
| Customer-facing wording | Relevant page brief and claims evidence | `copywriting`, `copy-editing` |
| AI-discovery/GEO content | GEO prompt contract and evidence rules | `ai-seo` |
| Structured data | Actual visible page content and website architecture | `schema` |

## Non-negotiable guardrails

- Do not invent clients, testimonials, metrics, rankings, outcomes,
  credentials, prices, guarantees, scarcity, capacity, or legal conclusions.
- Label assumptions and proposals as such; do not present them as customer
  research or product fact.
- Do not state that an AI system will cite, recommend, rank, retrieve, or
  describe a business in a particular way without dated, recorded evidence.
- A skill provides a method, not authority to email, publish, contact prospects,
  activate analytics, collect data, configure a provider, deploy, or change a
  remote system.

## Update rule

Update the canonical product or decision document first. Then update this file
with a concise change note and the source link. Material marketing decisions
also belong in the owning GitHub Issue.

## Change log

- 2026-10-07 — Current release increment set: on-page website-assessment report after local email reveal; PDF/email delivery remains deferred under #11/#27. See GitHub #57 and `docs/product/REQUIREMENTS.md`.
- 2026-10-07 — Reconciled geography to the approved global self-service scope in `docs/product/REQUIREMENTS.md`; historical Auckland-first material is not public-product scope.
- 2026-10-07 — Superseded the earlier evidence-first teaser decision for the current release increment: assessment progress leads to a local email reveal and an on-page website-assessment report. PDF/email delivery remains deferred under #11/#27.
- 2026-10-07 — Initial controlled context index created under Issue #56.
