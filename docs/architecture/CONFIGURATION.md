# Configuration

**Status:** active implementation policy
**Responsible role:** application maintainer
**Update when:** settings, precedence, or secret handling changes.

`src/app_template/config.py` is the canonical loader. Precedence is built-in defaults, selected TOML file, `APP_TEMPLATE_` environment values, then explicit CLI/test overrides. TOML and prefixed environment keys are rejected when unknown; Pydantic validates types and allowed values. `.env` and `config/app.toml` are ignored. `config/app.example.toml` is inactive and has no effect until selected/copied.

The default audit path is `var/audit.sqlite3`; Compose supplies `/var/lib/app-template/audit.sqlite3`. Do not put secrets in command lines, logs, examples, or Git. See [SECURITY.md](../../SECURITY.md).
