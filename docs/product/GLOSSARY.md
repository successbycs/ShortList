# ShortList glossary

**Status:** active MVP 1 terminology (approved by Chris in #3 on 2026-10-04)
**Owner:** Chris / SuccessByCS

| Term | Meaning |
| --- | --- |
| AI-search test | One defined, dated question run through the capability qualified by #23. It is not automatically a ChatGPT or official ranking. |
| Assessment run | One dated attempt to assess a normalised domain. |
| Customer record | The single record identified by a normalised primary domain; it is not an access identity. |
| Address confirmation | The visitor checks the masked email address and may change it before the fuller result is revealed and PDF delivery starts. It is not mailbox ownership verification. MVP 1 end state; not in the current increment. |
| Delivery attempt | One recipient-specific PDF generation/storage/attachment/provider-handoff cycle. A resend is a new attempt. |
| Local email reveal | Current increment only: the visitor types an email to reveal the on-page report. It stays in the browser and is not stored, confirmed, consented to or used to send anything. |
| Minimum Assessment | The free MVP 1 ShortList assessment: after masked-email confirmation it is rendered in the same responsive web journey and also sent as a private PDF attachment. |
| Normalised domain | The canonical domain format used to ensure one customer record per domain. |
| Normalised email | Email with surrounding whitespace removed and case normalised; no provider-specific dot or plus rewriting. |
| Provider acceptance | The email provider accepted an attachment handoff. It does not prove inbox receipt or reading. |
| Recipient record | Private data for one email address's consent, attribution, allowance, delivery attempts, and support events. |
| Report trigger | UTC instant at which report generation and the delivery attempt begin. |
| Teaser | The concise evidence-based value shown before email capture. MVP 1 end state; the current increment has no teaser (see the open decision in REQUIREMENTS). |
| Two-hour escalation | At the two-hour deadline without provider acceptance: record `escalated`, make one update-email attempt, alert Chris privately, and stop retries. |

Canonical behavioural definitions live in [REQUIREMENTS.md](REQUIREMENTS.md).
