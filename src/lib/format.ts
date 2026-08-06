export const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);

export const brlCompacto = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}R$ ${(abs / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  if (abs >= 1_000) return `${v < 0 ? "-" : ""}R$ ${(abs / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return brl(v);
};

export const pct = (v: number, casas = 1) =>
  `${v > 0 ? "+" : ""}${v.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;

export const seta = (favoravel: boolean) => (favoravel ? "▼" : "▲");
