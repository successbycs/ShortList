import { describe, expect, it, vi } from "vitest";

import type { GeoEvidenceSource } from "./geo-assessment-types";
import {
  buildSourceView,
  choosePages,
  collectCandidates,
  crawlSite,
  isSameSite,
  robotsDisallowRules,
  sitemapLocations,
  typePage,
  VIEW_LIMITS,
} from "./site-crawl";

const HOME = new URL("https://www.example.co.nz/");

const HOME_HTML = `<html><body>
  <nav><a href="/services">Our services</a><a href="/about-us">About</a>
  <a href="/pricing">Prices</a><a href="/blog">Blog</a><a href="/contact">Contact</a></nav>
  <a href="https://other-site.example/services">Partner</a>
  <a href="/brochure.pdf">Brochure</a>
  <a href="/services?ref=home#top">Services again</a>
</body></html>`;

function page(body: string, contentType = "text/html") {
  return new Response(body, { status: 200, headers: { "content-type": contentType } });
}

/** A fake website: path → response factory. Unknown paths are 404. */
function fakeSite(routes: Record<string, () => Response>) {
  return vi.fn(async (url: URL) =>
    (routes[url.pathname] ?? (() => new Response("", { status: 404 })))(),
  );
}

describe("site crawl: finding and choosing pages", () => {
  it("treats only the exact host and its www twin as the same site", () => {
    expect(isSameSite(new URL("https://example.co.nz/a"), HOME)).toBe(true);
    expect(isSameSite(new URL("http://www.example.co.nz/a"), HOME)).toBe(true);
    expect(isSameSite(new URL("https://shop.example.co.nz/a"), HOME)).toBe(false);
    expect(isSameSite(new URL("https://user:pw@www.example.co.nz/a"), HOME)).toBe(false);
    expect(
      isSameSite(new URL("https://other.wixsite.com/x"), new URL("https://mine.wixsite.com/")),
    ).toBe(false);
  });

  it("reads plain Disallow prefixes for all bots and ignores other groups and wildcards", () => {
    const rules = robotsDisallowRules(`
      User-agent: Googlebot
      Disallow: /google-only
      User-agent: *
      Disallow: /admin
      Disallow: /*.pdf$
      Allow: /admin/public
      # Disallow: /commented
    `);
    expect(rules).toEqual(["/admin"]);
  });

  it("reads sitemap locations, capped", () => {
    expect(
      sitemapLocations(
        "<urlset><url><loc> https://example.co.nz/a?x=1&amp;y=2 </loc></url></urlset>",
      ),
    ).toEqual(["https://example.co.nz/a?x=1&y=2"]);
    const many = Array.from({ length: 600 }, (_, i) => `<loc>https://e.nz/${i}</loc>`).join("");
    expect(sitemapLocations(many)).toHaveLength(500);
  });

  it("keeps same-site pages only, drops files, queries and locale copies", () => {
    const candidates = collectCandidates(HOME, HOME_HTML, [
      "https://example.co.nz/nz/services",
      "https://example.co.nz/au/pricing",
      "https://example.co.nz/au/only-in-australia",
      "https://example.co.nz/our-locations",
    ]);
    const paths = candidates.map((candidate) => candidate.path).sort();
    expect(paths).toEqual([
      "/about-us",
      "/au/only-in-australia",
      "/blog",
      "/contact",
      "/our-locations",
      "/pricing",
      "/services",
    ]);
    expect(candidates.find((c) => c.path === "/services")?.fromHome).toBe(true);
  });

  it.each([
    ["/services/hedge-trimming", "", "services"],
    ["/what-we-do", "", "services"],
    ["/pricing", "", "pricing"],
    ["/x", "Our prices", "pricing"],
    ["/case-studies", "", "proof"],
    ["/reviews", "", "proof"],
    ["/service-areas", "", "locations"],
    ["/our-locations", "", "locations"],
    ["/about-us", "", "about"],
    ["/blog/pricing-tips", "", "skip"],
    ["/privacy", "", "skip"],
    ["/whangarei", "", undefined],
    ["/franchises-for-sale", "Customer reviews", "proof"],
    ["/pricing", "Read our customer reviews", "pricing"],
  ])("types %s (%s) as %s", (path, text, expected) => {
    expect(typePage(path, text)).toBe(expected);
  });

  it("chooses up to five pages by type and caps, the same whatever the input order", () => {
    const candidates = collectCandidates(HOME, HOME_HTML, [
      "https://example.co.nz/services/mowing",
      "https://example.co.nz/services/hedges",
      "https://example.co.nz/reviews",
      "https://example.co.nz/our-locations",
      "https://example.co.nz/privacy",
    ]);
    const pick = (list: typeof candidates) =>
      choosePages(list).map(({ candidate, pageType }) => `${pageType}:${candidate.path}`);

    const chosen = pick(candidates);
    expect(chosen).toEqual([
      "services:/services",
      "services:/services/hedges",
      "pricing:/pricing",
      "about:/about-us",
      "proof:/reviews",
    ]);
    expect(pick([...candidates].reverse())).toEqual(chosen);
  });

  it("fills spare places with other home-page links in page order", () => {
    const html = `<a href="/lawn-mowing">Lawn mowing</a><a href="/contact">Contact</a><a href="/blog">Blog</a>`;
    const chosen = choosePages(collectCandidates(HOME, html, []));
    expect(chosen.map(({ candidate, pageType }) => `${pageType}:${candidate.path}`)).toEqual([
      "other:/lawn-mowing",
      "other:/contact",
    ]);
  });
});

