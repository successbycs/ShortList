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

const searchResult = {
  type: "web_search_result",
  title: "Example source",
  url: "https://example.test/source",
  encrypted_content: "abc",
  page_age: null,
};

/** A research reply: a search, its results (one duplicated) and plain notes. */
function researchResponse(extra: Record<string, unknown> = {}) {
  return claudeResponse(
    [
      { type: "text", text: "I'll search for that." },
      { type: "server_tool_use", id: "srvtoolu_1", name: "web_search", input: { query: "x" } },
      {
        type: "web_search_tool_result",
        tool_use_id: "srvtoolu_1",
        content: [searchResult, searchResult],
      },
      { type: "text", text: "Notes: Example Co is recommended." },
    ],
    extra,
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

type Schema = Record<string, unknown>;

const profileRequest = {
  stage: "profile",
  mode: null,
  instructions: "Return JSON.",
  input: {},
} as const;

const currentWebRequest = {
  stage: "evaluation",
  mode: "current_web",
  instructions: "Evaluate.",
  input: { buyer_questions: ["same-question"] },
} as const;

describe("Claude GEO Messages provider", () => {
  // The provider runs in a Cloudflare Worker. The shared test setup imitates a
  // browser, where the Claude SDK refuses to run, so hide the browser window.
  beforeEach(() => vi.stubGlobal("window", undefined));
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["profile", (schema: Schema) => expect(schema["required"]).toContain("businessName")],
    ["icp", (schema: Schema) => expect(schema["anyOf"]).toHaveLength(2)],
    ["questions", (schema: Schema) => expect(schema["required"]).toEqual(["questions"])],
    ["evaluation", (schema: Schema) => expect(schema["required"]).toEqual(["findings"])],
  ] as const)(
    "sends the %s stage its own schema in one call, without tools",
    async (stage, check) => {
      const fetchImplementation = vi
        .fn()
        .mockResolvedValue(claudeResponse([{ type: "text", text: "{}" }]));

      await provider(fetchImplementation).run({
        stage,
        mode: stage === "evaluation" ? "model_knowledge" : null,
        instructions: "Return JSON.",
        input: { a: 1 },
      });

      expect(fetchImplementation).toHaveBeenCalledTimes(1);
      const body = sentBody(fetchImplementation, 0);
      expect(body.model).toBe("claude-haiku-5-5");
      expect(body.system).toBe("Return JSON.");
      expect(body.messages).toEqual([{ role: "user", content: '{"a":1}' }]);
      expect(body.output_config.format.type).toBe("json_schema");
      check(body.output_config.format.schema);
      expect(body.tools).toBeUndefined();
      expect(JSON.stringify(body)).not.toContain("test-key");
    },
  );

  it("asks for numbered slots so list lengths are guaranteed, and returns lists", async () => {
    const slots = Object.fromEntries(
      [2, 1, 3, 4, 5, 6, 7, 8, 9].map((n) => [`question_${n}`, { id: `q${n}` }]),
    );
    const fetchImplementation = vi
      .fn()
      .mockResolvedValue(
        claudeResponse([{ type: "text", text: JSON.stringify({ questions: slots }) }]),
      );

    const result = await provider(fetchImplementation).run({
      stage: "questions",
      mode: null,
      instructions: "Return JSON.",
      input: {},
    });

    const schema = sentBody(fetchImplementation, 0).output_config.format.schema;
    expect(schema.properties.questions.required).toEqual(
      Array.from({ length: 9 }, (_, index) => `question_${index + 1}`),
    );
    expect(result).toMatchObject({
      output: { questions: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ id: `q${n}` })) },
    });
  });

  it("limits evidence IDs to the captured website pages", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValue(claudeResponse([{ type: "text", text: "{}" }]));

    await provider(fetchImplementation).run({
      stage: "profile",
      mode: null,
      instructions: "Return JSON.",
      input: { website_sources: [{ sourceId: "src-1" }, { sourceId: "src-2" }] },
    });

    const schema = sentBody(fetchImplementation, 0).output_config.format.schema;
    expect(schema.properties.services.items.properties.evidenceIds).toEqual({
      type: "array",
      items: { type: "string", enum: ["src-1", "src-2"] },
    });
  });

  it("names each finding slot by its question and fills in the question ID and sources", async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      claudeResponse([
        {
          type: "text",
          text: JSON.stringify({
            findings: { "q-a": { answerSummary: "A" }, "q-b": { answerSummary: "B" } },
          }),
        },
      ]),
    );

    const result = await provider(fetchImplementation).run({
      stage: "evaluation",
      mode: "model_knowledge",
      instructions: "Return JSON.",
      input: { buyer_questions: [{ id: "q-a" }, { id: "q-b" }] },
    });

    const schema = sentBody(fetchImplementation, 0).output_config.format.schema;
    expect(schema.properties.findings.required).toEqual(["q-a", "q-b"]);
    expect(schema.properties.findings.properties["q-a"]).toEqual({ $ref: "#/$defs/finding" });
    expect(schema.$defs.finding.required).not.toContain("sources");
    expect(result).toMatchObject({
      output: {
        findings: [
          { questionId: "q-a", answerSummary: "A", sources: [] },
          { questionId: "q-b", answerSummary: "B", sources: [] },
        ],
      },
    });
  });

  it("researches with web search first, then writes structured findings without tools", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(
        researchResponse({
          usage: { input_tokens: 900, cache_read_input_tokens: 10, output_tokens: 50 },
        }),
      )
      .mockResolvedValueOnce(claudeResponse([{ type: "text", text: '{"findings":[]}' }]));

    const result = await provider(fetchImplementation).run(currentWebRequest);

    const research = sentBody(fetchImplementation, 0);
    expect(research.tools).toEqual([
      { type: "web_search_20250305", name: "web_search", max_uses: 3 },
    ]);
    expect(research.output_config.format).toBeUndefined();
    expect(research.system).toContain("Evaluate.");
    expect(research.system).toContain("use the web_search tool");

    const structured = sentBody(fetchImplementation, 1);
    expect(structured.tools).toBeUndefined();
    expect(structured.system).toBe("Evaluate.");
    expect(structured.output_config.format.schema.required).toEqual(["findings"]);
    expect(JSON.parse(structured.messages[0].content)).toEqual({
      buyer_questions: ["same-question"],
      current_web_research_notes: "Notes: Example Co is recommended.",
    });

    expect(result).toEqual({
      output: { findings: [] },
      providerSources: [{ title: "Example source", url: "https://example.test/source" }],
      usage: { inputTokens: 1_010, outputTokens: 70 },
    });
  });

  it.each([
    ["skipped", [{ type: "text", text: "From memory: Example Co." }]],
    [
      "failed",
      [
        {
          type: "web_search_tool_result",
          tool_use_id: "srvtoolu_1",
          content: { type: "web_search_tool_result_error", error_code: "unavailable" },
        },
        { type: "text", text: "Notes." },
      ],
    ],
  ] as const)(
    "fails the current-web evaluation when the web search was %s",
    async (_case, content) => {
      const fetchImplementation = vi.fn().mockResolvedValue(claudeResponse([...content]));

      await expect(provider(fetchImplementation).run(currentWebRequest)).rejects.toThrow(
        "no web search results",
      );
      expect(fetchImplementation).toHaveBeenCalledTimes(1);
    },
  );

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
