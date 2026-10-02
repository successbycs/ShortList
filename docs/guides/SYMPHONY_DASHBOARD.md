# Symphony evidence dashboard

From the repository root run `uv run app-template symphony dashboard`, then open
`http://127.0.0.1:8765/`. The page reads the latest 100 durable operational records
from `var/symphony/events.sqlite3`; refresh manually for newer evidence.
`GET /api/status` provides the same operations and active reservations as JSON.

The page shows observations, claims, reservations, worker-stop confirmations,
reviewed revisions, queue age and admission decisions. An empty database produces
an empty-state message without creating a database. These are recorded facts,
not a heartbeat or proof that a worker is currently alive. Active reservations
require reconciliation by the host broker; the page cannot release them.

The dashboard performs no GitHub requests or task execution. Its HTTP interface
has no pause, resume or tick actions. Only allow-listed operational fields are
returned; legacy run transcripts, summaries and notification bodies are excluded.
All record text is escaped before rendering. Do not write secrets into event fields.

Direct startup rejects non-loopback binds. The existing Compose service may bind
0.0.0.0 inside its container, with port 8765 published only on 127.0.0.1. Container
publication must remain loopback-only. Stop the foreground service with Ctrl+C;
the database is preserved. Live dispatch stays disabled in `WORKFLOW.md`.

Verification and screenshots are recorded in
[the Issue #10 plan](../../.agent/execplans/2026-10-02-complete-read-only-dashboard.md).
