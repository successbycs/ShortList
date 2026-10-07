# Govern the adoption of third-party marketing and website-design skills

This ExecPlan is a living document and must be maintained under
`.agent/PLANS.md`.

## Purpose / Big Picture

ShortList needs clearer, more effective website design and marketing content
without turning generic third-party agent instructions into invisible product
policy. This plan assesses a small, attributable subset of the MIT-licensed
`coreyhaines31/marketingskills` library, designs a ShortList-owned controlled
marketing-context index, records why each skill belongs in this repository,
and—only after Chris approves the selection—imports the selected skills as
reviewable project files.

After the approved implementation, a Codex session working on ShortList's
website copy, customer-facing design brief, SEO/GEO material, structured data,
or measurement design can discover the relevant guidance in the repository.
The skills remain advisory: they cannot override product requirements, design
authority, privacy/security controls, approval boundaries, or the requirement
for an ExecPlan.

Implementation imports only the approved repository-scoped Markdown skill
packages. It does not add a package/plugin, activate analytics, publish
marketing content, create an outbound campaign, or change the deployed
application.

## Progress

- [x] (2026-10-07 00:00Z) Confirmed the ShortList repository already uses
      project-scoped skills at `.codex/skills/<name>/SKILL.md` and documents
      that convention in `docs/harness/SOURCES.md`.
- [x] (2026-10-07 00:00Z) Reviewed the supplied upstream library, its MIT
      licence, its Codex support claim, the requested skill list, and its
      upstream HEAD revision `dda3841f0b294e01e93b1541486beefbfab0915e`.
- [x] (2026-10-07 00:00Z) Created the review task in the configured ShortList
      GitHub repository; no label, project state, assignment, or skill import
      was changed.
- [x] (2026-10-07 00:00Z) Recorded the proposed three-layer operating model:
      short universal instruction in `AGENTS.md`, a ShortList-owned Marketing
      Brain, and targeted specialist skills. Chris requires a design decision
      before any implementation.
- [x] (2026-10-07 00:00Z) Refined the adoption design from a supplied review:
      expanded the candidate waves, made the Marketing Brain a controlled
      context index rather than a second requirements document, and identified
      the possible upstream product-marketing compatibility bridge.
- [x] (2026-10-07 00:00Z) Chris approved the single Marketing Brain at
      `docs/marketing/MARKETING_BRAIN.md`, the short `AGENTS.md` routing rule,
      and the focused first-wave import. No `.agents` bridge is used.
- [x] (2026-10-07 00:00Z) Reviewed the selected source packages at pinned
      revision `dda3841f0b294e01e93b1541486beefbfab0915e`; they are Markdown
      instructions with reference material and no executable files.
- [x] (2026-10-07 00:00Z) Imported the approved nine skills into
      `.codex/skills/`, retained the MIT licence and source notice, and added
      the Marketing Brain plus `AGENTS.md` routing.
- [x] (2026-10-07 00:00Z) Verified the selected inventory, absence of
      executable files and compatibility bridge, relevant routing references,
      and scoped `git diff --check`.

## Surprises & Discoveries

- Observation: The upstream library states that `product-marketing` is shared
  context which its other skills consult first.
  Evidence: The upstream README's "How Skills Work Together" section describes
  it as the foundation for all other skills.

- Observation: The upstream supports Codex and is MIT-licensed, but its
  suggested general-purpose install locations include global or universal
  agent directories that would not, by themselves, create a portable
  ShortList repository record.
  Evidence: The upstream README describes Codex support, an MIT licence, and
  `.agents/skills/` installation; ShortList documents its own repository-scoped
  `.codex/skills/<name>/SKILL.md` convention in `docs/harness/SOURCES.md`.

- Observation: The requested list combines immediate website/design guidance
  with later go-to-market and sales-operation guidance.
  Evidence: Upstream categorises `copywriting`, `copy-editing`, `ai-seo`, and
  `schema` under content/SEO; it categorises `prospecting`, `cold-email`,
  `sales-enablement`, and `revops` under sales and revenue operations.

