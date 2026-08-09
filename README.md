# Payroll Insights Hub

# PROMPT PARA O LOVABLE
## Ambiente: "Payroll Intelligence" — Chlorum Solutions | Gente & Remuneração

Cole o conteúdo abaixo diretamente no Lovable. Ele está estruturado em blocos que podem ser enviados em sequência (visão geral → design system → telas → dados → funcionalidades) caso você prefira construir por etapas, ou como prompt único para um primeiro scaffold completo.

---

## 1. VISÃO GERAL DO PRODUTO

Construa um web app interno chamado **"Payroll Intelligence"** para a área **Gente & Remuneração** da **Chlorum Solutions** (indústria de cloro-álcalis com plantas no Brasil, Uruguai e EUA).

**Propósito:** substituir a leitura manual de PDFs mensais de "Actual vs. Forecast" de payroll por um ambiente navegável, visual, que:
1. Mostra o resultado orçamentário (real x orçado) de cada unidade de negócio;
2. Ensina o time (BPs e lideranças) a interpretar desvios com metodologia própria, via uma "Cartilha" interativa;
3. Serve como ponto único de entrada para o material de referência do ciclo (incluindo uma videoaula/animação hospedada no Teams).

**Usuário-alvo:** Business Partners de RH, lideranças operacionais das unidades, CFO e diretoria — perfil executivo, pouco tempo, precisa de leitura rápida mas com profundidade disponível sob demanda (camadas: visão geral → detalhe → causa-raiz).

**Ciclo de referência inicial:** Julho / 2026. O produto deve ser desenhado para receber novos ciclos mensais (estrutura de dados por `unidade + mês/ano`), não apenas o mês de julho.

---

## 2. IDENTIDADE VISUAL / DESIGN SYSTEM

Herdar a identidade da marca **Chlorum Solutions**, visível no material de referência:

- **Cor de fundo institucional:** azul-marinho escuro profundo (aprox. `#152238` a `#1A2740`) — usado nas capas e telas de transição.
- **Cor de destaque / marca:** azul claro (aprox. `#4A90D2` a `#5FA8E0`) — usado no logotipo (gota estilizada no "O" de CHLORUM), nos "eyebrows" (rótulos pequenos em caixa alta acima dos títulos) e em elementos interativos.
- **Fundo de conteúdo:** branco/off-white para telas de dados e leitura (alto contraste, estilo "relatório executivo").
- **Semântica de desvio (crítica — manter consistente em todo o app):**
  - **Verde** = desvio favorável (economia vs. orçado)
  - **Vermelho** = desvio desfavorável (estouro vs. orçado)
- **Tipografia:** sans-serif geométrica, títulos em negrito grande, textos de apoio em cinza médio, números grandes e tabulares (estilo dashboard financeiro).
- **Padrão de card de KPI:** 4 cards lado a lado (Payroll Actual / Payroll Forecast / Desvio / Headcount Real-Orç.), como no relatório original.
- **Padrão de barra de desvio:** barra horizontal preenchida proporcionalmente, verde ou vermelha, com valor em R$ e % ao lado — replicar exatamente o estilo das páginas "Desvio por conta" do relatório.
- **Tags de leitura:** badge arredondado com frase curta de diagnóstico da unidade (ex.: "Predominantemente operacional — real, não mapeamento"; "Favorável no total, mas com efeito de timing + G&G embutido").

Use shadcn/ui + Tailwind. Modo claro como padrão; dark mode opcional usando o azul-marinho institucional como base.

---

## 3. ARQUITETURA DE INFORMAÇÃO

```
/ (HERO / Home)
├── /unidade/[slug]        → 8 telas de unidade (parallax + dados)
├── /cartilha               → Guia interativo "Payroll — Actual vs. Forecast"
│   ├── #01-por-que-existe
│   ├── #02-mapa-das-contas
│   ├── #03-efeito-dominó
│   ├── #04-fantasmas-do-calendario
│   ├── #05-enderecos-trocados
│   ├── #06-caso-gente-e-gestao
│   ├── #07-roteiro-6-perguntas
│   └── #08-tabela-referencia-rapida
├── /consolidado             → visão agregada das 8 unidades (sugestão — ver seção 9)
```

