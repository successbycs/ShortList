**Status:** Draft (2026-11-01): written for review; not yet approved for build.

# Crawl the submitted site, store cleaned typed pages, and let the AI read a budgeted view

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Today ShortList reads one page of a business website, the home page, and keeps
only its first 1,500 characters of visible text plus any structured data. Every
part of the report (the business overview, the three buyer profiles, the nine
questions and the findings) is built from that. On the two sites tested live on
1 November 2026 that was about a third of the home page, and none of the pages
that matter most to a buyer: services, pricing, about, reviews and locations.

After this change, ShortList crawls the submitted website the way the
SuccessByCS CSP-Directory crawler already crawls vendor websites, adapted for
small businesses and for a visitor who is waiting:

1. It checks robots.txt, reads the sitemap and the home page's links.
2. It sorts the site's addresses into page types (services, pricing, about,
   reviews, locations and so on), skips the ones that never help (blog, legal,
   careers, login, cart) and picks up to eight pages.
3. It fetches those pages safely, strips menus, footers, cookie banners and
   pop-ups, and keeps the title, meta description and structured data.
4. It stores every cleaned page in the database with its type and date.
5. The AI steps read a budgeted view of those stored pages, about 16 times
   more than today, and every finding can cite the page it came from.

Because the cleaned pages are stored, Chris can later add new questions ("Is
your pricing clear?", "Do you show proof?") that run against the stored pages
without fetching the site again, and prompt improvements can be re-tested on
exactly the same input.

What a visitor will see: reports that name the business's actual services,
areas and proof, for a wait about 5–10 seconds longer and less than one US cent
more in AI cost.

## Progress

- [x] (2026-11-01) Measured the gap on javln.com and lawnrite.co.nz; reviewed
      the CSP-Directory crawler (`/home/chris/projects/csp-crawl-main`, the
      `origin/main` worktree).
- [ ] Milestone 1 — Discovery and page choice (robots, sitemap, links, types).
- [ ] Milestone 2 — Safe multi-page fetch and CSP-style cleaning.
- [ ] Milestone 3 — Page store (migration 0010) and the budgeted view.
- [ ] Milestone 4 — Proof: javln.com and lawnrite.co.nz before and after.
- [ ] Deploy with Chris's OK.

## Surprises & Discoveries

- Observation: CSP's crawler never reads sitemap.xml (planned in its plans 19
  and 71, never built), but both ShortList test sites have one: javln.com lists
  217 URLs, lawnrite.co.nz 197 including every service and location page.
  Evidence: `curl https://javln.com/sitemap.xml | grep -c '<loc>'`.
- Observation: CSP's AI step uses its weaker cleaner (`clean_with_provenance`,
  which removes only script, style, noscript, template and svg) and drops the
  meta description and JSON-LD. Its stricter cleaner,
  `extract_visible_text` in `services/extraction/page_text_extractor.py`, is
  used only for word counts. ShortList should port the stricter one and keep
  the metadata.
- Observation: CSP's heading-based section labels classify 0.5% of text (only
  "pricing" is defined); its own plan 385 concludes that page type by URL
  explains 95% of pages. This plan types pages, not sections.
- Observation: javln.com serves the same pages under `/`, `/nz/` and `/au/`.
  Region and language copies must be collapsed or the budget fills with
  duplicates.
- Observation: `website_sources` (migration 0006) already holds one row per
  page with `visible_text`, `page_title`, `meta_description` and
  `json_ld_json`, and the GEO runner already accepts several sources, each
  with its own evidence ID. The store needs a few columns, not a new design.

## Decision Log

- Decision: port CSP's method (rules-based discovery, URL-type page choice,
  strict cleaner) rather than invent a new one, and add sitemap discovery.
  Rationale: Chris, 1 Nov: "use csp as an existing method"; CSP's measured
  lessons (plan 385) favour URL typing.
  Date/Author: 2026-11-01, Chris / Claude Code.
