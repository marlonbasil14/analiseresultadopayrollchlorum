import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { CICLO_LABEL, desvioResumo, unidades } from "@/data/payroll";
import { brlCompacto, pct, seta } from "@/lib/format";

export const Route = createFileRoute("/consolidado")({
  head: () => ({
    meta: [
      { title: "Consolidado das 8 unidades — Payroll Intelligence" },
      {
        name: "description",
        content:
          "Ranking das oito unidades por desvio percentual, desvio em R$ e gap de headcount no ciclo Julho/2026.",
      },
      { property: "og:title", content: "Consolidado das 8 unidades — Payroll Intelligence" },
      {
        property: "og:description",
        content: "Ranking por desvio %, desvio R$ e gap de headcount no ciclo Julho/2026.",
      },
    ],
  }),
  component: Consolidado,
});

type Ordenacao = "desvioPct" | "desvioValor" | "gapHC";

function Consolidado() {
  const [ordem, setOrdem] = useState<Ordenacao>("desvioPct");
  const [busca, setBusca] = useState("");

  const linhas = unidades
    .filter((u) => u.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    .slice()
    .sort((a, b) => {
      if (ordem === "desvioValor") return (a.desvioValor ?? 0) - (b.desvioValor ?? 0);
      if (ordem === "gapHC") return Math.abs(b.headcountDelta ?? 0) - Math.abs(a.headcountDelta ?? 0);
      return (desvioResumo(b) ?? -Infinity) - (desvioResumo(a) ?? -Infinity);
    });

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-navy py-10 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-navy-foreground/70">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <p className="eyebrow mt-6">Visão agregada</p>
          <h1 className="mt-2 text-4xl font-bold">Consolidado das 8 unidades</h1>
          <p className="mt-2 text-sm text-navy-foreground/70">Ciclo: {CICLO_LABEL}</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar unidade…"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
          {(
            [
              ["desvioPct", "Maior desvio %"],
              ["desvioValor", "Maior desvio R$"],
              ["gapHC", "Maior gap de headcount"],
            ] as [Ordenacao, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOrdem(key)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                ordem === key ? "border-brand bg-brand/10 text-brand" : "border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Unidade</th>
                <th className="px-4 py-3">Actual</th>
                <th className="px-4 py-3">Forecast</th>
                <th className="px-4 py-3">Desvio R$</th>
                <th className="px-4 py-3">Desvio %</th>
                <th className="px-4 py-3">HC Real / Orç.</th>
                <th className="px-4 py-3">Gap HC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((u) => {
                const d = desvioResumo(u);
                const fav = d !== undefined && d < 0;
                return (
                  <tr key={u.slug} className="hover:bg-accent/50">
                    <td className="px-4 py-3 font-semibold">
                      <Link to="/unidade/$slug" params={{ slug: u.slug }}>
                        {u.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {u.payrollActual !== undefined ? brlCompacto(u.payrollActual) : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {u.payrollForecast !== undefined ? brlCompacto(u.payrollForecast) : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {u.desvioValor !== undefined ? brlCompacto(u.desvioValor) : "—"}
                    </td>
                    <td
                      className={`px-4 py-3 font-bold tabular-nums ${
                        d === undefined ? "" : fav ? "text-favorable" : "text-unfavorable"
                      }`}
                    >
                      {d === undefined ? "—" : `${seta(fav)} ${pct(d)}`}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {`${u.headcountReal} / ${u.headcountOrcado}`}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold tabular-nums text-muted-foreground">
                      {u.headcountDelta > 0 ? "+" : ""}
                      {u.headcountDelta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
