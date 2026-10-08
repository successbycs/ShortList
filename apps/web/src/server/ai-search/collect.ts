import {
  AI_SEARCH_EVIDENCE_CONTRACT_VERSION,
  type AiSearchEvidence,
  type AiSearchProvider,
  type AiSearchProviderResponse,
  type AiSearchReasonCode,
  type AiSearchRunRequest,
  type AiSearchUsage,
  type Citation,
  type ObservedResult,
} from "./types";

export const MODEL_KNOWLEDGE_FRESHNESS_NOTICE =
  "This response did not use a live web search. It may be incomplete or out of date and is not a verified current result.";

/** Applies deterministic limits before a provider adapter is invoked. */
export async function collectAiSearchEvidence(
  request: AiSearchRunRequest,
  provider: AiSearchProvider,
): Promise<AiSearchEvidence> {
  const requestFailure = validateRequest(request);
  if (requestFailure) return safeFailure(request, requestFailure);
  try {
    return normaliseProviderResponse(request, await provider.run(request));
  } catch {
    return safeFailure(request, "provider_failure");
  }
}

type PreflightReasonCode = Exclude<AiSearchReasonCode, "completed" | "missing_citations">;

function validateRequest(request: AiSearchRunRequest): PreflightReasonCode | undefined {
  if (
    !request.assessmentId ||
    !request.normalisedDomain ||
    !request.businessType ||
    !request.question ||
    !isUtcIsoTimestamp(request.executedAtUtc) ||
    !request.configuration.modelId ||
    !request.configuration.searchConfigurationRef ||
    !arePositiveFiniteNumbers(
      request.limits.maxInputTokens,
      request.limits.maxOutputTokens,
      request.limits.maxEstimatedSpendUsd,
      request.requestedInputTokens,
      request.maximumOutputTokens,
      request.estimatedSpendUsd,
    ) ||
    !hasExpectedLocationBoundary(request)
  )
    return "invalid_request";
  if (
    request.requestedInputTokens > request.limits.maxInputTokens ||
    request.maximumOutputTokens > request.limits.maxOutputTokens
  )
    return "token_limit_exceeded";
  if (request.estimatedSpendUsd > request.limits.maxEstimatedSpendUsd)
    return "spend_limit_exceeded";
  return undefined;
}

function hasExpectedLocationBoundary(request: AiSearchRunRequest): boolean {
  const { locationContext } = request.configuration;
  if (request.mode === "model_knowledge") return locationContext.kind === "no_web_search";
  return (
    locationContext.kind === "global_no_default_location" ||
    (locationContext.kind === "web_search_location" &&
      Boolean(locationContext.city) &&
      Boolean(locationContext.region) &&
      Boolean(locationContext.country) &&
      Boolean(locationContext.timezone))
  );
}

function arePositiveFiniteNumbers(...values: number[]): boolean {
  return values.every((value) => Number.isFinite(value) && value > 0);
}

function isUtcIsoTimestamp(value: string): boolean {
  return /Z$/.test(value) && !Number.isNaN(Date.parse(value));
}

function normaliseProviderResponse(
  request: AiSearchRunRequest,
  response: AiSearchProviderResponse,
): AiSearchEvidence {
  if (response.kind === "timeout") return safeFailure(request, "provider_timeout");
  if (response.kind === "failure") return safeFailure(request, "provider_failure");
  if (
    response.mode !== request.mode ||
    !isValidUsage(response.usage) ||
    !isValidResults(response.observedResults)
  )
    return safeFailure(request, "malformed_provider_response");
  if (
    response.usage.inputTokens > request.limits.maxInputTokens ||
    response.usage.outputTokens > request.limits.maxOutputTokens
  )
    return safeFailure(request, "token_limit_exceeded", response.usage);
  if (response.usage.estimatedSpendUsd > request.limits.maxEstimatedSpendUsd)
    return safeFailure(request, "spend_limit_exceeded", response.usage);
  if (request.mode === "model_knowledge") {
    return {
      ...baseEvidence(request),
      observedResults: response.observedResults,
      citations: [],
      freshnessNotice: MODEL_KNOWLEDGE_FRESHNESS_NOTICE,
      outcome: "completed",
      reasonCode: "completed",
      usage: response.usage,
    };
  }
  const citations = response.citations ?? [];
  if (!citations.length || !citations.every(isValidCitation)) {
    return {
      ...baseEvidence(request),
      observedResults: response.observedResults,
      citations: [],
      outcome: "limited",
      reasonCode: "missing_citations",
      usage: response.usage,
    };
  }
  return {
    ...baseEvidence(request),
    observedResults: response.observedResults,
    citations,
    outcome: "completed",
    reasonCode: "completed",
    usage: response.usage,
  };
}

function isValidResults(results: ObservedResult[]): boolean {
  return (
    results.length > 0 &&
    results.every(
      (result, index) =>
        Number.isInteger(result.position) &&
        result.position === index + 1 &&
        Boolean(result.name.trim()) &&
        Boolean(result.summary.trim()),
    )
  );
}

function isValidCitation(citation: Citation): boolean {
  try {
    return (
      Boolean(citation.title.trim()) && ["http:", "https:"].includes(new URL(citation.url).protocol)
    );
  } catch {
    return false;
  }
}

function isValidUsage(usage: AiSearchUsage): boolean {
  return arePositiveFiniteNumbers(usage.inputTokens, usage.outputTokens, usage.estimatedSpendUsd);
}

function safeFailure(
  request: AiSearchRunRequest,
  reasonCode: Exclude<AiSearchReasonCode, "completed" | "missing_citations">,
  usage?: AiSearchUsage,
): AiSearchEvidence {
  return {
    ...baseEvidence(request),
    observedResults: [],
    citations: [],
    outcome: "failed",
    reasonCode,
    ...(usage ? { usage } : {}),
  };
}

function baseEvidence(
  request: AiSearchRunRequest,
): Omit<
  AiSearchEvidence,
  "observedResults" | "citations" | "outcome" | "reasonCode" | "usage" | "freshnessNotice"
> {
  return {
    contractVersion: AI_SEARCH_EVIDENCE_CONTRACT_VERSION,
    assessmentId: request.assessmentId,
    mode: request.mode,
    question: request.question,
    executedAtUtc: request.executedAtUtc,
    modelId: request.configuration.modelId,
    searchConfigurationRef: request.configuration.searchConfigurationRef,
    locationContext: request.configuration.locationContext,
  };
}
