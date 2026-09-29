---
name: execplan-maintenance
description: Create or update a repository ExecPlan for a material change that needs a self-contained, evidence-backed execution record.
---

# ExecPlan maintenance

Use this skill for a complex feature, significant refactor, migration, or multi-session task in this repository. Read `.agent/PLANS.md` before writing. Create the plan in `.agent/execplans/` using the required date-and-action filename, or update the single existing plan for the same change.

Keep the plan self-contained and current: record actual progress, evidence, decisions, discoveries, acceptance checks, and safe recovery. A plan does not authorize destructive actions, external mutations, deployment, secret handling, or scope expansion.

For small isolated edits, do not create an ExecPlan unless the user asks for one.
