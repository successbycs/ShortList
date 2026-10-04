from __future__ import annotations

from pathlib import Path

import pytest

from shortlist.config import ConfigurationError, load_settings


def test_toml_environment_and_override_precedence(tmp_path: Path) -> None:
    config_file = tmp_path / "app.toml"
    config_file.write_text('app_name = "from-file"\nlog_level = "WARNING"\n', encoding="utf-8")

    settings = load_settings(
        config_path=config_file,
        environ={"APP_TEMPLATE_APP_NAME": "from-environment"},
        overrides={"app_name": "from-override"},
    )

    assert settings.app_name == "from-override"
    assert settings.log_level == "WARNING"


def test_unknown_toml_key_is_rejected(tmp_path: Path) -> None:
    config_file = tmp_path / "app.toml"
    config_file.write_text("unknown_key = true\n", encoding="utf-8")

    with pytest.raises(ConfigurationError, match="Invalid application configuration"):
        load_settings(config_path=config_file, environ={})


def test_unknown_environment_key_is_rejected() -> None:
    with pytest.raises(ConfigurationError, match="Unknown configuration environment variable"):
        load_settings(environ={"APP_TEMPLATE_UNEXPECTED": "true"})


def test_invalid_value_is_rejected_without_echoing_it() -> None:
    with pytest.raises(ConfigurationError) as error:
        load_settings(environ={"APP_TEMPLATE_LOG_LEVEL": "secret-value-not-a-level"})

    assert "secret-value-not-a-level" not in str(error.value)


def test_safe_values_redacts_synthetic_token() -> None:
    settings = load_settings(environ={"APP_TEMPLATE_DIAGNOSTIC_TOKEN": "synthetic-secret"})

    assert settings.safe_values()["diagnostic_token"] == "[REDACTED]"
