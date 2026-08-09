import { CICLO, CICLO_LABEL, type Unidade } from "@/data/payroll";
import { brl, pct } from "@/lib/format";

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

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function nomeArquivo(base: string, ext: string) {
  return `${base}-${CICLO}.${ext}`;
}

// ----------------------------- Excel -----------------------------

export async function exportarExcel(pacote: PacoteUnidade[], nomeBase: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const linhasTodas: LinhaRelatorio[] = [];

  for (const p of pacote) {
    const linhas = linhasDaUnidade(p.unidade, p.review);
    linhasTodas.push(...linhas);
    const ws = XLSX.utils.aoa_to_sheet([
      CABECALHO,
      ...linhas.map((l) => [
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
      ]),
    ]);
    formatar(XLSX, ws, linhas.length, 0);
    XLSX.utils.book_append_sheet(wb, ws, p.unidade.nome.slice(0, 28));
  }

  if (pacote.length > 1) {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Unidade", ...CABECALHO],
      ...linhasTodas.map((l) => [
        l.unidade,
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
      ]),
    ]);
    formatar(XLSX, ws, linhasTodas.length, 1);
    XLSX.utils.book_append_sheet(wb, ws, "Consolidado");
  }

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  baixar(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    nomeArquivo(nomeBase, "xlsx"),
  );
}

function formatar(
  XLSX: typeof import("xlsx"),
  ws: import("xlsx").WorkSheet,
  linhas: number,
  offset: number,
) {
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  ws["!cols"] = [
    ...(offset ? [{ wch: 16 }] : []),
    { wch: 24 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 22 },
    { wch: 42 },
    { wch: 30 },
    { wch: 30 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
  ];
  for (let r = 1; r <= linhas; r += 1) {
    for (const [col, fmt] of [
      [1 + offset, 'R$ #,##0.00'],
      [2 + offset, 'R$ #,##0.00'],
      [3 + offset, 'R$ #,##0.00'],
      [4 + offset, "0.0%"],
    ] as [number, string][]) {
      const ref = XLSX.utils.encode_cell({ r, c: col });
      if (ws[ref]) ws[ref].z = fmt;
    }
  }
}

// ------------------------------ PDF ------------------------------

export async function exportarPdf(
  pacote: PacoteUnidade[],
  nomeBase: string,
  titulo: string,
  autor?: string | null,
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const totalReal = pacote.reduce((s, p) => s + p.unidade.payrollActual, 0);
  const totalOrc = pacote.reduce((s, p) => s + p.unidade.payrollForecast, 0);
  const desvio = totalReal - totalOrc;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(titulo, 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Ciclo ${CICLO_LABEL} · Gerado em ${new Date().toLocaleString("pt-BR")}${autor ? ` · Autor: ${autor}` : ""}`,
    40,
    66,
  );

  if (pacote.length > 1) {
    doc.text(
      `Desvio total Chlorum: ${brl(desvio)} (${pct((desvio / totalOrc) * 100)}) — Real ${brl(totalReal)} vs. Orçado ${brl(totalOrc)}`,
      40,
      84,
    );
    autoTable(doc, {
      startY: 100,
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
      headStyles: { fillColor: [42, 73, 153] },
      styles: { fontSize: 9 },
    });
  }

  pacote.forEach((p, indice) => {
    if (pacote.length > 1 || indice > 0) doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${p.unidade.nome} — ${CICLO_LABEL}`, 40, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Real ${brl(p.unidade.payrollActual)} · Orçado ${brl(p.unidade.payrollForecast)} · Desvio ${brl(p.unidade.desvioValor)} (${pct(p.unidade.desvioPercentual)})`,
      40,
      66,
    );
    doc.text(
      `Autor: ${p.review?.autor ?? "—"} · Status: ${p.review?.fluxo_status ?? "pendente"} · Atualizado: ${
        p.review?.atualizado_em ? new Date(p.review.atualizado_em).toLocaleString("pt-BR") : "—"
      }`,
      40,
      82,
    );

    const parecer = p.review?.justificativa_bp || p.review?.parecer_diretoria || "—";
    doc.setFont("helvetica", "bold");
    doc.text("Parecer", 40, 104);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(parecer, 760) as string[], 40, 118);

    autoTable(doc, {
      startY: 160,
      head: [CABECALHO],
      body: linhasDaUnidade(p.unidade, p.review).map((l) => [
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
      headStyles: { fillColor: [42, 73, 153] },
      styles: { fontSize: 7, cellPadding: 3 },
      columnStyles: { 6: { cellWidth: 130 }, 7: { cellWidth: 90 }, 8: { cellWidth: 90 } },
    });
  });

  doc.save(nomeArquivo(nomeBase, "pdf"));
}

// ------------------------------ PPTX -----------------------------

export async function exportarPptx(pacote: PacoteUnidade[], nomeBase: string, titulo: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const totalReal = pacote.reduce((s, p) => s + p.unidade.payrollActual, 0);
  const totalOrc = pacote.reduce((s, p) => s + p.unidade.payrollForecast, 0);
  const desvio = totalReal - totalOrc;

  const capa = pptx.addSlide();
  capa.background = { color: "202848" };
  capa.addText(titulo, { x: 0.6, y: 0.6, fontSize: 30, bold: true, color: "FFFFFF" });
  capa.addText(`Ciclo ${CICLO_LABEL}`, { x: 0.6, y: 1.4, fontSize: 14, color: "79B7E5" });
  capa.addText(
    `Desvio total: ${brl(desvio)} (${pct((desvio / totalOrc) * 100)})`,
    { x: 0.6, y: 1.9, fontSize: 18, bold: true, color: "FFFFFF" },
  );
  capa.addText(
    [...pacote]
      .sort((a, b) => b.unidade.desvioPercentual - a.unidade.desvioPercentual)
      .map((p, i) => ({
        text: `${i + 1}. ${p.unidade.nome} — ${pct(p.unidade.desvioPercentual)} (${brl(p.unidade.desvioValor)})`,
        options: { bullet: false, fontSize: 12, color: "FFFFFF", breakLine: true },
      })),
    { x: 0.6, y: 2.6, w: 8 },
  );

  for (const p of pacote) {
    const s = pptx.addSlide();
    s.addText(p.unidade.nome, { x: 0.5, y: 0.35, fontSize: 24, bold: true, color: "202848" });
    s.addText(
      `Real ${brl(p.unidade.payrollActual)}   |   Orçado ${brl(p.unidade.payrollForecast)}   |   Desvio ${brl(p.unidade.desvioValor)} (${pct(p.unidade.desvioPercentual)})`,
      { x: 0.5, y: 1.05, fontSize: 13, color: "2A4999" },
    );
    const parecer = (p.review?.justificativa_bp || p.review?.parecer_diretoria || "Parecer não preenchido.")
      .split("\n")
      .join(" ")
      .slice(0, 320);
    s.addText(parecer, { x: 0.5, y: 1.6, w: 12, fontSize: 12, color: "333333" });
    const top3 = [...p.unidade.desvioPorConta]
      .filter((c) => !c.favoravel)
      .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
      .slice(0, 3);
    s.addText(
      top3.map((c) => ({
        text: `${c.conta}: ${brl(c.valor)} (${pct(c.percentual)})`,
        options: { bullet: true, fontSize: 13, color: "202848", breakLine: true },
      })),
      { x: 0.5, y: 2.8, w: 12 },
    );
  }

  await pptx.writeFile({ fileName: nomeArquivo(nomeBase, "pptx") });
}
