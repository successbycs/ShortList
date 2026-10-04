# Candidate backports to the V1 template

This file records reusable delivery practices discovered while building
ShortList. It is not itself a change to `successbycs/template`. Each item must
be reviewed and deliberately copied into V1 so that product-specific decisions
do not leak into the reusable template.

## Symphony operating model

Backport a short, plain-English explanation of how to use upstream Symphony in
a project created from V1:

1. A human product owner and Codex define the outcome, scope, dependencies, and
   acceptance evidence for a GitHub Issue.
2. Symphony is enabled only for an eligible, bounded engineering Issue. It does
   not decide product strategy, commercial policy, or customer communication.
3. Symphony assigns the Issue to the configured number of Codex workers. Keep
   the upstream default/concurrency configuration unless there is an approved
   reason to change it.
4. A worker implements the Issue, records observable evidence in GitHub, and
   leaves the Issue open for human review.
5. A human accepts, changes, or closes the work. Product work that needs owner
   judgement remains human-led rather than being dispatched automatically.

The V1 backport must preserve the two distinct work lanes:

- A user-directed Codex session follows the explicit human request and does
  **not** require an automation label.
- Deliberately started upstream Symphony dispatch requires the upstream
  `symphony:ready` admission label and the repository's readiness checks. A
  chat agreement, Issue comment, or Project item does not make an Issue
  eligible.

Backport the generic collaborative decision-capture procedure to the template's
GitHub Issue workflow: material agreements update a canonical document and a
labelled Issue comment; chat itself is not durable approval or evidence.

The template copy should also say what Symphony is **not**: it is not the
application runtime, website host, customer-facing service, or an autonomous
product manager. It must not be used to send customer outreach or to make
commercial decisions.

## ShortList-specific exclusions

Do not backport the following into V1: Auckland scope, lawn-mowing cohorts,
ShortList AI-search assessment rules, outbound-email consent policy, product data
models, Loveable design direction, Cloudflare choices, or ShortList report
requirements. Those are application decisions, not reusable template policy.
