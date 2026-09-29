# New Project Guide

**Status:** active template | **Owner:** template maintainer | **Update:** bootstrap changes.

Copy the repository, decide licence/ownership, complete product templates, then
run `scripts/bootstrap_template.py` inside Docker with explicit project,
package, and GitHub repository names. Because bootstrap changes package metadata,
run `uv lock` inside Docker afterward, review/commit the resulting lockfile, and
then run `scripts/verify.py` plus the self-test before adding product code.
Enable optional packs only through a recorded decision. The GitHub Issue target
must not retain `successbycs/template` after a copied project is bootstrapped.
