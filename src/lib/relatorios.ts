import relatorioJulhoAsset from "@/assets/analise-orcamentaria-payroll-julho2026.pdf.asset.json";
import relatorioAgostoAsset from "@/assets/analise-orcamentaria-payroll-agosto2026.pdf.asset.json";
import relatorioSetembroAsset from "@/assets/analise-orcamentaria-payroll-setembro2026.pdf.asset.json";
import type { CicloChave } from "@/data/ciclos";
import { SUBTITULO_RELATORIO, tituloRelatorio } from "@/lib/jornada";

/** Relatório com Pré-Análise do Resultado (PDF) por ciclo. */
export const RELATORIOS_PDF: Record<
  CicloChave,
  { url?: string | undefined; label: string; descricao: string }
> = {
  "2026-07": {
    url: relatorioJulhoAsset.url,
    label: tituloRelatorio("2026-07"),
    descricao: SUBTITULO_RELATORIO,
  },
  "2026-08": {
    url: relatorioAgostoAsset.url,
    label: tituloRelatorio("2026-08"),
    descricao: SUBTITULO_RELATORIO,
  },
  "2026-09": {
    url: relatorioSetembroAsset.url,
    label: tituloRelatorio("2026-09"),
    descricao: SUBTITULO_RELATORIO,
  },
};
