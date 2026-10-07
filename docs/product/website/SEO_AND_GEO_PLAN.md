# ShortList MVP 1 SEO and GEO plan

**Status:** draft launch-control plan; no production SEO/GEO configuration
**Owner:** Chris / SuccessByCS
**Product boundary:** [Requirements](../REQUIREMENTS.md)

## Purpose

This plan governs discoverability of the ShortList website without misleading
local-search or AI-result claims. It distinguishes discovery of the ShortList
website from the product's dated assessment of a submitted business in a
defined AI-model result. The product cannot guarantee SEO, GEO, provider
ranking, enquiries, or revenue.

## MVP 1 public indexing boundary

| Surface | Intended visibility | Rule before launch |
| --- | --- | --- |
| Public landing/assessment route | Candidate for indexing. | Final title, description, canonical URL, and claim review required. |
| Privacy, support, deletion pages | Candidate for indexing where appropriate. | Publish only after final copy and process approval. |
| Progress, teaser, blurred/full result, consent, confirmation, error, rate-limit, and delivery states | Not independently indexable. | No state-specific public URL, canonical, share URL, or sitemap entry. Use noindex if a technical route is unavoidable. |
| PDFs and private report objects | Never public or indexed. | Private storage; no public bucket URL, sitemap entry, or guessable link. |
| Prototype/review tooling | Never public navigation or indexed content. | Do not ship screen-navigation controls as public IA. |

## Launch baseline to decide and implement later

- Confirm production domain and preferred HTTPS canonical origin.
- Give each indexable page a reviewed title, meta description, canonical URL,
  and social-preview metadata.
- Generate a sitemap for approved public indexable pages only.
- Publish robots policy consistent with the sitemap and private-result boundary;
  robots is not access control.
- Verify 404, redirect, canonical, sitemap, and robots behaviour on the actual
  deployed origin.

No production domain, sitemap, canonical URL, analytics property, or crawler
configuration is selected by this document.

## Global GEO claim rules

- The public assessment is global; it makes no default city, country or
  vertical eligibility claim.
- Geographic context uses an approved global market profile and website evidence
  or is reported as unable to determine; it is not inferred solely from model
  output or free text.
- Marketing may describe a dated defined current-web test, never an official,
  fixed, permanent, or universal rank.
- Location, customer-result, competitor, or case-study claims require approved
  source evidence and appropriate permission before publication.

## Ownership and review

The website-control Issue owns this plan's review. Launch readiness owns final
domain, public metadata, crawler configuration, and deployed verification. No
Symphony worker chooses SEO/GEO claims, a domain, or public content strategy.
