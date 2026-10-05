# ShortList prototype

## Build
- Create a mobile-first, single-page ShortList assessment experience with a warm editorial visual system and accessible controls.
- Add an interactive state switcher covering domain entry, safe refusal, progress, teaser, dated result, consent, entitlement/resend, and failure.
- Use the fictional Auckland lawn-care example and preserve the required distinction between observations and suggestions.
- Make consent explicit: required delivery consent, separate optional unchecked marketing choice, and no account requirement.
- Add responsive desktop/mobile layouts, visible focus, inline errors, semantic status text, and motion-reduction support.

## Technical details
- Keep the prototype frontend-only with local UI state; no data is sent or stored.
- Implement the experience at `/`, update route metadata, and define all visual tokens in the global design system.
- Verify the primary flow at desktop and 375px mobile widths, including accessibility and the current preview build.
