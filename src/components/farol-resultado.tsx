import { brl, pct } from "@/lib/format";

type Zona = "verde" | "laranja" | "vermelho";

function zonaDe(desvioPercentual: number): Zona {
  const abs = Math.abs(desvioPercentual);
  if (abs <= 1) return "verde";
  if (abs <= 3) return "laranja";
  return "vermelho";
}

const ZONA_TEXTO: Record<Zona, string> = {
  verde: "text-favorable",
  laranja: "text-atencao-foreground",
  vermelho: "text-unfavorable",
};

const ZONA_LEGENDA: Record<Zona, string> = {
  verde: "dentro do orçado",
  laranja: "atenção",
  vermelho: "fora do orçado",
};

export function FarolResultado({
  label,
  orcado,
  real,
  desvioPercentual,
}: {
  label: string;
  orcado: number;
  real: number;
  desvioPercentual: number;
}) {
  const zona = zonaDe(desvioPercentual);
  // Escala de 0% a 8% (desvio absoluto, clampado) alinhada às faixas 2 : 1,5 : 2,5.
  const abs = Math.min(8, Math.abs(desvioPercentual));
  const VERDE = (2 / 6) * 100;
  const LARANJA = (1.5 / 6) * 100;
  const VERMELHO = (2.5 / 6) * 100;
  const posicao =
    abs <= 1
      ? (abs / 1) * VERDE
      : abs <= 3
        ? VERDE + ((abs - 1) / 2) * LARANJA
        : VERDE + LARANJA + ((abs - 3) / 5) * VERMELHO;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Orçado</p>
          <p className="mt-1 text-base font-bold tabular-nums">{brl(orcado)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Realizado</p>
          <p className="mt-1 text-base font-bold tabular-nums">{brl(real)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Desvio</p>
          <p className={`mt-1 text-base font-extrabold tabular-nums ${ZONA_TEXTO[zona]}`}>
            {pct(desvioPercentual)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {desvioPercentual > 0 ? "acima do orçado" : desvioPercentual < 0 ? "abaixo do orçado" : "em linha"}
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <div
          className="absolute -top-3 -translate-x-1/2"
          style={{ left: `${posicao}%` }}
          aria-hidden="true"
        >
          <div className="h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-foreground" />
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full">
          <div className="bg-favorable" style={{ flexGrow: 2 }} />
          <div className="bg-atencao" style={{ flexGrow: 1.5 }} />
          <div className="bg-unfavorable" style={{ flexGrow: 2.5 }} />
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>dentro do orçado</span>
        <span>atenção</span>
        <span>fora do orçado</span>
      </div>

      <p className={`mt-3 text-xs font-semibold ${ZONA_TEXTO[zona]}`}>{ZONA_LEGENDA[zona]}</p>
    </div>
  );
}
