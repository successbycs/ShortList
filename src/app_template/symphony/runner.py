"""Codex runner boundary with Terra execution and Astra escalation roles."""

from __future__ import annotations

import asyncio
import json
import os
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Protocol

from app_template.symphony.domain import FailureKind, Issue, RunResult


class Runner(Protocol):
    async def run(
        self, issue: Issue, workspace: Path, *, model: str, role: str, prompt: str
    ) -> RunResult: ...


class CodexAppServerRunner:
    """Minimal JSON-RPC app-server client; protocol details follow local schema."""

    def __init__(
        self,
        command: tuple[str, ...] = ("codex", "app-server", "--stdio"),
        repository_root: Path | None = None,
    ) -> None:
        self.command = command
        self.repository_root = (repository_root or Path.cwd()).resolve()

    @staticmethod
    def _runner_environment() -> dict[str, str]:
        """Do not expose host GitHub credentials to the coding-agent child."""
        return {
            key: value
            for key, value in os.environ.items()
            if key not in {"GH_TOKEN", "GITHUB_TOKEN"}
        }

    async def _messages(
        self, process: asyncio.subprocess.Process
    ) -> AsyncIterator[dict[str, object]]:
        assert process.stdout is not None
        while line := await process.stdout.readline():
            try:
                value = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(value, dict):
                yield value

    async def run(
        self, issue: Issue, workspace: Path, *, model: str, role: str, prompt: str
    ) -> RunResult:
        """Run one app-server turn and collect terminal events conservatively.

        The app-server schema is experimental. This client performs the stable
        initialize/thread/start/turn/start shape and treats unexpected protocol
        traffic as an evidence-bearing failure instead of guessing a mutation.
        """
        workspace = workspace.resolve()
        process = await asyncio.create_subprocess_exec(
            *self.command,
            cwd=workspace,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=self._runner_environment(),
        )
        assert process.stdin is not None
        request_id = 0

        async def send(method: str, params: dict[str, object]) -> int:
            nonlocal request_id
            request_id += 1
            process.stdin.write(
                (json.dumps({"id": request_id, "method": method, "params": params}) + "\n").encode()
            )
            await process.stdin.drain()
            return request_id

        initialize_request = await send(
            "initialize", {"clientInfo": {"name": "symphony", "version": "0.1"}}
        )
        thread_request: int | None = None
        turn_request: int | None = None
        thread_id: str | None = None
        turn_id: str | None = None
        input_tokens = output_tokens = 0
        try:
            async with asyncio.timeout(3600):
                async for message in self._messages(process):
                    response_id = message.get("id")
                    if response_id == initialize_request:
                        if "error" in message:
                            return RunResult(False, f"{role} app-server initialization failed")
                        if not isinstance(message.get("result"), dict):
                            return RunResult(False, f"{role} app-server initialization was invalid")
                        thread_request = await send(
                            "thread/start",
                            {
                                "cwd": str(workspace),
                                "model": model,
                                "approvalPolicy": "on-request",
                                "sandbox": "workspace-write",
                            },
                        )
                        continue
                    if response_id == thread_request:
                        if "error" in message:
                            return RunResult(False, f"{role} app-server thread start failed")
                        if not isinstance(message.get("result"), dict):
                            return RunResult(False, f"{role} app-server thread start was invalid")
                        result = message["result"]
                        thread = result.get("thread")
                        thread_id = (
                            str(
                                result.get("threadId")
                                or result.get("thread_id")
                                or (thread.get("id") if isinstance(thread, dict) else "")
                                or ""
                            )
                            or None
                        )
                        if thread_id:
                            turn_request = await send(
                                "turn/start",
                                {
                                    "threadId": thread_id,
                                    "input": [{"type": "text", "text": prompt}],
                                    "cwd": str(workspace),
                                },
                            )
                        else:
                            return RunResult(False, f"{role} app-server thread id was missing")
                        continue
                    if response_id == turn_request:
                        if "error" in message:
                            return RunResult(
                                False, f"{role} app-server turn start failed", thread_id
                            )
                        result = message.get("result")
                        if isinstance(result, dict) and isinstance(result.get("turn"), dict):
                            turn_id = str(result["turn"].get("id") or "") or None
                    method = str(message.get("method") or "")
                    params = message.get("params")
                    if method.endswith("requestApproval") or method in {
                        "execCommandApproval",
                        "applyPatchApproval",
                    }:
                        return RunResult(
                            False,
                            f"{role} requires operator approval",
                            thread_id,
                            turn_id,
                            input_tokens,
                            output_tokens,
                            failure_kind=FailureKind.APPROVAL,
                        )
                    if isinstance(params, dict):
                        usage = params.get("usage")
                        if isinstance(usage, dict):
                            input_tokens += int(usage.get("inputTokens") or 0)
                            output_tokens += int(usage.get("outputTokens") or 0)
                        turn_id = (
                            str(params.get("turnId") or params.get("turn_id") or turn_id or "")
                            or None
                        )
                    if method.endswith("turn/completed") or method.endswith("turnCompleted"):
                        turn = params.get("turn")
                        if isinstance(turn, dict):
                            turn_id = str(turn.get("id") or turn_id or "") or None
                            if turn.get("status") != "completed":
                                return RunResult(
                                    False,
                                    f"{role} reported turn {turn.get('status') or 'failure'}",
                                    thread_id,
                                    turn_id,
                                    input_tokens,
                                    output_tokens,
                                )
                        return RunResult(
                            True,
                            f"{role} completed",
                            thread_id,
                            turn_id,
                            input_tokens,
                            output_tokens,
                        )
                    if method.endswith("turn/failed") or method.endswith("turnFailed"):
                        return RunResult(
                            False,
                            f"{role} reported turn failure",
                            thread_id,
                            turn_id,
                            input_tokens,
                            output_tokens,
                            failure_kind=FailureKind.TASK_LOCAL,
                        )
        except (TimeoutError, OSError) as error:
            return RunResult(
                False,
                f"{role} runner failure: {type(error).__name__}",
                thread_id,
                turn_id,
                failure_kind=FailureKind.ENVIRONMENT,
            )
        finally:
            if process.returncode is None:
                process.terminate()
            await process.wait()
        return RunResult(
            False,
            f"{role} app-server exited without terminal turn event",
            thread_id,
            turn_id,
            failure_kind=FailureKind.PROTOCOL,
        )
