import type { D1DatabaseLike } from "./assessment-repository";
import type { JsonValue } from "./website-evidence";
import {
  businessProfileSchema,
  type BusinessProfile,
  type IcpHypothesis,
} from "./geo-assessment-types";

export const GEO_PROMPT_STAGES = ["profile", "icp", "questions", "evaluation"] as const;

export type GeoPromptStage = (typeof GEO_PROMPT_STAGES)[number];

export type ApprovedGeoPromptStageTemplate = {
  stage: GeoPromptStage;
  templateId: string;
  templateText: string;
  allowedFields: readonly string[];
  outputContract: Record<string, unknown>;
  checksum: string;
};

export type ApprovedGeoPromptPackage = {
  packageKey: string;
  versionLabel: string;
  packageVersionId: string;
  packageChecksum: string;
  inputSchemaVersion: string;
  outputSchemaVersion: string;
  prohibitedClaims: readonly string[];
  stages: Readonly<Record<GeoPromptStage, ApprovedGeoPromptStageTemplate>>;
};

export type ApprovedGeoRuntimeConfiguration = {
  promptPackage: ApprovedGeoPromptPackage;
  currentWebModelProfileId: string;
  modelKnowledgeModelProfileId: string;
  modelId: string;
  marketProfileId: string;
  marketContext: Record<string, unknown>;
};

export type StoredGeoFinding = {
  icpId: string;
  questionId: string;
  questionText: string;
  buyerIntent: string;
  testedClaim: string;
  answerSummary: string | null;
  submittedBusinessMention: "mentioned" | "absent" | "uncertain" | "contradicted";
  descriptionAccuracy: "accurate" | "partial" | "inaccurate" | "not_applicable";
  recommendationFit: "appropriate" | "not_appropriate" | "uncertain" | "not_mentioned";
  sources: readonly { title: string; url: string }[];
  websiteContentGaps: readonly string[];
  limitations: readonly string[];
  confidence: "high" | "medium" | "low";
};

export type StoredGeoAssessment = {
  assessmentId: string;
  normalisedDomain: string;
  triggeredAtUtc: string;
  excerpt: string;
  profile: BusinessProfile;
  icps: readonly IcpHypothesis[];
  findings: Readonly<Record<"current_web" | "model_knowledge", readonly StoredGeoFinding[]>>;
};

export type RecordPromptExecutionInput = {
  promptExecutionId: string;
  assessmentId: string;
  promptStageTemplateId: string;
  modelTestProfileId: string | null;
  stage: GeoPromptStage;
  safeInput: Record<string, unknown>;
  renderedPrompt: string;
  output: Record<string, unknown> | null;
  outcome: "completed" | "limited" | "failed";
  reasonCode: string;
  executedAtUtc: string;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedSpendUsd: number | null;
};

export type RecordWebsiteSourceInput = {
  websiteSourceId: string;
  assessmentId: string;
  websiteEvidenceId: string;
  sourceUrl: string;
  observedAtUtc: string;
  contentType: string;
  title: string | null;
  description: string | null;
  visibleText: string;
  jsonLd: readonly JsonValue[];
  extractionVersion: string;
};

export type RecordAssessmentConfigurationSnapshotInput = {
  snapshotId: string;
  assessmentId: string;
  promptPackageVersionId: string;
  currentWebModelProfileId: string;
  modelKnowledgeProfileId: string;
  marketProfileId: string;
  evidencePolicyVersion: string;
  reportTemplateVersion: string;
  capturedAtUtc: string;
};

export type RecordBusinessProfileInput = {
  businessProfileId: string;
  assessmentId: string;
  promptExecutionId: string;
  profile: Record<string, unknown>;
  outcome: "completed" | "limited" | "failed";
  createdAtUtc: string;
};

export type RecordIcpHypothesisInput = {
  icpHypothesisId: string;
  assessmentId: string;
  businessProfileId: string;
  promptExecutionId: string;
  ordinal: number;
  label: string;
  icp: Record<string, unknown>;
  evidenceIds: readonly string[];
  confidence: "high" | "medium" | "low";
  uncertainty: string;
  createdAtUtc: string;
};

