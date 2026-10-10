import codo from "@/assets/unidade-codo.jpg";
import igarassu from "@/assets/unidade-igarassu.jpg";
import pacatuba from "@/assets/unidade-pacatuba.jpg";
import palmeira from "@/assets/unidade-palmeira.jpg";
import bahia from "@/assets/unidade-bahia.jpg";
import uberlandia from "@/assets/unidade-uberlandia.jpg";
import solutions from "@/assets/unidade-solutions.jpg";
import { url as distribuicao } from "@/assets/unidade-distribuicao.png.asset.json";

import type { Unidade } from "@/data/payroll";
import { desvioResumo, isFavoravel, janela } from "@/data/payroll";
import type { ContaDiretoria, LinhaDiretoria } from "@/data/diretoria";
import type { ComposicaoUnidade } from "@/data/subcontas";

/**
 * Os números da folha NÃO ficam no código: são lidos do banco
 * (tabela ciclo_unidade_dados, com RLS por unidade) pelo DadosFolhaGate,
 * que preenche este cache antes de qualquer tela renderizar.
 */

export type CicloChave = "2026-07" | "2026-08" | "2026-09";

export const CICLOS_DISPONIVEIS: { chave: CicloChave; label: string }[] = [
  { chave: "2026-07", label: "Julho / 2026" },
  { chave: "2026-08", label: "Agosto / 2026" },
  { chave: "2026-09", label: "Setembro / 2026" },
];

export const CICLO_ATUAL: CicloChave = "2026-09";

/** Catálogo fixo das unidades (sem valores). */
export const CATALOGO_UNIDADES: { slug: string; nome: string; ordem: string; imagem: string }[] = [
  { slug: "igarassu", nome: "Igarassu", ordem: "4 de 8", imagem: igarassu },
  { slug: "solutions", nome: "Solutions", ordem: "7 de 8", imagem: solutions },
  { slug: "bahia", nome: "Bahia", ordem: "5 de 8", imagem: bahia },
  { slug: "codo", nome: "Codó", ordem: "1 de 8", imagem: codo },
  { slug: "pacatuba", nome: "Pacatuba", ordem: "2 de 8", imagem: pacatuba },
  { slug: "palmeira", nome: "Palmeira", ordem: "3 de 8", imagem: palmeira },
  { slug: "uberlandia", nome: "Uberlândia", ordem: "6 de 8", imagem: uberlandia },
  { slug: "distribuicao", nome: "Distribuição", ordem: "8 de 8", imagem: distribuicao },
];

export function nomeUnidade(slug: string) {
  return CATALOGO_UNIDADES.find((u) => u.slug === slug)?.nome ?? slug;
}

export type ConsolidadoPayload = {
  diretorias: LinhaDiretoria[];
  diretoriasComplementares: LinhaDiretoria[];
  contasDiretoria: ContaDiretoria[];
  contasPorDiretoria: Record<string, ContaDiretoria[]>;
};

type CicloStore = {
  unidades: Unidade[];
  composicao: Record<string, ComposicaoUnidade>;
  consolidado: ConsolidadoPayload | null;
};

let store: Partial<Record<CicloChave, CicloStore>> = {};

export type LinhaDados = { ciclo: string; unit_slug: string; payload: unknown };

/** Substitui o cache com as linhas que o usuário logado pode ler. */
export function carregarDadosFolha(linhas: LinhaDados[]) {
  const novo: Partial<Record<CicloChave, CicloStore>> = {};
  for (const l of linhas) {
    if (!ehCiclo(l.ciclo)) continue;
    const c = (novo[l.ciclo] ??= { unidades: [], composicao: {}, consolidado: null });
    if (l.unit_slug === "_consolidado") {
      c.consolidado = l.payload as ConsolidadoPayload;
      continue;
    }
    const { composicao, ...resto } = l.payload as Omit<Unidade, "imagem"> & {
      composicao?: ComposicaoUnidade | null;
    };
    const cat = CATALOGO_UNIDADES.find((u) => u.slug === l.unit_slug);
    c.unidades.push({ ...resto, imagem: cat?.imagem ?? "" } as Unidade);
    if (composicao) c.composicao[l.unit_slug] = composicao;
  }
  store = novo;
}

