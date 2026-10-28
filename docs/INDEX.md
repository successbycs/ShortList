# Documentation Index

**Status:** active catalogue (rebuilt 2026-10-28)
**Responsible role:** Chris, as product owner
**Update when:** a document is added, archived or changes what it owns.

ShortList has two parts. The **product** is the website assessment in `apps/web`, a Cloudflare Worker with a D1 database; its docs are in Product, Architecture and Marketing. The **reusable template** is the Python harness at the repo root; its docs are in Harness, Workflows, Template and AI. Start with [README](../README.md) for what ShortList does today, and with [AGENTS.md](../AGENTS.md) for how work is done.

## Who owns which fact

| Fact | Owning document |
| --- | --- |
| Product scope, MVP 1 requirements and status | [product/REQUIREMENTS.md](product/REQUIREMENTS.md) |
| The GEO assessment method | [product/GEO_PROMPT_CONTRACT.md](product/GEO_PROMPT_CONTRACT.md) and [product/prompts/GEO_ASSESSMENT_V1.md](product/prompts/GEO_ASSESSMENT_V1.md) |
| Positioning, audience wording and marketing rules | [marketing/MARKETING_BRAIN.md](marketing/MARKETING_BRAIN.md) |
| How the web app is built, run and deployed | [apps/web/README.md](../apps/web/README.md) and [operations/LOCAL_RUNBOOK.md](operations/LOCAL_RUNBOOK.md) |
| Data model and how the database matches it | [architecture/DATA_MODEL.md](architecture/DATA_MODEL.md) and [architecture/DATA_MODEL_CONFORMANCE.md](architecture/DATA_MODEL_CONFORMANCE.md) |
| Review, merge and release rules | [AGENTS.md](../AGENTS.md#review-and-merge) and [harness/DEFINITION_OF_DONE.md](harness/DEFINITION_OF_DONE.md) |
| Agreed decisions and open questions | [harness/DECISIONS.md](harness/DECISIONS.md) and [harness/OPEN_QUESTIONS.md](harness/OPEN_QUESTIONS.md) |
| Work plans | `.agent/execplans/` (active) and `.agent/execplans/archive/` (finished), per [.agent/PLANS.md](../.agent/PLANS.md) |

## Product (apps/web)

| Area | Documents |
| --- | --- |
| Definition | [PRODUCT_BRIEF](product/PRODUCT_BRIEF.md), [REQUIREMENTS](product/REQUIREMENTS.md), [USER_STORIES](product/USER_STORIES.md), [ASSUMPTIONS](product/ASSUMPTIONS.md), [GLOSSARY](product/GLOSSARY.md), [ROADMAP](product/ROADMAP.md) |
| Design and delivery | [SDD](product/SDD.md), [DELIVERY_PLAN](product/DELIVERY_PLAN.md), [ARCHITECTURE_DECISION](product/ARCHITECTURE_DECISION.md), [REQUEST_FLOW](product/REQUEST_FLOW.md), [CONTRACTS](product/CONTRACTS.md), [SAFE_ASSESSMENT_DESIGN](product/SAFE_ASSESSMENT_DESIGN.md), [SAFE_FETCH_POLICY](product/SAFE_FETCH_POLICY.md) |
| GEO assessment | [GEO_PROMPT_CONTRACT](product/GEO_PROMPT_CONTRACT.md), [GEO_ASSESSMENT_V1 prompt](product/prompts/GEO_ASSESSMENT_V1.md) |
| Release | [MVP1_DEFINITION_OF_DONE](product/MVP1_DEFINITION_OF_DONE.md), [MVP1_RELEASE_TEST_PLAN](product/MVP1_RELEASE_TEST_PLAN.md) |
| Website and visual design | [design README](product/design/README.md), [WEBSITE_EXPERIENCE](product/design/WEBSITE_EXPERIENCE.md), [PDF_VISUAL_ACCEPTANCE](product/design/PDF_VISUAL_ACCEPTANCE.md), [INFORMATION_ARCHITECTURE](product/website/INFORMATION_ARCHITECTURE.md), [PAGE_COPY](product/website/PAGE_COPY.md), [CONTENT_MODEL](product/website/CONTENT_MODEL.md), [SEO_AND_GEO_PLAN](product/website/SEO_AND_GEO_PLAN.md) |
| Historical or source material | [MVP_1_REQUIREMENTS_CANDIDATE](product/MVP_1_REQUIREMENTS_CANDIDATE.md) (decision record), [AI_SEARCH_RUNTIME_CONFIGURATION](product/AI_SEARCH_RUNTIME_CONFIGURATION.md), [feasibility review](product/feasibility/AI_SEARCH_ANALYSIS_CAPABILITY_REVIEW.md), [model matrix](product/feasibility/AI_MODEL_QUALIFICATION_MATRIX.md), [LOVEABLE_BUILD_BRIEF](product/design/LOVEABLE_BUILD_BRIEF.md), [BACKPORT_CANDIDATES](product/BACKPORT_CANDIDATES.md), [discovery sources](product/discovery/README.md) |

## Marketing and go-to-market

[MARKETING_BRAIN](marketing/MARKETING_BRAIN.md), [revenue rhythm](go-to-market/revenue-rhythm.md). Marketing and website-design skills are listed in [harness/DEVELOPMENT_AGENT_CATALOGUE.md](harness/DEVELOPMENT_AGENT_CATALOGUE.md).

## Engineering

| Area | Documents |
| --- | --- |
| Architecture | [ARCHITECTURE](architecture/ARCHITECTURE.md), [DATA_MODEL](architecture/DATA_MODEL.md), [DATA_MODEL_CONFORMANCE](architecture/DATA_MODEL_CONFORMANCE.md), [DATA_CONTRACTS](architecture/DATA_CONTRACTS.md), [INTEGRATIONS](architecture/INTEGRATIONS.md), [CONFIGURATION](architecture/CONFIGURATION.md), [SECURITY_ARCHITECTURE](architecture/SECURITY_ARCHITECTURE.md), [THREAT_MODEL](architecture/THREAT_MODEL.md), [LIFECYCLE_AND_APPROVALS](architecture/LIFECYCLE_AND_APPROVALS.md), [FAILURE_MODES](architecture/FAILURE_MODES.md), [DEPENDENCY_POLICY](architecture/DEPENDENCY_POLICY.md) |
| Quality | [TEST_STRATEGY](quality/TEST_STRATEGY.md), [VERIFICATION_MATRIX](quality/VERIFICATION_MATRIX.md), [ISSUE_ACCEPTANCE_AUDIT](quality/ISSUE_ACCEPTANCE_AUDIT.md), [EVALUATION_STRATEGY](quality/EVALUATION_STRATEGY.md), [REPLAY_TESTING](quality/REPLAY_TESTING.md), [REGRESSION_LOG](quality/REGRESSION_LOG.md), [DEMO_CHECKLIST](quality/DEMO_CHECKLIST.md) |
| Operations | [LOCAL_RUNBOOK](operations/LOCAL_RUNBOOK.md), [CI_CD_STRATEGY](operations/CI_CD_STRATEGY.md), [OBSERVABILITY](operations/OBSERVABILITY.md), [INCIDENT_RESPONSE](operations/INCIDENT_RESPONSE.md), [KILL_SWITCH_AND_RECOVERY](operations/KILL_SWITCH_AND_RECOVERY.md), [BACKUP_RESTORE](operations/BACKUP_RESTORE.md), [DATA_RETENTION](operations/DATA_RETENTION.md), [AUDIT_TRAIL](operations/AUDIT_TRAIL.md), [RESOURCE_BUDGET](operations/RESOURCE_BUDGET.md), [TROUBLESHOOTING](operations/TROUBLESHOOTING.md) |

## Template and harness (kept for reuse)

| Area | Documents |
| --- | --- |
| Governance | [DECISIONS](harness/DECISIONS.md), [OPEN_QUESTIONS](harness/OPEN_QUESTIONS.md), [CODEX_OPERATING_MODEL](harness/CODEX_OPERATING_MODEL.md), [DEVELOPMENT_AGENT_CATALOGUE](harness/DEVELOPMENT_AGENT_CATALOGUE.md), [AUTHORITY_AND_GUARDRAILS](harness/AUTHORITY_AND_GUARDRAILS.md), [DEFINITION_OF_READY](harness/DEFINITION_OF_READY.md), [DEFINITION_OF_DONE](harness/DEFINITION_OF_DONE.md), [GITHUB_ISSUE_WORKFLOW](harness/GITHUB_ISSUE_WORKFLOW.md), [AUTOMATION_CONTRACT](harness/AUTOMATION_CONTRACT.md), [DOCUMENTATION_MAINTENANCE](harness/DOCUMENTATION_MAINTENANCE.md), [SOURCES](harness/SOURCES.md) |
| Workflows | [DEVELOPMENT](workflows/DEVELOPMENT_WORKFLOW.md), [PLANNING](workflows/PLANNING_WORKFLOW.md), [AI_CHANGE](workflows/AI_CHANGE_WORKFLOW.md), [DATA_CHANGE](workflows/DATA_CHANGE_WORKFLOW.md), [RELEASE](workflows/RELEASE_WORKFLOW.md), [INCIDENT](workflows/INCIDENT_WORKFLOW.md), [RECONCILIATION](workflows/RECONCILIATION_WORKFLOW.md) |
| Template | [TEMPLATE_SPECIFICATION](TEMPLATE_SPECIFICATION.md), [NEW_PROJECT_GUIDE](template/NEW_PROJECT_GUIDE.md), [OPTIONAL_PACKS](template/OPTIONAL_PACKS.md), [TEMPLATE_UPGRADES](template/TEMPLATE_UPGRADES.md), [AgentClinic mission example](template/examples/AgentClinic-Mission.md), [AgentClinic technical-stack example](template/examples/AgentClinic-Tech-Stack.md) |
| AI runtime templates | [AI_SYSTEM_DESIGN](ai/AI_SYSTEM_DESIGN.md), [APPLICATION_AGENT_CATALOGUE](ai/APPLICATION_AGENT_CATALOGUE.md), [AGENT_CONTRACTS](ai/AGENT_CONTRACTS.md), [MODEL_POLICY](ai/MODEL_POLICY.md), [PROMPT_REGISTRY](ai/PROMPT_REGISTRY.md), [CONTEXT_POLICY](ai/CONTEXT_POLICY.md), [TOOL_POLICY](ai/TOOL_POLICY.md), [SAFETY_POLICY](ai/SAFETY_POLICY.md), [STRUCTURED_OUTPUTS](ai/STRUCTURED_OUTPUTS.md). These are template defaults; the product's real AI method is the GEO contract above. |

## History

Dated records, kept as they were: [set-up milestone retrospective](retrospectives/2026-10-04-setup-milestone.md), [WSL sandbox incident](operations/WSL_SANDBOX_INCIDENT.md) and its evidence in `operations/evidence/`, and [retired Symphony documents](archive/symphony/README.md). Finished plans are in `.agent/execplans/archive/`, including the [template bootstrap summary](../.agent/execplans/archive/2026-09-29-template-bootstrap-summary.md).
