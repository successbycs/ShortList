# ShortList

ShortList is a free, self-service website assessment for small businesses,
wherever they are. A visitor enters their public business website. ShortList
reads the site's public pages and uses an AI model to describe the business,
suggest three likely ideal customer profiles (ICPs) and write three questions
each of those buyers might ask. It then shows the result on the page, keeping
website evidence, the model's interpretation and uncertainty clearly apart.

The scope, and the difference between the current increment and the full
MVP 1, are owned by [docs/product/REQUIREMENTS.md](docs/product/REQUIREMENTS.md).

## What the live site does today

<https://shortlist.successbycs.com> shows one page with a single form: enter a
business website and select **Check my website**. The page is labelled as a
prototype. The intended journey is: progress screens, then an email field that
only unlocks the report in the browser, then an on-page report. The email is
not stored or sent.

The live site does **not** capture emails, record consent, create a PDF, send
email or take payment. Those are later work (#11, #27, #12), and no price has
been approved (#40).

A completed assessment on the live site has **not** yet been proven. The
release checks are still open (#51–#54); see the
[MVP 1 release test plan](docs/product/MVP1_RELEASE_TEST_PLAN.md).

## Built locally, not release-proven

The code in [`apps/web`](apps/web/README.md) contains the full assessment:
domain checks, safe website fetch, admission and rate limits, the GEO
assessment chain (business profile, three ICPs, nine buyer questions and
their evaluations), storage in Cloudflare D1 and the on-page report. It passes
its local tests. Each current-increment requirement (INC-01 to INC-05) is
"implemented locally; release proof pending" until the release Issues above
are closed with evidence.

## Where to read more

- [docs/product/REQUIREMENTS.md](docs/product/REQUIREMENTS.md): what
  ShortList must do, what is in the current increment and what is deferred.
- [apps/web/README.md](apps/web/README.md): the web application and how to
  run it locally.
- [AGENTS.md](AGENTS.md): rules for anyone, human or AI, working in this repo.
- [docs/INDEX.md](docs/INDEX.md): the documentation catalogue.

## How work is delivered

Every change starts as a GitHub Issue, is built on its own branch, and is
opened as a pull request. A different AI model from the builder reviews it,
and it is merged once checks pass. Chris authorises every deploy.

## Development tooling

The root Python files (`src/shortlist`, `scripts/verify.py`, `compose.yaml`,
`.devcontainer`) are development tooling and a reusable project template. The
product does not use them. Run the repository checks with
`uv run python scripts/verify.py`; see [GETTING_STARTED.md](GETTING_STARTED.md)
for the harness.
