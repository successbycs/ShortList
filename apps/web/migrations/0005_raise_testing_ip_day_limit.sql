-- Temporarily raise the MVP 1 privacy-minimised IP/day assessment limit from
-- five to one hundred. SQLite cannot alter a CHECK constraint in place, so the
-- table is rebuilt. Cloudflare D1 rejects explicit SQL transaction statements;
-- its migration runner executes this ordered statement sequence. Existing
-- per-day counters are copied before the original table is removed.

CREATE TABLE assessment_ip_day_limits_next (
  ip_day_hmac TEXT NOT NULL,
  auckland_day TEXT NOT NULL,
  start_count INTEGER NOT NULL CHECK (start_count BETWEEN 1 AND 100),
  first_started_at_utc TEXT NOT NULL,
  last_started_at_utc TEXT NOT NULL,
  PRIMARY KEY (ip_day_hmac, auckland_day)
);

INSERT INTO assessment_ip_day_limits_next (
  ip_day_hmac,
  auckland_day,
  start_count,
  first_started_at_utc,
  last_started_at_utc
)
SELECT
  ip_day_hmac,
  auckland_day,
  start_count,
  first_started_at_utc,
  last_started_at_utc
FROM assessment_ip_day_limits;

DROP TABLE assessment_ip_day_limits;
ALTER TABLE assessment_ip_day_limits_next RENAME TO assessment_ip_day_limits;
