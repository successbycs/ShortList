-- Core, private records for the MVP 1 website-assessment journey.
--
-- This migration is intentionally additive. A later approved Wrangler binding
-- applies it to a named local/test D1 database before any remote environment.
-- It does not create a Cloudflare database or contain credentials.

PRAGMA foreign_keys = ON;

CREATE TABLE customers (
  customer_id TEXT PRIMARY KEY NOT NULL,
  normalised_domain TEXT NOT NULL COLLATE NOCASE UNIQUE,
  original_submission TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'closed')),
  created_at_utc TEXT NOT NULL,
  reused_at_utc TEXT,
  contract_version TEXT NOT NULL
);

CREATE TABLE assessment_runs (
  assessment_id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT NOT NULL,
  input_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('admitted', 'assessing', 'preview_ready', 'limited', 'failed')
  ),
  reason_code TEXT,
  triggered_at_utc TEXT NOT NULL,
  displayed_timezone TEXT NOT NULL CHECK (displayed_timezone = 'Pacific/Auckland'),
  reference_data_version TEXT,
  created_at_utc TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE INDEX assessment_runs_customer_triggered_idx
  ON assessment_runs(customer_id, triggered_at_utc DESC);

CREATE TABLE website_evidence (
  evidence_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  observed_at_utc TEXT NOT NULL,
  content_type TEXT,
  bounded_excerpt TEXT,
  fetch_outcome TEXT NOT NULL CHECK (
    fetch_outcome IN (
      'captured',
      'unsafe_target',
      'unsafe_redirect',
      'site_unreadable',
      'content_rejected',
      'size_limit_exceeded',
      'timeout'
    )
  ),
  created_at_utc TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessment_runs(assessment_id)
);

CREATE INDEX website_evidence_assessment_observed_idx
  ON website_evidence(assessment_id, observed_at_utc ASC);
