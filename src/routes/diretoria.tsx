import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";

import { SeletorCiclo } from "@/components/seletor-ciclo";
import { useCicloAtivo } from "@/lib/ciclo";
import {
  contasDiretoria,
  diretorias,
  diretoriasComplementares,
  totalDiretorias,
  valores,
  type Periodo,
} from "@/data/diretoria";
import { brl, brlCompacto, pct } from "@/lib/format";

export const Route = createFileRoute("/diretoria")({
  head: () => ({
    meta: [
      { title: "Visão Diretoria — Payroll corporativo | Chlorum Solutions" },
      {
        name: "description",
        content:
          "Payroll dos centros de custo corporativos da Chlorum Solutions por diretoria e por conta contábil, mês e YTD, ciclo Julho/2026.",
      },
      { property: "og:title", content: "Visão Diretoria — Payroll corporativo" },
      {
        property: "og:description",
        content: "Real vs. orçado por diretoria e por conta contábil, mês e acumulado 2026.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VisaoDiretoria,
});

function VisaoDiretoria() {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const total = totalDiretorias(periodo);
  const { CICLO_LABEL } = useCicloAtivo();

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-navy py-10 text-navy-foreground print:hidden">
        <div className="mx-auto max-w-6xl px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-navy-foreground/70"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <p className="eyebrow mt-6">Centros de custo corporativos</p>
          <h1 className="mt-2 text-4xl font-bold">Visão Diretoria</h1>
          <p className="mt-2 text-sm text-navy-foreground/70">
            Chlorum Solutions · Ciclo {CICLO_LABEL}
          </p>
          <div className="mt-4">
            <SeletorCiclo variante="reverse" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="inline-flex rounded-lg border border-border p-1">
            {(
              [
                ["mes", "Mês"],
                ["ytd", "YTD 2026"],
              ] as [Periodo, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setPeriodo(v)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold ${
                  periodo === v ? "bg-brand text-brand-foreground" : "hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi rotulo="Payroll real" valor={brlCompacto(total.real)} />
          <Kpi rotulo="Payroll orçado" valor={brlCompacto(total.orcado)} />
          <Kpi
            rotulo="Desvio"
            valor={`${brlCompacto(total.desvio)} (${pct(total.percentual)})`}
            favoravel={total.desvio <= 0}
          />
          <Kpi
            rotulo="Headcount (real vs. orçado)"
            valor={`${total.hcReal} / ${total.hcOrcado}`}
            detalhe={`Gap ${total.hcDelta > 0 ? "+" : ""}${total.hcDelta}`}
            favoravel={total.hcDelta <= 0}
          />
        </div>

        <h2 className="mt-12 text-xl font-bold">Por diretoria</h2>
        <Tabela
          periodo={periodo}
          linhas={diretorias}
          comHeadcount
          total={{ rotulo: "Total corporativo", ...total }}
        />

        <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Fora do total corporativo
        </h3>
        <Tabela periodo={periodo} linhas={diretoriasComplementares} comHeadcount />

        <h2 className="mt-12 text-xl font-bold">Por conta contábil</h2>
        <Tabela
          periodo={periodo}
          linhas={contasDiretoria.map((c) => ({ ...c, nome: c.conta, hcReal: 0, hcOrcado: 0 }))}
        />
      </section>
    </main>
  );
}

function Kpi({
  rotulo,
  valor,
  detalhe,
  favoravel,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  favoravel?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p
        className={`mt-2 text-xl font-extrabold ${
          favoravel === undefined ? "" : favoravel ? "text-favorable" : "text-unfavorable"
        }`}
      >
        {valor}
      </p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}

type LinhaTabela = {
  nome: string;
  hcReal: number;
  hcOrcado: number;
  realMes: number;
  orcadoMes: number;
  realYtd: number;
  orcadoYtd: number;
};

function Tabela({
  linhas,
  periodo,
  comHeadcount,
  total,
}: {
  linhas: LinhaTabela[];
  periodo: Periodo;
  comHeadcount?: boolean;
  total?: {
    rotulo: string;
    real: number;
    orcado: number;
    desvio: number;
    percentual: number;
    hcReal: number;
    hcOrcado: number;
    hcDelta: number;
  };
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Diretoria / conta</th>
            {comHeadcount ? <th className="px-4 py-3 text-right">HC real</th> : null}
            {comHeadcount ? <th className="px-4 py-3 text-right">HC orçado</th> : null}
            {comHeadcount ? <th className="px-4 py-3 text-right">Gap HC</th> : null}
            <th className="px-4 py-3 text-right">Real</th>
            <th className="px-4 py-3 text-right">Orçado</th>
            <th className="px-4 py-3 text-right">Desvio R$</th>
            <th className="px-4 py-3 text-right">Desvio %</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const v = valores(l, periodo);
            const fav = v.desvio <= 0;
            const gap = l.hcReal - l.hcOrcado;
            return (
              <tr key={l.nome} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{l.nome}</td>
                {comHeadcount ? <td className="px-4 py-3 text-right">{l.hcReal}</td> : null}
                {comHeadcount ? <td className="px-4 py-3 text-right">{l.hcOrcado}</td> : null}
                {comHeadcount ? (
                  <td className={`px-4 py-3 text-right ${gap > 0 ? "text-unfavorable" : ""}`}>
                    {gap > 0 ? "+" : ""}
                    {gap}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right">{brl(v.real)}</td>
                <td className="px-4 py-3 text-right">{brl(v.orcado)}</td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    fav ? "text-favorable" : "text-unfavorable"
                  }`}
                >
                  {brl(v.desvio)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    fav ? "text-favorable" : "text-unfavorable"
                  }`}
                >
                  {pct(v.percentual)}
                </td>
              </tr>
            );
          })}
          {total ? (
            <tr className="border-t-2 border-border bg-muted/40 font-bold">
              <td className="px-4 py-3">{total.rotulo}</td>
              <td className="px-4 py-3 text-right">{total.hcReal}</td>
              <td className="px-4 py-3 text-right">{total.hcOrcado}</td>
              <td className="px-4 py-3 text-right">
                {total.hcDelta > 0 ? "+" : ""}
                {total.hcDelta}
              </td>
              <td className="px-4 py-3 text-right">{brl(total.real)}</td>
              <td className="px-4 py-3 text-right">{brl(total.orcado)}</td>
              <td
                className={`px-4 py-3 text-right ${
                  total.desvio <= 0 ? "text-favorable" : "text-unfavorable"
                }`}
              >
                {brl(total.desvio)}
              </td>
              <td
                className={`px-4 py-3 text-right ${
                  total.desvio <= 0 ? "text-favorable" : "text-unfavorable"
                }`}
              >
                {pct(total.percentual)}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
