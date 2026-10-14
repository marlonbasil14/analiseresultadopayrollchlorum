import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PILogo } from "@/components/pi-logo";
import { SeletorCiclo } from "@/components/seletor-ciclo";
import { IdentificacaoTela } from "@/components/identificacao-tela";
import { useMarcacoesContabeis } from "@/components/marcacao-contabil";
import { CICLOS_DISPONIVEIS, dadosDoCiclo, diretoriaDoCiclo, totalGrupo } from "@/data/ciclos";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  QuadroCeo,
  PlanoCeo,
  SeloCeo,
  AjudaCeo,
  SegmentoCeo,
  dinheiroCeo,
} from "@/components/ceo-board";
import {
  leituraCeo,
  estiloCeo,
  type LinhaCeo as Linha,
  type ReviewCeo as Review,
  type PeriodoCeo,
  type MetricaCeo,
} from "@/lib/ceo-model";
import "@/styles/ceo.css";
import { supabase } from "@/integrations/supabase/client";
import { registrarAuditoria } from "@/lib/acesso";
import { useCicloAtivo } from "@/lib/ciclo";
import { pct } from "@/lib/format";
import { useIdentidade } from "@/lib/identificacao";
import { META_CEO, projetarAno } from "@/lib/meta-ceo";
import { usePrazoCiclo } from "@/lib/prazo";

