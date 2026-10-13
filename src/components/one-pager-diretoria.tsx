import { ChlorumLogo } from "@/components/chlorum-logo";
import { valores, type LinhaDiretoria } from "@/data/diretoria";
import { brl, pct } from "@/lib/format";
import { classificarDesvio } from "@/lib/leitura-desvio";
import { AUTORIA_CONSOLIDADO, referenciaConsolidado } from "@/lib/relatorio-consolidado";

type Grupo = { real: number; orcado: number; desvioValor: number; desvioPercentual: number; hcReal: number; hcOrcado: number; hcDelta: number };

export function tituloOnePager(ciclo: string) {
  return `Visão por diretoria — Análise de desvios orçamentários de Payroll — ${referenciaConsolidado(ciclo)}`;
}
export function nomeArquivoOnePager(ciclo: string) {
  return `Visao-Diretoria-OnePager-${ciclo}`;
}

/** Linha "Outros / não alocado": diferença entre o total do grupo e a soma das diretorias. */
export function linhaNaoAlocada(diretorias: LinhaDiretoria[], mes: Grupo, ytd: Grupo): LinhaDiretoria | null {
  const s = (f: (d: LinhaDiretoria) => number) => diretorias.reduce((a, d) => a + f(d), 0);
  const l: LinhaDiretoria = {
    slug: "_nao-alocado",
    nome: "Outros / não alocado (unidades operacionais)",
    hcReal: mes.hcReal - s((d) => d.hcReal),
    hcOrcado: mes.hcOrcado - s((d) => d.hcOrcado),
    realMes: mes.real - s((d) => d.realMes),
    orcadoMes: mes.orcado - s((d) => d.orcadoMes),
    realYtd: ytd.real - s((d) => d.realYtd),
    orcadoYtd: ytd.orcado - s((d) => d.orcadoYtd),
  };
  const zero = [l.realMes, l.orcadoMes, l.realYtd, l.orcadoYtd].every((v) => Math.abs(v) < 0.5);
  return zero && l.hcReal === 0 && l.hcOrcado === 0 ? null : l;
}

