export type D1StatementLike = {
  bind(...values: unknown[]): D1StatementLike;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1StatementLike;
};

export type AssessmentAdmissionRecord = {
  customerId: string;
  assessmentId: string;
  normalisedDomain: string;
  inputUrl: string;
  triggeredAtUtc: string;
};

export type NewAssessmentAdmission = {
  normalisedDomain: string;
  originalSubmission: string;
  inputUrl: string;
  triggeredAtUtc: string;
  contractVersion: string;
  createId?: () => string;
};

export type AssessmentRunOutcome = "preview_ready" | "limited" | "failed";

export type WebsiteExtractionOutcome =
  | "not_run"
  | "captured"
  | "site_unreadable"
  | "content_rejected"
  | "size_limit_exceeded"
  | "evidence_insufficient";

type CustomerRow = { customer_id: string };

/**
 * D1-compatible persistence boundary for the first assessment records.
 * It never treats a domain as an access key and deliberately owns no recipient,
 * email, PDF or report-access data.
 */
export async function createAssessmentAdmission(
  database: D1DatabaseLike,
  input: NewAssessmentAdmission,
): Promise<AssessmentAdmissionRecord> {
  // Cloudflare's Web Crypto methods require the `crypto` receiver. Do not
  // detach `crypto.randomUUID` from it.
  const createId = input.createId ?? (() => crypto.randomUUID());
  const customerId = await getOrCreateCustomer(database, input, createId);
  const assessmentId = createId();

  // `displayed_timezone` is legacy schema metadata. The public result uses
  // UTC and no geographic scope depends on this retained value.
  const runResult = await database
    .prepare(
      `INSERT INTO assessment_runs (
        assessment_id, customer_id, input_url, status, reason_code,
        triggered_at_utc, displayed_timezone, reference_data_version,
        created_at_utc, contract_version
      ) VALUES (?, ?, ?, 'admitted', NULL, ?, 'Pacific/Auckland', NULL, ?, ?)`,
    )
    .bind(
      assessmentId,
      customerId,
      input.inputUrl,
      input.triggeredAtUtc,
      input.triggeredAtUtc,
      input.contractVersion,
    )
    .run();

  if (!runResult.success) {
    throw new Error("Could not create an assessment run.");
  }

  return {
    customerId,
    assessmentId,
    normalisedDomain: input.normalisedDomain,
    inputUrl: input.inputUrl,
    triggeredAtUtc: input.triggeredAtUtc,
  };
}

export async function recordWebsiteEvidence(
  database: D1DatabaseLike,
  input: {
    evidenceId: string;
    assessmentId: string;
    sourceUrl: string;
    observedAtUtc: string;
    contentType: string | null;
    boundedExcerpt: string | null;
    fetchOutcome:
      | "captured"
      | "unsafe_target"
      | "unsafe_redirect"
      | "site_unreadable"
      | "content_rejected"
      | "size_limit_exceeded"
      | "timeout";
    extractionOutcome: WebsiteExtractionOutcome;
    contractVersion: string;
  },
): Promise<void> {
  const result = await database
    .prepare(
      `INSERT INTO website_evidence (
        evidence_id, assessment_id, source_url, observed_at_utc, content_type,
        bounded_excerpt, fetch_outcome, extraction_outcome, created_at_utc, contract_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.evidenceId,
      input.assessmentId,
      input.sourceUrl,
      input.observedAtUtc,
      input.contentType,
      input.boundedExcerpt,
      input.fetchOutcome,
      input.extractionOutcome,
      input.observedAtUtc,
      input.contractVersion,
    )
    .run();

  if (!result.success) {
    throw new Error("Could not store website evidence.");
  }
}

/** Records the final safe public state after evidence collection. */
export async function completeAssessmentRun(
  database: D1DatabaseLike,
  input: {
    assessmentId: string;
    status: AssessmentRunOutcome;
    reasonCode: string | null;
  },
): Promise<void> {
  const result = await database
    .prepare("UPDATE assessment_runs SET status = ?, reason_code = ? WHERE assessment_id = ?")
    .bind(input.status, input.reasonCode, input.assessmentId)
    .run();

  if (!result.success) {
    throw new Error("Could not complete an assessment run.");
  }
}

async function getOrCreateCustomer(
  database: D1DatabaseLike,
  input: NewAssessmentAdmission,
  createId: () => string,
): Promise<string> {
  const existing = await database
    .prepare("SELECT customer_id FROM customers WHERE normalised_domain = ?")
    .bind(input.normalisedDomain)
    .first<CustomerRow>();

  if (existing !== null) {
    const reuse = await database
      .prepare("UPDATE customers SET reused_at_utc = ? WHERE customer_id = ?")
      .bind(input.triggeredAtUtc, existing.customer_id)
      .run();
    if (!reuse.success) {
      throw new Error("Could not update the existing customer record.");
    }
    return existing.customer_id;
  }

  const customerId = createId();
  const inserted = await database
    .prepare(
      `INSERT INTO customers (
        customer_id, normalised_domain, original_submission, status,
        created_at_utc, reused_at_utc, contract_version
      ) VALUES (?, ?, ?, 'active', ?, NULL, ?)`,
    )
    .bind(
      customerId,
      input.normalisedDomain,
      input.originalSubmission,
      input.triggeredAtUtc,
      input.contractVersion,
    )
    .run();

  if (!inserted.success) {
    throw new Error("Could not create a customer record.");
  }
  return customerId;
}
