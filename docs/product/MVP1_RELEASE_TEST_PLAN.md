# ShortList MVP 1 release test plan

**Status:** active release-quality plan. It defines what must be proved before
MVP 1 can be called ready; it is not evidence that the product is ready today.

## Why this exists

A green build proves that the application can be assembled. It does not prove
that a real visitor can complete an assessment, that records reach D1,
or that a result is truthful. This plan puts those proof types in one place.

The complete requirements remain in [REQUIREMENTS.md](REQUIREMENTS.md). The
technical journey and live diagnostic finding are in
[REQUEST_FLOW.md](REQUEST_FLOW.md).

## Test layers

| Layer | It proves | It does not prove | Evidence |
|---|---|---|---|
| Unit | A deterministic rule: validation, safe fetch, D1 query construction, AI result normalisation, admission control, or UI mapping. | A deployed Worker, DNS, D1, or OpenAI. | Focused Vitest test. |
| Local integration | Application components cooperate at a local boundary, such as a Worker route with fake D1 or a component with a mocked server function. | Cloudflare's deployed configuration or a real third-party service. | Automated test, typecheck, and build. |
| Deployed end-to-end | A real browser uses the public URL, invokes the Worker, and reaches actual D1/provider boundaries. | Inbox reading or facts outside the assessment definition. | Dated run/evidence record, browser observation, and Issue evidence. |
| Human acceptance | The journey is understandable, accessible, visually credible, and worded honestly. | Backend correctness alone. | Chris's documented review. |

No lower layer replaces a higher one. A fake-D1 test is useful, but cannot
prove that the deployed Worker has its D1 binding.

## Safety rules

- Run local checks without secrets or real providers wherever possible.
- A public test needs explicit approval, a bounded use of the provider, and a
  public test domain.
- Never include a Cloudflare token, OpenAI key, email address,
  IP address, or customer record in a test fixture or GitHub comment.
- If an external boundary cannot be exercised, record `blocked` or
  `unobserved`; do not call it passed.

## Release test matrix

| ID | Scenario and expected outcome | Layer | Required evidence | Current status |
|---|---|---|---|---|
| RT-01 | Malformed, credential-bearing, private/local, port-bearing, and unsupported addresses stop before fetch, D1, or AI. | Unit + integration | Domain-admission tests. | Implemented; re-run for release. |
| RT-02 | A valid public domain is consistently normalised and remains visible during checking. | Unit + component | Journey test. | Implemented; re-run for release. |
| RT-03 | Redirect, DNS, content-type, size, timeout, and extraction limits safely stop unsafe retrieval. | Unit + integration | Safe-fetch and website-assessment tests. | Implemented; re-run for release. |
| RT-04 | Duplicate active work, excessive IP starts, and more than two expensive assessments are refused; leases release after success/failure. | Unit + integration | Admission tests, including stale-lease regression. | Implemented; re-run for release. |
| RT-05 | Current-web and model-knowledge evidence remain distinct, dated, and honestly labelled. | Unit + integration | AI adapter/collector tests and fixture review. | Implemented; re-run for release. |
| RT-06 | A completed run creates/reuses the domain customer, stores run/evidence, and returns the matching teaser. | Integration | Repository/coordinator test using fake D1. | Implemented in parts; release run required. |
| RT-07 | A repeat completed domain uses the cached assessment and makes no fresh website/AI call. | Integration + deployed E2E | Cache test plus two authorised public submissions and sanitised run/evidence comparison. | **Unproven.** |
| RT-08 | Turnstile is absent from the MVP 1 browser and server request path. Existing domain, rate, concurrency and safe-fetch controls still apply. | Component + deployed E2E | Source scan, regression test, and live browser observation. | Pending this deployment. |
| RT-09 | Missing runtime configuration or internal early failure says the service is temporarily unavailable, not that website evidence is insufficient. | Component + integration | #48 regression test and result fixture. | Code packet complete locally; promotion/review pending. |
| RT-10 | Rate, capacity, or duplicate admission refusal says try later without website/AI work. | Component + integration | #48 regression test and admission tests. | Code packet complete locally; promotion/review pending. |
| RT-11 | Only genuine safe-fetch/evidence shortfall shows “We couldn't make a fair assessment.” | Component + integration | #48 regression test and limited-outcome fixture. | Code packet complete locally; promotion/review pending. |
| RT-12 | A Green Gecko assessment reaches its truthful result. Completed or limited outcomes have a matching D1 record/reason code. | Deployed E2E | Fresh browser submission, sanitised D1 evidence, Issue comment. | **Unproven.** The prior attempt stopped at the deferred Turnstile gate. |
| RT-13 | The public site loads over HTTPS and works on mobile and desktop without browser-visible secrets. | Deployed E2E + human | Browser review and static/build security check. | Home page deployed; form proof pending. |
| RT-14 | The journey domain → checking → teaser → email confirmation → full result is clear and uses the same state sequence on mobile and desktop. | Component + human | Journey tests, 375px and desktop review, Chris's approval. | Prototype exists; later MVP 1 integration pending. |
| RT-15 | Lint, strict types, complete Vitest suite, production build, and whitespace checks pass with no unaddressed warning/error. | Automated | Dated command output in Issue/ExecPlan. | Re-run after every promoted packet. |
| RT-16 | The deployed Worker contains the reviewed source, rather than a stale generated `.output` artifact. | Release process | A production build immediately before deploy; deploy output records the new generated server-module hashes and Worker version. | Added after the 6 October stale-artifact finding; re-run for release. |