## Decision Log

- Decision: Treat this as a governed, project-scoped vendor import rather than
  a global Codex-only installation or an opaque plugin installation.
  Rationale: The skills must travel with ShortList, be reviewable in pull
  requests, and remain available to future contributors using this repository.
  Date/Author: 2026-10-07 / Codex recommendation awaiting Chris approval

- Decision: Keep third-party skill instructions out of `AGENTS.md`; add only a
  small pointer there, if required, to the project's skill catalogue and
  selection rules.
  Rationale: `AGENTS.md` governs every task. Marketing guidance should be
  applied when relevant, not silently imposed on database, security, test, or
  deployment work.
  Date/Author: 2026-10-07 / Codex recommendation awaiting Chris approval

- Decision: Recommend two adoption waves rather than all requested skills at
  once.
  Rationale: The first wave directly improves the MVP website. The second wave
  is valuable for later marketing and sales work, but should not introduce
  outbound or revenue-process assumptions before MVP product decisions exist.
  Date/Author: 2026-10-07 / Codex recommendation awaiting Chris approval

- Decision: Design a three-layer marketing operating model before changing
  `AGENTS.md` or importing skills: universal task-routing instruction in
  `AGENTS.md`; ShortList-specific marketing truth in a Marketing Brain; and
  third-party specialist methods only in applicable skill packages.
  Rationale: This gives future agents a reliable entry point without making
  generic marketing instructions apply to unrelated engineering work. It also
  prevents a vendor skill from becoming the authority for ShortList's product
  claims or decisions.
  Date/Author: 2026-10-07 / Chris direction; design approval pending

- Decision: `docs/marketing/MARKETING_BRAIN.md` is the single Marketing Brain:
  a controlled context index and synthesis of approved canonical ShortList
  documents. It must not introduce or override facts, requirements, claims,
  prices, policy, architecture, or privacy rules.
  Rationale: A human-readable marketing context is useful only if it remains
  traceable to the primary documents and does not become an unreviewed second
  product specification. A clearly named document in `docs/marketing/` is
  easier for people to find and avoids a duplicate compatibility bridge.
  Date/Author: 2026-10-07 / Chris-supplied design direction; approval pending

## Outcomes & Retrospective

The agreed three-part model is implemented: `AGENTS.md` routes applicable work
to the single Marketing Brain; the Marketing Brain routes to canonical product
documents and selected specialist skills; and the nine approved vendor skills
are repository-scoped with source and licence provenance. Deferred skills and
all external actions remain out of scope.

## Context and Orientation

ShortList has two existing project skills:

- `.codex/skills/execplan-maintenance/SKILL.md` governs material ExecPlans.
- `.codex/skills/github-issue-session/SKILL.md` governs user-directed GitHub
  Issue sessions.

`AGENTS.md` and `docs/harness/DEVELOPMENT_AGENT_CATALOGUE.md` explain that
skills are advisory instructions, not security controls or authority grants.
`docs/harness/SOURCES.md` establishes the repository-scoped Codex skill layout
as `.codex/skills/<name>/SKILL.md`.

The candidate source is the public `coreyhaines31/marketingskills` repository
at pinned revision `dda3841f0b294e01e93b1541486beefbfab0915e`, reviewed on
2026-10-07. Its MIT licence permits reuse, but ShortList must retain source and
licence provenance and review the actual selected content before copying it.

The proposed sets are:

