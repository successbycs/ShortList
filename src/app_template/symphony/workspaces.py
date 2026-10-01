"""Validated per-Issue Git worktree lifecycle."""

from __future__ import annotations

import hashlib
import re
import shutil
import subprocess
from pathlib import Path

from app_template.symphony.domain import Issue
from app_template.symphony.workflow import WorkspaceSettings


class WorkspaceError(RuntimeError):
    """Workspace containment, Git identity, or hook execution failed."""


class WorkspaceManager:
    """Create and recover one validated Git worktree for each Symphony Issue."""

    def __init__(self, settings: WorkspaceSettings, repository_root: Path) -> None:
        self.settings = settings
        self.repository_root = repository_root.resolve()
        self.root = settings.root.resolve()

    def _validate_root(self) -> None:
        if not shutil.which("git"):
            raise WorkspaceError("git executable is required for Symphony worktrees")
        top_level = self._git("rev-parse", "--show-toplevel", cwd=self.repository_root)
        if Path(top_level).resolve() != self.repository_root:
            raise WorkspaceError("workspace repository root is not a Git checkout")
        if (
            self.root == self.repository_root
            or self.root.is_relative_to(self.repository_root)
            or self.repository_root.is_relative_to(self.root)
        ):
            raise WorkspaceError("workspace root must be outside the shared checkout")

    def _git(self, *arguments: str, cwd: Path | None = None) -> str:
        result = subprocess.run(
            ["git", *arguments],
            cwd=cwd or self.repository_root,
            check=False,
            capture_output=True,
            text=True,
            timeout=self.settings.timeout_seconds,
        )
        if result.returncode:
            detail = result.stderr.strip() or result.stdout.strip() or "Git command failed"
            raise WorkspaceError(detail)
        return result.stdout.strip()

    @staticmethod
    def _issue_key(issue: Issue) -> str:
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", issue.identifier)
        if safe != issue.identifier:
            safe = f"{safe}-{hashlib.sha256(issue.identifier.encode()).hexdigest()[:16]}"
        return safe

    def path_for(self, issue: Issue) -> Path:
        path = (self.root / self._issue_key(issue)).resolve()
        if path.parent != self.root:
            raise WorkspaceError("workspace path escapes configured root")
        return path

    def branch_for(self, issue: Issue) -> str:
        return f"{self.settings.branch_prefix}{self._issue_key(issue)}"

    def _hook(self, command: str | None, workspace: Path, *, fatal: bool) -> None:
        if not command:
            return
        result = subprocess.run(
            ["sh", "-lc", command],
            cwd=workspace,
            check=False,
            capture_output=True,
            text=True,
            timeout=self.settings.timeout_seconds,
        )
        if fatal and result.returncode:
            raise WorkspaceError(result.stderr.strip() or "workspace hook failed")

    def _assert_contained(self, workspace: Path) -> Path:
        resolved = workspace.resolve()
        if resolved.parent != self.root:
            raise WorkspaceError("workspace operation escapes configured root")
        return resolved

    def _git_common_dir(self, directory: Path) -> Path:
        common = Path(self._git("rev-parse", "--git-common-dir", cwd=directory))
        return (directory / common).resolve() if not common.is_absolute() else common.resolve()

    def _assert_worktree(self, workspace: Path, branch: str | None = None) -> Path:
        contained = self._assert_contained(workspace)
        if not contained.is_dir():
            raise WorkspaceError("workspace does not exist")
        top_level = Path(self._git("rev-parse", "--show-toplevel", cwd=contained)).resolve()
        if top_level != contained:
            raise WorkspaceError("workspace is not its own Git worktree")
        if self._git_common_dir(contained) != self._git_common_dir(self.repository_root):
            raise WorkspaceError("workspace belongs to a different Git repository")
        if branch is not None:
            current = self._git("symbolic-ref", "--quiet", "--short", "HEAD", cwd=contained)
            if current != branch:
                raise WorkspaceError("workspace branch does not match Issue branch")
        return contained

    def _branch_exists(self, branch: str) -> bool:
        result = subprocess.run(
            ["git", "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"],
            cwd=self.repository_root,
            check=False,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=self.settings.timeout_seconds,
        )
        return result.returncode == 0

    def prepare(self, issue: Issue) -> Path:
        self._validate_root()
        workspace = self.path_for(issue)
        branch = self.branch_for(issue)
        self.root.mkdir(parents=True, exist_ok=True)
        if workspace.exists():
            self._assert_worktree(workspace, branch)
        else:
            self._git("worktree", "prune")
            if self._branch_exists(branch):
                self._git("worktree", "add", str(workspace), branch)
            else:
                self._git("worktree", "add", "-b", branch, str(workspace), "HEAD")
            self._assert_worktree(workspace, branch)
            self._hook(self.settings.after_create, workspace, fatal=True)
        self._hook(self.settings.before_run, workspace, fatal=True)
        return workspace

    def complete(self, workspace: Path) -> None:
        self._hook(self.settings.after_run, self._assert_worktree(workspace), fatal=False)

    def remove(self, workspace: Path) -> None:
        """Remove only a clean, validated Issue worktree; never delete its branch."""
        contained = self._assert_contained(workspace)
        if not contained.exists():
            self._git("worktree", "prune")
            return
        self._assert_worktree(contained)
        self._hook(self.settings.before_remove, contained, fatal=True)
        self._git("worktree", "remove", str(contained))
        self._git("worktree", "prune")