export type RecordBuyerQuestionInput = {
  buyerQuestionId: string;
  assessmentId: string;
  icpHypothesisId: string;
  promptExecutionId: string;
  ordinalWithinIcp: number;
  questionText: string;
  buyerIntent: string;
  testedClaim: string;
  createdAtUtc: string;
};

export type RecordModelEvaluationInput = {
  modelEvaluationId: string;
  assessmentId: string;
  promptExecutionId: string;
  modelTestProfileId: string;
  mode: "current_web" | "model_knowledge";
  executedAtUtc: string;
  outcome: "completed" | "limited" | "failed";
  reasonCode: string;
};

export type RecordModelQuestionFindingInput = {
  findingId: string;
  modelEvaluationId: string;
  buyerQuestionId: string;
  answerSummary: string | null;
  submittedBusinessMention: "mentioned" | "absent" | "uncertain" | "contradicted";
  descriptionAccuracy: "accurate" | "partial" | "inaccurate" | "not_applicable";
  recommendationFit: "appropriate" | "not_appropriate" | "uncertain" | "not_mentioned";
  sources: readonly { title: string; url: string }[];
  websiteContentGaps: readonly string[];
  limitations: readonly string[];
  confidence: "high" | "medium" | "low";
  createdAtUtc: string;
};

type TemplateRow = {
  package_key: string;
  version_label: string;
  prompt_package_version_id: string;
  package_checksum: string;
  input_schema_version: string;
  output_schema_version: string;
  prohibited_claims_json: string;
  prompt_stage_template_id: string;
  stage: string;
  template_text: string;
  allowed_fields_json: string;
  output_contract_json: string;
  template_checksum: string;
};

type ModelProfileRow = {
  model_test_profile_id: string;
  model_id: string;
  mode: string;
};

type MarketProfileRow = {
  market_profile_id: string;
  display_name: string;
  geography_json: string;
  vertical_constraints_json: string;
  reference_data_version: string;
};

type GeoAssessmentHeaderRow = {
  assessment_id: string;
  normalised_domain: string;
  triggered_at_utc: string;
  bounded_excerpt: string;
  profile_json: string;
};

type StoredIcpRow = { icp_json: string };

type StoredFindingRow = Omit<StoredGeoFinding, "sources" | "websiteContentGaps" | "limitations"> & {
  mode: "current_web" | "model_knowledge";
  sources_json: string;
  website_content_gaps_json: string;
  limitations_json: string;
};

/**
 * Loads one explicit, approved prompt package. Runtime callers must know both
 * the package key and reviewed version: selecting "latest" would make a past
 * assessment impossible to reconstruct and would make a draft-change rollout
 * ambiguous.
 */
export async function loadApprovedGeoPromptPackage(
  database: D1DatabaseLike,
  input: { packageKey: string; versionLabel: string },
): Promise<ApprovedGeoPromptPackage> {
  const result = await database
    .prepare(
      `SELECT
        package.package_key,
        version.version_label,
        version.prompt_package_version_id,
        version.package_checksum,
        version.input_schema_version,
        version.output_schema_version,
        version.prohibited_claims_json,
        template.prompt_stage_template_id,
        template.stage,
        template.template_text,
        template.allowed_fields_json,
        template.output_contract_json,
        template.template_checksum
      FROM geo_prompt_packages package
      JOIN geo_prompt_package_versions version
        ON version.prompt_package_id = package.prompt_package_id
      JOIN geo_prompt_stage_templates template
        ON template.prompt_package_version_id = version.prompt_package_version_id
      WHERE package.package_key = ?
        AND version.version_label = ?
        AND version.lifecycle = 'approved'
      ORDER BY template.stage ASC`,
    )
    .bind(input.packageKey, input.versionLabel)
    .all<TemplateRow>();

  const first = result.results[0];
  if (first === undefined || result.results.length !== GEO_PROMPT_STAGES.length) {
    throw new Error("The requested approved GEO prompt package is incomplete or unavailable.");
  }

  const stages = {} as Record<GeoPromptStage, ApprovedGeoPromptStageTemplate>;

  for (const row of result.results) {
    if (!isGeoPromptStage(row.stage) || stages[row.stage] !== undefined) {
      throw new Error("The requested approved GEO prompt package is invalid.");
    }
    if (
      row.package_key !== first.package_key ||
      row.version_label !== first.version_label ||
      row.prompt_package_version_id !== first.prompt_package_version_id ||
      row.package_checksum !== first.package_checksum
    ) {
      throw new Error("The requested approved GEO prompt package is inconsistent.");
    }

    stages[row.stage] = {
      stage: row.stage,
      templateId: row.prompt_stage_template_id,
      templateText: row.template_text,
      allowedFields: parseStringArray(row.allowed_fields_json, "allowed fields"),
      outputContract: parseObject(row.output_contract_json, "output contract"),
      checksum: row.template_checksum,
    };
  }

  for (const stage of GEO_PROMPT_STAGES) {
    if (stages[stage] === undefined) {
      throw new Error("The requested approved GEO prompt package is incomplete.");
    }
  }

  return {
    packageKey: first.package_key,
    versionLabel: first.version_label,
    packageVersionId: first.prompt_package_version_id,
    packageChecksum: first.package_checksum,
    inputSchemaVersion: first.input_schema_version,
    outputSchemaVersion: first.output_schema_version,
    prohibitedClaims: parseStringArray(first.prohibited_claims_json, "prohibited claims"),
    stages,
  };
}

