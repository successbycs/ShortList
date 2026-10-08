import type {
  AiSearchProvider,
  AiSearchProviderResponse,
  AiSearchRunRequest,
  AiSearchUsage,
  Citation,
  ObservedResult,
} from "./types";

type FetchImplementation = typeof fetch;

export type OpenAiResponsesProviderConfig = {
  /** Supply from a server-only runtime binding; never import this in browser code. */
  apiKey: string;
  modelId: string;
  timeoutMs: number;
  /** Explicit provider-side response-retention choice; no default is assumed. */
  storeResponses: boolean;
  webSearch: {
    toolChoice: "required" | "auto";
    searchContextSize: "low" | "medium" | "high";
    externalWebAccess: boolean;
  };
  currentWebInstructions: string;
  modelKnowledgeInstructions: string;
  endpoint?: string;
  fetchImplementation?: FetchImplementation;
};

const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";

/**
 * Creates the only OpenAI-specific boundary for #5. It has no side effects
 * until `run` is called by a future server route; all tests inject a fake fetch.
 */
export function createOpenAiResponsesProvider(
  config: OpenAiResponsesProviderConfig,
): AiSearchProvider {
  return {
    async run(request): Promise<AiSearchProviderResponse> {
      if (request.configuration.modelId !== config.modelId) return { kind: "failure" };

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);
      try {
        const response = await (config.fetchImplementation ?? fetch)(
          config.endpoint ?? RESPONSES_ENDPOINT,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(createResponseRequest(request, config)),
            signal: abortController.signal,
          },
        );
        if (!response.ok) return { kind: "failure" };
        return parseResponsesPayload(await response.json(), request);
      } catch (error) {
        return isAbortError(error) ? { kind: "timeout" } : { kind: "failure" };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function createResponseRequest(
  request: AiSearchRunRequest,
  config: OpenAiResponsesProviderConfig,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: config.modelId,
    store: config.storeResponses,
    instructions:
      request.mode === "web_grounded"
        ? config.currentWebInstructions
        : config.modelKnowledgeInstructions,
    input: request.question,
    max_output_tokens: request.maximumOutputTokens,
    text: {
      format: {
        type: "json_schema",
        name: "shortlist_ai_search_evidence",
        strict: true,
        schema: resultSchema,
      },
    },
  };
  if (request.mode === "web_grounded") {
    const location = request.configuration.locationContext;
    body["tools"] = [
      {
        type: "web_search",
        search_context_size: config.webSearch.searchContextSize,
        external_web_access: config.webSearch.externalWebAccess,
        ...(location.kind === "web_search_location"
          ? {
              user_location: {
                type: "approximate",
                city: location.city,
                region: location.region,
                country: location.country,
                timezone: location.timezone,
              },
            }
          : {}),
      },
    ];
    body["tool_choice"] = config.webSearch.toolChoice;
    // Preserve the web tool's source metadata as a truthful fallback when the
    // model's structured JSON has no inline URL annotations. This is provider
    // output, not a generated citation.
    body["include"] = ["web_search_call.action.sources"];
  }
  return body;
}

const resultSchema = {
  type: "object",
  additionalProperties: false,
  required: ["observed_results"],
  properties: {
    observed_results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "summary"],
        properties: {
          name: { type: "string" },
          summary: { type: "string" },
        },
      },
    },
  },
} as const;

function parseResponsesPayload(
  payload: unknown,
  request: AiSearchRunRequest,
): AiSearchProviderResponse {
  if (!isRecord(payload)) return { kind: "failure" };
  const content = outputTextContent(payload["output"]);
  const parsedResults = parseResults(content?.text);
  const usage = parseUsage(payload["usage"], request.estimatedSpendUsd);
  if (!parsedResults || !usage) return { kind: "failure" };
  const inlineCitations = parseCitations(content?.annotations);
  return {
    kind: "success",
    mode: request.mode,
    observedResults: parsedResults,
    citations:
      request.mode === "web_grounded"
        ? inlineCitations.length
          ? inlineCitations
          : parseWebSearchSources(payload["output"])
        : [],
    usage,
  };
}

function outputTextContent(value: unknown): { text: string; annotations: unknown } | undefined {
  if (!Array.isArray(value)) return undefined;
  for (const item of value) {
    if (!isRecord(item) || item["type"] !== "message" || !Array.isArray(item["content"])) {
      continue;
    }
    for (const content of item["content"]) {
      if (
        isRecord(content) &&
        content["type"] === "output_text" &&
        typeof content["text"] === "string"
      ) {
        return { text: content["text"], annotations: content["annotations"] };
      }
    }
  }
  return undefined;
}

function parseResults(text: string | undefined): ObservedResult[] | undefined {
  if (!text) return undefined;
  try {
    const value: unknown = JSON.parse(text);
    if (!isRecord(value) || !Array.isArray(value["observed_results"])) return undefined;
    const results = value["observed_results"].map((result, index) => {
      if (
        !isRecord(result) ||
        typeof result["name"] !== "string" ||
        typeof result["summary"] !== "string"
      ) {
        return undefined;
      }
      return { position: index + 1, name: result["name"], summary: result["summary"] };
    });
    return results.every((result): result is ObservedResult => result !== undefined)
      ? results
      : undefined;
  } catch {
    return undefined;
  }
}

function parseCitations(value: unknown): Citation[] {
  if (!Array.isArray(value)) return [];
  const citations: Citation[] = [];
  for (const annotation of value) {
    if (
      !isRecord(annotation) ||
      annotation["type"] !== "url_citation" ||
      !isRecord(annotation["url_citation"])
    )
      continue;
    const { url, title } = annotation["url_citation"];
    if (typeof url === "string" && typeof title === "string") citations.push({ url, title });
  }
  return citations;
}

function parseWebSearchSources(value: unknown): Citation[] {
  if (!Array.isArray(value)) return [];
  const citations = new Map<string, Citation>();
  for (const item of value) {
    if (!isRecord(item) || item["type"] !== "web_search_call" || !isRecord(item["action"])) {
      continue;
    }
    const sources = item["action"]["sources"];
    if (!Array.isArray(sources)) continue;
    for (const source of sources) {
      if (!isRecord(source) || typeof source["url"] !== "string") continue;
      try {
        const parsedUrl = new URL(source["url"]);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) continue;
        citations.set(source["url"], { url: source["url"], title: parsedUrl.hostname });
      } catch {
        // Ignore malformed provider metadata; it is not safe evidence.
      }
    }
  }
  return [...citations.values()];
}

function parseUsage(value: unknown, estimatedSpendUsd: number): AiSearchUsage | undefined {
  if (!isRecord(value)) return undefined;
  const inputTokens = value["input_tokens"];
  const outputTokens = value["output_tokens"];
  if (typeof inputTokens !== "number" || typeof outputTokens !== "number") return undefined;
  // The preflight estimate is retained until the later billing policy provides
  // an actual provider-cost field. It is not a fabricated post-run price.
  return { inputTokens, outputTokens, estimatedSpendUsd };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