---

## 4. TELA HERO (HOME)

Layout tipo capa institucional (fundo azul-marinho, replicando a capa do PDF "Relatório de Análise de Desvios Orçamentários de Payroll"):

- Eyebrow: **GENTE & REMUNERAÇÃO**
- Título grande: **Payroll Intelligence**
- Subtítulo: **Análise de Desvios Orçamentários — Actual vs. Forecast**
- Linha de contexto: "Consolidado e por Unidade · Ciclo: Julho / 2026"
- Logotipo Chlorum Solutions no canto superior esquerdo

**Dois botões navegáveis grandes, lado a lado, centrais na dobra:**

1. **Botão 1 — "Assistir à visão geral animada"**
   Abre em nova aba o link do Teams:
   `https://teams.microsoft.com/l/message/19:4d0de316-0dba-446f-8b3e-972bb1622989_d59a099b-91af-4b87-8871-594af74dd422@unq.gbl.spaces/1786029882842?context=%7B%22contextType%22%3A%22chat%22%7D`
   Ícone de play. Microcopy abaixo: "Vídeo explicativo do ciclo de julho — Microsoft Teams".

2. **Botão 2 — "Abrir a Cartilha de Leitura Orçamentária"**
   Navega internamente para `/cartilha`.
   Ícone de livro. Microcopy abaixo: "Guia prático para investigar e explicar desvios, em 8 passos".

Abaixo dos botões: grid de 8 cards, um por unidade (Codó, Igarassu, Pacatuba, Palmeira, Bahia, Uberlândia, Distribuição, Solutions), cada card com foto de fundo (uso do asset PARALLAX da unidade), nome, e badge de status resumido (favorável/desfavorável e %). Clique leva para `/unidade/[slug]`.

---

## 5. TELAS DE UNIDADE (TEMPLATE)

Cada unidade usa o **mesmo template**, populado por dados próprios.

**Estrutura da tela, de cima para baixo:**

1. **Hero com efeito parallax**: a foto identificada da unidade (asset nomeado — ver seção 8) ocupa o topo em full-width, com scroll parallax (a imagem se move mais devagar que o conteúdo). Overlay escuro gradiente na base para legibilidade do texto sobreposto.
   - Sobre a imagem: nome da unidade em destaque, "Unidade X de 8", período ("Julho / 2026"), e o badge de leitura/diagnóstico daquela unidade.
   - Para a unidade **Solutions**, usar o asset `Chlorum_Solutions.png` como imagem parallax (conforme instrução — representa a tela corporativa/Solutions do orçamento).

2. **Faixa de KPIs** (4 cards): Payroll Actual, Payroll Forecast, Desvio (R$ e %), Headcount (Real/Orç., com delta).

3. **Bloco "Desvio por conta"**: as 7 contas (Salário, Hora Extra, Férias, Rescisão e Aviso Prévio, Encargos, Benefícios, ICP) em barras horizontais coloridas (verde/vermelho), com valor R$ e variação %, ordenadas na mesma sequência do relatório original.

4. **Bloco "Leitura da unidade"** (quando houver texto de análise no material — ex. Igarassu e Solutions têm parágrafos explicativos completos; demais unidades exibem os pontos disponíveis do material, ver seção 8): reproduzir o texto analítico tal como no PDF.

5. **CTA de rodapé**: link para `/cartilha#07-roteiro-6-perguntas` — "Antes de escalar essa dúvida, rode o roteiro de 6 perguntas".

---

## 6. TELA DA CARTILHA (`/cartilha`)

Reproduzir a **Cartilha de Leitura Orçamentária "Payroll — Actual vs. Forecast"** como um guia navegável (sumário lateral fixo + scroll ou stepper), não apenas um link externo. Todo o conteúdo abaixo deve estar presente e navegável, preservando os títulos e a numeração originais:

