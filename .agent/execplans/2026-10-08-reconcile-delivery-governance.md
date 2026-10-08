# Establish evidence-backed ShortList delivery governance

This ExecPlan is a living document. Maintain it in accordance with `.agent/PLANS.md`.

## Purpose / Big Picture

Make the repository, product requirements, GitHub Issues, dependencies, CI, and development-agent guidance describe and verify the same ShortList state. A contributor should be able to discover the supported product scope and commands; a pull request should not silently bypass web checks; and every reviewed Issue should have criterion-level evidence or a concrete blocker.

The owner authorised closure of GitHub Issues only when every task and acceptance requirement is complete, documented, and checked. That authority does not convert deferred, superseded, local-only, or operationally unobserved work into passed work. A clean state is an accurate mixture of closed, active, blocked, deferred, and parent Issues—not zero open Issues.

## Progress

- [x] (2026-10-08T05:39:23Z) Inspected local/remote Git baseline; local `main` is five commits ahead of `origin/main`, with three unrelated untracked historical ExecPlans preserved.
- [x] (2026-10-08T05:39:23Z) Astra reviewed the delivery report and remote GitHub state without changing repository or GitHub state.
- [x] (2026-10-08T05:39:23Z) Authored this governing ExecPlan.
- [x] (2026-10-08T06:46:00Z) Added the initial criterion-level Issue ledger, truthful repository/application documentation, npm toolchain policy, bounded development-agent roles, PR evidence template, and an unconditionally emitted web CI workflow.
- [x] (2026-10-08T06:48:00Z) Ran clean npm installation; generated Worker types with a temporary writable Wrangler config path; lint completed with eight existing/generated warnings and zero errors; 113 tests, strict typecheck, production build, and whitespace check passed.
- [x] (2026-10-08T06:48:00Z) Recorded three high-severity development-chain npm advisories as a tracked Wrangler exception; no bulk upgrade was applied.
- [ ] Complete the promised criterion-level mapping for every open Issue; the current ledger is a disposition summary and needs further granularity.
- [x] Reconcile repository/product documentation and dependency governance.
- [x] (2026-10-08T08:22:00Z) Proved `web-quality` remotely: PR #58 passed `verify` and `web-quality`; disposable PR #59 passed `verify` and failed `web-quality` on the deliberate non-zero test command; then closed/deleted the disposable branch without merge.
- [x] (2026-10-08T08:43:00Z) Corrected CI npm-version enforcement: remote `web-quality` installed npm 11.13.0 before `npm ci`, passed all checks, and emitted no engine warning. Main protection now explicitly requires pull requests with zero mandatory approvals and strict `verify`/`web-quality` checks, including administrators.
- [x] (2026-10-08T06:53:32Z) Posted criterion evidence and closed #56. Reconciled #49’s local-source wording and #53’s dependency order; production-bound Issues remain open.
- [x] (2026-10-08T08:30:00Z) Added bounded development-agent roles and received Astra independent review; its blocking findings are being corrected before completion.

## Surprises & Discoveries

- `.github/workflows/ci.yml` verifies only the root Python/Docker harness; it does not run `apps/web` checks.
- Remote `main` is `c919924267fc2b8d3e6977a9ccc0ad74a66848b8`; branch protection and repository rulesets are absent and no pull requests are open.
- A required workflow must emit its gate on every PR. An entirely skipped path-filtered workflow can leave a required check pending.
- `docs/product/REQUIREMENTS.md` already distinguishes the current browser-local report increment from broader consent/PDF delivery. Reconciliation must preserve that decision rather than reopen it.
- #55 still lacks cumulative pricing/spend policy and replay/operational proof; #57 depends on its accepted graph. #50 has a local receiver repair but no post-redeployment diagnostic correlation.
- The checked-in web dependency state includes both `package-lock.json` and `bun.lock`, no `packageManager`, a Nitro prerelease, and a `rolldown` override.
- Local Wrangler type generation writes optional logs beneath the user config path. In the sandbox that path is read-only, so verification uses a disposable `XDG_CONFIG_HOME`; the generated type output is unchanged.
- npm audit reports three high-severity development-chain advisories under Wrangler/Miniflare/Sharp. Its offered change is a major Wrangler transition and needs its own compatibility packet.
- The first remote CI run passed the new `web-quality` gate but failed the legacy Python harness: its bootstrap tests copied the now-bootstrapped ShortList repository while expecting an unbootstrapped `src/app_template` fixture. The test must build its own minimal template fixture.
- The repaired Python tests then exposed a pre-existing Markdown-link verifier limitation: it treated third-party vendored skill references, URI schemes, site-root paths, and documented placeholders as repository files. Validation must still reject missing repository-relative Markdown files.

## Decision Log

