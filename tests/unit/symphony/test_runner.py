import asyncio
import json
from pathlib import Path

from app_template.symphony.domain import Issue
from app_template.symphony.runner import CodexAppServerRunner


class _FakeStdin:
    def __init__(self) -> None:
        self.writes: list[bytes] = []

    def write(self, value: bytes) -> None:
        self.writes.append(value)

    async def drain(self) -> None:
        return None


class _FakeProcess:
    def __init__(self) -> None:
        self.stdin = _FakeStdin()
        self.stdout = object()
        self.stderr = object()
        self.returncode: int | None = None

    def terminate(self) -> None:
        self.returncode = 0

    async def wait(self) -> int:
        return 0


def test_runner_uses_repository_root_and_removes_github_credentials(monkeypatch) -> None:
    monkeypatch.setenv("GH_TOKEN", "private")
    monkeypatch.setenv("GITHUB_TOKEN", "private")
    monkeypatch.setenv("SAFE_VALUE", "present")
    runner = CodexAppServerRunner(repository_root=Path("/tmp/repository"))
    assert runner.repository_root == Path("/tmp/repository")
    environment = runner._runner_environment()
    assert "GH_TOKEN" not in environment
    assert "GITHUB_TOKEN" not in environment
    assert environment["SAFE_VALUE"] == "present"


def test_runner_initializes_then_runs_only_in_assigned_workspace(
    monkeypatch, tmp_path: Path
) -> None:
    runner = CodexAppServerRunner(repository_root=tmp_path / "repository")
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    process = _FakeProcess()
    spawn_arguments: dict[str, object] = {}

    async def spawn(*command: str, **kwargs: object) -> _FakeProcess:
        spawn_arguments["command"] = command
        spawn_arguments.update(kwargs)
        return process

    async def messages(_: _FakeProcess):
        yield {"id": 1, "result": {}}
        yield {"id": 2, "result": {"thread": {"id": "thread-1"}}}
        yield {"id": 3, "result": {"turn": {"id": "turn-1"}}}
        yield {
            "method": "turn/completed",
            "params": {
                "threadId": "thread-1",
                "turn": {"id": "turn-1", "status": "completed"},
            },
        }

    monkeypatch.setattr(asyncio, "create_subprocess_exec", spawn)
    monkeypatch.setattr(runner, "_messages", messages)
    result = asyncio.run(
        runner.run(
            Issue(id="issue-1", identifier="#1", title="Title", description=None, state="open"),
            workspace,
            model="terra",
            role="terra",
            prompt="Implement the task.",
        )
    )

    requests = [json.loads(value) for value in process.stdin.writes]
    assert spawn_arguments["cwd"] == workspace.resolve()
    assert [request["method"] for request in requests] == [
        "initialize",
        "thread/start",
        "turn/start",
    ]
    assert requests[1]["params"]["cwd"] == str(workspace.resolve())
    assert requests[2]["params"]["cwd"] == str(workspace.resolve())
    assert result.succeeded is True
    assert result.thread_id == "thread-1"
    assert result.turn_id == "turn-1"


def test_runner_fails_fast_when_app_server_requests_approval(monkeypatch, tmp_path: Path) -> None:
    runner = CodexAppServerRunner(repository_root=tmp_path / "repository")
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    process = _FakeProcess()

    async def spawn(*_: str, **__: object) -> _FakeProcess:
        return process

    async def messages(_: _FakeProcess):
        yield {"id": 1, "result": {}}
        yield {"id": 2, "result": {"thread": {"id": "thread-1"}}}
        yield {"id": 3, "result": {"turn": {"id": "turn-1"}}}
        yield {"id": 4, "method": "item/commandExecution/requestApproval", "params": {}}

    monkeypatch.setattr(asyncio, "create_subprocess_exec", spawn)
    monkeypatch.setattr(runner, "_messages", messages)
    result = asyncio.run(
        runner.run(
            Issue(id="issue-1", identifier="#1", title="Title", description=None, state="open"),
            workspace,
            model="terra",
            role="terra",
            prompt="Implement the task.",
        )
    )

    assert result.succeeded is False
    assert result.summary == "terra requires operator approval"
