import type { D1DatabaseLike } from "./assessment-repository";
import {
  type ApprovedGeoRuntimeConfiguration,
  recordAssessmentConfigurationSnapshot,
  recordBusinessProfile,
  recordBuyerQuestion,
  recordIcpHypothesis,
  recordModelEvaluation,
  recordModelQuestionFinding,
  recordPromptExecution,
} from "./geo-assessment-repository";
import {
  runGeoAssessment,
  type GeoAssessmentInput,
  type GeoAssessmentOutcome,
  type GeoModelProvider,
  type GeoRunTokenLimits,
  type GeoStageExecution,
} from "./geo-assessment-runner";

type CreateId = () => string;

export type ExecuteAndPersistGeoAssessmentInput = {
  assessment: GeoAssessmentInput;
  configuration: ApprovedGeoRuntimeConfiguration;
  createId: CreateId;
  evidencePolicyVersion: string;
  reportTemplateVersion: string;
  tokenLimits?: GeoRunTokenLimits;
};

export type PersistedGeoAssessment = {
  outcome: GeoAssessmentOutcome;
  businessProfileId: string;
  promptExecutionIds: Readonly<Record<string, string>>;
};

/**
 * Runs the approved GEO method and writes its reviewable graph. The caller has
 * already passed safe website evidence and selected the approved configuration;
 * this boundary never accepts browser-selected prompts, models or market data.
 */
