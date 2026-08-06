import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarClock, Info } from "lucide-react";
import { useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { DesvioBar } from "@/components/desvio-bar";
import { KpiCard } from "@/components/kpi-card";
import { ParallaxHero } from "@/components/parallax-hero";
import {
  CICLO_LABEL,
  CONTAS_SAZONAIS,
  getUnidade,
  janela,
  unidadesOrdenadas,
  type BlocoArea,
  type DesvioConta,
  type Unidade,
} from "@/data/payroll";
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

function AreaCard({ titulo, bloco }: { titulo: string; bloco: BlocoArea }) {
  const fav = (bloco.percentual ?? 0) < 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
      {bloco.diretoria ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{bloco.diretoria}</p>
      ) : null}
      <p className="mt-3 text-lg font-bold tabular-nums">
        HC {bloco.real} / {bloco.orcado}
      </p>
      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
        {brlCompacto(bloco.actual)} vs. {brlCompacto(bloco.forecast)}
      </p>
      {bloco.percentual !== undefined ? (
        <p className={`mt-2 text-sm font-bold tabular-nums ${fav ? "text-favorable" : "text-unfavorable"}`}>
          {seta(fav)} {pct(bloco.percentual)}
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold text-unfavorable">Custo real sem orçamento</p>
      )}
    </div>
  );
}

function UnidadePage() {
  const { unidade } = Route.useLoaderData();
  const u = unidade as Unidade;

  const [ytd, setYtd] = useState(false);
  const dados = janela(u, ytd);

  const linhas: { item: DesvioConta; nota?: string | undefined }[] = dados.desvioPorConta.map(
    (item: DesvioConta) => {
      if (!ytd && CONTAS_SAZONAIS.includes(item.conta)) {
        const alvo = u.ytd.desvioPorConta.find((c) => c.conta === item.conta) ?? item;
        return { item: alvo, nota: "Lido em YTD" };
      }
      return { item };
    },
  );
  const maxPct = Math.max(...linhas.map((l) => Math.abs(l.item.percentual)), 1);

  const prechecked = [
    u.headcountReal === u.headcountOrcado,
    true,
    false,
    Math.sign(u.desvioPercentual) === Math.sign(u.headcountDelta || 0),
    true,
    false,
  ];
  const [checks, setChecks] = useState<boolean[]>(prechecked);

  const idx = unidadesOrdenadas.findIndex((x) => x.slug === u.slug);
  const proxima = unidadesOrdenadas[(idx + 1) % unidadesOrdenadas.length]!;

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            Indicadores · {ytd ? "Acumulado do ano (YTD)" : "Mês isolado"}
          </h2>
          <div className="inline-flex rounded-lg border border-border p-1 text-xs font-semibold">
            {[
              [false, "Mês"],
              [true, "YTD"],
            ].map(([valor, label]) => (
              <button
                key={String(valor)}
                type="button"
                onClick={() => setYtd(valor as boolean)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${
                  ytd === valor ? "bg-brand text-brand-foreground" : "hover:bg-accent"
                }`}
              >
                <CalendarClock className="h-3.5 w-3.5" />
                {label as string}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard rotulo="Payroll Actual" valor={brlCompacto(dados.payrollActual)} />
          <KpiCard rotulo="Payroll Forecast" valor={brlCompacto(dados.payrollForecast)} />
          <KpiCard
            rotulo="Desvio"
            valor={`${seta(dados.desvioPercentual < 0)} ${pct(dados.desvioPercentual)}`}
            detalhe={brl(dados.desvioValor)}
            tom={dados.desvioPercentual < 0 ? "favoravel" : "desfavoravel"}
          />
          <KpiCard
            rotulo="Headcount Real / Orç."
            valor={`${u.headcountReal} / ${u.headcountOrcado}`}
            detalhe={`Delta ${u.headcountDelta > 0 ? "+" : ""}${u.headcountDelta} · Total com CAPEX`}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <h2 className="text-xl font-bold">Desvio por conta</h2>

        {ytd ? (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-brand/40 bg-brand/10 p-3 text-xs">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Acumulado do ano: é esta a janela correta para julgar Férias, Rescisão e ICP.
          </p>
        ) : (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Você está olhando o mês isolado. Férias, Rescisão e ICP são sazonais — por isso já vêm
            exibidas em YTD nesta lista.
          </p>
        )}

        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card px-5">
          {linhas.map(({ item, nota }) => (
            <DesvioBar key={item.conta} item={item} maxPct={maxPct} nota={nota} />
          ))}
        </div>
      </section>

      {u.administrativoGG || u.laboratorio || u.qualidade ? (
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <h2 className="text-xl font-bold">Áreas de atenção</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Centros de custo que costumam explicar “endereços trocados” e o custo corporativo de
            Gente &amp; Gestão concentrado em um único endereço.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {u.administrativoGG ? (
              <AreaCard titulo="Administrativo / G&G" bloco={u.administrativoGG} />
            ) : null}
            {u.laboratorio ? <AreaCard titulo="Laboratório" bloco={u.laboratorio} /> : null}
            {u.qualidade ? <AreaCard titulo="Qualidade" bloco={u.qualidade} /> : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <h2 className="text-xl font-bold">Leitura da unidade</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {u.leituraTexto ?? u.tagLeitura}
        </p>
      </section>

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
