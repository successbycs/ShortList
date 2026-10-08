import { describe, expect, it } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import { findLegacyComparableBusinessAssessment } from "./legacy-ai-search";

const storedRows = [
  {
    assessment_id: "assessment-1",
    normalised_domain: "example.co.nz",
    triggered_at_utc: "2026-10-05T10:00:00.000Z",
    bounded_excerpt: "Example Gardens provides garden care.",
    mode: "web_grounded",
    question: "Which garden businesses appear today?",
    executed_at_utc: "2026-10-05T10:00:01.000Z",
    model_id: "gpt-6-luna",
    search_configuration_ref: "legacy-web",
    location_context_json: JSON.stringify({ kind: "global_no_default_location" }),
    observed_results_json: JSON.stringify([]),
    citations_json: JSON.stringify([]),
    freshness_notice: null,
    outcome: "completed",
    reason_code: "completed",
    input_tokens: null,
    output_tokens: null,
    estimated_spend_usd: null,
    contract_version: "v1",
  },
  {
    assessment_id: "assessment-1",
    normalised_domain: "example.co.nz",
    triggered_at_utc: "2026-10-05T10:00:00.000Z",
    bounded_excerpt: "Example Gardens provides garden care.",
    mode: "model_knowledge",
    question: "Which garden businesses may be known?",
    executed_at_utc: "2026-10-05T10:00:01.000Z",
    model_id: "gpt-6-luna",
    search_configuration_ref: "legacy-no-web",
    location_context_json: JSON.stringify({ kind: "no_web_search" }),
    observed_results_json: JSON.stringify([]),
    citations_json: JSON.stringify([]),
    freshness_notice: "May be out of date.",
    outcome: "completed",
    reason_code: "completed",
    input_tokens: null,
    output_tokens: null,
    estimated_spend_usd: null,
    contract_version: "v1",
  },
];

function databaseWithStoredLegacyResult(): D1DatabaseLike {
  return {
    prepare() {
      const statement: D1StatementLike = {
        bind() {
          return statement;
        },
        async first<T>() {
          return null as T | null;
        },
        async all<T>() {
          return { results: storedRows as T[] };
        },
        async run() {
          return { success: true };
        },
      };
      return statement;
    },
  };
}

describe("legacy comparable-business compatibility", () => {
  it("reads a complete historic record without constructing a new assessment request", async () => {
    const result = await findLegacyComparableBusinessAssessment(
      databaseWithStoredLegacyResult(),
      "example.co.nz",
    );

    expect(result).toMatchObject({
      assessmentId: "assessment-1",
      normalisedDomain: "example.co.nz",
      currentWeb: { mode: "web_grounded" },
      modelKnowledge: { mode: "model_knowledge" },
    });
  });
});
