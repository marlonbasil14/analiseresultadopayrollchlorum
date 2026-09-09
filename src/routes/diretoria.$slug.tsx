import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { useState } from "react";

import { PILogo } from "@/components/pi-logo";
import { DesvioBar } from "@/components/desvio-bar";
import { KpiCard } from "@/components/kpi-card";
import { SeletorCiclo } from "@/components/seletor-ciclo";
import { useCicloAtivo } from "@/lib/ciclo";
import { contasPorDiretoriaDoCiclo, todasDiretoriasDoCiclo } from "@/data/ciclos";
import { valores, type Periodo } from "@/data/diretoria";
import { brl, brlCompacto, pct, seta } from "@/lib/format";

export const Route = createFileRoute("/diretoria/$slug")({
  head: () => ({
    meta: [
      { title: "Detalhe da diretoria — Payroll Intelligence | Chlorum Solutions" },
      {
        name: "description",
        content:
          "Abertura por conta contábil do payroll de uma diretoria corporativa: real vs. orçado, mês e YTD.",
      },
      { property: "og:title", content: "Detalhe da diretoria — Payroll Intelligence" },
      {
        property: "og:description",
        content: "Real vs. orçado por conta contábil da diretoria, mês e acumulado.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiretoriaDetalhe,
});

function DiretoriaDetalhe() {
  const { slug } = Route.useParams();
  const { ciclo, CICLO_LABEL } = useCicloAtivo();
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  const linha = todasDiretoriasDoCiclo(ciclo).find((d) => d.slug === slug);

  if (!linha) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Diretoria não disponível no ciclo {CICLO_LABEL}.
        </p>
        <Link to="/" className="mt-4 text-sm font-semibold text-brand">
          Voltar ao início
        </Link>
      </main>
    );
  }

  const v = valores(linha, periodo);
  const contas = contasPorDiretoriaDoCiclo(ciclo, slug);
  const itens = contas.map((c) => {
    const cv = valores(c, periodo);
    return {
      conta: c.conta,
      valor: cv.desvio,
      percentual: cv.percentual,
      favoravel: cv.desvio <= 0,
    };
  });
  const maxPct = Math.max(...itens.map((i) => Math.abs(i.percentual)), 1);

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-navy py-8 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PILogo variant="reverse" size="md" />
            <div className="flex items-center gap-3">
              <SeletorCiclo variante="reverse" />
              <Link
                to="/diretoria"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-navy-foreground/80 hover:text-navy-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Visão Diretoria
              </Link>
            </div>
          </div>
          <p className="eyebrow mt-8">Centros de custo corporativos · {CICLO_LABEL}</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">{linha.nome}</h1>
          <p className="mt-2 text-sm text-navy-foreground/70">
            Headcount {linha.hcReal} real / {linha.hcOrcado} orçado
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            Indicadores · {periodo === "ytd" ? "Acumulado do ano (YTD)" : "Mês isolado"}
          </h2>
          <div className="inline-flex rounded-lg border border-border p-1 text-xs font-semibold">
            {(
              [
                ["mes", "Mês"],
                ["ytd", "YTD"],
              ] as [Periodo, string][]
            ).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setPeriodo(valor)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${
                  periodo === valor ? "bg-brand text-brand-foreground" : "hover:bg-accent"
                }`}
              >
                <CalendarClock className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard rotulo="Payroll real" valor={brlCompacto(v.real)} />
          <KpiCard rotulo="Payroll orçado" valor={brlCompacto(v.orcado)} />
          <KpiCard
            rotulo="Desvio"
            valor={`${seta(v.desvio <= 0)} ${pct(v.percentual)}`}
            detalhe={brl(v.desvio)}
            tom={v.desvio <= 0 ? "favoravel" : "desfavoravel"}
          />
          <KpiCard
            rotulo="Headcount Real / Orç."
            valor={`${linha.hcReal} / ${linha.hcOrcado}`}
            detalhe={`Gap ${linha.hcReal - linha.hcOrcado > 0 ? "+" : ""}${linha.hcReal - linha.hcOrcado}`}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-xl font-bold">Desvio por conta</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Abertura das 7 contas desta diretoria — soma igual ao total publicado na Visão Diretoria.
        </p>

        {itens.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Abertura por conta indisponível para esta diretoria neste ciclo.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card px-5">
            {itens.map((item) => (
              <DesvioBar key={item.conta} item={item} maxPct={maxPct} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
