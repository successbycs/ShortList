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
| Website information, copy, content, and discoverability controls | #34 review -> #29 prototype update and #10 public UI | Approved route/state map, customer-copy boundaries, rendered-content model, and launch-gated SEO/GEO plan. |
| Private records, result access, and durable delivery architecture | #35 decision (closed) -> #10/#11/#27 | Approved D1/R2/Workflows boundary, migrations/test approach, protected active-journey result access, idempotency, and delivery state machine; no configured service is implied. |
| Email, consent, entitlement, and masked-email confirmation | #9 -> #11 | Separate consents, three-lifetime rule, address correction/confirmation, duplicate/resend and cross-recipient isolation tests. |
| On-page full result | #10/#5 evidence -> #11 | A useful teaser and blurred result become a responsive full result only after the visitor confirms their masked email address. |
| Professional PDF | #25 visual contract -> #27 report generation/delivery | Versioned accessible PDF passes rubric and private-storage tests. |
| Delivery/retry/escalation | #27 | Provider-acceptance boundary, 5/20/60 retry, terminal and two-hour escalation tests. |
| Privacy/support/failure | #13 after #11/#27 | Public privacy/support/deletion paths, including one privacy-minimised Discord alert for a final `evidence_insufficient` run, and reason-coded operator recovery tests. |
| Website experience | #28 approved mockups -> #10/#11 implementation | Desktop/mobile state coverage, keyboard/accessibility and truthful-content review. |
| Current on-page assessment report increment | #55 assessment graph -> #57 report journey | Stored website evidence, three ICPs, three questions per ICP, and structured findings render on page after a local email reveal. No PDF/email delivery claim. |
| End-to-end confidence | #14 -> #15 -> #16 | Requirement acceptance matrix, UAT/launch gate, then controlled learning. |

## 3. Dependency order

```text
#7 contracts (closed) ─┬─ #8 delivery plan
                       ├─ #25 PDF visual/evaluation contract
                       └─ #24 safety/data/access design

#8 + selected Cloudflare Workers + Static Assets foundation ─> #9 product foundation (closed)
#34 website controls ───────────────────────────────> #29 static prototype update and #10 public UI
#35 private records/result/delivery architecture (closed) ─> #10 safe assessment and teaser
#35 private records/result/delivery architecture (closed) ─> #11 email/consent/entitlement and on-page result
#35 private records/result/delivery architecture (closed) ─> #27 PDF generation/delivery
#9 (closed) + #7 (closed) + exact AI configuration ─> #5 AI-search evidence adapter
#9 (closed) + #5 + #35 ─────────────────────────────> #10 safe domain assessment and teaser
#10 + #5 + #35 ──────────────────────────────────────> #11 email/consent/entitlement and on-page result confirmation
#55 assessment graph and hardening ───────────────────> #57 on-page assessment report journey
#7 + #25 + #11 + #35 ────────────────────────────────> #27 PDF generation/delivery
#11 + #27 ─────────────────────────> #13 privacy/support/recovery
#10 + #11 + #13 + #27 ─────────────> #14 end-to-end verification
#14 ────────────────────────────────> #15 launch readiness -> #16 learning
```

For the current report increment, #57 depends on #55's persisted assessment
graph and its correctness hardening. #11 remains the owner of real recipient,
consent, entitlement, and delivery capabilities; #27 remains the owner of PDF
generation and delivery. Neither is implemented or implied by #57's local
email-reveal UI.

#25 is closed visual-contract evidence. #24 is closed safety/data design
evidence, but the exact safe-fetch, abuse, suburb-reference, and lifecycle
parameters still require owner decision or explicit parameterisation before #10.

## 4. Implementation packet definitions

