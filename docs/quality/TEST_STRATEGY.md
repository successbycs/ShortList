# Test Strategy

**Status:** active template | **Owner:** quality owner | **Update:** test layers change.

Use unit tests for deterministic logic, integration tests for local boundaries,
and end-to-end tests for user workflows. Each bug receives a focused regression
test where practical. Tests use synthetic data and disposable resources.

Synthetic data does not mean a synthetic boundary. Unit tests may use mocks and
fakes to prove deterministic behavior and failure handling. Integration tests
exercise a real local interface such as a process, HTTP endpoint, database, or
container. When a task claims an operational capability, its acceptance proof
must follow the conditional rule in [Definition of Done](../harness/DEFINITION_OF_DONE.md): exercise the real available boundary, or record the exact
blocker rather than treating a mock as delivery proof.

## Warnings and deprecations

Treat deprecation warnings from this project and from dependencies exercised by
its tests as defects. Do not suppress, ignore, or baseline a warning merely to
obtain a passing test run. Prefer the supported API or dependency migration,
then prove the repair with a focused regression test where practical.

Pytest treats `DeprecationWarning` as an error through `pyproject.toml`; the
canonical verifier must therefore complete without deprecation warnings.
