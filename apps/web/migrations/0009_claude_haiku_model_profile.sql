-- Approved Claude Haiku 5.5 model profile (Issue #80).
--
-- The Worker setting SHORTLIST_MODEL_PROFILE selects which approved profile
-- writes each report. This adds the first Claude profile; the earlier OpenAI
-- profile stays for the history of reports it wrote. To use another model,
-- add an approved profile like this one and change the setting.
--
-- This migration is local/reviewed source only until separately applied to D1.

INSERT INTO model_test_profiles (
  model_test_profile_id, profile_key, version_label, lifecycle, model_id, mode,
  tool_configuration_json, budget_policy_ref, timeout_policy_ref, created_at_utc,
  approved_at_utc, approved_by
) VALUES
  (
    'claude-haiku-5-5-current-web', 'claude-haiku-5-5', '1.0.0', 'approved',
    'claude-haiku-5-5', 'current_web',
    '{"web_search":{"type":"web_search_20250305","max_uses":3}}', 'mvp1-run-token-limits',
    'mvp1-45-second-provider', '2026-11-01T07:00:00.000Z', '2026-11-01T07:00:00.000Z', 'Chris'
  ),
  (
    'claude-haiku-5-5-model-knowledge', 'claude-haiku-5-5', '1.0.0', 'approved',
    'claude-haiku-5-5', 'model_knowledge',
    '{"web_search":false}', 'mvp1-run-token-limits',
    'mvp1-45-second-provider', '2026-11-01T07:00:00.000Z', '2026-11-01T07:00:00.000Z', 'Chris'
  );
