# Loveable build brief — ShortList MVP 1

Use this to create a **design prototype only**. Do not connect a database, AI,
email, payment, authentication, analytics, or deployment. Use fictional/example
content and clearly labelled placeholders.

## Prompt to use in Loveable

```text
Create a mobile-first website prototype called “ShortList” for global small
business owners. It shows how their public website appears to customers and two
separate AI-model views: one specific dated current-web result and one no-web
model-knowledge result. It is not a generic AI SaaS dashboard or a ranking tool.

Visual voice: warm, clever, slightly quirky, editorial, and credible. Use
playful small-business/search motifs: website windows, magnifying glass, map
pin, shopfronts, service vehicles, tools, and evidence tags. Avoid generic
robot heads, fake terminals, purple/blue dashboard clichés, or claims of AI
magic. Humour must never obscure an action, consent choice, price, or error.

Create responsive desktop and mobile screens for the **same journey** at both
viewport sizes: domain entry; invalid/safe
refusal; assessment progress; evidence-based results teaser; the two-result
comparison; masked-email confirmation/report-delivery-consent request; full
result view; entitlement/resend; and insufficient-evidence/failure.

The teaser must separate “What we observed” from “What this may suggest.” Use
a fictional small-business example with a neutral service type, such as
home cleaning, an electrician, a café, or a local trades business. Include a
current-web panel with the question “What are the top three [service type]
businesses like mine?”, fictional example findings, labelled UTC observation
time, source chips, and this qualifier: “This is
the order returned in this specific dated current-web test. Results may vary.”
Alongside it, show a clearly separate model-knowledge panel with no source
chips or ranking claim and this warning: “This response did not use a live web
search. It may be incomplete or out of date and is not a verified current
result.” Do not call either result official, permanent, or objective.

Report-delivery consent is required; marketing is a separate optional unchecked
checkbox. After entry, mask the address and ask the visitor to confirm it is
the address to receive the report. Include a clear **Change email** action.
This is not inbox-ownership verification. On confirmation, render the complete
result responsively in the website and start the private PDF-email path. Say no
account is required. The failure screen is empathetic and automated, includes
support, and never promises manual fulfilment.

At the end of the completed Minimum Assessment, reserve a clear location for a
future MVP 2 “full assessment” CTA. It is a design placeholder only in MVP 1:
do not add a price, checkout, payment form, or claim that the future assessment
is currently available.

Accessibility: visible focus, strong contrast, clear labels and inline errors,
text beside icons, keyboard-friendly controls, no colour-only status, and no
essential information hidden in hover or animation. Make the primary action
obvious at 375px width.
```

## Required exports

Export desktop and mobile artefacts for every state. Place them in `mockups/`
using the naming convention in [README.md](README.md), then register each with
its Loveable URL and `Review` status.

The prototype is input to #28 only. It does not select the production frontend
or host, authorise a public site, or approve unsettled customer wording.