/**
 * Reads one completed GEO assessment for a domain. It uses only the persisted
 * graph, so a replay never calls a model or reinterprets older website text.
 */
export async function findStoredGeoAssessment(
  database: D1DatabaseLike,
  normalisedDomain: string,
): Promise<StoredGeoAssessment | undefined> {
  const header = await database
    .prepare(
      `SELECT assessment_runs.assessment_id, customers.normalised_domain,
              assessment_runs.triggered_at_utc, website_evidence.bounded_excerpt,
              business_profiles.profile_json
       FROM assessment_runs
       JOIN customers ON customers.customer_id = assessment_runs.customer_id
       JOIN website_evidence ON website_evidence.assessment_id = assessment_runs.assessment_id
       JOIN business_profiles ON business_profiles.assessment_id = assessment_runs.assessment_id
       WHERE customers.normalised_domain = ?
         AND assessment_runs.status = 'preview_ready'
         AND business_profiles.outcome = 'completed'
       ORDER BY assessment_runs.triggered_at_utc DESC
       LIMIT 1`,
    )
    .bind(normalisedDomain)
    .first<GeoAssessmentHeaderRow>();
  if (header === null) return undefined;

  try {
    const profile = businessProfileSchema.parse(JSON.parse(header.profile_json));
    const [icpRows, findingRows] = await Promise.all([
      database
        .prepare(
          `SELECT icp_json FROM icp_hypotheses
           WHERE assessment_id = ? ORDER BY ordinal ASC`,
        )
        .bind(header.assessment_id)
        .all<StoredIcpRow>(),
      database
        .prepare(
          `SELECT model_evaluations.mode,
                  json_extract(icp_hypotheses.icp_json, '$.id') AS icpId,
                  model_question_findings.buyer_question_id AS questionId,
                  buyer_questions.question_text AS questionText,
                  buyer_questions.buyer_intent AS buyerIntent,
                  buyer_questions.tested_claim AS testedClaim,
                  model_question_findings.answer_summary AS answerSummary,
                  model_question_findings.submitted_business_mention AS submittedBusinessMention,
                  model_question_findings.description_accuracy AS descriptionAccuracy,
                  model_question_findings.recommendation_fit AS recommendationFit,
                  model_question_findings.sources_json,
                  model_question_findings.website_content_gaps_json,
                  model_question_findings.limitations_json,
                  model_question_findings.confidence
           FROM model_evaluations
           JOIN model_question_findings
             ON model_question_findings.model_evaluation_id = model_evaluations.model_evaluation_id
           JOIN buyer_questions
             ON buyer_questions.buyer_question_id = model_question_findings.buyer_question_id
           JOIN icp_hypotheses
             ON icp_hypotheses.icp_hypothesis_id = buyer_questions.icp_hypothesis_id
           WHERE model_evaluations.assessment_id = ?
             AND model_evaluations.outcome = 'completed'
           ORDER BY model_evaluations.mode ASC, buyer_questions.icp_hypothesis_id ASC,
                    buyer_questions.ordinal_within_icp ASC`,
        )
        .bind(header.assessment_id)
        .all<StoredFindingRow>(),
    ]);
    const icps = icpRows.results.map((row) => parseIcp(row.icp_json));
    if (icps.length !== 3) return undefined;
    const findings = {
      current_web: findingRows.results
        .filter((row) => row.mode === "current_web")
        .map(toStoredFinding),
      model_knowledge: findingRows.results
        .filter((row) => row.mode === "model_knowledge")
        .map(toStoredFinding),
    };
    if (findings.current_web.length !== 9 || findings.model_knowledge.length !== 9) {
      return undefined;
    }
    if (
      !hasThreeFindingsPerIcp(findings.current_web, icps) ||
      !hasThreeFindingsPerIcp(findings.model_knowledge, icps)
    ) {
      return undefined;
    }
    return {
      assessmentId: header.assessment_id,
      normalisedDomain: header.normalised_domain,
      triggeredAtUtc: header.triggered_at_utc,
      excerpt: header.bounded_excerpt,
      profile,
      icps,
      findings,
    };
  } catch {
    return undefined;
  }
}

