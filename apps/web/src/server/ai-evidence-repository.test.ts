import { describe, expect, it } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import { recordAiEvidence } from "./ai-evidence-repository";

function fakeDatabase(): { database: D1DatabaseLike; values: unknown[] } {
  const values: unknown[] = [];
  const database: D1DatabaseLike = {
    prepare() {
      const statement: D1StatementLike = {
        bind(...boundValues) {
          values.push(...boundValues);
          return statement;
        },
        async first<T>() {
          return null as T | null;
        },
        async all<T>() {
          return { results: [] as T[] };
        },
        async run() {
          return { success: true };
        },
      };
      return statement;
    },
  };
  return { database, values };
}

describe("AI evidence repository", () => {
  it("stores only structured, serialised evidence and bounded usage", async () => {
    const { database, values } = fakeDatabase();

    await recordAiEvidence(database, "ai-1", {
      contractVersion: "v1",
      assessmentId: "assessment-1",
      mode: "web_grounded",
      question: "Which Auckland gardeners appear today?",
      executedAtUtc: "2026-10-05T10:00:00.000Z",
      modelId: "gpt-6-luna",
      searchConfigurationRef: "mvp1-web-low-auckland",
      locationContext: {
        kind: "web_search_location",
        city: "Auckland",
        region: "Auckland",
        country: "NZ",
        timezone: "Pacific/Auckland",
      },
      observedResults: [{ position: 1, name: "Example", summary: "Garden care" }],
      citations: [{ title: "Example", url: "https://example.co.nz" }],
      outcome: "completed",
      reasonCode: "completed",
      usage: { inputTokens: 100, outputTokens: 50, estimatedSpendUsd: 0.01 },
    });

    expect(values).toContain("ai-1");
    expect(values).toContain(
      JSON.stringify([{ position: 1, name: "Example", summary: "Garden care" }]),
    );
    expect(values).not.toContain("Bearer");
  });
});
