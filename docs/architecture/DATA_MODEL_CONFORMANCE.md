# ShortList data-model conformance matrix

**Status:** active implementation-control record
**Authority:** [logical data model](DATA_MODEL.md)
**Update when:** a migration, repository boundary, service behaviour, or test
changes the model's implementation status.

This matrix answers one question: does the local implementation conform to the
approved logical design? The design remains authoritative. A table, migration,
or TypeScript type is implementation evidence only; a remote database needs
separate observation before it may be described as deployed.

## Current public assessment/GEO boundary

| Logical entity or invariant                                                      | Local implementation evidence                                                                                                              | Service boundary                                    | Required proof                                                                                        | Current status                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Customer has one normalised primary domain; domain is not an access key.         | `customers` in `0001_assessment_core.sql`; `createAssessmentAdmission`.                                                                    | Domain admission and assessment start.              | Duplicate-domain and no-domain-as-access-key tests.                                                   | Implemented locally; remote state unobserved.                                      |
| One dated run belongs to one customer.                                           | `assessment_runs`; `createAssessmentAdmission`, `completeAssessmentRun`.                                                                   | `runLiveAssessment`.                                | New/reused customer and dated-run tests.                                                              | Implemented locally; historic display-timezone compatibility gap remains deferred. |
| Public evidence is bounded and untrusted.                                        | `website_evidence`, `website_sources`, `extracted_website_facts`; safe-fetch/website-assessment modules.                                   | Safe website acquisition.                           | Unsafe target, redirect, size, content and extraction tests.                                          | Implemented locally; retention is deferred.                                        |
| Approved methodology is immutable and reconstructable.                           | `geo_prompt_packages`, versions/templates and immutability triggers in `0006`; GEO repository.                                             | Approved configuration lookup and prompt execution. | Approved-update rejection and version-load tests.                                                     | Implemented locally; remote state unobserved.                                      |
| Each run freezes prompt, model, market, evidence and report configuration.       | `assessment_configuration_snapshots`; `recordAssessmentConfigurationSnapshot`.                                                             | GEO execution bridge.                               | Snapshot repository tests.                                                                            | Implemented locally; runtime atomicity review remains pending.                     |
| Successful GEO result has profile, 3 ICPs, 9 questions, 2 modes and 18 findings. | `business_profiles`, `icp_hypotheses`, `buyer_questions`, `model_evaluations`, `model_question_findings`; GEO runner/execution/repository. | `executeAndPersistGeoAssessment`.                   | Fake-provider persistence/replay tests. Add finalisation/partial-write tests before a new live claim. | Partially implemented locally; Packet A conformance work remains.                  |
| Current-web citations are provider metadata; no-web has no invented citations.   | GEO OpenAI adapter and model-question findings.                                                                                            | Server-only OpenAI provider adapter.                | Provider/runner tests; a real provider proof requires separate authority.                             | Implemented locally with fakes; real boundary unobserved.                          |
| A saved result renders without another AI request.                               | `report_renderings`, result repositories and public route.                                                                                 | Cached result/reveal flow.                          | Cached replay/no-new-AI-call test.                                                                    | Partially implemented locally; report-claim reconciliation deferred.               |
| Generic comparable-business result is legacy only.                               | `ai_evidence` in `0003`; legacy repository/view path.                                                                                      | Historic cached result only.                        | GEO path never reads it for a new assessment.                                                         | Legacy retained.                                                                   |
| Admission controls are separate from identity and retain no raw IP.              | `assessment_admission_leases`, `assessment_concurrency_slots`, `assessment_ip_day_limits`; IP privacy/admission modules.                   | Before costly assessment work.                      | Rate, concurrency, duplicate and digest tests.                                                        | Implemented locally; retention policy deferred.                                    |

`assessment_ip_day_limits_next` is one-off replacement machinery in migration
`0005`, not a logical product entity.

## Deferred private-result and delivery boundary

| Logical entity or invariant                                      | Current position                                                          | Required implementation packet  | Not yet authorised by this matrix                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| Submitted-domain request and domain alias/canonical relationship | Approved design; policy/retention unresolved.                             | Packet A after owner decisions. | New table or migration.                                        |
| Recipient, consent, entitlement and protected journey            | Approved design; no corresponding migration/repository.                   | Packet B.                       | Email storage, session, browser access or real recipient data. |
| Report claim/view-model reconciliation                           | Approved design; `report_renderings` exists but no claim ledger decision. | Packet C.                       | New report-claim implementation.                               |
| Report artefact/private object reference and delivery attempt    | Approved design; no R2/delivery tables/bindings.                          | Packet C.                       | R2 object, PDF, email, provider hand-off.                      |
| Workflow recovery, alerts, retention/deletion execution          | Approved design; no configured runtime.                                   | Packet D.                       | Workflow, email/Discord, deletion or retention enforcement.    |

## Change gate

Before changing a migration, repository type or runtime data handling:

1. confirm the entity, relationship, privacy classification, lifecycle and
   invariant in `DATA_MODEL.md`;
2. add or update this row with the exact implementation/test evidence;
3. add focused local tests and prove the full migration path; and
4. obtain separate authority before a remote migration, deployment or real
   provider/customer-data action.

If an implementation conflicts with the design, record an implementation defect
or a proposed design change. Do not silently alter the model to match code.
