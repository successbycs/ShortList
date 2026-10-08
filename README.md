# ShortList

ShortList is a monorepository for a local website-assessment product and its
reusable Python-first engineering harness. The product lives in `apps/web`;
root Python and Docker assets provide a deterministic development harness.
Neither local implementation nor a passing build proves a deployed service,
configured provider, or customer delivery.

## Intended workflow

For the harness, use [GETTING_STARTED.md](GETTING_STARTED.md). For the web
application, read [apps/web/README.md](apps/web/README.md) and install with
`npm --prefix apps/web ci`. Read [docs/INDEX.md](docs/INDEX.md) for the
documentation catalogue and [AGENTS.md](AGENTS.md) for development-agent
instructions.

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
4. The worker records evidence in GitHub, removes only its own
   `symphony:ready` label to stop further dispatch, and leaves the Issue open
   for human review. A person decides whether to accept, change, close, or
   deliberately re-queue the work.

For ShortList, product-discovery and commercial decisions stay human-led.
Symphony becomes useful after the requirements are approved, for bounded
engineering work such as the self-service website, secure assessment endpoint,
data storage, report delivery, and email-address confirmation. It should not be used to send
customer outreach or to decide product scope.

See [docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md](docs/product/MVP_1_REQUIREMENTS_CANDIDATE.md)
for the current review-only ShortList MVP candidate.

The reusable parts of this operating model are recorded for later V1-template
review in [docs/product/BACKPORT_CANDIDATES.md](docs/product/BACKPORT_CANDIDATES.md).

## Current implementation status

The Python self-test foundation and the local web assessment/report increment
are implemented. The web increment provides bounded local server/runtime
logic, deterministic fixtures, and an on-page report reveal; it does not imply
configured production providers, recipient persistence, consent capture, PDF
or email delivery, payment, or deployment. See
[product requirements](docs/product/REQUIREMENTS.md) and the
[MVP 1 release test plan](docs/product/MVP1_RELEASE_TEST_PLAN.md) for the
separate local and deployed evidence boundaries.