### Capa
- Eyebrow: CARTILHA DE LEITURA ORÇAMENTÁRIA
- Título: **Payroll — Actual vs. Forecast**
- Subtítulo: Guia prático para Business Partners e Lideranças de Negócio
- Rodapé: Gente & Remuneração | Chlorum Solutions · Ciclo de referência: Julho / 2026

### Sumário (8 seções)
01. Por que esta cartilha existe
02. O mapa das contas: o que cada grupo contém
03. A cadeia de efeito dominó: do headcount ao resultado
04. Os "fantasmas do calendário": desvios que não são desvios
05. "Endereços trocados": reclassificação sem espelho no orçamento
06. O caso Gente & Gestão: custo corporativo em um único endereço
07. Passo a passo: como analisar uma linha de desvio
08. Tabela de referência rápida

### 01 · Por que esta cartilha existe
**A pergunta "por quê?" costuma ter uma causa técnica identificável**

Todo mês, cada Diretoria recebe uma planilha com o resultado do orçamento de payroll: o que foi realizado (Actual) contra o que estava previsto (Forecast). Quando os números não batem, a pergunta natural do líder de negócio é "por quê?" — e essa pergunta costuma ser respondida de forma genérica ("o custo de pessoal subiu"), quando na verdade existe uma causa técnica identificável por trás de praticamente todo desvio.

Esta cartilha traduz a lógica contábil e orçamentária de payroll em uma linguagem simples, para que BPs e líderes consigam, sozinhos, chegar à causa-raiz de um desvio antes de escalar a dúvida para Gente & Remuneração. Ela não substitui a análise linha a linha — ela dá o mapa para fazer essa análise com método.

### 02 · O mapa das contas
**Sete famílias gerenciais escondem dezenas de contas SAP**

O relatório agrupa dezenas de contas contábeis (SAP) em 7 "famílias" gerenciais. Antes de investigar um desvio, é preciso saber o que mora dentro de cada família — porque o mesmo evento (uma admissão, uma demissão, um mês de forte produção) pode aparecer simultaneamente em três ou quatro delas.

Tabela (renderizar como tabela de 3 colunas: **Grupo | O que inclui | Comportamento típico**):

| Grupo | O que inclui | Comportamento típico |
|---|---|---|
| Salário | Salários e ordenados, pró-labore, 13º salário, prêmios e gratificações, abono salarial, conta transitória de MOD, (-) capitalização de projetos | Varia quase 1:1 com headcount; distorções vêm de reajustes, promoções ou erro de rateio entre CCs |
| Hora Extra | Horas extras e adicionais correlatos | Pressão de demanda operacional; sobe quando falta gente ou quando há pico de produção/manutenção |
| Férias | Provisão e pagamento de férias | Fortemente sazonal — não é mensal linear; concentra-se nos meses de gozo efetivo |
| Rescisão e Aviso Prévio | Verbas rescisórias e aviso prévio indenizado | Evento binário — só aparece no mês em que alguém efetivamente desliga |
| Encargos | INSS, FGTS (inclusive sobre 13º/férias) | Segue Salário + Hora Extra quase automaticamente, pois incide sobre a folha |
| Benefícios | VT, VR/refeição, assistência médica/odontológica, seguro de vida, previdência privada, auxílio educação, uniformes, cursos, combustível, ajuda de custo | Parte varia com headcount (VT, VR); parte é fixa por apólice/contrato (plano de saúde, seguro de vida) |
| ICP | PLR / Participação nos Resultados | Pagamento concentrado 1-2x ao ano — não deve ser lido como "mensal" |

### 03 · A cadeia de efeito dominó
**A maior parte dos desvios reais nasce em um único ponto de partida**

A maior parte dos desvios reais (isto é, não relacionados a timing ou a erro de mapeamento — ver seções 4 e 5) nasce em um único ponto de partida: o headcount realizado é diferente do headcount orçado, ou a intensidade de uso de horas extras foi diferente da prevista. A partir daí, o efeito se propaga em cascata.

**O efeito dominó em 4 passos** (renderizar como 4 cards em sequência/timeline):

