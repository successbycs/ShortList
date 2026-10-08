import {
  businessProfileSchema,
  buyerQuestionStageOutputSchema,
  evaluationStageOutputSchema,
  icpStageOutputSchema,
  type BusinessProfile,
  type BuyerQuestion,
  type EvaluationStageOutput,
  type GeoEvidenceSource,
  type IcpHypothesis,
} from "./geo-assessment-types";
import type { ApprovedGeoPromptPackage, GeoPromptStage } from "./geo-assessment-repository";

export type GeoEvaluationMode = "current_web" | "model_knowledge";

export type GeoModelRequest = {
  stage: GeoPromptStage;
  mode: GeoEvaluationMode | null;
  instructions: string;
  input: Record<string, unknown>;
};

export type GeoModelProvider = {
  run(request: GeoModelRequest): Promise<unknown>;
};

export type GeoProviderSource = { title: string; url: string };

export type GeoProviderUsage = { inputTokens: number; outputTokens: number };

export type GeoRunTokenLimits = {
  maxInputTokens: number;
  maxOutputTokens: number;
};

export type GeoStageExecution = GeoModelRequest & {
  output: unknown;
  providerSources?: readonly GeoProviderSource[];
  usage?: GeoProviderUsage;
};

export type GeoAssessmentRuntimeHooks = {
  onStageCompleted?: (execution: GeoStageExecution) => Promise<void>;
  tokenLimits?: GeoRunTokenLimits;
};

export type GeoAssessmentInput = {
  assessmentId: string;
  executedAtUtc: string;
  normalisedDomain: string;
  marketContext: Record<string, unknown>;
  websiteSources: readonly GeoEvidenceSource[];
};

export type GeoAssessmentOutcome =
  | {
      kind: "insufficient_evidence";
      profile: BusinessProfile;
      reason: string;
      evidenceIds: readonly string[];
    }
  | {
      kind: "completed";
      profile: BusinessProfile;
      icps: readonly IcpHypothesis[];
      questions: readonly BuyerQuestion[];
      evaluations: Readonly<Record<GeoEvaluationMode, EvaluationStageOutput>>;
    };

/**
 * The deterministic orchestration boundary for one GEO assessment. It does
 * not know an OpenAI key, does not make a fetch itself, and accepts only an
 * approved package provided by the server repository.
 */
