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

## Architecture rules
- User access is managed only through admin server functions in `src/lib/acessos.functions.ts` (service role, admin check via has_role) — why: public signup is disabled and a DB trigger on auth.users rejects accounts without a user_roles row.
- Identity (name/scope) is derived from the session + `user_roles` in `src/lib/identificacao.ts` — why: no self-declared identity; roles live only in the database.
- Onboarding progress (journey steps, welcome, quick-guide state) lives in auth user_metadata.jornada via `src/lib/jornada.ts`, which always reads before writing — why: no extra table, and partial writes would wipe progress.
