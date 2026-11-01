import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createClaudeGeoMessagesProvider } from "./geo-claude-messages";

type Block = Record<string, unknown>;

function claudeResponse(content: Block[], extra: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      id: "msg_test",
      type: "message",
      role: "assistant",
      model: "claude-haiku-5-5",
      content,
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 20 },
      ...extra,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function provider(fetchImplementation: typeof fetch) {
  return createClaudeGeoMessagesProvider({
    apiKey: "test-key",
    modelId: "claude-haiku-5-5",
    timeoutMs: 1_000,
    maxOutputTokens: 4_000,
    maxWebSearches: 3,
    fetchImplementation,
  });
}

function sentBody(fetchImplementation: ReturnType<typeof vi.fn>, call: number) {
  const init = fetchImplementation.mock.calls[call]?.[1] as RequestInit | undefined;
  return JSON.parse(String(init?.body));
}

const profileRequest = {
  stage: "profile",
  mode: null,
  instructions: "Return JSON.",
  input: {},
} as const;

describe("Claude GEO Messages provider", () => {
  // The provider runs in a Cloudflare Worker. The shared test setup imitates a
  // browser, where the Claude SDK refuses to run, so hide the browser window.
  beforeEach(() => vi.stubGlobal("window", undefined));
  afterEach(() => vi.unstubAllGlobals());

  it("uses structured output and attaches web search only to current-web evaluation", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(claudeResponse([{ type: "text", text: '{"findings":[]}' }]))
      .mockResolvedValueOnce(claudeResponse([{ type: "text", text: '{"findings":[]}' }]));
    const geo = provider(fetchImplementation);

    await geo.run({
      stage: "evaluation",
      mode: "current_web",
      instructions: "Return JSON.",
      input: { buyer_questions: ["same-question"] },
    });
    await geo.run({
      stage: "evaluation",
      mode: "model_knowledge",
      instructions: "Return JSON.",
      input: { buyer_questions: ["same-question"] },
    });

    const currentWeb = sentBody(fetchImplementation, 0);
    const modelKnowledge = sentBody(fetchImplementation, 1);
    expect(currentWeb.model).toBe("claude-haiku-5-5");
    expect(currentWeb.system).toBe("Return JSON.");
    expect(currentWeb.output_config.format.type).toBe("json_schema");
    expect(currentWeb.output_config.format.schema.required).toEqual(["findings"]);
    expect(currentWeb.tools).toEqual([
      { type: "web_search_20250305", name: "web_search", max_uses: 3 },
    ]);
    expect(modelKnowledge.tools).toBeUndefined();
    expect(currentWeb.messages).toEqual(modelKnowledge.messages);
    expect(JSON.stringify(currentWeb)).not.toContain("test-key");
  });

  it("returns the final JSON, de-duplicated search sources and token usage", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      claudeResponse(
        [
          { type: "text", text: "I'll search for that." },
          { type: "server_tool_use", id: "srvtoolu_1", name: "web_search", input: { query: "x" } },
          {
            type: "web_search_tool_result",
            tool_use_id: "srvtoolu_1",
            content: [
              {
                type: "web_search_result",
                title: "Example source",
                url: "https://example.test/source",
                encrypted_content: "abc",
                page_age: null,
              },
              {
                type: "web_search_result",
                title: "Example source",
                url: "https://example.test/source",
                encrypted_content: "abc",
                page_age: null,
              },
            ],
          },
          { type: "text", text: '{"findings":' },
          { type: "text", text: "[]}" },
        ],
        {
          usage: {
            input_tokens: 100,
            cache_read_input_tokens: 20,
            cache_creation_input_tokens: 3,
            output_tokens: 45,
          },
        },
      ),
    );

    await expect(
      provider(fetchImplementation).run({
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

  it("ignores a failed web search instead of inventing sources", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      claudeResponse([
        {
          type: "web_search_tool_result",
          tool_use_id: "srvtoolu_1",
          content: { type: "web_search_tool_result_error", error_code: "unavailable" },
        },
        { type: "text", text: '{"findings":[]}' },
      ]),
    );

    await expect(
      provider(fetchImplementation).run({
        stage: "evaluation",
        mode: "current_web",
        instructions: "Return JSON.",
        input: {},
      }),
    ).resolves.toMatchObject({ providerSources: [] });
  });

  it.each(["refusal", "max_tokens", "pause_turn"])(
    "fails clearly when Claude stops early (%s)",
    async (stopReason) => {
      const fetchImplementation = vi
        .fn()
        .mockResolvedValue(
          claudeResponse([{ type: "text", text: "{}" }], { stop_reason: stopReason }),
        );

      await expect(provider(fetchImplementation).run(profileRequest)).rejects.toThrow(
        `stopped early (${stopReason})`,
      );
    },
  );

  it("rejects malformed JSON rather than passing it to the GEO renderer", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValue(claudeResponse([{ type: "text", text: "not-json" }]));

    await expect(provider(fetchImplementation).run(profileRequest)).rejects.toThrow(
      "malformed JSON",
    );
  });

  it("reports a provider error without exposing its details", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "error",
          error: { type: "authentication_error", message: "bad" },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(provider(fetchImplementation).run(profileRequest)).rejects.toThrow(
      "The GEO provider request failed.",
    );
  });
});