export async function runGeoAssessment(
  input: GeoAssessmentInput,
  promptPackage: ApprovedGeoPromptPackage,
  provider: GeoModelProvider,
  hooks: GeoAssessmentRuntimeHooks = {},
): Promise<GeoAssessmentOutcome> {
  const tokenUsage = { inputTokens: 0, outputTokens: 0 };
  const profileExecution = await executeStage(provider, {
    stage: "profile",
    mode: null,
    instructions: promptPackage.stages.profile.templateText,
    input: {
      assessment_id: input.assessmentId,
      market_context: input.marketContext,
      website_sources: input.websiteSources,
    },
  });
  const profile = businessProfileSchema.parse(profileExecution.output);
  validateProfileEvidence(profile, input.websiteSources);
  recordTokenUsage(tokenUsage, profileExecution, hooks.tokenLimits);
  await recordValidatedStage(hooks, profileExecution);

  const icpExecution = await executeStage(provider, {
    stage: "icp",
    mode: null,
    instructions: promptPackage.stages.icp.templateText,
    input: {
      assessment_id: input.assessmentId,
      business_profile: profile,
      website_sources: input.websiteSources,
    },
  });
  const icpResult = icpStageOutputSchema.parse(icpExecution.output);
  validateIcpEvidence(icpResult, input.websiteSources);
  recordTokenUsage(tokenUsage, icpExecution, hooks.tokenLimits);
  await recordValidatedStage(hooks, icpExecution);
  if (icpResult.outcome === "insufficient_evidence") {
    return {
      kind: "insufficient_evidence",
      profile,
      reason: icpResult.reason,
      evidenceIds: icpResult.evidenceIds,
    };
  }

  const questionExecution = await executeStage(provider, {
    stage: "questions",
    mode: null,
    instructions: promptPackage.stages.questions.templateText,
    input: {
      assessment_id: input.assessmentId,
      business_profile: profile,
      icps: icpResult.icps,
      market_context: input.marketContext,
    },
  });
  const questionOutput = buyerQuestionStageOutputSchema.parse(questionExecution.output);
  validateQuestionSet(questionOutput.questions, icpResult.icps);
  recordTokenUsage(tokenUsage, questionExecution, hooks.tokenLimits);
  await recordValidatedStage(hooks, questionExecution);

  const evaluationInput = {
    assessment_id: input.assessmentId,
    assessment_time: input.executedAtUtc,
    business_profile: profile,
    icps: icpResult.icps,
    buyer_questions: questionOutput.questions,
    market_context: input.marketContext,
  };
  const [currentWeb, modelKnowledge] = await Promise.all([
    executeStage(provider, {
      stage: "evaluation",
      mode: "current_web",
      instructions: promptPackage.stages.evaluation.templateText,
      input: evaluationInput,
    }),
    executeStage(provider, {
      stage: "evaluation",
      mode: "model_knowledge",
      instructions: promptPackage.stages.evaluation.templateText,
      input: evaluationInput,
    }),
  ]);

  const questions = questionOutput.questions;
  const currentWebResult = withProviderSources(
    evaluationStageOutputSchema.parse(currentWeb.output),
    currentWeb.providerSources,
  );
  const modelKnowledgeResult = withProviderSources(
    evaluationStageOutputSchema.parse(modelKnowledge.output),
    [],
  );
  validateFindings(currentWebResult, questions);
  validateFindings(modelKnowledgeResult, questions);
  // Check both parallel evaluations before either becomes a durable completed stage.
  recordTokenUsage(tokenUsage, currentWeb, hooks.tokenLimits);
  recordTokenUsage(tokenUsage, modelKnowledge, hooks.tokenLimits);
  await recordValidatedStage(hooks, currentWeb);
  await recordValidatedStage(hooks, modelKnowledge);

  return {
    kind: "completed",
    profile,
    icps: icpResult.icps,
    questions,
    evaluations: {
      current_web: currentWebResult,
      model_knowledge: modelKnowledgeResult,
    },
  };
}

function recordTokenUsage(
  total: { inputTokens: number; outputTokens: number },
  execution: GeoStageExecution,
  limits: GeoRunTokenLimits | undefined,
): void {
  if (limits === undefined) return;
  if (execution.usage === undefined) {
    throw new Error("The GEO provider did not return required usage metadata.");
  }
  total.inputTokens += execution.usage.inputTokens;
  total.outputTokens += execution.usage.outputTokens;
  if (total.inputTokens > limits.maxInputTokens || total.outputTokens > limits.maxOutputTokens) {
    throw new Error("The GEO assessment exceeded its aggregate token limit.");
  }
}

async function executeStage(
  provider: GeoModelProvider,
  request: GeoModelRequest,
): Promise<GeoStageExecution> {
  return { ...request, ...normaliseProviderResult(await provider.run(request)) };
}

async function recordValidatedStage(
  hooks: GeoAssessmentRuntimeHooks,
  execution: GeoStageExecution,
): Promise<void> {
  await hooks.onStageCompleted?.(execution);
}

function normaliseProviderResult(value: unknown): {
  output: unknown;
  providerSources?: readonly GeoProviderSource[];
  usage?: GeoProviderUsage;
} {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "output" in value &&
    isProviderSources((value as { providerSources?: unknown }).providerSources) &&
    isProviderUsage((value as { usage?: unknown }).usage)
  ) {
    const result = value as {
      output: unknown;
      providerSources?: readonly GeoProviderSource[];
      usage?: GeoProviderUsage;
    };
    return {
      output: result.output,
      ...(result.providerSources === undefined ? {} : { providerSources: result.providerSources }),
      ...(result.usage === undefined ? {} : { usage: result.usage }),
    };
  }
  return { output: value };
}

