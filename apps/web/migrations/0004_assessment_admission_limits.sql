-- Server-side assessment admission controls for GitHub Issue #10.
-- Raw visitor IP addresses are never stored: the application writes only a
-- keyed per-day digest. These tables are additive and contain no credentials.

CREATE TABLE assessment_admission_leases (
  normalised_domain TEXT PRIMARY KEY NOT NULL COLLATE NOCASE,
  acquired_at_utc TEXT NOT NULL
);

CREATE TABLE assessment_concurrency_slots (
  slot_id INTEGER PRIMARY KEY NOT NULL CHECK (slot_id IN (1, 2)),
  normalised_domain TEXT UNIQUE,
  acquired_at_utc TEXT
);

INSERT INTO assessment_concurrency_slots (slot_id, normalised_domain, acquired_at_utc)
VALUES (1, NULL, NULL), (2, NULL, NULL);

CREATE TABLE assessment_ip_day_limits (
  ip_day_hmac TEXT NOT NULL,
  auckland_day TEXT NOT NULL,
  start_count INTEGER NOT NULL CHECK (start_count BETWEEN 1 AND 5),
  first_started_at_utc TEXT NOT NULL,
  last_started_at_utc TEXT NOT NULL,
  PRIMARY KEY (ip_day_hmac, auckland_day)
);
