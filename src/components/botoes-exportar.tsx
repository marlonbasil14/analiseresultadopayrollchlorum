import { useState } from "react";
import { FileSpreadsheet, FileText, Presentation } from "lucide-react";

import { exportarExcel, exportarPdf, exportarPptx, type PacoteUnidade } from "@/lib/exportar";

export function BotoesExportar({
  pacote,
  nomeBase,
  titulo,
  autor,
  compacto,
}: {
  pacote: PacoteUnidade[];
  nomeBase: string;
  titulo: string;
  autor?: string | null;
  compacto?: boolean;
}) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const rodar = async (tipo: string, fn: () => Promise<void>) => {
    setErro(null);
    setOcupado(tipo);
    try {
      await fn();
    } catch (e) {
      setErro(`Não foi possível exportar: ${(e as Error).message}`);
    } finally {
      setOcupado(null);
    }
  };

  const cls = `inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 ${
    compacto ? "text-xs" : "text-sm"
  } font-semibold hover:bg-accent disabled:opacity-60`;

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={ocupado !== null}
          onClick={() => rodar("pdf", () => exportarPdf(pacote, nomeBase, titulo, autor))}
          className={cls}
        >
          <FileText className="h-4 w-4" /> {ocupado === "pdf" ? "Gerando…" : "Exportar PDF"}
        </button>
        <button
          type="button"
          disabled={ocupado !== null}
          onClick={() => rodar("xlsx", () => exportarExcel(pacote, nomeBase))}
          className={cls}
        >
          <FileSpreadsheet className="h-4 w-4" /> {ocupado === "xlsx" ? "Gerando…" : "Exportar Excel"}
        </button>
        <button
          type="button"
          disabled={ocupado !== null}
          onClick={() => rodar("pptx", () => exportarPptx(pacote, nomeBase, titulo))}
          className={cls}
        >
          <Presentation className="h-4 w-4" /> {ocupado === "pptx" ? "Gerando…" : "Exportar PPTX"}
        </button>
      </div>
      {erro ? <p className="mt-2 text-xs text-unfavorable">{erro}</p> : null}
    </div>
  );
}
