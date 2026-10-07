# ShortList MVP 1 content model

**Status:** draft implementation-control model
**Owner:** Chris / SuccessByCS
**Record contract:** [Contracts](../CONTRACTS.md)
**Data requirement:** [Requirements](../REQUIREMENTS.md)

## Purpose

This model describes customer-facing sections rendered from a stored
assessment. It applies to the teaser, fuller on-page Minimum Assessment, and
PDF. It does not select a database schema or PDF library.

## Claim rules

Every material item is one of:

- **Observed:** linked to website or current-web evidence.
- **Inference:** linked to evidence and visibly marked as an inference.
- **Insufficient evidence:** carries a safe reason and does not invent a
  conclusion.

The two AI-model modes are separate content types. Current-web evidence may
contain observed order and citations. Model-knowledge content has no invented
citations and carries its not-current/not-verified notice.

## Rendered sections

| Section | Teaser | Full on-page result | PDF | Required provenance |
| --- | --- | --- | --- | --- |
| Assessment identity | Domain and labelled UTC observation time. | Same plus result version. | Same plus PDF/report version. | Customer and assessment run; UTC storage and display in MVP 1. |
| Website summary | Concise observed description. | Full summary and supporting evidence. | Same approved content. | Website evidence IDs. |
| Buyer situations | Limited qualified preview. | Approved set marked as inference. | Same approved content. | Evidence IDs plus inference label. |
| Current-web result | Question, date/time, concise outcome. | Full available order and citations. | Same approved content. | Current-web evidence record. |
| Model-knowledge result | Clearly separate limited preview. | Full response and freshness warning. | Same approved content. | Model-knowledge evidence record. |
| Strengths/opportunities | Small useful set. | Full approved set and limitations. | Same approved content. | Observed/inference/insufficient classification. |
| Limitations/support | Essential limitation. | Full safe outcome and support route. | Same approved content. | Approved reason-code wording. |
| Future CTA | Not required before confirmation. | Inert MVP 2 placement only. | Optional only after owner copy approval. | Product-approved copy; no payment state. |

## Journey-only presentation state

The blurred fuller result is presentation state, not a separate assessment or
access object. It becomes visible after the visitor confirms the masked address
in the active journey. The persisted record retains confirmation/change outcome
and links assessment to recipient and delivery attempt, but a domain, report
ID, or object reference cannot become a public access key.

## Rendering constraints

- Render on-page and PDF content from versioned structured assessment data.
- Escape and sanitise all website-derived content before HTML or PDF rendering.
- Do not include credentials, raw recipient data, internal reason codes, or
  unsupported delivery claims.
- Persist enough version/provenance data to reproduce displayed content and its
  PDF without re-running an AI request.

Schema, migration, retention, deletion, private-object, session, and retry
mechanics require the later architecture decision. This document supplies the
content boundary only.
