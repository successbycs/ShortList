import type {
  GeoModelProvider,
  GeoModelRequest,
  GeoProviderSource,
  GeoProviderUsage,
} from "./geo-assessment-runner";

type FetchImplementation = typeof fetch;

export type OpenAiGeoResponsesProviderConfig = {
  apiKey: string;
  modelId: string;
  timeoutMs: number;
  maxOutputTokens: number;
  storeResponses: boolean;
  endpoint?: string;
  fetchImplementation?: FetchImplementation;
};

const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";

/**
 * Server-only OpenAI Responses boundary for the four-stage GEO package. The
 * caller supplies approved instructions and safe typed input; this adapter
 * owns only transport, timeout, structured-output request shape, and the
 * current-web tool distinction.
 */
export function createOpenAiGeoResponsesProvider(
  config: OpenAiGeoResponsesProviderConfig,
): GeoModelProvider {
  return {
    async run(request): Promise<unknown> {
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
        if (!response.ok) throw new Error("The GEO provider request failed.");
        return parseResponse(await response.json());
      } catch (error) {
        if (isAbortError(error)) throw new Error("The GEO provider request timed out.");
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function createResponseRequest(
  request: GeoModelRequest,
  config: OpenAiGeoResponsesProviderConfig,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: config.modelId,
    store: config.storeResponses,
    instructions: request.instructions,
    input: JSON.stringify(request.input),
    max_output_tokens: config.maxOutputTokens,
    text: {
      format: {
        type: "json_schema",
        name: `shortlist_geo_${request.stage}`,
        strict: true,
        schema: schemaForStage(request.stage),
      },
    },
  };
  if (request.mode === "current_web") {
    body["tools"] = [{ type: "web_search", search_context_size: "low" }];
    body["tool_choice"] = "required";
    body["include"] = ["web_search_call.action.sources"];
  }
  return body;
}

function parseResponse(payload: unknown): {
  output: unknown;
  providerSources?: readonly GeoProviderSource[];
  usage?: GeoProviderUsage;
} {
  if (!isRecord(payload) || !Array.isArray(payload["output"])) {
    throw new Error("The GEO provider returned an invalid response.");
  }
  for (const output of payload["output"]) {
    if (!isRecord(output) || output["type"] !== "message" || !Array.isArray(output["content"])) {
      continue;
    }
    for (const content of output["content"]) {
      if (
        isRecord(content) &&
        content["type"] === "output_text" &&
        typeof content["text"] === "string"
      ) {
        let parsedOutput: unknown;
        try {
          parsedOutput = JSON.parse(content["text"]);
        } catch {
          throw new Error("The GEO provider returned malformed JSON.");
        }
        const usage = parseUsage(payload["usage"]);
        return {
          output: parsedOutput,
          providerSources: parseProviderSources(payload["output"]),
          ...(usage === undefined ? {} : { usage }),
        };
      }
    }
  }
  throw new Error("The GEO provider returned no structured text.");
}

function parseUsage(value: unknown): GeoProviderUsage | undefined {
  if (value === undefined || value === null) return undefined;
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value["input_tokens"]) ||
    !Number.isSafeInteger(value["output_tokens"]) ||
    (value["input_tokens"] as number) < 0 ||
    (value["output_tokens"] as number) < 0
  ) {
    throw new Error("The GEO provider returned invalid usage metadata.");
  }
  return {
    inputTokens: value["input_tokens"] as number,
    outputTokens: value["output_tokens"] as number,
  };
}

/** Provider metadata is the only source of current-web citations. */
function parseProviderSources(value: unknown): readonly GeoProviderSource[] {
  if (!Array.isArray(value)) return [];
  const sources = new Map<string, GeoProviderSource>();
  for (const item of value) {
    if (!isRecord(item) || item["type"] !== "web_search_call") continue;
    const action = item["action"];
    if (!isRecord(action) || !Array.isArray(action["sources"])) continue;
    for (const candidate of action["sources"]) {
      if (!isRecord(candidate)) continue;
      const url = candidate["url"];
      const title = candidate["title"];
      if (
        typeof url === "string" &&
        typeof title === "string" &&
        url.length > 0 &&
        title.length > 0
      ) {
        sources.set(url, { title, url });
      }
    }
  }
  return [...sources.values()];
}

