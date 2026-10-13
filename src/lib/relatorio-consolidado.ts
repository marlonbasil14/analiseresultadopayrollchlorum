/** Texto compartilhado pela tela, impressão e exportações do consolidado. */
export function referenciaConsolidado(ciclo: string) {
  const [ano, mes] = ciclo.split("-");
  return `${mes}/${ano}`;
}

export function tituloConsolidado(ciclo: string) {
  return `Relatório consolidado da análise de desvios orçamentários de Payroll — ${referenciaConsolidado(ciclo)}`;
}

export const AUTORIA_CONSOLIDADO = "Gente e Gestão";
export const NOME_ARQUIVO_CONSOLIDADO = "Relatorio-Consolidado-Analise-Desvios-Payroll";