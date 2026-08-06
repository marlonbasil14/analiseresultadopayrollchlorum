import { useEffect, useRef, useState, type ReactNode } from "react";

export function ParallaxHero({
  imagem,
  alt,
  children,
}: {
  imagem: string;
  alt: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setOffset(Math.max(-120, Math.min(120, -rect.top * 0.25)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-navy">
      <img
        src={imagem}
        alt={alt}
        width={1600}
        height={900}
        className="absolute inset-0 h-[130%] w-full object-cover"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/20" />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-6 pb-10">
        {children}
      </div>
    </div>
  );
}
