import json

from app_template.symphony.tracker import GitHubTracker


def test_issue_parser_reads_code_packets_and_human_assignees() -> None:
    issue = GitHubTracker._issue(
        {
            "number": 42,
            "title": "Scoped task",
            "body": "## Code packets\n- `src/app`\n- `tests/unit`\n\n## Verification\n- pytest\n",
            "state": "OPEN",
            "labels": [{"name": "status:ready"}],
            "assignees": [{"login": "successbycs"}],
            "url": "https://example.test/issues/42",
        }
    )
    assert issue.code_packets == ("src/app", "tests/unit")
    assert issue.assignees == ("successbycs",)


def test_issue_parser_treats_explicit_unscoped_declaration_as_empty_packets() -> None:
    issue = GitHubTracker._issue(
        {
            "number": 43,
            "title": "Unscoped task",
            "body": "## Code packets\n- unscoped — serialize\n",
            "state": "open",
            "labels": [],
            "assignees": [],
        }
    )
    assert issue.code_packets == ()


def test_observation_records_fresh_issue_and_dependency_state(monkeypatch) -> None:
    tracker = GitHubTracker("owner/repo")
    calls: list[str] = []

    def issue(*_: str) -> str:
        return json.dumps(
            {
                "number": 20,
                "title": "Historical",
                "body": None,
                "state": "CLOSED",
                "labels": [{"name": "status:ready"}],
                "assignees": [],
                "url": "https://example.test/20",
            }
        )

    def dependency(endpoint: str) -> str:
        calls.append(endpoint)
        return "[]"

    monkeypatch.setattr(tracker, "_run_issue", issue)
    monkeypatch.setattr(tracker, "_run_api", dependency)

    observation = tracker.observe("20")

    assert observation.known
    assert observation.issue is not None
    assert observation.issue.state == "closed"
    assert observation.issue.normalized_labels == {"status:ready"}
    assert observation.source == "github:issue-view"
    assert observation.fetched_at.tzinfo is not None
    assert calls == ["repos/owner/repo/issues/20/dependencies/blocked_by"]
    assert (
        tracker.claim(observation.issue, status_label="status:ready", terra_label="agent:terra")
        is False
    )


def test_failed_observation_is_unknown_and_prevents_transition(monkeypatch) -> None:
    from app_template.symphony.tracker import TrackerError

    tracker = GitHubTracker("owner/repo")

    def unavailable(*_: str) -> str:
        raise TrackerError("network unavailable")

    monkeypatch.setattr(tracker, "_run_issue", unavailable)
    observation = tracker.observe("99")

    assert observation.known is False
    assert observation.status == "unknown"
    assert observation.reason == "GitHub observation unavailable"
    stale = GitHubTracker._issue(
        {"number": 99, "title": "Stale", "body": None, "state": "OPEN", "labels": []}
    )
    assert tracker.transition(stale, "status:ready", "status:blocked") is False
