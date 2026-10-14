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
- Payroll numbers live only in `public.ciclo_unidade_dados` (one JSON payload per cycle+unit, `_consolidado` for company/directorate data, RLS via pode_unidade/admin) and are loaded by `DadosFolhaGate` into the cache in `src/data/ciclos/index.ts` — why: no salary data may ship in the public JS bundle; new cycles are loaded by a server-side upsert, not by adding .ts files.
- Analysis PDFs live in the private `relatorios` storage bucket (`<ciclo>.pdf`) and open through `/relatorio-pdf/$ciclo`, which requests a short-lived signed URL from `src/lib/folha.functions.ts` — why: PDFs must not have public URLs.
- Every favorable/unfavorable reading (color, arrow, label, exports) goes through `classificarDesvio` in `src/lib/leitura-desvio.ts`, fed with "% above budget" — why: a single rule keeps home, units, directorates, reports and exports consistent.
- The read-only `executivo` role gets full read via `e_leitor_total`/`pode_ler_unidade` in RLS and never `'*'` in unidades; writes keep using `pode_unidade` — why: `'*'` would grant write access to reviews.
- Consolidated report titles, reference dates and filename bases are shared through `src/lib/relatorio-consolidado.ts` — why: screen, print and exported covers must use the same cycle and authorship.
- Payroll queries include a reading-schema version and refetch on mount — why: a newly loaded release must not reuse stale financial presentation data.
- Submission deadlines come only from `calcularPrazo`/`prazoVencido` in `src/lib/prazo.ts` (per-cycle `ciclo_config`, fallback 7th business day; overdue only after 23:59 America/Sao_Paulo) — why: home, admin, /planos and guides must agree on deadline/overdue state.
- The CEO view (`/ceo`) reads only existing session-scoped data plus `orcamento_anual`/`indicadores_operacionais` (RLS: e_leitor_total read, admin write); its target lives only in `src/lib/meta-ceo.ts` and accounting-effect marks live on `unit_monthly_review` (directorates use slug `diretoria:<slug>`) — why: one source for the target and no payroll values in the public bundle.
- CEO comparison and plan presentation are shared through `ceo-model` and `ceo-board`; print uses the same calculations with a fixed YTD/directorate/values selection — why: interactive filters must not change the executive PDF or financial totals.
