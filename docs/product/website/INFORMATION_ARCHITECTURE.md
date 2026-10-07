# ShortList MVP 1 information architecture

**Status:** draft for product/design review
**Owner:** Chris / SuccessByCS
**Canonical journey:** [Requirements](../REQUIREMENTS.md)
**Design states:** [Website experience](../design/WEBSITE_EXPERIENCE.md)

## Purpose

This document controls the public information architecture for MVP 1. It keeps
the visitor in one assessment journey rather than inventing customer accounts,
report portals, or device-specific flows. It is not deployment routing
configuration or a production sitemap.

## Public route map

| Route | Purpose | Indexing/access boundary | MVP 1 state |
| --- | --- | --- | --- |
| / | Public offer and complete assessment journey. | Public; never exposes another visitor's assessment, email, or delivery state. | Required |
| /privacy | Approved privacy, retention, and deletion-request practices. | Public once approved. | Required before launch |
| /support | Approved customer support route and service limitations. | Public once approved. | Required before launch |
| /delete-my-data | Approved deletion-request route. | Public; must not expose records through domain or email lookup. | Required before launch |
| not-found | Safe explanation and return to home. | Public; no internal detail. | Required |

There is no MVP 1 public route for an individual assessment, PDF object,
recipient, account, login, payment, dashboard, or permanent report link. A
normalised domain is never a route parameter or access key.

## Single assessment journey on the home route

The same state sequence applies on desktop and mobile. Responsive layout may
change reading order and component layout, but not states or permissions.

~~~text
Public offer and domain entry
  -> validation/admission refusal OR assessment progress
  -> useful teaser plus blurred fuller result
  -> email and consent
  -> masked-email confirmation OR change email
  -> fuller on-page Minimum Assessment and PDF-delivery status
  -> future MVP 2 full-assessment CTA position (inert in MVP 1)
~~~

The full result is shown only in the active successful journey after the
visitor confirms the displayed masked address. This confirms intended delivery;
it is not mailbox ownership verification, authentication, or a durable report
portal.

## Navigation and utility-page rules

- Prototype state-navigation controls are review tooling, not public navigation.
- Utility pages must not bypass the assessment journey or imply a result can be
  retrieved from a public URL.
- The future MVP 2 CTA has no MVP 1 price, checkout, payment, lead capture, or
  claim that the future offer is available.
- Navigation must not imply a general SEO/GEO agency service, stable ranking,
  or official provider result.

## Implementation handoff

Later frontend work maps this document to apps/web routes and components.
Backend work maps it to the private records and result-access boundaries in
[Contracts](../CONTRACTS.md) and
[Safe assessment design](../SAFE_ASSESSMENT_DESIGN.md). No route or data-access
behaviour is authorised by this document alone.