- **Passo 1 — Headcount real ≠ headcount orçado:** Mais pessoas do que o orçado (ou pessoas em posições/níveis diferentes do planejado) elevam Salário diretamente; menos pessoas do que o orçado reduzem Salário — mas podem gerar Hora Extra para compensar a lacuna operacional.
- **Passo 2 — Hora Extra absorve o gap operacional:** Quando a produção não pode parar mas o quadro está abaixo do orçado, a empresa "compra" a diferença em horas extras. Isso explica por que Salário pode vir favorável e Hora Extra fortemente desfavorável no mesmo mês, no mesmo CC.
- **Passo 3 — Encargos segue automaticamente:** INSS e FGTS incidem sobre a folha (inclusive sobre horas extras, 13º e férias). Todo desvio em Salário e Hora Extra se replica, proporcionalmente, em Encargos — não é um desvio "novo", é um eco do desvio anterior.
- **Passo 4 — Benefícios per capita reage ao headcount:** Vale-transporte e vale-refeição/alimentação sobem e descem quase linearmente com o número de pessoas ativas no mês. Planos de saúde e seguro de vida reagem com defasagem e podem "atrasar" um ou dois meses em relação à mudança real de headcount.

**Exemplo Igarassu — a leitura correta** (box de destaque):
À primeira vista parece contraditório — mais gente e, ainda assim, muito mais hora extra. A leitura correta é: o quadro cresceu em áreas administrativas e de segurança, não necessariamente nas posições operacionais que geram a pressão de turno, então a fábrica seguiu comprando hora extra para cobrir a operação contínua, ao mesmo tempo em que outras áreas cresceram acima do plano.

O efeito cascata aparece de forma nítida: Encargos em Igarassu veio 4,9% acima do orçado — um desvio proporcionalmente muito menor do que o de Hora Extra, porque Encargos reflete a folha como um todo (Salário + Hora Extra), e Salário isoladamente veio 10,9% favorável.

Destaque numérico: **+4,9%** (Encargos vs. orçado) · **-10,9%** (Salário vs. orçado, favorável)

### 04 · Os "fantasmas do calendário"
**Férias, Rescisão e ICP comparam duas lógicas de tempo diferentes**

Três contas — Férias, Rescisão e Aviso Prévio, e ICP — quase sempre aparecem com variações percentuais gigantescas (300%, 600%, às vezes acima de 1.000%). Antes de tratá-las como problema operacional, é essencial entender a metodologia.

Comparação (2 colunas):
- **Actual:** Registra o caixa: o valor é lançado no mês em que o evento realmente acontece (a pessoa saiu de férias, foi desligada, ou recebeu o PLR).
- **Forecast:** Quando construído como rateio linear de uma provisão anual, distribui o valor esperado igualmente por todos os meses do ano.

**Exemplos reais — Julho/2026** (tabela: Unidade | Conta | Actual | Forecast | Desvio %):

| Unidade | Conta | Actual | Forecast | Desvio % |
|---|---|---|---|---|
| Uberlândia | Férias | R$ 102,1 mil | R$ 7,3 mil | +1.294% |
| Palmeira | Férias | R$ 55,2 mil | R$ 5,7 mil | +868% |
| Bahia | Férias | R$ 30,1 mil | R$ 4,2 mil | +611% |
| Todas as unidades | Rescisão e Aviso Prévio | R$ 0 (na maioria) | provisão mensal | -100% |
| Bahia, Palmeira | ICP | R$ 0 | provisão mensal | -100% |

### 05 · Endereços trocados
**Uma área "esvaziada" e uma área "nova" quase sempre andam juntas**

Um segundo tipo de desvio acontece quando uma pessoa, ou um centro de custo inteiro, muda de área no organograma, mas o orçamento não foi atualizado para acompanhar essa mudança.

- **Laboratório:** 0 pessoas realizadas em quase todas as unidades, apesar de headcount orçado de 2 a 8 pessoas — desvio de -100% em payroll.
- **Qualidade:** Custo real relevante com orçamento zerado nas mesmas unidades — R$ 121 mil em Igarassu, R$ 26 mil em Codó e Pacatuba.

