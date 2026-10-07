-- Versioned, reviewable data contracts for the ICP-led GEO assessment.
--
-- This migration is additive. It deliberately does not modify historical
-- search-prototype records in ai_evidence. Applying it remotely requires a
-- separate reviewed D1 action and is not part of adding this file.

PRAGMA foreign_keys = ON;

CREATE TABLE geo_prompt_packages (
  prompt_package_id TEXT PRIMARY KEY NOT NULL,
  package_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE geo_prompt_package_versions (
  prompt_package_version_id TEXT PRIMARY KEY NOT NULL,
  prompt_package_id TEXT NOT NULL,
  version_label TEXT NOT NULL,
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('draft', 'approved', 'retired')),
  input_schema_version TEXT NOT NULL,
  output_schema_version TEXT NOT NULL,
  prohibited_claims_json TEXT NOT NULL,
  package_checksum TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  created_by TEXT NOT NULL,
  approved_at_utc TEXT,
  approved_by TEXT,
  retired_at_utc TEXT,
  retired_by TEXT,
  UNIQUE (prompt_package_id, version_label),
  FOREIGN KEY (prompt_package_id) REFERENCES geo_prompt_packages(prompt_package_id),
  CHECK (
    (lifecycle = 'draft' AND approved_at_utc IS NULL AND approved_by IS NULL)
    OR (lifecycle = 'approved' AND approved_at_utc IS NOT NULL AND approved_by IS NOT NULL)
    OR (lifecycle = 'retired' AND approved_at_utc IS NOT NULL AND approved_by IS NOT NULL
        AND retired_at_utc IS NOT NULL AND retired_by IS NOT NULL)
  )
);

CREATE TABLE geo_prompt_stage_templates (
  prompt_stage_template_id TEXT PRIMARY KEY NOT NULL,
  prompt_package_version_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('profile', 'icp', 'questions', 'evaluation')),
  template_text TEXT NOT NULL,
  allowed_fields_json TEXT NOT NULL,
  output_contract_json TEXT NOT NULL,
  template_checksum TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  UNIQUE (prompt_package_version_id, stage),
  FOREIGN KEY (prompt_package_version_id)
    REFERENCES geo_prompt_package_versions(prompt_package_version_id)
);

CREATE TABLE model_test_profiles (
  model_test_profile_id TEXT PRIMARY KEY NOT NULL,
  profile_key TEXT NOT NULL,
  version_label TEXT NOT NULL,
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('draft', 'approved', 'retired')),
  model_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('current_web', 'model_knowledge')),
  tool_configuration_json TEXT NOT NULL,
  budget_policy_ref TEXT NOT NULL,
  timeout_policy_ref TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  approved_at_utc TEXT,
  approved_by TEXT,
  UNIQUE (profile_key, version_label, mode),
  CHECK (
    (lifecycle = 'draft' AND approved_at_utc IS NULL AND approved_by IS NULL)
    OR (lifecycle IN ('approved', 'retired') AND approved_at_utc IS NOT NULL AND approved_by IS NOT NULL)
  )
);

CREATE TABLE market_profiles (
  market_profile_id TEXT PRIMARY KEY NOT NULL,
  market_key TEXT NOT NULL,
  version_label TEXT NOT NULL,
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('draft', 'approved', 'retired')),
  display_name TEXT NOT NULL,
  geography_json TEXT NOT NULL,
  timezone TEXT NOT NULL,
  vertical_constraints_json TEXT NOT NULL,
  current_web_location_json TEXT NOT NULL,
  reference_data_version TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  approved_at_utc TEXT,
  approved_by TEXT,
  UNIQUE (market_key, version_label),
  CHECK (
    (lifecycle = 'draft' AND approved_at_utc IS NULL AND approved_by IS NULL)
    OR (lifecycle IN ('approved', 'retired') AND approved_at_utc IS NOT NULL AND approved_by IS NOT NULL)
  )
);

