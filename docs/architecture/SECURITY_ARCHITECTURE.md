# Security Architecture

**Status:** active template
**Responsible role:** security reviewer
**Update when:** boundary or credential handling changes.

Containers run as a dedicated non-root user with all Linux capabilities dropped and `no-new-privileges`; no Docker socket, privileged mode, or baseline port is configured. Secrets belong in ignored local files. Structured-key redaction is implemented, but free-text secret detection is not. Runtime authorization is deferred.