const stringArray = { type: "array", items: { type: "string" } } as const;
const confidence = { type: "string", enum: ["high", "medium", "low"] } as const;
const evidenceLinkedValue = {
  type: "object",
  additionalProperties: false,
  required: ["value", "evidenceIds", "confidence"],
  properties: { value: { type: "string" }, evidenceIds: stringArray, confidence },
} as const;
const icp = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "label",
    "audienceDescription",
    "buyerSituation",
    "needs",
    "decisionCriteria",
    "evidenceIds",
    "confidence",
    "uncertainty",
  ],
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    audienceDescription: { type: "string" },
    buyerSituation: { type: "string" },
    needs: stringArray,
    decisionCriteria: stringArray,
    evidenceIds: stringArray,
    confidence,
    uncertainty: { type: "string" },
  },
} as const;
const buyerQuestion = {
  type: "object",
  additionalProperties: false,
  required: ["id", "icpId", "questionText", "buyerIntent", "testedClaim"],
  properties: {
    id: { type: "string" },
    icpId: { type: "string" },
    questionText: { type: "string" },
    buyerIntent: { type: "string" },
    testedClaim: { type: "string" },
  },
} as const;
const source = {
  type: "object",
  additionalProperties: false,
  required: ["title", "url"],
  properties: { title: { type: "string" }, url: { type: "string" } },
} as const;
const finding = {
  type: "object",
  additionalProperties: false,
  required: [
    "questionId",
    "answerSummary",
    "submittedBusinessMention",
    "descriptionAccuracy",
    "recommendationFit",
    "sources",
    "websiteContentGaps",
    "limitations",
    "confidence",
  ],
  properties: {
    questionId: { type: "string" },
    answerSummary: { type: "string" },
    submittedBusinessMention: {
      type: "string",
      enum: ["mentioned", "absent", "uncertain", "contradicted"],
    },
    descriptionAccuracy: {
      type: "string",
      enum: ["accurate", "partial", "inaccurate", "not_applicable"],
    },
    recommendationFit: {
      type: "string",
      enum: ["appropriate", "not_appropriate", "uncertain", "not_mentioned"],
    },
    sources: { type: "array", items: source },
    websiteContentGaps: stringArray,
    limitations: stringArray,
    confidence,
  },
} as const;

function schemaForStage(stage: GeoModelRequest["stage"]): Record<string, unknown> {
  switch (stage) {
    case "profile":
      return {
        type: "object",
        additionalProperties: false,
        required: [
          "businessName",
          "websiteDomain",
          "services",
          "serviceAreas",
          "audienceSignals",
          "valuePropositions",
          "proofPoints",
          "differentiators",
          "contentGaps",
          "limitations",
          "confidence",
        ],
        properties: {
          businessName: { anyOf: [evidenceLinkedValue, { type: "null" }] },
          websiteDomain: { type: "string" },
          services: { type: "array", items: evidenceLinkedValue },
          serviceAreas: { type: "array", items: evidenceLinkedValue },
          audienceSignals: { type: "array", items: evidenceLinkedValue },
          valuePropositions: { type: "array", items: evidenceLinkedValue },
          proofPoints: { type: "array", items: evidenceLinkedValue },
          differentiators: { type: "array", items: evidenceLinkedValue },
          contentGaps: stringArray,
          limitations: stringArray,
          confidence,
        },
      };
    case "icp":
      return {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["outcome", "icps"],
            properties: {
              outcome: { type: "string", enum: ["complete"] },
              icps: { type: "array", items: icp },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["outcome", "reason", "evidenceIds"],
            properties: {
              outcome: { type: "string", enum: ["insufficient_evidence"] },
              reason: { type: "string" },
              evidenceIds: stringArray,
            },
          },
        ],
      };
    case "questions":
      return {
        type: "object",
        additionalProperties: false,
        required: ["questions"],
        properties: { questions: { type: "array", items: buyerQuestion } },
      };
    case "evaluation":
      return {
        type: "object",
        additionalProperties: false,
        required: ["findings"],
        properties: { findings: { type: "array", items: finding } },
      };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