| Wave | Candidate skills | Why and gate |
| --- | --- | --- |
| Foundation: website and product | `product-marketing`, `customer-research`, `offers`, `pricing`, `site-architecture`, `cro`, `copywriting`, `copy-editing`, `content-strategy`, `seo-audit`, `ai-seo`, `schema`, `image` | Candidate methods for evidence-led website strategy, copy, information architecture, search planning, conversion design and approved visual assets. Chris must approve the exact initial import list; each source file and relative resource requires review at a pinned revision. |
| Deferred: marketing and sales operation | `sales-enablement`, `social`, `prospecting`, `cold-email`, `revops` | Supports a later Marketing Foundation and Sales & Customer Acquisition Engine. It is gated on website release plus an approved outbound/sales-process task. A skill does not authorise sending, posting, enrichment, CRM changes or provider changes. |
| Deferred: measurement and experimentation | `analytics`, `ab-testing` | Supports a future approved measurement plan and experiments. It is gated on privacy, data, provider and measurement decisions. No telemetry activation is part of MVP 1. |

The Foundation row is a candidate catalogue, not an automatic import list. The
initial-import recommendation remains deliberately narrower:
`product-marketing`, `customer-research`, `offers`, `site-architecture`, `cro`,
`copywriting`, `copy-editing`, `ai-seo`, and `schema`. Defer `pricing` until the
paid-assessment work is active; defer `content-strategy` and `seo-audit` until
public acquisition content begins; and defer `image` until a concrete visual
design task needs it. Chris may approve a different subset.

### Proposed Marketing Brain operating model

The following is a candidate design, not an implemented repository rule.

| Layer | Candidate location | Authority and responsibility |
| --- | --- | --- |
| Universal routing | `AGENTS.md` | A short trigger tells Codex to consult the Marketing Brain and applicable project skills only for marketing-relevant work. It continues to point all work to product, architecture, privacy, security and approval controls. |
| ShortList marketing truth | `docs/marketing/MARKETING_BRAIN.md` | Human-owned controlled context index and synthesis: it maps approved canonical facts about product promise, target market/ICP, positioning, approved and prohibited claims, tone, offers, customer journey, evidence rules and privacy boundaries. It does not introduce or override requirements, prices, policies, architecture or assertions. |
| Specialist method | `.codex/skills/<skill-name>/SKILL.md` | Vendor or locally authored methods for a bounded task such as copywriting, AI SEO or schema markup. They supply a method, never authority to publish, send, collect data, or change the product. |

Candidate routing sentence for `AGENTS.md`:

> For work that changes ShortList’s positioning, offer, customer-facing website
> design or copy, SEO/GEO content, schema markup, marketing measurement,
> outreach, or sales material: read `docs/marketing/MARKETING_BRAIN.md` first,
> then use the applicable project skill in `.codex/skills/`. Product
> requirements, approved architecture, privacy controls, and explicit user
> decisions take priority.

This sentence is deliberately not yet added to `AGENTS.md`. It is an approval
candidate. The design decision still needs to establish the exact Marketing
Brain content, owner/update process, and whether outreach/sales work remains
out of scope until the later go-to-market milestone.

The selected upstream `product-marketing` skill expects a context file in a
different conventional location. ShortList deliberately does not adopt that
location: `AGENTS.md` routes relevant work to the single Marketing Brain at
`docs/marketing/MARKETING_BRAIN.md`. Do not create a bridge or duplicate the
context.

## Plan of Work

### Milestone 1 — Confirm the selection and boundaries

Chris reviews the two-wave recommendation. Record either approval, a reduced
list, or a change in the GitHub task and this plan. The decision must answer:

1. whether Wave 1 is the right starting set;
2. whether Wave 2 stays deferred; and
3. whether `analytics` is guidance-only until a separate tracking decision.

Observable result: the repository has one explicit, reviewable list rather
than a blanket instruction to install a large external library.

### Milestone 1A — Design and approve the Marketing Brain

Before changing `AGENTS.md` or importing any specialist skill, create a
decision-ready outline for `docs/marketing/MARKETING_BRAIN.md`. It must answer:

1. Which canonical documents remain authoritative for requirements,
   architecture, customer data/privacy, and release controls.
2. Which marketing facts the Brain may restate: audience, problem, value,
   positioning, message pillars, tone, approved evidence and claims, offer
   boundaries, and customer-journey intent.
