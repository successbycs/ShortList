# ShortList MVP 1 delivery plan

**Status:** draft for #8 review; no implementation or external service is authorised  
**Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)  
**Design inputs:** [SDD.md](SDD.md), [CONTRACTS.md](CONTRACTS.md), and [SAFE_ASSESSMENT_DESIGN.md](SAFE_ASSESSMENT_DESIGN.md)

## 1. Delivery rule

MVP 1 is delivered as small, evidence-backed packets. A packet may start only
when its native dependencies are closed, its owner decisions are resolved or
explicitly parameterised, its code boundary and verification are stated, and
its external authority is appropriate. A GitHub label is queue admission only;
it does not make unresolved scope safe.

## 2. Feature-to-packet map

| MVP feature | Delivery packets | Completion evidence |
| --- | --- | --- |
| Safe domain entry, site evidence, teaser | #9 foundation -> #10 safe assessment/preview | Valid/unsafe/redirect/DNS/limit tests; evidence-linked teaser before email. |
| Dated AI-search evidence | #9 foundation -> #5 AI-search adapter -> #10 preview | Stored question/context/order/citations/date; bounded failure/limit tests. |
| Email, consent, entitlement, private records | #9 -> #11 | Separate consents, three-lifetime rule, duplicate/resend and cross-recipient isolation tests. |
| Professional PDF | #25 visual contract -> #27 report generation/delivery | Versioned accessible PDF passes rubric and private-storage tests. |
| Delivery/retry/escalation | #27 | Provider-acceptance boundary, 5/20/60 retry, terminal and two-hour escalation tests. |
| Privacy/support/failure | #13 after #11/#27 | Public privacy/support/deletion paths and reason-coded operator recovery tests. |
| Website experience | #28 approved mockups -> #10/#11 implementation | Desktop/mobile state coverage, keyboard/accessibility and truthful-content review. |
| End-to-end confidence | #14 -> #15 -> #16 | Requirement acceptance matrix, UAT/launch gate, then controlled learning. |

## 3. Dependency order

```text
#7 contracts (closed) ─┬─ #8 delivery plan
                       ├─ #25 PDF visual/evaluation contract
                       └─ #24 safety/data/access design

#8 + approved technology decision ─> #9 product foundation
#9 + #24 + approved #28 mockups ──> #10 safe domain assessment and teaser
#9 + #7 + exact AI configuration ─> #5 AI-search evidence adapter
#10 + #5 ──────────────────────────> #11 email/consent/entitlement
#7 + #25 + #11 ───────────────────> #27 PDF generation/delivery
#11 + #27 ─────────────────────────> #13 privacy/support/recovery
#10 + #11 + #13 + #27 ─────────────> #14 end-to-end verification
#14 ────────────────────────────────> #15 launch readiness -> #16 learning
```

#25 and #28 are independent review/design work now. #24 is in review and its
approval is an input to #9/#10, not a reason to build unsafe fetching early.

## 4. Implementation packet definitions

| Issue | Code boundary once technology is approved | Required verification | Not authorised by the packet |
| --- | --- | --- | --- |
| #9 Foundation | Configuration validation, application skeleton, test/preview environment, record/repository interfaces, secret boundary. | Automated config/secret-boundary tests; reproducible local preview; no external credentials required. | Production host, Cloudflare account, provider account, or customer data. |
| #5 AI-search evidence | Server-side adapter, normalisation into `AI-search evidence v1`, usage/limit guard, test-double route. | Fixture tests for ordered results/citations/malformed/timeout/limit outcomes; separately authorised real-boundary proof only. | A provider credential, charge, or public result wording not approved by Chris. |
| #10 Assessment/preview | Admission gate, safe fetch/extraction, evidence/claim assembly, Auckland-context adapter, teaser UI route. | Safe target/DNS/redirect/untrusted-content/limit tests and pre-email teaser evidence tests. | Email/PDF/payment/customer outreach. |
| #11 Email/entitlement | Recipient/consent/entitlement/re-send service and private request flow. | Consent separation, lifetime count, duplicate and cross-recipient isolation tests. | PDF rendering/delivery provider or marketing send. |
| #27 PDF/delivery | Report renderer, private object boundary, delivery state/retry/escalation adapters. | Template/rubric, private object, temporary/permanent failure, retry and escalation tests; authorised provider test separately. | Stripe, customer login, manual fulfilment, launch. |
| #13 Support/recovery | Public privacy/support/status/deletion-request routes and authorised operator lookup. | No-leak status/support/deletion and reason-code visibility tests. | Full customer dashboard or unapproved retention promise. |
| #14 End-to-end | Acceptance harness and documented observed/unobserved result matrix. | Every MVP1 requirement mapped to reproducible proof or explicit blocker. | Launch/payment/outreach. |

Exact files, framework, endpoint paths, schema migrations, platform bindings,
and test commands are added to each packet after the #9 technology decision.
They must not be guessed in this plan.

## 5. Decisions/gates before build

| Gate | Needed for | Owner |
| --- | --- | --- |
| Technology recommendation and foundation choice | #9 and all implementation packets | Chris, informed by #8 |
| Safe-fetch and abuse thresholds; retention/deletion; suburb source | #9/#10 | Chris, using #24 design |
| Exported desktop/mobile mockups and visual approval | #10/#11 | Chris, using #28 |
| PDF examples/rubric | #27 | Chris, using #25 |
| GPT-6 Luna endpoint/tool/location, token/timeout/spend cap, public terminology | #5 | Chris |
| Sender/support domain, email provider, alert configuration, real-boundary tests | #27/#13 | Chris |

## 6. Symphony admission

Upstream Symphony requires an open Issue with `symphony:ready`, closed native
dependencies, a concise outcome/non-goals, named code packets, exact
verification, and an accountable human owner. It does not decide any gate in
section 5.

#5 currently has `symphony:ready` by explicit owner instruction. It is therefore
**queue-admitted but not execution-ready**: #9 is still open, its code packet
is intentionally technology-dependent, and its exact configuration decisions
are open. Do not start a Symphony worker while it remains the only admitted
Issue unless Chris deliberately wants it to attempt the currently incomplete
packet. The safe options are to remove the label until #5 is ready (requires a
new explicit owner instruction) or retain it and keep the worker stopped.

## 7. Definition of done for #8

#8 is ready for Chris to close when this map and the implementation Issue
bodies accurately reflect the order above, each execution packet has a clear
boundary and future verification, all open owner gates are visible, and no
Issue claims an unapproved service or deployment. It does not require the
packets to be built.