A leitura mais provável: as equipes foram reorganizadas sob um único guarda-chuva de Qualidade/Laboratório e o orçamento manteve a estrutura antiga de centros de custo. O mesmo padrão aparece em Segurança em Igarassu, Palmeira e Uberlândia.

### 06 · O caso Gente & Gestão
**Um problema de mapeamento contábil, não de gestão da área**

O padrão mais recorrente e mais material observado nos oito arquivos de julho é a concentração de custos que, por natureza, pertencem a toda a empresa (plano de saúde, seguro de vida, benefícios corporativos) em um único centro de custo — normalmente classificado como "Administrativo". Isso faz o desvio percentual dessa área explodir mesmo quando o headcount dela está praticamente em linha com o orçado.

A correção correta é técnica: distribuir (ratear) esses custos pelos centros de custo que efetivamente geram a despesa, e não reduzir ou questionar o desempenho da área onde o lançamento está hoje concentrado.

**Evidência — Julho/2026** (tabela: Unidade | HC Adm. Real/Orç. | ΔHC | Desvio Payroll | Leitura):

| Unidade | HC Adm. (Real/Orç.) | Δ HC | Desvio Payroll | Leitura |
|---|---|---|---|---|
| Palmeira | 3 / 2 | +50% | +945% | Gap de ~19x entre custo e headcount |
| Uberlândia | 5 / 3 | +67% | +334% | Gap de ~5x |
| Bahia | 5 / 3 | +67% | +227% | Gap de ~3,4x |
| Codó | 1 / 1 | 0% | +203% | 100% do desvio é custo alocado, não headcount |
| Distribuição | 3 / 3 | 0% | +181% | 100% do desvio é custo alocado, não headcount |
| Pacatuba | 5 / 5 | 0% | +30% | Mesma direção, magnitude menor |

### 07 · Um roteiro de 6 perguntas, nesta ordem
Renderizar como checklist numerado interativo (o usuário pode marcar cada etapa como concluída):

1. O headcount da área bate com o orçado? Compare Actual vs. Forecast de headcount antes de olhar qualquer R$.
2. Essa conta é Férias, Rescisão ou ICP? Se sim, pare e olhe o YTD antes de reagir ao mês isolado.
3. Existe uma área "espelho" com o sinal oposto? Pode ser reclassificação sem espelho no orçamento.
4. O desvio de custo é proporcional ao desvio de headcount? Se não, procure lançamento concentrado ou evento pontual.
5. Encargos e Benefícios se moveram na mesma direção de Salário/Hora Extra? Se sim, é o efeito cascata natural.
6. O que sobra depois de 1 a 5 é o desvio operacional real — hora extra genuína, reajuste não orçado, admissão fora do plano, mudança de mix de cargos.

### 08 · Tabela de referência rápida
Renderizar como tabela única de 3 colunas: **Conta | Pergunta-chave ao investigar | Onde investigar primeiro**

| Conta | Pergunta-chave ao investigar | Onde investigar primeiro |
|---|---|---|
| Salário | Headcount bate? Houve reajuste, promoção ou mudança de nível não orçada? | Aba "per CC" (headcount) + Base HC Actual/Forecast |
| Hora Extra | A produção/manutenção operou acima do plano? Falta gente no operacional? | Base Razão, filtrando conta "Horas Extras" por CC |
| Férias | O mês concentra período de gozo coletivo? Como está o YTD? | Comparar Actual vs. Forecast acumulado (YTD), não o mês isolado |
| Rescisão e Aviso Prévio | Houve desligamento no mês? Estava no plano de headcount? | Base HC Actual (saídas) do mês |
| Encargos | Salário e Hora Extra também desviaram? Na mesma proporção? | Comparação direta com as duas contas anteriores |
| Benefícios | É por cabeça (VT/VR) ou por apólice (saúde/seguro)? Houve reajuste de operadora? | De-para Mapping, para separar benefícios per capita dos fixos |
| ICP | É mês de pagamento de PLR? Como está o YTD? | Calendário de pagamento de PLR da unidade |

### Em resumo
**Um desvio de payroll raramente tem uma causa única**

