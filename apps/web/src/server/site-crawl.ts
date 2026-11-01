import type { GeoEvidenceSource } from "./geo-assessment-types";
import {
  fetchPublicHtml,
  MVP1_SAFE_FETCH_POLICY,
  type FetchImplementation,
  type SafeFetchPolicy,
} from "./safe-website-fetch";
import { extractBoundedWebsiteEvidence, type JsonValue } from "./website-evidence";

/**
 * Reads a few key pages of a business website after its home page, using the
 * CSP-Directory crawler's method: find pages in the sitemap and the home
 * page's links, choose them by words in their address, and clean them. Every
 * request uses the existing safe fetch. A failure here never fails the
 * assessment; the report simply has fewer pages.
 */

export type PageType = "home" | "services" | "pricing" | "about" | "proof" | "locations" | "other";

export type CrawledPage = {
  url: string;
  pageType: PageType;
  observedAtUtc: string;
  contentType: string;
  title: string | null;
  description: string | null;
  /** Cleaned page text kept for storage (up to 10,000 characters). */
  text: string;
  jsonLd: readonly JsonValue[];
};

export const CRAWL_LIMITS = {
  /** Pages read after the home page. */
  maxExtraPages: 5,
  /** No new request starts after this long. */
  crawlTimeMs: 20_000,
  pageTimeoutMs: 8_000,
  concurrency: 3,
  maxSitemapUrls: 500,
  maxHomeLinks: 300,
  maxUrlLength: 200,
  discoveryBytes: 1_024 * 1_024,
  storedTextCharacters: 10_000,
  jsonLdCharactersPerPage: 4_000,
} as const;

/** What the profile and ICP steps read: per-page text limits and a total cap. */
export const VIEW_LIMITS = {
  homeTextCharacters: 4_000,
  pageTextCharacters: 3_000,
  totalSerialisedCharacters: 45_000,
  urlCharacters: 500,
} as const;

const HTML_TYPES = ["text/html", "application/xhtml+xml"];
const TEXT_TYPES = ["text/plain", "application/xml", "text/xml"];

// Words in a path or link text, checked in this order; the first match wins.
const PAGE_TYPE_WORDS: readonly (readonly [PageType | "skip", readonly string[]])[] = [
  [
    "skip",
    [
      "blog",
      "news",
      "articles",
      "privacy",
      "terms",
      "legal",
      "cookies",
      "careers",
      "jobs",
      "login",
      "signin",
      "account",
      "cart",
      "checkout",
      "search",
      "tag",
      "category",
      "feed",
      "wp-admin",
    ],
  ],
  ["pricing", ["pricing", "prices", "price", "rates", "fees", "packages", "plans"]],
  [
    "proof",
    [
      "reviews",
      "testimonials",
      "customers",
      "case-studies",
      "stories",
      "clients",
      "portfolio",
      "projects",
      "gallery",
    ],
  ],
  ["locations", ["locations", "areas", "service-areas", "where-we-work", "branches"]],
  ["about", ["about", "about-us", "our-story", "team", "who-we-are", "company"]],
  [
    "services",
    [
      "services",
      "service",
      "what-we-do",
      "solutions",
      "products",
      "product",
      "features",
      "menu",
      "treatments",
    ],
  ],
];

const PAGE_CAPS: Readonly<Record<Exclude<PageType, "home" | "other">, number>> = {
  services: 2,
  pricing: 1,
  about: 1,
  proof: 1,
  locations: 1,
};

// Language and region prefixes whose pages usually copy the main site.
const LOCALE_PREFIXES = new Set([
  "en",
  "en-us",
  "en-gb",
  "en-au",
  "en-nz",
  "es",
  "de",
  "fr",
  "pt",
  "pt-br",
  "it",
  "nl",
  "ja",
  "ko",
  "zh",
  "zh-cn",
  "zh-tw",
  "nz",
  "au",
  "uk",
  "us",
  "ca",
  "sg",
]);

const FILE_EXTENSION =
  /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|docx?|xlsx?|pptx?|mp3|mp4|mov|css|js|json|xml|txt)$/i;

type Candidate = { url: string; path: string; linkText: string; fromHome: boolean; order: number };

export type CrawlDependencies = {
  fetchImplementation: FetchImplementation;
  now?: () => Date;
};

