import type { ReactNode } from "react";

export function KpiCard({
  rotulo,
  valor,
  detalhe,
  tom = "neutro",
}: {
  rotulo: string;
  valor: ReactNode;
  detalhe?: ReactNode;
  tom?: "neutro" | "favoravel" | "desfavoravel";
}) {
  const tomClass =
    tom === "favoravel"
      ? "text-favorable"
      : tom === "desfavoravel"
        ? "text-unfavorable"
        : "text-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {rotulo}
      </p>
      <p className={`mt-3 text-2xl font-bold tabular-nums tracking-tight ${tomClass}`}>{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}
