import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, FileText, Lightbulb } from "lucide-react";

import { diasAteVencimento } from "@/lib/acesso";
import { atualizarJornada, marcarPasso, tituloRelatorio, useJornada } from "@/lib/jornada";
import { RELATORIOS_PDF } from "@/lib/relatorios";
import type { CicloChave } from "@/data/ciclos";

/** Guia rápido recolhível no topo da página da unidade. */
export function GuiaRapido({ ciclo }: { ciclo: CicloChave }) {
  const { carregado, jornada } = useJornada(ciclo);
  if (!carregado) return null;
  const aberto =
    jornada.guiaRapidoRecolhido !== undefined ? !jornada.guiaRapidoRecolhido : !jornada.primeiroEnvio;
  const relatorio = RELATORIOS_PDF[ciclo];
  const prazo = diasAteVencimento(ciclo).alvo.toLocaleDateString("pt-BR");

  const passos = [
    "Leia o parecer prévio de Gente e Gestão (mais abaixo, em “Análise da unidade”).",
    "Abra as contas com desvio ≥ 5% e veja a composição por sub-conta (clique na conta).",
    "Justifique cada conta crítica e registre as ações.",
    `Salve o rascunho e envie para consolidação até o 7º dia útil (${prazo}).`,
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-8">
      <div className="rounded-2xl border border-brand/30 bg-brand/5">
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls="guia-rapido-corpo"
          onClick={() => void atualizarJornada({ guiaRapidoRecolhido: aberto })}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 font-bold">
            <Lightbulb className="h-5 w-5 text-brand" /> Como analisar esta unidade em 4 passos
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`} />
        </button>
        {aberto ? (
          <div id="guia-rapido-corpo" className="border-t border-brand/20 px-5 pb-5 pt-4">
            <ol className="grid gap-3 sm:grid-cols-2">
              {passos.map((p, i) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-1">{p}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-card p-3 text-xs">
              <span className="font-semibold">Legenda de leitura:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-favorable" /> Verde = gasto abaixo do orçado
                (favorável)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-unfavorable" /> Vermelho = acima do orçado
                (desfavorável)
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/cartilha"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
              >
                <BookOpen className="h-4 w-4" /> Guia Orientativo
              </Link>
              {relatorio.url ? (
                <a
                  href={relatorio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void marcarPasso("relatorio", ciclo)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
                >
                  <FileText className="h-4 w-4" /> {tituloRelatorio(ciclo)}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
