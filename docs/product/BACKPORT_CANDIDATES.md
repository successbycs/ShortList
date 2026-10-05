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
4. A worker implements the Issue, records observable evidence in GitHub, then
   removes only its own `symphony:ready` label. The Issue remains open for human
   review, but the removed label gives upstream Symphony a tracker-visible stop
   condition so it cannot continue or retry the completed work.
5. A human accepts, changes, or closes the work. Product work that needs owner
   judgement remains human-led rather than being dispatched automatically.

The V1 backport must preserve the two distinct work lanes:

- A user-directed Codex session follows the explicit human request and does
  **not** require an automation label.
- Deliberately started upstream Symphony dispatch requires the upstream
  `symphony:ready` admission label and the repository's readiness checks. A
  chat agreement, Issue comment, or Project item does not make an Issue
  eligible. After a successful worker handoff, that worker removes only this
  label from its own Issue; a human re-applies it only when specific, reviewed
  follow-up work is ready for another run.

This is a repository handoff policy implemented through upstream's normal
label-based routing, not a replacement scheduler or an MCP configuration. It
must be proved first on one explicit, disposable offline Issue before it is
relied upon for product work.

### Codex worker commit capability

The first template proof found that Codex deliberately protects `.git`
recursively in its normal `workspace-write` sandbox. A Symphony worker can
therefore edit and test a cloned workspace but cannot create the local commit
that this handoff requires. There is no supported Git-metadata-only exception.

The template's conditional remedy is an explicitly acknowledged
`danger-full-access` worker policy, used only for a deliberately admitted,
reviewed Issue in its own cloned workspace. The operator must acknowledge this
at every launch; it is never an implicit default. This removes Codex's
filesystem and network boundary for that worker, so issue scope, one-worker
operation, host trust, and no-secret hygiene remain essential. Do not represent
the prompt's no-push/no-deploy/no-broader-GitHub-change rules as enforcement.

#### Proof outcome and reusable operating lessons

The disposable template proof passed on 2026-10-05. With this policy, one
worker made a local commit in its own clone, ran its offline check, added an
Issue evidence comment, and removed only that Issue's `symphony:ready` label.
The Issue stayed open for human review. After stopping and starting Symphony,
the still-open but unlabelled Issue was not dispatched again.

Backport these operational rules together; none is sufficient alone:

1. The worker must make its local commit and write its evidence **before** it
   removes its own admission label. An open Issue without the label is the
   review handoff, not a completed/closed task.
2. The worker removes only `symphony:ready`. It does not push, merge, deploy,
   close the Issue, alter another label, or change Project, assignee,
   dependency, milestone, or status fields.
3. A restart polls GitHub afresh. Any open Issue still carrying the admission
   label is eligible for a new dispatch; preserving a workspace does not create
   a durable scheduler claim. An unlabelled review Issue is therefore the
   required stop condition.
4. The launcher must require two explicit, per-start acknowledgements: the
   upstream preview acknowledgement and a separate full-access acknowledgement.
   Never put either acknowledgement in a profile, service, CI variable, or
   unattended start script.
5. Start only from a committed source checkout. Symphony clones committed
   history into its worker workspace; uncommitted operator files are not part
   of the worker input and must not be mistaken for tested behaviour.
6. Keep one worker until a separate concurrency proof exists. Review each Issue
   for bounded scope, exact code paths, verification, and host trust before
   applying its admission label.

This evidence proves the label-release handoff and restart behaviour only. It
does not make the upstream preview runtime a hardened unattended production
service, permit product deployments, or prove a particular ShortList Issue.

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
