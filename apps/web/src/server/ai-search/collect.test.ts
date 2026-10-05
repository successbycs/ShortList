import { describe, expect, it, vi } from "vitest";

import {
  collectAiSearchEvidence,
  MODEL_KNOWLEDGE_FRESHNESS_NOTICE,
  type AiSearchProvider,
  type AiSearchProviderResponse,
  type AiSearchRunRequest,
} from "./index";

const LIMITS = { maxInputTokens: 12000, maxOutputTokens: 2000, maxEstimatedSpendUsd: 0.03 };

function requestFor(mode: AiSearchRunRequest["mode"]): AiSearchRunRequest {
  return {
    assessmentId: "assessment-1",
    normalisedDomain: "harbourhandyman.co.nz",
    businessType: "handyman",
    question: "Which Auckland businesses offer handyman services today?",
    executedAtUtc: "2026-10-05T05:00:00.000Z",
    mode,
    configuration:
      mode === "web_grounded"
        ? {
            modelId: "test-model",
            searchConfigurationRef: "test-web-config",
            locationContext: {
              kind: "web_search_location",
              city: "Auckland",
              region: "Auckland",
              country: "NZ",
              timezone: "Pacific/Auckland",
            },
          }
        : {
            modelId: "test-model",
            searchConfigurationRef: "test-no-web-config",
            locationContext: { kind: "no_web_search" },
          },
    limits: LIMITS,
    requestedInputTokens: 200,
    maximumOutputTokens: 500,
    estimatedSpendUsd: 0.01,
  };
}

const CURRENT_WEB_SUCCESS = {
  kind: "success" as const,
  mode: "web_grounded" as const,
  observedResults: [
    { position: 1, name: "Harbour Handywork", summary: "Auckland handyman service" },
  ],
  citations: [
    {
      url: "https://harbourhandyman.example.nz",
      title: "Harbour Handywork",
      observedResultPosition: 1,
    },
  ],
  usage: { inputTokens: 180, outputTokens: 230, estimatedSpendUsd: 0.008 },
};

function providerReturning(response: AiSearchProviderResponse): AiSearchProvider {
  return { run: vi.fn().mockResolvedValue(response) };
}

describe("collectAiSearchEvidence", () => {
  it("preserves ordered, cited current-web evidence with its dated configuration", async () => {
    const evidence = await collectAiSearchEvidence(
      requestFor("web_grounded"),
      providerReturning(CURRENT_WEB_SUCCESS),
    );

    expect(evidence).toMatchObject({
      contractVersion: "v1",
      mode: "web_grounded",
      outcome: "completed",
      reasonCode: "completed",
      executedAtUtc: "2026-10-05T05:00:00.000Z",
      modelId: "test-model",
      searchConfigurationRef: "test-web-config",
    });
    expect(evidence.observedResults).toEqual(CURRENT_WEB_SUCCESS.observedResults);
    expect(evidence.citations).toEqual(CURRENT_WEB_SUCCESS.citations);
  });

  it("labels no-web model knowledge without citations", async () => {
    const evidence = await collectAiSearchEvidence(
      requestFor("model_knowledge"),
      providerReturning({ ...CURRENT_WEB_SUCCESS, mode: "model_knowledge" }),
    );

    expect(evidence.outcome).toBe("completed");
    expect(evidence.citations).toEqual([]);
    expect(evidence.freshnessNotice).toBe(MODEL_KNOWLEDGE_FRESHNESS_NOTICE);
  });

  it("does not call the provider when a preflight spend limit is exceeded", async () => {
    const provider = { run: vi.fn() } as unknown as AiSearchProvider;
    const request = requestFor("web_grounded");
    request.estimatedSpendUsd = 0.04;

    const evidence = await collectAiSearchEvidence(request, provider);

    expect(evidence).toMatchObject({ outcome: "failed", reasonCode: "spend_limit_exceeded" });
    expect(provider.run).not.toHaveBeenCalled();
  });

  it("makes uncited current-web data limited rather than a supported claim", async () => {
    const evidence = await collectAiSearchEvidence(
      requestFor("web_grounded"),
      providerReturning({ ...CURRENT_WEB_SUCCESS, citations: [] }),
    );

    expect(evidence).toMatchObject({ outcome: "limited", reasonCode: "missing_citations" });
    expect(evidence.observedResults).toEqual(CURRENT_WEB_SUCCESS.observedResults);
  });

  it.each([
    [{ kind: "timeout" as const }, "provider_timeout"],
    [{ kind: "failure" as const }, "provider_failure"],
    [{ ...CURRENT_WEB_SUCCESS, observedResults: [] }, "malformed_provider_response"],
  ])("returns a safe reason code for provider failure %#", async (response, reasonCode) => {
    const evidence = await collectAiSearchEvidence(
      requestFor("web_grounded"),
      providerReturning(response),
    );

    expect(evidence).toMatchObject({
      outcome: "failed",
      reasonCode,
      observedResults: [],
      citations: [],
    });
  });
});
