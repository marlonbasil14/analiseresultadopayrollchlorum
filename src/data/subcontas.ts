import { composicaoDe } from "@/data/ciclos";

export type SubConta = { conta: string; valor: number };

export type ComposicaoUnidade = {
  actual: Record<string, SubConta[]> | null;
  forecast: Record<string, SubConta[]> | null;
};

/** Composição por sub-conta (lida do banco); null quando indisponível no ciclo. */
export function subcontasDe(
  slug: string,
  conta: string,
  lado: "actual" | "forecast",
  ciclo?: string,
): SubConta[] | null {
  const unidade = composicaoDe(ciclo, slug);
  if (!unidade) return null;
  const bloco = unidade[lado];
  if (!bloco) return null;
  const lista = bloco[conta];
  if (!lista || lista.length === 0) return [];
  return [...lista].sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
}
