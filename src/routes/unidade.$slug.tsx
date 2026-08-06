import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarClock, Info } from "lucide-react";
import { useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { DesvioBar } from "@/components/desvio-bar";
import { KpiCard } from "@/components/kpi-card";
import { ParallaxHero } from "@/components/parallax-hero";
import { CICLO_LABEL, getUnidade, unidades, type DesvioConta, type Unidade } from "@/data/payroll";
import { brl, brlCompacto, pct, seta } from "@/lib/format";

export const Route = createFileRoute("/unidade/$slug")({
  loader: ({ params }) => {
    const unidade = getUnidade(params.slug);
    if (!unidade) throw notFound();
    return { unidade };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unidade não encontrada — Payroll Intelligence" }, { name: "robots", content: "noindex" }],
      };
    }
    const nome = loaderData.unidade.nome;
    const desc = `Desvios de payroll da unidade ${nome} no ciclo ${CICLO_LABEL}: Actual vs. Forecast, headcount e desvio por conta.`;
    return {
      meta: [
        { title: `${nome} — Payroll Intelligence | Chlorum Solutions` },
        { name: "description", content: desc },
        { property: "og:title", content: `${nome} — Payroll Intelligence` },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: UnidadePage,
});

const PERGUNTAS = [
  "O headcount da área bate com o orçado?",
  "Essa conta é Férias, Rescisão ou ICP? Se sim, olhe o YTD.",
  "Existe uma área “espelho” com o sinal oposto?",
  "O desvio de custo é proporcional ao desvio de headcount?",
  "Encargos e Benefícios se moveram junto com Salário/Hora Extra?",
  "O que sobra é o desvio operacional real.",
];

function UnidadePage() {
  const { unidade } = Route.useLoaderData();
  const u = unidade as Unidade;
  const completo = u.statusDados === "completo" && u.desvioPorConta;
  const maxPct = completo ? Math.max(...u.desvioPorConta!.map((c: DesvioConta) => Math.abs(c.percentual))) : 100;

  const prechecked = [
    completo ? u.headcountReal === u.headcountOrcado : false,
    true,
    false,
    false,
    completo ?? false,
    false,
  ];
  const [checks, setChecks] = useState<boolean[]>(prechecked);
  const [ytd, setYtd] = useState(false);

  const idx = unidades.findIndex((x) => x.slug === u.slug);
  const proxima = unidades[(idx + 1) % unidades.length]!;

  return (
    <main className="min-h-screen bg-background">
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-navy-foreground">
        <ChlorumLogo />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-navy-foreground/80 hover:text-navy-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
      </div>

      <ParallaxHero imagem={u.imagem} alt={`Unidade ${u.nome}`}>
        <p className="eyebrow">
          Unidade {u.ordem} · {CICLO_LABEL}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-navy-foreground md:text-6xl">{u.nome}</h1>
        {u.observacao ? (
          <p className="mt-1 text-sm text-navy-foreground/70">{u.observacao}</p>
        ) : null}
        <span className="mt-4 inline-block rounded-full border border-brand/50 bg-brand/15 px-4 py-1.5 text-xs font-semibold text-navy-foreground">
          {u.tagLeitura}
        </span>
      </ParallaxHero>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {completo ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard rotulo="Payroll Actual" valor={brlCompacto(u.payrollActual!)} />
            <KpiCard rotulo="Payroll Forecast" valor={brlCompacto(u.payrollForecast!)} />
            <KpiCard
              rotulo="Desvio"
              valor={`${seta(u.desvioPercentual! < 0)} ${pct(u.desvioPercentual!)}`}
              detalhe={brl(u.desvioValor!)}
              tom={u.desvioPercentual! < 0 ? "favoravel" : "desfavoravel"}
            />
            <KpiCard
              rotulo="Headcount Real / Orç."
              valor={`${u.headcountReal} / ${u.headcountOrcado}`}
              detalhe={`Delta ${u.headcountDelta! > 0 ? "+" : ""}${u.headcountDelta}`}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              rotulo="Desvio Payroll"
              valor={pct(u.dadosParciais?.desvioPayrollPercentual ?? 0, 0)}
              tom={(u.dadosParciais?.desvioPayrollPercentual ?? 0) < 0 ? "favoravel" : "desfavoravel"}
            />
            <KpiCard
              rotulo="HC Administrativo Real / Orç."
              valor={`${u.dadosParciais?.hcAdmReal ?? "—"} / ${u.dadosParciais?.hcAdmOrcado ?? "—"}`}
              detalhe={`Delta ${u.dadosParciais?.hcAdmDelta ?? "—"}`}
            />
            <KpiCard
              rotulo="Férias (Actual vs. Forecast)"
              valor={
                u.dadosParciais?.feriasActual
                  ? `${brlCompacto(u.dadosParciais.feriasActual)}`
                  : "Aguardando dados"
              }
              detalhe={
                u.dadosParciais?.feriasForecast
                  ? `Forecast ${brlCompacto(u.dadosParciais.feriasForecast)} · ${pct(u.dadosParciais.feriasDesvioPercentual ?? 0, 0)}`
                  : undefined
              }
            />
            <KpiCard
              rotulo="Qualidade sem orçamento"
              valor={
                u.dadosParciais?.qualidadeCustoRealSemOrcamento
                  ? brlCompacto(u.dadosParciais.qualidadeCustoRealSemOrcamento)
                  : "—"
              }
              detalhe="Custo real com orçamento zerado"
            />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Desvio por conta</h2>
          <button
            type="button"
            onClick={() => setYtd((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
          >
            <CalendarClock className="h-4 w-4" />
            {ytd ? "Visualizando: YTD" : "Visualizando: Mês isolado"}
          </button>
        </div>

        {ytd ? (
          <p className="mt-3 rounded-lg border border-brand/40 bg-brand/10 p-3 text-xs">
            O acumulado do ano (YTD) ainda não está disponível neste ciclo. Ao avaliar Férias,
            Rescisão e ICP, use o YTD da planilha de origem antes de reagir ao mês.
          </p>
        ) : (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Você está olhando o mês isolado. Férias, Rescisão e ICP são contas sazonais — não julgue
            pelo mês.
          </p>
        )}

        {completo ? (
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card px-5">
            {u.desvioPorConta!.map((item: DesvioConta) => (
              <DesvioBar key={item.conta} item={item} maxPct={maxPct} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <p className="text-sm font-semibold">Aguardando dados completos do ciclo</p>
            <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">
              O breakdown das 7 contas desta unidade ainda não foi carregado. Complete pelo upload do
              relatório individual da unidade no ciclo {CICLO_LABEL}.
            </p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Completar via upload do relatório
            </button>
          </div>
        )}
      </section>

      {u.leituraTexto || u.dadosParciais?.leitura ? (
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <h2 className="text-xl font-bold">Leitura da unidade</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {u.leituraTexto ?? u.dadosParciais?.leitura}
          </p>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <h2 className="text-xl font-bold">Rode o roteiro de 6 perguntas</h2>
        <ul className="mt-4 space-y-2">
          {PERGUNTAS.map((p, i) => (
            <li key={p}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() =>
                    setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))
                  }
                  className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
                />
                <span>
                  <span className="font-semibold tabular-nums">{i + 1}.</span> {p}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-navy py-12 text-navy-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <p className="max-w-lg text-lg font-semibold">
            Antes de escalar essa dúvida, rode o roteiro de 6 perguntas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/cartilha"
              hash="07-roteiro-6-perguntas"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
            >
              Abrir a Cartilha
            </Link>
            <Link
              to="/unidade/$slug"
              params={{ slug: proxima.slug }}
              className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/30 px-4 py-2 text-sm font-semibold"
            >
              Próxima unidade: {proxima.nome} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
