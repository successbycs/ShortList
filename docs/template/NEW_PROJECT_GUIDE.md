# New Project Guide

**Status:** active template | **Owner:** project maintainer | **Update:** bootstrap or delivery-workflow changes.

Use this guide after creating a new repository from a released version of this
template. The template supplies the development harness and optional upstream
Symphony worker coordination. Your new repository owns the business problem,
requirements, architecture, integrations, credentials, deployment, and release
decisions.

## 1. Create and bootstrap the product repository

Create a new repository from a released template tag. Do not develop the
business product in the template repository itself. From the new repository
root, choose its project name, Python package name, and GitHub target:

```bash
python scripts/bootstrap_template.py \
  --project-name my-product \
  --package-name my_product \
  --github-repository OWNER/REPOSITORY
```

Bootstrap changes the bounded template identity, including both:

- `pyproject.toml`, which identifies the target for user-directed Codex Issue
  sessions; and
- `WORKFLOW.md`, which identifies the GitHub queue for upstream Symphony.

Confirm both files name the new `OWNER/REPOSITORY`. Then create or update the
lockfile in the supported environment, run the canonical verification, and
commit the bootstrapped baseline before adding product code.

```bash
uv lock
uv sync --locked --group dev
python scripts/verify.py
git add .
git commit -m "chore: bootstrap product repository"
```

Use Docker/Compose commands from [Getting Started](../../GETTING_STARTED.md)
when that is the supported local environment for the project.

## 2. Define the product before implementation

Ask Codex to help create durable product documents before asking it to build.
For example:

> Help me define the requirements, MVP, architecture, integrations, data and
> security boundaries, and delivery plan for this product. Do not implement
> code yet.

Start with these repository-owned documents. Adapt names when the product needs
a different structure, but keep the information durable and reviewable.

```text
docs/product/requirements.md
docs/product/mvp.md
docs/product/architecture.md
docs/product/delivery-plan.md
```

They should answer:

- Who uses the product and what problem does it solve?
- What is included in the first usable release, and what is explicitly out of
  scope?
- Which user journeys, interfaces, integrations, emails, outputs, data stores,
  and external providers are required?
- Which security, privacy, cost, reliability, and deployment constraints apply?
- What must be true for the product to be accepted?

Commit the approved product documents. They are the durable input to later
Issue planning; chat discussion alone is not the product specification.

## 3. Turn the product plan into milestones and Issues

Ask Codex to propose a dependency-ordered delivery plan from the approved
documents:

> Using `docs/product/`, propose MVP milestones and GitHub Issues. For every
> Issue, state its outcome, non-goals, code scope, dependencies, acceptance
> evidence, exact verification, and the planning artifact needed. Do not
> implement or create Issues until I approve the plan.

After review, create milestones for meaningful product outcomes, such as
“MVP”, “customer onboarding”, or “payments integration”. Create small,
reviewable Issues beneath them. Use GitHub dependencies to record actual order;
do not rely on labels, Issue number, or a chat list as a dependency system.

Each Issue should use the repository's [Feature Issue template](../../.github/ISSUE_TEMPLATE/feature.md)
and answer these questions:

| Field | Why it matters |
| --- | --- |
| Outcome | Defines the user/business result, not merely a code activity. |
| Non-goals | Prevents scope creep and unintended integrations. |
| Code packets | Limits which files or components may change. |
| Dependencies | States work that must be complete first. |
| Acceptance evidence | Defines what a reviewer must be able to observe. |
| Exact verification | Names tests, commands, or real-boundary proof. |

## 4. Use lightweight specification-driven delivery

Choose the smallest planning artifact that makes the work safe and reviewable.
This is the template's lightweight specification-driven delivery approach; it
is not a separate framework and upstream Symphony does not enforce it for you.

| Work type | Required planning evidence |
| --- | --- |
| Small, clear change | Complete GitHub Issue only. |
| Material feature or integration | GitHub Issue plus concise specification: outcome, non-goals, constraints, acceptance scenarios, and verification. |
| Risky, cross-cutting, or multi-session work | GitHub Issue, concise specification, and a living ExecPlan following [.agent/PLANS.md](../../.agent/PLANS.md). |

Examples:

- Correcting one page label is normally an Issue-only change.
- Adding a contact form that sends a transactional email is normally an Issue
  plus concise specification, including provider, consent, failure, and test
  behavior.
- Adding identity, payment, CRM, data retention, and deployment together is
  cross-cutting work that needs an Issue, specification, and ExecPlan.

Read [Development Workflow](../workflows/DEVELOPMENT_WORKFLOW.md) and
[Definition of Done](../harness/DEFINITION_OF_DONE.md) before approving a
material or risky task.

## 5. Choose how an approved Issue is implemented

For every approved Issue, choose one of two execution paths:

1. **User-directed Codex session.** Ask Codex to implement the named Issue. It
   reads the Issue and repository guidance, changes the scoped code, verifies
   it, records evidence, and leaves the result for review.
2. **Deliberately started upstream Symphony worker.** Use this only after the
   Issue is complete enough for automation and you explicitly make it eligible
   with `symphony:ready`. Start Symphony as described in
   [the operator guide](../guides/SYMPHONY_OPERATOR.md). It works in an
   isolated workspace and does not merge, deploy, or approve its own change.

Before a Symphony start, confirm there is only the Issue you intend to run with
`symphony:ready`. Keep the one-worker default until a separately approved
qualification changes it. The foreground baseline stops when its WSL/terminal
process stops; the optional supervised-service design is tracked separately.

## 6. Review, integrate, and release

After Codex or Symphony finishes:

1. Read the Issue evidence and inspect the diff.
2. Run the stated verification, including any real-boundary test you authorized.
3. Decide whether to apply/merge the change and push it.
4. Close the Issue only when its acceptance evidence is accepted.
5. Review milestone scope and dependencies before starting the next Issue.

Codex and Symphony do not receive permission to silently merge, push, deploy,
contact customers, send email, spend money, or approve their own results.
Treat integrations, production credentials, customer data, and external
messages as separate approval boundaries.

## Repeatable prompts

Use these prompts to keep delivery deliberate:

```text
Help me turn docs/product/requirements.md into an MVP scope and architecture.
Do not implement code yet.

Propose dependency-ordered milestones and Issues from docs/product/. Include
outcome, non-goals, code packets, dependencies, acceptance evidence, exact
verification, and the lightweight planning level. Do not create Issues yet.

Implement GitHub Issue #<number>. Follow the Issue, repository guidance, and
the linked specification/ExecPlan. Verify the work and leave an evidence
handoff for human review. Do not push, merge, deploy, or close the Issue.
```

## Boundaries to remember

- The **template repository** maintains reusable tooling and guides.
- The **product repository** contains business requirements, product code,
  provider configuration, and product delivery history.
- **GitHub Issues and milestones** are the durable delivery queue and order.
- **Specifications and ExecPlans** hold the detail required for larger work.
- **Symphony** is an optional, explicitly started worker coordinator; it is not
  the product manager, architecture authority, or deployment system.
