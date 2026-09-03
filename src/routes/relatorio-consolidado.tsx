import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { RelatorioUnidade, type ReviewRow } from "@/components/relatorio-unidade";
import { useCicloAtivo } from "@/lib/ciclo";
import { supabase } from "@/integrations/supabase/client";
import { brl, pct } from "@/lib/format";
import { BotoesExportar } from "@/components/botoes-exportar";

export const Route = createFileRoute("/relatorio-consolidado")({
  component: ConsolidadoPage,
  head: () => ({
    meta: [
      { title: "Relatório consolidado de payroll · Chlorum Solutions" },
      {
        name: "description",
        content:
          "Consolidado das 8 unidades: desvio total da Chlorum, ranking por criticidade e o relatório padrão de cada unidade.",
      },
      { property: "og:title", content: "Relatório consolidado de payroll · Chlorum Solutions" },
      {
        property: "og:description",
        content: "Documento único com as 8 unidades para envio ao FP&A no 7º dia útil.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ConsolidadoPage() {
  const { ciclo, CICLO_LABEL, dados } = useCicloAtivo();
  const unidadesOrdenadas = dados.unidadesOrdenadas;

  const { data } = useQuery({
    queryKey: ["reviews", ciclo],
    queryFn: async () => {
      const { data } = await supabase.from("unit_monthly_review").select("*").eq("ciclo", ciclo);
      return (data ?? []) as NonNullable<ReviewRow>[];
    },
  });


  const totalActual = unidadesOrdenadas.reduce((s, u) => s + u.payrollActual, 0);
  const totalForecast = unidadesOrdenadas.reduce((s, u) => s + u.payrollForecast, 0);
  const desvio = totalActual - totalForecast;
  const desvioPct = (desvio / totalForecast) * 100;
  const ranking = [...unidadesOrdenadas].sort((a, b) => b.desvioPercentual - a.desvioPercentual);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <ChlorumLogo className="h-8 w-auto" />
        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Painel admin
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>
      <div className="mt-4 print:hidden">
        <BotoesExportar
          compacto
          pacote={unidadesOrdenadas.map((u) => ({
            unidade: u,
            review: data?.find((r) => r.unit_slug === u.slug) ?? null,
          }))}
          nomeBase="Relatorio-Consolidado-Payroll"
          titulo="Relatório Consolidado de Payroll — Chlorum"
        />
      </div>

      <section className="mt-6 break-after-page rounded-xl border border-border bg-card p-6 print:break-after-page">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Relatório consolidado · FP&amp;A
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">Payroll Chlorum — {CICLO_LABEL}</h1>
        <p className="mt-4 text-sm">
          Actual {brl(totalActual)} vs. Forecast {brl(totalForecast)} — desvio de {brl(desvio)} (
          {pct(desvioPct)}).
        </p>
        <h2 className="mt-6 text-sm font-bold uppercase tracking-wide">
          Ranking por criticidade de desvio
        </h2>
        <ol className="mt-2 space-y-1 text-sm">
          {ranking.map((u, i) => (
            <li key={u.slug} className="flex justify-between border-b border-border py-1">
              <span>
                {i + 1}. {u.nome}
              </span>
              <span className="tabular-nums">
                {pct(u.desvioPercentual)} · {brl(u.desvioValor)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 space-y-6">
        {unidadesOrdenadas.map((u) => (
          <RelatorioUnidade
            cicloLabel={CICLO_LABEL}
            key={u.slug}
            unidade={u}
            review={data?.find((r) => r.unit_slug === u.slug) ?? null}
          />
        ))}
      </div>
    </main>
  );
}


