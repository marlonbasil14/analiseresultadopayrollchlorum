import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { classificarEfeito, EFEITO_LABEL, type DesvioConta } from "@/data/payroll";
import { subcontasDe, type SubConta } from "@/data/subcontas";
import { brl, pct, seta } from "@/lib/format";

function ComposicaoLista({
  titulo,
  itens,
}: {
  titulo: string;
  itens: SubConta[] | null;
}) {
  const total = itens ? itens.reduce((acc, i) => acc + Math.abs(i.valor), 0) : 0;

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </p>
      {itens === null ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Composição indisponível para este ciclo.
        </p>
      ) : itens.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">Sem lançamentos nesta conta.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {itens.map((i) => (
            <li key={i.conta} className="text-xs">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 flex-1 truncate">{i.conta}</span>
                <span className="shrink-0 tabular-nums font-semibold">{brl(i.valor)}</span>
                <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
                  {total > 0 ? `${((Math.abs(i.valor) / total) * 100).toFixed(1)}%` : "—"}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand/60"
                  style={{
                    width: `${total > 0 ? Math.max(2, (Math.abs(i.valor) / total) * 100) : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DesvioBar({
  item,
  maxPct,
  nota,
  slug,
}: {
  item: DesvioConta;
  maxPct: number;
  nota?: string | undefined;
  slug?: string | undefined;
}) {
  const [aberto, setAberto] = useState(false);
  const largura = Math.max(4, Math.min(100, (Math.abs(item.percentual) / maxPct) * 100));
  const efeito = classificarEfeito(item.conta);
  const cor = item.favoravel ? "bg-favorable" : "bg-unfavorable";
  const texto = item.favoravel ? "text-favorable" : "text-unfavorable";

  const actual = slug ? subcontasDe(slug, item.conta, "actual") : null;
  const forecast = slug ? subcontasDe(slug, item.conta, "forecast") : null;
  const expansivel = Boolean(slug);

  return (
    <div className="py-3">
      <button
        type="button"
        onClick={() => expansivel && setAberto((v) => !v)}
        aria-expanded={aberto}
        className={`w-full text-left ${expansivel ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            {expansivel ? (
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  aberto ? "rotate-180" : ""
                }`}
              />
            ) : null}
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
      </button>

      {expansivel && aberto ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ComposicaoLista titulo="Composição do Actual" itens={actual} />
          <ComposicaoLista titulo="Composição do Forecast" itens={forecast} />
          <p className="text-[11px] text-muted-foreground md:col-span-2">
            Actual vem do plano de contas contábil (SAP) e Forecast das rubricas de folha — as duas
            taxonomias não são pareáveis linha a linha, por isso são exibidas lado a lado.
          </p>
        </div>
      ) : null}
    </div>
  );
}
