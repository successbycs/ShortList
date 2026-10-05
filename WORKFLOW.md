---
# This is the official OpenAI Symphony v0.0.3 workflow format. It is consumed
# by the upstream executable, not by a repository-owned Python runtime.
tracker:
  kind: github
  provider:
    repo: successbycs/ShortList
    token: $GITHUB_TOKEN
  active_states: [open]
  terminal_states: [closed]
  # Queue admission is deliberate. Symphony itself never changes an Issue. A
  # worker may remove only its own existing symphony:ready label after the
  # explicit human-review handoff described below.
  required_labels: [symphony:ready]
workspace:
  # The launcher supplies an absolute, ignored path for each host checkout.
  root: $SYMPHONY_WORKSPACE_ROOT
hooks:
  after_create: |
    git clone --no-hardlinks "$SYMPHONY_SOURCE_REPO" .
agent:
  max_concurrent_agents: 1
  max_turns: 20
codex:
  command: codex app-server
  approval_policy:
    granular:
      sandbox_approval: false
      rules: false
      mcp_elicitations: false
      request_permissions: false
      skill_approval: false
  # Codex protects .git recursively in workspace-write mode, so an isolated
  # worker cannot create the local review commit required by this workflow.
  # The explicitly acknowledged launcher therefore runs this one-worker,
  # per-Issue clone with full access. Do not start it against unreviewed work.
  thread_sandbox: danger-full-access
  turn_sandbox_policy:
    type: dangerFullAccess
---

You are working on GitHub Issue {{ issue.identifier }} in the configured
repository.

Title: {{ issue.title }}

Description:
{{ issue.description }}

Read the repository guidance and the Issue before changing code. Keep the work
within the Issue's authority. Run relevant verification, record concise evidence
in the Issue, and stop for human review. After a successful local commit and
evidence comment, remove only the `symphony:ready` label from this same Issue
using the available GitHub tool. Leave the Issue open. Do not add or remove any
other label; do not change status, assignee, milestone, dependency, or Project
field; and do not push, merge, deploy, close the Issue, or broaden scope without
explicit authorization. If the evidence handoff or label removal fails, stop and
record the blocker rather than retrying unrelated work.
