from pathlib import Path

import pytest

from app_template.symphony.workflow import WorkflowError, load_workflow


def test_workflow_loads_repository_contract(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text(
        "---\n"
        "tracker:\n"
        "  repository: owner/repo\n"
        "runtime:\n"
        "  live_dispatch: false\n"
        "---\n"
        "implement safely\n",
        encoding="utf-8",
    )
    workflow = load_workflow(path)
    assert workflow.config.tracker.repository == "owner/repo"
    assert workflow.config.workspace.root == (tmp_path.parent / "var/symphony/workspaces").resolve()
    assert workflow.config.tracker.required_labels == ("status:ready", "symphony:ready")
    assert workflow.config.task_contract.unscoped_code_packet_policy == "serialize"
    assert workflow.config.agent.max_concurrent_agents == 1


def test_workflow_rejects_unknown_settings_and_empty_prompt(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text(
        "---\ntracker:\n  repository: owner/repo\nunknown: true\n---\n", encoding="utf-8"
    )
    with pytest.raises(WorkflowError, match="workflow_validation_error"):
        load_workflow(path)


def test_workflow_requires_ready_and_symphony_eligibility_labels(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text(
        "---\ntracker:\n  repository: owner/repo\n  required_labels: [symphony:ready]\n---\nwork\n",
        encoding="utf-8",
    )
    with pytest.raises(WorkflowError, match="workflow_validation_error"):
        load_workflow(path)


def test_workflow_rejects_parallel_worker_configuration(tmp_path: Path) -> None:
    path = tmp_path / "WORKFLOW.md"
    path.write_text(
        "---\ntracker:\n  repository: owner/repo\nagent:\n  max_concurrent_agents: 2\n---\nwork\n",
        encoding="utf-8",
    )

    with pytest.raises(WorkflowError, match="workflow_validation_error"):
        load_workflow(path)
