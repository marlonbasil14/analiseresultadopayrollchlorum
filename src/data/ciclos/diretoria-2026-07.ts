import type { LinhaDiretoria, ContaDiretoria } from "@/data/diretoria";

export const diretorias: LinhaDiretoria[] = [
  {
    nome: "CEO e Diretoria de Estratégia",
    hcReal: 4,
    hcOrcado: 4,
    realMes: 59761.8,
    orcadoMes: 525254.84,
    realYtd: 605453.85,
    orcadoYtd: 1070946.89,
  },
  {
    nome: "Diretoria de Operações",
    hcReal: 2,
    hcOrcado: 2,
    realMes: 23934.5,
    orcadoMes: 61173.2,
    realYtd: 124483.73,
    orcadoYtd: 161722.43,
  },
  {
    nome: "Diretoria de Compras e Logística",
    hcReal: 13,
    hcOrcado: 10,
    realMes: 235255.03,
    orcadoMes: 320565.63,
    realYtd: 1716396.61,
    orcadoYtd: 1801707.21,
  },
  {
    nome: "Diretoria Comercial",
    hcReal: 3,
    hcOrcado: 3,
    realMes: 108335.5,
    orcadoMes: 132403.41,
    realYtd: 749860.62,
    orcadoYtd: 773928.53,
  },
  {
    nome: "Diretoria Financeira",
    hcReal: 31,
    hcOrcado: 38,
    realMes: 699170.63,
    orcadoMes: 1027794.28,
    realYtd: 4992426.43,
    orcadoYtd: 5321050.08,
  },
  {
    nome: "Diretoria Jurídica",
    hcReal: 5,
    hcOrcado: 6,
    realMes: 178321.58,
    orcadoMes: 262754.07,
    realYtd: 1462004.02,
    orcadoYtd: 1546436.51,
  },
  {
    nome: "Diretoria de Gente e Gestão",
    hcReal: 18,
    hcOrcado: 18,
    realMes: 727819.58,
    orcadoMes: 531911.93,
    realYtd: 3835922.1,
    orcadoYtd: 3640014.45,
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
    hcReal: 5,
    hcOrcado: 6,
    realMes: 99571.69,
    orcadoMes: 199491.37,
    realYtd: 1177366.36,
    orcadoYtd: 1277286.04,
  },
];

export const contasDiretoria: ContaDiretoria[] = [
  { conta: "Salário", realMes: 1105678.01, orcadoMes: 1662317.16, realYtd: 7029593.42, orcadoYtd: 7586232.57 },
  { conta: "Hora Extra", realMes: 37037.99, orcadoMes: 0, realYtd: 150947.78, orcadoYtd: 113909.79 },
  { conta: "Férias", realMes: 164902.46, orcadoMes: 32236.26, realYtd: 748468.12, orcadoYtd: 615801.92 },
  {
    conta: "Rescisão e Aviso Prévio",
    realMes: 0,
    orcadoMes: 23212.43,
    realYtd: 21912.84,
    orcadoYtd: 45125.27,
  },
  { conta: "Encargos", realMes: 449232.53, orcadoMes: 578948.22, realYtd: 2683879.08, orcadoYtd: 2813594.77 },
  { conta: "Benefícios", realMes: 375319.32, orcadoMes: 403935.5, realYtd: 2518326.45, orcadoYtd: 2546942.63 },
  { conta: "ICP", realMes: 0, orcadoMes: 360699.18, realYtd: 1510786.03, orcadoYtd: 1871485.21 },
];
