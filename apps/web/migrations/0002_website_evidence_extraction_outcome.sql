-- Preserve the distinction between a technical fetch outcome and whether the
-- bounded HTML produced usable assessment evidence. This is additive and is
-- safe for an empty new database or a database already at migration 0001.

ALTER TABLE website_evidence
  ADD COLUMN extraction_outcome TEXT NOT NULL DEFAULT 'not_run'
  CHECK (
    extraction_outcome IN (
      'not_run',
      'captured',
      'site_unreadable',
      'content_rejected',
      'size_limit_exceeded',
      'evidence_insufficient'
    )
  );
