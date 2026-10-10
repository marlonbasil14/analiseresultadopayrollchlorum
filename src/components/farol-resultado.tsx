import { brl, pct } from "@/lib/format";
import { classificarDesvio, LIMITE_EM_LINHA } from "@/lib/leitura-desvio";

export function FarolResultado({
  label,
  orcado,
  real,
  desvioPercentual,
}: {
  label: string;
  orcado: number;
  real: number;
  /** Percentual acima do orçado: (Real − Orçado) / Orçado × 100. */
  desvioPercentual: number;
}) {
  const c = classificarDesvio(desvioPercentual);
  // Escala: −8% (esq.) … 0 … +1% … +8% (dir.), pesos visuais 2 : 1,5 : 2,5.
  const VERDE = (2 / 6) * 100;
  const AMBAR = (1.5 / 6) * 100;
  const VERMELHO = (2.5 / 6) * 100;
  const p = Math.max(-8, Math.min(8, desvioPercentual));
  const posicao =
    p < 0
      ? ((p + 8) / 8) * VERDE
      : p <= LIMITE_EM_LINHA
        ? VERDE + (p / LIMITE_EM_LINHA) * AMBAR
        : VERDE + AMBAR + ((p - LIMITE_EM_LINHA) / (8 - LIMITE_EM_LINHA)) * VERMELHO;

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
          <p className={`mt-1 text-base font-extrabold tabular-nums ${c.texto}`}>
            {c.seta} {pct(desvioPercentual)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{c.rotulo}</p>
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
        <span>abaixo do orçado</span>
        <span>em linha (até +1%)</span>
        <span>acima do orçado</span>
      </div>

      <p className={`mt-3 text-xs font-semibold ${c.texto}`}>
        {c.leitura} · {c.rotulo}
      </p>
    </div>
  );
}