describe("site crawl: fetching", () => {
  it("fetches the chosen pages, respects robots.txt and skips failed pages", async () => {
    const fetchImplementation = fakeSite({
      "/robots.txt": () => page("User-agent: *\nDisallow: /pricing", "text/plain"),
      "/sitemap.xml": () =>
        page(
          "<urlset><url><loc>https://www.example.co.nz/reviews</loc></url></urlset>",
          "application/xml",
        ),
      "/services": () => page("<main><h1>Services</h1><p>Lawn mowing and hedges.</p></main>"),
      "/about-us": () => new Response("", { status: 500 }),
      "/reviews": () => page("<p>Five stars from 40 customers.</p><footer>Copyright</footer>"),
    });

    const pages = await crawlSite(HOME.toString(), HOME_HTML, { fetchImplementation });

    expect(pages.map((p) => [p.pageType, new URL(p.url).pathname, p.text])).toEqual([
      ["services", "/services", "Services Lawn mowing and hedges."],
      ["proof", "/reviews", "Five stars from 40 customers."],
    ]);
    const requested = fetchImplementation.mock.calls.map(([url]) => url.pathname);
    expect(requested).not.toContain("/pricing");
  });

  it("rejects a redirect to another site before requesting it", async () => {
    const fetchImplementation = fakeSite({
      "/services": () =>
        new Response("", { status: 302, headers: { location: "https://evil.example/steal" } }),
    });

    const pages = await crawlSite(HOME.toString(), `<a href="/services">Services</a>`, {
      fetchImplementation,
    });

    expect(pages).toEqual([]);
    expect(fetchImplementation.mock.calls.map(([url]) => url.hostname)).not.toContain(
      "evil.example",
    );
  });

  it("never throws, and returns nothing when the crawl itself fails", async () => {
    const fetchImplementation = vi.fn(async () => {
      throw new Error("network down");
    });
    await expect(crawlSite(HOME.toString(), HOME_HTML, { fetchImplementation })).resolves.toEqual(
      [],
    );
  });

  it("starts no new request after the crawl time limit", async () => {
    vi.useFakeTimers();
    try {
      const fetchImplementation = vi.fn(async (url: URL) => {
        vi.setSystemTime(Date.now() + 25_000); // the first request takes "25 s"
        return url.pathname === "/robots.txt"
          ? page("", "text/plain")
          : new Response("", { status: 404 });
      });
      await crawlSite(HOME.toString(), HOME_HTML, { fetchImplementation });
      expect(fetchImplementation).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("site crawl: the view sent to the AI", () => {
  const source = (index: number, text: string, jsonLd: unknown[] = []): GeoEvidenceSource => ({
    sourceId: `s${index}`,
    sourceUrl: `https://example.co.nz/${index}`,
    observedAtUtc: "2026-11-01T00:00:00.000Z",
    title: "t",
    description: "d",
    visibleText: text,
    jsonLd,
  });

  it("cuts the home page to 4,000 characters and other pages to 3,000", () => {
    const view = buildSourceView([source(0, "h".repeat(9_000)), source(1, "p".repeat(9_000))]);
    expect(view[0]?.visibleText).toHaveLength(VIEW_LIMITS.homeTextCharacters);
    expect(view[1]?.visibleText).toHaveLength(VIEW_LIMITS.pageTextCharacters);
  });

  it("keeps the whole input under 45,000 characters: JSON-LD first, then the last pages", () => {
    const bigJson = [{ blob: "j".repeat(3_900) }];
    const sources = Array.from({ length: 20 }, (_, i) => source(i, "x".repeat(3_000), bigJson));
    const view = buildSourceView(sources);

    expect(JSON.stringify(view).length).toBeLessThanOrEqual(VIEW_LIMITS.totalSerialisedCharacters);
    expect(view[0]?.sourceId).toBe("s0");
    expect(view[0]?.jsonLd).toEqual(bigJson);
    expect(view[1]?.jsonLd).toEqual([]);
    expect(view.length).toBeLessThan(20);
  });
});