function isProviderUsage(value: unknown): value is GeoProviderUsage | undefined {
  return (
    value === undefined ||
    (value !== null &&
      typeof value === "object" &&
      Number.isSafeInteger((value as { inputTokens?: unknown }).inputTokens) &&
      (value as { inputTokens: number }).inputTokens >= 0 &&
      Number.isSafeInteger((value as { outputTokens?: unknown }).outputTokens) &&
      (value as { outputTokens: number }).outputTokens >= 0)
  );
}

function isProviderSources(value: unknown): value is readonly GeoProviderSource[] | undefined {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.every(
        (source) =>
          source !== null &&
          typeof source === "object" &&
          typeof (source as { title?: unknown }).title === "string" &&
          typeof (source as { url?: unknown }).url === "string",
      ))
  );
}

function withProviderSources(
  evaluation: EvaluationStageOutput,
  sources: readonly GeoProviderSource[] | undefined,
): EvaluationStageOutput {
  return {
    findings: evaluation.findings.map((finding) => ({ ...finding, sources: [...(sources ?? [])] })),
  };
}

function validateQuestionSet(
  questions: readonly BuyerQuestion[],
  icps: readonly IcpHypothesis[],
): void {
  const icpIds = new Set(icps.map((icp) => icp.id));
  const questionIds = new Set(questions.map((question) => question.id));
  if (questionIds.size !== 9 || questions.some((question) => !icpIds.has(question.icpId))) {
    throw new Error(
      "The GEO question set must contain nine questions for the three approved ICPs.",
    );
  }
  for (const icp of icps) {
    if (questions.filter((question) => question.icpId === icp.id).length !== 3) {
      throw new Error("Each GEO ICP must have exactly three buyer questions.");
    }
  }
}

function validateProfileEvidence(
  profile: BusinessProfile,
  websiteSources: readonly GeoEvidenceSource[],
): void {
  const evidenceIds = new Set(websiteSources.map((source) => source.sourceId));
  const values = [
    profile.businessName,
    ...profile.services,
    ...profile.serviceAreas,
    ...profile.audienceSignals,
    ...profile.valuePropositions,
    ...profile.proofPoints,
    ...profile.differentiators,
  ];
  validateKnownEvidenceIds(
    values.flatMap((value) => value?.evidenceIds ?? []),
    evidenceIds,
    "business profile",
  );
}

function validateIcpEvidence(
  icpResult: ReturnType<typeof icpStageOutputSchema.parse>,
  websiteSources: readonly GeoEvidenceSource[],
): void {
  const evidenceIds = new Set(websiteSources.map((source) => source.sourceId));
  const referencedIds =
    icpResult.outcome === "complete"
      ? icpResult.icps.flatMap((icp) => icp.evidenceIds)
      : icpResult.evidenceIds;
  validateKnownEvidenceIds(referencedIds, evidenceIds, "ICP assessment");
}

function validateKnownEvidenceIds(
  referencedIds: readonly string[],
  knownEvidenceIds: ReadonlySet<string>,
  stage: string,
): void {
  const unknownEvidenceIds = [...new Set(referencedIds)].filter(
    (evidenceId) => !knownEvidenceIds.has(evidenceId),
  );
  if (unknownEvidenceIds.length > 0) {
    throw new Error(
      `The ${stage} references evidence that was not captured from the assessed website.`,
    );
  }
}

function validateFindings(
  evaluation: EvaluationStageOutput,
  questions: readonly BuyerQuestion[],
): void {
  const questionIds = new Set(questions.map((question) => question.id));
  const findingIds = new Set(evaluation.findings.map((finding) => finding.questionId));
  if (findingIds.size !== questionIds.size || [...findingIds].some((id) => !questionIds.has(id))) {
    throw new Error(
      "Each GEO evaluation must return exactly one finding for every buyer question.",
    );
  }
}