Três blocos lado a lado:
- **Efeito real:** Headcount, hora extra
- **Efeito de calendário:** Férias, rescisão, PLR
- **Efeito de mapeamento:** Rateio pendente, reclassificação de CC

Texto: "O papel do BP não é explicar o número final — é decompô-lo nessas três camadas antes de levar a conclusão à liderança."

### Próximos passos (capa de fechamento, fundo azul-marinho)
**Antes de escalar uma dúvida para Gente & Remuneração:**
1. Rode o roteiro de 6 perguntas (Seção 7) antes de abrir qualquer chamado.
2. Leve Férias, Rescisão e ICP para o acumulado do ano (YTD) antes de reagir ao mês.
3. Compare sempre o desvio de custo com o desvio de headcount, lado a lado.
4. Escale para Gente & Remuneração apenas o resíduo que sobrar depois desse roteiro.

---

## 7. MODELO DE DADOS (SCHEMA)

Estruture os dados como JSON, permitindo múltiplos ciclos mensais no futuro:

```json
{
  "ciclo": "2026-07",
  "unidades": [
    {
      "slug": "igarassu",
      "nome": "Igarassu",
      "ordem": "4 de 8",
      "imagemParallax": "Igarassu_.png",
      "tagLeitura": "Predominantemente operacional — real, não mapeamento",
      "payrollActual": -3492051,
      "payrollForecast": -2914995,
      "desvioValor": -577056,
      "desvioPercentual": 19.8,
      "headcountReal": 176,
      "headcountOrcado": 164,
      "headcountDelta": 12,
      "desvioPorConta": [
        {"conta": "Salário", "valor": 150387, "percentual": -10.9, "favoravel": true},
        {"conta": "Hora Extra", "valor": -306939, "percentual": 917.6, "favoravel": false},
        {"conta": "Férias", "valor": -186085, "percentual": 520.7, "favoravel": false},
        {"conta": "Rescisão e Aviso Prévio", "valor": 25189, "percentual": -100.0, "favoravel": true},
        {"conta": "Encargos", "valor": -29815, "percentual": 4.9, "favoravel": false},
        {"conta": "Benefícios", "valor": -148389, "percentual": 25.8, "favoravel": false},
        {"conta": "ICP", "valor": -81405, "percentual": 32.5, "favoravel": false}
      ],
      "leituraTexto": "À primeira vista parece contraditório — mais gente e, ainda assim, muito mais hora extra. A leitura correta é: o quadro cresceu em áreas administrativas e de segurança, não necessariamente nas posições operacionais que geram a pressão de turno, então a fábrica seguiu comprando hora extra para cobrir a operação contínua, ao mesmo tempo em que outras áreas cresceram acima do plano."
    },
    {
      "slug": "solutions",
      "nome": "Solutions",
      "ordem": "7 de 8",
      "imagemParallax": "Chlorum_Solutions.png",
      "tagLeitura": "Favorável no total, mas com efeito de timing + G&G embutido",
      "payrollActual": -2132170,
      "payrollForecast": -3061349,
      "desvioValor": 929178,
      "desvioPercentual": -30.4,
      "headcountReal": 76,
      "headcountOrcado": 81,
      "headcountDelta": -5,
      "desvioPorConta": [
        {"conta": "Salário", "valor": 556639, "percentual": -33.5, "favoravel": true},
        {"conta": "Hora Extra", "valor": -37038, "percentual": 0.0, "favoravel": false},
        {"conta": "Férias", "valor": -132666, "percentual": 411.5, "favoravel": false},
        {"conta": "Rescisão e Aviso Prévio", "valor": 23212, "percentual": -100.0, "favoravel": true},
        {"conta": "Encargos", "valor": 129716, "percentual": -22.4, "favoravel": true},
        {"conta": "Benefícios", "valor": 28616, "percentual": -7.1, "favoravel": true},
        {"conta": "ICP", "valor": 360699, "percentual": -100.0, "favoravel": true}
      ]
    },
    {
      "slug": "codo",
      "nome": "Codó",
      "imagemParallax": "Codó.png",
      "dadosParciais": {
        "hcAdmReal": 1, "hcAdmOrcado": 1, "hcAdmDelta": "0%",
        "desvioPayrollPercentual": 203,
        "leitura": "100% do desvio é custo alocado, não headcount",
        "qualidadeCustoRealSemOrcamento": 26000
      },
      "statusDados": "parcial — completar com relatório individual da unidade"
    },
    {
      "slug": "pacatuba",
      "nome": "Pacatuba",
      "imagemParallax": "Pacatuba.png",
      "dadosParciais": {
        "hcAdmReal": 5, "hcAdmOrcado": 5, "hcAdmDelta": "0%",
        "desvioPayrollPercentual": 30,
        "leitura": "Mesma direção, magnitude menor",
        "qualidadeCustoRealSemOrcamento": 26000
      },
      "statusDados": "parcial — completar com relatório individual da unidade"
    },
    {
      "slug": "palmeira",
      "nome": "Palmeira",
      "imagemParallax": "Palmeira.png",
      "dadosParciais": {
        "hcAdmReal": 3, "hcAdmOrcado": 2, "hcAdmDelta": "+50%",
        "desvioPayrollPercentual": 945,
        "leitura": "Gap de ~19x entre custo e headcount",
        "feriasActual": 55200, "feriasForecast": 5700, "feriasDesvioPercentual": 868,
        "icpZerado": true
      },
      "statusDados": "parcial — completar com relatório individual da unidade"
    },
    {
      "slug": "bahia",
      "nome": "Bahia",
      "observacao": "Unidade de São Sebastião do Passé — BA",
      "imagemParallax": "São_Sebastião_do_Passé_.png",
      "dadosParciais": {
        "hcAdmReal": 5, "hcAdmOrcado": 3, "hcAdmDelta": "+67%",
        "desvioPayrollPercentual": 227,
        "leitura": "Gap de ~3,4x",
        "feriasActual": 30100, "feriasForecast": 4200, "feriasDesvioPercentual": 611,
        "icpZerado": true
      },
      "statusDados": "parcial — completar com relatório individual da unidade"
    },
    {
      "slug": "uberlandia",
      "nome": "Uberlândia",
      "imagemParallax": "Uberlandia.png",
      "dadosParciais": {
        "hcAdmReal": 5, "hcAdmOrcado": 3, "hcAdmDelta": "+67%",
        "desvioPayrollPercentual": 334,
        "leitura": "Gap de ~5x",
        "feriasActual": 102100, "feriasForecast": 7300, "feriasDesvioPercentual": 1294
      },
      "statusDados": "parcial — completar com relatório individual da unidade"
    },
    {
      "slug": "distribuicao",
      "nome": "Distribuição",
      "imagemParallax": "distribuição.png",
      "dadosParciais": {
        "hcAdmReal": 3, "hcAdmOrcado": 3, "hcAdmDelta": "0%",
        "desvioPayrollPercentual": 181,
        "leitura": "100% do desvio é custo alocado, não headcount"
      },
      "statusDados": "parcial — completar com relatório individual da unidade"
    }
  ]
}
```

