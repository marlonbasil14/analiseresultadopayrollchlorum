import { type Unidade } from "@/data/payroll";
import { dadosDoCiclo } from "@/data/ciclos";

let cicloAtivo = { CICLO: dadosDoCiclo().CICLO, CICLO_LABEL: dadosDoCiclo().cicloAtivo.CICLO_LABEL };

/** Define o ciclo usado nos nomes de arquivo e cabeçalhos das exportações. */
export function definirCicloExportacao(chave?: string) {
  const d = dadosDoCiclo(chave);
  cicloAtivo = { CICLO: d.CICLO, CICLO_LABEL: d.cicloAtivo.CICLO_LABEL };
}
import { brl, pct } from "@/lib/format";
import {
  CHL,
  FONTE,
  FONTE_FALLBACK,
  argb,
  carregarFontesNunito,
  carregarLogo,
  corDesvio,
  hexPuro,
  rgb,
  tint,
} from "@/lib/chlorum-design-tokens";

export type LinhaRelatorio = {
  unidade: string;
  conta: string;
  real: number;
  orcado: number;
  desvioValor: number;
  desvioPercentual: number;
  ofensor: string;
  justificativa: string;
  acaoRecomendada: string;
  planoAcao: string;
  prazo: string;
  responsavel: string;
  status: string;
};

export type ReviewLike = {
  justificativa_bp?: string | null;
  justificativas?: unknown;
  acoes_recomendadas_bp?: unknown;
  plano_de_acao?: unknown;
  ofensores_diretoria?: unknown;
  parecer_diretoria?: string | null;
  autor?: string | null;
  fluxo_status?: string | null;
  atualizado_em?: string | null;
} | null;

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Reconstrói Real e Orçado por conta a partir do desvio (valor + %). */
function realOrcado(valor: number, percentual: number) {
  const orcado = percentual !== 0 ? valor / (percentual / 100) : 0;
  return { orcado, real: orcado + valor };
}

export function linhasDaUnidade(u: Unidade, review: ReviewLike): LinhaRelatorio[] {
  const justificativas = arr<{ conta: string; ofensor?: string; texto?: string }>(
    review?.justificativas,
  );
  const acoes = arr<{ acao?: string; responsavel?: string; prazo?: string }>(
    review?.acoes_recomendadas_bp,
  );
  const plano = arr<{ item?: string; responsavel?: string; prazo?: string }>(review?.plano_de_acao);

  return u.desvioPorConta.map((c, i) => {
    const { real, orcado } = realOrcado(c.valor, c.percentual);
    const j = justificativas.find((x) => x.conta === c.conta);
    const a = acoes[i];
    const p = plano[i];
    return {
      unidade: u.nome,
      conta: c.conta,
      real,
      orcado,
      desvioValor: c.valor,
      desvioPercentual: c.percentual,
      ofensor: j?.ofensor ?? "",
      justificativa: j?.texto ?? "",
      acaoRecomendada: a?.acao ?? "",
      planoAcao: p?.item ?? "",
      prazo: p?.prazo ?? a?.prazo ?? "",
      responsavel: p?.responsavel ?? a?.responsavel ?? "",
      status: review?.fluxo_status ?? "pendente",
    };
  });
}

export type PacoteUnidade = { unidade: Unidade; review: ReviewLike };

const CABECALHO = [
  "Conta contábil",
  "Real",
  "Orçado",
  "Desvio R$",
  "Desvio %",
  "Ofensor",
  "Justificativa",
  "Ação recomendada",
  "Plano de ação",
  "Prazo",
  "Responsável",
  "Status",
];

const EYEBROW = "GENTE & REMUNERAÇÃO";

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function nomeArquivo(base: string, ext: string) {
  return `${base}-${cicloAtivo.CICLO}.${ext}`;
}

// ----------------------------- Excel -----------------------------

