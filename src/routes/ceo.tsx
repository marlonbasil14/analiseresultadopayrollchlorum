import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ChevronDown, Info, Printer } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PILogo } from "@/components/pi-logo";
import { SeletorCiclo } from "@/components/seletor-ciclo";
import { IdentificacaoTela } from "@/components/identificacao-tela";
import { MarcacaoContabil, useMarcacoesContabeis } from "@/components/marcacao-contabil";
import { CICLOS_DISPONIVEIS, dadosDoCiclo, diretoriaDoCiclo, totalGrupo } from "@/data/ciclos";
import { valores } from "@/data/diretoria";
import { supabase } from "@/integrations/supabase/client";
import { registrarAuditoria } from "@/lib/acesso";
import { useCicloAtivo } from "@/lib/ciclo";
import { CHL } from "@/lib/chlorum-design-tokens";
import { brl, pct } from "@/lib/format";
import { useIdentidade } from "@/lib/identificacao";
import { classificarDesvio } from "@/lib/leitura-desvio";
import { META_CEO, mi, projetarAno } from "@/lib/meta-ceo";
import { usePrazoCiclo } from "@/lib/prazo";

export const Route = createFileRoute("/ceo")({
  head: () => ({
    meta: [
      { title: "Visão CEO — Payroll Intelligence" },
      { name: "description", content: "Meta de budget de payroll, orçado × realizado por diretoria e unidade, tendência e planos de ação." },
      { property: "og:title", content: "Visão CEO — Payroll Intelligence" },
      { property: "og:description", content: "Leitura executiva do payroll da companhia frente à meta anual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VisaoCeo,
});

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEM_FY = "aguardando carga do orçamento anual";

type Linha = {
  chave: string;
  nome: string;
  mesR: number;
  mesO: number;
  ytdR: number;
  ytdO: number;
  hcR: number;
  hcO: number;
  ajuste: number;
  fyO: number | null;
  fyRF: number | null;
  venda: number | null;
  producao: number | null;
  revisar?: boolean;
};

type Review = {
  unit_slug: string;
  parecer_diretoria: string | null;
  justificativa_bp: string | null;
  ofensores_diretoria: unknown;
  justificativas: unknown;
  acoes_recomendadas_bp: unknown;
  acoes_recomendadas_diretoria: unknown;
  plano_de_acao: unknown;
  status: string;
  fluxo_status: string;
  autor: string | null;
};

const arr = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);
const txt = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const pctAcima = (r: number, o: number) => (o !== 0 ? ((r - o) / Math.abs(o)) * 100 : 0);

function VisaoCeo() {
  const { pronto, identidade } = useIdentidade();
  if (!pronto) return null;
  if (!identidade) return <IdentificacaoTela />;
  if (identidade.role !== "admin" && identidade.role !== "executivo") {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">A Visão CEO está disponível apenas para os perfis executivo e admin.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">Voltar ao início</Link>
      </main>
    );
  }
  return <Conteudo nome={identidade.nome} isAdmin={identidade.role === "admin"} />;
}

function Conteudo({ nome, isAdmin }: { nome: string; isAdmin: boolean }) {
  const { ciclo, CICLO_LABEL } = useCicloAtivo();
  const [aba, setAba] = useState<"cia" | "ops">("cia");
  const [imprimir, setImprimir] = useState(false);
  const prazo = usePrazoCiclo(ciclo);
  const mesCiclo = Number(ciclo.slice(5, 7));
  const ano = ciclo.slice(0, 4);

  const auditado = useRef<string | null>(null);
  useEffect(() => {
    if (auditado.current === ciclo) return;
    auditado.current = ciclo;
    void registrarAuditoria({ unitSlug: "_consolidado", ciclo, acao: "visao_ceo_acesso", autorNome: nome });
  }, [ciclo, nome]);

  const { data: marcas = [] } = useMarcacoesContabeis(ciclo);
  const { data: orcAnual = [] } = useQuery({
    queryKey: ["orcamento-anual", ano],
    queryFn: async () => {
      const { data } = await supabase.from("orcamento_anual").select("unit_slug, diretoria_slug, mes, orcado").gte("mes", `${ano}-01-01`).lte("mes", `${ano}-12-31`);
      return data ?? [];
    },
  });
  const { data: indicadores = [] } = useQuery({
    queryKey: ["indicadores-operacionais", ano],
    queryFn: async () => {
      const { data } = await supabase.from("indicadores_operacionais").select("unit_slug, mes, venda, producao, producao_unidade").gte("mes", `${ano}-01-01`).lte("mes", `${ano}-12-31`);
      return data ?? [];
    },
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["ceo-reviews", ciclo],
    queryFn: async () => {
      const { data } = await supabase.from("unit_monthly_review").select("unit_slug, parecer_diretoria, justificativa_bp, ofensores_diretoria, justificativas, acoes_recomendadas_bp, acoes_recomendadas_diretoria, plano_de_acao, status, fluxo_status, autor").eq("ciclo", ciclo);
      return (data ?? []) as Review[];
    },
  });

  const ajusteDe = (slug: string) => {
    const m = marcas.find((x) => x.unit_slug === slug);
    return m?.desvio_contabil ? Number(m.desvio_contabil_valor ?? 0) : 0;
  };

  const temOrcAnual = orcAnual.length > 0;
  const fyDe = (pred: (r: { unit_slug: string; diretoria_slug: string | null }) => boolean) => {
    const rs = orcAnual.filter(pred);
    if (!rs.length) return { fyO: null, restante: null };
    const fyO = rs.reduce((s, r) => s + Number(r.orcado), 0);
    const restante = rs.filter((r) => Number(r.mes.slice(5, 7)) > mesCiclo).reduce((s, r) => s + Number(r.orcado), 0);
    return { fyO, restante };
  };
  const indDe = (slug: string, ytd: boolean) => {
    const rs = indicadores.filter((i) => i.unit_slug === slug && (ytd ? Number(i.mes.slice(5, 7)) <= mesCiclo : Number(i.mes.slice(5, 7)) === mesCiclo));
    const soma = (k: "venda" | "producao") => (rs.some((r) => r[k] != null) ? rs.reduce((s, r) => s + Number(r[k] ?? 0), 0) : null);
    return { venda: soma("venda"), producao: soma("producao") };
  };

  // B — diretorias
  const linhasDir: Linha[] = diretoriaDoCiclo(ciclo).diretorias.map((d) => {
    const ytdPct = pctAcima(d.realYtd, d.orcadoYtd);
    const { fyO, restante } = fyDe((r) => r.diretoria_slug === d.slug);
    return {
      chave: `diretoria:${d.slug}`, nome: d.nome, mesR: d.realMes, mesO: d.orcadoMes, ytdR: d.realYtd, ytdO: d.orcadoYtd,
      hcR: d.hcReal, hcO: d.hcOrcado, ajuste: ajusteDe(`diretoria:${d.slug}`), fyO, fyRF: fyO !== null && restante !== null ? d.realYtd + restante : null,
      venda: null, producao: null,
      revisar: d.realMes < 0 || (d.hcReal > d.hcOrcado && ytdPct > 10),
    };
  });
  // C — unidades
  const linhasUni: Linha[] = dadosDoCiclo(ciclo).unidadesOrdenadas.map((u) => {
    const r = Math.abs(u.payrollActual), o = Math.abs(u.payrollForecast);
    const ytdR = Math.abs(u.ytd.payrollActual), ytdO = Math.abs(u.ytd.payrollForecast);
    const { fyO, restante } = fyDe((x) => x.unit_slug === u.slug);
    const ind = indDe(u.slug, false);
    return {
      chave: u.slug, nome: u.nome, mesR: r, mesO: o, ytdR, ytdO, hcR: u.headcountReal, hcO: u.headcountOrcado,
      ajuste: ajusteDe(u.slug), fyO, fyRF: fyO !== null && restante !== null ? ytdR + restante : null,
      venda: ind.venda, producao: ind.producao,
      revisar: u.payrollActual > 0 || (u.headcountReal > u.headcountOrcado && pctAcima(ytdR, ytdO) > 10),
    };
  });

  // Premissa: Operações = unidades fabris (todas exceto Solutions), até existir o mapa unidade→diretoria.
  const dirVis = aba === "ops" ? linhasDir.filter((l) => l.chave === "diretoria:operacoes") : linhasDir;
  const uniVis = aba === "ops" ? linhasUni.filter((l) => l.chave !== "solutions") : linhasUni;

  // A + D — meta e tendência
  const ytd = totalGrupo(ciclo, "ytd");
  const ajusteTotal = [...linhasUni, ...linhasDir].reduce((s, l) => s + l.ajuste, 0);
  const historico = CICLOS_DISPONIVEIS.filter((c) => Number(c.chave.slice(5, 7)) <= mesCiclo && c.chave.startsWith(ano)).map((c) => {
    const g = totalGrupo(c.chave, "mes");
    const mesN = Number(c.chave.slice(5, 7));
    return { mes: mesN, real: c.chave === ciclo ? g.real - ajusteTotal : g.real, orcado: g.orcado };
  });
  const orcMensalAnual = (m: number) => {
    const rs = orcAnual.filter((r) => Number(r.mes.slice(5, 7)) === m);
    return rs.length ? rs.reduce((s, r) => s + Number(r.orcado), 0) : null;
  };
  const orcadoRestante = temOrcAnual ? orcAnual.filter((r) => Number(r.mes.slice(5, 7)) > mesCiclo).reduce((s, r) => s + Number(r.orcado), 0) : null;
  const ytdAjustado = ytd.real - ajusteTotal;
  const proj = projetarAno({ ytdReal: ytdAjustado, mesCiclo, historico, orcadoRestante });
  const farolMeta = classificarDesvio(proj.percentualAcima);
  const consumido = (ytdAjustado / META_CEO.valor) * 100;
  const decorrido = (mesCiclo / 12) * 100;

  const serie = MESES.map((rotulo, i) => {
    const m = i + 1;
    const h = historico.find((x) => x.mes === m);
    const ultimo = historico.at(-1);
    return {
      rotulo,
      real: h ? h.real : null,
      orcado: orcMensalAnual(m) ?? h?.orcado ?? null,
      projecao: m > mesCiclo ? proj.media : ultimo && m === ultimo.mes ? ultimo.real : null,
    };
  }).filter((p, i) => i + 1 >= (historico[0]?.mes ?? 1));

  // E — desvios relevantes
  const relevantes = [...uniVis, ...dirVis]
    .map((l) => ({ l, desvio: l.mesR - l.mesO - l.ajuste, p: pctAcima(l.mesR - l.ajuste, l.mesO) }))
    .filter((x) => Math.abs(x.p) >= 5 || x.p > 1)
    .sort((a, b) => Math.abs(b.desvio) - Math.abs(a.desvio));
  const situacao = (r?: Review) => {
    if (!r) return "sem";
    const temJust = !!txt(r.justificativa_bp) || arr(r.justificativas).some((j) => txt(j["texto"]));
    const plano = arr(r.plano_de_acao).filter((p) => txt(p["item"]));
    if (plano.length && plano.every((p) => ["concluido", "concluida"].includes(txt(p["status"])))) return "concluido";
    if (plano.length || temJust) return "andamento";
    return "sem";
  };
  const contagem = relevantes.reduce(
    (acc, x) => {
      acc[situacao(reviews.find((r) => r.unit_slug === x.l.chave))] += 1;
      return acc;
    },
    { concluido: 0, andamento: 0, sem: 0 } as Record<string, number>,
  );

  useEffect(() => {
    if (!imprimir) return;
    const antigo = document.title;
    document.title = `Visao-CEO-OnePager-${ciclo}`;
    const fim = () => { document.title = antigo; setImprimir(false); };
    window.addEventListener("afterprint", fim, { once: true });
    const t = window.setTimeout(() => window.print(), 300);
    return () => { window.clearTimeout(t); window.removeEventListener("afterprint", fim); document.title = antigo; };
  }, [imprimir, ciclo]);

  const gerar = () => {
    void registrarAuditoria({ unitSlug: "_consolidado", ciclo, acao: "one_pager_ceo", detalhe: `Visao-CEO-OnePager-${ciclo}.pdf`, autorNome: nome });
    setImprimir(true);
  };

  const temVenda = uniVis.some((l) => l.venda != null);
  const temProd = uniVis.some((l) => l.producao != null);

  return (
    <main className="ceo min-h-screen bg-background">
      {imprimir ? (
        <style>{"@page { size: A4 landscape; margin: 7mm; } @media print { html, body { background: #fff; } .ceo { zoom: 0.52; } .ceo-np { display: none !important; } }"}</style>
      ) : null}
      <section className="bg-navy text-navy-foreground print:bg-transparent print:text-foreground">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <PILogo variant="reverse" size="md" />
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <SeletorCiclo variante="reverse" />
              <button type="button" onClick={gerar} className="inline-flex items-center gap-1 rounded-lg bg-brand-light px-3 py-1.5 text-brand-light-foreground">
                <Printer className="h-3.5 w-3.5" /> Gerar one pager (PDF)
              </button>
              <Link to="/" className="inline-flex items-center gap-1 rounded-lg border border-navy-foreground/30 px-3 py-1.5 hover:bg-navy-foreground/10">
                <ArrowLeft className="h-3.5 w-3.5" /> Início
              </Link>
            </div>
          </div>
          <p className="eyebrow mt-8">Gente &amp; Gestão · {CICLO_LABEL}</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">Visão CEO</h1>
          <p className="mt-2 text-sm text-navy-foreground/70">Prazo de justificativas: {prazo.texto}</p>
          <div className="ceo-np mt-5 inline-flex rounded-lg border border-navy-foreground/30 p-1 text-xs font-semibold print:hidden">
            {(["cia", "ops"] as const).map((a) => (
              <button key={a} type="button" onClick={() => setAba(a)} className={`rounded-md px-3 py-1.5 ${aba === a ? "bg-navy-foreground text-navy" : ""}`}>
                {a === "cia" ? "Companhia" : "Operações"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* A — Meta */}
        <Card titulo="Meta estratégica" sub={META_CEO.texto}>
          {ajusteTotal !== 0 ? <SeloAjuste /> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi rotulo="Orçamento-meta 2026" valor={mi(META_CEO.valor, 3)} />
            <Kpi rotulo={`Realizado YTD (até ${MESES[mesCiclo - 1]})`} valor={mi(ytdAjustado, 3)} detalhe={`${consumido.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do budget`} />
            <Kpi rotulo="Projeção de fechamento" valor={mi(proj.fechamento, 3)} detalhe="YTD + tendência (média 3 meses)" />
            <Kpi
              rotulo={proj.folga >= 0 ? "Folga projetada" : "Estouro projetado"}
              valor={<span className={farolMeta.texto}>{mi(proj.folga, 3)}</span>}
              detalhe={<span className={farolMeta.texto}>{pct(proj.percentualAcima)} vs meta · {farolMeta.leitura}</span>}
            />
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <Barra rotulo="Budget consumido" valor={consumido} cls={farolMeta.barra} />
            <Barra rotulo="Ano decorrido" valor={decorrido} cls="bg-brand" />
          </div>
          {proj.economiaMensal > 0 ? (
            <p className="mt-3 rounded-lg bg-unfavorable/10 p-3 text-sm font-semibold text-unfavorable">
              Para fechar na meta, é preciso economizar {mi(proj.economiaMensal, 3)} por mês nos {proj.restantes} meses restantes.
            </p>
          ) : null}
        </Card>

        {/* B */}
        <Card titulo="Orçado × Realizado — por diretoria" sub={aba === "ops" ? "Filtro: Diretoria de Operações" : "Centros de custo corporativos"}>
          <Tabela linhas={dirVis} venda={false} prod={false} />
        </Card>

        {/* C */}
        <Card titulo="Orçado × Realizado — por unidade" sub={aba === "ops" ? "Filtro: unidades operacionais (todas exceto Solutions)" : "Unidades da companhia (sem mapa unidade → diretoria na base atual)"}>
          <Tabela linhas={uniVis} venda={temVenda} prod={temProd} />
        </Card>

        {/* H */}
        {aba === "ops" ? (
          <Card titulo="KPIs estratégicos de Operações" sub="Payroll como % da Venda e % da Produção">
            {temVenda || temProd ? (
              <IndicadoresOps linhas={uniVis} indDe={indDe} />
            ) : (
              <Vazio texto="Aguardando carga de venda/produção." />
            )}
          </Card>
        ) : null}

        {/* D */}
        <Card titulo="Tendência — mês e ano" sub={`Rótulo de confiança: base curta: ${historico.length} meses`}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Kpi rotulo="Tendência mensal (média 3 meses)" valor={mi(proj.media, 3)} />
            <Kpi rotulo={`Tendência dos ${proj.restantes} meses restantes`} valor={mi(proj.tendenciaRestante, 3)} />
            <Kpi rotulo="Orçamento remanescente" valor={proj.orcadoRestante !== null ? mi(proj.orcadoRestante, 3) : "—"} detalhe={proj.orcadoRestante === null ? SEM_FY : `Saldo da meta: ${mi(proj.saldoMeta, 3)}`} />
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={serie} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHL.gray200} />
                <XAxis dataKey="rotulo" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => (v / 1_000_000).toFixed(1)} tick={{ fontSize: 11 }} width={36} />
                <Tooltip formatter={(v: number) => mi(v, 3)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={META_CEO.valor / 12} stroke={CHL.danger} strokeDasharray="4 4" label={{ value: "meta média mensal", fontSize: 10, fill: CHL.danger }} />
                <Line dataKey="real" name="Realizado" stroke={CHL.navy800} strokeWidth={2} connectNulls={false} />
                <Line dataKey="orcado" name="Orçado" stroke={CHL.blue300} strokeWidth={2} />
                <Line dataKey="projecao" name="Projeção" stroke={CHL.blue600} strokeDasharray="6 4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Como calculamos:</strong> projeção de fechamento = realizado YTD + média móvel dos últimos 3 meses de realizado × meses restantes até dez/2026.
            O “orçamento remanescente” soma o orçado dos meses restantes quando o orçamento anual estiver carregado. A meta média mensal é a meta anual ÷ 12.
            {ajusteTotal !== 0 ? " Valores do ciclo ajustados por efeito contábil marcado." : ""}
          </p>
        </Card>

        {/* E */}
        <Card titulo="Por que cada desvio e o que fazer" sub="Ordenado por impacto em R$ (mês, desvio ajustado)">
          <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-favorable/15 px-3 py-1 text-favorable">Planos concluídos: {contagem.concluido}</span>
            <span className="rounded-full bg-brand/15 px-3 py-1 text-brand">Em andamento: {contagem.andamento}</span>
            <span className="rounded-full bg-unfavorable/15 px-3 py-1 text-unfavorable">Sem justificativa: {contagem.sem}</span>
          </div>
          <div className="space-y-2">
            {relevantes.map(({ l, desvio, p }) => (
              <CardDesvio key={l.chave} linha={l} desvio={desvio} p={p} review={reviews.find((r) => r.unit_slug === l.chave)} situacao={situacao(reviews.find((r) => r.unit_slug === l.chave))} prazo={prazo.dataBr} ciclo={ciclo} isAdmin={isAdmin} />
            ))}
            {relevantes.length === 0 ? <Vazio texto="Nenhum desvio relevante neste ciclo." /> : null}
          </div>
        </Card>
      </div>
    </main>
  );
}

function Card({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {sub ? <p className="mb-4 text-xs text-muted-foreground">{sub}</p> : null}
      {children}
    </section>
  );
}

function Kpi({ rotulo, valor, detalhe }: { rotulo: string; valor: React.ReactNode; detalhe?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{rotulo}</p>
      <p className="mt-2 text-xl font-bold tabular-nums">{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}

function Barra({ rotulo, valor, cls }: { rotulo: string; valor: number; cls: string }) {
  return (
    <div>
      <div className="flex justify-between"><span>{rotulo}</span><span className="font-semibold tabular-nums">{valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span></div>
      <div className="mt-1 h-2 rounded-full bg-muted"><div className={`h-2 rounded-full ${cls}`} style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} /></div>
    </div>
  );
}

function SeloAjuste() {
  return (
    <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-atencao/20 px-3 py-1 text-xs font-semibold text-atencao-foreground" title="Valores marcados como efeito contábil foram retirados do desvio operacional.">
      <Info className="h-3.5 w-3.5" /> ajustado por efeito contábil
    </p>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">{texto}</p>;
}

function Farol({ p }: { p: number }) {
  const c = classificarDesvio(p);
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${c.barra}`} aria-hidden="true" />
      <span className={`text-xs font-bold ${c.texto}`}>{c.leitura}</span>
    </span>
  );
}

function Tabela({ linhas, venda, prod }: { linhas: Linha[]; venda: boolean; prod: boolean }) {
  const soma = (f: (l: Linha) => number) => linhas.reduce((s, l) => s + f(l), 0);
  const fys = linhas.filter((l) => l.fyO !== null);
  const total: Linha = {
    chave: "_total", nome: "Total", mesR: soma((l) => l.mesR), mesO: soma((l) => l.mesO), ytdR: soma((l) => l.ytdR), ytdO: soma((l) => l.ytdO),
    hcR: soma((l) => l.hcR), hcO: soma((l) => l.hcO), ajuste: soma((l) => l.ajuste),
    fyO: fys.length ? fys.reduce((s, l) => s + (l.fyO ?? 0), 0) : null, fyRF: fys.length ? fys.reduce((s, l) => s + (l.fyRF ?? 0), 0) : null,
    venda: linhas.some((l) => l.venda != null) ? soma((l) => l.venda ?? 0) : null, producao: linhas.some((l) => l.producao != null) ? soma((l) => l.producao ?? 0) : null,
  };
  const th = "px-2 py-2 text-right font-semibold whitespace-nowrap";
  const td = "px-2 py-2 text-right tabular-nums whitespace-nowrap";
  if (!linhas.length) return <Vazio texto="Sem dados para o filtro selecionado." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-xs">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="sticky left-0 z-10 bg-muted px-2 py-2 text-left" rowSpan={2}>Nome</th>
            <th className="px-2 py-1 text-center" colSpan={4}>Mês</th>
            <th className="px-2 py-1 text-center" colSpan={4}>YTD</th>
            <th className="px-2 py-1 text-center" colSpan={3}>HC</th>
            <th className="px-2 py-1 text-center" colSpan={2}>FY</th>
            {venda ? <th rowSpan={2} className={th}>% Venda</th> : null}
            {prod ? <th rowSpan={2} className={th}>% Produção</th> : null}
            <th rowSpan={2} className="px-2 py-2 text-left">Farol</th>
          </tr>
          <tr>
            {["Orçado", "Realizado", "Desvio R$", "Desvio %", "Orçado", "Realizado", "Desvio R$", "Desvio %", "Real", "Orçado", "Δ", "Orçado", "Real + Fcst"].map((h, i) => <th key={i} className={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {[...linhas, total].map((l) => {
            const m = valores({ realMes: l.mesR - l.ajuste, orcadoMes: l.mesO, realYtd: l.ytdR - l.ajuste, orcadoYtd: l.ytdO }, "mes");
            const y = valores({ realMes: l.mesR - l.ajuste, orcadoMes: l.mesO, realYtd: l.ytdR - l.ajuste, orcadoYtd: l.ytdO }, "ytd");
            const tot = l.chave === "_total";
            return (
              <tr key={l.chave} className={`border-t border-border ${tot ? "bg-muted/60 font-bold" : ""}`}>
                <td className="sticky left-0 z-10 bg-card px-2 py-2 text-left font-semibold">
                  <span className="flex items-center gap-1">
                    {l.nome}
                    {l.revisar ? <span title="Realizado do mês negativo ou HC acima do orçado com YTD > 10%. Revisar." className="inline-flex items-center gap-0.5 rounded bg-atencao/20 px-1 text-[10px] text-atencao-foreground"><AlertTriangle className="h-3 w-3" />revisar</span> : null}
                    {l.ajuste !== 0 ? <span title={`Desvio reportado ${brl(l.mesR - l.mesO)} · efeito contábil ${brl(l.ajuste)} · ajustado ${brl(m.desvio)}`} className="rounded bg-brand/15 px-1 text-[10px] text-brand">ajustado</span> : null}
                  </span>
                </td>
                <td className={td}>{brl(m.orcado)}</td>
                <td className={td}>{brl(m.real)}</td>
                <td className={`${td} ${classificarDesvio(m.percentual).texto}`}>{brl(m.desvio)}</td>
                <td className={`${td} ${classificarDesvio(m.percentual).texto}`}>{pct(m.percentual)}</td>
                <td className={td}>{brl(y.orcado)}</td>
                <td className={td}>{brl(y.real)}</td>
                <td className={`${td} ${classificarDesvio(y.percentual).texto}`}>{brl(y.desvio)}</td>
                <td className={`${td} ${classificarDesvio(y.percentual).texto}`}>{pct(y.percentual)}</td>
                <td className={td}>{l.hcR}</td>
                <td className={td}>{l.hcO}</td>
                <td className={td}>{l.hcR - l.hcO > 0 ? "+" : ""}{l.hcR - l.hcO}</td>
                <td className={td} title={l.fyO === null ? SEM_FY : undefined}>{l.fyO === null ? "—" : brl(l.fyO)}</td>
                <td className={td} title={l.fyRF === null ? SEM_FY : undefined}>{l.fyRF === null ? "—" : brl(l.fyRF)}</td>
                {venda ? <td className={td}>{l.venda ? `${((m.real / l.venda) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : "—"}</td> : null}
                {prod ? <td className={td}>{l.producao ? brl(m.real / l.producao) : "—"}</td> : null}
                <td className="px-2 py-2"><Farol p={m.percentual} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IndicadoresOps({ linhas, indDe }: { linhas: Linha[]; indDe: (slug: string, ytd: boolean) => { venda: number | null; producao: number | null } }) {
  const tot = (ytd: boolean) => {
    let real = 0, venda = 0, producao = 0;
    for (const l of linhas) {
      const i = indDe(l.chave, ytd);
      real += ytd ? l.ytdR - l.ajuste : l.mesR - l.ajuste;
      venda += i.venda ?? 0;
      producao += i.producao ?? 0;
    }
    return { pv: venda ? (real / venda) * 100 : null, pp: producao ? real / producao : null };
  };
  const mes = tot(false), ytd = tot(true);
  const f = (v: number | null, pctg: boolean) => (v === null ? "—" : pctg ? `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : brl(v));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Kpi rotulo="Payroll % da Venda (Operações)" valor={f(mes.pv, true)} detalhe={`YTD: ${f(ytd.pv, true)} · meta: a definir`} />
      <Kpi rotulo="Payroll por unidade produzida" valor={f(mes.pp, false)} detalhe={`YTD: ${f(ytd.pp, false)} · meta: a definir`} />
    </div>
  );
}

function CardDesvio({ linha, desvio, p, review, situacao, prazo, ciclo, isAdmin }: { linha: Linha; desvio: number; p: number; review?: Review; situacao: string; prazo: string; ciclo: string; isAdmin: boolean }) {
  const [aberto, setAberto] = useState(false);
  const ofensores = useMemo(() => {
    if (!review) return [];
    const l = arr(review.ofensores_diretoria).map((o) => [txt(o["conta"]), txt(o["resumo"])].filter(Boolean).join(" — "));
    for (const j of arr(review.justificativas)) {
      const t = [txt(j["conta"]), txt(j["ofensor"]) || txt(j["texto"])].filter(Boolean).join(" — ");
      if (t) l.push(t);
    }
    return l.filter(Boolean);
  }, [review]);
  const acoes = review ? [...arr(review.acoes_recomendadas_diretoria), ...arr(review.acoes_recomendadas_bp)].map((a) => txt(a["acao"])).filter(Boolean) : [];
  const plano = review ? arr(review.plano_de_acao).filter((x) => txt(x["item"])) : [];
  const nomeSit = situacao === "concluido" ? "Plano concluído" : situacao === "andamento" ? "Em andamento" : "Sem justificativa";
  return (
    <div className="rounded-xl border border-border">
      <button type="button" onClick={() => setAberto((a) => !a)} className="flex w-full flex-wrap items-center justify-between gap-2 p-3 text-left" aria-expanded={aberto}>
        <span className="font-semibold">{linha.nome}</span>
        <span className="flex flex-wrap items-center gap-3 text-xs">
          <span className={`font-bold tabular-nums ${classificarDesvio(p).texto}`}>{brl(desvio)} ({pct(p)})</span>
          <Farol p={p} />
          <span className="rounded-full bg-muted px-2 py-0.5">{nomeSit}</span>
          <ChevronDown className={`h-4 w-4 transition ${aberto ? "rotate-180" : ""}`} />
        </span>
      </button>
      {aberto ? (
        <div className="space-y-3 border-t border-border p-3 text-sm">
          {linha.ajuste !== 0 ? (
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <Kpi rotulo="Desvio reportado" valor={brl(linha.mesR - linha.mesO)} />
              <Kpi rotulo="Efeito contábil" valor={brl(linha.ajuste)} />
              <Kpi rotulo="Desvio ajustado (operacional)" valor={brl(desvio)} />
            </div>
          ) : null}
          <Bloco t="Parecer Gente e Gestão" v={review?.parecer_diretoria} />
          <Bloco t="Ofensores" v={ofensores.join("\n")} />
          <Bloco t="Justificativa do BP" v={review?.justificativa_bp} />
          <Bloco t="Ação proposta" v={acoes.join("\n")} />
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Plano de ação</p>
            {plano.length ? (
              <ul className="mt-1 space-y-1 text-xs">
                {plano.map((x, i) => (
                  <li key={i}>• {txt(x["item"])} — {txt(x["responsavel"]) || review?.autor || "—"} · prazo {txt(x["prazo"]) || prazo} · {txt(x["status"]) || "pendente"}</li>
                ))}
              </ul>
            ) : <p className="text-xs text-muted-foreground">—</p>}
          </div>
          <p className="text-xs text-muted-foreground">Responsável: {review?.autor ?? "—"} · Fluxo: {review?.fluxo_status ?? "pendente"} · Prazo do ciclo: {prazo}</p>
          {isAdmin ? <div className="ceo-np print:hidden"><MarcacaoContabil slug={linha.chave} ciclo={ciclo} compacto /></div> : null}
        </div>
      ) : null}
    </div>
  );
}

function Bloco({ t, v }: { t: string; v: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{t}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm">{v?.trim() || "—"}</p>
    </div>
  );
}