1. Retain a ShortList monorepository containing the web product and reusable Python engineering harness. Extracting a repository is a later proposal.
2. Decide one authoritative web installer only after checking Lovable/integration constraints; npm and its lockfile are the initial candidate, not an assumption.
3. Track criterion-level evidence in one owner-reviewed ledger; do not duplicate existing Issue ownership.
4. Apply Issue closure authority only after current remote Issue re-read, criterion audit, readable evidence comment, and verified closed state. Do not change GitHub Project status under this plan.
5. Treat source, local verification, GitHub CI, deployment, and provider behavior as separate acceptance boundaries.
6. Keep dependency upgrades/removals in small, separately tested packets; no bulk “latest” upgrade.
7. Preserve Symphony’s single-worker/human-handoff model. Do not add general autonomous runtime agents, deployment, credential, outreach, or closure automation.

## Context and Orientation

Target repository: `successbycs/ShortList`, corroborated by `pyproject.toml` and `origin` remote. Work from `/home/chris/ShortList`.

`apps/web` is the ShortList web product (React, TanStack Start, TypeScript, Vite, Nitro, Cloudflare Workers/D1). Root Python and Docker content is a reusable harness. Relevant canonical material includes `.agent/PLANS.md`, `docs/harness/{CODEX_OPERATING_MODEL,GITHUB_ISSUE_WORKFLOW,DEFINITION_OF_DONE,DEVELOPMENT_AGENT_CATALOGUE}.md`, `docs/architecture/DEPENDENCY_POLICY.md`, `docs/product/{REQUIREMENTS,SDD,DELIVERY_PLAN,REQUEST_FLOW,MVP1_RELEASE_TEST_PLAN}.md`, `docs/quality/TEST_STRATEGY.md`, and `.github/pull_request_template.md`.

“Criterion-level evidence” records the Issue, exact requirement/ID, canonical source, local implementation, remote inclusion, verification date/result, operational boundary, disposition, and named blocker. A test total alone is not proof.

## Plan of Work

### Milestone 1 — Establish the Issue and repository baseline

Read every open Issue body and current comments, linked plans/specifications, and local/remote commit inclusion. Create `docs/quality/ISSUE_ACCEPTANCE_AUDIT.md` as a durable ledger. Preserve the three pre-existing untracked ExecPlans and determine whether later scoped documentation commits need to include them.

Classify each Issue as complete candidate, partial, blocked, deferred, or parent aggregation. Record supersession separately. Specifically retain #10, #11, #27, #49–#55, #57, and phase-parent exit gates until their independent criteria pass.

### Milestone 2 — Reconcile repository identity and product truth

Update repository introductions and indexes (including `README.md`, `GETTING_STARTED.md`, `docs/INDEX.md`, and applicable `AGENTS.md` sections) so they describe the monorepo and separate harness/product responsibilities. Reconcile `docs/product/SDD.md`, release records, and stale plan narrative with the established distinction among current local report increment, broader consent/recipient/PDF scope, and deployed availability. Never label browser-local email reveal as persisted consent or delivery.

### Milestone 3 — Establish dependency governance

Inspect web manifests, lockfiles, and Lovable constraints. Declare the supported Node/npm or Bun toolchain, engine/version source, authoritative lockfile, clean-install command, audit scope, review cadence, licence review, exception owner/expiry, and warning policy. Document the Nitro prerelease and `rolldown` override with removal criteria. Evaluate TanStack compatibility using package metadata and primary documentation; do not force unrelated packages to equal versions. Make only justified, bounded upgrade/pruning packets.

### Milestone 4 — Add and prove web CI

Add a least-privilege `web-ci` workflow with pinned action revisions, bounded timeout, cancellation of superseded runs, and a stable gate emitted for every pull request. It must run locked installation, Worker type generation, lint, tests, TypeScript, and build from `apps/web` using non-production/synthetic configuration. It must never deploy, call providers, or require production secrets. Retain the separate Python harness workflow.

Expand the PR template with Issue/requirement links, tested commit, affected boundary, and remaining acceptance limits. Prove local commands, a real remote passing Actions run, controlled failing-change behavior on a disposable branch, then configure an appropriate rule/protection requiring the actual check names. Preserve shared history and publish only through an approved scoped branch/PR.

### Milestone 5 — Reconcile Issues and use closure authority correctly

For each candidate, re-read the exact Issue immediately before writing. Update checkboxes only for demonstrated criteria; leave unmet criteria unchecked with next action. Post a concise Markdown evidence comment that distinguishes local from remotely included/deployed proof. Re-read after comment, then close only fully accepted tasks and verify resultant state.

Strong initial candidate: #56, after its approval/provenance/files and contradictory historical “pending” wording are reconciled. Conditional candidates (#48 and #57) require fresh criterion audit. Keep #49/#50/#51/#52/#54/#55 open without their live prerequisites. Keep #53 open until its contradictory dependency statement is explicitly resolved: local verifier work may be planned before diagnosis, but production execution remains downstream of repaired production evidence. Do not close parent Issues merely because children change.

No production calls, deployments, payments, credential work, customer outreach, force-pushes, or GitHub Project-status changes are authorised by this plan.

### Milestone 6 — Add bounded development-agent assistance and handoff