export const Route = createFileRoute("/ceo")({
  head: () => ({
    meta: [
      { title: "Visão CEO — Payroll Intelligence" },
      {
        name: "description",
        content:
          "Meta de budget de payroll, orçado × realizado por diretoria e unidade, tendência e planos de ação.",
      },
      { property: "og:title", content: "Visão CEO — Payroll Intelligence" },
      {
        property: "og:description",
        content: "Leitura executiva do payroll da companhia frente à meta anual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VisaoCeo,
});

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const pctAcima = (r: number, o: number) => (o !== 0 ? ((r - o) / Math.abs(o)) * 100 : 0);

function VisaoCeo() {
  const { pronto, identidade } = useIdentidade();
  if (!pronto) return null;
  if (!identidade) return <IdentificacaoTela />;
  if (identidade.role !== "admin" && identidade.role !== "executivo") {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A Visão CEO está disponível apenas para os perfis executivo e admin.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
        >
          Voltar ao início
        </Link>
      </main>
    );
  }
  return <Conteudo nome={identidade.nome} isAdmin={identidade.role === "admin"} />;
}

function Conteudo({ nome, isAdmin }: { nome: string; isAdmin: boolean }) {
  const { ciclo, CICLO_LABEL } = useCicloAtivo();
  const [aba, setAba] = useState<"cia" | "ops">("cia");
  const [imprimir, setImprimir] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoCeo>("ytd");
  const [grupo, setGrupo] = useState<"diretoria" | "unidade">("diretoria");
  const [metrica, setMetrica] = useState<MetricaCeo>("valores");
  const [reportado, setReportado] = useState(false);
  const [todos, setTodos] = useState(false);
  const [aberta, setAberta] = useState<Linha | null>(null);
  const [preferenciasProntas, setPreferenciasProntas] = useState(false);
  const [geradoEm, setGeradoEm] = useState<Date | null>(null);
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("ceo-seletores-v2") || "null");
      if (p && ["mes", "ytd", "fy"].includes(p.periodo)) setPeriodo(p.periodo);
      if (p && ["diretoria", "unidade"].includes(p.grupo)) setGrupo(p.grupo);
      if (p && ["valores", "hc", "planos"].includes(p.metrica)) setMetrica(p.metrica);
    } catch {
      /* Storage unavailable or invalid. */
    }
    setPreferenciasProntas(true);
  }, []);
  useEffect(() => {
    if (!preferenciasProntas) return;
    try {
      localStorage.setItem("ceo-seletores-v2", JSON.stringify({ periodo, grupo, metrica }));
    } catch {
      /* Storage unavailable. */
    }
  }, [periodo, grupo, metrica, preferenciasProntas]);
  useEffect(() => {
    setTodos(false);
    setAberta(null);
  }, [periodo, grupo, metrica, ciclo]);
  const prazo = usePrazoCiclo(ciclo);
  const mesCiclo = Number(ciclo.slice(5, 7));
  const ano = ciclo.slice(0, 4);

  const auditado = useRef<string | null>(null);
  useEffect(() => {
    if (auditado.current === ciclo) return;
    auditado.current = ciclo;
    void registrarAuditoria({
      unitSlug: "_consolidado",
      ciclo,
      acao: "visao_ceo_acesso",
      autorNome: nome,
    });
  }, [ciclo, nome]);

  const { data: marcas = [] } = useMarcacoesContabeis(ciclo);
  const { data: orcAnual = [] } = useQuery({
    queryKey: ["orcamento-anual", ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_anual")
        .select("unit_slug, diretoria_slug, mes, orcado")
        .gte("mes", `${ano}-01-01`)
        .lte("mes", `${ano}-12-31`);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: indicadores = [] } = useQuery({
    queryKey: ["indicadores-operacionais", ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("indicadores_operacionais")
        .select("unit_slug, mes, venda, producao, producao_unidade")
        .gte("mes", `${ano}-01-01`)
        .lte("mes", `${ano}-12-31`);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["ceo-reviews", ciclo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_monthly_review")
        .select(
          "unit_slug, parecer_diretoria, justificativa_bp, ofensores_diretoria, justificativas, acoes_recomendadas_bp, acoes_recomendadas_diretoria, plano_de_acao, status, fluxo_status, autor",
        )
        .eq("ciclo", ciclo);
      if (error) throw error;
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
    const restante = rs
      .filter((r) => Number(r.mes.slice(5, 7)) > mesCiclo)
      .reduce((s, r) => s + Number(r.orcado), 0);
    return { fyO, restante };
  };
  const indDe = (slug: string, ytd: boolean) => {
    const rs = indicadores.filter(
      (i) =>
        i.unit_slug === slug &&
        (ytd ? Number(i.mes.slice(5, 7)) <= mesCiclo : Number(i.mes.slice(5, 7)) === mesCiclo),
    );
    const soma = (k: "venda" | "producao") =>
      rs.some((r) => r[k] != null) ? rs.reduce((s, r) => s + Number(r[k] ?? 0), 0) : null;
    return { venda: soma("venda"), producao: soma("producao") };
  };

  // B — diretorias
  const linhasDir: Linha[] = diretoriaDoCiclo(ciclo).diretorias.map((d) => {
    const ytdPct = pctAcima(d.realYtd, d.orcadoYtd);
    const { fyO, restante } = fyDe((r) => r.diretoria_slug === d.slug);
    return {
      chave: `diretoria:${d.slug}`,
      nome: d.nome,
      mesR: d.realMes,
      mesO: d.orcadoMes,
      ytdR: d.realYtd,
      ytdO: d.orcadoYtd,
      hcR: d.hcReal,
      hcO: d.hcOrcado,
      ajuste: ajusteDe(`diretoria:${d.slug}`),
      fyO,
      fyRF: fyO !== null && restante !== null ? d.realYtd + restante : null,
      venda: null,
      producao: null,
      revisar: d.realMes < 0 || (d.hcReal > d.hcOrcado && ytdPct > 10),
    };
  });
  // C — unidades
  const linhasUni: Linha[] = dadosDoCiclo(ciclo).unidadesOrdenadas.map((u) => {
    const r = Math.abs(u.payrollActual),
      o = Math.abs(u.payrollForecast);
    const ytdR = Math.abs(u.ytd.payrollActual),
      ytdO = Math.abs(u.ytd.payrollForecast);
    const { fyO, restante } = fyDe((x) => x.unit_slug === u.slug);
    const ind = indDe(u.slug, false);
    return {
      chave: u.slug,
      nome: u.nome,
      mesR: r,
      mesO: o,
      ytdR,
      ytdO,
      hcR: u.headcountReal,
      hcO: u.headcountOrcado,
      ajuste: ajusteDe(u.slug),
      fyO,
      fyRF: fyO !== null && restante !== null ? ytdR + restante : null,
      venda: ind.venda,
      producao: ind.producao,
      revisar:
        u.payrollActual > 0 || (u.headcountReal > u.headcountOrcado && pctAcima(ytdR, ytdO) > 10),
    };
  });

  // Premissa: Operações = unidades fabris (todas exceto Solutions), até existir o mapa unidade→diretoria.
  const dirVis =
    aba === "ops" ? linhasDir.filter((l) => l.chave === "diretoria:operacoes") : linhasDir;
  const uniVis = aba === "ops" ? linhasUni.filter((l) => l.chave !== "solutions") : linhasUni;

  // A + D — meta e tendência
  const ytd = totalGrupo(ciclo, "ytd");
  const ajusteTotal = [...linhasUni, ...linhasDir].reduce((s, l) => s + l.ajuste, 0);
  const historico = CICLOS_DISPONIVEIS.filter(
    (c) => Number(c.chave.slice(5, 7)) <= mesCiclo && c.chave.startsWith(ano),
  ).map((c) => {
    const g = totalGrupo(c.chave, "mes");
    const mesN = Number(c.chave.slice(5, 7));
    return { mes: mesN, real: c.chave === ciclo ? g.real - ajusteTotal : g.real, orcado: g.orcado };
  });
  const orcMensalAnual = (m: number) => {
    const rs = orcAnual.filter((r) => Number(r.mes.slice(5, 7)) === m);
    return rs.length ? rs.reduce((s, r) => s + Number(r.orcado), 0) : null;
  };
  const orcadoRestante = temOrcAnual
    ? orcAnual
        .filter((r) => Number(r.mes.slice(5, 7)) > mesCiclo)
        .reduce((s, r) => s + Number(r.orcado), 0)
    : null;
  const ytdAjustado = ytd.real - ajusteTotal;
  const proj = projetarAno({ ytdReal: ytdAjustado, mesCiclo, historico, orcadoRestante });
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

  const ordenar = (ls: Linha[], p: PeriodoCeo, m: MetricaCeo, bruto: boolean) =>
    [...ls].sort(
      (a, b) =>
        Math.abs(m === "hc" ? b.hcR - b.hcO : leituraCeo(b, p, bruto).desvio) -
        Math.abs(m === "hc" ? a.hcR - a.hcO : leituraCeo(a, p, bruto).desvio),
    );
  const periodoAtivo = periodo === "fy" && !temOrcAnual ? "ytd" : periodo;
  const linhas = ordenar(grupo === "diretoria" ? dirVis : uniVis, periodoAtivo, metrica, reportado);
  const linhasPdf = ordenar(linhasDir, "ytd", "valores", false);
  const planosPdf = ordenar([...linhasDir, ...linhasUni], "ytd", "valores", false).slice(0, 5);
  const metodo = `Fechamento = realizado YTD + média móvel dos últimos 3 meses × ${proj.restantes} meses restantes. Base curta: ${proj.base} meses. Meta do gráfico = meta anual ÷ 12. ${proj.orcadoRestante === null ? "Orçamento remanescente ainda não carregado." : `Orçamento remanescente: ${dinheiroCeo(proj.orcadoRestante)}.`} ${ajusteTotal ? "Efeitos contábeis marcados são descontados do custo operacional." : ""}`;
  useEffect(() => {
    if (!imprimir) return;
    const antigo = document.title;
    document.title = `Visao-CEO-OnePager-${ciclo}`;
    const fim = () => {
      document.title = antigo;
      setImprimir(false);
    };
    window.addEventListener("afterprint", fim, { once: true });
    const t = window.setTimeout(() => window.print(), 300);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", fim);
      document.title = antigo;
    };
  }, [imprimir, ciclo]);

  const gerar = () => {
    void registrarAuditoria({
      unitSlug: "_consolidado",
      ciclo,
      acao: "one_pager_ceo",
      detalhe: `Visao-CEO-OnePager-${ciclo}.pdf`,
      autorNome: nome,
    });
    setGeradoEm(new Date());
    setAberta(null);
    setImprimir(true);
  };

  const grafico = (compacto = false) => (
    <div className={compacto ? "ceo-chart-print" : "h-64 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={serie} margin={{ left: 0, right: 16, top: 12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="rotulo" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v: number) =>
              (v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })
            }
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            width={38}
          />
          <Tooltip formatter={(v: number) => dinheiroCeo(v)} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine
            y={META_CEO.valor / 12}
            stroke="var(--muted-foreground)"
            strokeDasharray="3 5"
          />
          <Line
            dataKey="real"
            name="Realizado"
            stroke="var(--navy)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
          <Line
            dataKey="orcado"
            name="Orçado"
            stroke="var(--brand-light)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="projecao"
            name="Projeção"
            stroke="var(--brand)"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  const kpis = (
    <div className="ceo-kpis grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
      <article className="rounded-lg border border-border p-6">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-bold leading-relaxed">
            Meta: Garantir o budget de R$ 110,713 M de payroll até 31/12/2026
          </h2>
          <span className="print:hidden">
            <AjudaCeo texto={metodo} label="Detalhes da projeção" />
          </span>
        </div>
        <p className="mt-4 text-3xl font-extrabold tabular-nums">{dinheiroCeo(proj.fechamento)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Projeção de fechamento ·{" "}
          {Math.abs(proj.percentualAcima).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%{" "}
          {proj.percentualAcima > 0 ? "acima" : "abaixo"} da meta
        </p>
        <div
          className="relative my-4 h-2 rounded-full bg-muted"
          aria-label={`Budget consumido: ${consumido.toFixed(1)}%; ano decorrido: ${decorrido}%`}
          role="img"
        >
          <div
            className={`h-full rounded-full ${estiloCeo(proj.percentualAcima).barra}`}
            style={{ width: `${Math.max(0, Math.min(100, consumido))}%` }}
          />
          <span
            className="absolute -top-1 h-4 border-l-2 border-foreground"
            style={{ left: `${decorrido}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SeloCeo p={proj.percentualAcima} />
          <span className="text-xs text-muted-foreground">
            {consumido.toFixed(0)}% consumido · {decorrido.toFixed(0)}% do ano
          </span>
        </div>
        {proj.economiaMensal > 0 && (
          <p className="mt-3 text-xs font-semibold text-unfavorable">
            Economizar {dinheiroCeo(proj.economiaMensal)}/mês para atingir a meta.
          </p>
        )}
      </article>
      <article className="rounded-lg border border-border p-6">
        <h2 className="text-sm font-bold">YTD</h2>
        <p className="mt-4 text-3xl font-extrabold tabular-nums">{dinheiroCeo(ytdAjustado)}</p>
        <p className="mt-1 text-sm text-muted-foreground">vs {dinheiroCeo(ytd.orcado)} orçado</p>
        <p className="my-4 text-lg font-bold">
          {dinheiroCeo(ytdAjustado - ytd.orcado)}{" "}
          <span className="text-sm">({pct(pctAcima(ytdAjustado, ytd.orcado))})</span>
        </p>
        <SeloCeo p={pctAcima(ytdAjustado, ytd.orcado)} />
        {!!ajusteTotal && <p className="mt-2 text-xs text-muted-foreground">ajustado: contábil</p>}
      </article>
      <article className="rounded-lg border border-border p-6">
        <h2 className="text-sm font-bold">Headcount</h2>
        <p className="mt-4 text-3xl font-extrabold tabular-nums">
          {ytd.hcReal}
          <span className="text-lg font-normal text-muted-foreground"> / {ytd.hcOrcado}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Real vs orçado</p>
        <p className="my-4 text-lg font-bold">
          {ytd.hcDelta > 0 ? "+" : ""}
          {ytd.hcDelta} pessoas
        </p>
        <SeloCeo p={ytd.hcDelta} hc />
      </article>
    </div>
  );
  return (
    <main className="ceo min-h-screen bg-background text-foreground">
      <div className="ceo-screen mx-auto max-w-6xl px-5 pb-12 pt-8 md:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-border pb-6">
          <div>
            <Button variant="link" asChild className="mb-3 h-auto p-0 text-muted-foreground">
              <Link to="/">
                <ArrowLeft />
                Início
              </Link>
            </Button>
            <p className="text-xs font-semibold text-muted-foreground">
              Gente e Gestão · Payroll Intelligence
            </p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-normal">Visão CEO</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SeletorCiclo />
            <AjudaCeo
              label="Como lemos este número"
              texto={`Como lemos este número: custos em R$ mi, sem sinal contábil. Delta negativo = favorável; até +1% = em linha; acima = desfavorável. HC acima do orçado é desfavorável. ${metodo} Prazo de justificativas: ${prazo.texto}.`}
            />
            <Button onClick={gerar}>
              <Printer />
              Gerar one pager (PDF)
            </Button>
          </div>
        </header>
        {kpis}
        <section className="mt-10 border-t border-border pt-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-extrabold">Real × Orçado</h2>
            <span className="text-xs text-muted-foreground">R$ mi</span>
          </div>
          <div className="my-5 flex flex-wrap gap-3">
            <SegmentoCeo
              label="Período"
              value={periodoAtivo}
              onChange={setPeriodo}
              options={[
                { value: "ytd", label: "YTD" },
                { value: "mes", label: "Mês" },
                ...(temOrcAnual ? [{ value: "fy" as const, label: "FY" }] : []),
              ]}
            />
            <SegmentoCeo
              label="Agrupamento"
              value={grupo}
              onChange={setGrupo}
              options={[
                { value: "diretoria", label: "Diretoria" },
                { value: "unidade", label: "Unidade" },
              ]}
            />
            <SegmentoCeo
              label="Leitura"
              value={metrica}
              onChange={setMetrica}
              options={[
                { value: "valores", label: "Valores" },
                { value: "hc", label: "HC" },
                { value: "planos", label: "Planos de ação" },
              ]}
            />
          </div>
          <label className="mb-5 flex w-fit items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={reportado} onCheckedChange={setReportado} />
            Mostrar desvio reportado (sem ajuste)
          </label>
          <QuadroCeo
            linhas={linhas}
            limite={todos ? undefined : 5}
            periodo={periodoAtivo}
            metrica={metrica}
            reportado={reportado}
            reviews={reviews}
            onOpen={setAberta}
          />
          {linhas.length > 5 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" onClick={() => setTodos(!todos)}>
                {todos ? "Ver menos" : `Ver todos (${linhas.length})`}
              </Button>
            </div>
          )}
          {!linhas.length && (
            <p className="py-8 text-sm text-muted-foreground">Sem dados neste ciclo.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {grupo === "diretoria" ? "Total das diretorias corporativas" : "Total das unidades"}
          </p>
        </section>
        <section className="mt-8 border-t border-border pt-7">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-2xl font-extrabold">Tendência</h2>
            <AjudaCeo texto={metodo} label="Como calculamos a tendência" />
            <span className="ml-auto text-xs text-muted-foreground">R$ mi · meta mensal ┄</span>
          </div>
          {grafico()}
        </section>
        {indicadores.length ? (
          <section className="mt-8 border-t border-border pt-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">KPI Operações</h2>
              <SegmentoCeo
                label="Escopo"
                value={aba}
                onChange={setAba}
                options={[
                  { value: "cia", label: "Companhia" },
                  { value: "ops", label: "Operações" },
                ]}
              />
            </div>
            <IndicadoresOps
              linhas={linhasUni.filter((l) => l.chave !== "solutions")}
              indDe={indDe}
            />
          </section>
        ) : (
          <div className="mt-8 rounded-lg bg-muted px-5 py-4 text-sm text-muted-foreground">
            KPI Operações — aguardando carga de venda e produção
          </div>
        )}
      </div>
      <PlanoCeo
        linha={aberta}
        review={reviews.find((r) => r.unit_slug === aberta?.chave)}
        ciclo={ciclo}
        prazo={prazo.dataBr}
        isAdmin={isAdmin}
        onClose={() => setAberta(null)}
      />
      <div className="ceo-print">
        <header className="mb-3 flex items-center justify-between border-b border-border pb-2">
          <div>
            <p className="text-lg font-extrabold text-brand">Gente e Gestão</p>
            <h1 className="text-xl font-extrabold">Visão CEO — {CICLO_LABEL}</h1>
          </div>
          <PILogo size="md" />
        </header>
        {kpis}
        <div className="ceo-print-columns">
          <section>
            <h2 className="mb-2 font-bold">Real × Orçado · YTD · Diretoria · R$ mi</h2>
            <QuadroCeo
              linhas={linhasPdf}
              limite={5}
              periodo="ytd"
              metrica="valores"
              reportado={false}
              reviews={reviews}
              onOpen={() => {}}
              print
            />
            <p className="mt-1 text-[9px] text-muted-foreground">
              Top 5 por impacto. Total de todas as diretorias corporativas:{" "}
              {dinheiroCeo(linhasDir.reduce((s, l) => s + l.ytdR - l.ajuste, 0))} real /{" "}
              {dinheiroCeo(linhasDir.reduce((s, l) => s + l.ytdO, 0))} orçado.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-bold">Tendência · R$ mi</h2>
            {grafico(true)}
          </section>
        </div>
        <section>
          <h2 className="mb-2 font-bold">Top 5 · Planos de ação</h2>
          <QuadroCeo
            linhas={planosPdf}
            periodo="ytd"
            metrica="planos"
            reportado={false}
            reviews={reviews}
            onOpen={() => {}}
            print
          />
        </section>
        <footer className="mt-auto flex justify-between border-t border-border pt-2 text-[9px]">
          <span>
            {ciclo} ·{" "}
            {geradoEm
              ? new Intl.DateTimeFormat("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(geradoEm)
              : ""}{" "}
            · {nome}
          </span>
          <span>Justificativas: {prazo.dataBr} · Confidencial — uso interno</span>
        </footer>
      </div>
    </main>
  );
}
function IndicadoresOps({
  linhas,
  indDe,
}: {
  linhas: Linha[];
  indDe: (slug: string, ytd: boolean) => { venda: number | null; producao: number | null };
}) {
  const tot = (ytd: boolean) => {
    let real = 0,
      venda = 0,
      producao = 0;
    for (const l of linhas) {
      const i = indDe(l.chave, ytd);
      real += ytd ? l.ytdR - l.ajuste : l.mesR - l.ajuste;
      venda += i.venda ?? 0;
      producao += i.producao ?? 0;
    }
    return { pv: venda ? (real / venda) * 100 : null, pp: producao ? real / producao : null };
  };
  const mes = tot(false),
    ytd = tot(true);
  const f = (v: number | null, pctg: boolean) =>
    v === null
      ? "—"
      : pctg
        ? `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
        : dinheiroCeo(v);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Kpi
        rotulo="Payroll % da Venda (Operações)"
        valor={f(mes.pv, true)}
        detalhe={`YTD: ${f(ytd.pv, true)} · meta: a definir`}
      />
      <Kpi
        rotulo="Payroll por unidade produzida"
        valor={f(mes.pp, false)}
        detalhe={`YTD: ${f(ytd.pp, false)} · meta: a definir`}
      />
    </div>
  );
}

function Kpi({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{rotulo}</p>
      <p className="mt-2 text-2xl font-bold">{valor}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>
    </div>
  );
}
