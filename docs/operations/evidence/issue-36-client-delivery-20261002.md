# Issue 36: Codex client message-delivery investigation

## Installation on 2026-10-04 (Pacific/Auckland client date)

The user explicitly requested installation and testing. The VS Code Server
registration still selected `openai.chatgpt-26.928.40906-linux-x64`. The
installed bundle and candidate matched the original and candidate digests
recorded below. A fresh preinstallation proof passed.

Installed the candidate by atomic replacement of
`/home/chris/.vscode-server/extensions/openai.chatgpt-26.928.40906-linux-x64/out/extension.js`,
preserving its permissions. The installed SHA-256 is
`391f6bd1ee3b547a0d87d9464274d714b553084565a87979da4eced9fa9ecb27`.
The verified original, package manifest and proof's webview parser are backed
up under `/home/chris/.local/state/codex-patches/issue-36-26.928.40906`.
No other extension file was replaced. This is a local custom patch;
an official extension update can replace it.

Postinstallation commands, from `/home/chris/template`, all exited zero:

```bash
/home/chris/.nvm/versions/node/v22.22.0/bin/node \
  scripts/prove_codex_queue_patch.cjs \
  /home/chris/.local/state/codex-patches/issue-36-26.928.40906 \
  /home/chris/.vscode-server/extensions/openai.chatgpt-26.928.40906-linux-x64/out/extension.js
/home/chris/.nvm/versions/node/v22.22.0/bin/node --check \
  /home/chris/.vscode-server/extensions/openai.chatgpt-26.928.40906-linux-x64/out/extension.js
.venv/bin/python -m pytest -q tests/unit/test_codex_queue_patch.py
```

The baseline again reproduced SyntaxError, the installed candidate returned
the JSON acknowledgement, and the lock semantics checks passed. Six builder
tests passed in 0.03 seconds. This exercises the installed bytes in isolation;
activation in the already-running extension and live delivery remain unobserved.

Human recovery/activation action: save work, open the VS Code command palette,
run `Developer: Reload Window`, reopen this workspace, and start a new Codex
session with: “Continue Issue #36 post-reload verification. Verify the installed
patch, then test queued and steering messages with me.” Do not shut down WSL.
The current session cannot perform its own after-reload test.

In that new session, confirm the registered extension and installed digest,
then send three uniquely numbered test messages while the agent is active,
first using Queue and then Steer. Record submission times, receipt order,
duplicates, missing messages, and whether queue waits end after the active
turn finishes. Check only new log entries for the exact lock-release JSON
error. Queued delivery is intentionally deferred until turn completion;
steering may wait for a safe execution boundary. Repeat without another reload.
Absence of the log error alone does not prove the user-visible issue fixed.

If the extension fails after reload, use an ordinary WSL terminal to restore
the verified original (the helper refuses an intervening update):

```bash
python3 /home/chris/.local/state/codex-patches/issue-36-26.928.40906/install-or-restore.py restore
```

Then run `Developer: Reload Window` again. The backup and helper are outside
`/tmp` and survive a reboot. Actual live rollback has not been exercised.
Leave Issue #36 open until the live tests are recorded.

## Patch development result

The following describes the earlier build milestone; the installation result
above supersedes its historical “not installed” status.

The user subsequently requested a patch. Inspection of installed JavaScript
found a reproducible response-contract defect. The
`queued-follow-up-send-lock-release` handler in `out/extension.js` calls the
lock manager but returns `undefined`. The webview's `onFetchResponse` parses
the JSON response; `JSON.stringify(undefined)` provides no valid JSON body.
The three latest inspected logs contained 4, 3 and 7 release-error entries.
The newest log's sanitized exception was
`SyntaxError: "undefined" is not valid JSON` at `onFetchResponse`.

The candidate adds `return{success:true}` after the lock release. It changes
no queue ordering, deduplication, ownership, retries, or model settings.
The original lock is already released before parsing fails, and the queue
caller catches the exception. Therefore this confirmed defect **does not
establish the cause of all missing/delayed messages**. The previous statement
that no local patch could be built was too broad.

The patch builder and regression proof are:

- [Python builder](../../../scripts/build_codex_queue_patch.py)
- [Node proof using the installed handler, lock class and response parser](../../../scripts/prove_codex_queue_patch.cjs)
- [Builder regression tests](../../../tests/unit/test_codex_queue_patch.py)

From `/home/chris/template`, reproduce the build with a new output directory:

```bash
python3 scripts/build_codex_queue_patch.py \
  --extension /home/chris/.vscode-server/extensions/openai.chatgpt-26.928.40906-linux-x64 \
  --output /tmp/issue-36-queue-patch
/home/chris/.nvm/versions/node/v22.22.0/bin/node \
  scripts/prove_codex_queue_patch.cjs \
  /home/chris/.vscode-server/extensions/openai.chatgpt-26.928.40906-linux-x64 \
  /tmp/issue-36-queue-patch/extension.js
/home/chris/.nvm/versions/node/v22.22.0/bin/node --check \
  /tmp/issue-36-queue-patch/extension.js
.venv/bin/python -m pytest -q tests/unit/test_codex_queue_patch.py
```

The output directory must not already exist; select another unused path when
repeating. The builder refuses changed versions, changed input digests,
ambiguous/missing handler sites, and output inside the extension installation.
It never installs the candidate. Do not publish the generated proprietary
bundle; only the small transformation and proof are repository artifacts.

Observed on 2026-10-02: baseline JSON error reproduced; patched response
resolved; sent-message deduplication, unsent-message retry eligibility, foreign
lock protection and next-message lock acquisition passed. Full generated-bundle
syntax validation passed. Six builder tests and focused Ruff checks passed.
Two initial harness extraction/binding errors were corrected before the valid
proof; they were test-harness mistakes, not client failures.

Full verification: `timeout 45s .venv/bin/python scripts/verify.py` outside the
sandbox passed Ruff, all 77 tests in 3.46 seconds, and Markdown links (exit 0).
The initial sandboxed verifier was interrupted after stalling; a bounded
verbose rerun timed out at `test_dashboard_is_read_only_and_handles_missing_database`
(exit 124). That stall did not occur outside the sandbox. Whitespace checks passed.

Input SHA-256:
`550b03e76ac5a83cb25788aa3240ba445d0e7c7d4e76af8331442687529617ef`.
Candidate SHA-256:
`391f6bd1ee3b547a0d87d9464274d714b553084565a87979da4eced9fa9ecb27`.

The candidate exists locally at `/tmp/issue-36-queue-patch/extension.js` and is
not installed. Activation would replace the matching extension bundle after a
verified backup, then require a human VS Code reload and a new session. Recovery
would restore that exact backup only while the candidate digest still matches;
an intervening extension update must not be overwritten. Because reload ends
the current session, retain this evidence before activation and perform the
after-test in a new user-directed session. No reload, install, or runtime
configuration change occurred in this build task.

Live acceptance remains unobserved: repeated queue and steer submissions must
reach the active agent in order and without duplication, disappearances, or
unexpected delay. Reproduce the original user-visible failure before calling
it repaired. The isolated proof establishes the acknowledgement correction,
not end-to-end recovery.

## Earlier investigation (retained with limits)

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
