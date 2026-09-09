import type { Unidade } from "@/data/payroll";
import { desvioResumo, isFavoravel, janela } from "@/data/payroll";
import * as julho from "./2026-07";
import * as agosto from "./2026-08";
import * as diretoriaJulho from "./diretoria-2026-07";
import * as diretoriaAgosto from "./diretoria-2026-08";

export type CicloChave = "2026-07" | "2026-08";

export const CICLOS_DISPONIVEIS: { chave: CicloChave; label: string }[] = [
  { chave: "2026-07", label: "Julho / 2026" },
  { chave: "2026-08", label: "Agosto / 2026" },
];

export const CICLO_ATUAL: CicloChave = "2026-08";

const REGISTRO: Record<CicloChave, { CICLO: string; CICLO_LABEL: string; unidades: Unidade[] }> = {
  "2026-07": { CICLO: julho.CICLO, CICLO_LABEL: julho.CICLO_LABEL, unidades: julho.unidades },
  "2026-08": { CICLO: agosto.CICLO, CICLO_LABEL: agosto.CICLO_LABEL, unidades: agosto.unidades },
};

export function ehCiclo(valor: unknown): valor is CicloChave {
  return typeof valor === "string" && valor in REGISTRO;
}

/** Conjunto completo de dados e helpers de um ciclo (fallback: ciclo atual). */
export function dadosDoCiclo(chave?: string) {
  const alvo: CicloChave = ehCiclo(chave) ? chave : CICLO_ATUAL;
  const base = REGISTRO[alvo];
  const unidadesOrdenadas = [...base.unidades].sort(
    (a, b) => parseInt(a.ordem, 10) - parseInt(b.ordem, 10),
  );
  return {
    chave: alvo,
    CICLO: base.CICLO,
    CICLO_LABEL: base.CICLO_LABEL,
    unidades: base.unidades,
    unidadesOrdenadas,
    getUnidade: (slug: string) => base.unidades.find((u) => u.slug === slug),
    janela,
    desvioResumo,
    isFavoravel,
  };
}

/** Agregação Cia (soma das 8 unidades) para o farol de resultado. */
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


const REGISTRO_DIRETORIA: Record<CicloChave, typeof diretoriaJulho> = {
  "2026-07": diretoriaJulho,
  "2026-08": diretoriaAgosto,
};

/** Dados da Visão Diretoria de um ciclo (fallback: ciclo atual). */
export function diretoriaDoCiclo(chave?: string) {
  const alvo: CicloChave = ehCiclo(chave) ? chave : CICLO_ATUAL;
  const base = REGISTRO_DIRETORIA[alvo];
  return {
    diretorias: base.diretorias,
    diretoriasComplementares: base.diretoriasComplementares,
    contasDiretoria: base.contasDiretoria,
  };
}
