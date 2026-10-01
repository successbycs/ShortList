"""Optional, fail-safe human-review notification boundary."""

from __future__ import annotations

import os
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

from app_template.symphony.domain import RunRecord
from app_template.symphony.workflow import EmailNotificationSettings


@dataclass(frozen=True)
class NotificationResult:
    status: str
    detail: str
    attempts: int


class HumanReviewNotifier(Protocol):
    def notify(self, record: RunRecord) -> NotificationResult:
        """Attempt a human-review handoff without raising through task completion."""


class SmtpHumanReviewNotifier:
    """SMTP adapter that keeps configuration and failure details out of logs."""

    def __init__(self, settings: EmailNotificationSettings) -> None:
        self.settings = settings

    def notify(self, record: RunRecord) -> NotificationResult:
        if not self.settings.enabled:
            return NotificationResult("disabled", "Email notification is disabled", 0)
        username = os.environ.get(self.settings.smtp_username_env)
        password = os.environ.get(self.settings.smtp_password_env)
        sender = os.environ.get(self.settings.smtp_from_env)
        if not self.settings.smtp_host or not username or not password or not sender:
            return NotificationResult("failed", "SMTP configuration is incomplete", 0)
        message = EmailMessage()
        message["To"] = self.settings.human_review_email
        message["From"] = sender
        message["Subject"] = f"Symphony human review: {record.issue.identifier}"
        message.set_content(
            "A Symphony task is ready for human review.\n\n"
            f"Issue: {record.issue.identifier} — {record.issue.title}\n"
            f"URL: {record.issue.url or 'not available'}\n"
            f"Attempt: {record.attempt}\n"
        )
        for attempt in range(1, self.settings.max_attempts + 1):
            try:
                with smtplib.SMTP(
                    self.settings.smtp_host,
                    self.settings.smtp_port,
                    timeout=self.settings.timeout_seconds,
                ) as client:
                    if self.settings.use_starttls:
                        client.starttls()
                    client.login(username, password)
                    client.send_message(message)
                return NotificationResult("sent", "SMTP handoff sent", attempt)
            except (OSError, smtplib.SMTPException):
                continue
        return NotificationResult("failed", "SMTP delivery failed", self.settings.max_attempts)
