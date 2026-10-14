/** Meta estratégica da Visão CEO — constante única (altere aqui). */
export const META_CEO = {
  valor: 110_713_000,
  data: "2026-12-31",
  texto: "Garantir o budget de R$ 110,713 M de payroll até 31 de dezembro de 2026.",
} as const;

/** "R$ 1,234 mi" — sempre em módulo. */
export function mi(v: number, casas = 2) {
  return `R$ ${(Math.abs(v) / 1_000_000).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })} mi`;
}

export type PontoMensal = { mes: number; real: number; orcado: number | null };

/**
 * Projeção de fechamento do ano.
 * Tendência = média móvel dos últimos 3 meses de realizado × meses restantes.
 * Fechamento projetado = YTD realizado + tendência.
 */
export function projetarAno(input: {
  ytdReal: number;
  mesCiclo: number; // 1–12
  historico: PontoMensal[];
  orcadoRestante: number | null;
}) {
  const ultimos = [...input.historico].sort((a, b) => a.mes - b.mes).slice(-3);
  const media = ultimos.length ? ultimos.reduce((s, p) => s + p.real, 0) / ultimos.length : 0;
  const restantes = Math.max(0, 12 - input.mesCiclo);
  const tendenciaRestante = media * restantes;
  const fechamento = input.ytdReal + tendenciaRestante;
  const folga = META_CEO.valor - fechamento; // positivo = folga, negativo = estouro
  const percentualAcima = ((fechamento - META_CEO.valor) / META_CEO.valor) * 100;
  return {
    media,
    base: ultimos.length,
    restantes,
    tendenciaRestante,
    fechamento,
    folga,
    percentualAcima,
    economiaMensal: folga < 0 && restantes > 0 ? -folga / restantes : 0,
    saldoMeta: META_CEO.valor - input.ytdReal,
    orcadoRestante: input.orcadoRestante,
  };
}
