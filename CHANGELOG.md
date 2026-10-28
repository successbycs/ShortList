# Changelog

All notable repository changes are recorded here. This file uses an intentionally simple Keep-a-Changelog-style format.

## Unreleased

### Removed

- Symphony, retired by Chris on 2026-10-28: `WORKFLOW.md` and the two Symphony
  scripts are deleted, and the Symphony documents moved to
  `docs/archive/symphony/` (#64).

### Changed

- One review and merge rule in `AGENTS.md`; CI, runbook and contributing docs
  now cover both the `verify` and `web-quality` checks and the web app (#64).
- ExecPlans carry a status line; finished plans moved to
  `.agent/execplans/archive/`, and `docs/plans/` is retired (#64).

### Added

- Initial Python self-test, audit, documentation, development harness, and optional-pack foundation.
