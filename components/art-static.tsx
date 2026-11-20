import type { ArtData } from "@/lib/art";

/** Boyanmış bir resmi statik SVG olarak çizer (önizleme, paylaşım). */
export function ArtStatic({
  art,
  fills,
  openCount,
  className,
  showLocks = true,
}: {
  art: ArtData;
  fills: Record<string, string>;
  openCount?: number;
  className?: string;
  showLocks?: boolean;
}) {
  const sw = Math.max(art.w, art.h) / 520;
  const locked =
    showLocks && openCount !== undefined
      ? art.regions.filter((_, i) => art.sections[i] >= openCount).join("")
      : "";
  return (
    <svg viewBox={`0 0 ${art.w} ${art.h}`} className={className} role="img" aria-label={art.title}>
      <defs>
        <pattern id={`hatch-${art.id}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#efe2c9" />
          <line x1="0" y1="0" x2="0" y2="14" stroke="#c9b28e" strokeWidth="3" />
        </pattern>
      </defs>
      <rect width={art.w} height={art.h} fill="#fffaf1" />
      {art.regions.map((d, i) => (fills[i] ? <path key={i} d={d} fill={fills[i]} /> : null))}
      {locked && <path d={locked} fill={`url(#hatch-${art.id})`} fillRule="evenodd" opacity={0.75} />}
      <path d={art.regions.join("")} fill="none" stroke="#2e2019" strokeWidth={sw} strokeLinejoin="round" />
      {art.lines && <path d={art.lines} fill="none" stroke="#2e2019" strokeWidth={sw * 0.8} strokeLinecap="round" />}
    </svg>
  );
}
