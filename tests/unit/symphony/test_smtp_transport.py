from unittest.mock import patch

import pytest

from app_template.symphony.domain import Issue, RunRecord, RunStatus
from app_template.symphony.notifications import SmtpHumanReviewNotifier
from app_template.symphony.workflow import EmailNotificationSettings


@pytest.mark.parametrize("implicit", [True, False])
def test_smtp_uses_verified_tls_without_real_network(monkeypatch, implicit):
    for key in ("USERNAME", "PASSWORD", "FROM"):
        monkeypatch.setenv(f"SYMPHONY_SMTP_{key}", "synthetic")
    settings = EmailNotificationSettings(
        enabled=True,
        smtp_host="smtp.example.invalid",
        smtp_port=465 if implicit else 587,
        use_ssl=implicit,
        use_starttls=not implicit,
    )
    record = RunRecord(Issue("test", "test", "synthetic", None, "open"), RunStatus.HUMAN_REVIEW)
    with patch("smtplib.SMTP_SSL") as secure, patch("smtplib.SMTP") as plain:
        result = SmtpHumanReviewNotifier(settings).notify(record)
        chosen, unused = (secure, plain) if implicit else (plain, secure)
        unused.assert_not_called()
        assert result.status == "sent"
        client = chosen.return_value.__enter__.return_value
        if implicit:
            context = chosen.call_args.kwargs["context"]
            client.starttls.assert_not_called()
        else:
            context = client.starttls.call_args.kwargs["context"]
        assert context.check_hostname
        client.send_message.assert_called_once()


def test_smtp_rejects_conflicting_tls_modes():
    with pytest.raises(ValueError, match="Choose implicit TLS or STARTTLS"):
        EmailNotificationSettings(use_ssl=True, use_starttls=True)