Extend `docs/harness/DEVELOPMENT_AGENT_CATALOGUE.md` with strictly bounded roles for: Issue evidence reconciliation; deterministic GEO contract/evaluation review; PR scope/acceptance review; documentation-drift review; and explicitly invoked release-evidence collection. For each define inputs, authority, artifact, stop conditions, and human reviewer. GEO evaluation uses versioned fixtures for provenance, schema validity, weak evidence, prompt injection, and compatible questions. It must not call providers.

Conduct independent review of documentation, ledger, CI/remote proof, Issue mutations, and remaining dependency graph. Update this plan’s outcomes with real commands, dates, limits, Issue URLs, and next safe work.

## Concrete Steps

Run these baselines from the repository root:

```bash
git status --short --branch
git remote -v
git log -6 --oneline
gh issue list --repo successbycs/ShortList --state open --limit 100 --json number,title,body,url
gh api repos/successbycs/ShortList/branches/main
gh api repos/successbycs/ShortList/rulesets
gh pr list --repo successbycs/ShortList --state open
```

After toolchain selection, run:

```bash
npm --prefix apps/web ci
npm --prefix apps/web run types
npm --prefix apps/web run lint
npm --prefix apps/web test
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
git diff --check
```

For every GitHub mutation: verify the target repository; re-read the Issue; render exact Markdown to a temporary file and use `--body-file`; post the evidence; re-read; close only after every criterion passes; re-read final state; record the URL/time in the ledger. Do not chain unchecked writes. Preserve historical comments, including malformed literal `\n` comments; add a readable corrective summary instead of rewriting history.

## Validation and Acceptance

| Capability | Required proof |
| --- | --- |
| Reproducible web development | Clean locked install and documented checks with selected toolchain |
| Regression protection | Remote passing Actions run and controlled failing-change evidence |
| Required PR gating | Observed ruleset/protection plus actual PR required-check behavior |
| Accurate Issue completion | Every criterion evidenced, checkboxes accurate, readable closure comment, verified state |
| Product truth | README/SDD/requirements/release documents consistently distinguish local increment, broader scope, and deployed state |
| Safe agent assistance | Reviewed role contracts and deterministic fixtures where executable, with production autonomy unchanged |
| Live diagnosis/release | Existing Issue-specific browser/Worker/D1 proof and explicit authority |

Unexercised production capabilities remain blocked or unobserved.

## Idempotence and Recovery

Read operations are repeatable. Preserve Issue body content before edits and re-read immediately before mutation to avoid overwriting concurrent work. Use audit markers/latest-comment checks to avoid duplicate comments. Reopen any erroneous closure with a correction comment and unchecked criteria; never delete evidence. Do not enforce nonexistent checks, rewrite shared/Lovable history, or execute automatic live retries. Revert dependency changes as manifest/lockfile pairs.

## Outcomes & Retrospective

PR #58 is the scoped remote evidence boundary. It has passed `verify` (Ruff, 40 Python tests, and Markdown links) and `web-quality` (locked npm install, Worker types, lint, 113 web tests, typecheck, and build). PR #59 proved regression propagation: its deliberate non-zero test command left `verify` passing and made `web-quality` fail; it was closed without merge and its local/remote branch was deleted. The Python harness repairs were necessary because product-repository tests were copying a bootstrapped repository as an unbootstrapped template, and because Markdown checking traversed generated/dependency/vendor trees.

Astra review found that the passing web CI run used npm 10.9.9 and emitted an engine warning despite the declared npm 11 contract. It also found that required status checks with administrator enforcement do not by themselves prove direct pushes are prevented. Before plan completion, the workflow must install npm 11.13.0 and pass remotely, the branch protection must explicitly require pull requests (with zero approvals if supported for the single-owner workflow), the PR description must remove its untracked ExecPlan link, and the Issue ledger must become fully criterion-level rather than a grouped disposition summary.

The CI/protection corrections are complete and Astra re-approved them at PR #58 head `7b5042c`: run 37751593349 logged npm 11.13.0, passed 113 web tests, and had no engine warning; `verify` also passed. Main now exposes `required_pull_request_reviews` with zero approvals, strict `verify` and `web-quality`, and administrator enforcement. The PR description links only the committed governance ExecPlan. The remaining incomplete plan work is the full per-Issue criterion mapping; it is deliberately not marked complete.

Issue #56 is now closed at https://github.com/successbycs/ShortList/issues/56 after a current-body re-read, remote-commit verification, a criterion-by-criterion comment, and closed-state verification. #49 and #53 have readable reconciliation comments; their operational criteria remain open. No other Issue was closed because its current acceptance boundaries are incomplete, deferred, or unobserved.

## Interfaces and Dependencies

No production schema/service is needed for governance itself. Planned interfaces include web toolchain declaration, CI gate name, repository docs, PR evidence contract, Issue acceptance ledger, dependency exception policy, and development-agent role contracts. GitHub settings depend on repository permissions. Live diagnostics retain existing Cloudflare/D1/provider prerequisites and require separate authority.