**Importante para o Lovable:** apenas **Igarassu** e **Solutions** têm o breakdown completo das 7 contas no material de origem. As outras 6 unidades (Codó, Pacatuba, Palmeira, Bahia, Uberlândia, Distribuição) têm apenas os pontos de dado específicos citados na Cartilha como exemplos (Férias, headcount administrativo, Qualidade). Construa a tela de unidade para lidar graciosamente com dados parciais: exibir os KPIs disponíveis e um estado "aguardando dados completos do ciclo" para os campos ainda não preenchidos, com um botão/formulário de admin para completar via upload do relatório individual em meses futuros.

---

## 8. MAPEAMENTO DE ASSETS (IMAGENS PARALLAX)

| Unidade | Arquivo de imagem |
|---|---|
| Codó | `Codó.png` |
| Igarassu | `Igarassu_.png` |
| Pacatuba | `Pacatuba.png` |
| Palmeira | `Palmeira.png` |
| Bahia (São Sebastião do Passé) | `São_Sebastião_do_Passé_.png` |
| Uberlândia | `Uberlandia.png` |
| Solutions | `Chlorum_Solutions.png` |
| Distribuição | `distribuição.png` |

---

## 9. FUNCIONALIDADES SUGERIDAS (ALÉM DO ESCOPO SOLICITADO)

