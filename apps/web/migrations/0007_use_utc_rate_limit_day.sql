-- ShortList is a global service. Rate-limit records keep only a keyed,
-- privacy-minimised daily digest, so use an unambiguous UTC calendar day
-- rather than a city-specific operational day.
--
-- This migration is local/reviewed source only until separately applied to D1.

ALTER TABLE assessment_ip_day_limits RENAME COLUMN auckland_day TO utc_day;
