import { describe, expect, it } from "vitest";

import { extractBoundedWebsiteEvidence, type WebsiteEvidenceLimits } from "./website-evidence";

const LIMITS: WebsiteEvidenceLimits = {
  allowedContentTypes: ["text/html", "application/xhtml+xml"],
  maxHtmlBytes: 1_000,
  maxExcerptCharacters: 100,
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
});
