import { CalendarRange } from "lucide-react";

import type { CicloChave } from "@/data/ciclos";
import { useCicloAtivo } from "@/lib/ciclo";

/** Seletor de período (ciclo) compartilhado por Home, unidade, consolidado e diretoria. */
export function SeletorCiclo({ variante = "default" }: { variante?: "default" | "reverse" }) {
  const { ciclo, ciclos, trocar } = useCicloAtivo();

  const reverse = variante === "reverse";
  const base = reverse
    ? "border-navy-foreground/30 bg-navy-foreground/5 text-navy-foreground"
    : "border-border bg-card text-foreground";

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${base} print:hidden`}
    >
      <CalendarRange className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">Período do ciclo</span>
      <select
        value={ciclo}
        onChange={(e) => trocar(e.target.value as CicloChave)}
        aria-label="Selecionar ciclo"
        className="cursor-pointer bg-transparent pr-1 text-xs font-semibold outline-none"
      >
        {ciclos.map((c) => (
          <option key={c.chave} value={c.chave} className="text-foreground">
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
