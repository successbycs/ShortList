---
tracker:
  repository: successbycs/template
  required_labels: [status:ready, symphony:ready]
  active_states: [open]
  terminal_states: [closed]
polling:
  interval_seconds: 30
workspace:
  root: ../var/symphony/workspaces
  timeout_seconds: 60
agent:
  max_concurrent_agents: 2
  max_attempts: 2
  terra_model: gpt-5.6-terra
  astra_model: gpt-6-astra
  turn_timeout_seconds: 3600
  retry_backoff_seconds: 5
runtime:
  # Must be explicitly enabled after the dashboard and a dedicated Issue test are verified.
  live_dispatch: false
  dashboard_host: 127.0.0.1
  dashboard_port: 8765
notifications:
  email:
    # Delivery is opt-in. Configure host and the named runtime environment
    # variables before enabling it; never put credentials in this file.
    enabled: false
    human_review_email: chris@successbycs.com
    smtp_host: null
    smtp_port: 587
    smtp_username_env: SYMPHONY_SMTP_USERNAME
    smtp_password_env: SYMPHONY_SMTP_PASSWORD
    smtp_from_env: SYMPHONY_SMTP_FROM
    use_starttls: true
    timeout_seconds: 10
    max_attempts: 2
task_contract:
  ready_label: status:ready
  eligibility_label: symphony:ready
  terra_label: agent:terra
  astra_label: agent:astra
  # Empty code-packet declarations serialize work; they never create unsafe parallelism.
  unscoped_code_packet_policy: serialize
---

You are the implementation worker for one GitHub Issue. Work only inside the
assigned Symphony workspace and code packet. Use Terra for normal implementation.
After two evidence-bearing failures, preserve logs and state for Astra to create
and review an ExecPlan; Terra executes that repair and resumes the original task.
Do not push, merge, close Issues, deploy, or operate outside the task authority.
