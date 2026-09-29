# Failure Modes

**Status:** template
**Responsible role:** architect
**Update when:** a failure path or recovery procedure changes.

Model invalid configuration, unavailable dependency, duplicate request, timeout after commit, restart, incompatible schema, partial write, and external unknown outcome. Use bounded retries only for safe operations; reconcile unknown external outcomes instead of blindly retrying them. The local audit store is transactional but not tamper resistant or exactly-once.