export async function executeAndPersistGeoAssessment(
  database: D1DatabaseLike,
  input: ExecuteAndPersistGeoAssessmentInput,
  provider: GeoModelProvider,
): Promise<PersistedGeoAssessment> {
  const { assessment, configuration, createId } = input;
  const executedAtUtc = assessment.executedAtUtc;
  const snapshotId = createId();
  await recordAssessmentConfigurationSnapshot(database, {
    snapshotId,
    assessmentId: assessment.assessmentId,
    promptPackageVersionId: configuration.promptPackage.packageVersionId,
    currentWebModelProfileId: configuration.currentWebModelProfileId,
    modelKnowledgeProfileId: configuration.modelKnowledgeModelProfileId,
    marketProfileId: configuration.marketProfileId,
    evidencePolicyVersion: input.evidencePolicyVersion,
    reportTemplateVersion: input.reportTemplateVersion,
    capturedAtUtc: executedAtUtc,
  });

  const promptExecutionIds: Record<string, string> = {};
  const outcome = await runGeoAssessment(assessment, configuration.promptPackage, provider, {
    ...(input.tokenLimits ? { tokenLimits: input.tokenLimits } : {}),
    onStageCompleted: async (execution) => {
      const executionId = createId();
      promptExecutionIds[executionKey(execution)] = executionId;
      await recordPromptExecution(database, {
        promptExecutionId: executionId,
        assessmentId: assessment.assessmentId,
        promptStageTemplateId: configuration.promptPackage.stages[execution.stage].templateId,
        modelTestProfileId: modelProfileIdForExecution(configuration, execution),
        stage: execution.stage,
        safeInput: execution.input,
        renderedPrompt: execution.instructions,
        output: isRecord(execution.output) ? execution.output : null,
        outcome: "completed",
        reasonCode: "completed",
        executedAtUtc,
        inputTokens: execution.usage?.inputTokens ?? null,
        outputTokens: execution.usage?.outputTokens ?? null,
        estimatedSpendUsd: null,
      });
    },
  });

  const profileExecutionId = requiredExecutionId(promptExecutionIds, "profile:null");
  const businessProfileId = createId();
  await recordBusinessProfile(database, {
    businessProfileId,
    assessmentId: assessment.assessmentId,
    promptExecutionId: profileExecutionId,
    profile: outcome.profile,
    outcome: outcome.kind === "completed" ? "completed" : "limited",
    createdAtUtc: executedAtUtc,
  });

  if (outcome.kind === "insufficient_evidence") {
    return { outcome, businessProfileId, promptExecutionIds };
  }

  const icpExecutionId = requiredExecutionId(promptExecutionIds, "icp:null");
  const questionExecutionId = requiredExecutionId(promptExecutionIds, "questions:null");
  const icpIds = new Map<string, string>();
  for (const [index, icp] of outcome.icps.entries()) {
    const icpId = createId();
    icpIds.set(icp.id, icpId);
    await recordIcpHypothesis(database, {
      icpHypothesisId: icpId,
      assessmentId: assessment.assessmentId,
      businessProfileId,
      promptExecutionId: icpExecutionId,
      ordinal: index + 1,
      label: icp.label,
      icp,
      evidenceIds: icp.evidenceIds,
      confidence: icp.confidence,
      uncertainty: icp.uncertainty,
      createdAtUtc: executedAtUtc,
    });
  }

  const questionIds = new Map<string, string>();
  for (const question of outcome.questions) {
    const icpId = icpIds.get(question.icpId);
    if (icpId === undefined) throw new Error("A GEO buyer question references an unknown ICP.");
    const ordinalWithinIcp =
      outcome.questions
        .filter((candidate) => candidate.icpId === question.icpId)
        .indexOf(question) + 1;
    const questionId = createId();
    questionIds.set(question.id, questionId);
    await recordBuyerQuestion(database, {
      buyerQuestionId: questionId,
      assessmentId: assessment.assessmentId,
      icpHypothesisId: icpId,
      promptExecutionId: questionExecutionId,
      ordinalWithinIcp,
      questionText: question.questionText,
      buyerIntent: question.buyerIntent,
      testedClaim: question.testedClaim,
      createdAtUtc: executedAtUtc,
    });
  }

  for (const mode of ["current_web", "model_knowledge"] as const) {
    const promptExecutionId = requiredExecutionId(promptExecutionIds, `evaluation:${mode}`);
    const modelEvaluationId = createId();
    await recordModelEvaluation(database, {
      modelEvaluationId,
      assessmentId: assessment.assessmentId,
      promptExecutionId,
      modelTestProfileId:
        mode === "current_web"
          ? configuration.currentWebModelProfileId
          : configuration.modelKnowledgeModelProfileId,
      mode,
      executedAtUtc,
      outcome: "completed",
      reasonCode: "completed",
    });
    for (const finding of outcome.evaluations[mode].findings) {
      const buyerQuestionId = questionIds.get(finding.questionId);
      if (buyerQuestionId === undefined) {
        throw new Error("A GEO finding references an unknown buyer question.");
      }
      await recordModelQuestionFinding(database, {
        findingId: createId(),
        modelEvaluationId,
        buyerQuestionId,
        answerSummary: finding.answerSummary,
        submittedBusinessMention: finding.submittedBusinessMention,
        descriptionAccuracy: finding.descriptionAccuracy,
        recommendationFit: finding.recommendationFit,
        sources: mode === "current_web" ? finding.sources : [],
        websiteContentGaps: finding.websiteContentGaps,
        limitations: finding.limitations,
        confidence: finding.confidence,
        createdAtUtc: executedAtUtc,
      });
    }
  }

  return { outcome, businessProfileId, promptExecutionIds };
}

function executionKey(execution: GeoStageExecution): string {
  return `${execution.stage}:${execution.mode ?? "null"}`;
}

function requiredExecutionId(executionIds: Record<string, string>, key: string): string {
  const executionId = executionIds[key];
  if (executionId === undefined) throw new Error(`The GEO ${key} execution was not recorded.`);
  return executionId;
}

function modelProfileIdForExecution(
  configuration: ApprovedGeoRuntimeConfiguration,
  execution: GeoStageExecution,
): string | null {
  if (execution.mode === "current_web") return configuration.currentWebModelProfileId;
  if (execution.mode === "model_knowledge") return configuration.modelKnowledgeModelProfileId;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
