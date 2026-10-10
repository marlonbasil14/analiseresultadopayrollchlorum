import type { CicloChave } from "@/data/ciclos";
import { SUBTITULO_RELATORIO, tituloRelatorio } from "@/lib/jornada";

/** Relatório com Pré-Análise do Resultado (PDF) por ciclo. */
export const RELATORIOS_PDF: Record<
  CicloChave,
  { url?: string | undefined; label: string; descricao: string }
> = {
  "2026-07": {
    url: "/relatorio-pdf/2026-07",
    label: tituloRelatorio("2026-07"),
    descricao: SUBTITULO_RELATORIO,
  },
  "2026-08": {
    url: "/relatorio-pdf/2026-08",
    label: tituloRelatorio("2026-08"),
    descricao: SUBTITULO_RELATORIO,
  },
  "2026-09": {
    url: "/relatorio-pdf/2026-09",
    label: tituloRelatorio("2026-09"),
    descricao: SUBTITULO_RELATORIO,
  },
};
