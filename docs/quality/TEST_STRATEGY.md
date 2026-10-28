# Test Strategy

**Status:** active | **Owner:** quality owner | **Update:** test layers change.

Use unit tests for deterministic logic, integration tests for local boundaries,
and end-to-end tests for user workflows. Each bug receives a focused regression
test where practical. Tests use synthetic data and disposable resources.

Synthetic data does not mean a synthetic boundary. Unit tests may use mocks and
fakes to prove deterministic behavior and failure handling. Integration tests
exercise a real local interface such as a process, HTTP endpoint, database, or
container. When a task claims an operational capability, its acceptance proof
must follow the conditional rule in [Definition of Done](../harness/DEFINITION_OF_DONE.md): exercise the real available boundary, or record the exact
blocker rather than treating a mock as delivery proof.

## Where the tests live

| Part | Tests | Run locally | CI check |
| --- | --- | --- | --- |
| Web app | Vitest files next to the code, `apps/web/src/**/*.test.ts(x)`, run in jsdom with deterministic fakes; the OpenAI provider and D1 are faked, so tests make no network calls | `npm test` in `apps/web` (plus `lint`, `typecheck`, `build`) | `web-quality` |
| D1 migrations | `apps/web/scripts/prove-local-d1-migrations.mjs` applies every migration to a throwaway local database | `node scripts/prove-local-d1-migrations.mjs` in `apps/web` | not in CI |
| Python harness | pytest under `tests/` | `uv run python scripts/verify.py` | `verify` |

A green CI run proves the source, not the live site. Proof of the deployed
assessment journey follows the [MVP 1 release test plan](../product/MVP1_RELEASE_TEST_PLAN.md)
and needs Chris's authorisation, because it uses the real provider.

## Warnings and deprecations

Treat deprecation warnings from this project and from dependencies exercised by
its tests as defects. Do not suppress, ignore, or baseline a warning merely to
obtain a passing test run. Prefer the supported API or dependency migration,
then prove the repair with a focused regression test where practical.

Pytest treats `DeprecationWarning` as an error through `pyproject.toml`; the
canonical verifier must therefore complete without deprecation warnings. The
same applies to web lint and build warnings: do not suppress them without
explicit human approval.
