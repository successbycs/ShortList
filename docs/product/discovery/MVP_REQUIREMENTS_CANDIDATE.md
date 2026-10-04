# MVP Requirements Candidate — Additional Source

**Status:** source material, not approved requirements | **Added:** 2026-10-04

This note records an owner-provided GEO Check MVP requirements draft and the
following current clarifications. It is an input to Issue #1; it does not amend
`docs/product/REQUIREMENTS.md` until the product owner approves a reconciled
version.

## Current owner clarifications

- MVP 1 is intended to prove that visitors enter a domain, receive useful
  automated value, and share an email address for the free Minimum ShortList
  Assessment.
- MVP 2 includes a payment gateway. The chosen payment provider is **Stripe**.
  The paid Basic Assessment must be automated rather than manually prepared.
- The initial vertical is not yet chosen. The product may focus on one vertical
  for validation, but landscaping is a prior use case rather than an approved
  permanent boundary.
- If a site is unreadable, unreachable, sparse, or has insufficient evidence,
  the product must provide an automated outcome and offer a route to the
  SuccessByCS support email. The actual support address is not recorded here.
- Every domain submission must be stored in a database. The owner proposes
  using the domain as the customer/business identifier and limiting searches to
  roughly three per day. The exact data model and rate-limit key remain open.

## What the supplied draft proposes

The supplied draft describes:

- domain-first input and an immediate preview before email capture;
- website-derived business summary, service area, ICP hypotheses, supporting
  evidence, questions, and trust/visibility opportunities;
- a free emailed snapshot and an upgrade path to a ChatGPT Recommendation
  Check;
- an automated Stripe purchase, stored paid-report job, live search execution,
  branded PDF, and email delivery;
- a private admin view and database records for submissions, reports, payment,
  consent, and status;
- no fixed OpenAI ranking claim, no automated external-profile/website edits,
  no ongoing monitoring, no client logins, and no multiple AI platforms.

## Conflicts or decisions not yet resolved

| Topic | Current state requiring Q&A |
| --- | --- |
| Product name | The source says GEO Check; the active product name is ShortList. |
| Customer scope | The source lists many local-business types; a first vertical remains undecided. |
| Free AI-search component | The product needs basic AI-search value, but the exact query count, evidence standard, and safe fallback are unapproved. |
| Paid-report timing | The source calls live AI-search the first MVP core; the current staged direction places paid purchase in MVP 2. |
| Price | The source proposes NZ$47 including GST. The owner previously stated price is unknown and needs a pricing-assessment task. No price is approved. |
| Delivery promise | The source proposes delivery within 24 hours. The owner has required full automation; the permitted latency, failure response, and customer wording are unapproved. |
| Consent | The source combines free-report delivery and optional ongoing guidance in one control. Delivery consent and marketing consent need to remain distinct. |
| Support route | “Route to my email address” needs a configured support address, privacy-safe message content, and an automated acknowledgement before implementation. |
| Domain identity | A domain can have repeated submissions, reruns, payments, and reports. A durable design will likely need a normalised domain/business record plus separate assessment/report-run records, not one domain value as the sole record identifier. |
| Three-per-day limit | Decide whether the limit applies per domain, IP/network, email, business record, or a combination. This is an abuse/cost control decision. |

## Questions to answer before updating requirements

1. For MVP 1, what exactly counts as a successful free Minimum ShortList
   Assessment: which fields, how many ICPs/gaps/questions, and which basic
   AI-search result?
2. Which initial vertical gives the fastest evidence of value and willingness to
   share an email address?
3. What is the automated customer message and support-email behaviour for an
   unreadable or insufficient-evidence website?
4. What data may be retained for a domain submission, how long, and what must
   deletion remove?
5. What is the rate-limit policy and how should a returning business be
   recognised without blocking legitimate reruns?
6. What must the Stripe-paid Basic Assessment prove before price, delivery time,
   and customer claims are finalised?

## Adoption rule

Only an explicit product-owner answer to these questions may change the active
requirements, SDD, data model, GitHub task scope, public copy, or external
configuration.