- Decision: store the full cleaned page (up to 20,000 characters each), and
  give each AI step a budgeted view built from the store.
  Rationale: Chris, 1 Nov: "if we have the cleaned data in our database we
  can then expand the questions we can ask as we go".
  Date/Author: 2026-11-01, Chris.
- Decision: the crawl is a stand-alone tool (`crawlSite`), not an agent. One
  bounded AI call may pick pages when the URL rules are unsure; it cannot
  fetch anything. A true crawl agent is a separate decision.
  Rationale: a per-step agent is slower, costlier and non-repeatable (a repeat
  visit must show the same report), and lets web pages steer a model's
  actions. `docs/architecture/agent-charter.md` does not authorise new runtime
  agents. Chris asked on 1 Nov whether the crawl could be an agent; this
  records the recommendation and leaves the agent decision to him.
  Date/Author: 2026-11-01, Claude Code (recommendation; Chris to confirm).
- Decision: no headless browser. A page with fewer than 200 words is recorded
  as "thin, probably built in the browser", and the report says so.
  Rationale: CSP needed Playwright for some SaaS sites, but a visitor is
  waiting; Cloudflare Browser Rendering can be a later Issue.
  Date/Author: 2026-11-01, Claude Code.

## Outcomes & Retrospective

(Empty until a milestone completes.)

## Context and Orientation

ShortList's product is `apps/web`, a TanStack Start app running as the
Cloudflare Worker `shortlist-web` with the D1 database `shortlist-mvp1`. A
visitor submits a domain; `src/server/live-assessment.ts` runs:

1. `runWebsiteAssessment` (`src/server/website-assessment.ts`), which calls
   `fetchPublicHtml` (`src/server/safe-website-fetch.ts`) for
   `https://<domain>/` only, then `extractBoundedWebsiteEvidence`
   (`src/server/website-evidence.ts`) with `maxExcerptCharacters: 1_500`, and
   records one `website_evidence` row and one `website_sources` row.
2. `executeAndPersistGeoAssessment`, which runs the GEO stages through the
   Claude provider (`src/server/geo-claude-messages.ts`): profile and ICP
   receive `website_sources`; questions and the two evaluations receive the
   profile, not the pages. Evidence IDs cited by the AI are limited to the
   `website_sources` IDs.

Terms used here:

- **Crawl:** fetching several pages of one website by following its own
  sitemap and links.
- **Page type:** a label from the URL path, for example `services` or
  `pricing`.
- **Budgeted view:** the subset of stored page text sent to an AI step, with a
  per-page and total character limit, filled in priority order.
- **robots.txt:** a site's published rules for automated readers.

The CSP-Directory crawler (Python, Playwright) is the reference. Its relevant
files, in `/home/chris/projects/csp-crawl-main`:
`services/discovery/seed_crawler.py` (link discovery and scoring),
`services/discovery/local_crawler.py` (robots.txt),
`services/extraction/page_text_extractor.py` (strict cleaner: `SKIP_TAGS` and
`NOISE_HINTS`), and `config/evidence_selection.json` (page types, priority,
caps, language list).

Limits that shape the design: the visitor waits; the website step's total
budget is 20 seconds today (`assessmentTimeoutMs`); each page has 8 seconds
and 5 MiB; a Worker request may make a bounded number of subrequests, and this
crawl adds at most about 12 (robots, up to two sitemaps, home, up to eight
pages).

## Plan of Work

### Milestone 1 — Discovery and page choice

New module `src/server/site-crawl/discover.ts`:

- `readRobots(origin)`: fetch `/robots.txt` (4 s). 404 or unreadable means
  allowed; parse `User-agent: *` and `ShortList` groups for `Disallow`/`Allow`
  path rules (longest match wins). If the home page is disallowed, the
  assessment stops as `limited / robots_disallowed` with a polite message.
- `readSitemap(origin)`: fetch `/sitemap.xml` (and one nested sitemap if it is
  an index), at most 1 MiB and 500 URLs, same-site only.
- `homeLinks(html, origin)`: `<a href>` values on the home page, same-site,
  with their link text.
- `same-site` follows CSP's rule: the same registrable host, `www.` treated as
  the same, `co.nz`/`com.au`/`co.uk` style suffixes handled.
