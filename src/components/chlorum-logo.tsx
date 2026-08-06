import positivo from "@/assets/chlorum-logo-positivo.png.asset.json";
import negativo from "@/assets/chlorum-logo-negativo.png.asset.json";

/**
 * Lockup oficial Chlorum Solutions (gota + wordmark).
 * `variante="negativo"` para fundos escuros (navy), `positivo` para fundos claros.
 */
export function ChlorumLogo({
  className = "",
  variante = "negativo",
}: {
  className?: string;
  variante?: "positivo" | "negativo";
}) {
  const asset = variante === "positivo" ? positivo : negativo;
  return (
    <img
      src={asset.url}
      alt="Chlorum Solutions"
      width={640}
      height={160}
      className={`h-8 w-auto md:h-9 ${className}`}
    />
  );
}
