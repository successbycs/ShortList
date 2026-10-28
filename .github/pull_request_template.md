## Summary

Describe the user-visible outcome and linked Issue/ExecPlan.

- Issue / requirement IDs:
- Tested commit:
- Affected boundary (local, CI, deployment, provider, data):
- Built by: <tool / model>
- Reviewer: <a different model; note a stand-in reviewer here>

## Verification

- [ ] Tests and lint run (include commands/results)
- [ ] Required checks green: `verify` and `web-quality`
- [ ] Documentation and configuration updated where needed
- [ ] Deferred/blocked checks stated honestly

## Acceptance evidence

- [ ] Each changed acceptance criterion has a durable evidence location
- [ ] Local, remote CI, and deployed/provider proof are distinguished

## Risks and follow-up

List remaining assumptions, limits, and any required human authorization.
Deployment and remote D1 migrations are never part of merging; say here if this
change needs Chris to authorise one.