export async function crawlSite(
  homeUrl: string,
  homeHtml: string,
  dependencies: CrawlDependencies,
): Promise<CrawledPage[]> {
  const now = dependencies.now ?? (() => new Date());
  const startedAt = Date.now();
  const remainingMs = () => CRAWL_LIMITS.crawlTimeMs - (Date.now() - startedAt);
  let home: URL;
  try {
    home = new URL(homeUrl);
  } catch {
    return [];
  }
  const fetchText = (url: string, allowedContentTypes: readonly string[], maxBytes: number) =>
    safeFetch(
      url,
      home,
      allowedContentTypes,
      maxBytes,
      remainingMs(),
      dependencies.fetchImplementation,
    );

  try {
    const robots = await fetchText(
      new URL("/robots.txt", home).toString(),
      TEXT_TYPES,
      CRAWL_LIMITS.discoveryBytes,
    );
    const disallowed = robots === undefined ? [] : robotsDisallowRules(robots.body);

    const sitemapUrls = await readSitemap(home, fetchText);
    const candidates = collectCandidates(home, homeHtml, sitemapUrls).filter(
      (candidate) => !isDisallowed(candidate.path, disallowed),
    );
    const chosen = choosePages(candidates);

    const pages: CrawledPage[] = [];
    for (let index = 0; index < chosen.length; index += CRAWL_LIMITS.concurrency) {
      if (remainingMs() <= 0) break;
      const batch = chosen.slice(index, index + CRAWL_LIMITS.concurrency);
      const results = await Promise.all(
        batch.map(async ({ candidate, pageType }) => {
          const fetched = await fetchText(
            candidate.url,
            HTML_TYPES,
            MVP1_SAFE_FETCH_POLICY.maxHtmlBytesPerPage,
          );
          if (fetched === undefined) return undefined;
          return toCrawledPage(fetched.finalUrl, fetched.contentType, fetched.body, pageType, now);
        }),
      );
      for (const page of results) if (page !== undefined) pages.push(page);
    }
    return pages;
  } catch {
    // A crawl problem must never fail an assessment whose home page succeeded.
    return [];
  }
}

async function safeFetch(
  url: string,
  home: URL,
  allowedContentTypes: readonly string[],
  maxBytes: number,
  remainingMs: number,
  fetchImplementation: FetchImplementation,
): Promise<{ finalUrl: string; contentType: string; body: string } | undefined> {
  const timeLeft = Math.floor(remainingMs);
  if (timeLeft <= 0) return undefined;
  // Same-site check before the first request, not only on redirects.
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return undefined;
  }
  if (!isSameSite(target, home)) return undefined;
  const policy: SafeFetchPolicy = {
    ...MVP1_SAFE_FETCH_POLICY,
    allowedContentTypes,
    maxHtmlBytesPerPage: maxBytes,
    pageTimeoutMs: Math.min(CRAWL_LIMITS.pageTimeoutMs, timeLeft),
    assessmentTimeoutMs: timeLeft,
    maxRedirects: 1,
  };
  const result = await fetchPublicHtml(url, policy, fetchImplementation, {
    isAllowedRedirect: (target) => isSameSite(target, home),
  });
  if (result.kind !== "fetched" || !isSameSite(new URL(result.finalUrl), home)) return undefined;
  return { finalUrl: result.finalUrl, contentType: result.contentType, body: result.html };
}

function toCrawledPage(
  url: string,
  contentType: string,
  html: string,
  pageType: PageType,
  now: () => Date,
): CrawledPage | undefined {
  const observedAtUtc = now().toISOString();
  const extracted = extractBoundedWebsiteEvidence(
    { sourceUrl: url, observedAtUtc, status: 200, contentType, html },
    {
      allowedContentTypes: HTML_TYPES,
      maxHtmlBytes: MVP1_SAFE_FETCH_POLICY.maxHtmlBytesPerPage,
      maxExcerptCharacters: VIEW_LIMITS.pageTextCharacters,
      maxTextCharacters: CRAWL_LIMITS.storedTextCharacters,
      maxJsonLdBlocks: 10,
      maxJsonLdCharacters: CRAWL_LIMITS.jsonLdCharactersPerPage,
    },
  );
  if (extracted.kind !== "captured") return undefined;
  return {
    url,
    pageType,
    observedAtUtc,
    contentType: extracted.contentType,
    title: extracted.title ?? null,
    description: extracted.description ?? null,
    text: extracted.text,
    jsonLd: extracted.jsonLd,
  };
}