export async function exportarExcel(pacote: PacoteUnidade[], nomeBase: string) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Chlorum Solutions — Payroll Intelligence";
  wb.created = new Date();

  const larguras = [24, 16, 16, 16, 12, 22, 46, 32, 32, 14, 20, 14];

  const montarAba = (
    nome: string,
    titulo: string,
    linhas: LinhaRelatorio[],
    comUnidade: boolean,
    logoId?: number,
  ) => {
    const ws = wb.addWorksheet(nome.slice(0, 30), {
      views: [{ state: "frozen", ySplit: comUnidade ? 4 : 3 }],
    });
    const colunas = comUnidade ? ["Unidade", ...CABECALHO] : CABECALHO;
    ws.columns = (comUnidade ? [18, ...larguras] : larguras).map((wch) => ({ width: wch }));

    let linhaAtual = 1;

    if (logoId !== undefined) {
      ws.getRow(1).height = 34;
      ws.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 34 } });
      linhaAtual = 2;
    }

    // Faixa navy com o título
    const faixa = ws.getRow(linhaAtual);
    faixa.height = 28;
    ws.mergeCells(linhaAtual, 1, linhaAtual, colunas.length);
    const celulaTitulo = ws.getCell(linhaAtual, 1);
    celulaTitulo.value = titulo;
    celulaTitulo.font = { name: FONTE, size: 14, bold: true, color: { argb: argb(CHL.white) } };
    celulaTitulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(CHL.navy800) } };
    celulaTitulo.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    linhaAtual += 1;

    // Cabeçalho de colunas
    const cabecalho = ws.getRow(linhaAtual);
    cabecalho.values = colunas;
    cabecalho.height = 22;
    cabecalho.eachCell((c) => {
      c.font = { name: FONTE, size: 11, bold: true, color: { argb: argb(CHL.blue700) } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(CHL.blue50) } };
      c.border = { bottom: { style: "medium", color: { argb: argb(CHL.blue300) } } };
      c.alignment = { vertical: "middle", wrapText: true };
    });
    linhaAtual += 1;

    linhas.forEach((l, i) => {
      const valores = [
        l.conta,
        l.real,
        l.orcado,
        l.desvioValor,
        l.desvioPercentual / 100,
        l.ofensor,
        l.justificativa,
        l.acaoRecomendada,
        l.planoAcao,
        l.prazo,
        l.responsavel,
        l.status,
      ];
      const row = ws.getRow(linhaAtual + i);
      row.values = comUnidade ? [l.unidade, ...valores] : valores;
      const zebra = i % 2 === 1;
      const desfavoravel = l.desvioPercentual > 0;
      const corStatus = desfavoravel ? CHL.danger : CHL.success;
      row.eachCell({ includeEmpty: true }, (c, col) => {
        c.font = { name: FONTE, size: 10, color: { argb: argb(CHL.gray900) } };
        if (zebra) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(CHL.gray50) } };
        c.border = { bottom: { style: "thin", color: { argb: argb(CHL.gray200) } } };
        c.alignment = { vertical: "top", wrapText: true };
        const idx = comUnidade ? col - 1 : col;
        if (idx >= 2 && idx <= 4) c.numFmt = 'R$ #,##0.00';
        if (idx === 5) c.numFmt = "0.0%";
        if (idx === 4 || idx === 5) {
          c.font = { name: FONTE, size: 10, bold: true, color: { argb: argb(corStatus) } };
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: argb(tint(corStatus, 0.88)) },
          };
        }
      });
    });

    ws.autoFilter = {
      from: { row: linhaAtual - 1, column: 1 },
      to: { row: linhaAtual + Math.max(linhas.length - 1, 0), column: colunas.length },
    };
    return ws;
  };

  const linhasTodas: LinhaRelatorio[] = [];
  for (const p of pacote) {
    const linhas = linhasDaUnidade(p.unidade, p.review);
    linhasTodas.push(...linhas);
    montarAba(p.unidade.nome, `${p.unidade.nome} — Ciclo ${cicloAtivo.CICLO_LABEL}`, linhas, false);
  }

  if (pacote.length > 1) {
    let logoId: number | undefined;
    try {
      const logo = await carregarLogo("positivo");
      logoId = wb.addImage({ base64: logo.dataUrl, extension: "png" });
    } catch {
      logoId = undefined;
    }
    montarAba(
      "Consolidado",
      `Consolidado Chlorum Solutions — Ciclo ${cicloAtivo.CICLO_LABEL}`,
      linhasTodas,
      true,
      logoId,
    );
  }

  const buffer = await wb.xlsx.writeBuffer();
  baixar(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    nomeArquivo(nomeBase, "xlsx"),
  );
}

// ------------------------------ PDF ------------------------------

type Doc = import("jspdf").jsPDF;

