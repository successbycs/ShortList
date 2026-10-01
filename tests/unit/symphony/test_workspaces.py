import asyncio
import subprocess
from pathlib import Path

import pytest

from app_template.symphony.domain import Issue, RunResult
from app_template.symphony.scheduler import Scheduler
from app_template.symphony.workflow import WorkspaceSettings, load_workflow
from app_template.symphony.workspaces import WorkspaceError, WorkspaceManager


def git(repository: Path, *arguments: str) -> str:
    result = subprocess.run(
        ["git", *arguments],
        cwd=repository,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def disposable_repository(tmp_path: Path) -> Path:
    repository = tmp_path / "shared-checkout"
    repository.mkdir()
    git(repository, "init")
    git(repository, "config", "user.email", "operator@example.test")
    git(repository, "config", "user.name", "Operator")
    (repository / "README.md").write_text("seed\n", encoding="utf-8")
    git(repository, "add", "README.md")
    git(repository, "commit", "-m", "seed")
    return repository


def test_workspace_lifecycle_creates_real_worktree_and_preserves_shared_checkout(
    tmp_path: Path,
) -> None:
    repository = disposable_repository(tmp_path)
    settings = WorkspaceSettings(root=tmp_path / "workspaces")
    manager = WorkspaceManager(settings, repository)
    issue = Issue("1", "#1", "Task", None, "open")

    workspace = manager.prepare(issue)

    assert workspace.parent == settings.root.resolve()
    assert workspace != repository
    assert git(workspace, "rev-parse", "--show-toplevel") == str(workspace)
    assert git(workspace, "branch", "--show-current") == manager.branch_for(issue)
    manager.complete(workspace)
    manager.remove(workspace)
    assert not workspace.exists()
    assert (repository / "README.md").exists()
    assert str(workspace) not in git(repository, "worktree", "list", "--porcelain")


def test_workspace_recovery_reuses_the_same_valid_worktree(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)
    settings = WorkspaceSettings(root=tmp_path / "workspaces")
    issue = Issue("2", "#2", "Recover", None, "open")
    manager = WorkspaceManager(settings, repository)
    workspace = manager.prepare(issue)

    recovered = WorkspaceManager(settings, repository).prepare(issue)

    assert recovered == workspace
    assert git(recovered, "branch", "--show-current") == manager.branch_for(issue)
    WorkspaceManager(settings, repository).remove(recovered)


def test_workspace_root_inside_shared_checkout_is_rejected(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)

    with pytest.raises(WorkspaceError, match="outside the shared checkout"):
        WorkspaceManager(WorkspaceSettings(root=repository / "workspaces"), repository).prepare(
            Issue("invalid", "#invalid", "Invalid", None, "open")
        )


def test_workspace_removal_rejects_foreign_repository(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)
    root = tmp_path / "workspaces"
    foreign = root / "foreign"
    foreign.mkdir(parents=True)
    git(foreign, "init")
    manager = WorkspaceManager(WorkspaceSettings(root=root), repository)

    with pytest.raises(WorkspaceError, match="different Git repository"):
        manager.remove(foreign)

    assert foreign.exists()
    assert repository.exists()


def test_failing_required_hook_leaves_recoverable_worktree(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)
    settings = WorkspaceSettings(root=tmp_path / "workspaces", before_run="exit 7")
    manager = WorkspaceManager(settings, repository)
    issue = Issue("3", "#3", "Task", None, "open")

    with pytest.raises(WorkspaceError, match="workspace hook failed"):
        manager.prepare(issue)

    workspace = manager.path_for(issue)
    assert git(workspace, "rev-parse", "--show-toplevel") == str(workspace)
    WorkspaceManager(WorkspaceSettings(root=settings.root), repository).remove(workspace)


def test_workspace_removal_rejects_path_outside_root(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)
    manager = WorkspaceManager(WorkspaceSettings(root=tmp_path / "workspaces"), repository)
    outside = tmp_path / "outside"
    outside.mkdir()

    with pytest.raises(WorkspaceError, match="escapes"):
        manager.remove(outside)
    assert outside.exists()


def test_workspace_hooks_run_only_inside_the_created_worktree(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)
    settings = WorkspaceSettings(
        root=tmp_path / "workspaces",
        after_create="touch created",
        before_run="test -f created",
        after_run="touch completed",
        before_remove="test -f completed",
    )
    manager = WorkspaceManager(settings, repository)
    workspace = manager.prepare(Issue("hooks", "#hooks", "Hooks", None, "open"))

    manager.complete(workspace)

    assert (workspace / "created").exists()
    assert (workspace / "completed").exists()
    with pytest.raises(WorkspaceError, match="contains modified or untracked files"):
        manager.remove(workspace)
    assert workspace.exists()
    assert (repository / "created").exists() is False
    assert (repository / "completed").exists() is False


def test_scheduler_passes_real_issue_worktree_to_runner(tmp_path: Path) -> None:
    repository = disposable_repository(tmp_path)
    workflow_path = repository / "WORKFLOW.md"
    workflow_path.write_text(
        "---\n"
        "tracker:\n"
        "  repository: owner/repo\n"
        "runtime:\n"
        "  live_dispatch: true\n"
        "workspace:\n"
        "  root: ../workspaces\n"
        "---\n"
        "work\n",
        encoding="utf-8",
    )
    issue = Issue(
        "runner",
        "#runner",
        "Run in worktree",
        None,
        "open",
        labels=("status:ready", "symphony:ready"),
    )

    class Tracker:
        def candidates(self, required_labels: set[str]) -> list[Issue]:
            return [issue]

        def claim(self, claimed: Issue, *, status_label: str, terra_label: str) -> bool:
            return claimed == issue

        def finish(self, _: Issue, *, status_label: str) -> None:
            return None

        def comment(self, _: Issue, body: str) -> None:
            return None

    class Runner:
        def __init__(self) -> None:
            self.workspace: Path | None = None

        async def run(
            self,
            _: Issue,
            workspace: Path,
            **__: str,
        ) -> RunResult:
            self.workspace = workspace
            return RunResult(True, "completed")

    runner = Runner()
    scheduler = Scheduler(load_workflow(workflow_path), Tracker(), runner)

    async def execute() -> None:
        await scheduler.tick()
        await asyncio.gather(*scheduler.running.values())

    asyncio.run(execute())

    assert runner.workspace is not None
    assert git(runner.workspace, "rev-parse", "--show-toplevel") == str(runner.workspace)
    assert runner.workspace == scheduler.workspaces.path_for(issue)
    scheduler.workspaces.remove(runner.workspace)