function hasThreeFindingsPerIcp(
  findings: readonly StoredGeoFinding[],
  icps: readonly IcpHypothesis[],
): boolean {
  const icpIds = new Set(icps.map((icp) => icp.id));
  return (
    icpIds.size === 3 &&
    findings.every((finding) => icpIds.has(finding.icpId)) &&
    [...icpIds].every((icpId) => findings.filter((finding) => finding.icpId === icpId).length === 3)
  );
}

/** Loads the reviewed package and global runtime profiles selected by key/version. */
export async function loadApprovedGeoRuntimeConfiguration(
  database: D1DatabaseLike,
  input: {
    packageKey: string;
    packageVersionLabel: string;
    modelProfileKey: string;
    modelProfileVersionLabel: string;
    marketKey: string;
    marketVersionLabel: string;
  },
): Promise<ApprovedGeoRuntimeConfiguration> {
  const [promptPackage, modelProfiles, marketProfiles] = await Promise.all([
    loadApprovedGeoPromptPackage(database, {
      packageKey: input.packageKey,
      versionLabel: input.packageVersionLabel,
    }),
    database
      .prepare(
        `SELECT model_test_profile_id, model_id, mode
         FROM model_test_profiles
         WHERE profile_key = ? AND version_label = ? AND lifecycle = 'approved'
         ORDER BY mode ASC`,
      )
      .bind(input.modelProfileKey, input.modelProfileVersionLabel)
      .all<ModelProfileRow>(),
    database
      .prepare(
        `SELECT market_profile_id, display_name, geography_json, vertical_constraints_json,
                reference_data_version
         FROM market_profiles
         WHERE market_key = ? AND version_label = ? AND lifecycle = 'approved'`,
      )
      .bind(input.marketKey, input.marketVersionLabel)
      .all<MarketProfileRow>(),
  ]);

  const currentWeb = modelProfiles.results.find((profile) => profile.mode === "current_web");
  const modelKnowledge = modelProfiles.results.find(
    (profile) => profile.mode === "model_knowledge",
  );
  const market = marketProfiles.results[0];
  if (
    currentWeb === undefined ||
    modelKnowledge === undefined ||
    currentWeb.model_id !== modelKnowledge.model_id ||
    market === undefined ||
    marketProfiles.results.length !== 1
  ) {
    throw new Error("The approved GEO runtime configuration is incomplete or inconsistent.");
  }

  return {
    promptPackage,
    currentWebModelProfileId: currentWeb.model_test_profile_id,
    modelKnowledgeModelProfileId: modelKnowledge.model_test_profile_id,
    modelId: currentWeb.model_id,
    marketProfileId: market.market_profile_id,
    marketContext: {
      display_name: market.display_name,
      geography: parseObject(market.geography_json, "market geography"),
      vertical_constraints: parseJsonArray(
        market.vertical_constraints_json,
        "vertical constraints",
      ),
      reference_data_version: market.reference_data_version,
    },
  };
}