/** The exact host or its `www.` twin. Never sibling hosts on shared domains. */
export function isSameSite(url: URL, home: URL): boolean {
  const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");
  return (
    (url.protocol === "https:" || url.protocol === "http:") &&
    url.username === "" &&
    url.password === "" &&
    bare(url.hostname) === bare(home.hostname)
  );
}

/**
 * Plain `Disallow` path prefixes from the `User-agent: *` group. Rules with
 * wildcards or end markers are ignored in this MVP (full robots.txt rules are
 * Version 2 work).
 */
export function robotsDisallowRules(text: string): string[] {
  const rules: string[] = [];
  let agents: string[] = [];
  let inRules = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === "user-agent") {
      if (inRules) {
        agents = [];
        inRules = false;
      }
      agents.push(value.toLowerCase());
    } else if (key === "disallow" || key === "allow") {
      inRules = true;
      if (
        key === "disallow" &&
        agents.includes("*") &&
        value.startsWith("/") &&
        !/[*$]/.test(value)
      ) {
        rules.push(value);
      }
    }
  }
  return rules;
}

function isDisallowed(path: string, rules: readonly string[]): boolean {
  return rules.some((rule) => path.startsWith(rule) || `${path}/`.startsWith(rule));
}

async function readSitemap(
  home: URL,
  fetchText: (
    url: string,
    types: readonly string[],
    maxBytes: number,
  ) => Promise<{ body: string } | undefined>,
): Promise<string[]> {
  const sitemap = await fetchText(
    new URL("/sitemap.xml", home).toString(),
    TEXT_TYPES,
    CRAWL_LIMITS.discoveryBytes,
  );
  if (sitemap === undefined) return [];
  if (/<sitemapindex\b/i.test(sitemap.body)) {
    // One child sitemap only: enough to find a small business's main pages.
    const child = sitemapLocations(sitemap.body)[0];
    if (child === undefined) return [];
    const childSitemap = await fetchText(child, TEXT_TYPES, CRAWL_LIMITS.discoveryBytes);
    return childSitemap === undefined ? [] : sitemapLocations(childSitemap.body);
  }
  return sitemapLocations(sitemap.body);
}

export function sitemapLocations(xml: string): string[] {
  const locations: string[] = [];
  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    if (locations.length >= CRAWL_LIMITS.maxSitemapUrls) break;
    locations.push((match[1] ?? "").replace(/&amp;/g, "&"));
  }
  return locations;
}

function homeLinks(html: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    if (links.length >= CRAWL_LIMITS.maxHomeLinks) break;
    const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(match[1] ?? "");
    const value = href?.[1] ?? href?.[2] ?? href?.[3];
    if (value === undefined) continue;
    const text = (match[2] ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    links.push({ href: value, text: text.slice(0, 80) });
  }
  return links;
}

/** Same-site page addresses, without queries, fragments, files or locale copies. */
export function collectCandidates(
  home: URL,
  homeHtml: string,
  sitemapUrls: readonly string[],
): Candidate[] {
  const byPath = new Map<string, Candidate>();
  let order = 0;
  const add = (raw: string, linkText: string, fromHome: boolean) => {
    let url: URL;
    try {
      url = new URL(raw, home);
    } catch {
      return;
    }
    if (!isSameSite(url, home)) return;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/" || FILE_EXTENSION.test(path) || url.href.length > CRAWL_LIMITS.maxUrlLength)
      return;
    const key = path.toLowerCase();
    const existing = byPath.get(key);
    if (existing !== undefined) {
      if (fromHome && !existing.fromHome) byPath.set(key, { ...existing, fromHome, linkText });
      return;
    }
    byPath.set(key, { url: `${url.origin}${path}`, path: key, linkText, fromHome, order: order++ });
  };
  for (const link of homeLinks(homeHtml)) add(link.href, link.text, true);
  for (const url of sitemapUrls) add(url, "", false);

  return [...byPath.values()].filter((candidate) => {
    const [first, ...rest] = candidate.path.split("/").filter(Boolean);
    if (first === undefined || !LOCALE_PREFIXES.has(first)) return true;
    const remainder = `/${rest.join("/")}`;
    return !(remainder === "/" || byPath.has(remainder));
  });
}

