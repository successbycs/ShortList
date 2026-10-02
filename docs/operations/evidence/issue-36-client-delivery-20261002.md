# Issue 36: Codex client message-delivery investigation

Captured 2026-10-02. This is a sanitized local investigation record for
`successbycs/template` Issue #36. It contains no user-message text, prompts,
conversation or session identifiers, authentication values, or raw client-log
lines.

## Reported boundary

The user reported that some messages are delayed or never reach the active
Codex conversation until the client is restarted. The screenshot supplied with
the report shows the affected message-entry state. The expected behavior is
ordered, prompt, exactly-once delivery without a client restart.

## Local observations

Two OpenAI VS Code extension packages are installed under
`/home/chris/.vscode-server/extensions`:

| Package directory suffix | Manifest version |
| --- | --- |
| `26.5917.61114-linux-x64` | `26.5917.61114` |
| `26.928.40906-linux-x64` | `26.928.40906` |

The read-only discovery could not establish which package directory the active
webview process uses. The prior, unrelated WSL sandbox incident records a
successful fresh-editor activation check for 26.928.40906, but that test did
not exercise interactive message delivery and is not evidence of a fix here.

There are 34 `Codex.log` files beneath the VS Code Server log directory. The
most recently modified discovered log was
`20261002T131302/exthost8/openai.chatgpt/Codex.log`, modified at
2026-10-02 22:11:24 +1300. An allowlisted aggregate scan of that file produced
the following occurrence counts:

| Category (case-insensitive regular expression) | Matches |
| --- | ---: |
| WebSocket, SSE, or EventSource | 43 |
| stream or streaming | 176 |
| connection close/reset/EOF or reconnect | 25 |
| timeout/deadline | 146 |
| retry/backoff/rate-limit | 24 |
| request/response/network/fetch failure | 64 |
| user-message/send/submit/delivery/conversation/turn failure | 61 |
| authentication/authorization | 109 |
| 5xx/service/internal-server classification | 303 |

These broad strings can occur in normal extension operation and in unrelated
requests. Counts alone do not identify an individual dropped message, its
cause, or whether a service received it. No raw lines were retained or exposed.

The user-level Codex configuration contains a top-level `model` setting, but
does not contain `model_context_window`, and this repository has no project
`/.codex/config.toml`. Values were deliberately not recorded. An anecdotal
upstream suggestion to remove both settings therefore is neither directly
applicable nor a supported remedy; its author also reported that follow-up
messages still disappeared.

## Upstream correlation

OpenAI's public `openai/codex` Issue #26683, “Queued messages disappear or
remain stuck, and tasks stay in thinking state without starting,” was open when
checked on 2026-10-02. It is labeled `bug`, `extension`, and `session`, and
describes follow-up messages that disappear or remain queued, delayed task
start, and recovery only by restarting Codex. Its latest visible activity was
2026-10-02T08:56:17Z. This is a strong symptom match, not a confirmed root-cause
or fixed-version attribution.

Source links: [upstream issue #26683](https://github.com/openai/codex/issues/26683)
and [OpenAI's Codex help](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan).

## Conclusion and required owner action

No in-repository implementation owns the Codex client composer, its stream
queue, or the hosted service that dispatches the user message. No safe local
repair was identified. Do not infer that extension installation, a client
restart, or the unrelated WSL sandbox repair resolves this delivery failure.

The extension/client owner needs to correlate a controlled submission ID across
the UI queue, extension app-server, and service-side thread stream; identify
why queued follow-ups are lost or delayed; and ship a supported client/service
fix. A real acceptance test must submit uniquely identifiable follow-up
messages while a task is active, verify in-order receipt and execution, repeat
without a restart, and record delivery latency. This session cannot access
service-side telemetry or send hidden test messages into the user's
conversation, so that live boundary remains unobserved.

If a user opens or comments on the upstream issue, they should include their
extension version, VS Code/remote environment, timezone and incident times,
whether the failure occurred while a task was active, a redacted screenshot,
and only reviewed log excerpts. They should not attach full conversation logs,
tokens, or configuration files.
