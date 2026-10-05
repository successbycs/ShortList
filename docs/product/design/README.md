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

| Artefact | Source | Journey states covered | Status | Decision / notes |
| --- | --- | --- | --- | --- |
| [Loveable build brief](LOVEABLE_BUILD_BRIEF.md) | Repository prompt | All required prototype states | Review | Generate/export desktop and mobile artefacts before #28 approval. |
| [PDF visual acceptance](PDF_VISUAL_ACCEPTANCE.md) | Repository standard | Minimum Assessment PDF, normal and limited outcomes | Review | Review the standard now; generated sample PDFs are required before #25 acceptance. |
| [Illustrative successful report](mockups/2026-10-05-minimum-assessment-success-v1.pdf) · [source HTML](mockups/2026-10-05-minimum-assessment-success-v1.html) | Fictional local example | Successful evidence, inference, limitation, and dated-result layout | Review | No real website or AI-search result. Review the visual hierarchy and customer wording. |
| [Illustrative limited-evidence report](mockups/2026-10-05-minimum-assessment-limited-v1.pdf) · [source HTML](mockups/2026-10-05-minimum-assessment-limited-v1.html) | Fictional local example | Honest insufficient-evidence/failure outcome | Review | No real website or AI-search result. Review whether the limitation feels useful and respectful. |

Use one of these statuses:

- **Draft:** exploration only; does not change requirements or authorise code.
- **Review:** ready for Chris to assess against accessibility, truthful-content,
  and visual requirements.
- **Approved:** Chris has accepted it as implementation input; record the
  supporting GitHub Issue comment.
- **Superseded:** retained as history, with a link to the replacement.

## Minimum coverage for #28

Before #28 can be accepted, the review register needs representative desktop
and mobile evidence for:

1. domain entry and invalid/unsafe/rate-limited input;
2. evidence-based teaser and dated AI-search result;
3. email capture with separate delivery and optional marketing consent;
4. exhausted entitlement and resend/support states; and
5. insufficient-evidence and other honest failure outcomes.

Every mockup must keep the journey mobile-first, keyboard-operable, readable,
and clear without relying on animation or humour. Loveable.dev is an allowed
design exploration tool; it is not the selected production frontend, host, or
application architecture.
