# Codex Execution Plans (ExecPlans)

This file is the canonical contract for an ExecPlan in this repository. An ExecPlan is a self-contained, living design-and-execution document that lets a coding agent deliver a demonstrably working change. The reader is assumed to have only the current working tree and this ExecPlan, with no memory of prior chats or plans.

## When and where to use an ExecPlan

Follow this file exactly when authoring or implementing an ExecPlan. Before writing one, read this entire file and inspect the current repository. Create the plan at `.agent/execplans/YYYY-MM-DD-<short-action-name>.md`; use a clear, action-oriented lowercase filename. The file’s Markdown content is the plan itself, so do not wrap the entire file in a fenced code block.

Create an ExecPlan before a complex feature, material refactor, migration, risky configuration change, or multi-session task. A small, isolated change may proceed without one unless the user asks for an ExecPlan. Do not begin implementation when the user asked only for planning.

An ExecPlan is mandatory when any condition in
[`docs/harness/DEFINITION_OF_DONE.md`](../docs/harness/DEFINITION_OF_DONE.md)'s
ExecPlan risk test applies. If the risk is uncertain, create an ExecPlan rather
than treating the work as small.

## Non-negotiable requirements

Every ExecPlan must be fully self-contained in its current form. A novice must be able to understand the objective, relevant repository state, exact edits, commands, decisions, and validation without relying on chat history, unstated context, or external links. Define specialized terms in plain language when first used.

Every ExecPlan is a living document. Update it when progress is made, a discovery changes the approach, a decision is made, validation runs, or work stops. Never ask for “next steps” when an approved ExecPlan provides the next milestone; continue safely within the task’s authorization. Do not infer authority for destructive actions, production access, secret handling, or external side effects.

Plans describe observable results rather than merely code structure. State what a person can do after the change, the exact commands to run from the repository root, what success and expected failures look like, and how to recover safely. Prefer additive, repeatable steps. Include a prototype milestone when it is the safest way to prove an uncertain integration or design.

## Required structure

Use these sections in this order. Narrative sections are prose-first. Only `Progress` uses mandatory checkboxes; tables and long lists are permitted only when they make the plan clearer.

```text
# <Short, action-oriented description>

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Explain why this work matters, what someone can do afterward that they cannot do now, and how they will observe the result.

## Progress

- [ ] (YYYY-MM-DD HH:MMZ) Describe the next granular step.

Record every stopping point. Split partially completed work into completed and remaining steps. Replace the placeholder with real timestamps as work happens.

## Surprises & Discoveries

Record unexpected behavior, risks, performance observations, or useful insights. Each entry has concise evidence such as a command result, test output, or a named file.

- Observation: None yet.
  Evidence: N/A.

## Decision Log

Record all material decisions in this format.

- Decision: <decision>
  Rationale: <why this approach was chosen>
  Date/Author: YYYY-MM-DD / <author>

## Outcomes & Retrospective

At a milestone or completion, summarize what was achieved, what remains, lessons learned, and how the outcome compares to the purpose. Until then, state that it is pending.

## Context and Orientation

Describe the relevant current state for a reader unfamiliar with the repository. Name every important path from the repository root, define non-obvious terms, state assumptions, and explain how the pieces relate. Include all context needed to execute the work; do not say “as discussed” or send the reader to an external article.

## Plan of Work

Describe the planned edits and additions in execution order. For each, name the repository-relative file and the relevant module, function, section, or location; say precisely what will change and why. Group work into independently verifiable milestones. Introduce each milestone with its goal, work, observable result, and proof.

## Concrete Steps

Give exact commands and their working directory. For commands that produce meaningful output, include a short expected transcript. Update this section with commands actually run and their material results.

## Validation and Acceptance

Specify behavior-oriented acceptance criteria. Include appropriate lint, test, build, runtime, and end-to-end checks, with inputs, expected outputs, and how to interpret failures. Explain how to demonstrate internal changes. State test names and expected counts when they are known.

For material work that claims a runnable, user-visible, persistent, deployed,
or external capability, name the claimed operational boundary, the real proof,
its prerequisites and authority, and whether its result is passed, failed,
blocked, or unobserved. Use a compact proof matrix when several capabilities
make it clearer. Follow [Definition of Done](../docs/harness/DEFINITION_OF_DONE.md): supporting imports, mocks, fakes, and synthetic tests do not replace
an available real-boundary proof.

## Idempotence and Recovery

Explain which steps are safe to repeat. For a risky, stateful, or potentially destructive step, specify prerequisites, backups where applicable, retry behavior, and rollback or safe fallback. State any remaining manual action.

## Artifacts and Notes

Keep concise evidence required to resume or review this work: significant command output, useful error text, file-scoped diffs, or short examples. Do not include secrets.

## Interfaces and Dependencies

Name new or changed modules, libraries, services, configuration, types, and public interfaces. For each, identify the exact path and expected signature, field, command, or behavior. Explain dependencies and version/source constraints where relevant.
```

## Plan quality rules

Use full repository-relative paths. State environment assumptions and alternatives. Resolve routine ambiguity in the plan and record the rationale; surface only decisions that need user authority. Never rely on an undefined abbreviation or undocumented policy. Include enough detail to resume from the ExecPlan alone, but avoid incidental implementation detail that does not affect correctness.

Update `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` at every meaningful pause and after validation. Record failed checks honestly. A plan is complete only when its observable acceptance criteria are evidenced, or its remaining gap is explicitly recorded.

## Initiation example

From the repository root, ask:

    Create an ExecPlan for adding a typed configuration loader following .agent/PLANS.md. Save it as .agent/execplans/2026-09-29-typed-config-loader.md. Inspect the repository first and do not implement the work yet.

After review and authorization, ask the coding agent to implement the named ExecPlan and keep it current. The agent must update the same plan rather than create competing plans for the same change.

## Source and adaptation

Adapted on 2026-09-29 from OpenAI’s “Using PLANS.md for multi-hour problem solving” cookbook. The source labels the recipe archived, so this repository adopts the planning structure rather than any model-specific recommendation. Source: https://developers.openai.com/cookbook/articles/codex_exec_plans
