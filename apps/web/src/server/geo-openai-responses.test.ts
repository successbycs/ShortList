import { describe, expect, it, vi } from "vitest";

import { createOpenAiGeoResponsesProvider } from "./geo-openai-responses";

function successResponse(output: object) {
  return new Response(
    JSON.stringify({
      output: [
        { type: "message", content: [{ type: "output_text", text: JSON.stringify(output) }] },
      ],
    }),
    { status: 200 },
  );
}

describe("OpenAI GEO Responses provider", () => {
  it("uses strict structured output and attaches a web tool only to current-web evaluation", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(successResponse({ findings: [] }))
      .mockResolvedValueOnce(successResponse({ findings: [] }));
    const provider = createOpenAiGeoResponsesProvider({
      apiKey: "test-key",
      modelId: "gpt-6-luna",
      timeoutMs: 1_000,
      maxOutputTokens: 600,
      storeResponses: false,
      endpoint: "https://provider.test/responses",
      fetchImplementation,
    });

    await provider.run({
      stage: "evaluation",
      mode: "current_web",
      instructions: "Return JSON.",
      input: { buyer_questions: ["same-question"] },
    });
    await provider.run({
      stage: "evaluation",
      mode: "model_knowledge",
      instructions: "Return JSON.",
      input: { buyer_questions: ["same-question"] },
    });

    const currentWebBody = JSON.parse(String(fetchImplementation.mock.calls[0]?.[1]?.body));
    const modelKnowledgeBody = JSON.parse(String(fetchImplementation.mock.calls[1]?.[1]?.body));
    expect(currentWebBody.text.format).toMatchObject({ type: "json_schema", strict: true });
    expect(currentWebBody.tools).toEqual([{ type: "web_search", search_context_size: "low" }]);
    expect(modelKnowledgeBody.tools).toBeUndefined();
    expect(currentWebBody.input).toBe(modelKnowledgeBody.input);
    expect(JSON.stringify(currentWebBody)).not.toContain("test-key");
  });

  it("rejects malformed provider JSON rather than passing it to the GEO renderer", async () => {
    const provider = createOpenAiGeoResponsesProvider({
      apiKey: "test-key",
      modelId: "gpt-6-luna",
      timeoutMs: 1_000,
      maxOutputTokens: 600,
      storeResponses: false,
      fetchImplementation: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            output: [{ type: "message", content: [{ type: "output_text", text: "not-json" }] }],
          }),
          { status: 200 },
        ),
      ),
    });

    await expect(
      provider.run({ stage: "profile", mode: null, instructions: "Return JSON.", input: {} }),
    ).rejects.toThrow("malformed JSON");
  });

  it("rejects malformed provider usage metadata instead of recording it", async () => {
    const provider = createOpenAiGeoResponsesProvider({
      apiKey: "test-key",
      modelId: "gpt-6-luna",
      timeoutMs: 1_000,
      maxOutputTokens: 600,
      storeResponses: false,
      fetchImplementation: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            usage: { input_tokens: "unknown", output_tokens: 10 },
            output: [{ type: "message", content: [{ type: "output_text", text: "{}" }] }],
          }),
          { status: 200 },
        ),
      ),
    });

    await expect(
      provider.run({ stage: "profile", mode: null, instructions: "Return JSON.", input: {} }),
    ).rejects.toThrow("invalid usage metadata");
  });

  it("returns only provider-supplied current-web source metadata", async () => {
    const provider = createOpenAiGeoResponsesProvider({
      apiKey: "test-key",
      modelId: "gpt-6-luna",
      timeoutMs: 1_000,
      maxOutputTokens: 600,
      storeResponses: false,
      fetchImplementation: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            usage: { input_tokens: 123, output_tokens: 45, total_tokens: 168 },
            output: [
              {
                type: "web_search_call",
                action: {
                  sources: [
                    { title: "Example source", url: "https://example.test/source" },
                    { title: "Example source", url: "https://example.test/source" },
                  ],
                },
              },
              { type: "message", content: [{ type: "output_text", text: '{"findings":[]}' }] },
            ],
          }),
          { status: 200 },
        ),
      ),
    });

    await expect(
      provider.run({
        stage: "evaluation",
        mode: "current_web",
        instructions: "Return JSON.",
        input: {},
      }),
    ).resolves.toEqual({
      output: { findings: [] },
      providerSources: [{ title: "Example source", url: "https://example.test/source" }],
      usage: { inputTokens: 123, outputTokens: 45 },
    });
  });
});
