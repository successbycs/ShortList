# Test Strategy

**Status:** active template | **Owner:** quality owner | **Update:** test layers change.

Use unit tests for deterministic logic, integration tests for local boundaries, and end-to-end tests for user workflows. Each bug receives a focused regression test where practical. Tests use synthetic data and disposable resources.

## Warnings and deprecations

Treat deprecation warnings from this project and from dependencies exercised by
its tests as defects. Do not suppress, ignore, or baseline a warning merely to
obtain a passing test run. Prefer the supported API or dependency migration,
then prove the repair with a focused regression test where practical.

Pytest treats `DeprecationWarning` as an error through `pyproject.toml`; the
canonical verifier must therefore complete without deprecation warnings.
