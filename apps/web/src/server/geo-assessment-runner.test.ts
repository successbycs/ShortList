import { describe, expect, it } from "vitest";

import type { ApprovedGeoPromptPackage } from "./geo-assessment-repository";
import { runGeoAssessment, type GeoModelRequest } from "./geo-assessment-runner";

const promptPackage: ApprovedGeoPromptPackage = {
  packageKey: "geo-assessment-v1",
  versionLabel: "1.0.0",
  packageVersionId: "package-1",
  packageChecksum: "package-sha",
  inputSchemaVersion: "v1",
  outputSchemaVersion: "v1",
  prohibitedClaims: ["ranking"],
  stages: {
    profile: {
      stage: "profile",
      templateId: "profile-template",
      templateText: "Profile JSON instructions",
      allowedFields: [],
      outputContract: {},
      checksum: "profile-sha",
    },
    icp: {
      stage: "icp",
      templateId: "icp-template",
      templateText: "ICP JSON instructions",
      allowedFields: [],
      outputContract: {},
      checksum: "icp-sha",
    },
    questions: {
      stage: "questions",
      templateId: "questions-template",
      templateText: "Questions JSON instructions",
      allowedFields: [],
      outputContract: {},
      checksum: "questions-sha",
    },
    evaluation: {
      stage: "evaluation",
      templateId: "evaluation-template",
      templateText: "Evaluation JSON instructions",
      allowedFields: [],
      outputContract: {},
      checksum: "evaluation-sha",
    },
  },
};

const profile = {
  businessName: { value: "Example Gardens", evidenceIds: ["source-1"], confidence: "high" },
  websiteDomain: "example-gardens.test",
  services: [{ value: "Garden maintenance", evidenceIds: ["source-1"], confidence: "high" }],
  serviceAreas: [],
  audienceSignals: [{ value: "Homeowners", evidenceIds: ["source-1"], confidence: "medium" }],
  valuePropositions: [],
  proofPoints: [],
  differentiators: [],
  contentGaps: [],
  limitations: [],
  confidence: "medium",
} as const;

const icps = ["busy-homeowners", "property-managers", "garden-renovators"].map((id) => ({
  id,
  label: id,
  audienceDescription: `${id} audience`,
  buyerSituation: "Needs reliable help",
  needs: ["A trusted provider"],
  decisionCriteria: ["Clear services"],
  evidenceIds: ["source-1"],
  confidence: "medium" as const,
  uncertainty: "Website copy is brief.",
}));

const questions = icps.flatMap((icp) =>
  [1, 2, 3].map((ordinal) => ({
    id: `${icp.id}-${ordinal}`,
    icpId: icp.id,
    questionText: `Who can help with ${icp.id} need ${ordinal}?`,
    buyerIntent: "Find a provider",
    testedClaim: "The business is a relevant provider.",
  })),
);

function findings() {
  return {
    findings: questions.map((question) => ({
      questionId: question.id,
      answerSummary: "An evidence-limited answer.",
      submittedBusinessMention: "uncertain" as const,
      descriptionAccuracy: "not_applicable" as const,
      recommendationFit: "uncertain" as const,
      sources: [],
      websiteContentGaps: ["Clarify services"],
      limitations: ["Limited evidence"],
      confidence: "low" as const,
    })),
  };
}

