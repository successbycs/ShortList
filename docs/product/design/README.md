# ShortList product design evidence

**Status:** design workspace; no public website or production design is implied  
**Owner:** Chris / SuccessByCS  
**Design Issues:** [#28](https://github.com/successbycs/ShortList/issues/28) website experience and [#25](https://github.com/successbycs/ShortList/issues/25) PDF acceptance

This directory is the durable, reviewable home for ShortList website-design
evidence. It keeps current design work separate from historical discovery
material in `docs/product/discovery/`.

## Layout

```text
docs/product/design/
  README.md       this index, source links, review state, and approvals
  mockups/        exported desktop/mobile mockups (PNG, PDF, or static HTML)
  references/     approved visual inspiration and design references
```

## How to add a mockup

Put an exported, reviewable artefact in `mockups/`. Use a descriptive name:

```text
YYYY-MM-DD-<journey-state>-<desktop-or-mobile>-v<N>.<extension>
```

For example:

```text
2026-10-05-domain-entry-mobile-v1.png
2026-10-05-teaser-desktop-v1.pdf
2026-10-05-email-consent-mobile-v1.html
```

For each mockup, add an entry below with its source (for example, a Loveable
project URL), the states it covers, and its review status. An external source
link is useful but never replaces an exported artefact in this repository.

## Review register

| Artefact                                                                                                                                                            | Source                                  | Journey states covered                                                                                                                                                   | Status   | Decision / notes                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [Loveable build brief](LOVEABLE_BUILD_BRIEF.md)                                                                                                                     | Repository prompt                       | All required prototype states                                                                                                                                            | Approved | The build brief led to the exported interactive prototype now adopted in `apps/web/`. #28 is closed following Chris's design review.            |
| [Adopted interactive frontend](../../../apps/web/README.md)                                                                                                         | Loveable export, adopted as source code | Domain entry, safe refusal, progress, teaser/blurred fuller result, current-web/model-knowledge comparison, email consent, masked-email confirmation/change, full result, future MVP 2 CTA placeholder, rate limit, exhausted entitlement, and insufficient-evidence states | Review   | #29 updates the local prototype to make the two AI-model modes visibly distinct. Later #11/#27 service work must implement the same state sequence on desktop and mobile; the current frontend remains service-free. |
| [PDF visual acceptance](PDF_VISUAL_ACCEPTANCE.md)                                                                                                                   | Repository standard                     | Minimum Assessment PDF, normal and limited outcomes                                                                                                                      | Approved | Chris closed #25 after reviewing the standard and illustrative examples. Later #27 implementation must still prove its generated PDFs meet this accepted contract. |
| [Illustrative successful report](mockups/2026-10-05-minimum-assessment-success-v1.pdf) · [source HTML](mockups/2026-10-05-minimum-assessment-success-v1.html)       | Fictional local example                 | Successful evidence, inference, limitation, and dated-result layout                                                                                                      | Review   | No real website or AI-search result. Review the visual hierarchy and customer wording.                                                          |
| [Illustrative limited-evidence report](mockups/2026-10-05-minimum-assessment-limited-v1.pdf) · [source HTML](mockups/2026-10-05-minimum-assessment-limited-v1.html) | Fictional local example                 | Honest insufficient-evidence/failure outcome                                                                                                                             | Review   | No real website or AI-search result. Review whether the limitation feels useful and respectful.                                                 |

Use one of these statuses:

- **Draft:** exploration only; does not change requirements or authorise code.
- **Review:** ready for Chris to assess against accessibility, truthful-content,
  and visual requirements.
- **Approved:** Chris has accepted it as implementation input; record the
  supporting GitHub Issue comment.
- **Superseded:** retained as history, with a link to the replacement.

## Accepted coverage for #28

Chris accepted #28 on 2026-10-05 after the Loveable export was added to the
repository and adopted as the interactive frontend source in `apps/web/`.
The live local prototype is the review artefact in place of separate static
desktop/mobile screenshots. Its required journey coverage is:

1. domain entry and invalid/unsafe/rate-limited input;
2. evidence-based teaser and distinct current-web/model-knowledge results;
3. email capture with separate delivery and optional marketing consent;
4. masked-email confirmation/change, blurred-to-full result reveal, and the
   reserved future-MVP-2 CTA position;
5. exhausted entitlement and resend/support states; and
6. insufficient-evidence and other honest failure outcomes.

Future visual changes must keep the journey mobile-first, keyboard-operable,
readable, and clear without relying on animation or humour. Loveable.dev was
the design exploration tool; the adopted `apps/web/` source is now the selected
frontend foundation, not a deployed production service.

## Current prototype boundary

The current frontend demo remains a pre-service prototype. It does **not** yet
implement the later approved masked-email confirmation/change step, blurred
full-result reveal, PDF trigger, stored records, or future-MVP-2 CTA location.
Its existing email-to-delivery state is therefore superseded as a visual
implementation target. #29 must update and re-review those states before the
prototype can be accepted as visual input for #11 and #27.