export async function exportarPdf(
  pacote: PacoteUnidade[],
  nomeBase: string,
  titulo: string,
  autor?: string | null,
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }) as Doc;

  // Fontes Nunito embutidas (com fallback silencioso para helvetica).
  let temNunito = false;
  try {
    for (const f of await carregarFontesNunito()) {
      doc.addFileToVFS(f.arquivo, f.base64);
      doc.addFont(f.arquivo, f.familia, f.estilo);
    }
    temNunito = true;
  } catch {
    temNunito = false;
  }

  const fonte = (peso: 300 | 600 | 700 | 800) => {
    if (!temNunito) {
      doc.setFont("helvetica", peso >= 600 ? "bold" : "normal");
      return;
    }
    if (peso === 300) doc.setFont("Nunito", "normal");
    else if (peso === 600) doc.setFont("NunitoSemi", "normal");
    else if (peso === 700) doc.setFont("Nunito", "bold");
    else doc.setFont("NunitoX", "normal");
  };

  const texto = (
    conteudo: string,
    x: number,
    y: number,
    opts: { peso?: 300 | 600 | 700 | 800; tamanho?: number; cor?: string; espaco?: number; alinhar?: "left" | "right" } = {},
  ) => {
    fonte(opts.peso ?? 300);
    doc.setFontSize(opts.tamanho ?? 10);
    doc.setTextColor(...rgb(opts.cor ?? CHL.gray900));
    doc.setCharSpace(opts.espaco ?? 0);
    doc.text(conteudo, x, y, opts.alinhar ? { align: opts.alinhar } : undefined);
    doc.setCharSpace(0);
  };

  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();

  const logoNeg = await carregarLogo("negativo").catch(() => null);
  const logoPos = await carregarLogo("positivo").catch(() => null);

  const totalReal = pacote.reduce((s, p) => s + p.unidade.payrollActual, 0);
  const totalOrc = pacote.reduce((s, p) => s + p.unidade.payrollForecast, 0);
  const desvioTotal = totalReal - totalOrc;
  const percentualTotal = totalOrc !== 0 ? (-desvioTotal / Math.abs(totalOrc)) * 100 : 0;

  // ------------------------------ Capa ------------------------------
  const m = 24;
  doc.setFillColor(...rgb(CHL.navy800));
  doc.roundedRect(m, m, largura - m * 2, altura - m * 2, 12, 12, "F");

  if (logoNeg) {
    const larguraLogo = 150;
    doc.addImage(logoNeg.dataUrl, "PNG", m + 36, m + 34, larguraLogo, larguraLogo / logoNeg.proporcao, "chl-neg", "FAST");
  }

  texto(EYEBROW, m + 36, m + 130, { peso: 700, tamanho: 11, cor: CHL.blue300, espaco: 2 });
  texto(titulo, m + 36, m + 178, { peso: 800, tamanho: 34, cor: CHL.white });
  texto(`Ciclo ${cicloAtivo.CICLO_LABEL} · Chlorum Solutions`, m + 36, m + 208, {
    peso: 300,
    tamanho: 14,
    cor: CHL.blue200,
  });

  if (pacote.length > 1) {
    doc.setFillColor(...rgb(CHL.navy700));
    doc.roundedRect(m + 36, m + 236, largura - m * 2 - 72, 76, 10, 10, "F");
    texto("DESVIO TOTAL CHLORUM", m + 56, m + 264, {
      peso: 700,
      tamanho: 9,
      cor: CHL.blue300,
      espaco: 1.6,
    });
    texto(`${brl(desvioTotal)} (${pct(percentualTotal)})`, m + 56, m + 294, {
      peso: 800,
      tamanho: 22,
      cor: percentualTotal > 0 ? tint(CHL.danger, 0.35) : tint(CHL.success, 0.35),
    });
    texto(
      `Real ${brl(totalReal)}  ·  Orçado ${brl(totalOrc)}  ·  ${pacote.length} unidades`,
      m + 320,
      m + 294,
      { peso: 300, tamanho: 12, cor: CHL.blue200 },
    );
  }

  texto(
    `Gerado em ${new Date().toLocaleString("pt-BR")}${autor ? ` · Autor: ${autor}` : ""}`,
    m + 36,
    altura - m - 32,
    { peso: 400 as 300, tamanho: 10, cor: CHL.blue300 },
  );

  // Ranking consolidado
  if (pacote.length > 1) {
    doc.addPage();
    cabecalhoInterno("Ranking de desvio por unidade");
    autoTable(doc, {
      startY: 110,
      head: [["#", "Unidade", "Desvio %", "Desvio R$", "Status", "Autor"]],
      body: [...pacote]
        .sort((a, b) => b.unidade.desvioPercentual - a.unidade.desvioPercentual)
        .map((p, i) => [
          String(i + 1),
          p.unidade.nome,
          pct(p.unidade.desvioPercentual),
          brl(p.unidade.desvioValor),
          p.review?.fluxo_status ?? "pendente",
          p.review?.autor ?? "—",
        ]),
      ...estiloTabela(temNunito),
    });
  }

  function cabecalhoInterno(rotulo: string, indice?: number, total?: number) {
    if (logoPos) {
      const w = 92;
      doc.addImage(logoPos.dataUrl, "PNG", largura - m - 12 - w, 30, w, w / logoPos.proporcao, "chl-pos", "FAST");
    }
    texto(
      indice && total ? `UNIDADE ${indice} DE ${total}` : rotulo.toUpperCase(),
      m + 12,
      48,
      { peso: 700, tamanho: 9, cor: CHL.blue600, espaco: 1.8 },
    );
    texto(`Ciclo ${cicloAtivo.CICLO_LABEL} · ${new Date().toLocaleDateString("pt-BR")}`, m + 12, 64, {
      peso: 300,
      tamanho: 9,
      cor: CHL.gray500,
    });
    doc.setDrawColor(...rgb(CHL.gray200));
    doc.setLineWidth(0.8);
    doc.line(m + 12, 76, largura - m - 12, 76);
  }

  function cardKpi(x: number, y: number, w: number, rotulo: string, valor: string, cor: string = CHL.ink) {
    doc.setFillColor(...rgb(CHL.gray50));
    doc.roundedRect(x, y, w, 62, 10, 10, "F");
    texto(rotulo.toUpperCase(), x + 14, y + 22, {
      peso: 700,
      tamanho: 8,
      cor: CHL.gray500,
      espaco: 1.4,
    });
    texto(valor, x + 14, y + 46, { peso: 800, tamanho: 15, cor });
  }

  pacote.forEach((p, indice) => {
    doc.addPage();
    const u = p.unidade;
    cabecalhoInterno(u.nome, indice + 1, pacote.length);

    texto(u.nome, m + 12, 108, { peso: 800, tamanho: 24, cor: CHL.ink });

    // Badge de status do desvio
    const favoravel = u.desvioPercentual <= 0;
    const cor = corDesvio(favoravel);
    const rotuloBadge = `${favoravel ? "FAVORÁVEL" : "DESFAVORÁVEL"} ${pct(u.desvioPercentual)}`;
    fonte(700);
    doc.setFontSize(9);
    const larguraBadge = doc.getTextWidth(rotuloBadge) + 24;
    doc.setFillColor(...rgb(tint(cor, 0.85)));
    doc.roundedRect(m + 12, 118, larguraBadge, 22, 11, 11, "F");
    texto(rotuloBadge, m + 24, 133, { peso: 700, tamanho: 9, cor, espaco: 0.8 });

    // Cards de KPI
    const larguraCard = (largura - m * 2 - 24 - 36) / 4;
    const y = 156;
    cardKpi(m + 12, y, larguraCard, "Payroll real", brl(u.payrollActual));
    cardKpi(m + 12 + (larguraCard + 12), y, larguraCard, "Payroll orçado", brl(u.payrollForecast));
    cardKpi(m + 12 + (larguraCard + 12) * 2, y, larguraCard, "Desvio R$", brl(u.desvioValor), cor);
    cardKpi(m + 12 + (larguraCard + 12) * 3, y, larguraCard, "Desvio %", pct(u.desvioPercentual), cor);

    // ---- Geometria de duas colunas (larguras fixas e independentes) ----
    const colEsqX = m + 12;
    const parecerX = 500; // início da coluna direita
    const goteira = 28;
    const colEsqFim = parecerX - goteira; // limite rígido da coluna do gráfico
    const colDirW = largura - m - 12 - parecerX;
    const baseConteudo = altura - m - 40;

    // Barras de desvio por conta (tudo confinado à coluna esquerda)
    texto("Desvio por conta contábil", colEsqX, y + 100, {
      peso: 700,
      tamanho: 13,
      cor: CHL.navy800,
    });
    const contas = [...u.desvioPorConta].sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
    const maximo = Math.max(...contas.map((c) => Math.abs(c.valor)), 1);
    const trilhaX = colEsqX + 104;
    const rotuloW = 120; // reserva para "R$ x (y%)"
    const trilhaW = Math.max(colEsqFim - rotuloW - trilhaX, 60);
    contas.slice(0, 7).forEach((c, i) => {
      const linhaY = y + 124 + i * 22;
      const corBarra = corDesvio(Boolean(c.favoravel));
      texto(c.conta, colEsqX, linhaY + 9, { peso: 300, tamanho: 9, cor: CHL.gray700 });
      doc.setFillColor(...rgb(CHL.gray200));
      doc.roundedRect(trilhaX, linhaY, trilhaW, 10, 5, 5, "F");
      doc.setFillColor(...rgb(corBarra));
      doc.roundedRect(trilhaX, linhaY, Math.max((Math.abs(c.valor) / maximo) * trilhaW, 4), 10, 5, 5, "F");
      texto(`${brl(c.valor)}  (${pct(c.percentual)})`, colEsqFim, linhaY + 9, {
        peso: 600,
        tamanho: 9,
        cor: corBarra,
        alinhar: "right",
      });
    });

    // Parecer — quebra de linha dentro da própria coluna e overflow paginado
    texto("Parecer", parecerX, y + 100, { peso: 700, tamanho: 13, cor: CHL.navy800 });
    const parecer = p.review?.justificativa_bp || p.review?.parecer_diretoria || "—";
    fonte(300);
    doc.setFontSize(9.5);
    const alturaLinha = 13;
    const linhasParecer = doc.splitTextToSize(parecer, colDirW) as string[];
    const inicioParecer = y + 122;
    const cabemPrimeira = Math.max(Math.floor((baseConteudo - inicioParecer) / alturaLinha), 1);

    doc.setTextColor(...rgb(CHL.gray700));
    doc.text(linhasParecer.slice(0, cabemPrimeira), parecerX, inicioParecer, {
      lineHeightFactor: alturaLinha / 9.5,
    });

    let restante = linhasParecer.slice(cabemPrimeira);
    if (restante.length > 0) {
      texto("continua na próxima página →", parecerX, baseConteudo + 14, {
        peso: 600,
        tamanho: 8,
        cor: CHL.gray500,
      });
    }

    texto(
      `Autor: ${p.review?.autor ?? "—"} · Status: ${p.review?.fluxo_status ?? "pendente"}`,
      colEsqX,
      altura - m - 24,
      { peso: 300, tamanho: 9, cor: CHL.gray500 },
    );

    while (restante.length > 0) {
      doc.addPage();
      cabecalhoInterno(`${u.nome} — parecer (continuação)`);
      texto(`${u.nome} — parecer (continuação)`, colEsqX, 108, {
        peso: 700,
        tamanho: 16,
        cor: CHL.ink,
      });
      const inicio = 132;
      const cabem = Math.max(Math.floor((baseConteudo - inicio) / alturaLinha), 1);
      fonte(300);
      doc.setFontSize(9.5);
      doc.setTextColor(...rgb(CHL.gray700));
      // na continuação o texto usa a largura útil inteira, reprocessando a quebra
      const bloco = doc.splitTextToSize(restante.join(" "), largura - m * 2 - 24) as string[];
      doc.text(bloco.slice(0, cabem), colEsqX, inicio, { lineHeightFactor: alturaLinha / 9.5 });
      restante = bloco.slice(cabem);
    }


    // Detalhamento tabular
    doc.addPage();
    cabecalhoInterno(`${u.nome} — detalhamento`);
    texto(`${u.nome} — detalhamento por conta`, m + 12, 104, {
      peso: 700,
      tamanho: 16,
      cor: CHL.ink,
    });
    autoTable(doc, {
      startY: 120,
      head: [CABECALHO],
      body: linhasDaUnidade(u, p.review).map((l) => [
        l.conta,
        brl(l.real),
        brl(l.orcado),
        brl(l.desvioValor),
        pct(l.desvioPercentual),
        l.ofensor,
        l.justificativa,
        l.acaoRecomendada,
        l.planoAcao,
        l.prazo,
        l.responsavel,
        l.status,
      ]),
      ...estiloTabela(temNunito),
      columnStyles: { 6: { cellWidth: 130 }, 7: { cellWidth: 90 }, 8: { cellWidth: 90 } },
      didParseCell: (dados) => {
        if (dados.section === "body" && (dados.column.index === 3 || dados.column.index === 4)) {
          const percentualBruto = String((dados.row.raw as unknown[])?.[4] ?? "");
          const desfavoravel = percentualBruto.trim().startsWith("+");
          dados.cell.styles.textColor = rgb(desfavoravel ? CHL.danger : CHL.success);
          dados.cell.styles.fontStyle = "bold";
        }
      },
    });
  });

  // Rodapé com paginação
  const paginas = doc.getNumberOfPages();
  for (let i = 2; i <= paginas; i += 1) {
    doc.setPage(i);
    texto(`${i - 1} / ${paginas - 1}`, largura - m - 12, altura - 24, {
      peso: 300,
      tamanho: 8,
      cor: CHL.gray500,
      alinhar: "right",
    });
  }

  doc.save(nomeArquivo(nomeBase, "pdf"));
}

