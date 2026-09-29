# Development Workflow

**Status:** active template
**Responsible role:** engineering lead
**Update when:** contribution or verification workflow changes.

```mermaid
flowchart LR
  Issue[Issue or request] --> Plan[ExecPlan when material]
  Plan --> Change[small implementation]
  Change --> Verify[tests, lint, links]
  Verify --> Review[PR review]
  Review --> Merge[human-approved merge]
```

Work in small changes, use an ExecPlan for material scope, verify in the container, retain evidence, and use a GitHub pull request. No deployment follows from merge.
