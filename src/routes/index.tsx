import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, PlayCircle, ArrowRight, BarChart3, X, FileText } from "lucide-react";
import { useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import videoAsset from "@/assets/cartilha-payroll-animacao.mp4.asset.json";
import relatorioAsset from "@/assets/analise-orcamentaria-payroll-julho2026.pdf.asset.json";
import { CICLO_LABEL, desvioResumo, isFavoravel, unidadesOrdenadas } from "@/data/payroll";
import { pct, seta } from "@/lib/format";
import { IdentificacaoTela } from "@/components/identificacao-tela";
import { useIdentidade, rotuloEscopo } from "@/lib/identificacao";

/** BP responsável por cada card do painel. */
export const BP_RESPONSAVEL: Record<string, string> = {
  codo: "Vitória",
  bahia: "Vitória",
  pacatuba: "Vitória",
  igarassu: "Patrícia",
  uberlandia: "Bianca",
  palmeira: "Bianca",
  distribuicao: "Remuneração e Orçamento",
  solutions: "Remuneração e Orçamento",
};


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Payroll Intelligence — Gente & Remuneração | Chlorum Solutions" },
      {
        name: "description",
        content:
          "Ambiente de análise de desvios orçamentários de payroll: consolidado e por unidade, ciclo Julho/2026.",
      },
      {
        property: "og:title",
        content: "Payroll Intelligence — Gente & Remuneração | Chlorum Solutions",
      },
      {
        property: "og:description",
        content:
          "Actual vs. Forecast por unidade de negócio, com cartilha de leitura orçamentária em 8 passos.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [videoAberto, setVideoAberto] = useState(false);
  const { pronto, identidade, limpar } = useIdentidade();
  const visiveis = unidadesOrdenadas;

  if (!pronto) return null;
  if (!identidade) return <IdentificacaoTela />;

  return (
    <main className="min-h-screen bg-background">
      {videoAberto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vídeo explicativo do ciclo de julho"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
          onClick={() => setVideoAberto(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setVideoAberto(false)}
              aria-label="Fechar vídeo"
              className="absolute -top-11 right-0 flex items-center gap-2 rounded-full border border-navy-foreground/30 px-3 py-1.5 text-sm text-navy-foreground hover:bg-navy-foreground/10"
            >
              <X className="h-4 w-4" /> Fechar
            </button>
            <video
              controls
              autoPlay
              preload="metadata"
              className="w-full rounded-xl shadow-2xl"
              src={videoAsset.url}
            />
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-light/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ChlorumLogo className="text-navy-foreground" />
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-navy-foreground/70">
                {identidade.nome} · {rotuloEscopo(identidade.escopo)}
              </span>
              <Link
                to="/admin"
                className="rounded-lg border border-navy-foreground/30 px-3 py-1.5 hover:bg-navy-foreground/10"
              >
                Painel admin
              </Link>
              <button
                type="button"
                onClick={limpar}
                className="rounded-lg border border-navy-foreground/30 px-3 py-1.5 hover:bg-navy-foreground/10"
              >
                Trocar identificação
              </button>
            </div>
          </div>

          <div className="py-16 md:py-24">
            <p className="eyebrow">Gente &amp; Remuneração</p>
            <h1 className="mt-3 text-5xl font-bold md:text-7xl">Payroll Intelligence</h1>
            <p className="mt-4 max-w-2xl text-lg text-navy-foreground/80 md:text-xl">
              Análise de Desvios Orçamentários — Actual vs. Forecast
            </p>
            <p className="mt-2 text-sm text-navy-foreground/60">
              Consolidado e por Unidade · Ciclo: {CICLO_LABEL}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
              <button
                type="button"
                onClick={() => setVideoAberto(true)}
                className="group rounded-2xl border border-brand-light/40 bg-brand-light/10 p-6 text-left transition-colors hover:bg-brand-light/20"
              >
                <PlayCircle className="h-8 w-8 text-brand-light" />
                <p className="mt-4 text-lg font-semibold">Assistir à visão geral animada</p>
                <p className="mt-1 text-xs text-navy-foreground/60">
                  Vídeo explicativo do ciclo de julho · 1min47s
                </p>
              </button>


              <Link
                to="/cartilha"
                className="group rounded-2xl border border-navy-foreground/20 bg-navy-foreground/5 p-6 transition-colors hover:bg-navy-foreground/10"
              >
                <BookOpen className="h-8 w-8 text-brand-light" />
                <p className="mt-4 text-lg font-semibold">
                  Abrir a Cartilha de Leitura Orçamentária
                </p>
                <p className="mt-1 text-xs text-navy-foreground/60">
                  Guia prático para investigar e explicar desvios, em 8 passos
                </p>
              </Link>

              <a
                href={relatorioAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-navy-foreground/20 bg-navy-foreground/5 p-6 transition-colors hover:bg-navy-foreground/10 sm:col-span-2"
              >
                <FileText className="h-8 w-8 text-brand-light" />
                <p className="mt-4 text-lg font-semibold">
                  Ler o relatório de Análise Orçamentária — Julho/2026
                </p>
                <p className="mt-1 text-xs text-navy-foreground/60">
                  Documento completo em PDF · abre em nova aba
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-light">Unidades de negócio</p>
            <h2 className="mt-2 text-2xl font-bold">Oito unidades no ciclo {CICLO_LABEL}</h2>
          </div>
          <Link
            to="/consolidado"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <BarChart3 className="h-4 w-4" /> Ver consolidado
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visiveis.map((u) => {
            const d = desvioResumo(u);
            const fav = isFavoravel(u);
            return (
              <Link
                key={u.slug}
                to="/unidade/$slug"
                params={{ slug: u.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-navy text-navy-foreground shadow-sm"
              >
                <img
                  src={u.imagem}
                  alt={`Unidade ${u.nome}`}
                  loading="lazy"
                  width={1600}
                  height={900}
                  className="h-44 w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-bold">{u.nome}</p>
                  <p className="text-xs text-navy-foreground/60">
                    BP: {BP_RESPONSAVEL[u.slug] ?? "—"}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {d !== undefined ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                          fav ? "bg-favorable/20 text-favorable" : "bg-unfavorable/20 text-unfavorable"
                        }`}
                      >
                        {seta(!!fav)} {pct(d)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-navy-foreground/10 px-2.5 py-1 text-xs">
                        Aguardando dados
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-brand-light transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
