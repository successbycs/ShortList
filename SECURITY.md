# Security

**Status:** active template policy
**Responsible role:** security reviewer
**Update when:** threat model, dependency policy, or reporting process changes.

Never commit secrets. Keep local values in ignored `.env` or `config/app.toml` files. The logging helper redacts values under sensitive structured keys, but it cannot guarantee removal of a secret embedded in arbitrary free text; do not log free-text credentials.

Report vulnerabilities privately to the repository owner. This template does not implement production authentication, authorization, network access, secret management, or runtime agent controls. See [docs/architecture/SECURITY_ARCHITECTURE.md](docs/architecture/SECURITY_ARCHITECTURE.md) and [docs/architecture/THREAT_MODEL.md](docs/architecture/THREAT_MODEL.md).
