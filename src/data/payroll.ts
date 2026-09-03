export type EfeitoTag = "real" | "calendario" | "mapeamento";

export type DesvioConta = {
  conta: string;
  valor: number;
  percentual: number;
  favoravel: boolean;
};

export type Janela = {
  payrollActual: number;
  payrollForecast: number;
  desvioValor: number;
  desvioPercentual: number;
  desvioPorConta: DesvioConta[];
};

export type BlocoArea = {
  real: number;
  orcado: number;
  actual: number;
  forecast: number;
  percentual?: number;
  diretoria?: string;
};

export type Unidade = {
  slug: string;
  nome: string;
  ordem: string;
  observacao?: string;
  imagem: string;
  tagLeitura: string;
  payrollActual: number;
  payrollForecast: number;
  desvioValor: number;
  desvioPercentual: number;
  headcountReal: number;
  headcountOrcado: number;
  headcountDelta: number;
  desvioPorConta: DesvioConta[];
  ytd: Janela;
  administrativoGG?: BlocoArea;
  laboratorio?: BlocoArea;
  qualidade?: BlocoArea;
  leituraTexto?: string;
  /** Aviso de qualidade/lacuna de dado na base do ciclo. */
  observacaoDados?: string;
};


export const ORDEM_CONTAS = [
  "Salário",
  "Hora Extra",
  "Férias",
  "Rescisão e Aviso Prévio",
  "Encargos",
  "Benefícios",
  "ICP",
];

/** Contas sazonais que nunca devem ser lidas pelo mês isolado (Cartilha, seções 4 e 7). */
export const CONTAS_SAZONAIS = ["Férias", "Rescisão e Aviso Prévio", "ICP"];

/** Classificação automática do tipo de efeito (Cartilha, seção 3 a 6). */
export function classificarEfeito(conta: string): EfeitoTag {
  if (CONTAS_SAZONAIS.includes(conta)) return "calendario";
  if (["Encargos", "Benefícios"].includes(conta)) return "mapeamento";
  return "real";
}

export const EFEITO_LABEL: Record<EfeitoTag, string> = {
  real: "Efeito real",
  calendario: "Efeito de calendário",
  mapeamento: "Efeito cascata / mapeamento",
};

/** Janela de leitura: mês isolado do ciclo ou acumulado do ano. */
export function janela(u: Unidade, ytd: boolean): Janela {
  return ytd
    ? u.ytd
    : {
        payrollActual: u.payrollActual,
        payrollForecast: u.payrollForecast,
        desvioValor: u.desvioValor,
        desvioPercentual: u.desvioPercentual,
        desvioPorConta: u.desvioPorConta,
      };
}

/** Desvio % resumido usado nos cards e no consolidado. */
export function desvioResumo(u: Unidade) {
  return u.desvioPercentual;
}

export function isFavoravel(u: Unidade) {
  return u.desvioPercentual < 0;
}

