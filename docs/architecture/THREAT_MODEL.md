# Threat Model

**Status:** template
**Responsible role:** security reviewer
**Update when:** an asset, trust boundary, or external action changes.

Current assets are source code, local configuration, and synthetic SQLite audit data. Primary threats are credential disclosure, unsafe container privileges, untrusted configuration, accidental external actions, and misleading safety claims. Mitigations are ignored secrets, non-root Compose defaults, strict configuration validation, no-op adapters, and evidence-based status. A document is not an implemented control.