3. Which content is expressly excluded: credentials, private customer data,
   analytics configuration, mutable campaign performance, unapproved pricing,
   legal conclusions, and instructions to contact or publish to anyone.
4. Who approves a change and which material changes require an accompanying
   GitHub Issue comment and/or requirements update.
5. The exact `AGENTS.md` trigger language and the skill-selection map, including
   whether prospective outreach and sales skills stay deferred.
6. The exact authority-safe contents and update procedure for the one
   `docs/marketing/MARKETING_BRAIN.md` Marketing Brain.

Compare this three-layer model with the two alternatives:

- all marketing content directly in `AGENTS.md`; and
- a Marketing Brain without specialist skills.

Record why the selected model has been chosen. The decision must be approved
by Chris before an implementation packet adds the document, changes
`AGENTS.md`, or imports a vendor skill.

Observable result: Chris can approve a complete and bounded operating model,
not merely a new file name.

### Milestone 2 — Inspect and pin each selected skill

For each approved candidate, inspect the source `SKILL.md`, references, scripts
and templates at the pinned source revision. Reject or locally document any
instruction that would:

- assume a third-party tool or credential;
- initiate email, social posting, analytics collection, or outreach;
- conflict with ShortList's requirements, architecture, privacy rules, or
  approval boundaries; or
- direct Codex to use hidden chain-of-thought, unreviewed code, or automatic
  external action.

Record the source path, pinned revision, licence, review date, and any local
adaptation in a new `docs/harness/MARKETING_SKILLS.md`. Do not silently alter
upstream instructions; where a local boundary is necessary, record it in the
catalogue or a small ShortList-specific companion note. Retain the upstream MIT
licence text with the reviewed import.

Observable result: a reviewer can identify exactly which upstream material was
adopted and why.

### Milestone 3 — Import only the approved, reviewed content

Copy each approved skill to:

`/.codex/skills/<skill-name>/SKILL.md`

using the project root as the base (for example,
`.codex/skills/copywriting/SKILL.md`). Preserve the skill's metadata and any
required, reviewed relative resources within the same skill directory. Do not
copy upstream plugins, command-line installers, unrelated skills, package
locks, or executable helpers simply because they appear in the source
repository.

Add `docs/harness/MARKETING_SKILLS.md` with:

- the purpose and trigger for every installed skill;
- the upstream repository URL, source path, immutable commit, MIT licence, and
  import/review date;
- the rule that product requirements and approved canonical documents prevail
  where advice conflicts;
- the rule that use of a skill never grants external-action authority; and
- the safe update procedure: inspect a new upstream revision, compare selected
  files, review changes, update provenance, and validate before committing.

Create `docs/marketing/MARKETING_BRAIN.md` only after its contents and
authority boundaries are approved. It is a controlled context index, not an
alternative product brief. It must link to the canonical requirements,
architecture, privacy/security, claims-evidence, delivery and approval
documents rather than copy uncontrolled versions of them.

Update `docs/harness/DEVELOPMENT_AGENT_CATALOGUE.md` with a compact “marketing
and website-design skills” row. After Chris approves its exact wording, add one
short `AGENTS.md` sentence directing relevant work to the Marketing Brain and
applicable skills. Do not direct every ExecPlan to use every marketing skill;
instead, the author selects relevant skills when the change concerns product
positioning, offer, customer-facing copy, visual/website design, SEO/GEO,
schema markup, or analytics design.

Observable result: a new Codex session can find the vendor skills inside the
repository and can understand when they apply.

### Milestone 4 — Verify and hand off

Run a file inventory proving that only the approved names appear under
`.codex/skills/`. Confirm each installed directory contains a readable
`SKILL.md`. Run Markdown formatting/checks available in the repository and
`git diff --check`. Review the final diff for accidental credentials, copied
packages, vendor executables, or claims that skills enforce authority.

