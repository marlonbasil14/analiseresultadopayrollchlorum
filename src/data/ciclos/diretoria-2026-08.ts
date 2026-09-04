import type { LinhaDiretoria, ContaDiretoria } from "@/data/diretoria";

export const diretorias: LinhaDiretoria[] = [
  {
    nome: "CEO e Diretoria de Estratégia",
    hcReal: 3,
    hcOrcado: 4,
    realMes: 287552.01,
    orcadoMes: 534319.14,
    realYtd: 1253689.11,
    orcadoYtd: 1500456.24,
  },
  {
    nome: "Diretoria de Operações",
    hcReal: 2,
    hcOrcado: 2,
    realMes: 109840.92,
    orcadoMes: 61507.84,
    realYtd: 236463.0,
    orcadoYtd: 188129.92,
  },
  {
    nome: "Diretoria de Compras e Logística",
    hcReal: 12,
    hcOrcado: 10,
    realMes: 377040.47,
    orcadoMes: 326312.73,
    realYtd: 2152848.93,
    orcadoYtd: 2102121.19,
  },
  {
    nome: "Diretoria Comercial",
    hcReal: 3,
    hcOrcado: 3,
    realMes: 489140.76,
    orcadoMes: 27468.89,
    realYtd: 1208375.48,
    orcadoYtd: 746703.61,
  },
  {
    nome: "Diretoria Financeira",
    hcReal: 34,
    hcOrcado: 38,
    realMes: 1068832.88,
    orcadoMes: 1047010.48,
    realYtd: 6228999.57,
    orcadoYtd: 6207177.17,
  },
  {
    nome: "Diretoria Jurídica",
    hcReal: 5,
    hcOrcado: 6,
    realMes: 244448.7,
    orcadoMes: 270288.87,
    realYtd: 1754357.82,
    orcadoYtd: 1780197.99,
  },
  {
    nome: "Diretoria de Gente e Gestão",
    hcReal: 17,
    hcOrcado: 18,
    realMes: 586101.29,
    orcadoMes: 544818.47,
    realYtd: 4323681.66,
    orcadoYtd: 4282398.84,
  },
];

/** Linhas fora do total corporativo (projetos / remediação). */
export const diretoriasComplementares: LinhaDiretoria[] = [
  {
    nome: "Remediação",
    hcReal: 0,
    hcOrcado: 0,
    realMes: 0,
    orcadoMes: 0,
    realYtd: 0,
    orcadoYtd: 0,
  },
  {
    nome: "Engenharia/Projetos",
    hcReal: 4,
    hcOrcado: 6,
    realMes: 213714.0,
    orcadoMes: 203829.89,
    realYtd: 1424386.89,
    orcadoYtd: 1414502.78,
  },
];

export const contasDiretoria: ContaDiretoria[] = [
  { conta: "Salário", realMes: 1275195.38, orcadoMes: 1599107.91, realYtd: 8304788.8, orcadoYtd: 8628701.33 },
  { conta: "Hora Extra", realMes: 32563.62, orcadoMes: 0, realYtd: 183511.4, orcadoYtd: 150947.78 },
  { conta: "Férias", realMes: 373335.68, orcadoMes: 30649.36, realYtd: 1121803.8, orcadoYtd: 779117.48 },
  { conta: "Rescisão e Aviso Prévio", realMes: 0, orcadoMes: 22069.75, realYtd: 21912.84, orcadoYtd: 43982.59 },
  { conta: "Encargos", realMes: 572043.98, orcadoMes: 552695.24, realYtd: 3255923.06, orcadoYtd: 3236574.32 },
  { conta: "Benefícios", realMes: 389559.13, orcadoMes: 450334.87, realYtd: 2905430.2, orcadoYtd: 2966205.94 },
  { conta: "ICP", realMes: 733973.24, orcadoMes: 360699.18, realYtd: 2789432.36, orcadoYtd: 2416158.3 },
];
