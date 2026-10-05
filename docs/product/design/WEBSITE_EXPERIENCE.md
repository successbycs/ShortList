# ShortList MVP 1 website experience and visual acceptance brief

**Status:** draft for #28 review; mockups still required  
**Requirements:** [../REQUIREMENTS.md](../REQUIREMENTS.md)  
**Mockup register:** [README.md](README.md)

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
| Evidence-based teaser         | Receive useful value before email.                                          | Business description, evidence-led observations, labelled inferences, a dated current-web result, a separate no-web model-knowledge result, and limitations.                                                                                         | `Send my free assessment`          |
| Two AI-model results          | Understand the difference between current-web evidence and model knowledge. | Current-web: exact question, Auckland date/time, observed returned order/count, available citations, and a result-may-vary qualifier. Model knowledge: no web tool, no invented citations/ranking, and an explicit not-current/not-verified warning. | Continue to free report            |
| Email and consent             | Request a report privately.                                                 | Delivery consent required; marketing consent optional and unchecked. Explain no account is created.                                                                                                                                                  | Request assessment                 |
| Entitlement/resend            | Understand duplicate/exhausted outcome.                                     | Same recipient/domain explains resend/support path; exhausted state does not expose another request or promise manual fulfilment.                                                                                                                    | Resend / support                   |
| Insufficient evidence/failure | Receive an honest automated outcome.                                        | State what could not be assessed; no invented ICP, gap, or ranking claim; provide support route without promise.                                                                                                                                     | Try another valid domain / support |

## Accessibility and mobile acceptance

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
4. Can a keyboard/mobile user complete or understand the state without visual
   tricks?
5. Does the visual voice feel recognisably ShortList, warm, and useful rather
   than generic AI SaaS?

Chris marks a representative desktop/mobile set **Approved** only after it
covers domain entry, validation/refusal, teaser/two-result comparison, consent,
entitlement/resend, and insufficient-evidence/failure states. The approval is
implementation input, not production-launch approval.

## Inputs versus implementation requirements

Loveable exports, reference images, and external inspiration are design inputs.
The state inventory, truthfulness rules, accessibility criteria, and approved
mockups are implementation requirements. A later engineering task may adapt
layout for the selected frontend, but may not omit a required state or weaken
the evidence/consent/failure boundary without a recorded owner decision.
