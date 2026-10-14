import { valores } from "@/data/diretoria";
import { classificarDesvio } from "@/lib/leitura-desvio";

export type LinhaCeo = {
  chave: string; nome: string;
  mesR: number; mesO: number; ytdR: number; ytdO: number;
  hcR: number; hcO: number; ajuste: number;
  fyO: number | null; fyRF: number | null;
  venda: number | null; producao: number | null; revisar?: boolean;
};
export type ReviewCeo = {
  unit_slug: string; parecer_diretoria: string | null; justificativa_bp: string | null;
  ofensores_diretoria: unknown; justificativas: unknown;
  acoes_recomendadas_bp: unknown; acoes_recomendadas_diretoria: unknown;
  plano_de_acao: unknown; status: string; fluxo_status: string; autor: string | null;
};
export type PeriodoCeo = "ytd" | "mes" | "fy";
export type MetricaCeo = "valores" | "hc" | "planos";
export const itensCeo = (v: unknown): Record<string, unknown>[] => Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null) : [];
export const textoCeo = (v: unknown) => typeof v === "string" ? v.trim() : "";

export function leituraCeo(l: LinhaCeo, periodo: PeriodoCeo, reportado = false) {
  const ajuste = reportado ? 0 : l.ajuste;
  if (periodo === "fy") {
    const real = (l.fyRF ?? 0) - ajuste, orcado = l.fyO ?? 0;
    return { real, orcado, desvio: real - orcado, percentual: orcado ? ((real - orcado) / Math.abs(orcado)) * 100 : 0 };
  }
  return valores({ realMes: l.mesR - ajuste, orcadoMes: l.mesO, realYtd: l.ytdR - ajuste, orcadoYtd: l.ytdO }, periodo);
}

export function totalCeo(linhas: LinhaCeo[]): LinhaCeo {
  const soma = (key: "mesR" | "mesO" | "ytdR" | "ytdO" | "hcR" | "hcO" | "ajuste") => linhas.reduce((s, l) => s + l[key], 0);
  const fy = linhas.filter((l) => l.fyO !== null);
  return { chave: "_total", nome: "Total", mesR: soma("mesR"), mesO: soma("mesO"), ytdR: soma("ytdR"), ytdO: soma("ytdO"), hcR: soma("hcR"), hcO: soma("hcO"), ajuste: soma("ajuste"), fyO: fy.length ? fy.reduce((s, l) => s + (l.fyO ?? 0), 0) : null, fyRF: fy.length ? fy.reduce((s, l) => s + (l.fyRF ?? 0), 0) : null, venda: null, producao: null };
}

export function resumoPlano(r?: ReviewCeo) {
  const planos = itensCeo(r?.plano_de_acao).filter((p) => textoCeo(p.item));
  const justificativas = itensCeo(r?.justificativas);
  const acoes = [...itensCeo(r?.acoes_recomendadas_diretoria), ...itensCeo(r?.acoes_recomendadas_bp)];
  const motivo = textoCeo(r?.parecer_diretoria) || textoCeo(r?.justificativa_bp) || justificativas.map((j) => textoCeo(j.texto) || textoCeo(j.ofensor)).filter(Boolean).join("; ");
  const acao = acoes.map((a) => textoCeo(a.acao)).filter(Boolean).join("; ") || planos.map((p) => textoCeo(p.item)).join("; ");
  const concluido = planos.length > 0 && planos.every((p) => ["concluido", "concluida", "concluído", "concluída"].includes(textoCeo(p.status).toLowerCase()));
  return { motivo, acao, planos, justificativas, acoes, status: concluido ? "Concluído" : planos.length || motivo || acao ? "Em andamento" : "Sem justificativa", responsavel: textoCeo(planos[0]?.responsavel) || r?.autor || "Não informado" };
}

// Preserve shared thresholds; only the CEO's neutral presentation is gray.
export function estiloCeo(p: number) {
  const c = classificarDesvio(p);
  return { ...c, texto: c.zona === "em-linha" ? "text-muted-foreground" : c.texto, barra: c.zona === "em-linha" ? "bg-muted-foreground" : c.barra, selo: c.zona === "em-linha" ? "bg-muted text-muted-foreground" : c.selo };
}