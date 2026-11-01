# Read a few key pages of the submitted site, not just the top of the home page

**Status:** Active (2026-11-01): lean MVP scope set by Chris; awaiting build approval.

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

ShortList is MVP 1, not an enterprise product (Chris, 1 Nov 2026: "this is v1
and mvp not an enterprise solution"). This plan makes the smallest change that
gives the AI a fair view of a business website.

Today ShortList reads one page, the home page, and keeps its first 1,500
characters. On javln.com that is 27% of the home page; on lawnrite.co.nz 31%.
Neither report saw the services, pricing, about, reviews or location pages.

After this change ShortList reads up to six pages: the home page plus up to
five pages found in the site's sitemap or home-page links (services, pricing,
about, reviews, locations), using the CSP-Directory crawler's method of
choosing pages by words in their address and stripping menus and footers. Each
cleaned page is stored in the database with its type, so later questions can
reuse it. The profile and buyer-profile AI steps read up to about 18,000
characters instead of 1,500.

## Progress

- [x] (2026-11-01 07:20Z) Measured the gap; reviewed the CSP crawler.
- [x] (2026-11-01 08:40Z) Scope cut to MVP after Chris's direction; the
      earlier enterprise-style draft (AI page picker, full robots engine, crawl
      table, parser dependency, boilerplate statistics) is dropped.
