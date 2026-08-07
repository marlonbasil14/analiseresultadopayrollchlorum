import { CICLO_LABEL, janela, type Unidade } from "@/data/payroll";
import { brl, pct, seta } from "@/lib/format";
import { FLUXO_LABEL } from "@/lib/acesso";

export type ReviewRow = {
  unit_slug: string;
  ciclo: string;
  parecer_diretoria: string | null;
  ofensores_diretoria: unknown;
  acoes_recomendadas_diretoria: unknown;
  justificativa_bp: string | null;
  acoes_recomendadas_bp: unknown;
  plano_de_acao: unknown;
  justificativas: unknown;
  status: string;
  fluxo_status: string;
  autor: string | null;
  autor_email: string | null;
  enviado_em: string | null;
  enviado_por: string | null;
  consolidado_em: string | null;
  consolidado_por: string | null;
  atualizado_em: string;
} | null;

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

const dt = (v: string | null | undefined) => (v ? new Date(v).toLocaleString("pt-BR") : "—");

export function RelatorioUnidade({ unidade, review }: { unidade: Unidade; review: ReviewRow }) {
  const mes = janela(unidade, false);
  const justificativas = arr<{ conta: string; ofensor: string; criticidade?: string; texto: string }>(
    review?.justificativas,
  );
  const ofensores = arr<{ conta: string; resumo: string }>(review?.ofensores_diretoria);
  const acoes = arr<{ acao: string; responsavel: string; prazo: string }>(review?.acoes_recomendadas_bp);
  const plano = arr<{ item: string; responsavel: string; prazo: string; status: string }>(
    review?.plano_de_acao,
  );

  return (
    <article className="break-after-page rounded-xl border border-border bg-card p-6 print:break-after-page print:border-0 print:p-0">
      <header className="border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Relatório padrão de payroll · FP&amp;A
        </p>
        <h2 className="mt-1 text-2xl font-extrabold">{unidade.nome}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Mês de referência {CICLO_LABEL} · gerado em {new Date().toLocaleString("pt-BR")} · autoria{" "}
          {review?.autor ?? "—"} {review?.autor_email ? `(${review.autor_email})` : ""}
        </p>
      </header>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">1. KPIs do mês</h3>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="py-1">Conta</th>
              <th className="py-1 text-right">Actual</th>
              <th className="py-1 text-right">Forecast</th>
              <th className="py-1 text-right">Desvio R$</th>
              <th className="py-1 text-right">Desvio %</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border font-bold">
              <td className="py-1">Payroll total</td>
              <td className="py-1 text-right tabular-nums">{brl(mes.payrollActual)}</td>
              <td className="py-1 text-right tabular-nums">{brl(mes.payrollForecast)}</td>
              <td className="py-1 text-right tabular-nums">{brl(mes.desvioValor)}</td>
              <td className="py-1 text-right tabular-nums">
                {seta(mes.desvioPercentual < 0)} {pct(mes.desvioPercentual)}
              </td>
            </tr>
            {mes.desvioPorConta.map((c) => (
              <tr key={c.conta} className="border-t border-border">
                <td className="py-1">{c.conta}</td>
                <td className="py-1 text-right text-muted-foreground">—</td>
                <td className="py-1 text-right text-muted-foreground">—</td>
                <td className="py-1 text-right tabular-nums">{brl(c.valor)}</td>
                <td className="py-1 text-right tabular-nums">{pct(c.percentual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted-foreground">
          Headcount real {unidade.headcountReal} vs. orçado {unidade.headcountOrcado} (gap{" "}
          {unidade.headcountDelta > 0 ? "+" : ""}
          {unidade.headcountDelta}).
        </p>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">2. Parecer</h3>
        <p className="mt-2 whitespace-pre-line text-sm">
          {review?.justificativa_bp || review?.parecer_diretoria || "Parecer não preenchido."}
        </p>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">3. Ofensores</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {justificativas.length > 0
            ? justificativas.map((j, i) => (
                <li key={i}>
                  <span className="font-semibold">{j.conta}</span> — {j.ofensor || "—"}
                  {j.criticidade ? ` · criticidade ${j.criticidade}` : ""}
                </li>
              ))
            : ofensores.map((o) => (
                <li key={o.conta}>
                  <span className="font-semibold">{o.conta}</span> — {o.resumo}
                </li>
              ))}
          {justificativas.length === 0 && ofensores.length === 0 ? (
            <li className="text-muted-foreground">Sem ofensores registrados.</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">4. Justificativas dos desvios</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {justificativas.map((j, i) => (
            <li key={i}>
              <span className="font-semibold">{j.conta}:</span> {j.texto || "—"}
            </li>
          ))}
          {justificativas.length === 0 ? (
            <li className="text-muted-foreground">Nenhuma justificativa registrada.</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">5. Ações recomendadas</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {acoes.map((a, i) => (
            <li key={i}>
              {a.acao} {a.responsavel ? `· ${a.responsavel}` : ""} {a.prazo ? `· prazo ${a.prazo}` : ""}
            </li>
          ))}
          {acoes.length === 0 ? <li className="text-muted-foreground">Nenhuma ação registrada.</li> : null}
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">6. Plano de ação</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {plano.map((p, i) => (
            <li key={i}>
              {p.item} {p.responsavel ? `· ${p.responsavel}` : ""} {p.prazo ? `· prazo ${p.prazo}` : ""} ·{" "}
              {p.status}
            </li>
          ))}
          {plano.length === 0 ? <li className="text-muted-foreground">Nenhum item registrado.</li> : null}
        </ul>
      </section>

      <footer className="mt-6 border-t border-border pt-3 text-xs text-muted-foreground">
        Situação: {FLUXO_LABEL[review?.fluxo_status ?? "pendente"] ?? "Pendente"} · última edição{" "}
        {dt(review?.atualizado_em)} · enviado por {review?.enviado_por ?? "—"} em {dt(review?.enviado_em)} ·
        consolidado por {review?.consolidado_por ?? "—"} em {dt(review?.consolidado_em)}
      </footer>
    </article>
  );
}
