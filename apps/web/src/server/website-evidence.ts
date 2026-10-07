/**
 * Turns an already-fetched HTML response into bounded, inert website evidence.
 *
 * This module never makes a network request and never executes page content.
 * The future safe fetcher owns DNS, redirect and timeout enforcement, then
 * passes only an approved response through this boundary.
 */
export type WebsiteEvidenceLimits = {
  allowedContentTypes: readonly string[];
  maxHtmlBytes: number;
  maxExcerptCharacters: number;
  maxJsonLdBlocks: number;
  maxJsonLdCharacters: number;
};

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export type WebsiteResponseFixture = {
  sourceUrl: string;
  observedAtUtc: string;
  status: number;
  contentType: string | null;
  html: string;
};

export type WebsiteEvidenceResult =
  | {
      kind: "captured";
      sourceUrl: string;
      observedAtUtc: string;
      contentType: string;
      title?: string;
      description?: string;
      excerpt: string;
      jsonLd: readonly JsonValue[];
    }
  | { kind: "limited"; reasonCode: WebsiteEvidenceReasonCode };

export type WebsiteEvidenceReasonCode =
  "site_unreadable" | "content_rejected" | "size_limit_exceeded" | "evidence_insufficient";

export function extractBoundedWebsiteEvidence(
  response: WebsiteResponseFixture,
  limits: WebsiteEvidenceLimits,
): WebsiteEvidenceResult {
  if (!Number.isInteger(response.status) || response.status < 200 || response.status > 299) {
    return limited("site_unreadable");
  }

  const contentType = normaliseContentType(response.contentType);
  if (contentType === undefined || !limits.allowedContentTypes.includes(contentType)) {
    return limited("content_rejected");
  }

  if (
    !isPositiveInteger(limits.maxHtmlBytes) ||
    !isPositiveInteger(limits.maxExcerptCharacters) ||
    !isPositiveInteger(limits.maxJsonLdBlocks) ||
    !isPositiveInteger(limits.maxJsonLdCharacters)
  ) {
    return limited("content_rejected");
  }

  if (new TextEncoder().encode(response.html).byteLength > limits.maxHtmlBytes) {
    return limited("size_limit_exceeded");
  }

  const title = readTitle(response.html);
  const description = readMetaDescription(response.html);
  const jsonLd = readBoundedJsonLd(
    response.html,
    limits.maxJsonLdBlocks,
    limits.maxJsonLdCharacters,
  );
  const text = visibleText(response.html);
  if (text.length === 0) {
    return limited("evidence_insufficient");
  }

  return {
    kind: "captured",
    sourceUrl: response.sourceUrl,
    observedAtUtc: response.observedAtUtc,
    contentType,
    ...(title === undefined ? {} : { title }),
    ...(description === undefined ? {} : { description }),
    excerpt: text.slice(0, limits.maxExcerptCharacters),
    jsonLd,
  };
}

function normaliseContentType(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const normalised = value.split(";", 1)[0]?.trim().toLowerCase();
  return normalised && normalised.length > 0 ? normalised : undefined;
}

function readTitle(html: string): string | undefined {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html);
  return match === null ? undefined : normaliseText(match[1] ?? "");
}

function readMetaDescription(html: string): string | undefined {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = readAttribute(tag, "name")?.toLowerCase();
    if (name === "description") {
      return normaliseText(readAttribute(tag, "content") ?? "");
    }
  }
  return undefined;
}

function readAttribute(tag: string, name: string): string | undefined {
  const expression = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = expression.exec(tag);
  return match === null ? undefined : (match[1] ?? match[2] ?? match[3]);
}

function visibleText(html: string): string {
  const withoutInactiveContent = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, " ");
  return normaliseText(withoutInactiveContent.replace(/<[^>]*>/g, " ")) ?? "";
}

/**
 * JSON-LD is valuable structured evidence but it remains untrusted page data.
 * Invalid, oversized and non-object/array blocks are discarded rather than
 * being repaired or treated as facts.
 */
function readBoundedJsonLd(
  html: string,
  maxBlocks: number,
  maxCharacters: number,
): readonly JsonValue[] {
  const values: JsonValue[] = [];
  let retainedCharacters = 0;
  const scripts = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;

  for (const match of html.matchAll(scripts)) {
    if (
      values.length >= maxBlocks ||
      readAttribute(match[1] ?? "", "type")?.toLowerCase() !== "application/ld+json"
    ) {
      continue;
    }

    const raw = (match[2] ?? "").trim();
    if (raw.length === 0 || raw.length > maxCharacters - retainedCharacters) {
      continue;
    }

    const parsed = parseJsonLd(raw);
    if (parsed === undefined) {
      continue;
    }

    const serialised = JSON.stringify(parsed);
    if (retainedCharacters + serialised.length > maxCharacters) {
      continue;
    }
    retainedCharacters += serialised.length;
    values.push(parsed);
  }

  return values;
}

function parseJsonLd(value: string): JsonValue | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || Array.isArray(parsed) || typeof parsed === "object") {
      return parsed as JsonValue;
    }
  } catch {
    // Page-provided structured data is optional. An invalid block is not a
    // reason to fail an otherwise usable site.
  }
  return undefined;
}

function normaliseText(value: string): string | undefined {
  const normalised = decodeBasicHtmlEntities(value).replace(/\s+/g, " ").trim();
  return normalised.length === 0 ? undefined : normalised;
}

function decodeBasicHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function limited(reasonCode: WebsiteEvidenceReasonCode): WebsiteEvidenceResult {
  return { kind: "limited", reasonCode };
}
