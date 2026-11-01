import { describe, expect, it } from "vitest";

import { extractBoundedWebsiteEvidence, type WebsiteEvidenceLimits } from "./website-evidence";

const LIMITS: WebsiteEvidenceLimits = {
  allowedContentTypes: ["text/html", "application/xhtml+xml"],
  maxHtmlBytes: 1_000,
  maxExcerptCharacters: 100,
  maxJsonLdBlocks: 3,
  maxJsonLdCharacters: 300,
};

const VALID_RESPONSE = {
  sourceUrl: "https://harbourhandyman.example.nz/",
  observedAtUtc: "2026-10-05T06:00:00.000Z",
  status: 200,
  contentType: "text/html; charset=utf-8",
  html: `
    <html><head>
      <title>Harbour Handywork</title>
      <meta name="description" content="Auckland &amp; North Shore repairs">
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"LocalBusiness","name":"Harbour Handywork"}
      </script>
      <script>window.location = "https://not-used.example";</script>
      <style>body { display: none; }</style>
    </head><body><h1>Reliable home repairs</h1><p>Book a local handyman.</p></body></html>
  `,
};

describe("extractBoundedWebsiteEvidence", () => {
  it("returns inert, bounded public-page evidence without executing content", () => {
    const result = extractBoundedWebsiteEvidence(VALID_RESPONSE, LIMITS);

    expect(result).toEqual({
      kind: "captured",
      sourceUrl: "https://harbourhandyman.example.nz/",
      observedAtUtc: "2026-10-05T06:00:00.000Z",
      contentType: "text/html",
      title: "Harbour Handywork",
      description: "Auckland & North Shore repairs",
      excerpt: "Harbour Handywork Reliable home repairs Book a local handyman.",
      text: "Harbour Handywork Reliable home repairs Book a local handyman.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Harbour Handywork",
        },
      ],
    });
  });

  it.each([
    [{ ...VALID_RESPONSE, status: 403 }, "site_unreadable"],
    [{ ...VALID_RESPONSE, contentType: "image/png" }, "content_rejected"],
    [{ ...VALID_RESPONSE, html: "x".repeat(1_001) }, "size_limit_exceeded"],
    [
      { ...VALID_RESPONSE, html: "<html><body><script>ignored()</script></body></html>" },
      "evidence_insufficient",
    ],
  ])("returns a safe limited outcome %#", (response, reasonCode) => {
    expect(extractBoundedWebsiteEvidence(response, LIMITS)).toEqual({
      kind: "limited",
      reasonCode,
    });
  });

  it("fails closed when a caller supplies an invalid bound", () => {
    expect(extractBoundedWebsiteEvidence(VALID_RESPONSE, { ...LIMITS, maxHtmlBytes: 0 })).toEqual({
      kind: "limited",
      reasonCode: "content_rejected",
    });
  });

  it("retains only bounded, valid JSON-LD without treating it as executable content", () => {
    const result = extractBoundedWebsiteEvidence(
      {
        ...VALID_RESPONSE,
        html: `<title>Example</title><h1>Useful text</h1>
          <script type="application/ld+json">{"@type":"LocalBusiness","name":"Example"}</script>
          <script type="application/ld+json">not json</script>
          <script>window.runUntrustedCode()</script>`,
      },
      { ...LIMITS, maxJsonLdCharacters: 100 },
    );

    expect(result).toMatchObject({
      kind: "captured",
      jsonLd: [{ "@type": "LocalBusiness", name: "Example" }],
    });
  });

  it("drops navigation, footers, side panels and forms (CSP skip list) and keeps the copy", () => {
    const result = extractBoundedWebsiteEvidence(
      {
        ...VALID_RESPONSE,
        html: `<header><h1>Hedge trimming in Whangarei</h1></header>
          <nav><a href="/">Home</a><a href="/about">About us</a></nav>
          <main><p>We trim hedges up to four metres.</p></main>
          <aside>Subscribe to our newsletter</aside>
          <form><input name="email">Get a quote</form>
          <footer>Copyright 2026 All rights reserved</footer>`,
      },
      { ...LIMITS, maxHtmlBytes: 5_000, maxTextCharacters: 1_000 },
    );

    expect(result).toMatchObject({
      kind: "captured",
      text: "Hedge trimming in Whangarei We trim hedges up to four metres.",
    });
  });

  it("caps the title and description, and keeps longer text than the excerpt", () => {
    const result = extractBoundedWebsiteEvidence(
      {
        ...VALID_RESPONSE,
        html: `<title>${"T".repeat(400)}</title>
          <meta name="description" content="${"D".repeat(900)}">
          <p>${"word ".repeat(100)}</p>`,
      },
      { ...LIMITS, maxHtmlBytes: 5_000, maxExcerptCharacters: 20, maxTextCharacters: 300 },
    );

    expect(result.kind).toBe("captured");
    if (result.kind !== "captured") return;
    expect(result.title).toHaveLength(200);
    expect(result.description).toHaveLength(500);
    expect(result.excerpt.length).toBeLessThanOrEqual(20);
    expect(result.text.length).toBeGreaterThan(20);
    expect(result.text.length).toBeLessThanOrEqual(300);
  });
});
