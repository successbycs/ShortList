import { describe, expect, it } from "vitest";

import { createAiRequests } from "./live-assessment";

describe("live assessment request builder", () => {
  it("builds one global current-web request and one no-web request", () => {
    const [currentWeb, modelKnowledge] = createAiRequests(
      { assessmentId: "assessment-1", normalisedDomain: "greengeckogardens.co.nz" },
      "Green Gecko Gardens provides garden design and maintenance in Auckland.",
      new Date("2026-10-05T10:00:00.000Z"),
    );

    expect(currentWeb.mode).toBe("web_grounded");
    expect(currentWeb.configuration.locationContext).toEqual({
      kind: "global_no_default_location",
    });
    expect(currentWeb.question).toContain("greengeckogardens.co.nz");
    expect(currentWeb.question).not.toContain("Auckland businesses");
    expect(modelKnowledge.mode).toBe("model_knowledge");
    expect(modelKnowledge.configuration.locationContext).toEqual({ kind: "no_web_search" });
    expect(modelKnowledge.question).toContain("Without a live web search");
    expect(currentWeb.limits.maxInputTokens).toBe(16_000);
    expect(currentWeb.maximumOutputTokens).toBe(600);
    expect(currentWeb.estimatedSpendUsd).toBe(0.01);
    expect(currentWeb.estimatedSpendUsd + modelKnowledge.estimatedSpendUsd).toBeLessThanOrEqual(
      0.02,
    );
  });
});
