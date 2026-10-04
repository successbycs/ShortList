# ShortList product design evidence

**Status:** design workspace; no public website or production design is implied  
**Owner:** Chris / SuccessByCS  
**Design Issue:** [#28](https://github.com/successbycs/ShortList/issues/28)

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
| None yet | — | — | Planned | Add the first Loveable export here for #28 review. |

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
