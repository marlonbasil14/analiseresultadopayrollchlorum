import { CHL } from "@/lib/chlorum-design-tokens";

/**
 * Classificação ÚNICA de leitura de desvio de payroll (custo).
 *
 * Entrada: percentual "acima do orçado" — (Real − Orçado) / Orçado × 100, em módulo de custo.
 * Positivo = gastou mais que o orçado. Negativo = gastou menos (favorável).
 * Na base de unidades isso corresponde a `desvioPercentual` (desvioValor positivo ⇒ percentual negativo ⇒ favorável).
 *
 * Faixas:
 *  - favorável (verde): realizado < orçado
 *  - em linha (âmbar suave): realizado = orçado ou acima em até 1%
 *  - desfavorável (vermelho): acima do orçado em mais de 1%
 */
export const LIMITE_EM_LINHA = 1;

export type ZonaDesvio = "favoravel" | "em-linha" | "desfavoravel";

export function zonaDesvio(percentualAcima: number): ZonaDesvio {
  const p = Math.round(percentualAcima * 100) / 100;
  if (p < 0) return "favoravel";
  if (p <= LIMITE_EM_LINHA) return "em-linha";
  return "desfavoravel";
}

const TEXTO: Record<ZonaDesvio, string> = {
  favoravel: "text-favorable",
  "em-linha": "text-atencao-foreground",
  desfavoravel: "text-unfavorable",
};
/** Variante para fundos escuros (navy). */
const TEXTO_ESCURO: Record<ZonaDesvio, string> = {
  favoravel: "text-favorable",
  "em-linha": "text-atencao",
  desfavoravel: "text-unfavorable",
};
const SELO: Record<ZonaDesvio, string> = {
  favoravel: "bg-favorable/20 text-favorable",
  "em-linha": "bg-atencao/20 text-atencao",
  desfavoravel: "bg-unfavorable/20 text-unfavorable",
};
const BARRA: Record<ZonaDesvio, string> = {
  favoravel: "bg-favorable",
  "em-linha": "bg-atencao",
  desfavoravel: "bg-unfavorable",
};
const LEITURA: Record<ZonaDesvio, string> = {
  favoravel: "Favorável",
  "em-linha": "Em linha",
  desfavoravel: "Desfavorável",
};
const COR_HEX: Record<ZonaDesvio, string> = {
  favoravel: CHL.success,
  "em-linha": CHL.warning,
  desfavoravel: CHL.danger,
};

export function classificarDesvio(percentualAcima: number) {
  const zona = zonaDesvio(percentualAcima);
  const exato = Math.round(percentualAcima * 100) === 0;
  return {
    zona,
    favoravel: zona === "favoravel",
    texto: TEXTO[zona],
    textoEscuro: TEXTO_ESCURO[zona],
    selo: SELO[zona],
    barra: BARRA[zona],
    leitura: LEITURA[zona],
    corHex: COR_HEX[zona],
    seta: zona === "favoravel" ? "▼" : exato ? "=" : "▲",
    rotulo:
      zona === "favoravel"
        ? "abaixo do orçado"
        : zona === "desfavoravel"
          ? "acima do orçado"
          : exato
            ? "em linha com o orçado"
            : "levemente acima do orçado (quase em linha)",
    /** Frase final do farol. */
    frase: zona === "favoravel" ? "Dentro do orçado" : zona === "em-linha" ? "Quase em linha" : "Fora do orçado",
    /** Posição (0–100%) do marcador na régua do farol. */
    posicao: posicaoMarcador(percentualAcima),
  };
}

/** Pesos visuais das faixas da régua (verde : âmbar : vermelho). */
export const FAIXAS_REGUA = { favoravel: 40, emLinha: 20, desfavoravel: 40 } as const;
const LIMITE_REGUA = 8;

/** Régua por faixa: −8%…0% (verde), 0…+1% (âmbar), +1%…+8% (vermelho); cada faixa é linear. */
export function posicaoMarcador(percentualAcima: number) {
  const p = Math.max(-LIMITE_REGUA, Math.min(LIMITE_REGUA, percentualAcima));
  const { favoravel: V, emLinha: A, desfavoravel: R } = FAIXAS_REGUA;
  const z = zonaDesvio(p);
  if (z === "favoravel") return ((p + LIMITE_REGUA) / LIMITE_REGUA) * V * 0.98;
  if (z === "em-linha") return V + (Math.max(0, p) / LIMITE_EM_LINHA) * A;
  return V + A + ((p - LIMITE_EM_LINHA) / (LIMITE_REGUA - LIMITE_EM_LINHA)) * R;
}