- [x] (2026-11-01 08:30Z) Build (one PR, #89): discovery, choice, fetch, clean, store, view, tests (157 pass).
- [x] (2026-11-01 09:00Z) Proof: javln.com and lawnrite.co.nz before and after (see Artifacts).
- [ ] Deploy with Chris's OK.

## Surprises & Discoveries

- Both test sites have sitemaps (javln.com 217 URLs, lawnrite.co.nz 197),
  listing every service and location page.
- `website_sources` already stores one row per page, and the profile and ICP
  stages already accept several pages. Only a `page_type` column is new.
- `fetchPublicHtml` clears its timeout once headers arrive, so a page that
  stalls while sending its body can exceed 8 seconds. A three-line fix keeps
  the timeout armed until the body is read.

## Decision Log

- Decision: MVP scope. Rules only, no AI page picker; simple robots check; no
  new tables or dependencies; no boilerplate statistics.
  Date/Author: 2026-11-01, Chris.
- Decision: use CSP's method: choose pages by address words, strip
  navigation, footer, aside, form and script content.
  Date/Author: 2026-11-01, Chris ("use csp as an existing method").
- Decision: store each cleaned page (up to 10,000 characters) so new
  questions can reuse it later. How long to keep it is a future requirement.
  Date/Author: 2026-11-01, Chris.
- Decision: the crawl is a plain function, `crawlSite`. Making it an agent is
  a later, separate decision.
  Date/Author: 2026-11-01, Claude Code.

## Outcomes & Retrospective

The crawl works on both test sites and the profiles are clearly richer: named
testimonials and case studies, compliance and pricing details, and 22 named
towns for lawnrite instead of two regions. Cost rose by under one US cent a
report. Two problems found and fixed during the proof: the aggregate input
cap (6 × 16,000 tokens) was too small once more pages were read, raised to
6 × 40,000; and link text could mislabel a page, so the address now decides
the type and link text is used only when the address says nothing.
Deviation from the plan: `<header>` is kept, matching CSP's cleaner, because
many sites put their main headline inside it.

## Context and Orientation

The product is `apps/web` (Cloudflare Worker `shortlist-web`, D1 database
`shortlist-mvp1`). Today, under `apps/web/src/server/`:
`website-assessment.ts` calls `safe-website-fetch.ts` `fetchPublicHtml` for
`https://<domain>/` (8 s per page, 20 s total, 3 redirects, 5 MiB, HTML only,
public-domain check on every hop), then `website-evidence.ts`
`extractBoundedWebsiteEvidence` (title, meta description, up to ten JSON-LD
blocks, visible text cut to 1,500 characters), and records one
`website_sources` row. `live-assessment.ts` passes that one source to the
profile and ICP stages. A repeat visit returns the saved report before any of
this runs.

## Plan of Work

All new code goes in `apps/web/src/server/site-crawl.ts` with its tests.

1. **Find pages.** After the home page is fetched (as today), read
   `/sitemap.xml` (first 500 URLs; one level if it is a sitemap index) and the
   home page's links. Keep only same-site URLs: the exact host or its `www.`
   twin. Drop query strings, fragments, files (pdf, images, documents) and
   copies under a language or region prefix (`/nz/`, `/au/`, `/en/` and so
   on) when the same page exists without it.
   Discovery fetches (robots.txt, the sitemap and at most one child sitemap)
   use the same safe fetch as pages: public-target check and manual redirect
   checks on every hop, a redirect to another site rejected before it is
   requested, a 1 MiB byte limit, a timeout that covers the body, and text or
   XML content types. They count towards the 20-second limit below. If
   discovery fails, the crawl carries on with the home page's links.
2. **Respect robots.txt, simply.** Read `/robots.txt` once. Skip any page
   matched by a `Disallow` path prefix in the `User-agent: *` group. If the
   file is missing or unreadable, carry on (the home page is fetched today
   without a check).
3. **Choose up to five pages** by words in the path or link text, first match
   wins: skip (blog, news, privacy, terms, legal, careers, jobs, login, cart,
   checkout, account, search, tag, category); pricing (pricing, prices, rates,
   fees, packages, plans); proof (reviews, testimonials, customers,
   case-studies, stories, clients, portfolio, projects, gallery); locations
   (locations, areas, service-areas, where-we-work, branches); about (about,
   our-story, team, who-we-are, company); services (services, service,
   what-we-do, solutions, products, product, features, menu, treatments).
   Take services 2, then pricing, about, proof and locations 1 each; shorter
   paths first, then alphabetical, so the same site always gives the same
   pages.
4. **Fetch** the chosen pages three at a time with `fetchPublicHtml` (same
   safety rules), allowing at most one redirect and requiring the final URL to
   be same-site. Start no new fetch after 20 seconds of crawling. A failed
   page is skipped. Fix the body-read timeout gap in `fetchPublicHtml`.
5. **Clean** each page with the existing extractor, extended to drop the
   content of `nav`, `header`, `footer`, `aside` and `form` elements (CSP's
   skip list), and to keep up to 10,000 characters of text. Title is capped
   at 200 characters, meta description at 500, and JSON-LD at 4,000 per page.
6. **Store** each page as a `website_sources` row with a new `page_type`
   column (migration `0010_website_source_page_type.sql`, one `ALTER TABLE ...
   ADD COLUMN page_type TEXT`). The home page keeps feeding
   `website_evidence.bounded_excerpt` as today.
7. **Send** the profile and ICP stages every stored page, each cut to 3,000
   characters of text (the home page 4,000): at most about 19,000 characters
   of visible text. Before each call, the whole serialised website-source
   input (text, title, description, URLs and JSON-LD) is checked against a
   45,000-character limit; if it is over, JSON-LD is dropped from the
   extra pages first, then the lowest-priority pages. Evidence IDs already
   limit citations to these pages.

Wiring: `website-assessment.ts` calls `crawlSite` after the home page
succeeds; `live-assessment.ts` passes all sources; `recordWebsiteSource`
accepts `pageType`.

## Concrete Steps

From `apps/web`:

    npm run types && npm run lint && npm run typecheck && npm test && npm run build

Proof, locally, within the US$20/day development budget (cost reported):

    SCRATCH=/tmp/shortlist-crawl-proof && rm -rf "$SCRATCH"
    npx wrangler d1 migrations apply shortlist-mvp1 --local --persist-to "$SCRATCH"
    npm run build && npx wrangler dev --local --persist-to "$SCRATCH" --port 8799

Then submit javln.com and lawnrite.co.nz on `main` (before) and on the branch
(after).

## Validation and Acceptance

Tests with a fake fetch: same-site rule; language/region copy collapse; page
typing and choice order (stable when input order changes); a stalled
sitemap and an unsafe discovery redirect; oversized title and description,
and the 45,000-character input limit; robots
`Disallow`; a failed page doesn't fail the assessment; the 20-second stop;
nav/header/footer/aside/form removed; text and JSON-LD caps; a stalled body
times out; repeat visits still make no fetch or AI call.

Acceptance (Chris compares before and after): the profile names more of the
business's own services, areas, pricing and proof; total wait under about
90 seconds; cost under about US$0.06 a report.

## Idempotence and Recovery

Migration 0010 adds one nullable column. To undo the crawl, revert the PR and
deploy; the column can stay.

## Artifacts and Notes

Proof on 2026-11-01 (local Worker, fresh local D1, Claude Haiku 5.5). Before =
the live home-page-only reports from earlier the same day.

| | javln.com before → after | lawnrite.co.nz before → after |
|---|---|---|
| Pages read | 1 → 6 (home, pricing, about, clients, platform, officetech) | 1 → 6 (home, services, about, our-locations, lawn-mowing, one more) |
| Profile services / areas / proof | 2 / 2 / 3 → 4 / 2 / 4 | 7 / 2 / 0 → 7 / 22 / 5 |
| Tokens in / out | 59,302 / 15,294 → 97,928 / 18,834 | 59,566 / 16,539 → 89,507 / 13,855 |
| AI tokens cost (excl. searches) | ~US$0.014 → ~US$0.019 | ~US$0.014 → ~US$0.016 |
| Wait | 62 s (live) → 77 s (local) | 71 s (live) → 58 s (local) |

    javln.com: visible text 5,388 chars (kept today 1,500 = 27%), sitemap 217 URLs
    lawnrite.co.nz: visible text 4,820 chars (kept today 1,500 = 31%), sitemap 197 URLs

## Interfaces and Dependencies

No new dependencies. `crawlSite(homeHtml, homeUrl, deps)` returns the extra
cleaned pages with their types. Deploy and the remote migration need Chris's
OK.