Record concise evidence and the selected version in the GitHub task. Leave the
task open for Chris's review. Do not commit, push, install globally, enable a
plugin, or update the upstream source without separate authority.

## Concrete Steps

Run from `/home/chris/ShortList`.

1. Check source and existing repository skill layout:

   ```bash
   git ls-remote https://github.com/coreyhaines31/marketingskills.git HEAD
   find .codex/skills -maxdepth 2 -name SKILL.md -print | sort
   ```

   Expected: the upstream commit is recorded and only existing ShortList skills
   appear before approval.

2. After selection, obtain only the named source paths at the pinned commit.
   Use a temporary directory outside the repository or a sparse checkout; do
   not vendor the full upstream project into ShortList.

3. Inspect every selected `SKILL.md` and resource before copying it. Update
   `docs/harness/MARKETING_SKILLS.md`, the agent catalogue, and this ExecPlan
   with the actual reviewed commit and file inventory.

4. Verify the completed import:

   ```bash
   find .codex/skills -maxdepth 2 -name SKILL.md -print | sort
   git diff --check
   ```

   Expected: precisely the approved skill names are present and no whitespace
   errors are reported.

## Validation and Acceptance

- A GitHub task records the purpose, decision required, source repository, and
  no-import-yet boundary.
- This ExecPlan contains a pinned upstream revision, selection rationale,
  storage model, review controls, and an honest deferred second wave.
- Before import, every selected source file and bundled resource has been
  reviewed for product/repository-policy conflicts.
- After import, each approved skill is under
  `.codex/skills/<name>/SKILL.md`; no unapproved vendor plugin, executable,
  package, global installation, or external integration is added.
- `AGENTS.md` tells future Codex sessions when to use the Marketing Brain and
  relevant skills during applicable design and ExecPlan work, without making
  them mandatory for unrelated technical changes.
- The Marketing Brain is demonstrably a controlled index: its material facts
  link to canonical source documents and it contains no independent product
  commitments, credentials, private customer data, mutable campaign data,
  unapproved price, legal conclusion or external-action instruction.
- Provenance names the upstream URL, immutable revision, source path, licence,
  and review date.
- `git diff --check` passes. Any Markdown checker already supplied by the
  repository also passes, or a missing checker is recorded honestly.

## Idempotence and Recovery

The discovery and source inspection steps are read-only and repeatable. An
import must refuse to overwrite an existing local skill directory without a
human-reviewed comparison. If the upstream revision, licence, or content is
unsuitable, stop before copying files; the current ShortList skills continue to
work unchanged. To revert an approved but unsatisfactory import, remove only
the explicitly imported skill directories and their corresponding catalogue
rows in a reviewed change; do not delete unrelated `.codex/skills` content.

No third-party install command is run globally, and no plugin is activated, so
there is no per-machine state to recover.

## Artifacts and Notes

- Upstream candidate: `https://github.com/coreyhaines31/marketingskills`
- Reviewed upstream revision: `dda3841f0b294e01e93b1541486beefbfab0915e`
- Upstream declared licence: MIT.
- Existing ShortList skill root: `.codex/skills/`.
- No import, package installation, plugin activation, commit, push, or external
  service action has occurred while creating this plan.

## Interfaces and Dependencies

The adopted skills will be Markdown instruction packages with a required
`SKILL.md` file. They depend on the current Codex environment recognising the
repository-scoped `.codex/skills/<name>/SKILL.md` layout; the repository records
this as a documented convention, not an independently enforced capability.

`docs/marketing/MARKETING_BRAIN.md` will be the ShortList-specific controlled
context interface. A short notice under `.codex/skills/` will record source,
revision and licence provenance. `docs/harness/DEVELOPMENT_AGENT_CATALOGUE.md`
will point to the Marketing Brain and skills. `AGENTS.md` remains the broad
operating guide and links to the Marketing Brain for relevant work.

The external dependency is the public upstream repository at the exact pinned
commit above. Any upgrade is a new reviewed vendor update, not an automatic
pull.
