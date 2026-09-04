/**
 * Visão Diretoria — centros de custo corporativos (Chlorum Solutions).
 * Somente tipos e funções puras; os dados por ciclo vivem em src/data/ciclos/diretoria-*.ts.
 * Valores armazenados em módulo (positivos = custo). Desvio = Real − Orçado (positivo = acima do orçado).
 */

export type LinhaDiretoria = {
  nome: string;
  hcReal: number;
  hcOrcado: number;
  realMes: number;
  orcadoMes: number;
  realYtd: number;
  orcadoYtd: number;
};

export type ContaDiretoria = {
  conta: string;
  realMes: number;
  orcadoMes: number;
  realYtd: number;
  orcadoYtd: number;
};

export type Periodo = "mes" | "ytd";

export function valores(l: { realMes: number; orcadoMes: number; realYtd: number; orcadoYtd: number }, p: Periodo) {
  const real = p === "mes" ? l.realMes : l.realYtd;
  const orcado = p === "mes" ? l.orcadoMes : l.orcadoYtd;
  const desvio = real - orcado;
  const percentual = orcado !== 0 ? (desvio / orcado) * 100 : 0;
  return { real, orcado, desvio, percentual };
}

export function totalDiretorias(diretorias: LinhaDiretoria[], p: Periodo) {
  const real = diretorias.reduce((s, d) => s + (p === "mes" ? d.realMes : d.realYtd), 0);
  const orcado = diretorias.reduce((s, d) => s + (p === "mes" ? d.orcadoMes : d.orcadoYtd), 0);
  const hcReal = diretorias.reduce((s, d) => s + d.hcReal, 0);
  const hcOrcado = diretorias.reduce((s, d) => s + d.hcOrcado, 0);
  const desvio = real - orcado;
  return {
    real,
    orcado,
    desvio,
    percentual: orcado !== 0 ? (desvio / orcado) * 100 : 0,
    hcReal,
    hcOrcado,
    hcDelta: hcReal - hcOrcado,
  };
}
