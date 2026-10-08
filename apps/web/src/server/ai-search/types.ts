/**
 * Stable, provider-independent representation of one dated AI-model result.
 * These values are deliberately safe to pass to later persistence and rendering
 * layers: they contain no secret, provider error body, or request headers.
 */
export const AI_SEARCH_EVIDENCE_CONTRACT_VERSION = "v1";

export type AiSearchMode = "web_grounded" | "model_knowledge";
export type AiSearchOutcome = "completed" | "limited" | "failed";
export type AiSearchReasonCode =
  | "completed"
  | "token_limit_exceeded"
  | "spend_limit_exceeded"
  | "invalid_request"
  | "malformed_provider_response"
  | "missing_citations"
  | "provider_timeout"
  | "provider_failure";

export type SearchLocationContext =
  | { kind: "web_search_location"; city: string; region: string; country: string; timezone: string }
  | { kind: "global_no_default_location" }
  | { kind: "no_web_search" };

export type AiSearchConfiguration = {
  /** The configured provider/model identifier, never a credential. */
  modelId: string;
  /** An auditable, non-secret reference to the selected tool/settings. */
  searchConfigurationRef: string;
  locationContext: SearchLocationContext;
};

export type AiSearchLimits = {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxEstimatedSpendUsd: number;
};

export type AiSearchUsage = {
  inputTokens: number;
  outputTokens: number;
  estimatedSpendUsd: number;
};

export type AiSearchRunRequest = {
  assessmentId: string;
  normalisedDomain: string;
  businessType: string;
  question: string;
  executedAtUtc: string;
  mode: AiSearchMode;
  configuration: AiSearchConfiguration;
  limits: AiSearchLimits;
  requestedInputTokens: number;
  maximumOutputTokens: number;
  estimatedSpendUsd: number;
};

export type ObservedResult = { position: number; name: string; summary: string };
export type Citation = { url: string; title: string; observedResultPosition?: number };

export type ProviderSuccess = {
  kind: "success";
  mode: AiSearchMode;
  observedResults: ObservedResult[];
  citations?: Citation[];
  usage: AiSearchUsage;
};
export type ProviderFailure = { kind: "timeout" } | { kind: "failure" };
export type AiSearchProviderResponse = ProviderSuccess | ProviderFailure;

/** Boundary for a later provider adapter. Tests use this with fixture fakes. */
export type AiSearchProvider = {
  run(request: AiSearchRunRequest): Promise<AiSearchProviderResponse>;
};

export type AiSearchEvidence = {
  contractVersion: typeof AI_SEARCH_EVIDENCE_CONTRACT_VERSION;
  assessmentId: string;
  mode: AiSearchMode;
  question: string;
  executedAtUtc: string;
  modelId: string;
  searchConfigurationRef: string;
  locationContext: SearchLocationContext;
  observedResults: ObservedResult[];
  citations: Citation[];
  freshnessNotice?: string;
  outcome: AiSearchOutcome;
  reasonCode: AiSearchReasonCode;
  usage?: AiSearchUsage;
};
