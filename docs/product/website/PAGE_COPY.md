# ShortList MVP 1 page-copy control

**Status:** draft wording for Chris's review; not approved public copy
**Owner:** Chris / SuccessByCS
**Truthfulness rules:** [Requirements](../REQUIREMENTS.md) and
[Website experience](../design/WEBSITE_EXPERIENCE.md)

## Purpose

This is the single review surface for customer-facing MVP 1 wording. It avoids
scattering material promises through components, email templates, and mockups.
Exact brand voice may change at review, but the boundaries below must not
change without a recorded product decision.

## Required message inventory

| Journey point | Required meaning | Copy boundary |
| --- | --- | --- |
| Landing promise | Check one public business website and see a structured assessment. | Do not promise leads, revenue, a stable rank, or an official provider result. |
| Domain input | Ask for a public business website/domain. | Do not ask for credentials, private access, or email before teaser value. |
| Progress | Explain an understandable current stage without a fabricated completion time. | Do not expose provider, secret, or internal runtime detail. |
| Progress | Explain website assessment, buyer-profile, buyer-question, and result-compilation stages. | The animation is explanatory; it is not a live server trace or a time promise. |
| Local email reveal | Ask for an email and offer **See free report now** before the on-page report. | Until #11 exists, say neither that consent is stored nor that an email/PDF will be sent. |
| On-page report | Show domain, business overview, three ICP hypotheses, three buyer questions per ICP, and structured LLM findings. | Label website evidence, LLM interpretation, and uncertainty distinctly. Do not call a finding a permanent/current ranking. |
| Limits/duplicates | Explain entitlement, resend, or support outcome. | Do not reveal another recipient's activity. |
| Failure | Explain limitation and approved support route. | Do not invent findings, promise manual fulfilment, or expose internals. |
| Future CTA | Reserve a next-step location for MVP 2. | No MVP 1 price, checkout, payment, active offer, or lead capture. |

## Controlled terminology

For the current increment, call the outcome a **website assessment report**.
Say that the public website was assessed and that the LLM interpretation is a
starting point, not a fact guaranteed about customers or AI systems. Use
**See free report now** for the local reveal. Do not refer to sending,
confirming, consenting to, or delivering an email/PDF.

Current-web and model-knowledge language belongs to the broader MVP 1 baseline
only. If a later release exposes either mode, preserve its dated provenance and
do not call it an objective, official, permanent, or universal rank.

## Current journey decision

On 2026-10-07, Chris set the current increment: the real website assessment
feeds an LLM-structured on-page report. The visitor sees assessment progress,
enters an email to reveal the report, then sees the business overview, three
ICPs, three buyer questions per ICP, and stored findings. PDF generation,
recipient persistence, and email delivery remain deferred. Customer-facing
copy must not imply that a PDF was generated or an email was sent.

## Review gates

Before launch, Chris approves the landing promise, customer-facing result
labels, consent and confirmation wording, delivery-status wording, support
address, privacy/deletion wording, and future CTA label. Implementation must
consume approved copy rather than create material claims in code.
