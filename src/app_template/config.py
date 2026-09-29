"""Typed, fail-closed application configuration."""

from __future__ import annotations

import os
import tomllib
from collections.abc import Mapping
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, SecretStr, ValidationError

ENV_PREFIX = "APP_TEMPLATE_"
CONFIG_FILE_ENV = f"{ENV_PREFIX}CONFIG_FILE"


class ConfigurationError(ValueError):
    """Raised when configuration cannot be safely loaded."""


class AppSettings(BaseModel):
    """Settings for the self-test harness, not for a product integration."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    app_name: str = Field(default="app-template", min_length=1, max_length=80)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    audit_database_path: Path = Path("var/audit.sqlite3")
    diagnostic_token: SecretStr | None = None

    def safe_values(self) -> dict[str, Any]:
        """Return settings suitable for structured logs and command output."""
        values = self.model_dump(mode="json")
        if self.diagnostic_token is not None:
            values["diagnostic_token"] = "[REDACTED]"
        return values


def _toml_values(path: Path) -> dict[str, Any]:
    try:
        with path.open("rb") as config_file:
            content = tomllib.load(config_file)
    except FileNotFoundError as error:
        raise ConfigurationError(f"Configuration file does not exist: {path}") from error
    except tomllib.TOMLDecodeError as error:
        raise ConfigurationError(f"Configuration file is not valid TOML: {path}") from error

    if not isinstance(content, dict):
        raise ConfigurationError(f"Configuration file must contain a TOML table: {path}")
    return content


def _environment_values(environ: Mapping[str, str]) -> dict[str, str]:
    known = set(AppSettings.model_fields)
    values: dict[str, str] = {}
    unknown: list[str] = []
    for name, value in environ.items():
        if not name.startswith(ENV_PREFIX) or name == CONFIG_FILE_ENV:
            continue
        field = name.removeprefix(ENV_PREFIX).lower()
        if field not in known:
            unknown.append(name)
        else:
            values[field] = value
    if unknown:
        names = ", ".join(sorted(unknown))
        raise ConfigurationError(f"Unknown configuration environment variable(s): {names}")
    return values


def load_settings(
    *,
    config_path: Path | None = None,
    overrides: Mapping[str, Any] | None = None,
    environ: Mapping[str, str] | None = None,
) -> AppSettings:
    """Load defaults, TOML, `APP_TEMPLATE_` environment, then explicit overrides.

    The highest-priority explicit overrides are intended for a CLI invocation or
    test. Unknown TOML and override keys are rejected by Pydantic.
    """
    active_environ = os.environ if environ is None else environ
    selected_path = config_path
    if selected_path is None and CONFIG_FILE_ENV in active_environ:
        selected_path = Path(active_environ[CONFIG_FILE_ENV])

    values: dict[str, Any] = {}
    if selected_path is not None:
        values.update(_toml_values(selected_path))
    values.update(_environment_values(active_environ))
    if overrides:
        values.update(overrides)

    try:
        return AppSettings.model_validate(values)
    except ValidationError as error:
        raise ConfigurationError("Invalid application configuration") from error
