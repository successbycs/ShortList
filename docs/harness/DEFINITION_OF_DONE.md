# Definition of Done

**Status:** template | **Owner:** change owner | **Update:** completion policy changes.

Done means scope implemented, relevant tests/evidence recorded, docs/config
updated, limitations stated, and required review/authorization complete. A
blocked check remains blocked, not passed.

## Operational proof for capability claims

When a task claims a runnable, user-visible, persistent, deployed, or external
capability, and the claimed operational boundary is available within the task's
authority, its acceptance evidence must include a reproducible proof at that
boundary. A real boundary is the actual interface being claimed, such as a
running HTTP endpoint reached through HTTP, an operator-invoked CLI process, a
database reopened after persistence, a running container, or an explicitly
approved provider request.

Synthetic data and disposable environments are permitted. Imports, source
inspection, mocks, fakes, screenshots, client construction, and unit tests can
prove logic, safety, or design, but cannot by themselves prove the claimed
operational capability. If the boundary, prerequisite, or authority is
unavailable, record that specific criterion as blocked or unobserved with the
exact required action; do not mark it passed. This rule does not authorize an
external action, credential access, deployment, or system change. Do not invent
an operational proof for documentation-only, refactor-only, deferred, or
deliberately disabled work.

## Durable verification evidence

Terminal output and chat updates are transient evidence, not completion proof.
Before reporting a task or milestone as verified, record the command, observed
result, date, and remaining limitations in the durable artifact that matches
the work:

- Small, clear task: the GitHub Issue acceptance/evidence section.
- Material feature or integration: its linked `SPEC.md` and GitHub Issue.
- Risky, cross-cutting, or multi-session work: its active ExecPlan and GitHub
  Issue handoff.
- Requirement-level evidence: `docs/quality/VERIFICATION_MATRIX.md` when the
  result proves a template requirement.

Update the durable artifact immediately after each meaningful validation, before
claiming progress in chat. A final Issue comment is a concise handoff summary;
it does not replace the plan or specification evidence.

## ExecPlan risk test

An ExecPlan is mandatory when any of the following applies:

- A change has an irreversible or externally visible effect, including data
  migration, deletion, deployment, authentication, credential handling, or
  changing automation authority.
- It changes a cross-cutting contract: public API, configuration schema,
  security boundary, persistence format, CI/CD, or agent orchestration.
- It spans multiple code packets, repositories, sessions, or requires a
  rollback/retry path.
- It introduces an unfamiliar provider, runtime, integration, or significant
  uncertainty that needs a prototype or decision record.
- It needs coordinated human-review gates or is expected to take more than one
  focused implementation session.

If uncertain, create an ExecPlan. Do not require one for a clearly bounded,
reversible, single-file correction with an exact verification command.
