<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## ShortList web app notes

- This is the ShortList product: a Cloudflare Worker (`shortlist-web`) with a
  D1 database (`SHORTLIST_DB`) and a live OpenAI Responses provider. It is no
  longer a front-end-only prototype. See [README.md](README.md) for what is
  built and what is not.
- Follow the repository [AGENTS.md](../../AGENTS.md), including its review and
  merge rule.
- The Worker reads two secrets, `OPENAI_API_KEY` and
  `ASSESSMENT_IP_HASH_SECRET`. Never commit, log or paste their values.
- Schema changes go in a new numbered file in `migrations/`; never edit an
  applied migration. Applying migrations to the remote database and deploying
  the Worker are manual steps Chris authorises each time.
- Tests must not call the real provider or the remote database; use the
  existing fakes.
- Before a PR, run `npm run types`, `npm run lint`, `npm test`,
  `npm run typecheck` and `npm run build` (the `web-quality` CI check).