/** Stores the bounded, reviewable method record for one server-side stage. */
export async function recordPromptExecution(
  database: D1DatabaseLike,
  input: RecordPromptExecutionInput,
): Promise<void> {
  const result = await database
    .prepare(
      `INSERT INTO prompt_execution_records (
        prompt_execution_id, assessment_id, prompt_stage_template_id,
        model_test_profile_id, stage, safe_input_json, rendered_prompt,
        output_json, outcome, reason_code, executed_at_utc, input_tokens,
        output_tokens, estimated_spend_usd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.promptExecutionId,
      input.assessmentId,
      input.promptStageTemplateId,
      input.modelTestProfileId,
      input.stage,
      JSON.stringify(input.safeInput),
      input.renderedPrompt,
      input.output === null ? null : JSON.stringify(input.output),
      input.outcome,
      input.reasonCode,
      input.executedAtUtc,
      input.inputTokens,
      input.outputTokens,
      input.estimatedSpendUsd,
    )
    .run();

  if (!result.success) {
    throw new Error("Could not store the GEO prompt execution record.");
  }
}

/**
 * Persists the bounded, inert source used by later profile and ICP stages.
 * It deliberately retains only data that passed the existing safe-fetch and
 * extraction boundary; it never receives raw HTTP headers or visitor input.
 */
export async function recordWebsiteSource(
  database: D1DatabaseLike,
  input: RecordWebsiteSourceInput,
): Promise<void> {
  const result = await database
    .prepare(
      `INSERT INTO website_sources (
        website_source_id, assessment_id, website_evidence_id, source_url,
        observed_at_utc, content_type, page_title, meta_description,
        visible_text, json_ld_json, extraction_version, created_at_utc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.websiteSourceId,
      input.assessmentId,
      input.websiteEvidenceId,
      input.sourceUrl,
      input.observedAtUtc,
      input.contentType,
      input.title,
      input.description,
      input.visibleText,
      JSON.stringify(input.jsonLd),
      input.extractionVersion,
      input.observedAtUtc,
    )
    .run();

  if (!result.success) {
    throw new Error("Could not store the bounded website source.");
  }
}

export async function recordAssessmentConfigurationSnapshot(
  database: D1DatabaseLike,
  input: RecordAssessmentConfigurationSnapshotInput,
): Promise<void> {
  await requireRunSuccess(
    database
      .prepare(
        `INSERT INTO assessment_configuration_snapshots (
          assessment_configuration_snapshot_id, assessment_id, prompt_package_version_id,
          current_web_model_test_profile_id, model_knowledge_test_profile_id,
          market_profile_id, evidence_policy_version, report_template_version, captured_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.snapshotId,
        input.assessmentId,
        input.promptPackageVersionId,
        input.currentWebModelProfileId,
        input.modelKnowledgeProfileId,
        input.marketProfileId,
        input.evidencePolicyVersion,
        input.reportTemplateVersion,
        input.capturedAtUtc,
      )
      .run(),
    "Could not store the GEO assessment configuration snapshot.",
  );
}

export async function recordBusinessProfile(
  database: D1DatabaseLike,
  input: RecordBusinessProfileInput,
): Promise<void> {
  await requireRunSuccess(
    database
      .prepare(
        `INSERT INTO business_profiles (
          business_profile_id, assessment_id, prompt_execution_id, profile_json, outcome, created_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.businessProfileId,
        input.assessmentId,
        input.promptExecutionId,
        JSON.stringify(input.profile),
        input.outcome,
        input.createdAtUtc,
      )
      .run(),
    "Could not store the GEO business profile.",
  );
}

export async function recordIcpHypothesis(
  database: D1DatabaseLike,
  input: RecordIcpHypothesisInput,
): Promise<void> {
  await requireRunSuccess(
    database
      .prepare(
        `INSERT INTO icp_hypotheses (
          icp_hypothesis_id, assessment_id, business_profile_id, prompt_execution_id,
          ordinal, label, icp_json, evidence_ids_json, confidence, uncertainty, created_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.icpHypothesisId,
        input.assessmentId,
        input.businessProfileId,
        input.promptExecutionId,
        input.ordinal,
        input.label,
        JSON.stringify(input.icp),
        JSON.stringify(input.evidenceIds),
        input.confidence,
        input.uncertainty,
        input.createdAtUtc,
      )
      .run(),
    "Could not store the GEO ICP hypothesis.",
  );
}

export async function recordBuyerQuestion(
  database: D1DatabaseLike,
  input: RecordBuyerQuestionInput,
): Promise<void> {
  await requireRunSuccess(
    database
      .prepare(
        `INSERT INTO buyer_questions (
          buyer_question_id, assessment_id, icp_hypothesis_id, prompt_execution_id,
          ordinal_within_icp, question_text, buyer_intent, tested_claim, created_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.buyerQuestionId,
        input.assessmentId,
        input.icpHypothesisId,
        input.promptExecutionId,
        input.ordinalWithinIcp,
        input.questionText,
        input.buyerIntent,
        input.testedClaim,
        input.createdAtUtc,
      )
      .run(),
    "Could not store the GEO buyer question.",
  );
}

export async function recordModelEvaluation(
  database: D1DatabaseLike,
  input: RecordModelEvaluationInput,
): Promise<void> {
  await requireRunSuccess(
    database
      .prepare(
        `INSERT INTO model_evaluations (
          model_evaluation_id, assessment_id, prompt_execution_id, model_test_profile_id,
          mode, executed_at_utc, outcome, reason_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.modelEvaluationId,
        input.assessmentId,
        input.promptExecutionId,
        input.modelTestProfileId,
        input.mode,
        input.executedAtUtc,
        input.outcome,
        input.reasonCode,
      )
      .run(),
    "Could not store the GEO model evaluation.",
  );
}

export async function recordModelQuestionFinding(
  database: D1DatabaseLike,
  input: RecordModelQuestionFindingInput,
): Promise<void> {
  await requireRunSuccess(
    database
      .prepare(
        `INSERT INTO model_question_findings (
          model_question_finding_id, model_evaluation_id, buyer_question_id, answer_summary,
          submitted_business_mention, description_accuracy, recommendation_fit, sources_json,
          website_content_gaps_json, limitations_json, confidence, created_at_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.findingId,
        input.modelEvaluationId,
        input.buyerQuestionId,
        input.answerSummary,
        input.submittedBusinessMention,
        input.descriptionAccuracy,
        input.recommendationFit,
        JSON.stringify(input.sources),
        JSON.stringify(input.websiteContentGaps),
        JSON.stringify(input.limitations),
        input.confidence,
        input.createdAtUtc,
      )
      .run(),
    "Could not store the GEO model question finding.",
  );
}

async function requireRunSuccess(
  result: Promise<{ success: boolean }>,
  failureMessage: string,
): Promise<void> {
  if (!(await result).success) throw new Error(failureMessage);
}

function isGeoPromptStage(value: string): value is GeoPromptStage {
  return (GEO_PROMPT_STAGES as readonly string[]).includes(value);
}

function parseStringArray(value: string, field: string): readonly string[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) {
    throw new Error(`The approved GEO prompt package has invalid ${field}.`);
  }
  return parsed;
}

function parseObject(value: string, field: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`The approved GEO prompt package has invalid ${field}.`);
  }
  return parsed as Record<string, unknown>;
}

function parseJsonArray(value: string, field: string): unknown[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error(`The approved GEO runtime configuration has invalid ${field}.`);
  }
  return parsed;
}

