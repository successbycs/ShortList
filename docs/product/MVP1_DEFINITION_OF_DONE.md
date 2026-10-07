# ShortList MVP 1 definition of done

**Status:** release gate. This applies to ShortList alongside the generic
repository policy in [Definition of Done](../harness/DEFINITION_OF_DONE.md).

MVP 1 is done only when a real visitor can use the public site to obtain the
promised automated Minimum Assessment journey safely and truthfully. It is not
done because a screen exists, an Issue is labelled complete, or a local test
passes.

## Required conditions

### Product scope is complete

- Every **Must** requirement in [REQUIREMENTS.md](REQUIREMENTS.md) has passed
  acceptance evidence or an explicit, approved scope change.
- The product does not take payment, send outbound campaigns, or promise manual
  fulfilment. Those are later work, not quiet substitutions.
- The journey clearly distinguishes evidence, inference, current-web results,
  and model-knowledge results.

### The public journey works end to end

- `https://shortlist.successbycs.com` loads over HTTPS on desktop and mobile.
- A visitor can enter a valid public domain and receive a completed/cached
  assessment or the correct honest failure message.
- A completed assessment has a matching D1 customer and run. A genuine limited
  result has its reason code. Security or service failures do not pretend to be
  website-evidence failures.
- A repeat completed-domain request demonstrably uses stored results rather
  than re-running paid work.

### Customer data and cost controls are enforced

- Browser code contains no provider key, Codex capability, database access, or
  route exposing another customer’s data.
- Domain validation, safe retrieval, D1 admission
  controls, bounded AI calls, and cache-first behaviour are covered by tests
  and observed at the real public boundary where applicable.
- A domain identifies a customer record but is never an access key to report or
  recipient data.

### Quality gates pass

- The release commands in [MVP1_RELEASE_TEST_PLAN.md](MVP1_RELEASE_TEST_PLAN.md)
  pass from a clean reviewed commit.
- New defects have focused regression tests where practical.
- The release matrix has no required row marked failed, blocked, or unobserved.
- Chris confirms the desktop and mobile journeys are comprehensible,
  accessible, and visually credible.

### Evidence is durable and reviewable

- The active ExecPlan records actual validation and remaining limitations.
- Relevant GitHub Issues have plain-language Markdown comments with reviewed
  commit, tests, public proof, and limitations. Never put escaped `\\n` text in
  a comment.
- Chris makes the final release decision. Symphony can produce a bounded code
  packet; it cannot approve deployment or call a release done.

## Not sufficient on its own

None of these alone makes MVP 1 done:

- a green unit-test run;
- a successful build or static HTTP 200;
- a mock or fake-D1 scenario;
- a screenshot without a matching stored outcome;
- a deployed Worker without a completed assessment and cached replay; or
- an Issue moved to Done before evidence is reviewed.

## Current release state — 6 October 2026

**Not ready for release.** The public URL is deployed, but the Green Gecko
submission displayed a limited-evidence page without a matching D1 record. The
live entry path is therefore unproven and the displayed message was not
diagnostically truthful. Issue #48 supplies the UI truthfulness correction; it
still requires review, promotion, deployment, and a fresh real assessment plus
cached replay.

Use [MVP1_RELEASE_TEST_PLAN.md](MVP1_RELEASE_TEST_PLAN.md) with
[REQUEST_FLOW.md](REQUEST_FLOW.md) to record the remaining evidence.
