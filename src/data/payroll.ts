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

export type DadosParciais = {
  hcAdmReal?: number;
  hcAdmOrcado?: number;
  hcAdmDelta?: string;
  desvioPayrollPercentual?: number;
  leitura?: string;
  qualidadeCustoRealSemOrcamento?: number;
  feriasActual?: number;
  feriasForecast?: number;
  feriasDesvioPercentual?: number;
  icpZerado?: boolean;
};

export type Unidade = {
  slug: string;
  nome: string;
  ordem: string;
  observacao?: string;
  imagem: string;
  tagLeitura: string;
  payrollActual?: number;
  payrollForecast?: number;
  desvioValor?: number;
  desvioPercentual?: number;
  headcountReal?: number;
  headcountOrcado?: number;
  headcountDelta?: number;
  desvioPorConta?: DesvioConta[];
  leituraTexto?: string;
  dadosParciais?: DadosParciais;
  statusDados: "completo" | "parcial";
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

/** Classificação automática do tipo de efeito (Cartilha, seção 3 a 6). */
export function classificarEfeito(conta: string): EfeitoTag {
  if (["Férias", "Rescisão e Aviso Prévio", "ICP"].includes(conta)) return "calendario";
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
    slug: "codo",
    nome: "Codó",
    ordem: "1 de 8",
    imagem: codo,
    tagLeitura: "100% do desvio é custo alocado, não headcount",
    statusDados: "parcial",
    dadosParciais: {
      hcAdmReal: 1,
      hcAdmOrcado: 1,
      hcAdmDelta: "0%",
      desvioPayrollPercentual: 203,
      leitura: "100% do desvio é custo alocado, não headcount",
      qualidadeCustoRealSemOrcamento: 26000,
    },
  },
  {
    slug: "igarassu",
    nome: "Igarassu",
    ordem: "4 de 8",
    imagem: igarassu,
    tagLeitura: "Predominantemente operacional — real, não mapeamento",
    statusDados: "completo",
    payrollActual: -3492051,
    payrollForecast: -2914995,
    desvioValor: -577056,
    desvioPercentual: 19.8,
    headcountReal: 176,
    headcountOrcado: 164,
    headcountDelta: 12,
    desvioPorConta: [
      { conta: "Salário", valor: 150387, percentual: -10.9, favoravel: true },
      { conta: "Hora Extra", valor: -306939, percentual: 917.6, favoravel: false },
      { conta: "Férias", valor: -186085, percentual: 520.7, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 25189, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: -29815, percentual: 4.9, favoravel: false },
      { conta: "Benefícios", valor: -148389, percentual: 25.8, favoravel: false },
      { conta: "ICP", valor: -81405, percentual: 32.5, favoravel: false },
    ],
    leituraTexto:
      "À primeira vista parece contraditório — mais gente e, ainda assim, muito mais hora extra. A leitura correta é: o quadro cresceu em áreas administrativas e de segurança, não necessariamente nas posições operacionais que geram a pressão de turno, então a fábrica seguiu comprando hora extra para cobrir a operação contínua, ao mesmo tempo em que outras áreas cresceram acima do plano.",
  },
  {
    slug: "pacatuba",
    nome: "Pacatuba",
    ordem: "2 de 8",
    imagem: pacatuba,
    tagLeitura: "Mesma direção, magnitude menor",
    statusDados: "parcial",
    dadosParciais: {
      hcAdmReal: 5,
      hcAdmOrcado: 5,
      hcAdmDelta: "0%",
      desvioPayrollPercentual: 30,
      leitura: "Mesma direção, magnitude menor",
      qualidadeCustoRealSemOrcamento: 26000,
    },
  },
  {
    slug: "palmeira",
    nome: "Palmeira",
    ordem: "3 de 8",
    imagem: palmeira,
    tagLeitura: "Gap de ~19x entre custo e headcount",
    statusDados: "parcial",
    dadosParciais: {
      hcAdmReal: 3,
      hcAdmOrcado: 2,
      hcAdmDelta: "+50%",
      desvioPayrollPercentual: 945,
      leitura: "Gap de ~19x entre custo e headcount",
      feriasActual: 55200,
      feriasForecast: 5700,
      feriasDesvioPercentual: 868,
      icpZerado: true,
    },
  },
  {
    slug: "bahia",
    nome: "Bahia",
    ordem: "5 de 8",
    observacao: "Unidade de São Sebastião do Passé — BA",
    imagem: bahia,
    tagLeitura: "Gap de ~3,4x entre custo e headcount",
    statusDados: "parcial",
    dadosParciais: {
      hcAdmReal: 5,
      hcAdmOrcado: 3,
      hcAdmDelta: "+67%",
      desvioPayrollPercentual: 227,
      leitura: "Gap de ~3,4x",
      feriasActual: 30100,
      feriasForecast: 4200,
      feriasDesvioPercentual: 611,
      icpZerado: true,
    },
  },
  {
    slug: "uberlandia",
    nome: "Uberlândia",
    ordem: "6 de 8",
    imagem: uberlandia,
    tagLeitura: "Gap de ~5x entre custo e headcount",
    statusDados: "parcial",
    dadosParciais: {
      hcAdmReal: 5,
      hcAdmOrcado: 3,
      hcAdmDelta: "+67%",
      desvioPayrollPercentual: 334,
      leitura: "Gap de ~5x",
      feriasActual: 102100,
      feriasForecast: 7300,
      feriasDesvioPercentual: 1294,
    },
  },
  {
    slug: "solutions",
    nome: "Solutions",
    ordem: "7 de 8",
    imagem: solutions,
    tagLeitura: "Favorável no total, mas com efeito de timing + G&G embutido",
    statusDados: "completo",
    payrollActual: -2132170,
    payrollForecast: -3061349,
    desvioValor: 929178,
    desvioPercentual: -30.4,
    headcountReal: 76,
    headcountOrcado: 81,
    headcountDelta: -5,
    desvioPorConta: [
      { conta: "Salário", valor: 556639, percentual: -33.5, favoravel: true },
      { conta: "Hora Extra", valor: -37038, percentual: 0.0, favoravel: false },
      { conta: "Férias", valor: -132666, percentual: 411.5, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 23212, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 129716, percentual: -22.4, favoravel: true },
      { conta: "Benefícios", valor: 28616, percentual: -7.1, favoravel: true },
      { conta: "ICP", valor: 360699, percentual: -100.0, favoravel: true },
    ],
    leituraTexto:
      "Unidade favorável no total, com Salário e Encargos abaixo do orçado por conta do quadro cinco pessoas menor que o planejado. Parte relevante do resultado, porém, é efeito de timing: ICP e Rescisão não tiveram lançamento no mês, enquanto Férias concentrou gozo efetivo. Some-se a isso o custo corporativo de Gente & Gestão alocado em um único centro de custo, que distorce a leitura por área.",
  },
  {
    slug: "distribuicao",
    nome: "Distribuição",
    ordem: "8 de 8",
    imagem: distribuicao,
    tagLeitura: "100% do desvio é custo alocado, não headcount",
    statusDados: "parcial",
    dadosParciais: {
      hcAdmReal: 3,
      hcAdmOrcado: 3,
      hcAdmDelta: "0%",
      desvioPayrollPercentual: 181,
      leitura: "100% do desvio é custo alocado, não headcount",
    },
  },
];

export function getUnidade(slug: string) {
  return unidades.find((u) => u.slug === slug);
}

/** Desvio % resumido usado nos cards e no consolidado. */
export function desvioResumo(u: Unidade) {
  if (u.desvioPercentual !== undefined) return u.desvioPercentual;
  return u.dadosParciais?.desvioPayrollPercentual;
}

export function isFavoravel(u: Unidade) {
  const d = desvioResumo(u);
  if (d === undefined) return undefined;
  return d < 0;
}
