# Data Contracts

**Status:** template
**Responsible role:** data owner
**Update when:** a producer/consumer interface changes.

Each future contract must name its producer, consumer, version, validation, retention, idempotency key, and error behavior. Preserve source event time, receipt time, and revision lineage where relevant. Do not overwrite raw evidence to hide retries or duplicate delivery.
