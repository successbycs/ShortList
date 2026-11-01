-- Report email requests (Issue #96). A visitor asks for their report by email;
-- ShortList stores the request with the visitor's consent choices and sends
-- the report. Addresses are kept until the person asks for deletion (Chris,
-- 2026-11-01). Readable only through the Worker and by Chris.
--
-- This migration is local/reviewed source only until separately applied to D1.

CREATE TABLE report_email_requests (
  request_id TEXT PRIMARY KEY NOT NULL,
  assessment_id TEXT NOT NULL REFERENCES assessment_runs(assessment_id),
  email_normalised TEXT NOT NULL,
  delivery_consent INTEGER NOT NULL CHECK (delivery_consent = 1),
  marketing_consent INTEGER NOT NULL CHECK (marketing_consent IN (0, 1)),
  consent_wording_version TEXT NOT NULL,
  ip_day_hmac TEXT NOT NULL,
  requested_at_utc TEXT NOT NULL,
  -- 'pending' is written before sending, so limits count every attempt.
  outcome TEXT NOT NULL CHECK (outcome IN ('pending', 'sent', 'failed'))
);

CREATE INDEX report_email_requests_assessment_idx
  ON report_email_requests(assessment_id);

CREATE INDEX report_email_requests_ip_day_idx
  ON report_email_requests(ip_day_hmac, requested_at_utc);