- Normalise and de-duplicate: drop fragments and queries, trailing slashes,
  files (`.pdf`, images and so on), and region or language copies (a path
  starting with a language or region code from CSP's list plus `nz`, `au`,
  `uk`, `us`, when the same remainder exists without it).
- `typePage(url, linkText)`: page types for small businesses, adapted from
  CSP's `evidence_selection.json`:

  | Type | Path or link words |
  |---|---|
  | services | service, services, what-we-do, solutions, product, products, platform, features, menu, treatments |
  | pricing | pricing, prices, price, plans, rates, fees, packages, quote |
  | about | about, about-us, our-story, team, who-we-are, company |
  | proof | reviews, testimonials, customers, case-studies, stories, clients, portfolio, projects, gallery, work |
  | locations | locations, areas, service-areas, where-we-work, branches, plus a path that matches a place named in the sitemap twice or more |
  | faq | faq, faqs, help, questions |
  | contact | contact, contact-us, book, booking, get-a-quote |
  | skip | blog, news, articles, privacy, terms, legal, cookies, careers, jobs, login, signin, account, cart, checkout, search, tag, category, wp-admin |
  | other | anything else |

- `choosePages(candidates)`: up to eight pages in this priority, with caps:
  home (1), services (3), pricing (1), about (1), proof (1), locations (1),
  faq (1), contact (1), other (only to fill). Within a type, prefer shallower
  paths, then home-page links over sitemap-only URLs, then shorter paths.
- AI page picker (bounded): only when fewer than three pages beyond the home
  page were typed, send Haiku the candidate URLs and link texts (at most 150,
  about 2,000 tokens) with a structured-output schema that returns up to seven
  URLs from that list, each with a type from the table. The picker cannot add
  URLs; anything not in the list is ignored.

### Milestone 2 — Safe multi-page fetch and cleaning

- Reuse `fetchPublicHtml` for every page, unchanged in its safety rules:
  public-domain check on every hop, manual redirects (at most 3), 8 s per page,
  5 MiB, HTML only, the fixed ShortList user agent, no cookies.
- Fetch the chosen pages three at a time, all within the website step's
  budget, raised from 20 s to 25 s. A page that fails is recorded with its
  reason and skipped; the assessment continues if the home page succeeded.
