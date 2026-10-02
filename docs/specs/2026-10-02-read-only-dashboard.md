# Read-only Symphony dashboard

Issue: https://github.com/successbycs/template/issues/10

## Outcome

An operator can inspect the latest 100 persisted operational records and active
reservations through a loopback browser page and JSON endpoint.
The JSON endpoint also preserves the latest 100 sanitized notification delivery
records (timestamp, Issue ID, known status and attempt count), without message
details or transition identifiers.

## Non-goals and constraints

No task execution, HTTP mutation, live dispatch, external calls, frontend
dependencies or schema migration. Existing Compose publication remains loopback.
Legacy free-text run content is excluded. Historical records are escaped for HTML.

## Acceptance scenarios

The page shows all seven operational event kinds and active reservations after
database reopening. A missing database produces an empty state without creating
files. POST pause/resume/tick fails. Direct public-address binding is rejected;
container internal binding remains compatible with loopback publication.

## Verification

On 2026-10-02, 13 dashboard tests passed; the canonical verifier passed 68 tests,
Ruff and Markdown links. Real Chromium over local Uvicorn/SQLite verified the
populated and empty page. Only missing favicon requests returned 404. No live
dispatch was performed. Commands, limits and screenshots are recorded in the
[ExecPlan](../../.agent/execplans/2026-10-02-complete-read-only-dashboard.md).

Follow-up on the same date restored notification metadata required by #19.
The canonical verifier again passed 68 tests (3.24s), Ruff and links. The
reopened-database test covers pending/sent/disabled/failed states and private-data
exclusion. Real loopback HTTP returned the expected synthetic sent record;
no SMTP delivery or recipient receipt is claimed. HTML screenshots are unchanged.
