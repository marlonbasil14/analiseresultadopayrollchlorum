/**
 * Fonte única de verdade da identidade visual Chlorum Solutions para os
 * geradores de exportação (PDF, Excel, PPTX). Valores extraídos do
 * Design System oficial (tokens/colors.css e tokens/typography.css).
 */

import logoPositivo from "@/assets/chlorum-logo-positivo.png.asset.json";
import logoNegativo from "@/assets/chlorum-logo-negativo.png.asset.json";
import nunito300 from "@/assets/Nunito_300Light.ttf.asset.json";
import nunito600 from "@/assets/Nunito_600SemiBold.ttf.asset.json";
import nunito700 from "@/assets/Nunito_700Bold.ttf.asset.json";
import nunito800 from "@/assets/Nunito_800ExtraBold.ttf.asset.json";

// ----------------------------- Cores -----------------------------

export const CHL = {
  blue900: "#16264a",
  blue800: "#1c3266",
  blue700: "#223c7c",
  blue600: "#2a4999",
  blue500: "#3a5cb8",
  blue400: "#5b7fd0",
  blue300: "#79b7e5",
  blue200: "#a9d1ef",
  blue100: "#d6ebf8",
  blue50: "#f0f8fd",

  navy900: "#171d33",
  navy800: "#202848",
  navy700: "#2b345c",

  ink: "#000000",
  white: "#ffffff",

  gray900: "#1b1f29",
  gray700: "#434852",
  gray500: "#767a83",
  gray300: "#b4b7be",
  gray200: "#d2d4da",
  gray100: "#e9ebef",
  gray50: "#f7f8fa",

  success: "#269e5f",
  warning: "#e1a100",
  danger: "#d33a3c",
} as const;

/** Hex sem "#" — formato exigido por pptxgenjs e ARGB do Excel. */
export const hexPuro = (hex: string) => hex.replace("#", "").toUpperCase();
export const argb = (hex: string) => `FF${hexPuro(hex)}`;

/** [r, g, b] — formato exigido por jsPDF. */
export const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

/** Mistura hex com branco (0 = cor sólida, 1 = branco) — usado nos badges tintados. */
export const tint = (hex: string, quantidade: number) => {
  const [r, g, b] = rgb(hex);
  const m = (c: number) => Math.round(c + (255 - c) * quantidade);
  return `#${[m(r), m(g), m(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

export const corDesvio = (favoravel: boolean) => (favoravel ? CHL.success : CHL.danger);

// --------------------------- Tipografia ---------------------------

/** Escala de tipo da marca (px). Nunito é a fonte única. */
export const TIPO = {
  tituloCapa: { size: 44, weight: 800 },
  subtituloSecao: { size: 26, weight: 700 },
  cabecalhoCard: { size: 20, weight: 600 },
  corpo: { size: 16, weight: 300 },
  corpoDestaque: { size: 16, weight: 600 },
  legenda: { size: 14, weight: 400 },
  label: { size: 13, weight: 700, letterSpacing: 0.06 },
} as const;

export const FONTE = "Nunito";
export const FONTE_FALLBACK = "Calibri";

/** Raio padrão dos cards (px / pt). */
export const RAIO = 10;

// ----------------------- Carregamento binário ----------------------

async function comoBase64(url: string) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Falha ao carregar ${url}`);
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  let binario = "";
  for (let i = 0; i < bytes.length; i += 1) binario += String.fromCharCode(bytes[i]!);
  return btoa(binario);
}

export type ArquivoFonte = {
  arquivo: string;
  familia: string;
  estilo: "normal" | "bold";
  peso: number;
  base64: string;
};

let cacheFontes: ArquivoFonte[] | null = null;

/**
 * Fontes Nunito (.ttf) embutidas no PDF — não dependem de fonte instalada.
 * Famílias registradas: Nunito (300 normal / 700 bold), NunitoSemi (600), NunitoX (800).
 */
export async function carregarFontesNunito(): Promise<ArquivoFonte[]> {
  if (cacheFontes) return cacheFontes;
  const origem = [
    { url: nunito300.url, arquivo: "Nunito-Light.ttf", familia: "Nunito", estilo: "normal" as const, peso: 300 },
    { url: nunito700.url, arquivo: "Nunito-Bold.ttf", familia: "Nunito", estilo: "bold" as const, peso: 700 },
    { url: nunito600.url, arquivo: "Nunito-SemiBold.ttf", familia: "NunitoSemi", estilo: "normal" as const, peso: 600 },
    { url: nunito800.url, arquivo: "Nunito-ExtraBold.ttf", familia: "NunitoX", estilo: "normal" as const, peso: 800 },
  ];

  const carregadas = await Promise.all(
    origem.map(async (f) => ({
      arquivo: f.arquivo,
      familia: f.familia,
      estilo: f.estilo,
      peso: f.peso,
      base64: await comoBase64(f.url),
    })),
  );
  cacheFontes = carregadas;
  return carregadas;
}

export type LogoCarregado = { dataUrl: string; largura: number; altura: number; proporcao: number };

const cacheLogos: Record<string, LogoCarregado> = {};

/** Proporção oficial do lockup (largura:altura). */
export const LOGO_PROPORCAO = 3.57;

export async function carregarLogo(
  variante: "positivo" | "negativo" = "positivo",
): Promise<LogoCarregado> {
  const cache = cacheLogos[variante];
  if (cache) return cache;
  const asset = variante === "positivo" ? logoPositivo : logoNegativo;
  const base64 = await comoBase64(asset.url);
  const largura = variante === "positivo" ? 3178 : 1553;
  const altura = variante === "positivo" ? 888 : 391;
  const logo: LogoCarregado = {
    dataUrl: `data:image/png;base64,${base64}`,
    largura,
    altura,
    proporcao: largura / altura,
  };
  cacheLogos[variante] = logo;
  return logo;
}
