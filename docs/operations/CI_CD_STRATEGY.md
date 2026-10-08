# CI/CD Strategy

**Status:** active CI; deployment remains manual and authorization-gated
**Owner:** release owner
**Update:** CI, release authority, or deployment procedure changes.

GitHub Actions builds the development image, performs a locked dependency
install, then calls `scripts/verify.py` for Ruff lint, Ruff formatting, pytest,
and Markdown links. Local container checks call the same entry point after the
locked install.

CI is source verification only. It does not deploy, publish an image, migrate
data, configure an external provider, or send customer communications. A
passing CI run is necessary evidence where applicable, but it is not release
authority or proof of a deployed public boundary.

ShortList has no automatic continuous-deployment pipeline. An approved manual
deployment follows the ordered gates in the [Release Workflow](../workflows/RELEASE_WORKFLOW.md):
scope and evidence, human review, explicit authorization, target verification,
the narrowly approved deployment, and real-boundary proof. Do not add a CI
deployment step, credential, or provider configuration without an approved
change that updates this document and the release workflow.

## Deferred: CI/CD delivery pipeline

**Status:** planned for a later, separately approved delivery phase; not a
current release prerequisite and not implemented.

A future pipeline may automate the already-approved, non-production source
checks and create a reviewable deployment candidate. It must not turn a merge
or successful CI run into production-release authority. Before implementing
it, define the target environments, protected-branch and review policy,
least-privilege deployment identity, secret custody, migration gate, artifact
provenance, rollback procedure, and required public-boundary verification.

Until those decisions and the resulting implementation are reviewed, ShortList
continues to use the manual, authorization-gated release sequence. The future
pipeline must be recorded as its own GitHub Issue and ExecPlan because it
changes delivery authority and production trust boundaries.
