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