function Farol({ p }: { p: number }) {
  const c = classificarDesvio(p);
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${c.barra}`} />
      <span className={`font-bold ${c.texto}`}>{c.leitura}</span>
    </span>
  );
}

function Bloco({ rotulo, g }: { rotulo: string; g: Grupo }) {
  const c = classificarDesvio(g.desvioPercentual);
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{rotulo}</p>
        <Farol p={g.desvioPercentual} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div><p className="text-muted-foreground">Orçado</p><p className="font-extrabold tabular-nums">{brl(g.orcado)}</p></div>
        <div><p className="text-muted-foreground">Realizado</p><p className="font-extrabold tabular-nums">{brl(g.real)}</p></div>
        <div><p className="text-muted-foreground">Desvio</p><p className={`font-extrabold tabular-nums ${c.texto}`}>{brl(g.desvioValor)} ({pct(g.desvioPercentual)})</p></div>
      </div>
    </div>
  );
}

export function OnePagerDiretoria({
  ciclo, cicloLabel, diretorias, mes, ytd, autor, geradoEm, prazoTexto,
}: {
  ciclo: string; cicloLabel: string; diretorias: LinhaDiretoria[]; mes: Grupo; ytd: Grupo;
  autor: string; geradoEm: Date; prazoTexto: string;
}) {
  const extra = linhaNaoAlocada(diretorias, mes, ytd);
  const linhas = [...diretorias, ...(extra ? [extra] : [])].sort(
    (a, b) => valores(b, "mes").desvio - valores(a, "mes").desvio,
  );
  const porDesvio = [...diretorias].sort((a, b) => valores(b, "mes").desvio - valores(a, "mes").desvio);
  const piores = porDesvio.filter((d) => valores(d, "mes").desvio > 0).slice(0, 3);
  const melhores = [...porDesvio].reverse().filter((d) => valores(d, "mes").desvio < 0).slice(0, 3);
  const quando = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short",
  }).format(geradoEm);

  return (
    <div className="one-pager mx-auto flex w-full max-w-[281mm] flex-col gap-3 bg-card p-1 text-foreground" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
      <header className="flex items-center justify-between gap-4 rounded-lg bg-navy px-4 py-3 text-navy-foreground">
        <div>
          <p className="text-xl font-extrabold">{AUTORIA_CONSOLIDADO}</p>
          <h1 className="text-sm font-bold">{tituloOnePager(ciclo)}</h1>
        </div>
        <ChlorumLogo className="h-7 w-auto md:h-7" />
      </header>

      <section>
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand">Total Chlorum</p>
        <div className="mt-1 grid grid-cols-[1fr_1fr_auto] gap-2">
          <Bloco rotulo="Mês" g={mes} />
          <Bloco rotulo="Acumulado (YTD)" g={ytd} />
          <div className="rounded-lg border border-border p-3 text-[11px]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Headcount</p>
            <p className="mt-2 font-extrabold tabular-nums">{mes.hcReal} real / {mes.hcOrcado} orçado</p>
            <p className={mes.hcDelta > 0 ? "text-unfavorable" : "text-favorable"}>Gap {mes.hcDelta > 0 ? "+" : ""}{mes.hcDelta}</p>
          </div>
        </div>
      </section>

      <table className="w-full text-[10px] tabular-nums">
        <thead className="bg-muted text-left uppercase text-muted-foreground">
          <tr>
            <th className="px-1.5 py-1">Diretoria</th>
            <th className="px-1.5 py-1 text-right">Orçado mês</th>
            <th className="px-1.5 py-1 text-right">Real mês</th>
            <th className="px-1.5 py-1 text-right">Desvio mês</th>
            <th className="px-1.5 py-1 text-right">Orçado YTD</th>
            <th className="px-1.5 py-1 text-right">Real YTD</th>
            <th className="px-1.5 py-1 text-right">Desvio YTD</th>
            <th className="px-1.5 py-1 text-right">HC r/o</th>
            <th className="px-1.5 py-1">Farol mês</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const m = valores(l, "mes");
            const y = valores(l, "ytd");
            return (
              <tr key={l.slug} className={`border-t border-border ${l.slug === "_nao-alocado" ? "italic" : ""}`}>
                <td className="px-1.5 py-1 font-semibold">{l.nome}</td>
                <td className="px-1.5 py-1 text-right">{brl(m.orcado)}</td>
                <td className="px-1.5 py-1 text-right">{brl(m.real)}</td>
                <td className={`px-1.5 py-1 text-right font-semibold ${classificarDesvio(m.percentual).texto}`}>{brl(m.desvio)} ({pct(m.percentual)})</td>
                <td className="px-1.5 py-1 text-right">{brl(y.orcado)}</td>
                <td className="px-1.5 py-1 text-right">{brl(y.real)}</td>
                <td className={`px-1.5 py-1 text-right font-semibold ${classificarDesvio(y.percentual).texto}`}>{brl(y.desvio)} ({pct(y.percentual)})</td>
                <td className="px-1.5 py-1 text-right">{l.hcReal}/{l.hcOrcado}</td>
                <td className="px-1.5 py-1"><Farol p={m.percentual} /></td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-foreground/40 bg-muted font-extrabold">
            <td className="px-1.5 py-1">Total Chlorum</td>
            <td className="px-1.5 py-1 text-right">{brl(mes.orcado)}</td>
            <td className="px-1.5 py-1 text-right">{brl(mes.real)}</td>
            <td className={`px-1.5 py-1 text-right ${classificarDesvio(mes.desvioPercentual).texto}`}>{brl(mes.desvioValor)} ({pct(mes.desvioPercentual)})</td>
            <td className="px-1.5 py-1 text-right">{brl(ytd.orcado)}</td>
            <td className="px-1.5 py-1 text-right">{brl(ytd.real)}</td>
            <td className={`px-1.5 py-1 text-right ${classificarDesvio(ytd.desvioPercentual).texto}`}>{brl(ytd.desvioValor)} ({pct(ytd.desvioPercentual)})</td>
            <td className="px-1.5 py-1 text-right">{mes.hcReal}/{mes.hcOrcado}</td>
            <td className="px-1.5 py-1"><Farol p={mes.desvioPercentual} /></td>
          </tr>
        </tbody>
      </table>

      <section className="grid grid-cols-2 gap-3 text-[11px]">
        {([["Maiores desvios desfavoráveis (mês)", piores], ["Maiores desvios favoráveis (mês)", melhores]] as const).map(([t, lista]) => (
          <div key={t} className="rounded-lg border border-border p-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t}</p>
            {lista.length === 0 ? <p className="mt-1 text-muted-foreground">Nenhum.</p> : (
              <ol className="mt-1 space-y-0.5">
                {lista.map((d, i) => {
                  const v = valores(d, "mes");
                  return (
                    <li key={d.slug} className="flex justify-between gap-2">
                      <span>{i + 1}. {d.nome}</span>
                      <span className={`font-bold tabular-nums ${classificarDesvio(v.percentual).texto}`}>{brl(v.desvio)} ({pct(v.percentual)})</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-border pt-2 text-[9px] text-muted-foreground">
        <span>Ciclo {cicloLabel}</span>
        <span>Gerado em {quando} (Brasília) por {autor}</span>
        <span>Prazo das justificativas: {prazoTexto}</span>
        <span className="font-bold">Confidencial — uso interno</span>
      </footer>
    </div>
  );
}
