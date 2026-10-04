# Set-up milestone retrospective

**Status:** review draft | **Owner:** Chris | **Snapshot:** 2026-10-04 UTC | **Source task:** [Issue #17](https://github.com/successbycs/template/issues/17)

## Scope and method

This is a read-only snapshot. It examined the Set-up GitHub Project, its
milestone items and Issue states, Issue bodies/comments, local commit history,
workflow-run metadata and failed-run logs, repository verification evidence,
and counts from the local Symphony and audit SQLite databases. It does not
alter code, Issues, labels, Project fields, runtime configuration, or external
services.

`Observed` means the cited state or command result was directly available in
the snapshot. `Inference` is an interpretation that requires human review.

## Observed outcomes

- The Set-up Project contains 17 items. Eight associated milestone Issues are
  open: #5, #10, #12, #13, #14, #16, #21, and #24. The milestone itself is
  open with 8 open and 9 closed Issues.
- Core Symphony foundations (#6–#9, #11, #19, #20, and #22) are closed and
  represented as Done in the Project. The local history contains the related
  workflow, tracker, workspace, runner, freshness, failure-classification,
  dashboard, and notification commits.
- The dashboard delivery Issue #10 remains open and Todo in the Project even
  though its latest evidence comment records a canonical verifier pass,
  loopback proof, sanitization checks, and a targeted regression correction.
- The verification demonstration #12 remains Todo. Its own acceptance criteria
  require human review of prerequisite safety work and an external GitHub
  demonstration; neither is established by the Project snapshot.
- Documentation issue #23 and dependency issue #14 are now closed. #14's
  recorded audit says the requested standard dependencies were delivered by
  closed #15. The current manifest declares FastAPI, OpenAI Agents SDK, and
  Prefect as direct dependencies.
- The source template's current Docker verifier passed with 77 tests on this
  host. A freshly bootstrapped disposable copy passed with 73 tests and four
  expected source-template-only skips. These are local results, not remote CI.
- GitHub Actions shows successful CI runs through commit
  `890fb21d1c598a5ef6e4c8e093ece9578250d45e`. Fourteen later local commits
  are ahead of `origin/main`, and current local setup/bootstrap changes are
  uncommitted; those changes have no observed remote CI run.
- Two inspected CI failures, runs 36815909330 and 36815973048, failed Ruff
  import ordering. Later workflow runs in the queried window succeeded.
- The local Symphony event database has one notification-delivery record and
  zero operational-event, queue-age, or reservation records. The local audit
  database has six audit events and one schema-metadata record. These counts
  do not demonstrate a live GitHub dispatch or real email receipt.
- The GitHub API snapshot had 5,000/5,000 core requests and 4,999/5,000
  GraphQL requests remaining. The active Codex session context reported
  140,138 tokens used; the repository has no independent token ledger for
  confirmation.

## Planned versus actual

| Planned milestone outcome | Observed actual state | Assessment |
| --- | --- | --- |
| Verified reusable template setup | Docker, locked sync, verifier, CLI no-op paths, and disposable bootstrap are locally evidenced | Substantially delivered; remote CI is stale relative to local work |
| Safe GitHub-first Symphony foundation | Tracker, runner, workspace, freshness, failure, dashboard, and notification components have committed evidence | Delivered as a local guarded foundation; not proof of continuous operation |
| Safe local activation and operator guide | Runtime packaging is closed; end-to-end proof #12 and downstream operator guide #13 are open | Incomplete by the milestone's own order |
| Human-review notification | Capability work is closed, but #21 records that an expected email was not received | Implementation proof exists; real delivery acceptance is unobserved/failed |
| Controlled concurrency | #24 remains open and depends on human-reviewed single-worker work | Correctly deferred |
| Governance/SDD policy | #16 remains open behind #13 | Not started as an independent implementation item |

## Blockers and likely causes

### Observed blockers

- #12 requires human review of several safety prerequisites and a dedicated
  external GitHub demonstration. Its acceptance criteria cannot be satisfied
  by unit tests alone.
- #13 depends on #12 human review, and #16 depends on #13. #24 likewise
  depends on reviewed single-worker/concurrency evidence.
- #21 lacks the configuration and real delivery evidence needed to establish
  why no email was received. The repository policy forbids sending a real
  email or configuring SMTP without separate authority.
- #36, outside the Set-up milestone, remains an upstream Codex client defect:
  its sandbox workaround restores local tool operations but does not establish
  prompt delivery reliability.
- Current local changes are ahead of remote CI and therefore lack a matching
  remote verification record.

### Inferences

- The main milestone constraint is governance sequencing, not a missing
  implementation primitive: multiple items deliberately await human review
  before any externally visible demonstration or concurrency work.
- Project status and Issue state are not consistently reconciled after evidence
  is delivered. #10 is the clearest example: it has delivery evidence but
  remains open/Todo. This increases triage overhead and obscures the critical
  path.

## Verification quality

Strong evidence exists for deterministic local boundaries: unit suites, Docker
verification, loopback dashboard behavior, sandbox isolation probes, disposable
bootstrap, and fake notification paths. The Definition of Done correctly
prevents treating those as proof of remote CI, a real inbox receipt, or live
GitHub dispatch.

Evidence quality is weaker at handoff boundaries. The verification matrix had
not yet incorporated the current 77-test source result or the corrected
bootstrap-copy evidence. Remote CI also lags the local branch. The next
evidence record should identify the exact commit, the real boundary, and
whether it is local, CI, provider, or human-review evidence.

## Autonomy and escalation

Observed positive controls include default-disabled live dispatch, explicit
approval gates for host changes and email, GitHub target verification before
writes, and preserved evidence when the WSL sandbox failed. The WSLg fallback
was reversible, recorded before restart, and demonstrated after restart.

The cost was substantial diagnostic churn around the Codex WSL sandbox and
message-delivery defects. The active session token count is high, but no
repository metric apportions it by issue or distinguishes productive work from
recovery. No GitHub API quota pressure was observed.

## Documentation gaps

1. Add a concise milestone-review checklist that reconciles Issue state,
   Project state, evidence commit, CI commit, and required human reviewer.
2. Update the verification matrix whenever a canonical test count or
   real-boundary proof materially changes.
3. Document a bounded, operator-owned real-email acceptance procedure for #21,
   including explicit authority and redaction, rather than leaving only a
   generic incident statement.
4. Keep host-specific Codex recovery evidence separate from reusable template
   instructions; the current WSL guidance already moves in this direction.

## Prioritized improvements for review

1. **Unblock and review #12.** Confirm whether the reviewed prerequisites are
   accepted, then authorize one dedicated, no-unrelated-dispatch GitHub
   demonstration or record the exact missing authority. This is the critical
   path to #13, #16, and #24.
2. **Resolve #21 with a bounded real-email acceptance decision.** Do not infer
   email delivery from fake-adapter tests; decide whether to supply an approved
   SMTP test configuration and recipient or explicitly defer the capability.
3. **Reconcile delivery state.** Move evidence-complete items such as #10 to
   the appropriate human-review state only after a reviewer accepts the
   evidence; retain open Issues when acceptance is genuinely incomplete.
4. **Push/review the verified local changes and observe CI at that exact
   commit.** This closes the current local/remote evidence gap without treating
   historical green runs as proof for newer work.
5. **Only then consider #16 and #24.** The SDD and concurrency programmes
   should not bypass the reviewed single-worker evidence gate.

## Review decision requested

Issue #18 is the designated human-review gate. The reviewer should decide
which of the five prioritized actions becomes a newly scoped next-milestone
Issue, whether the temporary WSLg workaround remains active, and whether any
Set-up item is ready for review or closure. This report does not make those
state changes.