- Back off on 403 and 429: stop fetching further pages from that site.
- New cleaner `src/server/site-crawl/clean.ts`, a port of CSP's
  `extract_visible_text`:
  - skip tags: script, style, noscript, svg, nav, footer, aside, form,
    iframe, template, head;
  - skip elements whose class, id, role or aria-label contains a whole-word
    noise hint (analytics, banner, breadcrumb, consent, cookie, footer, menu,
    modal, nav, newsletter, popup, promotion, search, share, sidebar, social,
    subscribe, tracking, navbar, megamenu), ignoring negated forms such as
    `no-sidebar` (CSP Issue #21);
  - never skip html, body, main or article;
  - keep headings as their own lines so page sections stay visible;
  - keep `<title>`, meta description, OpenGraph title/description, and up to
    ten JSON-LD blocks (the current limits in `website-evidence.ts`).
- Boilerplate: a line of text (20 characters or more) that appears on at
  least half of the fetched pages is removed from all but the home page.
- Thin page: fewer than 200 words after cleaning is marked `thin`.

### Milestone 3 — Page store and budgeted view

Migration `0010_site_crawl_pages.sql`:

- `ALTER TABLE website_sources ADD COLUMN page_type TEXT` (one of the types
  above, or `home`), `discovered_via TEXT` (`home`, `sitemap`, `link`,
  `ai_picker`), `word_count INTEGER`, `text_sha256 TEXT`, `thin INTEGER NOT
  NULL DEFAULT 0`.
- New table `site_crawls`: one row per assessment with `robots_outcome`,
  `sitemap_url_count`, `candidate_count`, `chosen_count`, `fetched_count`,
  `skipped_json` (reason counts), `crawl_version`, `started_at_utc`,
  `finished_at_utc`.
- `visible_text` stores the full cleaned text, up to 20,000 characters per
  page. The legacy `website_evidence.bounded_excerpt` keeps the home page's
  first 1,500 characters so older code and replays still work.

Budgeted view, `src/server/site-crawl/view.ts`: `buildSourceView(sources,
budget)` returns the `website_sources` array the GEO stages already accept,
each with `sourceId`, `sourceUrl`, `pageType`, `title`, `description`,
`visibleText` (cut at the per-page limit) and `jsonLd`. The default budget is
4,000 characters per page and 24,000 in total, filled in the priority order
above. The profile and ICP stages use it; the other stages are unchanged.
Evidence IDs stay limited to the source IDs, so findings can cite the page.

The tool boundary: `crawlSite(domain, deps) → { crawlId, sources, outcome }`
in `src/server/site-crawl/index.ts`, with no knowledge of reports, so a later
work item or agent can call it.

### Milestone 4 — Proof

Run javln.com and lawnrite.co.nz locally (`wrangler dev --local`, fresh local
D1, Claude Haiku 5.5, within the US$20/day development budget) before and
after, and record in this plan for each: pages chosen and their types,
characters stored, characters sent, wait time, tokens and cost, and whether
the profile names the services, areas, pricing and proof that the site shows.
Then Chris compares the two reports per site.

## Concrete Steps

From `apps/web`:

    npm run types && npm run lint && npm run typecheck && npm test && npm run build
    npx wrangler d1 migrations apply shortlist-mvp1 --local --persist-to <scratch>
    npx wrangler dev --local --persist-to <scratch> --port 8799

Each milestone is one or more commits on `issue/89-site-crawl`, with tests
added in the same commit as the code they cover.

## Validation and Acceptance

- Unit tests (no network): robots parsing (allow, disallow, longest match, 404
  and unreadable); sitemap parsing (plain, index, oversize, foreign hosts);
  same-site rules including `co.nz`; region and language copy collapse
  (javln-style `/nz/`, `/au/`); page typing for each row of the table; page
  choice caps and order; cleaner skip tags, noise hints and the `no-sidebar`
  case; boilerplate removal; thin pages; budgeted view limits and order; 403
  and 429 back-off; a page failure that does not fail the assessment.
- AI picker tests: it is called only when typing is weak, it cannot introduce
  a URL, and its output is limited to the type menu.
- Integration: a stored crawl replays to the same report (same sources, same
  text hashes).
- Live proof (Milestone 4) shows, for both sites, more of the business's own
  services, areas, pricing and proof in the profile than before, a total wait
  under 90 seconds, and AI cost under US$0.06 per report.

## Idempotence and Recovery

Migration 0010 only adds columns and a table; it is safe to apply once and
does not touch existing rows. The crawl writes new rows per assessment, so a
retried assessment creates a new crawl rather than editing an old one. If the
crawl misbehaves after deploy, setting the page limit to one restores
today's behaviour (home page only) without a schema change.

## Artifacts and Notes

Measured on 2026-11-01 (curl from Chris's PC):

    javln.com: visible text 5,388 chars (kept today 1,500 = 27%), sitemap 217 URLs
    lawnrite.co.nz: visible text 4,820 chars (kept today 1,500 = 31%), sitemap 197 URLs

## Interfaces and Dependencies

- No new npm dependency is planned: HTML is parsed with the existing
  approach in `website-evidence.ts`, extended; robots.txt and sitemap parsing
  are small, tested functions. If a parser is needed, `HTMLRewriter` (built
  into Workers) is the first choice.
- `crawlSite(domain: string, deps: { fetch, now, createId, database, policy })`
  returns `{ crawlId: string; sources: WebsiteSource[]; outcome: "ok" | "limited"; reasonCode?: string }`.
- `buildSourceView(sources: WebsiteSource[], budget: { perPage: number; total: number })`
  returns the array passed to the profile and ICP stages.
- Deploy, the remote migration and any spend beyond the development budget
  need Chris's OK each time.
