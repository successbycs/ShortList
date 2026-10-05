import { admitPublicDomain } from "./domain-admission";

export const MVP1_SAFE_FETCH_POLICY = {
  maxPagesPerAssessment: 3,
  allowedContentTypes: ["text/html", "application/xhtml+xml"],
  maxHtmlBytesPerPage: 1_048_576,
  pageTimeoutMs: 8_000,
  assessmentTimeoutMs: 20_000,
  maxRedirects: 3,
} as const;

export type SafeFetchPolicy = {
  maxPagesPerAssessment: number;
  allowedContentTypes: readonly string[];
  maxHtmlBytesPerPage: number;
  pageTimeoutMs: number;
  assessmentTimeoutMs: number;
  maxRedirects: number;
};

export type SafeFetchResult =
  | {
      kind: "fetched";
      finalUrl: string;
      contentType: string;
      html: string;
      redirectCount: number;
    }
  | { kind: "limited"; reasonCode: SafeFetchReasonCode };

export type SafeFetchReasonCode =
  | "unsafe_target"
  | "unsafe_redirect"
  | "site_unreadable"
  | "content_rejected"
  | "size_limit_exceeded"
  | "timeout";

export type FetchImplementation = (input: URL, init: RequestInit) => Promise<Response>;

/**
 * Fetches one public HTML page under the approved MVP 1 controls.
 *
 * The Worker platform provides the public-outbound boundary. This code adds
 * syntactic host validation, manual redirect checks, timeout and bounded body
 * reading. It deliberately accepts an injectable transport for local tests.
 */
export async function fetchPublicHtml(
  startUrl: string,
  policy: SafeFetchPolicy = MVP1_SAFE_FETCH_POLICY,
  fetchImplementation: FetchImplementation = fetch,
): Promise<SafeFetchResult> {
  if (!isValidPolicy(policy)) {
    return limited("content_rejected");
  }

  let currentUrl: URL;
  try {
    currentUrl = new URL(startUrl);
  } catch {
    return limited("unsafe_target");
  }

  if (admitPublicDomain(currentUrl.toString()).kind !== "accepted") {
    return limited("unsafe_target");
  }

  const assessmentDeadline = Date.now() + policy.assessmentTimeoutMs;
  let redirectCount = 0;

  while (true) {
    const remainingMs = assessmentDeadline - Date.now();
    if (remainingMs <= 0) {
      return limited("timeout");
    }

    const result = await fetchOne(
      currentUrl,
      Math.min(policy.pageTimeoutMs, remainingMs),
      fetchImplementation,
    );
    if (result.kind === "limited") {
      return result;
    }

    if (isRedirectStatus(result.response.status)) {
      if (redirectCount >= policy.maxRedirects) {
        return limited("unsafe_redirect");
      }

      const location = result.response.headers.get("location");
      if (location === null) {
        return limited("site_unreadable");
      }

      let redirectUrl: URL;
      try {
        redirectUrl = new URL(location, currentUrl);
      } catch {
        return limited("unsafe_redirect");
      }

      if (admitPublicDomain(redirectUrl.toString()).kind !== "accepted") {
        return limited("unsafe_redirect");
      }

      currentUrl = redirectUrl;
      redirectCount += 1;
      continue;
    }

    if (!result.response.ok) {
      return limited("site_unreadable");
    }

    const contentType = normaliseContentType(result.response.headers.get("content-type"));
    if (contentType === undefined || !policy.allowedContentTypes.includes(contentType)) {
      return limited("content_rejected");
    }

    const body = await readBoundedText(result.response, policy.maxHtmlBytesPerPage);
    if (body.kind === "limited") {
      return body;
    }

    return {
      kind: "fetched",
      finalUrl: currentUrl.toString(),
      contentType,
      html: body.html,
      redirectCount,
    };
  }
}

async function fetchOne(
  url: URL,
  timeoutMs: number,
  fetchImplementation: FetchImplementation,
): Promise<
  { kind: "response"; response: Response } | { kind: "limited"; reasonCode: SafeFetchReasonCode }
> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImplementation(url, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      headers: { Accept: "text/html, application/xhtml+xml" },
      signal: controller.signal,
    });
    return { kind: "response", response };
  } catch (error) {
    return limited(
      isAbortError(error) || controller.signal.aborted ? "timeout" : "site_unreadable",
    );
  } finally {
    clearTimeout(timer);
  }
}

async function readBoundedText(
  response: Response,
  maxBytes: number,
): Promise<{ kind: "html"; html: string } | { kind: "limited"; reasonCode: SafeFetchReasonCode }> {
  if (response.body === null) {
    return limited("site_unreadable");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value === undefined) {
        continue;
      }

      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        await reader.cancel();
        return limited("size_limit_exceeded");
      }
      chunks.push(value);
    }
  } catch {
    return limited("site_unreadable");
  }

  const joined = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { kind: "html", html: new TextDecoder().decode(joined) };
}

function normaliseContentType(contentType: string | null): string | undefined {
  const value = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  return value && value.length > 0 ? value : undefined;
}

function isRedirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isValidPolicy(policy: SafeFetchPolicy): boolean {
  return (
    Number.isInteger(policy.maxPagesPerAssessment) &&
    policy.maxPagesPerAssessment >= 1 &&
    Number.isInteger(policy.maxHtmlBytesPerPage) &&
    policy.maxHtmlBytesPerPage > 0 &&
    Number.isInteger(policy.pageTimeoutMs) &&
    policy.pageTimeoutMs > 0 &&
    Number.isInteger(policy.assessmentTimeoutMs) &&
    policy.assessmentTimeoutMs >= policy.pageTimeoutMs &&
    Number.isInteger(policy.maxRedirects) &&
    policy.maxRedirects >= 0 &&
    policy.allowedContentTypes.length > 0
  );
}

function limited(reasonCode: SafeFetchReasonCode): {
  kind: "limited";
  reasonCode: SafeFetchReasonCode;
} {
  return { kind: "limited", reasonCode };
}