function estiloTabela(temNunito: boolean) {
  const familia = temNunito ? "Nunito" : "helvetica";
  return {
    headStyles: {
      fillColor: rgb(CHL.navy800),
      textColor: rgb(CHL.white),
      fontStyle: "bold" as const,
      font: familia,
      fontSize: 8,
    },
    bodyStyles: { font: familia, textColor: rgb(CHL.gray900) },
    alternateRowStyles: { fillColor: rgb(CHL.gray50) },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      lineColor: rgb(CHL.gray200),
      lineWidth: 0.4,
      font: familia,
    },
    margin: { left: 36, right: 36 },
  };
}

// ------------------------------ PPTX -----------------------------

export async function exportarPptx(pacote: PacoteUnidade[], nomeBase: string, titulo: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.theme = { headFontFace: FONTE, bodyFontFace: FONTE };

  const logoNeg = await carregarLogo("negativo").catch(() => null);
  const logoPos = await carregarLogo("positivo").catch(() => null);

  const totalReal = pacote.reduce((s, p) => s + p.unidade.payrollActual, 0);
  const totalOrc = pacote.reduce((s, p) => s + p.unidade.payrollForecast, 0);
  const desvio = totalReal - totalOrc;
  const percentualTotal = totalOrc !== 0 ? (-desvio / Math.abs(totalOrc)) * 100 : 0;
  const F = { fontFace: FONTE } as const;

  // ------------------------------ Capa ------------------------------
  const capa = pptx.addSlide();
  capa.background = { color: hexPuro(CHL.navy800) };
  if (logoNeg) {
    capa.addImage({ data: logoNeg.dataUrl, x: 0.7, y: 0.55, w: 2.1, h: 2.1 / logoNeg.proporcao });
  }
  capa.addText(EYEBROW, {
    ...F,
    x: 0.7,
    y: 1.35,
    fontSize: 12,
    bold: true,
    charSpacing: 2,
    color: hexPuro(CHL.blue300),
  });
  capa.addText(titulo, { ...F, x: 0.7, y: 1.9, w: 11.5, fontSize: 40, bold: true, color: hexPuro(CHL.white) });
  capa.addText(`Ciclo ${cicloAtivo.CICLO_LABEL} · Chlorum Solutions`, {
    ...F,
    x: 0.7,
    y: 2.9,
    fontSize: 16,
    color: hexPuro(CHL.blue200),
  });
  capa.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 3.5,
    w: 11.9,
    h: 1.2,
    fill: { color: hexPuro(CHL.navy700) },
    line: { color: hexPuro(CHL.navy700) },
    rectRadius: 0.1,
  });
  capa.addText("DESVIO TOTAL", {
    ...F,
    x: 1,
    y: 3.65,
    fontSize: 10,
    bold: true,
    charSpacing: 1.6,
    color: hexPuro(CHL.blue300),
  });
  capa.addText(`${brl(desvio)} (${pct(percentualTotal)})`, {
    ...F,
    x: 1,
    y: 4.0,
    fontSize: 22,
    bold: true,
    color: hexPuro(percentualTotal > 0 ? tint(CHL.danger, 0.35) : tint(CHL.success, 0.35)),
  });
  capa.addText(`Real ${brl(totalReal)}   ·   Orçado ${brl(totalOrc)}   ·   ${pacote.length} unidade(s)`, {
    ...F,
    x: 5.2,
    y: 4.05,
    w: 7,
    fontSize: 13,
    color: hexPuro(CHL.blue200),
  });

  pacote.forEach((p, indice) => {
    const u = p.unidade;
    const s = pptx.addSlide();
    s.background = { color: hexPuro(CHL.white) };

    s.addText(`UNIDADE ${indice + 1} DE ${pacote.length}`, {
      ...F,
      x: 0.5,
      y: 0.3,
      fontSize: 10,
      bold: true,
      charSpacing: 1.8,
      color: hexPuro(CHL.blue600),
    });
    s.addText(u.nome, { ...F, x: 0.5, y: 0.6, w: 8, fontSize: 30, bold: true, color: hexPuro(CHL.ink) });

    const favoravel = u.desvioPercentual <= 0;
    const cor = corDesvio(favoravel);
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 1.3,
      w: 2.6,
      h: 0.36,
      fill: { color: hexPuro(tint(cor, 0.85)) },
      line: { color: hexPuro(tint(cor, 0.85)) },
      rectRadius: 0.18,
    });
    s.addText(`${favoravel ? "FAVORÁVEL" : "DESFAVORÁVEL"} ${pct(u.desvioPercentual)}`, {
      ...F,
      x: 0.5,
      y: 1.3,
      w: 2.6,
      h: 0.36,
      align: "center",
      fontSize: 10,
      bold: true,
      color: hexPuro(cor),
    });

    // KPIs
    const kpis: [string, string, string][] = [
      ["PAYROLL REAL", brl(u.payrollActual), CHL.ink],
      ["PAYROLL ORÇADO", brl(u.payrollForecast), CHL.ink],
      ["DESVIO R$", brl(u.desvioValor), cor],
      ["DESVIO %", pct(u.desvioPercentual), cor],
    ];
    kpis.forEach(([rotulo, valor, corValor], i) => {
      const x = 0.5 + i * 3.05;
      s.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 1.85,
        w: 2.85,
        h: 1.05,
        fill: { color: hexPuro(CHL.gray50) },
        line: { color: hexPuro(CHL.gray200) },
        rectRadius: 0.08,
      });
      s.addText(rotulo, {
        ...F,
        x: x + 0.15,
        y: 1.97,
        w: 2.6,
        fontSize: 9,
        bold: true,
        charSpacing: 1.2,
        color: hexPuro(CHL.gray500),
      });
      s.addText(valor, {
        ...F,
        x: x + 0.15,
        y: 2.32,
        w: 2.6,
        fontSize: 17,
        bold: true,
        color: hexPuro(corValor),
      });
    });

    // Parecer
    s.addText("PARECER", {
      ...F,
      x: 0.5,
      y: 3.05,
      h: 0.25,
      fontSize: 10,
      bold: true,
      charSpacing: 1.6,
      color: hexPuro(CHL.blue600),
    });
    const parecer = (p.review?.justificativa_bp || p.review?.parecer_diretoria || "Parecer não preenchido.")
      .split("\n")
      .join(" ")
      .slice(0, 420);
    s.addText(parecer, {
      ...F,
      x: 0.5,
      y: 3.75,
      w: 6.1,
      h: 2.3,
      fontSize: 13,
      color: hexPuro(CHL.gray700),
      valign: "top",
    });

    // Ofensores
    s.addText("PRINCIPAIS OFENSORES", {
      ...F,
      x: 6.9,
      y: 3.05,
      h: 0.25,
      fontSize: 10,
      bold: true,
      charSpacing: 1.6,
      color: hexPuro(CHL.blue600),
    });
    const top = [...u.desvioPorConta]
      .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
      .slice(0, 4);
    s.addText(
      top.map((c) => ({
        text: `${c.conta}: ${brl(c.valor)} (${pct(c.percentual)})`,
        options: {
          fontFace: FONTE,
          bullet: { code: "25CF" },
          fontSize: 13,
          color: hexPuro(corDesvio(c.percentual <= 0)),
          breakLine: true,
},
      })),
      { x: 6.9, y: 3.75, w: 5.9, h: 2.3, valign: "top" },
    );


    // Rodapé
    if (logoPos) {
      s.addImage({ data: logoPos.dataUrl, x: 0.5, y: 6.75, w: 1.1, h: 1.1 / logoPos.proporcao });
    }
    s.addText(`${indice + 1} / ${pacote.length}`, {
      ...F,
      x: 11.8,
      y: 6.85,
      w: 1,
      align: "right",
      fontSize: 10,
      color: hexPuro(CHL.gray500),
    });
  });

  void FONTE_FALLBACK;
  await pptx.writeFile({ fileName: nomeArquivo(nomeBase, "pptx") });
}
