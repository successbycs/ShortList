import { describe, expect, it } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import { executeAndPersistGeoAssessment } from "./geo-assessment-execution";
import type { ApprovedGeoRuntimeConfiguration } from "./geo-assessment-repository";
import type { GeoModelRequest } from "./geo-assessment-runner";

const configuration: ApprovedGeoRuntimeConfiguration = {
  promptPackage: {
    packageKey: "geo-assessment-v1",
    versionLabel: "1.0.0",
    packageVersionId: "package-version-1",
    packageChecksum: "package-sha",
    inputSchemaVersion: "v1",
    outputSchemaVersion: "v1",
    prohibitedClaims: ["ranking"],
    stages: {
      profile: {
        stage: "profile",
        templateId: "template-profile",
        templateText: "Profile instructions",
        allowedFields: [],
        outputContract: {},
        checksum: "profile-sha",
      },
      icp: {
        stage: "icp",
        templateId: "template-icp",
        templateText: "ICP instructions",
        allowedFields: [],
        outputContract: {},
        checksum: "icp-sha",
      },
      questions: {
        stage: "questions",
        templateId: "template-questions",
        templateText: "Question instructions",
        allowedFields: [],
        outputContract: {},
        checksum: "questions-sha",
      },
      evaluation: {
        stage: "evaluation",
        templateId: "template-evaluation",
        templateText: "Evaluation instructions",
        allowedFields: [],
        outputContract: {},
        checksum: "evaluation-sha",
      },
    },
  },
  currentWebModelProfileId: "model-current-web",
  modelKnowledgeModelProfileId: "model-knowledge",
  modelId: "gpt-6-luna",
  marketProfileId: "market-global",
  marketContext: { scope: "global" },
};

function fakeDatabase(): { database: D1DatabaseLike; queries: string[]; values: unknown[] } {
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
          return { results: [] as T[] };
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

describe("GEO assessment execution", () => {
  it("writes the approved configuration, stage records and honest limited profile", async () => {
    const { database, queries, values } = fakeDatabase();
    let sequence = 0;
    const provider = {
      async run(request: GeoModelRequest) {
        if (request.stage === "profile") {
          return {
            output: {
              businessName: null,
              websiteDomain: "example.test",
              services: [],
              serviceAreas: [],
              audienceSignals: [],
              valuePropositions: [],
              proofPoints: [],
              differentiators: [],
              contentGaps: ["The site has little useful copy."],
              limitations: ["Evidence is sparse."],
              confidence: "low",
            },
            usage: { inputTokens: 111, outputTokens: 12 },
          };
        }
        return {
          output: {
            outcome: "insufficient_evidence" as const,
            reason: "The site does not identify three distinct buyer groups.",
            evidenceIds: ["source-1"],
          },
          usage: { inputTokens: 222, outputTokens: 23 },
        };
      },
    };

    const result = await executeAndPersistGeoAssessment(
      database,
      {
        assessment: {
          assessmentId: "assessment-1",
          executedAtUtc: "2026-10-06T08:00:00.000Z",
          normalisedDomain: "example.test",
          marketContext: configuration.marketContext,
          websiteSources: [
            {
              sourceId: "source-1",
              sourceUrl: "https://example.test/",
              observedAtUtc: "2026-10-06T08:00:00.000Z",
              title: null,
              description: null,
              visibleText: "Brief public website copy.",
              jsonLd: [],
            },
          ],
        },
        configuration,
        createId: () => `id-${++sequence}`,
        evidencePolicyVersion: "safe-fetch-v1",
        reportTemplateVersion: "geo-web-v1",
      },
      provider,
    );

    expect(result.outcome.kind).toBe("insufficient_evidence");
    expect(result.promptExecutionIds).toMatchObject({
      "profile:null": "id-2",
      "icp:null": "id-3",
    });
    expect(queries).toEqual(
      expect.arrayContaining([
        expect.stringContaining("INSERT INTO assessment_configuration_snapshots"),
        expect.stringContaining("INSERT INTO prompt_execution_records"),
        expect.stringContaining("INSERT INTO business_profiles"),
      ]),
    );
    expect(queries).not.toEqual(expect.arrayContaining([expect.stringContaining("ai_evidence")]));
    expect(values).toEqual(expect.arrayContaining([111, 12, 222, 23]));
  });

  it("writes all three ICPs, nine questions and eighteen mode findings for a completed assessment", async () => {
    const { database, queries } = fakeDatabase();
    let sequence = 0;
    const icps = ["homeowners", "property-managers", "renovators"].map((id) => ({
      id,
      label: id,
      audienceDescription: `${id} audience`,
      buyerSituation: "Needs a provider.",
      needs: ["Reliable help"],
      decisionCriteria: ["Clear information"],
      evidenceIds: ["source-1"],
      confidence: "medium" as const,
      uncertainty: "The website is concise.",
    }));
    const questions = icps.flatMap((icp) =>
      [1, 2, 3].map((ordinal) => ({
        id: `${icp.id}-${ordinal}`,
        icpId: icp.id,
        questionText: `Who can help ${icp.id} with need ${ordinal}?`,
        buyerIntent: "Find a provider",
        testedClaim: "The business is relevant.",
      })),
    );
    const profile = {
      businessName: { value: "Example", evidenceIds: ["source-1"], confidence: "high" as const },
      websiteDomain: "example.test",
      services: [],
      serviceAreas: [],
      audienceSignals: [],
      valuePropositions: [],
      proofPoints: [],
      differentiators: [],
      contentGaps: [],
      limitations: [],
      confidence: "medium" as const,
    };
    const findings = {
      findings: questions.map((question) => ({
        questionId: question.id,
        answerSummary: "Evidence-limited answer.",
        submittedBusinessMention: "uncertain" as const,
        descriptionAccuracy: "not_applicable" as const,
        recommendationFit: "uncertain" as const,
        sources: [],
        websiteContentGaps: [],
        limitations: [],
        confidence: "low" as const,
      })),
    };
    const provider = {
      async run(request: GeoModelRequest) {
        if (request.stage === "profile") return profile;
        if (request.stage === "icp") return { outcome: "complete" as const, icps };
        if (request.stage === "questions") return { questions };
        return findings;
      },
    };

    const result = await executeAndPersistGeoAssessment(
      database,
      {
        assessment: {
          assessmentId: "assessment-1",
          executedAtUtc: "2026-10-06T08:00:00.000Z",
          normalisedDomain: "example.test",
          marketContext: configuration.marketContext,
          websiteSources: [
            {
              sourceId: "source-1",
              sourceUrl: "https://example.test/",
              observedAtUtc: "2026-10-06T08:00:00.000Z",
              title: null,
              description: null,
              visibleText: "Public website copy.",
              jsonLd: [],
            },
          ],
        },
        configuration,
        createId: () => `id-${++sequence}`,
        evidencePolicyVersion: "safe-fetch-v1",
        reportTemplateVersion: "geo-web-v1",
      },
      provider,
    );

    expect(result.outcome.kind).toBe("completed");
    expect(queries.filter((query) => query.includes("INSERT INTO icp_hypotheses"))).toHaveLength(3);
    expect(queries.filter((query) => query.includes("INSERT INTO buyer_questions"))).toHaveLength(
      9,
    );
    expect(queries.filter((query) => query.includes("INSERT INTO model_evaluations"))).toHaveLength(
      2,
    );
    expect(
      queries.filter((query) => query.includes("INSERT INTO model_question_findings")),
    ).toHaveLength(18);
  });
});
