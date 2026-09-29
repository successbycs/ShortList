# Data Model

**Status:** active template
**Responsible role:** data owner
**Update when:** SQLite schema or application entities change.

The implemented `schema_metadata` table records schema version 1. `audit_events` stores a UUID event ID, event type, correlation ID, JSON payload, and UTC creation time. It is synthetic self-test evidence, not a product ledger. Future application entities are templates and require their own contracts and migrations.
