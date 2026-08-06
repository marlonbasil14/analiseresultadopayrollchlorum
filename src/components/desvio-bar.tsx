import { brl, pct, seta } from "@/lib/format";
import { classificarEfeito, EFEITO_LABEL, type DesvioConta } from "@/data/payroll";

export function DesvioBar({
  item,
  maxPct,
  nota,
}: {
  item: DesvioConta;
  maxPct: number;
  nota?: string;
}) {
  const largura = Math.max(4, Math.min(100, (Math.abs(item.percentual) / maxPct) * 100));
  const efeito = classificarEfeito(item.conta);
  const cor = item.favoravel ? "bg-favorable" : "bg-unfavorable";
  const texto = item.favoravel ? "text-favorable" : "text-unfavorable";

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{item.conta}</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {EFEITO_LABEL[efeito]}
          </span>
          {nota ? (
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              {nota}
            </span>
          ) : null}
        </div>
        <div className={`flex items-baseline gap-3 tabular-nums ${texto}`}>
          <span className="text-sm font-semibold">{brl(item.valor)}</span>
          <span className="text-sm font-bold">
            {seta(item.favoravel)} {pct(item.percentual)}
          </span>
        </div>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${largura}%` }} />
      </div>
    </div>
  );
}
