import codo from "@/assets/unidade-codo.jpg";
import igarassu from "@/assets/unidade-igarassu.jpg";
import pacatuba from "@/assets/unidade-pacatuba.jpg";
import palmeira from "@/assets/unidade-palmeira.jpg";
import bahia from "@/assets/unidade-bahia.jpg";
import uberlandia from "@/assets/unidade-uberlandia.jpg";
import solutions from "@/assets/unidade-solutions.jpg";
import { url as distribuicao } from "@/assets/unidade-distribuicao.png.asset.json";

import type { Unidade } from "@/data/payroll";

export const CICLO = "2026-09";
export const CICLO_LABEL = "Setembro / 2026";

/**
 * Nota metodológica — ciclo Setembro/2026 (MUDANÇA DE CONVENÇÃO DO YTD):
 * a base de Forecast do fechamento de setembro traz Actual apenas até Jun/26 e
 * Forecast original para Jul, Ago e Set. Por isso o desvio YTD deixa de ser
 * idêntico ao desvio do mês (como em julho e agosto) e passa a acumular os desvios
 * de Jul + Ago + Set. Valores conferidos contra a aba "Tela Fechamento Grupo".
 *
 * Headcount: Real = linhas de Base HC Actual com "Cont. HC" = 1 por unidade
 * (inclui Engenharia/Projetos, i.e. "Total com CAPEX"); Orçado = coluna Set da
 * Base HC Forecast. Guaíba segue excluída. Palmeira: a aba "Plantas" do arquivo
 * mostra 36, porque Qualidade/Meio Ambiente (3) e a "Nova Posição" (1) não são
 * capturados no quadro por área; a base e o consolidado por diretoria dão 40.
 *
 * Hora Extra (v2 do arquivo): as horas extras que na primeira versão estavam
 * lançadas dentro de "Salário" foram reclassificadas para a conta Hora Extra.
 * O total do grupo praticamente não muda (-R$ 8,55 mi → -R$ 8,57 mi); muda a
 * composição por conta (Salário menos desfavorável, Hora Extra visível).
 */
