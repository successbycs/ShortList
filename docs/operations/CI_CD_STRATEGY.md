# CI/CD Strategy

**Status:** active/deferred | **Owner:** release owner | **Update:** CI or release changes.

GitHub Actions builds the development image, performs a locked dependency
install, then calls `scripts/verify.py` for Ruff lint, Ruff formatting, pytest,
and Markdown links. Local container checks call the same entry point after the
locked install. CI does not deploy. CD, cloud deployment, and image publication
are deferred.