## Current on-page report increment

These criteria govern #57's bounded local implementation. They do not mark the
broader PDF/email MVP release ready and do not replace the RT-series production
requirements above.

| ID | Scenario and expected outcome | Layer | Required evidence | Current status |
| --- | --- | --- | --- | --- |
| IR-01 | The checking UI starts with yellow clocks, advances its explanatory stages, and ends on **Compiling results for you** without claiming a streamed server trace. | Component | Focused journey test. | Passed locally; release proof pending. |
| IR-02 | A completed stored assessment offers local email reveal with **See free report now**, without storing consent or starting delivery. | Component + integration | Journey test with server-function fixture and no delivery invocation. | Passed locally; release proof pending. |
| IR-03 | The on-page report displays domain, evidence-based overview, exactly three ICPs, three persisted questions per ICP, and parsed stored findings. | Integration | Stored-graph repository fixture plus renderer test. | Passed locally; release proof pending. |
| IR-04 | The UI distinguishes website-derived evidence, LLM interpretation, and uncertainty, and never claims an email/PDF was sent. | Component + human | Regression test and copy review. | Passed locally; release proof pending. |

## Release command set

Run from `apps/web` after each promoted packet and before release review:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run types
npm run build
```

Run from the repository root:

```bash
git diff --check
```

Every command must exit successfully. Warnings are not silently accepted; their
source and owner decision must be recorded before release.

### Deployment artifact rule

`wrangler deploy` uploads the generated `.output` bundle. It does **not** run
the application build for us. Therefore, a production deployment must always
run `npm run build` immediately before the deploy command, from the same
working tree. Record the resulting Worker version and generated server-module
hashes in the Issue or ExecPlan. A deployment that did not follow a fresh build
is unobserved, not evidence that a source correction is live.

## Real public test protocol

Only do this after a reviewed deployment and with approval for the bounded
provider cost.

1. In an ordinary browser, open `https://shortlist.successbycs.com`.
2. Submit the agreed public test domain, starting with
   `greengeckogardens.co.nz`.
3. Record the visible outcome. Do not copy a secret, email,
   IP address, or customer data into evidence.
4. Through an authorised operator query, verify the matching D1 outcome: one
   customer/run, correct status/reason code, and appropriate evidence counts.
5. Submit the same domain again after completion. Verify the response is cached
   and does not trigger a fresh provider call or assessment run.
6. Record pass, fail, or the exact blocker in Issue #10. A defect gets a
   focused issue and the truthfulness requirement it affects.

## Release decision

MVP 1 can enter human release review only when every required row is **passed**
or the product owner deliberately changes the approved scope and requirements.
A screenshot, HTTP 200, source review, or a green fake-only test suite does not
replace RT-12 and RT-07.

The final gate is in [MVP1_DEFINITION_OF_DONE.md](MVP1_DEFINITION_OF_DONE.md).