| Issue | Code boundary once technology is approved | Required verification | Not authorised by the packet |
| --- | --- | --- | --- |
| #9 Foundation | Adopted `apps/web/` TanStack Start frontend packaged as Cloudflare Workers + Static Assets, local configuration validation, test/preview environment, and an explicit no-service boundary. | Automated config/secret-boundary tests; reproducible local Worker preview; no external credentials required. | A Cloudflare account/project, production deployment, provider account, customer data, AI, database, email, PDF, Discord, or credentials. |
| #5 AI-model evidence | Server-side adapters, normalisation into the two-mode AI-model evidence contract, usage/limit guard, and test-double routes. | Fixture tests for current-web ordered results/citations, model-knowledge freshness notices, malformed/timeout/limit outcomes; separately authorised real-boundary proof only. | A provider credential, charge, or public result wording not approved by Chris. |
| #34 Website controls | Reviewable IA, customer-copy, content-model, and SEO/GEO launch-control documents. | Chris approves or changes the four documents; unresolved public claims remain visibly gated. | Frontend implementation, domain/SEO configuration, public launch, or payment. |
| #35 Architecture decision | Private records, active-journey result access, private PDF objects, and durable delivery orchestration decision. | Chris approves/rejects a coherent selected-or-rejected stack, schema/interface direction, security/retention boundaries, and test approach. | Cloudflare resources, migrations, credentials, email, PDFs, or deployment. |
| #29 Static prototype | Frontend-only apps/web journey states including blur, masked-email confirmation/change, full result, and inert future CTA. | Desktop and 375px review plus focused frontend tests; no network/provider effect. | Persistence, email, PDF delivery, payment, deployment, or runtime admission before template #46 proof. |
| #10 Assessment/preview | Admission gate, safe fetch/extraction, evidence/claim assembly, global market-context adapter, teaser UI route. | Safe target/DNS/redirect/untrusted-content/limit tests and pre-email teaser evidence tests. | Email/PDF/payment/customer outreach. |
| #11 Email/entitlement/result confirmation | Recipient/consent/entitlement service, masked-email confirmation/change flow, private active-journey full-result route, and persisted claim/render linkage. | Consent separation, masked-email correction/confirmation, lifetime count, duplicate and cross-recipient isolation tests. | PDF rendering/delivery provider or marketing send. |
| #27 PDF/delivery | Report renderer, private object boundary, and durable delivery state/retry/escalation adapters. | Template/rubric, private object, temporary/permanent failure, retry and escalation tests; authorised provider test separately. | Stripe, customer login, manual fulfilment, launch. |
| #13 Support/recovery | Public privacy/support/status/deletion-request routes, authorised operator lookup, and idempotent limited-evidence alert adapter. | No-leak status/support/deletion, reason-code visibility, one-alert-per-limited-run, and alert-content minimisation tests. | Full customer dashboard, manual fulfilment, or unapproved retention promise. |
| #14 End-to-end | Acceptance harness and documented observed/unobserved result matrix. | Every MVP1 requirement mapped to reproducible proof or explicit blocker. | Launch/payment/outreach. |

Exact files, endpoint paths, schema migrations, platform bindings, and test
commands are added to each packet after its native dependencies and the #34/#35
owner gates are resolved. They must not be guessed in this plan.

## 5. Decisions/gates before build

| Gate | Needed for | Owner |
| --- | --- | --- |
| Cloudflare frontend platform | #9 and all implementation packets | Selected by Chris |
| Website information, copy, content, and SEO/GEO control | #29 and #10 public UI | Chris, through #34 |
| Record/storage, private result access, and durable delivery foundation | #10/#11/#27 | Approved by Chris through closed #35: D1, private R2, and Workflows. Account/binding/deployment/retention configuration remains open. |
| Safe-fetch and abuse thresholds; retention/deletion; suburb source | #9/#10 | Chris, using #24 design |
| Interactive Loveable export and visual approval | #10/#11 | Approved by Chris in closed #28 |
| PDF examples/rubric | #27 | Chris, using #25 |
| GPT-6 Luna web/no-web endpoint configuration, web location, token/timeout/spend cap, public terminology | #5 | Chris |
| Sender/support domain, email provider, alert configuration, real-boundary tests | #27/#13 | Chris |
| Upstream Symphony label-release/restart proof | Any future deliberate ShortList Symphony admission | Chris, through template #46; no ShortList product Issue is re-admitted before observed proof |

## 6. Symphony admission

Upstream Symphony requires an open Issue with `symphony:ready`, closed native
dependencies, a concise outcome/non-goals, named code packets, exact
verification, and an accountable human owner. It does not decide any gate in
section 5.

#5 is currently **not** Symphony-admitted: it has no `symphony:ready` label.
Its native dependencies are now closed and its implementation plan exists, but
the exact GPT-6 Luna web/no-web configuration, web location, timeout, spend cap, and public terminology
remain owner decisions. Do not start Symphony while the separate #29
continuation/handoff policy proof remains unresolved. #29 is deliberately
label-free pending #34 and template #46.

## 7. Definition of done for #8

#8 is ready for Chris to close when this map and the implementation Issue
bodies accurately reflect the order above, each execution packet has a clear
boundary and future verification, all open owner gates are visible, and no
Issue claims an unapproved service or deployment. It does not require the
packets to be built.
