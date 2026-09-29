# Data Change Workflow

**Status:** template
**Responsible role:** data owner
**Update when:** schema or data migration process changes.

Specify schema version, backwards compatibility, validation, migration/rollback, retention, replay, and verification before changing persistent data. Use transactional writes and isolated test data. Do not delete or repair user data to make a test pass.
