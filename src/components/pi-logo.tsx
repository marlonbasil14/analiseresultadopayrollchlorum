/**
 * Lockup oficial "Payroll Intelligence" (Conceito C — PI Monogram).
 * `reverse` para fundos navy/escuros; `default` para fundos claros.
 * SVG inline (não imagem) para escalar sem perda e permitir reuso.
 */

const TAMANHOS = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
} as const;

export function PILogo({
  variant = "reverse",
  size = "md",
  className = "",
}: {
  variant?: "reverse" | "default";
  size?: keyof typeof TAMANHOS;
  className?: string;
}) {
  const reverso = variant === "reverse";
  return (
    <svg
      viewBox="0 0 500 100"
      role="img"
      aria-label="Payroll Intelligence"
      className={`${TAMANHOS[size]} w-auto ${className}`}
    >
      <title>Payroll Intelligence</title>
      <defs>
        <linearGradient id="pi-badge-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A4999" />
          <stop offset="100%" stopColor="#202848" />
        </linearGradient>
      </defs>
      <circle cx="46" cy="50" r="36" fill={reverso ? "#FFFFFF" : "url(#pi-badge-grad)"} />
      <text
        x="46"
        y="63"
        textAnchor="middle"
        fontFamily="Nunito, 'Segoe UI', sans-serif"
        fontSize="28"
        fontWeight="800"
        fill={reverso ? "#202848" : "#FFFFFF"}
      >
        PI
      </text>
      <text
        x="100"
        y="46"
        fontFamily="Nunito, 'Segoe UI', sans-serif"
        fontSize="24"
        fontWeight="800"
        letterSpacing="2"
        fill={reverso ? "#FFFFFF" : "#202848"}
      >
        PAYROLL INTELLIGENCE
      </text>
      <text
        x="100"
        y="68"
        fontFamily="Nunito, 'Segoe UI', sans-serif"
        fontSize="11"
        letterSpacing="2"
        fill={reverso ? "#9FB0D9" : "#8A93A6"}
      >
        CHLORUM SOLUTIONS
      </text>
    </svg>
  );
}
