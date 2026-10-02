# Development Workflow

**Status:** active template
**Responsible role:** engineering lead
**Update when:** contribution or verification workflow changes.

```mermaid
flowchart LR
  Issue[User-requested Issue] --> Active[One user-started session]
  Active --> Plan[ExecPlan when material]
  Plan --> Change[small implementation]
  Change --> Verify[canonical local verification]
  Verify --> HumanReview[Open Issue: human review]
  HumanReview --> Merge[human-approved merge]
```

Work in small changes, use an ExecPlan for material scope, verify in the
container through `scripts/verify.py`, retain evidence, and use a GitHub pull
request. The Issue execution guidance is canonical in
[GITHUB_ISSUE_WORKFLOW.md](../harness/GITHUB_ISSUE_WORKFLOW.md). No deployment
follows from merge.