/**
 * A page's type from the words in its address; the link text is used only
 * when the address says nothing, because menu and image links can carry
 * unrelated words.
 */
export function typePage(path: string, linkText: string): PageType | "skip" | undefined {
  const segments = path.split("/").filter(Boolean);
  const pathWords = new Set([
    ...segments,
    ...segments.flatMap((segment) => segment.split(/[-_.]/)),
  ]);
  const textWords = new Set(
    linkText
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(Boolean),
  );
  return matchType(pathWords) ?? matchType(textWords);
}

function matchType(words: ReadonlySet<string>): PageType | "skip" | undefined {
  for (const [type, list] of PAGE_TYPE_WORDS) {
    if (list.some((word) => words.has(word))) return type;
  }
  return undefined;
}

/**
 * Up to five pages: services 2, pricing, about, proof and locations 1 each,
 * then other home-page links in page order. Shallow, home-linked, short paths
 * come first, so the same site always gives the same pages.
 */
export function choosePages(
  candidates: readonly Candidate[],
): { candidate: Candidate; pageType: PageType }[] {
  const depth = (candidate: Candidate) => candidate.path.split("/").filter(Boolean).length;
  const ranked = [...candidates].sort(
    (a, b) =>
      depth(a) - depth(b) ||
      Number(b.fromHome) - Number(a.fromHome) ||
      a.path.length - b.path.length ||
      a.path.localeCompare(b.path),
  );
  const chosen: { candidate: Candidate; pageType: PageType }[] = [];
  const untyped: Candidate[] = [];
  const counts = new Map<PageType, number>();
  for (const type of ["services", "pricing", "about", "proof", "locations"] as const) {
    for (const candidate of ranked) {
      if ((counts.get(type) ?? 0) >= PAGE_CAPS[type]) break;
      if (typePage(candidate.path, candidate.linkText) === type) {
        chosen.push({ candidate, pageType: type });
        counts.set(type, (counts.get(type) ?? 0) + 1);
      }
    }
  }
  for (const candidate of [...candidates].sort((a, b) => a.order - b.order)) {
    if (
      candidate.fromHome &&
      depth(candidate) === 1 &&
      typePage(candidate.path, candidate.linkText) === undefined
    ) {
      untyped.push(candidate);
    }
  }
  for (const candidate of untyped) {
    if (chosen.length >= CRAWL_LIMITS.maxExtraPages) break;
    chosen.push({ candidate, pageType: "other" });
  }
  return chosen.slice(0, CRAWL_LIMITS.maxExtraPages);
}

/**
 * The website pages sent to the profile and ICP steps: the home page cut to
 * 4,000 characters of text and other pages to 3,000, then a 45,000-character
 * cap on the whole serialised input. Over the cap, JSON-LD is dropped from the
 * extra pages first, then the last (lowest-priority) pages. The home page is
 * always kept.
 */
export function buildSourceView(sources: readonly GeoEvidenceSource[]): GeoEvidenceSource[] {
  const view = sources.map((source, index) => ({
    ...source,
    sourceUrl: source.sourceUrl.slice(0, VIEW_LIMITS.urlCharacters),
    visibleText: source.visibleText.slice(
      0,
      index === 0 ? VIEW_LIMITS.homeTextCharacters : VIEW_LIMITS.pageTextCharacters,
    ),
  }));
  const size = () => JSON.stringify(view).length;
  for (
    let index = view.length - 1;
    index > 0 && size() > VIEW_LIMITS.totalSerialisedCharacters;
    index--
  ) {
    view[index] = { ...view[index]!, jsonLd: [] };
  }
  while (view.length > 1 && size() > VIEW_LIMITS.totalSerialisedCharacters) view.pop();
  // The home page alone must also fit: drop its JSON-LD, then cut its text.
  if (size() > VIEW_LIMITS.totalSerialisedCharacters && view[0] !== undefined) {
    view[0] = { ...view[0], jsonLd: [] };
    const excess = size() - VIEW_LIMITS.totalSerialisedCharacters;
    if (excess > 0) {
      view[0] = {
        ...view[0],
        visibleText: view[0].visibleText.slice(0, Math.max(0, view[0].visibleText.length - excess)),
      };
    }
  }
  return view;
}
