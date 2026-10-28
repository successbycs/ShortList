---
name: sdd
description: Specify, plan, resume or validate a material feature using the current repository's workflow, with user outcomes linked to acceptance evidence. Use for SDD and feature delivery planning; do not expand routine questions or small edits into specification projects.
---

# SDD for Chris

Help Chris see what a feature will let him do, how the team will deliver it, and what proves it works. Use the requested stage: specifying, planning, implementing an approved plan, resuming, or validating. A request to plan is not permission to implement.

## Find the existing work

Establish the intended repository and branch before changing anything. Read its AGENTS.md, relevant decisions, owning Issue and latest plan/progress. Verify the actual Git remote before external writes; copied configuration or a folder name alone is not enough. If the intended target remains ambiguous, resolve that ambiguity before writing externally.

Follow current local approval, scope, branch, review and release rules. Do not import another repo's readiness labels or merge conventions. Preserve recorded session approval and unrelated work. When a requirement or approved decision conflicts, expose the conflict; do not silently choose a new design.

Use existing start-issue, investigate or review-pr skills when applicable and available. Otherwise follow the documented local equivalent. This skill does not replace those gates or require another agent on every task.

## Make the outcome testable

Write the user outcome in plain language. Reuse answers already in the request, Issue and records. Ask only unanswered questions that materially change scope, design, authority or acceptance. Continue independent authorised work while a necessary answer is pending. If approval is required, explain the exact rule and the concrete decision needed.

Use the smallest existing home for the work:

- Small change: the scoped Issue and its acceptance check are usually enough.
- Material feature: update or link its owning requirement/specification.
- Risky or multi-session work: use an ExecPlan where the repository requires it.

Do not add a second roadmap, constitution, task list or spec directory merely to use SDD. A small edit stays small even if this skill was invoked explicitly.

Define scope, exclusions, assumptions and the smallest useful complete slice. Distinguish observed facts from hypotheses. Route newly discovered work through local scope rules. Preserve historical decisions when replanning; update the current owning record rather than discarding the evidence.

For an integration, cover the real path: trigger, processing, stored result, what the operator sees, and what they can do next. Include a meaningful failure and recovery check where relevant. A component test cannot prove the full path. For AI work, separate structural/integrity checks, human labels and semantic judgments; scores being delivered do not by themselves prove answer quality.

Link outcomes to evidence in the existing Issue or specification. Use a compact table when useful:

| User outcome | Acceptance check | Evidence with version/environment | State and remaining gap |
| --- | --- | --- | --- |
| What the user can do | Observable test or walkthrough | Durable result link, or not run | Planned, implemented, verified or blocked |

Read [acceptance examples](references/acceptance-examples.md) when integration or website evidence needs clarification. These are illustrations, not product requirements or extra gates for every task.

## Execute and verify within authority

When implementation is authorised, follow the owning plan and keep its progress current. Do not stop at producing more planning documents when the request is to execute. Reuse meaningful repository checks and add verification for the promised behaviour; avoid tests that simply mirror implementation wording.

Record the actual command/action, result, code revision and relevant environment. Keep supporting artifacts with the owning work so another builder can reproduce the conclusion. Do not turn an inspection, mock or old screenshot into a fresh runtime claim.

Separate implementation, tests passing, deployment, remote delivery, human acceptance and publication when those distinctions matter. Never invent a successful result or mark a missing check as passed. If blocked, name the missing evidence, next action and owner; retain useful completed work.

Follow the repo's review and release process. This skill grants no additional permission to spend, send, deploy or change another repo. Skill presence is guidance, not automated enforcement or proof that the process ran.

## Hand over clearly

Lead with what Chris can do now, then its evidence, any material gap and the next action. Link the current Issue, plan and results. Keep the summary understandable without code knowledge or earlier chat. Do not claim human usability approval on Chris's behalf.

For maintenance and reference provenance, see [UPSTREAM.md](UPSTREAM.md).
