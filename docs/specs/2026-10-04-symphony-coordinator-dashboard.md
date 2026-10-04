# Upstream Symphony integration

**Status:** active product contract | **Owner:** operator | **Implementation:** #39–#41

## Outcome

The template uses the official OpenAI Symphony reference runtime to poll an
explicit GitHub Issues queue, create an isolated workspace for one eligible
Issue, and run Codex through the upstream protocol. The upstream loopback
dashboard and JSON API are the operational surface.

## Authority and non-goals

`WORKFLOW.md` is the upstream workflow format. It selects the GitHub adapter,
the repository, `symphony:ready` queue eligibility, one configured worker, a
workspace bootstrap hook, and the Codex command/sandbox policy. The scheduler
reads GitHub; it does not grant authority to work on every open Issue.

This template does not build or retain a second coordinator, dashboard, event
database, SQLite claim recovery, SMTP notification service, model-routing
system, or multi-worker qualification framework. Application audit storage is
unrelated and remains in scope for the template application.

The upstream runtime is a preview. Its mandatory start acknowledgement and
operator-controlled foreground lifecycle remain in place. It is not an
unattended production service.

## Delivery and acceptance

1. #39 pins an upstream release, verifies its integrity, configures the GitHub
   adapter and one-worker workflow, and proves the upstream loopback dashboard
   can read the empty eligible queue without dispatching a task.
2. #40 deliberately enables one small, code-changing Issue and observes
   upstream scheduling, Codex execution, review handoff, and restart behaviour.
3. #41 removes the duplicate Python runtime and retired documents only after
   #40 has durable review evidence.

The upstream dashboard may expose current scheduler state and blocked entries,
but its blocked state is in memory. A process restart repolls GitHub and may
reconsider a still-open eligible Issue; it is not a durable session-resume or
history guarantee.
