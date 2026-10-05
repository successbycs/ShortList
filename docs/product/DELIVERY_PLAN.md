# ShortList MVP 1 delivery plan

**Status:** approved planning baseline; implementation and external service
authority remain Issue-specific
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
| Dated AI-model evidence | #9 foundation -> #5 AI-model adapter -> #10 preview | Separate stored current-web and model-knowledge records; current-web question/context/order/citations/date; no-web freshness notice; bounded failure/limit tests. |
| Email, consent, entitlement, private records | #9 -> #11 | Separate consents, three-lifetime rule, duplicate/resend and cross-recipient isolation tests. |
| Professional PDF | #25 visual contract -> #27 report generation/delivery | Versioned accessible PDF passes rubric and private-storage tests. |
| Delivery/retry/escalation | #27 | Provider-acceptance boundary, 5/20/60 retry, terminal and two-hour escalation tests. |
| Privacy/support/failure | #13 after #11/#27 | Public privacy/support/deletion paths, including one privacy-minimised Discord alert for a final `evidence_insufficient` run, and reason-coded operator recovery tests. |
| Website experience | #28 approved mockups -> #10/#11 implementation | Desktop/mobile state coverage, keyboard/accessibility and truthful-content review. |
| End-to-end confidence | #14 -> #15 -> #16 | Requirement acceptance matrix, UAT/launch gate, then controlled learning. |

## 3. Dependency order

```text
#7 contracts (closed) ─┬─ #8 delivery plan
                       ├─ #25 PDF visual/evaluation contract
                       └─ #24 safety/data/access design

#8 + selected Cloudflare Workers + Static Assets foundation ─> #9 product foundation (closed)
#9 (closed) + #24 + #28 visual acceptance (closed) ──> #10 safe domain assessment and teaser
#9 (closed) + #7 (closed) + exact AI configuration ─> #5 AI-search evidence adapter
#10 + #5 ──────────────────────────> #11 email/consent/entitlement
#7 + #25 + #11 ───────────────────> #27 PDF generation/delivery
#11 + #27 ─────────────────────────> #13 privacy/support/recovery
#10 + #11 + #13 + #27 ─────────────> #14 end-to-end verification
#14 ────────────────────────────────> #15 launch readiness -> #16 learning
```

#25 is independent review/design work. #24 is in review and its
approval is an input to #9/#10, not a reason to build unsafe fetching early.

## 4. Implementation packet definitions

| Issue | Code boundary once technology is approved | Required verification | Not authorised by the packet |
| --- | --- | --- | --- |
| #9 Foundation | Adopted `apps/web/` TanStack Start frontend packaged as Cloudflare Workers + Static Assets, local configuration validation, test/preview environment, and an explicit no-service boundary. | Automated config/secret-boundary tests; reproducible local Worker preview; no external credentials required. | A Cloudflare account/project, production deployment, provider account, customer data, AI, database, email, PDF, Discord, or credentials. |
| #5 AI-model evidence | Server-side adapters, normalisation into the two-mode AI-model evidence contract, usage/limit guard, and test-double routes. | Fixture tests for current-web ordered results/citations, model-knowledge freshness notices, malformed/timeout/limit outcomes; separately authorised real-boundary proof only. | A provider credential, charge, or public result wording not approved by Chris. |
| #10 Assessment/preview | Admission gate, safe fetch/extraction, evidence/claim assembly, Auckland-context adapter, teaser UI route. | Safe target/DNS/redirect/untrusted-content/limit tests and pre-email teaser evidence tests. | Email/PDF/payment/customer outreach. |
| #11 Email/entitlement | Recipient/consent/entitlement/re-send service and private request flow. | Consent separation, lifetime count, duplicate and cross-recipient isolation tests. | PDF rendering/delivery provider or marketing send. |
| #27 PDF/delivery | Report renderer, private object boundary, delivery state/retry/escalation adapters. | Template/rubric, private object, temporary/permanent failure, retry and escalation tests; authorised provider test separately. | Stripe, customer login, manual fulfilment, launch. |
| #13 Support/recovery | Public privacy/support/status/deletion-request routes, authorised operator lookup, and idempotent limited-evidence alert adapter. | No-leak status/support/deletion, reason-code visibility, one-alert-per-limited-run, and alert-content minimisation tests. | Full customer dashboard, manual fulfilment, or unapproved retention promise. |
| #14 End-to-end | Acceptance harness and documented observed/unobserved result matrix. | Every MVP1 requirement mapped to reproducible proof or explicit blocker. | Launch/payment/outreach. |

Exact files, framework, endpoint paths, schema migrations, platform bindings,
and test commands are added to each packet after the #9 technology decision.
They must not be guessed in this plan.

## 5. Decisions/gates before build

| Gate | Needed for | Owner |
| --- | --- | --- |
| Cloudflare frontend platform | #9 and all implementation packets | Selected by Chris |
| Record/storage foundation | #9 and all implementation packets | Chris, informed by #8; Workers + Static Assets and the adopted frontend are selected, but records/storage remain open |
| Safe-fetch and abuse thresholds; retention/deletion; suburb source | #9/#10 | Chris, using #24 design |
| Interactive Loveable export and visual approval | #10/#11 | Approved by Chris in closed #28 |
| PDF examples/rubric | #27 | Chris, using #25 |
| GPT-6 Luna web/no-web endpoint configuration, web location, token/timeout/spend cap, public terminology | #5 | Chris |
| Sender/support domain, email provider, alert configuration, real-boundary tests | #27/#13 | Chris |

## 6. Symphony admission

Upstream Symphony requires an open Issue with `symphony:ready`, closed native
dependencies, a concise outcome/non-goals, named code packets, exact
verification, and an accountable human owner. It does not decide any gate in
section 5.

#5 is currently **not** Symphony-admitted: it has no `symphony:ready` label.
Its native dependencies are now closed and its implementation plan exists, but
the exact GPT-6 Luna web/no-web configuration, web location, timeout, spend cap, and public terminology
remain owner decisions. Do not start Symphony while the separate #29
continuation/handoff defect remains unresolved.

## 7. Definition of done for #8

#8 is ready for Chris to close when this map and the implementation Issue
bodies accurately reflect the order above, each execution packet has a clear
boundary and future verification, all open owner gates are visible, and no
Issue claims an unapproved service or deployment. It does not require the
packets to be built.
