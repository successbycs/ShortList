import { describe, expect, it, vi } from "vitest";

import {
  fetchPublicHtml,
  MVP1_SAFE_FETCH_POLICY,
  type FetchImplementation,
  type SafeFetchPolicy,
} from "./safe-website-fetch";

function response(html: string, init: ResponseInit = {}): Response {
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
    ...init,
  });
}

function fixtureFetch(...responses: Response[]): FetchImplementation {
  return vi.fn().mockImplementation(async () => responses.shift() ?? response(""));
}

describe("fetchPublicHtml", () => {
  it("uses manual redirects, re-validates destinations and returns bounded HTML", async () => {
    const transport = fixtureFetch(
      response("", { status: 302, headers: { location: "/welcome" } }),
      response("<h1>Welcome</h1>"),
    );

    const result = await fetchPublicHtml(
      "https://harbourhandyman.co.nz",
      MVP1_SAFE_FETCH_POLICY,
      transport,
    );

    expect(result).toEqual({
      kind: "fetched",
      finalUrl: "https://harbourhandyman.co.nz/welcome",
      contentType: "text/html",
      html: "<h1>Welcome</h1>",
      redirectCount: 1,
    });
    expect(transport).toHaveBeenNthCalledWith(
      1,
      new URL("https://harbourhandyman.co.nz/"),
      expect.objectContaining({ redirect: "manual", cache: "no-store" }),
    );
  });

  it.each([
    ["https://127.0.0.1", "unsafe_target"],
    ["not-a-url", "unsafe_target"],
  ])("refuses unsafe starting targets before calling fetch", async (url, reasonCode) => {
    const transport = fixtureFetch(response("unused"));

    await expect(fetchPublicHtml(url, MVP1_SAFE_FETCH_POLICY, transport)).resolves.toEqual({
      kind: "limited",
      reasonCode,
    });
    expect(transport).not.toHaveBeenCalled();
  });

  it("refuses an unsafe redirect without following it", async () => {
    const transport = fixtureFetch(
      response("", { status: 302, headers: { location: "http://127.0.0.1/admin" } }),
    );

    await expect(
      fetchPublicHtml("https://harbourhandyman.co.nz", MVP1_SAFE_FETCH_POLICY, transport),
    ).resolves.toEqual({ kind: "limited", reasonCode: "unsafe_redirect" });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("enforces content and streamed-body limits", async () => {
    await expect(
      fetchPublicHtml(
        "https://harbourhandyman.co.nz",
        MVP1_SAFE_FETCH_POLICY,
        fixtureFetch(response("pdf", { headers: { "content-type": "application/pdf" } })),
      ),
    ).resolves.toEqual({ kind: "limited", reasonCode: "content_rejected" });

    const smallPolicy: SafeFetchPolicy = { ...MVP1_SAFE_FETCH_POLICY, maxHtmlBytesPerPage: 3 };
    await expect(
      fetchPublicHtml("https://harbourhandyman.co.nz", smallPolicy, fixtureFetch(response("four"))),
    ).resolves.toEqual({ kind: "limited", reasonCode: "size_limit_exceeded" });
  });

  it("fails closed for an excessive redirect chain", async () => {
    const policy: SafeFetchPolicy = { ...MVP1_SAFE_FETCH_POLICY, maxRedirects: 1 };
    const transport = fixtureFetch(
      response("", { status: 302, headers: { location: "/one" } }),
      response("", { status: 302, headers: { location: "/two" } }),
    );

    await expect(
      fetchPublicHtml("https://harbourhandyman.co.nz", policy, transport),
    ).resolves.toEqual({
      kind: "limited",
      reasonCode: "unsafe_redirect",
    });
  });
});
