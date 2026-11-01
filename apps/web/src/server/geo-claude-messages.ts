import Anthropic from "@anthropic-ai/sdk";

import type {
  GeoModelProvider,
  GeoModelRequest,
  GeoProviderSource,
  GeoProviderUsage,
} from "./geo-assessment-runner";

export type ClaudeGeoMessagesProviderConfig = {
  apiKey: string;
  modelId: string;
  timeoutMs: number;
  maxOutputTokens: number;
  /** Most web searches Claude may run in one current-web evaluation. */
  maxWebSearches: number;
  fetchImplementation?: typeof fetch;
};

/**
 * Server-only Claude Messages boundary for the four-stage GEO package. The
 * caller supplies approved instructions and safe typed input; this adapter
 * owns only transport, timeout, the structured-output request shape and the
 * current-web tool distinction.
 */
export function createClaudeGeoMessagesProvider(
  config: ClaudeGeoMessagesProviderConfig,
): GeoModelProvider {
  const client = new Anthropic({
    apiKey: config.apiKey,
    timeout: config.timeoutMs,
    // One attempt only: a retry would double the visitor's wait.
    maxRetries: 0,
    ...(config.fetchImplementation ? { fetch: config.fetchImplementation } : {}),
  });
  return {
    async run(request): Promise<unknown> {
      let message: Anthropic.Message;
      try {
        message = await client.messages.create(createMessageRequest(request, config));
      } catch (error) {
        if (error instanceof Anthropic.APIConnectionTimeoutError) {
          throw new Error("The GEO provider request timed out.");
        }
        throw new Error("The GEO provider request failed.");
      }
      return parseMessage(message);
    },
  };
}

function createMessageRequest(
  request: GeoModelRequest,
  config: ClaudeGeoMessagesProviderConfig,
): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model: config.modelId,
    max_tokens: config.maxOutputTokens,
    system: request.instructions,
    messages: [{ role: "user", content: JSON.stringify(request.input) }],
    // Low effort keeps each stage quick and cheap; the stages are bounded
    // extraction and judgement tasks, not open-ended research.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: schemaForStage(request.stage) },
    },
    ...(request.mode === "current_web"
      ? {
          tools: [
            { type: "web_search_20250305", name: "web_search", max_uses: config.maxWebSearches },
          ],
        }
      : {}),
  };
}

function parseMessage(message: Anthropic.Message): {
  output: unknown;
  providerSources?: readonly GeoProviderSource[];
  usage?: GeoProviderUsage;
} {
  if (message.stop_reason !== "end_turn") {
    // refusal, max_tokens or pause_turn: the structured output is not complete.
    throw new Error(`The GEO provider stopped early (${String(message.stop_reason)}).`);
  }
  const text = finalText(message.content);
  if (text === undefined) throw new Error("The GEO provider returned no structured text.");
  let output: unknown;
  try {
    output = JSON.parse(text);
  } catch {
    throw new Error("The GEO provider returned malformed JSON.");
  }
  return {
    output,
    providerSources: parseProviderSources(message.content),
    usage: {
      inputTokens:
        message.usage.input_tokens +
        (message.usage.cache_creation_input_tokens ?? 0) +
        (message.usage.cache_read_input_tokens ?? 0),
      outputTokens: message.usage.output_tokens,
    },
  };
}

/**
 * The structured answer is the text written after the last tool result. Text
 * before a web search ("I'll search for…") is not part of it.
 */
function finalText(content: readonly Anthropic.ContentBlock[]): string | undefined {
  let lastToolIndex = -1;
  content.forEach((block, index) => {
    if (block.type !== "text" && block.type !== "thinking" && block.type !== "redacted_thinking") {
      lastToolIndex = index;
    }
  });
  const text = content
    .slice(lastToolIndex + 1)
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("");
  return text.trim().length > 0 ? text : undefined;
}

/** Claude's own web search results are the only source of current-web citations. */
function parseProviderSources(
  content: readonly Anthropic.ContentBlock[],
): readonly GeoProviderSource[] {
  const sources = new Map<string, GeoProviderSource>();
  for (const block of content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const result of block.content) {
      if (result.url.length > 0 && result.title.length > 0) {
        sources.set(result.url, { title: result.title, url: result.url });
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
