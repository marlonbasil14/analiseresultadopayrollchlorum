import { brl, pct } from "@/lib/format";
import { classificarDesvio, FAIXAS_REGUA } from "@/lib/leitura-desvio";

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
  // Cor, seta, rótulo, frase e posição do marcador saem da MESMA função.
  const c = classificarDesvio(desvioPercentual);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="flex min-w-0 items-baseline justify-between gap-3 sm:block">
          <dt className="text-xs text-muted-foreground">Orçado</dt>
          <dd className="text-base font-bold tabular-nums sm:mt-1 sm:text-sm lg:text-base">{brl(orcado)}</dd>
        </div>
        <div className="flex min-w-0 items-baseline justify-between gap-3 sm:block">
          <dt className="text-xs text-muted-foreground">Realizado</dt>
          <dd className="text-base font-bold tabular-nums sm:mt-1 sm:text-sm lg:text-base">{brl(real)}</dd>
        </div>
        <div className="flex min-w-0 items-baseline justify-between gap-3 border-t border-border pt-3 sm:block sm:border-0 sm:pt-0">
          <dt className="text-xs text-muted-foreground">Desvio</dt>
          <dd className="text-right sm:mt-1 sm:text-left">
            <span className={`text-base font-extrabold tabular-nums ${c.texto}`}>
              <span aria-hidden="true">{c.seta} </span>
              {pct(desvioPercentual)}
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">{c.rotulo}</span>
          </dd>
        </div>
      </dl>

      <div
        className="relative mt-6"
        role="img"
        aria-label={`Régua do farol: ${pct(desvioPercentual)}, ${c.rotulo} — ${c.frase.toLowerCase()}`}
      >
        <div className="absolute -top-3 -translate-x-1/2" style={{ left: `${c.posicao}%` }} aria-hidden="true">
          <div className="h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-foreground" />
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full" aria-hidden="true">
          <div className="bg-favorable" style={{ flexGrow: FAIXAS_REGUA.favoravel }} />
          <div className="bg-atencao" style={{ flexGrow: FAIXAS_REGUA.emLinha }} />
          <div className="bg-unfavorable" style={{ flexGrow: FAIXAS_REGUA.desfavoravel }} />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[2fr_1fr_2fr] text-[10px] uppercase tracking-wide text-muted-foreground" aria-hidden="true">
        <span>≤ 0% · dentro</span>
        <span className="text-center">0 a +1%</span>
        <span className="text-right">&gt; +1% · fora</span>
      </div>

      <p className={`mt-3 text-xs font-semibold ${c.texto}`}>
        {c.frase}{c.zona === "em-linha" ? "" : ` · ${c.leitura.toLowerCase()}`}
      </p>
    </div>
  );
}