export function limparDadosFolha() {
  store = {};
}

function doCiclo(chave?: string): CicloStore {
  const alvo: CicloChave = ehCiclo(chave) ? chave : CICLO_ATUAL;
  return store[alvo] ?? { unidades: [], composicao: {}, consolidado: null };
}

export function ehCiclo(valor: unknown): valor is CicloChave {
  return typeof valor === "string" && CICLOS_DISPONIVEIS.some((c) => c.chave === valor);
}

/** Usuário logado pode ver a visão da companhia (admin ou '*')? */
export function temConsolidado(chave?: string) {
  return doCiclo(chave).consolidado !== null;
}

/** Composição por sub-conta de uma unidade no ciclo (null se indisponível). */
export function composicaoDe(chave: string | undefined, slug: string) {
  return doCiclo(chave).composicao[slug] ?? null;
}

/** Conjunto de dados e helpers de um ciclo (fallback: ciclo atual). */
export function dadosDoCiclo(chave?: string) {
  const alvo: CicloChave = ehCiclo(chave) ? chave : CICLO_ATUAL;
  const base = doCiclo(alvo);
  const unidadesOrdenadas = [...base.unidades].sort(
    (a, b) => parseInt(a.ordem, 10) - parseInt(b.ordem, 10),
  );
  return {
    chave: alvo,
    CICLO: alvo as string,
    CICLO_LABEL: CICLOS_DISPONIVEIS.find((c) => c.chave === alvo)!.label,
    unidades: base.unidades,
    unidadesOrdenadas,
    getUnidade: (slug: string) => base.unidades.find((u) => u.slug === slug),
    janela,
    desvioResumo,
    isFavoravel,
  };
}

/** Agregação Cia (soma das unidades visíveis) para o farol de resultado. */
export function totalGrupo(chave: string | undefined, periodo: "mes" | "ytd") {
  const { unidades } = dadosDoCiclo(chave);
  const real = unidades.reduce(
    (s, u) => s + (periodo === "mes" ? u.payrollActual : u.ytd.payrollActual),
    0,
  );
  const orcado = unidades.reduce(
    (s, u) => s + (periodo === "mes" ? u.payrollForecast : u.ytd.payrollForecast),
    0,
  );
  const hcReal = unidades.reduce((s, u) => s + u.headcountReal, 0);
  const hcOrcado = unidades.reduce((s, u) => s + u.headcountOrcado, 0);
  // A base guarda payroll como valor negativo (despesa); exibimos em módulo.
  const realAbs = Math.abs(real);
  const orcadoAbs = Math.abs(orcado);
  const desvioValor = realAbs - orcadoAbs;
  const desvioPercentual = orcadoAbs !== 0 ? (desvioValor / orcadoAbs) * 100 : 0;
  return {
    real: realAbs,
    orcado: orcadoAbs,
    desvioValor,
    desvioPercentual,
    hcReal,
    hcOrcado,
    hcDelta: hcReal - hcOrcado,
  };
}

/** Dados da Visão Diretoria de um ciclo (vazio sem permissão). */
export function diretoriaDoCiclo(chave?: string) {
  const c = doCiclo(chave).consolidado;
  return {
    diretorias: c?.diretorias ?? [],
    diretoriasComplementares: c?.diretoriasComplementares ?? [],
    contasDiretoria: c?.contasDiretoria ?? [],
  };
}

/** Abertura por conta de uma diretoria em um ciclo. */
export function contasPorDiretoriaDoCiclo(chave: string | undefined, slugDiretoria: string) {
  return doCiclo(chave).consolidado?.contasPorDiretoria[slugDiretoria] ?? [];
}

/** Todas as diretorias do ciclo (corporativas + complementares). */
export function todasDiretoriasDoCiclo(chave?: string) {
  const { diretorias, diretoriasComplementares } = diretoriaDoCiclo(chave);
  return [...diretorias, ...diretoriasComplementares.filter((d) => d.slug !== "remediacao")];
}
