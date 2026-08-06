export function ChlorumLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand" aria-hidden="true">
        <path
          d="M12 2.5c3.6 4.1 6 7.3 6 10.2A6 6 0 0 1 6 12.7c0-2.9 2.4-6.1 6-10.2Z"
          fill="currentColor"
        />
      </svg>
      <div className="leading-none">
        <div className="text-sm font-bold tracking-[0.18em]">CHLORUM</div>
        <div className="text-[10px] tracking-[0.3em] text-brand">SOLUTIONS</div>
      </div>
    </div>
  );
}
