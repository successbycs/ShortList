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
 * Added to the approved evaluation instructions for the research call only.
 * It asks for searching and plain notes; the structured answer comes later.
 */
const RESEARCH_INSTRUCTION = [
  "Research step: use the web_search tool to look up each buyer question on the live web",
  "before answering. Then write short plain-text notes answering each question from what the",
  "searches found, naming the businesses and sources that appear. Do not write JSON yet.",
].join(" ");

type StageResult = {
  output: unknown;
  providerSources?: readonly GeoProviderSource[];
  usage?: GeoProviderUsage;
};

/**
 * Server-only Claude Messages boundary for the four-stage GEO package. The
 * caller supplies approved instructions and safe typed input; this adapter
 * owns only transport, timeout, the structured-output request shape and the
 * current-web tool distinction.
 *
 * Claude's web search always returns citations, and structured output cannot
 * be combined with citations. So the current-web evaluation is two calls: a
 * research call with web search and plain-text notes, then a structured call
 * without tools that turns those notes into the evaluation JSON.
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

  async function send(params: Anthropic.MessageCreateParamsNonStreaming) {
    let message: Anthropic.Message;
    try {
      message = await client.messages.create(params);
    } catch (error) {
      if (error instanceof Anthropic.APIConnectionTimeoutError) {
        throw new Error("The GEO provider request timed out.");
      }
      throw new Error("The GEO provider request failed.");
    }
    if (message.stop_reason !== "end_turn") {
      // refusal, max_tokens or pause_turn: the answer is not complete.
      throw new Error(`The GEO provider stopped early (${String(message.stop_reason)}).`);
    }
    return message;
  }

  return {
    async run(request): Promise<StageResult> {
      if (request.mode !== "current_web") {
        const message = await send(structuredRequest(request, request.input, config));
        return { output: parseJson(message), usage: usageOf([message]) };
      }

      const research = await send({
        model: config.modelId,
        max_tokens: config.maxOutputTokens,
        system: `${request.instructions}\n\n${RESEARCH_INSTRUCTION}`,
        messages: [{ role: "user", content: JSON.stringify(request.input) }],
        output_config: { effort: "low" },
        tools: [
          { type: "web_search_20250305", name: "web_search", max_uses: config.maxWebSearches },
        ],
      });
      const providerSources = parseProviderSources(research.content);
      if (providerSources.length === 0) {
        // Never present a memory-only answer as live-web evidence.
        throw new Error("The current-web evaluation returned no web search results.");
      }
      const notes = finalText(research.content);
      if (notes === undefined) throw new Error("The GEO provider returned no research notes.");

      const structured = await send(
        structuredRequest(request, { ...request.input, current_web_research_notes: notes }, config),
      );
      return {
        output: parseJson(structured),
        providerSources,
        usage: usageOf([research, structured]),
      };
    },
  };
}

function structuredRequest(
  request: GeoModelRequest,
  input: Record<string, unknown>,
  config: ClaudeGeoMessagesProviderConfig,
): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model: config.modelId,
    max_tokens: config.maxOutputTokens,
    system: request.instructions,
    messages: [{ role: "user", content: JSON.stringify(input) }],
    // Low effort keeps each stage quick and cheap; the stages are bounded
    // extraction and judgement tasks, not open-ended research.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: schemaForStage(request.stage) },
    },
  };
}

function parseJson(message: Anthropic.Message): unknown {
  const text = finalText(message.content);
  if (text === undefined) throw new Error("The GEO provider returned no structured text.");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The GEO provider returned malformed JSON.");
  }
}

function usageOf(messages: readonly Anthropic.Message[]): GeoProviderUsage {
  let inputTokens = 0;
  let outputTokens = 0;
  for (const { usage } of messages) {
    inputTokens +=
      usage.input_tokens +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0);
    outputTokens += usage.output_tokens;
  }
  return { inputTokens, outputTokens };
}

/**
 * The answer is the text written after the last tool result. Text before a
 * web search ("I'll search for…") is not part of it.
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