function parseIcp(value: string): IcpHypothesis {
  const parsed: unknown = JSON.parse(value);
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !Array.isArray((parsed as { evidenceIds?: unknown }).evidenceIds)
  ) {
    throw new Error("The stored GEO ICP is invalid.");
  }
  return parsed as IcpHypothesis;
}

function toStoredFinding(row: StoredFindingRow): StoredGeoFinding {
  return {
    icpId: row.icpId,
    questionId: row.questionId,
    questionText: row.questionText,
    buyerIntent: row.buyerIntent,
    testedClaim: row.testedClaim,
    answerSummary: row.answerSummary,
    submittedBusinessMention: row.submittedBusinessMention,
    descriptionAccuracy: row.descriptionAccuracy,
    recommendationFit: row.recommendationFit,
    sources: parseSources(row.sources_json),
    websiteContentGaps: parseStringArray(row.website_content_gaps_json, "website content gaps"),
    limitations: parseStringArray(row.limitations_json, "finding limitations"),
    confidence: row.confidence,
  };
}

function parseSources(value: string): readonly { title: string; url: string }[] {
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (source) =>
        source !== null &&
        typeof source === "object" &&
        typeof (source as { title?: unknown }).title === "string" &&
        typeof (source as { url?: unknown }).url === "string",
    )
  ) {
    throw new Error("The stored GEO finding sources are invalid.");
  }
  return parsed as { title: string; url: string }[];
}