CREATE TABLE assessment_configuration_snapshots (
  assessment_configuration_snapshot_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL UNIQUE,
  prompt_package_version_id TEXT NOT NULL,
  current_web_model_test_profile_id TEXT NOT NULL,
  model_knowledge_test_profile_id TEXT NOT NULL,
  market_profile_id TEXT NOT NULL,
  evidence_policy_version TEXT NOT NULL,
  report_template_version TEXT NOT NULL,
  captured_at_utc TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (prompt_package_version_id)
    REFERENCES geo_prompt_package_versions(prompt_package_version_id),
  FOREIGN KEY (current_web_model_test_profile_id)
    REFERENCES model_test_profiles(model_test_profile_id),
  FOREIGN KEY (model_knowledge_test_profile_id)
    REFERENCES model_test_profiles(model_test_profile_id),
  FOREIGN KEY (market_profile_id) REFERENCES market_profiles(market_profile_id),
  CHECK (current_web_model_test_profile_id <> model_knowledge_test_profile_id)
);

CREATE TABLE prompt_execution_records (
  prompt_execution_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  prompt_stage_template_id TEXT NOT NULL,
  model_test_profile_id TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('profile', 'icp', 'questions', 'evaluation')),
  safe_input_json TEXT NOT NULL,
  rendered_prompt TEXT NOT NULL,
  output_json TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'limited', 'failed')),
  reason_code TEXT NOT NULL,
  executed_at_utc TEXT NOT NULL,
  input_tokens INTEGER CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens INTEGER CHECK (output_tokens IS NULL OR output_tokens >= 0),
  estimated_spend_usd REAL CHECK (estimated_spend_usd IS NULL OR estimated_spend_usd >= 0),
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (prompt_stage_template_id)
    REFERENCES geo_prompt_stage_templates(prompt_stage_template_id),
  FOREIGN KEY (model_test_profile_id)
    REFERENCES model_test_profiles(model_test_profile_id)
);

CREATE INDEX prompt_execution_records_assessment_stage_idx
  ON prompt_execution_records(assessment_id, stage, executed_at_utc);

CREATE TABLE website_sources (
  website_source_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  website_evidence_id TEXT,
  source_url TEXT NOT NULL,
  observed_at_utc TEXT NOT NULL,
  content_type TEXT,
  page_title TEXT,
  meta_description TEXT,
  visible_text TEXT,
  json_ld_json TEXT NOT NULL,
  extraction_version TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (website_evidence_id) REFERENCES website_evidence(evidence_id)
);

CREATE INDEX website_sources_assessment_observed_idx
  ON website_sources(assessment_id, observed_at_utc);

CREATE TABLE extracted_website_facts (
  extracted_website_fact_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  website_source_id TEXT NOT NULL,
  fact_type TEXT NOT NULL,
  fact_value_json TEXT NOT NULL,
  provenance TEXT NOT NULL CHECK (provenance IN ('observed', 'inferred')),
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (website_source_id) REFERENCES website_sources(website_source_id)
);

CREATE TABLE business_profiles (
  business_profile_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL UNIQUE,
  prompt_execution_id TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'limited', 'failed')),
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (prompt_execution_id) REFERENCES prompt_execution_records(prompt_execution_id)
);

CREATE TABLE icp_hypotheses (
  icp_hypothesis_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  business_profile_id TEXT NOT NULL,
  prompt_execution_id TEXT NOT NULL,
  ordinal INTEGER NOT NULL CHECK (ordinal BETWEEN 1 AND 3),
  label TEXT NOT NULL,
  icp_json TEXT NOT NULL,
  evidence_ids_json TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  uncertainty TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  UNIQUE (assessment_id, ordinal),
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (business_profile_id) REFERENCES business_profiles(business_profile_id),
  FOREIGN KEY (prompt_execution_id) REFERENCES prompt_execution_records(prompt_execution_id)
);

CREATE TABLE buyer_questions (
  buyer_question_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  icp_hypothesis_id TEXT NOT NULL,
  prompt_execution_id TEXT NOT NULL,
  ordinal_within_icp INTEGER NOT NULL CHECK (ordinal_within_icp BETWEEN 1 AND 3),
  question_text TEXT NOT NULL,
  buyer_intent TEXT NOT NULL,
  tested_claim TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  UNIQUE (icp_hypothesis_id, ordinal_within_icp),
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (icp_hypothesis_id) REFERENCES icp_hypotheses(icp_hypothesis_id),
  FOREIGN KEY (prompt_execution_id) REFERENCES prompt_execution_records(prompt_execution_id)
);