Organizadas por prioridade de valor vs. esforço:

**Alto valor, baixo esforço**
- **Toggle "Mês vs. YTD"** nas contas Férias, Rescisão e ICP — a própria Cartilha (seção 4 e 7) recomenda nunca julgar essas contas isoladamente pelo mês; o app pode aplicar essa regra automaticamente com um aviso visual quando o usuário está olhando o mês isolado de uma conta sazonal.
- **Badge automático "Efeito real / calendário / mapeamento"** em cada linha de desvio por conta, aplicando a lógica da seção 3 da Cartilha (ex.: Férias sempre recebe a tag "calendário"; um desvio de Salário proporcional ao desvio de HC recebe "real").
- **Busca/filtro global** por unidade, conta ou faixa de desvio (%).
- **Modo de apresentação** (fullscreen, sem navegação) para a reunião mensal com o CFO.

**Médio valor, médio esforço**
- **Tela `/consolidado`**: visão agregada das 8 unidades em uma única tabela ordenável (ranking por maior desvio %, por maior desvio R$, por gap de headcount), com o mesmo código de cores verde/vermelho.
- **Roteiro de 6 perguntas como checklist funcional**: ao abrir a tela de uma unidade, o usuário pode "rodar o roteiro" e o sistema já pré-marca as perguntas 1, 2 e 5 quando os dados confirmam a resposta (ex.: se HC bate, marca a pergunta 1 automaticamente).
- **Exportação para PDF/PPT** de uma unidade específica ou do consolidado, replicando o layout do relatório original — útil para quem ainda precisa levar slide físico à diretoria.
- **Anotações por unidade**: campo de texto livre para o BP registrar a causa-raiz encontrada após aplicar o roteiro, criando um histórico investigativo mês a mês.

**Alto valor, alto esforço (roadmap futuro)**
- **Painel de administração** para upload do PDF/planilha mensal, com parsing automático das 7 contas por unidade (elimina a atualização manual do JSON a cada ciclo).
- **Comparação entre ciclos**: gráfico de linha do desvio % por unidade ao longo dos meses, para identificar se um problema é pontual ou recorrente (relevante dado que Marlon já identificou que parte do desvio do 1º semestre é estrutural/contábil, não de gestão).
- **Rateio assistido**: para o "Caso Gente & Gestão" (seção 6 da Cartilha), uma calculadora que redistribui o custo concentrado no CC "Administrativo" pelos CCs reais, com base em headcount ou outro critério, mostrando o "antes/depois" do desvio percentual de cada unidade.
- **Alertas automáticos**: quando um desvio de conta ultrapassa um limiar (ex. >100%) sem justificativa registrada, sinalizar para revisão antes do fechamento do ciclo.

---

## 10. NOTAS TÉCNICAS PARA O LOVABLE

- Stack sugerida: React + Tailwind + shadcn/ui (padrão Lovable).
- Parallax: usar `framer-motion` (scroll-linked transform) ou CSS `background-attachment: fixed` como fallback simples.
- Dados: iniciar com o JSON da seção 7 como mock/seed local; estruturar para migração futura a um backend (Supabase é nativo do Lovable) quando o painel de admin for implementado.
- Responsividade: prioridade mobile-first para a leitura rápida em reunião, mas o dashboard de barras de desvio deve ter uma versão desktop otimizada para comparação lado a lado.
- Idioma: 100% em português (pt-BR), incluindo formatação de moeda (R$) e percentual conforme o padrão brasileiro (vírgula decimal).
- Acessibilidade: os pares verde/vermelho de desvio devem ter também um indicador não-cromático (ícone de seta ↑/↓ ou +/-) para não depender apenas da cor.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://analiseresultadopayrollchlorum.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4aa938af-fe63-4f5c-8a39-552a36898326).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
