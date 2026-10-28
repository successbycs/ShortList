# Security

**Status:** active
**Responsible role:** security reviewer
**Update when:** threat model, dependency policy, or reporting process changes.

Never commit secrets. Keep local values in ignored `.env` or `config/app.toml` files. The logging helper redacts values under sensitive structured keys, but it cannot guarantee removal of a secret embedded in arbitrary free text; do not log free-text credentials.

The web app (`apps/web`) runs as a Cloudflare Worker and reads two Worker
secrets, `OPENAI_API_KEY` and `ASSESSMENT_IP_HASH_SECRET`. They are set with
Wrangler for the deployed Worker and in an ignored `apps/web/.dev.vars` file
locally. Name them in docs and Issues; never write their values anywhere in the
repository, logs, Issues or pull requests. Changing a production secret is a
production change that Chris authorises.

Report vulnerabilities privately to the repository owner. The root Python template does not implement production authentication, authorization, network access, secret management, or runtime agent controls. See [docs/architecture/SECURITY_ARCHITECTURE.md](docs/architecture/SECURITY_ARCHITECTURE.md) and [docs/architecture/THREAT_MODEL.md](docs/architecture/THREAT_MODEL.md).
