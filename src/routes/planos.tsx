import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";

import { PILogo } from "@/components/pi-logo";
import { SeletorCiclo } from "@/components/seletor-ciclo";
import { IdentificacaoTela } from "@/components/identificacao-tela";
import { CATALOGO_UNIDADES, CICLOS_DISPONIVEIS } from "@/data/ciclos";
import { supabase } from "@/integrations/supabase/client";
import { useCicloAtivo } from "@/lib/ciclo";
import { useIdentidade } from "@/lib/identificacao";
import { marcarPasso } from "@/lib/jornada";
import { prazoVencido } from "@/lib/prazo";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos de Ação e Pareceres — Payroll Intelligence" },
      {
        name: "description",
        content:
          "Pareceres, principais ofensores e planos de ação por unidade, com status, responsáveis, prazos e evolução entre ciclos.",
      },
      { property: "og:title", content: "Planos de Ação e Pareceres — Payroll Intelligence" },
      {
        property: "og:description",
        content: "Visão consolidada dos pareceres e planos de ação das unidades Chlorum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planos,
});

type StatusAcao = "aberta" | "em_andamento" | "concluida" | "atrasada";
const STATUS_LABEL: Record<StatusAcao, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  atrasada: "Atrasada",
};
const STATUS_CLS: Record<StatusAcao, string> = {
  aberta: "bg-muted text-muted-foreground",
  em_andamento: "bg-brand/15 text-brand",
  concluida: "bg-favorable/15 text-favorable",
  atrasada: "bg-unfavorable/15 text-unfavorable",
};
const FLUXO_LABEL: Record<string, string> = {
  rascunho: "Em análise",
  enviado: "Enviada",
  consolidado: "Consolidada",
};

type Review = {
  unit_slug: string;
  ciclo: string;
  parecer_diretoria: string | null;
  justificativa_bp: string | null;
  ofensores_diretoria: unknown;
  justificativas: unknown;
  plano_de_acao: unknown;
  acoes_recomendadas_bp: unknown;
  acoes_recomendadas_diretoria: unknown;
  fluxo_status: string;
  autor: string | null;
  atualizado_em: string;
};

type Acao = {
  unidade: string;
  origem: string;
  acao: string;
  responsavel: string;
  prazo: string;
  status: StatusAcao;
};

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function statusDe(bruto: unknown, prazo: string): StatusAcao {
  const s = texto(bruto);
  if (s === "concluido" || s === "concluida") return "concluida";
  const hoje = new Date().toISOString().slice(0, 10);
  if (prazo && /^\d{4}-\d{2}-\d{2}/.test(prazo) && prazo.slice(0, 10) < hoje) return "atrasada";
  if (s === "em_andamento") return "em_andamento";
  return "aberta";
}

function acoesDe(r: Review): Acao[] {
  const out: Acao[] = [];
  for (const p of arr<Record<string, unknown>>(r.plano_de_acao)) {
    const acao = texto(p["item"]);
    if (!acao) continue;
    const prazo = texto(p["prazo"]);
    out.push({ unidade: r.unit_slug, origem: "Plano de ação", acao, responsavel: texto(p["responsavel"]), prazo, status: statusDe(p["status"], prazo) });
  }
  for (const [lista, origem] of [
    [r.acoes_recomendadas_bp, "Ação recomendada (BP)"],
    [r.acoes_recomendadas_diretoria, "Recomendação Gente e Gestão"],
  ] as const) {
    for (const a of arr<Record<string, unknown>>(lista)) {
      const acao = texto(a["acao"]);
      if (!acao) continue;
      const prazo = texto(a["prazo"]);
      out.push({ unidade: r.unit_slug, origem, acao, responsavel: texto(a["responsavel"]), prazo, status: statusDe(a["status"], prazo) });
    }
  }
  return out;
}

function ofensoresDe(r: Review) {
  const lista = arr<Record<string, unknown>>(r.ofensores_diretoria).map((o) =>
    [texto(o["conta"]), texto(o["resumo"])].filter(Boolean).join(" — "),
  );
  for (const j of arr<Record<string, unknown>>(r.justificativas)) {
    const t = [texto(j["conta"]), texto(j["ofensor"])].filter(Boolean).join(" — ");
    if (t) lista.push(t);
  }
  return lista.filter(Boolean);
}

