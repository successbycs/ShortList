"""Repository-owned Symphony workflow contract."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

import yaml
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    field_validator,
    model_validator,
)


class WorkflowError(ValueError):
    """Raised for invalid or unreadable repository workflow configuration."""


class TrackerSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    repository: str
    required_labels: tuple[str, ...] = ("status:ready", "symphony:ready")
    active_states: tuple[str, ...] = ("open",)
    terminal_states: tuple[str, ...] = ("closed",)


class PollingSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    interval_seconds: int = Field(default=30, ge=1, le=3600)


class WorkspaceSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    root: Path = Path("../var/symphony/workspaces")
    branch_prefix: str = "symphony/issue-"
    after_create: str | None = None
    before_run: str | None = None
    after_run: str | None = None
    before_remove: str | None = None
    timeout_seconds: int = Field(default=60, ge=1, le=3600)


class AgentSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    max_concurrent_agents: int = Field(default=2, ge=1, le=32)
    max_attempts: int = Field(default=2, ge=1, le=10)
    terra_model: str = "gpt-5.6-terra"
    astra_model: str = "gpt-6-astra"
    turn_timeout_seconds: int = Field(default=3600, ge=10, le=86400)
    retry_backoff_seconds: int = Field(default=5, ge=1, le=3600)


class RuntimeSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    live_dispatch: bool = False
    dashboard_host: str = "127.0.0.1"
    dashboard_port: int = Field(default=8765, ge=1024, le=65535)


class EmailNotificationSettings(BaseModel):
    """Optional SMTP settings; credentials are read only from the environment."""

    model_config = ConfigDict(extra="forbid")
    enabled: bool = False
    human_review_email: str = "chris@successbycs.com"
    smtp_host: str | None = None
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_username_env: str = "SYMPHONY_SMTP_USERNAME"
    smtp_password_env: str = "SYMPHONY_SMTP_PASSWORD"
    smtp_from_env: str = "SYMPHONY_SMTP_FROM"
    use_starttls: bool = True
    use_ssl: bool = False
    timeout_seconds: int = Field(default=10, ge=1, le=60)
    max_attempts: int = Field(default=2, ge=1, le=3)

    @model_validator(mode="after")
    def validate_tls_mode(self) -> EmailNotificationSettings:
        if self.use_ssl and self.use_starttls:
            raise ValueError("Choose implicit TLS or STARTTLS, not both")
        return self


class NotificationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailNotificationSettings = EmailNotificationSettings()


class TaskContractSettings(BaseModel):
    """GitHub Issue metadata required before Symphony may dispatch work."""

    model_config = ConfigDict(extra="forbid")
    ready_label: str = "status:ready"
    eligibility_label: str = "symphony:ready"
    terra_label: str = "agent:terra"
    astra_label: str = "agent:astra"
    require_human_assignee: bool = False
    unscoped_code_packet_policy: Literal["serialize", "reject"] = "serialize"


class WorkflowConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    tracker: TrackerSettings
    polling: PollingSettings = PollingSettings()
    workspace: WorkspaceSettings = WorkspaceSettings()
    agent: AgentSettings = AgentSettings()
    runtime: RuntimeSettings = RuntimeSettings()
    notifications: NotificationSettings = NotificationSettings()
    task_contract: TaskContractSettings = TaskContractSettings()

    @field_validator("workspace")
    @classmethod
    def normalize_workspace(cls, value: WorkspaceSettings) -> WorkspaceSettings:
        value.root = Path(os.path.expandvars(os.path.expanduser(str(value.root))))
        return value

    @model_validator(mode="after")
    def validate_issue_eligibility(self) -> WorkflowConfig:
        required = set(self.tracker.required_labels)
        contract = self.task_contract
        expected = {contract.ready_label, contract.eligibility_label}
        missing = expected - required
        if missing:
            labels = ", ".join(sorted(missing))
            raise ValueError(f"tracker.required_labels missing task contract label(s): {labels}")
        return self


class Workflow(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    path: Path
    config: WorkflowConfig
    prompt_template: str


def load_workflow(path: Path = Path("WORKFLOW.md")) -> Workflow:
    """Load YAML front matter and a non-empty repository-owned prompt."""
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError as error:
        raise WorkflowError(f"missing_workflow_file: {path}") from error
    config_data: object = {}
    body = text
    if text.startswith("---\n"):
        try:
            _, front_matter, body = text.split("---\n", 2)
            config_data = yaml.safe_load(front_matter) or {}
        except (ValueError, yaml.YAMLError) as error:
            raise WorkflowError("workflow_parse_error") from error
    if not isinstance(config_data, dict):
        raise WorkflowError("workflow_front_matter_not_a_map")
    try:
        config = WorkflowConfig.model_validate(config_data)
    except ValidationError as error:
        raise WorkflowError("workflow_validation_error") from error
    prompt = body.strip()
    if not prompt:
        raise WorkflowError("workflow_prompt_empty")
    root = config.workspace.root
    if not root.is_absolute():
        config.workspace.root = (path.parent / root).resolve()
    return Workflow(path=path.resolve(), config=config, prompt_template=prompt)
