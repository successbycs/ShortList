import { describe, expect, it, vi } from "vitest";

import { createOpenAiResponsesProvider } from "./openai-responses";
import type { AiSearchRunRequest } from "./types";

const request: AiSearchRunRequest = {
  assessmentId: "assessment-1",
  normalisedDomain: "harbourhandyman.co.nz",
  businessType: "handyman",
  question: "Which Auckland handyman businesses can be found today?",
  executedAtUtc: "2026-10-05T05:00:00.000Z",
  mode: "web_grounded",
  configuration: {
    modelId: "gpt-6-luna",
    searchConfigurationRef: "decision-pending",
    locationContext: {
      kind: "web_search_location",
      city: "Auckland",
      region: "Auckland",
      country: "NZ",
      timezone: "Pacific/Auckland",
    },
  },
  limits: { maxInputTokens: 12000, maxOutputTokens: 2000, maxEstimatedSpendUsd: 0.03 },
  requestedInputTokens: 300,
  maximumOutputTokens: 500,
  estimatedSpendUsd: 0.01,
};

function providerWith(fetchImplementation: typeof fetch) {
  return createOpenAiResponsesProvider({
    apiKey: "test-only-key",
    modelId: "gpt-6-luna",
    timeoutMs: 1000,
    storeResponses: false,
    webSearch: { toolChoice: "required", searchContextSize: "low", externalWebAccess: true },
    currentWebInstructions: "Return JSON only.",
    modelKnowledgeInstructions: "Return JSON only.",
    fetchImplementation,
  });
}

function successfulResponse() {
  return new Response(
    JSON.stringify({
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: '{"observed_results":[{"name":"Harbour Handywork","summary":"Auckland handyman service"}]}',
              annotations: [
                {
                  type: "url_citation",
                  url_citation: { url: "https://example.nz", title: "Example" },
                },
              ],
            },
          ],
        },
      ],
      usage: { input_tokens: 120, output_tokens: 80 },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

describe("OpenAI Responses provider", () => {
  it("sends current-web requests through the configured search boundary", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValue(successfulResponse()) as unknown as typeof fetch;
    const result = await providerWith(fetchImplementation).run(request);
    const [, init] = (fetchImplementation as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;

    expect(result).toMatchObject({ kind: "success", mode: "web_grounded" });
    expect(body).toMatchObject({ model: "gpt-6-luna", store: false, tool_choice: "required" });
    expect(body.tools).toEqual([
      expect.objectContaining({
        type: "web_search",
        search_context_size: "low",
        external_web_access: true,
      }),
    ]);
  });

  it("omits web-search tools for the no-web model-knowledge mode", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValue(successfulResponse()) as unknown as typeof fetch;
    const noWebRequest: AiSearchRunRequest = {
      ...request,
      mode: "model_knowledge",
      configuration: {
        ...request.configuration,
        locationContext: { kind: "no_web_search" },
      },
    };
    await providerWith(fetchImplementation).run(noWebRequest);
    const [, init] = (fetchImplementation as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;

    expect(body).not.toHaveProperty("tools");
    expect(body).not.toHaveProperty("tool_choice");
  });

  it("does not disclose a provider failure body", async () => {
    const result = await providerWith(
      vi
        .fn()
        .mockResolvedValue(
          new Response("secret provider diagnostic", { status: 500 }),
        ) as unknown as typeof fetch,
    ).run(request);

    expect(result).toEqual({ kind: "failure" });
  });
});
