---
# This is the official OpenAI Symphony v0.0.3 workflow format. It is consumed
# by the upstream executable, not by the template's transitional Python code.
tracker:
  kind: github
  provider:
    repo: successbycs/template
    token: $GITHUB_TOKEN
  active_states: [open]
  terminal_states: [closed]
  # Queue admission is deliberate. Symphony reads this label but never adds,
  # removes, assigns, closes, or otherwise mutates an Issue to make it eligible.
  required_labels: [symphony:ready]
workspace:
  # The launcher supplies an absolute, ignored path for each host checkout.
  root: $SYMPHONY_WORKSPACE_ROOT
hooks:
  after_create: |
    git clone --depth 1 https://github.com/successbycs/template.git .
agent:
  max_concurrent_agents: 1
  max_turns: 20
codex:
  command: codex app-server
  approval_policy:
    reject:
      sandbox_approval: true
      rules: true
      mcp_elicitations: true
  thread_sandbox: workspace-write
  turn_sandbox_policy:
    type: workspaceWrite
    networkAccess: true
---

You are working on GitHub Issue {{ issue.identifier }} in the configured
repository.

Title: {{ issue.title }}

Description:
{{ issue.description }}

Read the repository guidance and the Issue before changing code. Keep the work
within the Issue's authority. Run relevant verification, record concise evidence
in the Issue, and stop for human review. Do not push, merge, deploy, close the
Issue, or broaden scope without explicit authorization.
