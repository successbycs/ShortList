-- Dated, provider-normalised results for the two approved ShortList AI views.
-- This is intentionally separate from raw provider payloads: it stores only
-- the structured customer-facing evidence, provenance and bounded usage.

CREATE TABLE ai_evidence (
  ai_evidence_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('web_grounded', 'model_knowledge')),
  question TEXT NOT NULL,
  executed_at_utc TEXT NOT NULL,
  model_id TEXT NOT NULL,
  search_configuration_ref TEXT NOT NULL,
  location_context_json TEXT NOT NULL,
  observed_results_json TEXT NOT NULL,
  citations_json TEXT NOT NULL,
  freshness_notice TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'limited', 'failed')),
  reason_code TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_spend_usd REAL,
  created_at_utc TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  UNIQUE (assessment_id, mode),
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id)
);

CREATE INDEX ai_evidence_assessment_mode_idx
  ON ai_evidence(assessment_id, mode);
