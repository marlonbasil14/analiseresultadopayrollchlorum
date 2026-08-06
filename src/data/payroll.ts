import codo from "@/assets/unidade-codo.jpg";
import igarassu from "@/assets/unidade-igarassu.jpg";
import pacatuba from "@/assets/unidade-pacatuba.jpg";
import palmeira from "@/assets/unidade-palmeira.jpg";
import bahia from "@/assets/unidade-bahia.jpg";
import uberlandia from "@/assets/unidade-uberlandia.jpg";
import solutions from "@/assets/unidade-solutions.jpg";
import distribuicao from "@/assets/unidade-distribuicao.jpg";

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
};

export const CICLO = "2026-07";
export const CICLO_LABEL = "Julho / 2026";

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

export const unidades: Unidade[] = [
  {
    slug: "igarassu",
    nome: "Igarassu",
    ordem: "4 de 8",
    imagem: igarassu,
    tagLeitura: "Predominantemente operacional — real, não mapeamento",
    payrollActual: -3492051.07,
    payrollForecast: -2914994.64,
    desvioValor: -577056.43,
    desvioPercentual: 19.8,
    headcountReal: 176,
    headcountOrcado: 164,
    headcountDelta: 12,
    desvioPorConta: [
      { conta: "Salário", valor: 150386.78, percentual: -10.9, favoravel: true },
      { conta: "Hora Extra", valor: -306938.86, percentual: 917.6, favoravel: false },
      { conta: "Férias", valor: -186084.84, percentual: 520.7, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 25189.02, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: -29814.71, percentual: 4.9, favoravel: false },
      { conta: "Benefícios", valor: -148388.82, percentual: 25.8, favoravel: false },
      { conta: "ICP", valor: -81405.01, percentual: 32.5, favoravel: false },
    ],
    ytd: {
      payrollActual: -23795416.1,
      payrollForecast: -23218359.67,
      desvioValor: -577056.43,
      desvioPercentual: 2.5,
      desvioPorConta: [
        { conta: "Salário", valor: 150386.78, percentual: -1.9, favoravel: true },
        { conta: "Hora Extra", valor: -306938.86, percentual: 27.0, favoravel: false },
        { conta: "Férias", valor: -186084.84, percentual: 13.2, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 25189.02, percentual: -17.1, favoravel: true },
        { conta: "Encargos", valor: -29814.71, percentual: 0.6, favoravel: false },
        { conta: "Benefícios", valor: -148388.82, percentual: 2.7, favoravel: false },
        { conta: "ICP", valor: -81405.01, percentual: 4.5, favoravel: false },
      ],
    },
    administrativoGG: {real: 25, orcado: 16, actual: -526822.07, forecast: -528381.71, percentual: -0.3},
    laboratorio: {real: 0, orcado: 8, actual: 0, forecast: -92943.22, percentual: -100.0},
    qualidade: {real: 8, orcado: 0, actual: -121118.28, forecast: 0},
    leituraTexto:
      "À primeira vista parece contraditório — mais gente e, ainda assim, muito mais hora extra. A leitura correta é: o quadro cresceu em áreas administrativas e de segurança, não necessariamente nas posições operacionais que geram a pressão de turno, então a fábrica seguiu comprando hora extra para cobrir a operação contínua, ao mesmo tempo em que outras áreas cresceram acima do plano.",
  },
  {
    slug: "solutions",
    nome: "Solutions",
    ordem: "7 de 8",
    imagem: solutions,
    tagLeitura: "Favorável no total, mas com efeito de timing + G&G embutido",
    payrollActual: -2132170.31,
    payrollForecast: -3061348.74,
    desvioValor: 929178.43,
    desvioPercentual: -30.4,
    headcountReal: 76,
    headcountOrcado: 81,
    headcountDelta: -5,
    desvioPorConta: [
      { conta: "Salário", valor: 556639.15, percentual: -33.5, favoravel: true },
      { conta: "Hora Extra", valor: -37037.99, percentual: 0.0, favoravel: false },
      { conta: "Férias", valor: -132666.2, percentual: 411.5, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 23212.43, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 129715.69, percentual: -22.4, favoravel: true },
      { conta: "Benefícios", valor: 28616.18, percentual: -7.1, favoravel: true },
      { conta: "ICP", valor: 360699.18, percentual: -100.0, favoravel: true },
    ],
    ytd: {
      payrollActual: -14663913.72,
      payrollForecast: -15593092.15,
      desvioValor: 929178.43,
      desvioPercentual: -6.0,
      desvioPorConta: [
        { conta: "Salário", valor: 556639.15, percentual: -7.3, favoravel: true },
        { conta: "Hora Extra", valor: -37037.99, percentual: 32.5, favoravel: false },
        { conta: "Férias", valor: -132666.2, percentual: 21.5, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 23212.43, percentual: -51.4, favoravel: true },
        { conta: "Encargos", valor: 129715.69, percentual: -4.6, favoravel: true },
        { conta: "Benefícios", valor: 28616.18, percentual: -1.1, favoravel: true },
        { conta: "ICP", valor: 360699.18, percentual: -19.3, favoravel: true },
      ],
    },
    administrativoGG: {real: 18, orcado: 18, actual: -727819.58, forecast: -531911.93, percentual: 36.8, diretoria: "Gente e Gestão"},
  },
  {
    slug: "bahia",
    nome: "Bahia",
    ordem: "5 de 8",
    observacao: "Unidade de São Sebastião do Passé — BA",
    imagem: bahia,
    tagLeitura: "Desfavorável, concentrado em Hora Extra, Férias e G&G administrativo",
    payrollActual: -466956.59,
    payrollForecast: -399222.41,
    desvioValor: -67734.18,
    desvioPercentual: 17.0,
    headcountReal: 32,
    headcountOrcado: 28,
    headcountDelta: 4,
    desvioPorConta: [
      { conta: "Salário", valor: -14582.71, percentual: 9.6, favoravel: false },
      { conta: "Hora Extra", valor: -17920.44, percentual: 113.3, favoravel: false },
      { conta: "Férias", valor: -25906.09, percentual: 610.7, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 3054.61, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: -8031.72, percentual: 11.1, favoravel: false },
      { conta: "Benefícios", valor: -27530.39, percentual: 21.5, favoravel: false },
      { conta: "ICP", valor: 23182.55, percentual: -100.0, favoravel: true },
    ],
    ytd: {
      payrollActual: -2900160.6,
      payrollForecast: -2832426.42,
      desvioValor: -67734.18,
      desvioPercentual: 2.4,
      desvioPorConta: [
        { conta: "Salário", valor: -14582.71, percentual: 1.6, favoravel: false },
        { conta: "Hora Extra", valor: -17920.44, percentual: 8.9, favoravel: false },
        { conta: "Férias", valor: -25906.09, percentual: 22.1, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 3054.61, percentual: -11.2, favoravel: true },
        { conta: "Encargos", valor: -8031.72, percentual: 1.8, favoravel: false },
        { conta: "Benefícios", valor: -27530.39, percentual: 2.7, favoravel: false },
        { conta: "ICP", valor: 23182.55, percentual: -27.1, favoravel: true },
      ],
    },
    administrativoGG: {real: 5, orcado: 3, actual: -226880.77, forecast: -69459.86, percentual: 226.6},
  },
  {
    slug: "codo",
    nome: "Codó",
    ordem: "1 de 8",
    imagem: codo,
    tagLeitura: "Levemente desfavorável — Férias sazonal + ICP acima do provisionado",
    payrollActual: -259422.34,
    payrollForecast: -247529.06,
    desvioValor: -11893.28,
    desvioPercentual: 4.8,
    headcountReal: 22,
    headcountOrcado: 24,
    headcountDelta: -2,
    desvioPorConta: [
      { conta: "Salário", valor: 455.87, percentual: -0.4, favoravel: true },
      { conta: "Hora Extra", valor: 218.49, percentual: -3.5, favoravel: true },
      { conta: "Férias", valor: -17651.15, percentual: 620.3, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 2049.05, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 2848.65, percentual: -6.0, favoravel: true },
      { conta: "Benefícios", valor: 7624.99, percentual: -11.4, favoravel: true },
      { conta: "ICP", valor: -7439.18, percentual: 50.0, favoravel: false },
    ],
    ytd: {
      payrollActual: -1758749.78,
      payrollForecast: -1746856.5,
      desvioValor: -11893.28,
      desvioPercentual: 0.7,
      desvioPorConta: [
        { conta: "Salário", valor: 455.87, percentual: -0.1, favoravel: true },
        { conta: "Hora Extra", valor: 218.49, percentual: -0.3, favoravel: true },
        { conta: "Férias", valor: -17651.15, percentual: 24.0, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 2049.05, percentual: -31.3, favoravel: true },
        { conta: "Encargos", valor: 2848.65, percentual: -1.0, favoravel: true },
        { conta: "Benefícios", valor: 7624.99, percentual: -1.5, favoravel: true },
        { conta: "ICP", valor: -7439.18, percentual: 7.0, favoravel: false },
      ],
    },
    administrativoGG: {real: 1, orcado: 1, actual: -32778.51, forecast: -10817.63, percentual: 203.0},
    laboratorio: {real: 0, orcado: 2, actual: 0, forecast: -18394.68, percentual: -100.0},
    qualidade: {real: 0, orcado: 0, actual: -26489.25, forecast: 0},
  },
  {
    slug: "pacatuba",
    nome: "Pacatuba",
    ordem: "2 de 8",
    imagem: pacatuba,
    tagLeitura: "Levemente desfavorável — mesmo padrão de Codó/Distribuição, magnitude menor",
    payrollActual: -522576.65,
    payrollForecast: -479856.2,
    desvioValor: -42720.45,
    desvioPercentual: 8.9,
    headcountReal: 26,
    headcountOrcado: 30,
    headcountDelta: -4,
    desvioPorConta: [
      { conta: "Salário", valor: 24966.31, percentual: -11.2, favoravel: true },
      { conta: "Hora Extra", valor: -5231.0, percentual: 60.4, favoravel: false },
      { conta: "Férias", valor: -26405.07, percentual: 563.3, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 3232.7, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 4394.56, percentual: -5.4, favoravel: true },
      { conta: "Benefícios", valor: -24056.36, percentual: 20.3, favoravel: false },
      { conta: "ICP", valor: -19621.59, percentual: 48.7, favoravel: false },
    ],
    ytd: {
      payrollActual: -3173233.47,
      payrollForecast: -3130513.02,
      desvioValor: -42720.45,
      desvioPercentual: 1.4,
      desvioPorConta: [
        { conta: "Salário", valor: 24966.31, percentual: -1.9, favoravel: true },
        { conta: "Hora Extra", valor: -5231.0, percentual: 6.7, favoravel: false },
        { conta: "Férias", valor: -26405.07, percentual: 15.6, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 3232.7, percentual: -100.0, favoravel: true },
        { conta: "Encargos", valor: 4394.56, percentual: -0.9, favoravel: true },
        { conta: "Benefícios", valor: -24056.36, percentual: 2.7, favoravel: false },
        { conta: "ICP", valor: -19621.59, percentual: 15.2, favoravel: false },
      ],
    },
    administrativoGG: {real: 5, orcado: 5, actual: -145992.72, forecast: -112190.97, percentual: 30.1},
    laboratorio: {real: 0, orcado: 2, actual: 0, forecast: -22420.5, percentual: -100.0},
    qualidade: {real: 0, orcado: 0, actual: -26960.18, forecast: 0},
  },
  {
    slug: "palmeira",
    nome: "Palmeira",
    ordem: "3 de 8",
    imagem: palmeira,
    tagLeitura: "Levemente desfavorável no total, mas com gap extremo no G&G administrativo",
    payrollActual: -536497.3,
    payrollForecast: -520107.96,
    desvioValor: -16389.34,
    desvioPercentual: 3.2,
    headcountReal: 34,
    headcountOrcado: 40,
    headcountDelta: -6,
    desvioPorConta: [
      { conta: "Salário", valor: 26168.04, percentual: -13.3, favoravel: true },
      { conta: "Hora Extra", valor: 4780.78, percentual: -16.4, favoravel: true },
      { conta: "Férias", valor: -49518.04, percentual: 867.9, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 3749.01, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 24822.55, percentual: -26.1, favoravel: true },
      { conta: "Benefícios", valor: -58193.03, percentual: 36.9, favoravel: false },
      { conta: "ICP", valor: 31801.35, percentual: -100.0, favoravel: true },
    ],
    ytd: {
      payrollActual: -3040558.29,
      payrollForecast: -3024168.95,
      desvioValor: -16389.34,
      desvioPercentual: 0.5,
      desvioPorConta: [
        { conta: "Salário", valor: 26168.04, percentual: -2.2, favoravel: true },
        { conta: "Hora Extra", valor: 4780.78, percentual: -2.0, favoravel: true },
        { conta: "Férias", valor: -49518.04, percentual: 25.1, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 3749.01, percentual: -4.7, favoravel: true },
        { conta: "Encargos", valor: 24822.55, percentual: -4.3, favoravel: true },
        { conta: "Benefícios", valor: -58193.03, percentual: 10.6, favoravel: false },
        { conta: "ICP", valor: 31801.35, percentual: -17.8, favoravel: true },
      ],
    },
    administrativoGG: {real: 3, orcado: 2, actual: -354616.65, forecast: -33935.0, percentual: 945.0},
    laboratorio: {real: 0, orcado: 4, actual: 0, forecast: -44209.28, percentual: -100.0},
    qualidade: {real: 0, orcado: 0, actual: -25523.01, forecast: 0},
  },
  {
    slug: "uberlandia",
    nome: "Uberlândia",
    ordem: "6 de 8",
    imagem: uberlandia,
    tagLeitura: "Desfavorável — Férias fortemente sazonal + G&G administrativo acima do plano",
    payrollActual: -707509.29,
    payrollForecast: -627464.77,
    desvioValor: -80044.52,
    desvioPercentual: 12.8,
    headcountReal: 39,
    headcountOrcado: 42,
    headcountDelta: -3,
    desvioPorConta: [
      { conta: "Salário", valor: -9455.29, percentual: 3.5, favoravel: false },
      { conta: "Hora Extra", valor: 5606.2, percentual: -24.3, favoravel: true },
      { conta: "Férias", valor: -94756.06, percentual: 1294.2, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 127.26, percentual: -2.5, favoravel: true },
      { conta: "Encargos", valor: -13908.46, percentual: 11.3, favoravel: false },
      { conta: "Benefícios", valor: -11191.72, percentual: 7.1, favoravel: false },
      { conta: "ICP", valor: 43533.56, percentual: -100.0, favoravel: true },
    ],
    ytd: {
      payrollActual: -4309334.27,
      payrollForecast: -4229289.75,
      desvioValor: -80044.52,
      desvioPercentual: 1.9,
      desvioPorConta: [
        { conta: "Salário", valor: -9455.29, percentual: 0.7, favoravel: false },
        { conta: "Hora Extra", valor: 5606.2, percentual: -1.9, favoravel: true },
        { conta: "Férias", valor: -94756.06, percentual: 45.3, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 127.26, percentual: -0.4, favoravel: true },
        { conta: "Encargos", valor: -13908.46, percentual: 2.0, favoravel: false },
        { conta: "Benefícios", valor: -11191.72, percentual: 0.9, favoravel: false },
        { conta: "ICP", valor: 43533.56, percentual: -14.2, favoravel: true },
      ],
    },
    administrativoGG: {real: 5, orcado: 3, actual: -397423.32, forecast: -91657.47, percentual: 333.6},
    laboratorio: {real: 0, orcado: 3, actual: 0, forecast: -30696.49, percentual: -100.0},
    qualidade: {real: 0, orcado: 0, actual: -18482.12, forecast: 0},
  },
  {
    slug: "distribuicao",
    nome: "Distribuição",
    ordem: "8 de 8",
    imagem: distribuicao,
    tagLeitura: "Desfavorável — puxado por ICP e Férias; headcount em linha com o orçado",
    payrollActual: -790746.61,
    payrollForecast: -626331.53,
    desvioValor: -164415.08,
    desvioPercentual: 26.3,
    headcountReal: 19,
    headcountOrcado: 19,
    headcountDelta: 0,
    desvioPorConta: [
      { conta: "Salário", valor: -1451.41, percentual: 0.5, favoravel: false },
      { conta: "Hora Extra", valor: -311.05, percentual: 15.5, favoravel: false },
      { conta: "Férias", valor: -41034.57, percentual: 525.1, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 5626.83, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 2240.67, percentual: -1.7, favoravel: true },
      { conta: "Benefícios", valor: -24109.41, percentual: 26.1, favoravel: false },
      { conta: "ICP", valor: -105376.14, percentual: 130.4, favoravel: false },
    ],
    ytd: {
      payrollActual: -4410466.9,
      payrollForecast: -4246051.82,
      desvioValor: -164415.08,
      desvioPercentual: 3.9,
      desvioPorConta: [
        { conta: "Salário", valor: -1451.41, percentual: 0.1, favoravel: false },
        { conta: "Hora Extra", valor: -311.05, percentual: 1.7, favoravel: false },
        { conta: "Férias", valor: -41034.57, percentual: 23.3, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 5626.83, percentual: -100.0, favoravel: true },
        { conta: "Encargos", valor: 2240.67, percentual: -0.3, favoravel: true },
        { conta: "Benefícios", valor: -24109.41, percentual: 3.5, favoravel: false },
        { conta: "ICP", valor: -105376.14, percentual: 19.5, favoravel: false },
      ],
    },
    administrativoGG: {real: 3, orcado: 3, actual: -177400.9, forecast: -63148.47, percentual: 180.9},
  },
];

/** Ordena as unidades pela sequência oficial do relatório (1 de 8 … 8 de 8). */
export const unidadesOrdenadas = [...unidades].sort(
  (a, b) => parseInt(a.ordem, 10) - parseInt(b.ordem, 10),
);

export function getUnidade(slug: string) {
  return unidades.find((u) => u.slug === slug);
}

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
