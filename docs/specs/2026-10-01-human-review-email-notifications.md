# Human-review email notifications

**Issue:** [#19](https://github.com/successbycs/template/issues/19)
**Status:** implementation

## Outcome

When Symphony moves an Issue into `status:human-review`, a configured operator
can receive one concise SMTP email about that transition. The template defaults
the recipient to `chris@successbycs.com`, but delivery is disabled until an
operator deliberately enables it and supplies SMTP settings through the runtime
environment.

## Non-goals

- This change does not send a real email, configure an SMTP provider, store
  credentials, alter GitHub notifications, or turn on live dispatch.
- It does not make notification delivery a prerequisite for task completion or
  human review.
- It does not add a provider SDK; it uses Python's standard SMTP client behind
  a replaceable boundary.

## Constraints

- Credentials and message bodies must never appear in logs, GitHub evidence,
  fixtures, or generated configuration.
- A delivery attempt is persisted locally, including a bounded failure reason,
  and is idempotent for one human-review transition.
- The notifier is enabled only when `notifications.email.enabled` is true.
- Tests use a fake notifier and never contact SMTP.

## Acceptance scenarios

1. With default disabled configuration, a human-review transition persists a
   `disabled` notification result and sends no email.
2. With a fake enabled notifier, a human-review transition sends one concise
   handoff and persists `sent`; repeating the same transition does not send a
   second message.
3. With an enabled but unusable configuration, the Issue remains in human
   review, the implementation is not retried, and a durable `failed` result is
   available to the dashboard/operator.

## Verification

Run the focused Symphony notification tests and `uv run python scripts/verify.py`
from the repository root. Use only fake SMTP/notifier objects in tests.