describe("GEO assessment runner", () => {
  it("derives the same nine questions for distinct current-web and no-web evaluations", async () => {
    const calls: GeoModelRequest[] = [];
    const provider = {
      async run(request: GeoModelRequest) {
        calls.push(request);
        if (request.stage === "profile") return profile;
        if (request.stage === "icp") return { outcome: "complete" as const, icps };
        if (request.stage === "questions") return { questions };
        return findings();
      },
    };

    const result = await runGeoAssessment(
      {
        assessmentId: "assessment-1",
        executedAtUtc: "2026-10-06T06:00:00.000Z",
        normalisedDomain: "example-gardens.test",
        marketContext: { profile: "global-v1" },
        websiteSources: [
          {
            sourceId: "source-1",
            sourceUrl: "https://example-gardens.test/",
            observedAtUtc: "2026-10-06T06:00:00.000Z",
            title: "Example Gardens",
            description: null,
            visibleText: "Garden care for homeowners.",
            jsonLd: [],
          },
        ],
      },
      promptPackage,
      provider,
    );

    expect(result.kind).toBe("completed");
    expect(calls.map((call) => [call.stage, call.mode])).toEqual([
      ["profile", null],
      ["icp", null],
      ["questions", null],
      ["evaluation", "current_web"],
      ["evaluation", "model_knowledge"],
    ]);
    const currentWeb = calls.find((call) => call.mode === "current_web");
    const modelKnowledge = calls.find((call) => call.mode === "model_knowledge");
    expect(currentWeb?.input["buyer_questions"]).toEqual(modelKnowledge?.input["buyer_questions"]);
  });

  it("ends honestly when the ICP stage says the website evidence is insufficient", async () => {
    const calls: GeoModelRequest[] = [];
    const provider = {
      async run(request: GeoModelRequest) {
        calls.push(request);
        if (request.stage === "profile") return profile;
        return {
          outcome: "insufficient_evidence" as const,
          reason: "The website does not identify distinct buyer groups.",
          evidenceIds: ["source-1"],
        };
      },
    };

    const result = await runGeoAssessment(
      {
        assessmentId: "assessment-1",
        executedAtUtc: "2026-10-06T06:00:00.000Z",
        normalisedDomain: "example-gardens.test",
        marketContext: { profile: "global-v1" },
        websiteSources: [
          {
            sourceId: "source-1",
            sourceUrl: "https://example-gardens.test/",
            observedAtUtc: "2026-10-06T06:00:00.000Z",
            title: null,
            description: null,
            visibleText: "Garden care.",
            jsonLd: [],
          },
        ],
      },
      promptPackage,
      provider,
    );

    expect(result).toMatchObject({ kind: "insufficient_evidence" });
    expect(calls).toHaveLength(2);
  });

  it("exposes each completed stage for the durable execution record", async () => {
    const stages: Array<[string, string | null]> = [];
    const provider = {
      async run(request: GeoModelRequest) {
        if (request.stage === "profile") return profile;
        if (request.stage === "icp") return { outcome: "complete" as const, icps };
        if (request.stage === "questions") return { questions };
        return findings();
      },
    };

    await runGeoAssessment(
      {
        assessmentId: "assessment-1",
        executedAtUtc: "2026-10-06T06:00:00.000Z",
        normalisedDomain: "example-gardens.test",
        marketContext: { profile: "global-v1" },
        websiteSources: [
          {
            sourceId: "source-1",
            sourceUrl: "https://example-gardens.test/",
            observedAtUtc: "2026-10-06T06:00:00.000Z",
            title: null,
            description: null,
            visibleText: "Garden care.",
            jsonLd: [],
          },
        ],
      },
      promptPackage,
      provider,
      {
        onStageCompleted: async (execution) => {
          stages.push([execution.stage, execution.mode]);
        },
      },
    );

    expect(stages).toEqual([
      ["profile", null],
      ["icp", null],
      ["questions", null],
      ["evaluation", "current_web"],
      ["evaluation", "model_knowledge"],
    ]);
  });

  it("uses provider metadata, not model-authored URLs, for current-web sources", async () => {
    const provider = {
      async run(request: GeoModelRequest) {
        if (request.stage === "profile") return profile;
        if (request.stage === "icp") return { outcome: "complete" as const, icps };
        if (request.stage === "questions") return { questions };
        return {
          output: {
            findings: findings().findings.map((finding) => ({
              ...finding,
              sources: [{ title: "Model-invented", url: "https://invented.test" }],
            })),
          },
          ...(request.mode === "current_web"
            ? { providerSources: [{ title: "Provider source", url: "https://provider.test" }] }
            : {}),
        };
      },
    };

    const result = await runGeoAssessment(
      {
        assessmentId: "assessment-1",
        executedAtUtc: "2026-10-06T06:00:00.000Z",
        normalisedDomain: "example-gardens.test",
        marketContext: { profile: "global-v1" },
        websiteSources: [
          {
            sourceId: "source-1",
            sourceUrl: "https://example-gardens.test/",
            observedAtUtc: "2026-10-06T06:00:00.000Z",
            title: null,
            description: null,
            visibleText: "Garden care.",
            jsonLd: [],
          },
        ],
      },
      promptPackage,
      provider,
    );

    expect(result).toMatchObject({ kind: "completed" });
    if (result.kind !== "completed") throw new Error("Expected complete GEO assessment.");
    expect(result.evaluations.current_web.findings[0]?.sources).toEqual([
      { title: "Provider source", url: "https://provider.test" },
    ]);
    expect(result.evaluations.model_knowledge.findings[0]?.sources).toEqual([]);
  });

  it("does not record a stage until its provider output passes the schema", async () => {
    const completedStages: string[] = [];
    const provider = {
      async run() {
        return { websiteDomain: "example-gardens.test" };
      },
    };

    await expect(
      runGeoAssessment(
        {
          assessmentId: "assessment-1",
          executedAtUtc: "2026-10-06T06:00:00.000Z",
          normalisedDomain: "example-gardens.test",
          marketContext: { profile: "global-v1" },
          websiteSources: [
            {
              sourceId: "source-1",
              sourceUrl: "https://example-gardens.test/",
              observedAtUtc: "2026-10-06T06:00:00.000Z",
              title: null,
              description: null,
              visibleText: "Garden care.",
              jsonLd: [],
            },
          ],
        },
        promptPackage,
        provider,
        {
          onStageCompleted: async (execution) => {
            completedStages.push(execution.stage);
          },
        },
      ),
    ).rejects.toThrow();

    expect(completedStages).toEqual([]);
  });

  it("requires provider usage when a whole-run token limit is configured", async () => {
    const provider = {
      async run() {
        return profile;
      },
    };

    await expect(
      runGeoAssessment(
        {
          assessmentId: "assessment-1",
          executedAtUtc: "2026-10-06T06:00:00.000Z",
          normalisedDomain: "example-gardens.test",
          marketContext: { profile: "global-v1" },
          websiteSources: [
            {
              sourceId: "source-1",
              sourceUrl: "https://example-gardens.test/",
              observedAtUtc: "2026-10-06T06:00:00.000Z",
              title: null,
              description: null,
              visibleText: "Garden care.",
              jsonLd: [],
            },
          ],
        },
        promptPackage,
        provider,
        { tokenLimits: { maxInputTokens: 10, maxOutputTokens: 10 } },
      ),
    ).rejects.toThrow("did not return required usage metadata");
  });

  it("rejects a stage that exceeds the aggregate token ceiling before recording it", async () => {
    const completedStages: string[] = [];
    const provider = {
      async run() {
        return { output: profile, usage: { inputTokens: 11, outputTokens: 1 } };
      },
    };

    await expect(
      runGeoAssessment(
        {
          assessmentId: "assessment-1",
          executedAtUtc: "2026-10-06T06:00:00.000Z",
          normalisedDomain: "example-gardens.test",
          marketContext: { profile: "global-v1" },
          websiteSources: [
            {
              sourceId: "source-1",
              sourceUrl: "https://example-gardens.test/",
              observedAtUtc: "2026-10-06T06:00:00.000Z",
              title: null,
              description: null,
              visibleText: "Garden care.",
              jsonLd: [],
            },
          ],
        },
        promptPackage,
        provider,
        {
          tokenLimits: { maxInputTokens: 10, maxOutputTokens: 10 },
          onStageCompleted: async (execution) => {
            completedStages.push(execution.stage);
          },
        },
      ),
    ).rejects.toThrow("exceeded its aggregate token limit");

    expect(completedStages).toEqual([]);
  });

  it("rejects profile evidence that was not captured from the assessed website", async () => {
    const provider = {
      async run() {
        return {
          ...profile,
          businessName: {
            value: "Example Gardens",
            evidenceIds: ["unknown-source"],
            confidence: "high" as const,
          },
        };
      },
    };

    await expect(
      runGeoAssessment(
        {
          assessmentId: "assessment-1",
          executedAtUtc: "2026-10-06T06:00:00.000Z",
          normalisedDomain: "example-gardens.test",
          marketContext: { profile: "global-v1" },
          websiteSources: [
            {
              sourceId: "source-1",
              sourceUrl: "https://example-gardens.test/",
              observedAtUtc: "2026-10-06T06:00:00.000Z",
              title: null,
              description: null,
              visibleText: "Garden care.",
              jsonLd: [],
            },
          ],
        },
        promptPackage,
        provider,
      ),
    ).rejects.toThrow("business profile references evidence that was not captured");
  });
});
