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


export function Lantern({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  // kâğıt dilek feneri
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 4.5h11l-1.4 12.5H7.9L6.5 4.5Z" />
      <path d="M10 4.5 10.6 17M14 4.5 13.4 17" opacity=".55" />
      <path d="M12 19.2c.9 0 1.4-.6 1.4-1.2 0-.7-.6-1-1.4-2-.8 1-1.4 1.3-1.4 2 0 .6.5 1.2 1.4 1.2Z" />
    </svg>
  );
}
