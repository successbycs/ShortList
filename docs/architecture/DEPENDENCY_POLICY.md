# Dependency Policy

**Status:** active template policy
**Responsible role:** dependency owner
**Update when:** a dependency or toolchain policy changes.

Declare Python runtime and development dependencies in `pyproject.toml`; commit
the generated `uv.lock`; install with `uv sync --locked`. Add a dependency
only with a stated need, compatible licence/security review, and focused tests.
Dependencies for an optional capability pack stay outside the default group
unless a recorded template decision promotes the underlying library; installing
a library never enables its runtime service or external integration.

When a dependency or its supported integration is deprecated, migrate to the
supported replacement and update the lockfile. Do not pin an obsolete version
or suppress its warning solely to keep tests passing. If no safe migration is
available, record a tracked exception with the affected version, rationale,
owner, review/expiry date, and the smallest approved temporary mitigation.

## Web package policy

The ShortList web application is in `apps/web`. npm is its supported installer
and `apps/web/package-lock.json` is its authoritative resolved dependency
graph. Run `npm --prefix apps/web ci` for a clean locked install; do not
regenerate the lockfile during verification. The retained `bun.lock` exists
for Lovable/source-history compatibility and is not a second supported CI
installer until a recorded compatibility decision changes this policy.

Use Node 22 and npm 11 as declared by `apps/web/package.json`. Review direct
and transitive advisories with both production and development scope before
adding or upgrading dependencies; a zero production-only audit is not a claim
that development tooling is risk-free. Review licences for new direct
dependencies and record the need, affected packages, tests, and rollback in
the related Issue or ExecPlan.

Upgrade or remove dependencies in small manifest-and-lockfile packets. Do not
mass-upgrade to “latest”, suppress warnings, or remove apparently unused UI
packages without confirming supported design-system use. The temporary
`nitro@3.0.260603-beta` and `rolldown@1.2.1` override are owned by the web
maintainer; review by 2026-11-07 or before a production release, whichever is
earlier. Remove them only after a compatible stable Nitro/Vite resolution
passes web types, lint, tests, and production build. Record an extension with
reason, new date, and exit criteria.

On 2026-10-08, `npm audit` reported three high-severity development-chain
advisories: direct `wrangler` through `miniflare` and `sharp`
(GHSA-wq5f-xc86-pv6w). npm proposed `wrangler@4.15.2` as a semver-major
change from the resolved release. Do not use `npm audit fix --force`; assess
the Wrangler/Nitro compatibility and test a separate upgrade packet before the
2026-11-07 exception review or any production release.
