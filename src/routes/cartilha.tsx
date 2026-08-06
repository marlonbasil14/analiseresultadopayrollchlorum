import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { CICLO_LABEL } from "@/data/payroll";

export const Route = createFileRoute("/cartilha")({
  head: () => ({
    meta: [
      { title: "Cartilha de Leitura Orçamentária — Payroll Actual vs. Forecast" },
      {
        name: "description",
        content:
          "Guia prático em 8 seções para Business Partners e lideranças interpretarem desvios de payroll: contas, efeito dominó, calendário e mapeamento.",
      },
      {
        property: "og:title",
        content: "Cartilha de Leitura Orçamentária — Payroll Actual vs. Forecast",
      },
      {
        property: "og:description",
        content: "Guia prático em 8 seções para investigar e explicar desvios de payroll.",
      },
    ],
  }),
  component: Cartilha,
});

const SUMARIO = [
  ["01-por-que-existe", "01 · Por que esta cartilha existe"],
  ["02-mapa-das-contas", "02 · O mapa das contas"],
  ["03-efeito-domino", "03 · A cadeia de efeito dominó"],
  ["04-fantasmas-do-calendario", "04 · Os “fantasmas do calendário”"],
  ["05-enderecos-trocados", "05 · Endereços trocados"],
  ["06-caso-gente-e-gestao", "06 · O caso Gente & Gestão"],
  ["07-roteiro-6-perguntas", "07 · Roteiro de 6 perguntas"],
  ["08-tabela-referencia-rapida", "08 · Tabela de referência rápida"],
] as const;

const CONTAS = [
  [
    "Salário",
    "Salários e ordenados, pró-labore, 13º salário, prêmios e gratificações, abono salarial, conta transitória de MOD, (-) capitalização de projetos",
    "Varia quase 1:1 com headcount; distorções vêm de reajustes, promoções ou erro de rateio entre CCs",
  ],
  [
    "Hora Extra",
    "Horas extras e adicionais correlatos",
    "Pressão de demanda operacional; sobe quando falta gente ou quando há pico de produção/manutenção",
  ],
  [
    "Férias",
    "Provisão e pagamento de férias",
    "Fortemente sazonal — não é mensal linear; concentra-se nos meses de gozo efetivo",
  ],
  [
    "Rescisão e Aviso Prévio",
    "Verbas rescisórias e aviso prévio indenizado",
    "Evento binário — só aparece no mês em que alguém efetivamente desliga",
  ],
  [
    "Encargos",
    "INSS, FGTS (inclusive sobre 13º/férias)",
    "Segue Salário + Hora Extra quase automaticamente, pois incide sobre a folha",
  ],
  [
    "Benefícios",
    "VT, VR/refeição, assistência médica/odontológica, seguro de vida, previdência privada, auxílio educação, uniformes, cursos, combustível, ajuda de custo",
    "Parte varia com headcount (VT, VR); parte é fixa por apólice/contrato (plano de saúde, seguro de vida)",
  ],
  [
    "ICP",
    "PLR / Participação nos Resultados",
    "Pagamento concentrado 1-2x ao ano — não deve ser lido como “mensal”",
  ],
];

const DOMINO = [
  [
    "Passo 1 — Headcount real ≠ headcount orçado",
    "Mais pessoas do que o orçado (ou pessoas em posições/níveis diferentes do planejado) elevam Salário diretamente; menos pessoas do que o orçado reduzem Salário — mas podem gerar Hora Extra para compensar a lacuna operacional.",
  ],
  [
    "Passo 2 — Hora Extra absorve o gap operacional",
    "Quando a produção não pode parar mas o quadro está abaixo do orçado, a empresa “compra” a diferença em horas extras. Isso explica por que Salário pode vir favorável e Hora Extra fortemente desfavorável no mesmo mês, no mesmo CC.",
  ],
  [
    "Passo 3 — Encargos segue automaticamente",
    "INSS e FGTS incidem sobre a folha (inclusive sobre horas extras, 13º e férias). Todo desvio em Salário e Hora Extra se replica, proporcionalmente, em Encargos — não é um desvio “novo”, é um eco do desvio anterior.",
  ],
  [
    "Passo 4 — Benefícios per capita reage ao headcount",
    "Vale-transporte e vale-refeição/alimentação sobem e descem quase linearmente com o número de pessoas ativas no mês. Planos de saúde e seguro de vida reagem com defasagem e podem “atrasar” um ou dois meses em relação à mudança real de headcount.",
  ],
];

