# Development Workflow

**Status:** active
**Responsible role:** engineering lead
**Update when:** contribution or verification workflow changes.

```mermaid
flowchart LR
  Issue[GitHub Issue] --> Branch[issue/n branch]
  Branch --> Plan[ExecPlan when material]
  Plan --> Change[small change + tests]
  Change --> Verify[local checks]
  Verify --> PR[pull request]
  PR --> Review[review by a different model]
  Review --> Merge[merge: green checks + approve]
  Merge -. Chris authorises separately .-> Deploy[deploy / D1 migration]
```

Work in small changes, use an ExecPlan when the risk test requires one, run the
local checks for the part you changed (`npm` scripts in `apps/web`,
`scripts/verify.py` at the root; see the [Local Runbook](../operations/LOCAL_RUNBOOK.md)),
retain evidence, and open a GitHub pull request. The review and merge rule is
in [AGENTS.md](../../AGENTS.md#review-and-merge); Issue handling is in
[GITHUB_ISSUE_WORKFLOW.md](../harness/GITHUB_ISSUE_WORKFLOW.md). No deployment
follows from merge: deploying and remote D1 migrations are manual steps Chris
authorises, following the [Release Workflow](RELEASE_WORKFLOW.md).

## Planning evidence by work size

Choose the smallest durable artifact that makes the work reviewable. These are
planning and review conventions, not a custom scheduler policy or a new
framework.

| Work | Required evidence | Example |
| --- | --- | --- |
| Small, clear maintenance | A GitHub Issue with outcome, non-goals, files in scope, acceptance evidence, and exact verification command. No separate specification. | Correcting one documented command and checking its Markdown link. |
| Material feature or integration | The Issue plus a concise specification in `docs/specs/` covering outcome, non-goals, constraints, acceptance scenarios, and verification. | Adding a bounded optional integration with a copied-project configuration path. |
| Risky, cross-cutting, or multi-session work | The concise specification plus a living ExecPlan in `.agent/execplans/` following [.agent/PLANS.md](../../.agent/PLANS.md). | Retiring a runtime, changing an orchestration boundary, or recovering from a host-level incident. |

Use the [Feature Issue template](../../.github/ISSUE_TEMPLATE/feature.md) to
record Issue identity, dependencies, code scope, and evidence. Use
[Definition of Done](../harness/DEFINITION_OF_DONE.md) to decide what real
operational proof is required. The ExecPlan risk test in `.agent/PLANS.md`
governs when the third level is mandatory.
