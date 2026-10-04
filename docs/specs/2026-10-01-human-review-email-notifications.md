# Human-review email notifications

**Issue:** [#19](https://github.com/successbycs/template/issues/19)
**Status:** historical implementation; retired from the upstream Symphony target

> The upstream-only decision recorded in #39–#41 retires this optional custom
> SMTP capability with the duplicate Python runtime. This document remains as
> historical evidence only; it is not a current product requirement.

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

On 2026-10-02, explicit local SMTP configuration was authorized. Added generic
implicit TLS support with verified certificates and a conflict check against
STARTTLS. Canonical verification passed 71 tests, Ruff and Markdown links.
An ignored host-local launcher references the authorized existing secret source;
no credentials were copied into template files. After explicit approval of the
recipient and displayed message, Google SMTP accepted one controlled send to
the configured recipient. The local durable record shows `sent` and one
attempt; the repository owner confirmed inbox receipt, subject, Issue link, and
handoff details. The original no-external-send boundary still applies to
automated tests and template defaults.

Run the focused Symphony notification tests and `uv run python scripts/verify.py`
from the repository root. Use only fake SMTP/notifier objects in tests.