const nomeUni = (slug: string) => CATALOGO_UNIDADES.find((u) => u.slug === slug)?.nome ?? slug;
const ordemUni = (slug: string) => parseInt(CATALOGO_UNIDADES.find((u) => u.slug === slug)?.ordem ?? "99", 10);
const dataBr = (s: string) => (/^\d{4}-\d{2}-\d{2}/.test(s) ? new Date(s.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR") : s || "—");

function Planos() {
  const { pronto, identidade, isExecutivo } = useIdentidade();
  const { ciclo, CICLO_LABEL } = useCicloAtivo();
  const [fUni, setFUni] = useState("todas");
  const [fStatus, setFStatus] = useState<"todos" | StatusAcao>("todos");
  const [fResp, setFResp] = useState("todos");

  useEffect(() => {
    if (isExecutivo) void marcarPasso("unidade", ciclo);
  }, [isExecutivo, ciclo]);

  const q = useQuery({
    queryKey: ["planos-pareceres", identidade?.email],
    enabled: !!identidade,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_monthly_review")
        .select(
          "unit_slug, ciclo, parecer_diretoria, justificativa_bp, ofensores_diretoria, justificativas, plano_de_acao, acoes_recomendadas_bp, acoes_recomendadas_diretoria, fluxo_status, autor, atualizado_em",
        );
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  const todas = q.data ?? [];
  const doCiclo = useMemo(
    () => todas.filter((r) => r.ciclo === ciclo).sort((a, b) => ordemUni(a.unit_slug) - ordemUni(b.unit_slug)),
    [todas, ciclo],
  );
  const unidadesVisiveis = useMemo(() => {
    const base = identidade?.escopo === "admin" ? CATALOGO_UNIDADES.map((u) => u.slug) : identidade?.unidades ?? [];
    return [...base].sort((a, b) => ordemUni(a) - ordemUni(b));
  }, [identidade]);

  const acoesCiclo = doCiclo.flatMap(acoesDe);
  const responsaveis = [...new Set(acoesCiclo.map((a) => a.responsavel).filter(Boolean))].sort();
  const acoesFiltradas = acoesCiclo.filter(
    (a) =>
      (fUni === "todas" || a.unidade === fUni) &&
      (fStatus === "todos" || a.status === fStatus) &&
      (fResp === "todos" || a.responsavel === fResp),
  );
  const comParecer = unidadesVisiveis.filter((s) => {
    const r = doCiclo.find((x) => x.unit_slug === s);
    return r && (texto(r.justificativa_bp) || texto(r.parecer_diretoria));
  }).length;
  const pctParecer = unidadesVisiveis.length ? Math.round((comParecer / unidadesVisiveis.length) * 100) : 0;
  const atrasadas = acoesCiclo.filter((a) => a.status === "atrasada").length;

  const exportarCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const linhas = [
      ["Ciclo", "Unidade", "Origem", "Ação", "Responsável", "Prazo", "Status"],
      ...acoesFiltradas.map((a) => [CICLO_LABEL, nomeUni(a.unidade), a.origem, a.acao, a.responsavel, dataBr(a.prazo), STATUS_LABEL[a.status]]),
    ];
    const csv = "\ufeff" + linhas.map((l) => l.map(esc).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `planos-de-acao-${ciclo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!pronto) return null;
  if (!identidade) return <IdentificacaoTela />;

  const selCls = "rounded-lg border border-border bg-card px-3 py-2 text-sm";
  const slugsMostrados = unidadesVisiveis.filter((s) => fUni === "todas" || s === fUni);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-navy text-navy-foreground print:bg-transparent print:text-foreground">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <PILogo variant="reverse" size="md" />
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <SeletorCiclo variante="reverse" />
              <Link to="/" className="inline-flex items-center gap-1 rounded-lg border border-navy-foreground/30 px-3 py-1.5 hover:bg-navy-foreground/10">
                <ArrowLeft className="h-3.5 w-3.5" /> Início
              </Link>
            </div>
          </div>
          <p className="eyebrow mt-10">Gente &amp; Gestão · {CICLO_LABEL}</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">Planos de Ação e Pareceres</h1>
          <p className="mt-2 max-w-2xl text-sm text-navy-foreground/70">
            Pareceres, principais ofensores e ações de cada unidade no ciclo, com a evolução de julho a setembro.
            {isExecutivo ? " Visão somente leitura." : ""}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {q.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : null}
        {q.isError ? <p className="text-sm text-unfavorable">Não foi possível carregar os planos. Tente novamente.</p> : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Contador rotulo="Total de ações" valor={String(acoesCiclo.length)} />
          <Contador rotulo="Unidades com parecer" valor={`${pctParecer}%`} detalhe={`${comParecer} de ${unidadesVisiveis.length}`} />
          <Contador rotulo="Ações atrasadas" valor={String(atrasadas)} alerta={atrasadas > 0} />
        </div>

        <div className="mt-8 flex flex-wrap items-end gap-3 print:hidden">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Unidade
            <select value={fUni} onChange={(e) => setFUni(e.target.value)} className={`mt-1 block ${selCls}`}>
              <option value="todas">Todas</option>
              {unidadesVisiveis.map((s) => (
                <option key={s} value={s}>{nomeUni(s)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Status
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value as typeof fStatus)} className={`mt-1 block ${selCls}`}>
              <option value="todos">Todos</option>
              {(Object.keys(STATUS_LABEL) as StatusAcao[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Responsável
            <select value={fResp} onChange={(e) => setFResp(e.target.value)} className={`mt-1 block ${selCls}`}>
              <option value="todos">Todos</option>
              {responsaveis.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={exportarCsv} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent">
              <Printer className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>

        <h2 className="mt-10 text-xl font-bold">Por unidade</h2>
        <div className="mt-4 space-y-5">
          {slugsMostrados.map((slug) => {
            const r = doCiclo.find((x) => x.unit_slug === slug);
            const acoes = acoesFiltradas.filter((a) => a.unidade === slug);
            const ofensores = r ? ofensoresDe(r) : [];
            return (
              <article key={slug} className="break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{nomeUni(slug)}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">
                      {r ? FLUXO_LABEL[r.fluxo_status] ?? r.fluxo_status : "Sem análise"}
                    </span>
                    <Link to="/unidade/$slug" params={{ slug }} className="font-semibold text-brand underline print:hidden">
                      Abrir unidade
                    </Link>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Bloco titulo="Parecer prévio de Gente e Gestão" texto={r?.parecer_diretoria} />
                  <Bloco titulo="Parecer da BP" texto={r?.justificativa_bp} />
                </div>
                {ofensores.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Principais ofensores</p>
                    <ul className="mt-1 list-disc pl-5 text-sm">
                      {ofensores.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-4 overflow-x-auto">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações e plano de ação</p>
                  {acoes.length ? (
                    <table className="mt-2 w-full min-w-[560px] text-sm">
                      <thead className="text-left text-xs text-muted-foreground">
                        <tr><th className="py-1 pr-3">Ação</th><th className="py-1 pr-3">Responsável</th><th className="py-1 pr-3">Prazo</th><th className="py-1">Status</th></tr>
                      </thead>
                      <tbody>
                        {acoes.map((a, i) => (
                          <tr key={i} className="border-t border-border align-top">
                            <td className="py-2 pr-3">{a.acao}<span className="block text-[11px] text-muted-foreground">{a.origem}</span></td>
                            <td className="py-2 pr-3">{a.responsavel || "—"}</td>
                            <td className="py-2 pr-3 tabular-nums">{dataBr(a.prazo)}</td>
                            <td className="py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLS[a.status]}`}>{STATUS_LABEL[a.status]}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Nenhuma ação registrada{fStatus !== "todos" || fResp !== "todos" ? " com esses filtros" : ""}.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <h2 className="mt-12 text-xl font-bold">Por diretoria</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          As diretorias corporativas fazem parte de Solutions: os pareceres e ações delas estão no cartão de Solutions acima.
          Ainda não há pareceres registrados separadamente por diretoria.
        </p>

        <h2 className="mt-12 text-xl font-bold">Evolução dos planos · Jul → Set</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Unidade</th>
                {CICLOS_DISPONIVEIS.map((c) => <th key={c.chave} className="px-4 py-3">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {slugsMostrados.map((slug) => (
                <tr key={slug} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{nomeUni(slug)}</td>
                  {CICLOS_DISPONIVEIS.map((c) => {
                    const r = todas.find((x) => x.unit_slug === slug && x.ciclo === c.chave);
                    if (!r) return <td key={c.chave} className="px-4 py-3 text-muted-foreground">—</td>;
                    const a = acoesDe(r);
                    const conc = a.filter((x) => x.status === "concluida").length;
                    const atr = a.filter((x) => x.status === "atrasada").length;
                    return (
                      <td key={c.chave} className="px-4 py-3 text-xs">
                        <span className="font-semibold">{FLUXO_LABEL[r.fluxo_status] ?? r.fluxo_status}</span>
                        <span className="block text-muted-foreground">
                          {a.length} ação(ões) · {conc} concluída(s){atr ? ` · ` : ""}
                          {atr ? <span className="text-unfavorable">{atr} atrasada(s)</span> : null}
                        </span>
                        <span className="block text-muted-foreground">{texto(r.justificativa_bp) ? "Com parecer da BP" : "Sem parecer da BP"}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Contador({ rotulo, valor, detalhe, alerta }: { rotulo: string; valor: string; detalhe?: string; alerta?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p className={`mt-2 text-3xl font-extrabold tabular-nums ${alerta ? "text-unfavorable" : ""}`}>{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}

function Bloco({ titulo, texto: t }: { titulo: string; texto: string | null | undefined }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p className="mt-1 whitespace-pre-line text-sm">{t?.trim() ? t : <span className="text-muted-foreground">Ainda não preenchido.</span>}</p>
    </div>
  );
}
