-- Page type for each stored website page (Issue #89): home, services, pricing,
-- about, proof, locations or other. Earlier rows keep NULL and still load.
--
-- This migration is local/reviewed source only until separately applied to D1.

ALTER TABLE website_sources ADD COLUMN page_type TEXT;
