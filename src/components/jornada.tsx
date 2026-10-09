import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  FileText,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { diasAteVencimento } from "@/lib/acesso";
import { rotuloUnidade, type Identidade } from "@/lib/identificacao";
import {
  SUBTITULO_RELATORIO,
  atualizarJornada,
  marcarPasso,
  tituloRelatorio,
  useJornada,
  type Passo,
} from "@/lib/jornada";

type Relatorio = { url?: string | undefined };

function destinoUnidade(identidade: Identidade) {
  if (identidade.escopo === "admin") return { to: "/admin" as const };
  const slug = identidade.unidades.find((u) => u !== "*");
  return slug ? { to: "/unidade/$slug" as const, params: { slug } } : { to: "/" as const };
}

function prazoTexto(ciclo: string) {
  const p = diasAteVencimento(ciclo);
  const data = p.alvo.toLocaleDateString("pt-BR");
  if (p.atrasado) return `prazo venceu em ${data}`;
  if (p.dias === 0) return `vence hoje (${data})`;
  return `faltam ${p.dias} dia(s) · ${data}`;
}

/** Jornada "Primeiros passos" na HERO, com os 3 materiais em sequência + análise da unidade. */
export function PrimeirosPassos({
  ciclo,
  identidade,
  relatorio,
  abrirVideo,
}: {
  ciclo: string;
  identidade: Identidade;
  relatorio: Relatorio;
  abrirVideo: () => void;
}) {
  const { passos, feitos, concluida, carregado } = useJornada(ciclo);
  const [rever, setRever] = useState(false);
  const destino = destinoUnidade(identidade);
  const isAdmin = identidade.escopo === "admin";

  const itens: {
    id: Passo;
    titulo: string;
    descricao: string;
    icone: typeof PlayCircle;
  }[] = [
    {
      id: "video",
      titulo: "Entenda a lógica",
      descricao: "Assistir ao vídeo animado do Guia Orientativo · 1min47s",
      icone: PlayCircle,
    },
    {
      id: "guia",
      titulo: "Aprenda a investigar",
      descricao: "Abrir o Guia Orientativo de Leitura Orçamentária · 8 passos",
      icone: BookOpen,
    },
    {
      id: "relatorio",
      titulo: "Leia a pré-análise do mês",
      descricao: relatorio.url ? tituloRelatorio(ciclo) : "Relatório com Pré-Análise em preparação",
      icone: FileText,
    },
    {
      id: "unidade",
      titulo: isAdmin ? "Acompanhe a consolidação" : "Faça a análise da sua unidade",
      descricao: isAdmin ? "Abrir o painel do admin" : "Justifique os desvios e envie até o 7º dia útil",
      icone: ClipboardCheck,
    },
  ];
  const proximo = itens.find((i) => !passos[i.id]);

  const acao = (id: Passo, children: React.ReactNode, className: string) => {
    if (id === "video")
      return (
        <button type="button" onClick={abrirVideo} className={className}>
          {children}
        </button>
      );
    if (id === "guia")
      return (
        <Link to="/cartilha" onClick={() => void marcarPasso("guia", ciclo)} className={className}>
          {children}
        </Link>
      );
    if (id === "relatorio")
      return relatorio.url ? (
        <a
          href={relatorio.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void marcarPasso("relatorio", ciclo)}
          className={className}
        >
          {children}
        </a>
      ) : (
        <span aria-disabled="true" className={`${className} opacity-60`}>
          {children}
        </span>
      );
    return (
      <Link {...destino} className={className}>
        {children}
      </Link>
    );
  };

  if (!carregado) return null;

  if (concluida && !rever) {
    return (
      <div className="mt-10 space-y-4 lg:max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-favorable/40 bg-favorable/10 px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Check className="h-4 w-4 text-favorable" /> Jornada concluída · {feitos} de 4
          </p>
          <button
            type="button"
            onClick={() => setRever(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-light underline"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Rever
          </button>
        </div>
        <MateriaisApoio ciclo={ciclo} relatorio={relatorio} abrirVideo={abrirVideo} />
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-5 lg:max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Primeiros passos</p>
        <p className="text-xs font-semibold text-navy-foreground/80" aria-live="polite">
          {feitos} de 4
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-foreground/15" aria-hidden>
        <div className="h-full rounded-full bg-brand-light transition-all" style={{ width: `${(feitos / 4) * 100}%` }} />
      </div>
      <ol className="mt-4 space-y-2">
        {itens.map((item, i) => {
          const feito = passos[item.id];
          const ehProximo = proximo?.id === item.id;
          const Icone = item.icone;
          return (
            <li key={item.id}>
              {acao(
                item.id,
                <>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      feito
                        ? "bg-favorable text-card"
                        : ehProximo
                          ? "bg-brand-light text-brand-light-foreground"
                          : "border border-navy-foreground/30 text-navy-foreground/80"
                    }`}
                  >
                    {feito ? <Check className="h-4 w-4" aria-label="Concluído" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icone className="h-4 w-4 shrink-0 text-brand-light" /> {item.titulo}
                      {ehProximo ? (
                        <span className="rounded-full bg-brand-light/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          Próximo passo
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-navy-foreground/60">{item.descricao}</span>
                  </span>
                  {ehProximo ? (
                    <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-light-foreground sm:inline-flex">
                      Começar <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-foreground/40" />
                  )}
                </>,
                `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  ehProximo
                    ? "border border-brand-light/50 bg-brand-light/10 hover:bg-brand-light/20"
                    : "hover:bg-navy-foreground/5"
                }`,
              )}
            </li>
          );
        })}
      </ol>
      {proximo ? (
        <div className="mt-4 sm:hidden">
          {acao(
            proximo.id,
            <>
              Próximo passo: {proximo.titulo} <ArrowRight className="h-4 w-4" />
            </>,
            "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-light-foreground",
          )}
        </div>
      ) : null}
      {concluida ? (
        <button
          type="button"
          onClick={() => setRever(false)}
          className="mt-3 text-xs font-semibold text-brand-light underline"
        >
          Recolher jornada
        </button>
      ) : null}
    </div>
  );
}

/** Linha compacta com os 3 materiais — sempre acessível após a jornada. */
export function MateriaisApoio({
  ciclo,
  relatorio,
  abrirVideo,
}: {
  ciclo: string;
  relatorio: Relatorio;
  abrirVideo: () => void;
}) {
  const cls =
    "flex items-start gap-3 rounded-xl border border-navy-foreground/20 bg-navy-foreground/5 p-4 text-left transition-colors hover:bg-navy-foreground/10";
  return (
    <div>
      <p className="eyebrow">Materiais de apoio</p>
      <div className="mt-2 grid gap-3 md:grid-cols-3">
        <button type="button" onClick={abrirVideo} className={cls}>
          <PlayCircle className="h-6 w-6 shrink-0 text-brand-light" />
          <span>
            <span className="block text-sm font-semibold">Assistir ao vídeo animado do Guia Orientativo</span>
            <span className="mt-0.5 block text-xs text-navy-foreground/60">
              1min47s · entenda a lógica de leitura antes de começar
            </span>
          </span>
        </button>
        <Link to="/cartilha" className={cls}>
          <BookOpen className="h-6 w-6 shrink-0 text-brand-light" />
          <span>
            <span className="block text-sm font-semibold">Abrir o Guia Orientativo de Leitura Orçamentária</span>
            <span className="mt-0.5 block text-xs text-navy-foreground/60">
              Cartilha prática em 8 passos para investigar e explicar desvios
            </span>
          </span>
        </Link>
        {relatorio.url ? (
          <a
            href={relatorio.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void marcarPasso("relatorio", ciclo)}
            className={cls}
          >
            <FileText className="h-6 w-6 shrink-0 text-brand-light" />
            <span>
              <span className="block text-sm font-semibold">{tituloRelatorio(ciclo)}</span>
              <span className="mt-0.5 block text-xs text-navy-foreground/60">{SUBTITULO_RELATORIO}</span>
            </span>
          </a>
        ) : (
          <div aria-disabled="true" className={`${cls} opacity-70`}>
            <FileText className="h-6 w-6 shrink-0 text-brand-light/70" />
            <span>
              <span className="block text-sm font-semibold">
                Relatório com Pré-Análise do Resultado em preparação
              </span>
              <span className="mt-0.5 block text-xs text-navy-foreground/60">{SUBTITULO_RELATORIO}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Modal de boas-vindas no primeiro acesso. */
export function BoasVindas({
  ciclo,
  cicloLabel,
  identidade,
  abrirVideo,
}: {
  ciclo: string;
  cicloLabel: string;
  identidade: Identidade;
  abrirVideo: () => void;
}) {
  const { carregado, jornada } = useJornada(ciclo);
  const [fechado, setFechado] = useState(false);
  if (!carregado || jornada.boasVindasVista || fechado) return null;

  const isAdmin = identidade.escopo === "admin";
  const p = diasAteVencimento(ciclo);
  const dispensar = () => {
    setFechado(true);
    void atualizarJornada({ boasVindasVista: true });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boas-vindas-titulo"
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/85 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 sm:rounded-2xl">
        <Sparkles className="h-7 w-7 text-brand" />
        <h2 id="boas-vindas-titulo" className="mt-3 text-2xl font-extrabold">
          Bem-vindo(a), {identidade.nome}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O Payroll Intelligence mostra, mês a mês, onde o custo de pessoal de cada unidade ficou
          acima ou abaixo do orçado — e é aqui que você explica esses desvios.
        </p>
        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-semibold">O que se espera de você em {cicloLabel}</p>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? "Acompanhar o envio das 8 unidades e consolidar o pacote para o FP&A"
              : "Analisar os desvios da(s) sua(s) unidade(s) e enviar a análise"}{" "}
            até o 7º dia útil:{" "}
            <strong className="text-foreground">{p.alvo.toLocaleDateString("pt-BR")}</strong> (
            {p.atrasado ? "prazo vencido" : p.dias === 0 ? "vence hoje" : `faltam ${p.dias} dia(s)`}).
          </p>
          <p className="mt-3 font-semibold">{isAdmin ? "Seu perfil" : "Suas unidades"}</p>
          <p className="mt-1 text-muted-foreground">
            {isAdmin ? "Admin · todas as 8 unidades" : identidade.unidades.map(rotuloUnidade).join(", ")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            dispensar();
            abrirVideo();
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-base font-semibold text-brand-foreground"
        >
          <PlayCircle className="h-5 w-5" /> Começar pelo vídeo
        </button>
        <button
          type="button"
          onClick={dispensar}
          className="mt-3 w-full text-xs font-semibold text-muted-foreground underline"
        >
          Explorar sozinho
        </button>
      </div>
    </div>
  );
}

type ReviewStatus = { unit_slug: string; fluxo_status: string; parecer_diretoria: string | null };

const STATUS_ROTULO: Record<string, { rotulo: string; cls: string }> = {
  pendente: { rotulo: "Aguardando sua análise", cls: "bg-unfavorable/15 text-unfavorable" },
  enviado: { rotulo: "Enviada", cls: "bg-brand/15 text-brand" },
  consolidado: { rotulo: "Consolidada", cls: "bg-favorable/15 text-favorable" },
};

/** "Sua pendência" (BP) ou resumo do ciclo (admin), acima do Farol. */
export function SuaPendencia({ ciclo, identidade }: { ciclo: string; identidade: Identidade }) {
  const isAdmin = identidade.escopo === "admin";
  const { data } = useQuery({
    queryKey: ["status-ciclo", ciclo],
    queryFn: async () => {
      const { data } = await supabase
        .from("unit_monthly_review")
        .select("unit_slug, fluxo_status, parecer_diretoria")
        .eq("ciclo", ciclo);
      return (data ?? []) as ReviewStatus[];
    },
  });
  const prazo = prazoTexto(ciclo);

  if (isAdmin) {
    const enviadas = (data ?? []).filter(
      (r) => r.fluxo_status === "enviado" || r.fluxo_status === "consolidado",
    ).length;
    return (
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="eyebrow-light">Status do ciclo</p>
            <p className="mt-1 text-xl font-bold">{enviadas} de 8 enviadas</p>
            <p className="text-xs text-muted-foreground">7º dia útil: {prazo}</p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Abrir painel admin <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const minhas = identidade.unidades.filter((u) => u !== "*");
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12" aria-labelledby="pendencia-titulo">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="eyebrow-light">Sua pendência</p>
        <h2 id="pendencia-titulo" className="mt-1 text-xl font-bold">
          Análises do ciclo · 7º dia útil: {prazo}
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {minhas.map((slug) => {
            const r = data?.find((x) => x.unit_slug === slug);
            const st =
              !r || r.fluxo_status === "rascunho" || !STATUS_ROTULO[r.fluxo_status] ? "pendente" : r.fluxo_status;
            const s = STATUS_ROTULO[st]!;
            return (
              <li key={slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">{rotuloUnidade(slug)}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.rotulo}</span>
                    {r?.parecer_diretoria?.trim() ? (
                      <span className="rounded-full bg-brand-light/20 px-2 py-0.5 text-[11px] font-semibold text-brand">
                        Parecer prévio disponível
                      </span>
                    ) : null}
                  </div>
                </div>
                <Link
                  to="/unidade/$slug"
                  params={{ slug }}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
                >
                  Abrir <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