export const unidadesSetembro: Unidade[] = [
  {
    slug: "igarassu",
    nome: "Igarassu",
    ordem: "4 de 8",
    imagem: igarassu,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -2756186.84,
    payrollForecast: -3041538.01,
    desvioValor: 285351.17,
    desvioPercentual: -9.4,
    headcountReal: 167,
    headcountOrcado: 172,
    headcountDelta: -5,
    desvioPorConta: [
      { conta: "Salário", valor: 278167.12, percentual: -20.1, favoravel: true },
      { conta: "Hora Extra", valor: -67467.45, percentual: 201.7, favoravel: false },
      { conta: "Férias", valor: -94919.75, percentual: 266.3, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: -17672.01, percentual: 70.3, favoravel: false },
      { conta: "Encargos", valor: 145824.39, percentual: -24.0, favoravel: true },
      { conta: "Benefícios", valor: -45098.34, percentual: 6.4, favoravel: false },
      { conta: "ICP", valor: 86517.21, percentual: -34.5, favoravel: true },
    ],
    ytd: {
      payrollActual: -29755402.74,
      payrollForecast: -29300466.0,
      desvioValor: -454936.74,
      desvioPercentual: 1.6,
      desvioPorConta: [
        { conta: "Salário", valor: 540910.51, percentual: -5.0, favoravel: true },
        { conta: "Hora Extra", valor: -513083.55, percentual: 42.6, favoravel: false },
        { conta: "Férias", valor: -490534.61, percentual: 33.2, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 41308.28, percentual: -20.9, favoravel: true },
        { conta: "Encargos", valor: 136978.05, percentual: -2.1, favoravel: true },
        { conta: "Benefícios", valor: -191379.46, percentual: 2.8, favoravel: false },
        { conta: "ICP", valor: 20864.04, percentual: -0.9, favoravel: true },
      ],
    },
  },
  {
    slug: "solutions",
    nome: "Solutions",
    ordem: "7 de 8",
    imagem: solutions,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -2176680.27,
    payrollForecast: -3108822.5,
    desvioValor: 932142.23,
    desvioPercentual: -30.0,
    headcountReal: 81,
    headcountOrcado: 85,
    headcountDelta: -4,
    desvioPorConta: [
      { conta: "Salário", valor: 598595.03, percentual: -36.0, favoravel: true },
      { conta: "Hora Extra", valor: -28961.36, percentual: 100.0, favoravel: false },
      { conta: "Férias", valor: 55862.03, percentual: -173.6, favoravel: true },
      { conta: "Rescisão e Aviso Prévio", valor: 23173.23, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 199957.06, percentual: -34.5, favoravel: true },
      { conta: "Benefícios", valor: 7040.17, percentual: -1.6, favoravel: true },
      { conta: "ICP", valor: 76476.07, percentual: -21.2, favoravel: true },
    ],
    ytd: {
      payrollActual: -20759482.73,
      payrollForecast: -21717470.96,
      desvioValor: 957988.23,
      desvioPercentual: -4.4,
      desvioPorConta: [
        { conta: "Salário", valor: 1479146.71, percentual: -13.6, favoravel: true },
        { conta: "Hora Extra", valor: -98562.97, percentual: 86.5, favoravel: false },
        { conta: "Férias", valor: -419490.49, percentual: 61.8, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 68455.41, percentual: -75.8, favoravel: true },
        { conta: "Encargos", valor: 310324.02, percentual: -7.9, favoravel: true },
        { conta: "Benefícios", valor: 98887.47, percentual: -2.9, favoravel: true },
        { conta: "ICP", valor: -480771.91, percentual: 18.5, favoravel: false },
      ],
    },
  },
  {
    slug: "bahia",
    nome: "Bahia",
    ordem: "5 de 8",
    observacao: "Unidade de São Sebastião do Passé — BA",
    imagem: bahia,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -646628.04,
    payrollForecast: -421289.86,
    desvioValor: -225338.18,
    desvioPercentual: 53.5,
    headcountReal: 34,
    headcountOrcado: 29,
    headcountDelta: 5,
    desvioPorConta: [
      { conta: "Salário", valor: -38404.38, percentual: 25.2, favoravel: false },
      { conta: "Hora Extra", valor: -8589.63, percentual: 54.3, favoravel: false },
      { conta: "Férias", valor: -100397.23, percentual: 2366.7, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: -15556.05, percentual: 509.3, favoravel: false },
      { conta: "Encargos", valor: -37222.38, percentual: 51.2, favoravel: false },
      { conta: "Benefícios", valor: -33757.48, percentual: 22.5, favoravel: false },
      { conta: "ICP", valor: 8588.97, percentual: -37.0, favoravel: true },
    ],
    ytd: {
      payrollActual: -4109909.25,
      payrollForecast: -3675006.14,
      desvioValor: -434903.11,
      desvioPercentual: 11.8,
      desvioPorConta: [
        { conta: "Salário", valor: -78651.09, percentual: 6.4, favoravel: false },
        { conta: "Hora Extra", valor: -44792.26, percentual: 19.3, favoravel: false },
        { conta: "Férias", valor: -142132.02, percentual: 113.1, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: -15535.0, percentual: 46.5, favoravel: false },
        { conta: "Encargos", valor: -53182.12, percentual: 9.0, favoravel: false },
        { conta: "Benefícios", valor: -91524.37, percentual: 6.9, favoravel: false },
        { conta: "ICP", valor: -9086.27, percentual: 6.9, favoravel: false },
      ],
    },
  },
  {
    slug: "codo",
    nome: "Codó",
    ordem: "1 de 8",
    imagem: codo,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -253372.15,
    payrollForecast: -253650.94,
    desvioValor: 278.79,
    desvioPercentual: -0.1,
    headcountReal: 25,
    headcountOrcado: 24,
    headcountDelta: 1,
    desvioPorConta: [
      { conta: "Salário", valor: -11014.46, percentual: 10.3, favoravel: false },
      { conta: "Hora Extra", valor: 2209.54, percentual: -35.9, favoravel: true },
      { conta: "Férias", valor: -8108.94, percentual: 285.0, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 2049.05, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 1841.73, percentual: -3.9, favoravel: true },
      { conta: "Benefícios", valor: 22680.33, percentual: -31.0, favoravel: true },
      { conta: "ICP", valor: -9378.45, percentual: 63.0, favoravel: false },
    ],
    ytd: {
      payrollActual: -2264256.95,
      payrollForecast: -2254158.38,
      desvioValor: -10098.57,
      desvioPercentual: 0.4,
      desvioPorConta: [
        { conta: "Salário", valor: -10998.05, percentual: 1.2, favoravel: false },
        { conta: "Hora Extra", valor: -4060.09, percentual: 4.6, favoravel: false },
        { conta: "Férias", valor: -35956.81, percentual: 45.3, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 6147.14, percentual: -57.8, favoravel: true },
        { conta: "Encargos", valor: 7037.5, percentual: -1.8, favoravel: true },
        { conta: "Benefícios", valor: 45134.82, percentual: -6.9, favoravel: true },
        { conta: "ICP", valor: -17403.09, percentual: 12.8, favoravel: false },
      ],
    },
  },
  {
    slug: "pacatuba",
    nome: "Pacatuba",
    ordem: "2 de 8",
    imagem: pacatuba,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -493036.0,
    payrollForecast: -483073.82,
    desvioValor: -9962.18,
    desvioPercentual: 2.1,
    headcountReal: 29,
    headcountOrcado: 29,
    headcountDelta: 0,
    desvioPorConta: [
      { conta: "Salário", valor: 30036.41, percentual: -14.0, favoravel: true },
      { conta: "Hora Extra", valor: 838.87, percentual: -9.7, favoravel: true },
      { conta: "Férias", valor: -33115.64, percentual: 740.7, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 3076.88, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 1153.51, percentual: -1.5, favoravel: true },
      { conta: "Benefícios", valor: -23416.35, percentual: 17.4, favoravel: false },
      { conta: "ICP", valor: 11464.13, percentual: -28.5, favoravel: true },
    ],
    ytd: {
      payrollActual: -4145573.83,
      payrollForecast: -4096660.65,
      desvioValor: -48913.18,
      desvioPercentual: 1.2,
      desvioPorConta: [
        { conta: "Salário", valor: 82963.18, percentual: -4.7, favoravel: true },
        { conta: "Hora Extra", valor: -15279.19, percentual: 16.1, favoravel: false },
        { conta: "Férias", valor: -73406.51, percentual: 41.1, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 9058.67, percentual: -96.5, favoravel: true },
        { conta: "Encargos", valor: 9874.48, percentual: -1.5, favoravel: true },
        { conta: "Benefícios", valor: -50747.5, percentual: 4.3, favoravel: false },
        { conta: "ICP", valor: -11376.31, percentual: 5.4, favoravel: false },
      ],
    },
  },
  {
    slug: "palmeira",
    nome: "Palmeira",
    ordem: "3 de 8",
    imagem: palmeira,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -560999.68,
    payrollForecast: -550926.24,
    desvioValor: -10073.44,
    desvioPercentual: 1.8,
    headcountReal: 40,
    headcountOrcado: 41,
    headcountDelta: -1,
    desvioPorConta: [
      { conta: "Salário", valor: 14470.74, percentual: -7.0, favoravel: true },
      { conta: "Hora Extra", valor: -11348.92, percentual: 39.0, favoravel: false },
      { conta: "Férias", valor: -11491.28, percentual: 193.1, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 3906.87, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: 6134.71, percentual: -6.2, favoravel: true },
      { conta: "Benefícios", valor: -29901.76, percentual: 17.2, favoravel: false },
      { conta: "ICP", valor: 18156.22, percentual: -57.1, favoravel: true },
    ],
    ytd: {
      payrollActual: -4147542.4,
      payrollForecast: -4126021.43,
      desvioValor: -21520.97,
      desvioPercentual: 0.5,
      desvioPorConta: [
        { conta: "Salário", valor: 70636.74, percentual: -4.4, favoravel: true },
        { conta: "Hora Extra", valor: -12539.47, percentual: 4.1, favoravel: false },
        { conta: "Férias", valor: -74283.08, percentual: 35.5, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 11562.75, percentual: -13.2, favoravel: true },
        { conta: "Encargos", valor: 50042.32, percentual: -6.5, favoravel: true },
        { conta: "Benefícios", valor: -82806.81, percentual: 9.2, favoravel: false },
        { conta: "ICP", valor: 15866.58, percentual: -6.5, favoravel: true },
      ],
    },
  },
  {
    slug: "uberlandia",
    nome: "Uberlândia",
    ordem: "6 de 8",
    imagem: uberlandia,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -838612.66,
    payrollForecast: -642437.86,
    desvioValor: -196174.8,
    desvioPercentual: 30.5,
    headcountReal: 40,
    headcountOrcado: 43,
    headcountDelta: -3,
    desvioPorConta: [
      { conta: "Salário", valor: -4241.0, percentual: 1.6, favoravel: false },
      { conta: "Hora Extra", valor: -83868.13, percentual: 363.7, favoravel: false },
      { conta: "Férias", valor: -28253.51, percentual: 385.9, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: -2426.4, percentual: 47.2, favoravel: false },
      { conta: "Encargos", valor: -15169.16, percentual: 12.3, favoravel: false },
      { conta: "Benefícios", valor: -44078.93, percentual: 25.5, favoravel: false },
      { conta: "ICP", valor: -18137.66, percentual: 41.7, favoravel: false },
    ],
    ytd: {
      payrollActual: -5781286.9,
      payrollForecast: -5514165.47,
      desvioValor: -267121.43,
      desvioPercentual: 4.8,
      desvioPorConta: [
        { conta: "Salário", valor: -495.65, percentual: 0.0, favoravel: false },
        { conta: "Hora Extra", valor: -81595.73, percentual: 24.4, favoravel: false },
        { conta: "Férias", valor: -148102.66, percentual: 66.1, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 4513.98, percentual: -10.0, favoravel: true },
        { conta: "Encargos", valor: -11087.64, percentual: 1.2, favoravel: false },
        { conta: "Benefícios", valor: 4972.57, percentual: -0.3, favoravel: true },
        { conta: "ICP", valor: -35326.29, percentual: 9.0, favoravel: false },
      ],
    },
  },
  {
    slug: "distribuicao",
    nome: "Distribuição",
    ordem: "8 de 8",
    imagem: distribuicao,
    tagLeitura: "Análise prévia — aguardando parecer da BP (ciclo Setembro/2026)",
    payrollActual: -848688.49,
    payrollForecast: -665992.31,
    desvioValor: -182696.18,
    desvioPercentual: 27.4,
    headcountReal: 19,
    headcountOrcado: 19,
    headcountDelta: 0,
    desvioPorConta: [
      { conta: "Salário", valor: -28893.71, percentual: 8.9, favoravel: false },
      { conta: "Hora Extra", valor: -1939.43, percentual: 96.7, favoravel: false },
      { conta: "Férias", valor: -147254.68, percentual: 1795.3, favoravel: false },
      { conta: "Rescisão e Aviso Prévio", valor: 5906.16, percentual: -100.0, favoravel: true },
      { conta: "Encargos", valor: -38518.62, percentual: 28.6, favoravel: false },
      { conta: "Benefícios", valor: -19949.36, percentual: 18.2, favoravel: false },
      { conta: "ICP", valor: 47953.46, percentual: -59.3, favoravel: true },
    ],
    ytd: {
      payrollActual: -5731519.85,
      payrollForecast: -5555562.64,
      desvioValor: -175957.21,
      desvioPercentual: 3.2,
      desvioPorConta: [
        { conta: "Salário", valor: 77600.25, percentual: -2.9, favoravel: true },
        { conta: "Hora Extra", valor: -4469.32, percentual: 19.8, favoravel: false },
        { conta: "Férias", valor: -86138.84, percentual: 44.8, favoravel: false },
        { conta: "Rescisão e Aviso Prévio", valor: 17159.81, percentual: -100.0, favoravel: true },
        { conta: "Encargos", valor: 53294.2, percentual: -5.1, favoravel: true },
        { conta: "Benefícios", valor: -70604.48, percentual: 7.7, favoravel: false },
        { conta: "ICP", valor: -162798.83, percentual: 23.2, favoravel: false },
      ],
    },
  },
];

export const unidades = unidadesSetembro;