const FANTASMAS = [
  ["Uberlândia", "Férias", "R$ 102,1 mil", "R$ 7,3 mil", "+1.294%"],
  ["Palmeira", "Férias", "R$ 55,2 mil", "R$ 5,7 mil", "+868%"],
  ["Bahia", "Férias", "R$ 30,1 mil", "R$ 4,2 mil", "+611%"],
  ["Todas as unidades", "Rescisão e Aviso Prévio", "R$ 0 (na maioria)", "provisão mensal", "-100%"],
  ["Bahia, Palmeira", "ICP", "R$ 0", "provisão mensal", "-100%"],
];

const GG = [
  ["Palmeira", "3 / 2", "+50%", "+945%", "Gap de ~19x entre custo e headcount"],
  ["Uberlândia", "5 / 3", "+67%", "+334%", "Gap de ~5x"],
  ["Bahia", "5 / 3", "+67%", "+227%", "Gap de ~3,4x"],
  ["Codó", "1 / 1", "0%", "+203%", "100% do desvio é custo alocado, não headcount"],
  ["Distribuição", "3 / 3", "0%", "+181%", "100% do desvio é custo alocado, não headcount"],
  ["Pacatuba", "5 / 5", "0%", "+30%", "Mesma direção, magnitude menor"],
];

const PERGUNTAS = [
  "O headcount da área bate com o orçado? Compare Actual vs. Forecast de headcount antes de olhar qualquer R$.",
  "Essa conta é Férias, Rescisão ou ICP? Se sim, pare e olhe o YTD antes de reagir ao mês isolado.",
  "Existe uma área “espelho” com o sinal oposto? Pode ser reclassificação sem espelho no orçamento.",
  "O desvio de custo é proporcional ao desvio de headcount? Se não, procure lançamento concentrado ou evento pontual.",
  "Encargos e Benefícios se moveram na mesma direção de Salário/Hora Extra? Se sim, é o efeito cascata natural.",
  "O que sobra depois de 1 a 5 é o desvio operacional real — hora extra genuína, reajuste não orçado, admissão fora do plano, mudança de mix de cargos.",
];

const REFERENCIA = [
  [
    "Salário",
    "Headcount bate? Houve reajuste, promoção ou mudança de nível não orçada?",
    "Aba “per CC” (headcount) + Base HC Actual/Forecast",
  ],
  [
    "Hora Extra",
    "A produção/manutenção operou acima do plano? Falta gente no operacional?",
    "Base Razão, filtrando conta “Horas Extras” por CC",
  ],
  [
    "Férias",
    "O mês concentra período de gozo coletivo? Como está o YTD?",
    "Comparar Actual vs. Forecast acumulado (YTD), não o mês isolado",
  ],
  [
    "Rescisão e Aviso Prévio",
    "Houve desligamento no mês? Estava no plano de headcount?",
    "Base HC Actual (saídas) do mês",
  ],
  [
    "Encargos",
    "Salário e Hora Extra também desviaram? Na mesma proporção?",
    "Comparação direta com as duas contas anteriores",
  ],
  [
    "Benefícios",
    "É por cabeça (VT/VR) ou por apólice (saúde/seguro)? Houve reajuste de operadora?",
    "De-para Mapping, para separar benefícios per capita dos fixos",
  ],
  ["ICP", "É mês de pagamento de PLR? Como está o YTD?", "Calendário de pagamento de PLR da unidade"],
];