CREATE TABLE model_evaluations (
  model_evaluation_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  prompt_execution_id TEXT NOT NULL,
  model_test_profile_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('current_web', 'model_knowledge')),
  executed_at_utc TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'limited', 'failed')),
  reason_code TEXT NOT NULL,
  UNIQUE (assessment_id, mode),
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (prompt_execution_id) REFERENCES prompt_execution_records(prompt_execution_id),
  FOREIGN KEY (model_test_profile_id) REFERENCES model_test_profiles(model_test_profile_id)
);

CREATE TABLE model_question_findings (
  model_question_finding_id TEXT PRIMARY KEY NOT NULL,
  model_evaluation_id TEXT NOT NULL,
  buyer_question_id TEXT NOT NULL,
  answer_summary TEXT,
  submitted_business_mention TEXT NOT NULL CHECK (
    submitted_business_mention IN ('mentioned', 'absent', 'uncertain', 'contradicted')
  ),
  description_accuracy TEXT NOT NULL CHECK (
    description_accuracy IN ('accurate', 'partial', 'inaccurate', 'not_applicable')
  ),
  recommendation_fit TEXT NOT NULL CHECK (
    recommendation_fit IN ('appropriate', 'not_appropriate', 'uncertain', 'not_mentioned')
  ),
  sources_json TEXT NOT NULL,
  website_content_gaps_json TEXT NOT NULL,
  limitations_json TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  created_at_utc TEXT NOT NULL,
  UNIQUE (model_evaluation_id, buyer_question_id),
  FOREIGN KEY (model_evaluation_id) REFERENCES model_evaluations(model_evaluation_id),
  FOREIGN KEY (buyer_question_id) REFERENCES buyer_questions(buyer_question_id)
);

CREATE TABLE report_renderings (
  report_rendering_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  assessment_configuration_snapshot_id TEXT NOT NULL,
  report_template_version TEXT NOT NULL,
  report_view_model_json TEXT NOT NULL,
  rendering_kind TEXT NOT NULL CHECK (rendering_kind IN ('web', 'pdf')),
  rendering_outcome TEXT NOT NULL CHECK (rendering_outcome IN ('completed', 'limited', 'failed')),
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id),
  FOREIGN KEY (assessment_configuration_snapshot_id)
    REFERENCES assessment_configuration_snapshots(assessment_configuration_snapshot_id)
);

CREATE INDEX report_renderings_assessment_kind_idx
  ON report_renderings(assessment_id, rendering_kind, created_at_utc);

-- Approved methodology is an audit record. To stop selecting it, a future
-- configuration snapshot must point to another approved version; the approved
-- record itself cannot be edited or deleted.
CREATE TRIGGER geo_prompt_package_versions_prevent_approved_update
BEFORE UPDATE ON geo_prompt_package_versions
WHEN OLD.lifecycle = 'approved'
BEGIN
  SELECT RAISE(ABORT, 'approved prompt package versions are immutable');
END;

CREATE TRIGGER geo_prompt_package_versions_prevent_approved_delete
BEFORE DELETE ON geo_prompt_package_versions
WHEN OLD.lifecycle = 'approved'
BEGIN
  SELECT RAISE(ABORT, 'approved prompt package versions cannot be deleted');
END;

CREATE TRIGGER geo_prompt_stage_templates_prevent_approved_update
BEFORE UPDATE ON geo_prompt_stage_templates
WHEN EXISTS (
  SELECT 1 FROM geo_prompt_package_versions version
  WHERE version.prompt_package_version_id = OLD.prompt_package_version_id
    AND version.lifecycle = 'approved'
)
BEGIN
  SELECT RAISE(ABORT, 'templates in an approved package are immutable');
END;

CREATE TRIGGER geo_prompt_stage_templates_prevent_approved_delete
BEFORE DELETE ON geo_prompt_stage_templates
WHEN EXISTS (
  SELECT 1 FROM geo_prompt_package_versions version
  WHERE version.prompt_package_version_id = OLD.prompt_package_version_id
    AND version.lifecycle = 'approved'
)
BEGIN
  SELECT RAISE(ABORT, 'templates in an approved package cannot be deleted');
END;
