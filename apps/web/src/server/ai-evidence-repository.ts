import type { AiSearchEvidence } from "./ai-search";
import type { D1DatabaseLike } from "./assessment-repository";

export type StoredAiEvidence = {
  assessmentId: string;
  normalisedDomain: string;
  triggeredAtUtc: string;
  excerpt: string;
  currentWeb: AiSearchEvidence;
  modelKnowledge: AiSearchEvidence;
};

type AssessmentEvidenceRow = {
  assessment_id: string;
  normalised_domain: string;
  triggered_at_utc: string;
  bounded_excerpt: string;
  mode: "web_grounded" | "model_knowledge";
  question: string;
  executed_at_utc: string;
  model_id: string;
  search_configuration_ref: string;
  location_context_json: string;
  observed_results_json: string;
  citations_json: string;
  freshness_notice: string | null;
  outcome: "completed" | "limited" | "failed";
  reason_code: AiSearchEvidence["reasonCode"];
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_spend_usd: number | null;
  contract_version: "v1";
};

/** Save the structured result, never raw provider requests, headers or keys. */
export async function recordAiEvidence(
  database: D1DatabaseLike,
  aiEvidenceId: string,
  evidence: AiSearchEvidence,
): Promise<void> {
  const usage = evidence.usage;
  const result = await database
    .prepare(
      `INSERT INTO ai_evidence (
        ai_evidence_id, assessment_id, mode, question, executed_at_utc,
        model_id, search_configuration_ref, location_context_json,
        observed_results_json, citations_json, freshness_notice, outcome,
        reason_code, input_tokens, output_tokens, estimated_spend_usd,
        created_at_utc, contract_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      aiEvidenceId,
      evidence.assessmentId,
      evidence.mode,
      evidence.question,
      evidence.executedAtUtc,
      evidence.modelId,
      evidence.searchConfigurationRef,
      JSON.stringify(evidence.locationContext),
      JSON.stringify(evidence.observedResults),
      JSON.stringify(evidence.citations),
      evidence.freshnessNotice ?? null,
      evidence.outcome,
      evidence.reasonCode,
      usage?.inputTokens ?? null,
      usage?.outputTokens ?? null,
      usage?.estimatedSpendUsd ?? null,
      evidence.executedAtUtc,
      evidence.contractVersion,
    )
    .run();
  if (!result.success) throw new Error("Could not store AI evidence.");
}

/**
 * Returns one fully completed stored result for a normalised domain. A partial
 * or failed attempt is deliberately not reused as a public result.
 */
export async function findStoredAssessment(
  database: D1DatabaseLike,
  normalisedDomain: string,
): Promise<StoredAiEvidence | undefined> {
  const query = `SELECT
      assessment_runs.assessment_id, customers.normalised_domain,
      assessment_runs.triggered_at_utc, website_evidence.bounded_excerpt,
      ai_evidence.mode, ai_evidence.question, ai_evidence.executed_at_utc,
      ai_evidence.model_id, ai_evidence.search_configuration_ref,
      ai_evidence.location_context_json, ai_evidence.observed_results_json,
      ai_evidence.citations_json, ai_evidence.freshness_notice,
      ai_evidence.outcome, ai_evidence.reason_code, ai_evidence.input_tokens,
      ai_evidence.output_tokens, ai_evidence.estimated_spend_usd,
      ai_evidence.contract_version
    FROM assessment_runs
    JOIN customers ON customers.customer_id = assessment_runs.customer_id
    JOIN website_evidence ON website_evidence.assessment_id = assessment_runs.assessment_id
    JOIN ai_evidence ON ai_evidence.assessment_id = assessment_runs.assessment_id
    WHERE customers.normalised_domain = ?
      AND assessment_runs.status = 'preview_ready'
      AND ai_evidence.outcome = 'completed'
    ORDER BY assessment_runs.triggered_at_utc DESC`;
  const { results } = await database
    .prepare(query)
    .bind(normalisedDomain)
    .all<AssessmentEvidenceRow>();
  if (results.length !== 2) return undefined;
  const currentWeb = toEvidence(results.find((row) => row.mode === "web_grounded"));
  const modelKnowledge = toEvidence(results.find((row) => row.mode === "model_knowledge"));
  const first = results[0];
  if (!currentWeb || !modelKnowledge || !first) return undefined;
  return {
    assessmentId: first.assessment_id,
    normalisedDomain: first.normalised_domain,
    triggeredAtUtc: first.triggered_at_utc,
    excerpt: first.bounded_excerpt,
    currentWeb,
    modelKnowledge,
  };
}

function toEvidence(row: AssessmentEvidenceRow | undefined): AiSearchEvidence | undefined {
  if (!row) return undefined;
  try {
    const observedResults: unknown = JSON.parse(row.observed_results_json);
    const citations: unknown = JSON.parse(row.citations_json);
    const locationContext: unknown = JSON.parse(row.location_context_json);
    if (
      !Array.isArray(observedResults) ||
      !Array.isArray(citations) ||
      !isLocationContext(locationContext)
    ) {
      return undefined;
    }
    return {
      contractVersion: row.contract_version,
      assessmentId: row.assessment_id,
      mode: row.mode,
      question: row.question,
      executedAtUtc: row.executed_at_utc,
      modelId: row.model_id,
      searchConfigurationRef: row.search_configuration_ref,
      locationContext,
      observedResults: observedResults as AiSearchEvidence["observedResults"],
      citations: citations as AiSearchEvidence["citations"],
      ...(row.freshness_notice ? { freshnessNotice: row.freshness_notice } : {}),
      outcome: row.outcome,
      reasonCode: row.reason_code,
      ...(row.input_tokens !== null &&
      row.output_tokens !== null &&
      row.estimated_spend_usd !== null
        ? {
            usage: {
              inputTokens: row.input_tokens,
              outputTokens: row.output_tokens,
              estimatedSpendUsd: row.estimated_spend_usd,
            },
          }
        : {}),
    };
  } catch {
    return undefined;
  }
}

function isLocationContext(value: unknown): value is AiSearchEvidence["locationContext"] {
  return typeof value === "object" && value !== null && "kind" in value;
}
