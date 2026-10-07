import { describe, expect, it } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import {
  findStoredGeoAssessment,
  loadApprovedGeoPromptPackage,
  recordPromptExecution,
  recordWebsiteSource,
} from "./geo-assessment-repository";

const stages = ["evaluation", "icp", "profile", "questions"] as const;

function templateRow(stage: (typeof stages)[number]) {
  return {
    package_key: "geo-assessment-v1",
    version_label: "1.0.0",
    prompt_package_version_id: "package-version-1",
    package_checksum: "package-sha256",
    input_schema_version: "v1",
    output_schema_version: "v1",
    prohibited_claims_json: '["ranking"]',
    prompt_stage_template_id: `template-${stage}`,
    stage,
    template_text: `${stage} template`,
    allowed_fields_json: '["assessment_id"]',
    output_contract_json: '{"type":"object"}',
    template_checksum: `${stage}-sha256`,
  };
}

function fakeDatabase(rows: unknown[] = []): {
  database: D1DatabaseLike;
  queries: string[];
  values: unknown[];
} {
  const queries: string[] = [];
  const values: unknown[] = [];
  const database: D1DatabaseLike = {
    prepare(query) {
      queries.push(query);
      const statement: D1StatementLike = {
        bind(...boundValues) {
          values.push(...boundValues);
          return statement;
        },
        async first<T>() {
          return null as T | null;
        },
        async all<T>() {
          return { results: rows as T[] };
        },
        async run() {
          return { success: true };
        },
      };
      return statement;
    },
  };
  return { database, queries, values };
}

describe("GEO assessment repository", () => {
  it("loads only an explicitly named approved package with all four stages", async () => {
    const { database, queries, values } = fakeDatabase(stages.map(templateRow));

    const packageVersion = await loadApprovedGeoPromptPackage(database, {
      packageKey: "geo-assessment-v1",
      versionLabel: "1.0.0",
    });

    expect(values).toEqual(["geo-assessment-v1", "1.0.0"]);
    expect(queries[0]).toContain("version.lifecycle = 'approved'");
    expect(packageVersion.stages.icp.templateText).toBe("icp template");
    expect(packageVersion.prohibitedClaims).toEqual(["ranking"]);
  });

  it("rejects a missing prompt stage instead of falling back to a partial package", async () => {
    const { database } = fakeDatabase(stages.slice(0, 3).map(templateRow));

    await expect(
      loadApprovedGeoPromptPackage(database, {
        packageKey: "geo-assessment-v1",
        versionLabel: "1.0.0",
      }),
    ).rejects.toThrow("incomplete or unavailable");
  });

  it("records bounded JSON data using parameters rather than interpolating it into SQL", async () => {
    const { database, queries, values } = fakeDatabase();

    await recordPromptExecution(database, {
      promptExecutionId: "execution-1",
      assessmentId: "assessment-1",
      promptStageTemplateId: "template-profile",
      modelTestProfileId: null,
      stage: "profile",
      safeInput: { evidenceIds: ["evidence-1"] },
      renderedPrompt: "profile prompt",
      output: { businessName: "Example" },
      outcome: "completed",
      reasonCode: "completed",
      executedAtUtc: "2026-10-06T06:00:00.000Z",
      inputTokens: 100,
      outputTokens: 50,
      estimatedSpendUsd: 0.01,
    });

    expect(queries[0]).toContain("VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    expect(values).toContain(JSON.stringify({ evidenceIds: ["evidence-1"] }));
    expect(values).toContain(JSON.stringify({ businessName: "Example" }));
  });

  it("stores a bounded website source with its legacy evidence link", async () => {
    const { database, queries, values } = fakeDatabase();

    await recordWebsiteSource(database, {
      websiteSourceId: "source-1",
      assessmentId: "assessment-1",
      websiteEvidenceId: "evidence-1",
      sourceUrl: "https://example.nz/",
      observedAtUtc: "2026-10-06T06:00:00.000Z",
      contentType: "text/html",
      title: "Example",
      description: "Example description",
      visibleText: "Bounded text only",
      jsonLd: [{ "@type": "LocalBusiness", name: "Example" }],
      extractionVersion: "website-evidence-v2",
    });

    expect(queries[0]).toContain("INSERT INTO website_sources");
    expect(values).toContain(JSON.stringify([{ "@type": "LocalBusiness", name: "Example" }]));
    expect(values).not.toContain("Authorization");
  });

  it("reconstructs a completed GEO graph only when both modes contain all nine findings", async () => {
    const profile = {
      businessName: null,
      websiteDomain: "example.test",
      services: [],
      serviceAreas: [],
      audienceSignals: [],
      valuePropositions: [],
      proofPoints: [],
      differentiators: [],
      contentGaps: [],
      limitations: [],
      confidence: "low",
    };
    const icp = (id: string) => ({
      id,
      label: id,
      audienceDescription: "Example audience",
      buyerSituation: "Example situation",
      needs: ["A need"],
      decisionCriteria: ["A criterion"],
      evidenceIds: ["source-1"],
      confidence: "low",
      uncertainty: "Limited evidence",
    });
    const findingRows = (["current_web", "model_knowledge"] as const).flatMap((mode) =>
      Array.from({ length: 9 }, (_, index) => ({
        mode,
        icpId: ["one", "two", "three"][Math.floor(index / 3)]!,
        questionId: `${mode}-question-${index + 1}`,
        questionText: `Question ${index + 1}`,
        buyerIntent: "Find a provider",
        testedClaim: "Relevant provider",
        answerSummary: "Limited answer",
        submittedBusinessMention: "uncertain",
        descriptionAccuracy: "not_applicable",
        recommendationFit: "uncertain",
        sources_json: "[]",
        website_content_gaps_json: "[]",
        limitations_json: '["Limited evidence"]',
        confidence: "low",
      })),
    );
    const database: D1DatabaseLike = {
      prepare(query) {
        const statement: D1StatementLike = {
          bind() {
            return statement;
          },
          async first<T>() {
            return {
              assessment_id: "assessment-1",
              normalised_domain: "example.test",
              triggered_at_utc: "2026-10-06T08:00:00.000Z",
              bounded_excerpt: "Example website evidence.",
              profile_json: JSON.stringify(profile),
            } as T;
          },
          async all<T>() {
            if (query.includes("SELECT icp_json")) {
              return {
                results: [icp("one"), icp("two"), icp("three")].map((value) => ({
                  icp_json: JSON.stringify(value),
                })) as T[],
              };
            }
            return { results: findingRows as T[] };
          },
          async run() {
            return { success: true };
          },
        };
        return statement;
      },
    };

    await expect(findStoredGeoAssessment(database, "example.test")).resolves.toMatchObject({
      assessmentId: "assessment-1",
      icps: [{ id: "one" }, { id: "two" }, { id: "three" }],
      findings: {
        current_web: expect.arrayContaining([
          expect.objectContaining({ icpId: "one", questionText: "Question 1" }),
        ]),
        model_knowledge: expect.arrayContaining([
          expect.objectContaining({ icpId: "one", questionText: "Question 1" }),
        ]),
      },
    });
  });
});