function Secao({
  id,
  numero,
  titulo,
  subtitulo,
  children,
}: {
  id: string;
  numero: string;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-12 first:border-t-0">
      <p className="eyebrow-light">{numero}</p>
      <h2 className="mt-2 text-2xl font-bold md:text-3xl">{titulo}</h2>
      {subtitulo ? (
        <p className="mt-2 text-base font-medium text-muted-foreground">{subtitulo}</p>
      ) : null}
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function Tabela({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "font-semibold" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cartilha() {
  const [checks, setChecks] = useState<boolean[]>(Array(6).fill(false));

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-navy py-14 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-navy-foreground/70"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <p className="eyebrow mt-8">Cartilha de Leitura Orçamentária</p>
          <h1 className="mt-3 text-4xl font-bold md:text-6xl">Payroll — Actual vs. Forecast</h1>
          <p className="mt-3 text-lg text-navy-foreground/80">
            Guia prático para Business Partners e Lideranças de Negócio
          </p>
          <p className="mt-2 text-xs text-navy-foreground/60">
            Gente &amp; Remuneração | Chlorum Solutions · Ciclo de referência: {CICLO_LABEL}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[240px_1fr]">
        <nav className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sumário
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {SUMARIO.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <Secao
            id="01-por-que-existe"
            numero="01"
            titulo="Por que esta cartilha existe"
            subtitulo="A pergunta “por quê?” costuma ter uma causa técnica identificável"
          >
            <p>
              Todo mês, cada Diretoria recebe uma planilha com o resultado do orçamento de payroll: o
              que foi realizado (Actual) contra o que estava previsto (Forecast). Quando os números
              não batem, a pergunta natural do líder de negócio é “por quê?” — e essa pergunta costuma
              ser respondida de forma genérica (“o custo de pessoal subiu”), quando na verdade existe
              uma causa técnica identificável por trás de praticamente todo desvio.
            </p>
            <p>
              Esta cartilha traduz a lógica contábil e orçamentária de payroll em uma linguagem
              simples, para que BPs e líderes consigam, sozinhos, chegar à causa-raiz de um desvio
              antes de escalar a dúvida para Gente &amp; Remuneração. Ela não substitui a análise
              linha a linha — ela dá o mapa para fazer essa análise com método.
            </p>
          </Secao>

          <Secao
            id="02-mapa-das-contas"
            numero="02"
            titulo="O mapa das contas: o que cada grupo contém"
            subtitulo="Sete famílias gerenciais escondem dezenas de contas SAP"
          >
            <p>
              O relatório agrupa dezenas de contas contábeis (SAP) em 7 “famílias” gerenciais. Antes
              de investigar um desvio, é preciso saber o que mora dentro de cada família — porque o
              mesmo evento (uma admissão, uma demissão, um mês de forte produção) pode aparecer
              simultaneamente em três ou quatro delas.
            </p>
            <Tabela head={["Grupo", "O que inclui", "Comportamento típico"]} rows={CONTAS} />
          </Secao>

          <Secao
            id="03-efeito-domino"
            numero="03"
            titulo="A cadeia de efeito dominó: do headcount ao resultado"
            subtitulo="A maior parte dos desvios reais nasce em um único ponto de partida"
          >
            <p>
              A maior parte dos desvios reais (isto é, não relacionados a timing ou a erro de
              mapeamento — ver seções 4 e 5) nasce em um único ponto de partida: o headcount realizado
              é diferente do headcount orçado, ou a intensidade de uso de horas extras foi diferente
              da prevista. A partir daí, o efeito se propaga em cascata.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {DOMINO.map(([titulo, texto]) => (
                <div key={titulo} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-bold">{titulo}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-brand/40 bg-brand/10 p-5">
              <p className="text-sm font-bold">Exemplo Igarassu — a leitura correta</p>
              <p className="mt-2 text-sm">
                À primeira vista parece contraditório — mais gente e, ainda assim, muito mais hora
                extra. A leitura correta é: o quadro cresceu em áreas administrativas e de segurança,
                não necessariamente nas posições operacionais que geram a pressão de turno, então a
                fábrica seguiu comprando hora extra para cobrir a operação contínua, ao mesmo tempo em
                que outras áreas cresceram acima do plano.
              </p>
              <p className="mt-3 text-sm">
                O efeito cascata aparece de forma nítida: Encargos em Igarassu veio 4,9% acima do
                orçado — um desvio proporcionalmente muito menor do que o de Hora Extra, porque
                Encargos reflete a folha como um todo (Salário + Hora Extra), e Salário isoladamente
                veio 10,9% favorável.
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold text-unfavorable tabular-nums">▲ +4,9%</p>
                  <p className="text-xs text-muted-foreground">Encargos vs. orçado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-favorable tabular-nums">▼ -10,9%</p>
                  <p className="text-xs text-muted-foreground">Salário vs. orçado (favorável)</p>
                </div>
              </div>
            </div>
          </Secao>

          <Secao
            id="04-fantasmas-do-calendario"
            numero="04"
            titulo="Os “fantasmas do calendário”: desvios que não são desvios"
            subtitulo="Férias, Rescisão e ICP comparam duas lógicas de tempo diferentes"
          >
            <p>
              Três contas — Férias, Rescisão e Aviso Prévio, e ICP — quase sempre aparecem com
              variações percentuais gigantescas (300%, 600%, às vezes acima de 1.000%). Antes de
              tratá-las como problema operacional, é essencial entender a metodologia.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-bold">Actual</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Registra o caixa: o valor é lançado no mês em que o evento realmente acontece (a
                  pessoa saiu de férias, foi desligada, ou recebeu o PLR).
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-bold">Forecast</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quando construído como rateio linear de uma provisão anual, distribui o valor
                  esperado igualmente por todos os meses do ano.
                </p>
              </div>
            </div>
            <p className="font-semibold">Exemplos reais — Julho/2026</p>
            <Tabela
              head={["Unidade", "Conta", "Actual", "Forecast", "Desvio %"]}
              rows={FANTASMAS}
            />
          </Secao>

          <Secao
            id="05-enderecos-trocados"
            numero="05"
            titulo="“Endereços trocados”: reclassificação sem espelho no orçamento"
            subtitulo="Uma área “esvaziada” e uma área “nova” quase sempre andam juntas"
          >
            <p>
              Um segundo tipo de desvio acontece quando uma pessoa, ou um centro de custo inteiro, muda
              de área no organograma, mas o orçamento não foi atualizado para acompanhar essa mudança.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Laboratório:</strong> 0 pessoas realizadas em quase todas as unidades, apesar
                de headcount orçado de 2 a 8 pessoas — desvio de -100% em payroll.
              </li>
              <li>
                <strong>Qualidade:</strong> Custo real relevante com orçamento zerado nas mesmas
                unidades — R$ 121 mil em Igarassu, R$ 26 mil em Codó e Pacatuba.
              </li>
            </ul>
            <p>
              A leitura mais provável: as equipes foram reorganizadas sob um único guarda-chuva de
              Qualidade/Laboratório e o orçamento manteve a estrutura antiga de centros de custo. O
              mesmo padrão aparece em Segurança em Igarassu, Palmeira e Uberlândia.
            </p>
          </Secao>

          <Secao
            id="06-caso-gente-e-gestao"
            numero="06"
            titulo="O caso Gente & Gestão: custo corporativo em um único endereço"
            subtitulo="Um problema de mapeamento contábil, não de gestão da área"
          >
            <p>
              O padrão mais recorrente e mais material observado nos oito arquivos de julho é a
              concentração de custos que, por natureza, pertencem a toda a empresa (plano de saúde,
              seguro de vida, benefícios corporativos) em um único centro de custo — normalmente
              classificado como “Administrativo”. Isso faz o desvio percentual dessa área explodir
              mesmo quando o headcount dela está praticamente em linha com o orçado.
            </p>
            <p>
              A correção correta é técnica: distribuir (ratear) esses custos pelos centros de custo que
              efetivamente geram a despesa, e não reduzir ou questionar o desempenho da área onde o
              lançamento está hoje concentrado.
            </p>
            <p className="font-semibold">Evidência — Julho/2026</p>
            <Tabela
              head={["Unidade", "HC Adm. (Real/Orç.)", "Δ HC", "Desvio Payroll", "Leitura"]}
              rows={GG}
            />
          </Secao>

          <Secao
            id="07-roteiro-6-perguntas"
            numero="07"
            titulo="Passo a passo: como analisar uma linha de desvio"
            subtitulo="Um roteiro de 6 perguntas, nesta ordem"
          >
            <ul className="space-y-2">
              {PERGUNTAS.map((p, i) => (
                <li key={p}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4">
                    <input
                      type="checkbox"
                      checked={checks[i]}
                      onChange={() => setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))}
                      className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
                    />
                    <span>
                      <span className="font-bold tabular-nums">{i + 1}.</span> {p}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Secao>

          <Secao id="08-tabela-referencia-rapida" numero="08" titulo="Tabela de referência rápida">
            <Tabela
              head={["Conta", "Pergunta-chave ao investigar", "Onde investigar primeiro"]}
              rows={REFERENCIA}
            />
          </Secao>

          <section className="border-t border-border py-12">
            <p className="eyebrow-light">Em resumo</p>
            <h2 className="mt-2 text-2xl font-bold">
              Um desvio de payroll raramente tem uma causa única
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Efeito real", "Headcount, hora extra"],
                ["Efeito de calendário", "Férias, rescisão, PLR"],
                ["Efeito de mapeamento", "Rateio pendente, reclassificação de CC"],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-bold">{t}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
              O papel do BP não é explicar o número final — é decompô-lo nessas três camadas antes de
              levar a conclusão à liderança.
            </p>
          </section>
        </div>
      </div>

      <footer className="bg-navy py-14 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <p className="eyebrow">Próximos passos</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Antes de escalar uma dúvida para Gente &amp; Remuneração:
          </h2>
          <ol className="mt-6 max-w-3xl list-decimal space-y-3 pl-5 text-sm text-navy-foreground/80">
            <li>Rode o roteiro de 6 perguntas (Seção 7) antes de abrir qualquer chamado.</li>
            <li>
              Leve Férias, Rescisão e ICP para o acumulado do ano (YTD) antes de reagir ao mês.
            </li>
            <li>Compare sempre o desvio de custo com o desvio de headcount, lado a lado.</li>
            <li>
              Escale para Gente &amp; Remuneração apenas o resíduo que sobrar depois desse roteiro.
            </li>
          </ol>
        </div>
      </footer>
    </main>
  );
}
