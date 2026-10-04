# shortlist

A generic Python-first project template with a local, Docker-based development harness. It contains no product-domain logic, external integrations, or optional services by default.

## Intended workflow

Use [GETTING_STARTED.md](GETTING_STARTED.md) to create the local environment, then run the safe self-test and deterministic no-op demo. Read [docs/INDEX.md](docs/INDEX.md) for the template documentation catalogue and [AGENTS.md](AGENTS.md) for development-agent instructions.

## Using Symphony for ShortList delivery

Symphony is a GitHub-first engineering-work scheduler. It is not the product
manager, website host, customer-facing ShortList service, or an autonomous
decision-maker. The canonical procedure for capturing decisions in GitHub and
for distinguishing user-directed Codex work from upstream Symphony dispatch is
[the GitHub Issue workflow](docs/harness/GITHUB_ISSUE_WORKFLOW.md).

The working loop is:

1. Chris and Codex define and approve the product requirements, decisions, and
   acceptance criteria.
2. Create a small GitHub Issue with one outcome, explicit dependencies, and a
   clear way to verify it.
3. When the Issue is eligible, Symphony may assign it to one configured Codex
   worker for implementation.
4. The worker records evidence in GitHub and leaves the Issue open for human
   review. A person decides whether to accept, change, or close the work.

For ShortList, product-discovery and commercial decisions stay human-led.
Symphony becomes useful after the requirements are approved, for bounded
engineering work such as the self-service website, secure assessment endpoint,
data storage, report delivery, and verification. It should not be used to send
customer outreach or to decide product scope.

See [docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md](docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md)
for the current review-only ShortList MVP candidate.

The reusable parts of this operating model are recorded for later V1-template
review in [docs/product/BACKPORT_CANDIDATES.md](docs/product/BACKPORT_CANDIDATES.md).

## Current implementation status

The Python self-test foundation and local Docker verification are implemented.
Interactive VS Code Dev Container attachment and observed remote GitHub Actions
results still require their respective environments. Cloud deployment, image
publication, runtime AI agents, and optional capability packs are deferred.
