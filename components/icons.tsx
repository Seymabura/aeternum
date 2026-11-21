/** Siteye özel küçük ikonlar (lucide çizgi diliyle uyumlu) */

export function Globe({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={className}>
      <circle cx="12" cy="10" r="7.5" />
      <path d="M6.5 19.5h11M8 17l-1 2.5M16 17l1 2.5" />
      <path d="M9 11.5l1.5-2.5 1.5 2.5M11 8.5l1.2-2 1.3 2" opacity=".7" />
    </svg>
  );
}

export function Moons({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  // iki iç içe hilal
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.5 4.2a7.5 7.5 0 1 0 6.3 11.6A6 6 0 0 1 10.5 4.2Z" />
      <path d="M15.6 3.6a5.6 5.6 0 0 1 4.9 8.3 4.4 4.4 0 0 0-4.9-8.3Z" opacity=".75" />
    </svg>
  );
}

