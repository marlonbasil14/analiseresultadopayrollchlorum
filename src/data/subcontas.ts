export type SubConta = { conta: string; valor: number };

export type ComposicaoUnidade = {
  actual: Record<string, SubConta[]> | null;
  forecast: Record<string, SubConta[]> | null;
};

export const composicaoPorUnidade: Record<string, ComposicaoUnidade> = {
  "igarassu": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -382221.45
        },
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -83181.86
        },
        {
          "conta": "Alimentação e refeitório",
          "valor": -143760.24
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -45500.0
        },
        {
          "conta": "Auxilio Educação",
          "valor": -32531.71
        },
        {
          "conta": "Conselho de Classe",
          "valor": -17457.88
        },
        {
          "conta": "Previdência Privada",
          "valor": -12938.57
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -6616.34
        },
        {
          "conta": "Auxílio Creche",
          "valor": -2400.0
        },
        {
          "conta": "Academia",
          "valor": -210.07
        },
        {
          "conta": "Lanches e Refeições",
          "valor": 282.16
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": 916.61
        },
        {
          "conta": "Vale - Transporte",
          "valor": 1698.45
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -497954.43
        },
        {
          "conta": "FGTS",
          "valor": -140901.91
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -221821.95
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -340390.58
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -335809.1
        },
        {
          "conta": "Participacao Nos Resultados (PLR)",
          "valor": 3940.21
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -1100015.45
        },
        {
          "conta": "13º Salário",
          "valor": -126981.92
        },
        {
          "conta": "Indenizações Trabalhistas",
          "valor": -8195.04
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -436574.57
        },
        {
          "conta": "Previdência Privada",
          "valor": -44951.91
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -43250.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -34600.0
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -6716.14
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -6339.47
        },
        {
          "conta": "Vale - Transporte",
          "valor": -3100.0
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -496050.56
        },
        {
          "conta": "FGTS",
          "valor": -112991.07
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -35737.11
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -33451.72
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -250463.88
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -25189.02
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -1278357.13
        },
        {
          "conta": "13º Salário",
          "valor": -107222.06
        }
      ]
    }
  },
  "solutions": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -256694.79
        },
        {
          "conta": "Alimentação e refeitório",
          "valor": -76186.1
        },
        {
          "conta": "Auxilio Educação",
          "valor": -23624.22
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -7851.29
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": -7400.0
        },
        {
          "conta": "Conselho de Classe",
          "valor": -3078.87
        },
        {
          "conta": "Auxílio Creche",
          "valor": -600.0
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": 0.0
        },
        {
          "conta": "Vale - Transporte",
          "valor": 115.95
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -346439.64
        },
        {
          "conta": "FGTS",
          "valor": -102792.89
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -164902.46
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -37037.99
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -992337.4
        },
        {
          "conta": "13º Salário",
          "valor": -102923.94
        },
        {
          "conta": "Pró labore",
          "valor": -10416.67
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -282083.34
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -87000.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -17400.0
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -9233.43
        },
        {
          "conta": "Vale - Combustível",
          "valor": -4457.5
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -3188.06
        },
        {
          "conta": "Previdência Privada",
          "valor": -573.18
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -485818.75
        },
        {
          "conta": "FGTS",
          "valor": -93129.47
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -32236.26
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -360699.18
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -23212.43
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -1565598.71
        },
        {
          "conta": "13º Salário",
          "valor": -96718.45
        }
      ]
    }
  },
  "bahia": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -83624.86
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": -35688.19
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -32000.0
        },
        {
          "conta": "Auxílio Creche",
          "valor": -1600.0
        },
        {
          "conta": "Alimentação e refeitório",
          "valor": -994.5
        },
        {
          "conta": "Auxilio Educação",
          "valor": -848.33
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -688.19
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -61545.88
        },
        {
          "conta": "FGTS",
          "valor": -19093.25
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -30148.18
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -33743.73
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -142918.42
        },
        {
          "conta": "13º Salário",
          "valor": -18753.18
        },
        {
          "conta": "Abono Salarial",
          "valor": -5309.88
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -79736.67
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -29000.0
        },
        {
          "conta": "Vale - Combustível",
          "valor": -11593.33
        },
        {
          "conta": "Auxílio Educação",
          "valor": -5800.0
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -1062.69
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -721.0
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -58810.28
        },
        {
          "conta": "FGTS",
          "valor": -13797.13
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -4242.09
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -15823.29
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -23182.55
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -3054.61
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -139671.21
        },
        {
          "conta": "13º Salário",
          "valor": -12727.56
        }
      ]
    }
  },
  "codo": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -26456.0
        },
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -20123.62
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": -8902.16
        },
        {
          "conta": "Auxilio Educação",
          "valor": -2368.7
        },
        {
          "conta": "Auxílio Creche",
          "valor": -1200.0
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -497.79
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -34541.83
        },
        {
          "conta": "FGTS",
          "valor": -10311.0
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -20496.77
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -5938.42
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -21805.6
        },
        {
          "conta": "Participacao Nos Resultados (PLR)",
          "valor": -514.73
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -94764.45
        },
        {
          "conta": "13º Salário",
          "valor": -11501.27
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -28169.17
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -24000.0
        },
        {
          "conta": "Vale - Combustível",
          "valor": -8832.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -4800.0
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -879.46
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -492.62
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -38443.55
        },
        {
          "conta": "FGTS",
          "valor": -9257.93
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -2845.62
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -6156.91
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -14881.15
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -2049.05
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -98183.89
        },
        {
          "conta": "13º Salário",
          "valor": -8537.7
        }
      ]
    }
  },
  "distribuicao": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -69715.23
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -20000.0
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": -17450.0
        },
        {
          "conta": "Auxilio Educação",
          "valor": -7086.0
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -1637.62
        },
        {
          "conta": "Auxílio Creche",
          "valor": -600.0
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -97414.36
        },
        {
          "conta": "FGTS",
          "valor": -28960.48
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -48848.82
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -2316.92
        }
      ],
      "ICP": [
        {
          "conta": "Participacao Nos Resultados (PLR)",
          "valor": -186192.88
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -279290.9
        },
        {
          "conta": "13º Salário",
          "valor": -31233.4
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -64991.71
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -19000.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -3800.0
        },
        {
          "conta": "Vale - Combustível",
          "valor": -2250.0
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -1641.49
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -696.24
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -103104.07
        },
        {
          "conta": "FGTS",
          "valor": -25511.44
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -7814.25
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -2005.88
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -80816.74
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -5626.83
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -285627.78
        },
        {
          "conta": "13º Salário",
          "valor": -23445.11
        }
      ]
    }
  },
  "pacatuba": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -51804.13
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -27999.74
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": -23243.29
        },
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -22985.82
        },
        {
          "conta": "Viagens e Estadias",
          "valor": -8438.79
        },
        {
          "conta": "Auxilio Educação",
          "valor": -5693.88
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -1056.05
        },
        {
          "conta": "Auxílio Creche",
          "valor": -590.0
        },
        {
          "conta": "Alimentação e refeitório",
          "valor": -360.0
        },
        {
          "conta": "Combustivel",
          "valor": -324.5
        },
        {
          "conta": "Academia",
          "valor": -68.71
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -60901.52
        },
        {
          "conta": "FGTS",
          "valor": -16328.87
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -31092.58
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -13892.31
        }
      ],
      "ICP": [
        {
          "conta": "Participacao Nos Resultados (PLR)",
          "valor": -44819.87
        },
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -15073.69
        }
      ],
      "Salário": [
        {
          "conta": "Conta Transitória - MOD",
          "valor": -290467.42
        },
        {
          "conta": "Salários e Ordenados",
          "valor": -147862.26
        },
        {
          "conta": "Pró labore",
          "valor": -31000.0
        },
        {
          "conta": "13º Salário",
          "valor": -17191.05
        },
        {
          "conta": "Prêmios e Gratificações",
          "valor": -1849.59
        },
        {
          "conta": "Conta Transitória - MOD Saldo",
          "valor": 290467.42
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -75226.36
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -30000.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -6000.0
        },
        {
          "conta": "Vale - Combustível",
          "valor": -5047.26
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -1135.6
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -1099.33
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -66731.68
        },
        {
          "conta": "FGTS",
          "valor": -14893.26
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -4687.51
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -8661.31
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -40271.97
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -3232.7
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -208805.28
        },
        {
          "conta": "13º Salário",
          "valor": -14063.93
        }
      ]
    }
  },
  "palmeira": {
    "actual": {
      "Benefícios": [
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -283242.1
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -38428.58
        },
        {
          "conta": "Transporte de Funcionários",
          "valor": -4537.08
        },
        {
          "conta": "Assistencia Medica / Odontologica",
          "valor": -3088.92
        },
        {
          "conta": "Auxílio Creche",
          "valor": -400.0
        },
        {
          "conta": "Auxilio Educação",
          "valor": 113937.71
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -50800.85
        },
        {
          "conta": "FGTS",
          "valor": -19651.46
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -55223.37
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -24344.85
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -152362.47
        },
        {
          "conta": "13º Salário",
          "valor": -18355.33
        }
      ]
    },
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -101890.47
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -41000.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -8200.0
        },
        {
          "conta": "Vale - Combustível",
          "valor": -3957.44
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -1502.42
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -1015.61
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -77219.66
        },
        {
          "conta": "FGTS",
          "valor": -18055.2
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -5705.33
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -29125.63
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -31801.35
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -3749.01
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -179768.15
        },
        {
          "conta": "13º Salário",
          "valor": -17117.69
        }
      ]
    }
  },
  "uberlandia": {
    "actual": null,
    "forecast": {
      "Benefícios": [
        {
          "conta": "Assistencia Médica e Odontológica",
          "valor": -101619.52
        },
        {
          "conta": "Vale - Refeições e Cesta básica",
          "valor": -43000.0
        },
        {
          "conta": "Auxílio Educação",
          "valor": -8600.0
        },
        {
          "conta": "Ajuda de Custo",
          "valor": -1575.71
        },
        {
          "conta": "Seguro de Vida em Grupo",
          "valor": -1368.66
        },
        {
          "conta": "Previdência Privada",
          "valor": -563.69
        },
        {
          "conta": "Vale - Transporte",
          "valor": -524.4
        },
        {
          "conta": "Vale - Combustível",
          "valor": -475.52
        }
      ],
      "Encargos": [
        {
          "conta": "INSS",
          "valor": -99232.3
        },
        {
          "conta": "FGTS",
          "valor": -23839.59
        }
      ],
      "Férias": [
        {
          "conta": "Férias",
          "valor": -7321.86
        }
      ],
      "Hora Extra": [
        {
          "conta": "Horas Extras",
          "valor": -23061.21
        }
      ],
      "ICP": [
        {
          "conta": "Participação nos Resultados (PLR)",
          "valor": -43533.56
        }
      ],
      "Rescisão e Aviso Prévio": [
        {
          "conta": "Rescisão e Aviso Prévio",
          "valor": -5136.93
        }
      ],
      "Salário": [
        {
          "conta": "Salários e Ordenados",
          "valor": -245644.05
        },
        {
          "conta": "13º Salário",
          "valor": -21967.77
        }
      ]
    }
  }
};


export function subcontasDe(
  slug: string,
  conta: string,
  lado: "actual" | "forecast",
): SubConta[] | null {
  const unidade = composicaoPorUnidade[slug];
  if (!unidade) return null;
  const bloco = unidade[lado];
  if (!bloco) return null;
  const lista = bloco[conta];
  if (!lista || lista.length === 0) return [];
  return [...lista].sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
}
