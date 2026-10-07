# ShortList MVP 1 website experience and visual acceptance brief

**Status:** draft for #28 review; mockups still required  
**Requirements:** [../REQUIREMENTS.md](../REQUIREMENTS.md)  
**Mockup register:** [README.md](README.md)

## Architecture traceability

This brief defines the visitor experience: the required states, visible
evidence/consent boundaries, accessibility criteria, and review standard. The
supporting documents define how those states are safely produced and protected:

- [Request flow](../REQUEST_FLOW.md) — browser-to-assessment request and
  customer-journey/system-boundary diagrams.
- [Software Design Document](../SDD.md) — proposed component and journey-state
  diagrams, including the teaser, confirmation, full-result, and delivery
  transitions.
- [Architecture map](../../architecture/ARCHITECTURE.md) — concise runtime and
  external-service boundary diagram.
- [Data model](../../architecture/DATA_MODEL.md) and
  [contracts](../CONTRACTS.md) — protected active-journey access, recipient
  isolation, evidence provenance, and delivery-state rules.

These documents support this experience; they do not permit an implementation
to remove a required visitor state or weaken a truthfulness, consent, or access
boundary.

## Experience promise

ShortList should feel like a clever, warm small-business diagnostic—not a
generic AI dashboard. It earns an email only after showing useful, source-aware
value. The experience may use light humour about the internet, AI, and search,
but clarity wins whenever humour conflicts with a decision, consent, cost, or
failure message.

## Visual direction

Use a confident editorial layout with purposeful small-business/search
iconography: website windows, magnifying glasses, map pins, garden/van/tool
motifs, and playful evidence markers. It should be quirky and credible, not
corporate SaaS-blue, fake-terminal, generic robot, or “AI magic” visual noise.

The visual system must provide a calm reading surface for evidence and a clear
hierarchy for: what we observed, what is an inference, what the dated test
returned, and what the visitor can do next. Animation is optional enhancement,
never the only way to understand state or use a control.

## Required journey states

| State                         | Visitor goal                                                                | Required content / truthful boundary                                                                                                                                                                                                                 | Primary action                     |
| ----------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Domain entry                  | Understand the offer and start safely.                                      | Ask for one public website/domain; say value appears before email. Do not imply a fixed ranking or guaranteed outcome.                                                                                                                               | `Check my website`                 |
| Validation/admission refusal  | Correct input or understand a safe refusal.                                 | Plain explanation for malformed, unsafe, rate-limited, or temporarily unavailable processing; no internal details.                                                                                                                                   | Correct domain / try later         |
| Assessment progress           | Know the service is working without a false time promise.                   | Plain progress stages; do not show fabricated results or expose provider/internal state.                                                                                                                                                             | Wait / cancel where supported      |
| Evidence-based teaser         | Receive useful value before email.                                          | Business description, evidence-led observations, labelled inferences, a concise dated current-web finding, a concise separate no-web model-knowledge finding, and limitations. The full answer set and available citations remain locked until masked-email confirmation. | `Email my free assessment`         |
| Two AI-model results          | Understand the difference between current-web evidence and model knowledge. | Current-web: exact question, labelled UTC observation time, available citations, and a result-may-vary qualifier. Model knowledge: no web tool, no invented citations/ranking, and an explicit not-current/not-verified warning. | Continue to free report            |
| Email confirmation and consent | Confirm the intended email before the fuller result is revealed.             | Report-delivery consent required; marketing consent optional and unchecked. Mask the submitted email and offer **Change email**. This is an intentional-address check, not inbox-ownership verification.                                                       | Confirm and send                  |
| Full result and delivery      | Read the complete Minimum Assessment on the same responsive website.        | On confirmation, reveal the full result below the submitted domain and start private PDF delivery. Distinguish observed evidence from inference and never expose another recipient's result.                                                               | Review assessment                 |
| Entitlement/resend            | Understand duplicate/exhausted outcome.                                     | Same recipient/domain explains resend/support path; exhausted state does not expose another request or promise manual fulfilment.                                                                                                                    | Resend / support                  |
| Insufficient evidence/failure | Receive an honest automated outcome.                                        | State what could not be assessed; no invented ICP, gap, or ranking claim; provide support route without promise.                                                                                                                                     | Try another valid domain / support |

## Accessibility and mobile acceptance

Desktop and mobile present the **same state sequence**: domain entry,
progress, teaser/blurred fuller result, email and masked-email confirmation,
full result/PDF-sent state, entitlement/resend, and safe failure. Responsive
design changes layout and reading order only; it must not hide, add, or bypass a
step for a particular device.

Every representative desktop and mobile mockup must show:

- one-column mobile priority for the action and core result;
- readable body text, clear heading hierarchy, sufficient contrast, and no
  colour-only error/status signal;
- visible keyboard focus, labelled form controls, meaningful button names, and
  error text associated with its input;
- a complete usable journey without hover, animation, drag, or a pointer;
- concise plain-language status/failure copy; and
- evidence/inference labels that remain distinguishable in text-only context.

## Mockup review rubric

Mark a mockup **Review** only when it identifies viewport and journey state,
has a Loveable/source link where available, and answers these questions:

1. Does the visitor understand what they receive before giving an email?
2. Is every material claim visibly evidence, inference, or limitation?
3. Are current-web evidence and model knowledge visibly separate, with no
   objective/official/permanent-rank implication and a clear no-web warning?
4. Does each viewport use the same email-confirmation and full-result state
   sequence, rather than device-specific behaviour?
5. Does the completed-result view reserve the future MVP 2 full-assessment CTA
   location without representing that offer as live in MVP 1?
6. Can a keyboard/mobile user complete or understand the state without visual
   tricks?
7. Does the visual voice feel recognisably ShortList, warm, and useful rather
   than generic AI SaaS?

Chris marks a representative desktop/mobile set **Approved** only after it
covers domain entry, validation/refusal, teaser/two-result comparison, consent,
masked-email confirmation/change, full-result reveal, entitlement/resend, and
insufficient-evidence/failure states. The approval is
implementation input, not production-launch approval.

## Inputs versus implementation requirements

Loveable exports, reference images, and external inspiration are design inputs.
The state inventory, truthfulness rules, accessibility criteria, and approved
mockups are implementation requirements. A later engineering task may adapt
layout for the selected frontend, but may not omit a required state or weaken
the evidence/consent/failure boundary without a recorded owner decision.
