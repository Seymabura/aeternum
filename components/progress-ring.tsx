/** Aralık takımyıldızı: 31 gün bir halkada; tamamlanan günler parlar, bugün nar ile işaretlenir. */
export function ProgressRing({ done, today, fresh, className, children }: { done: number[]; today?: number; fresh?: number; className?: string; children?: React.ReactNode }) {
  const set = new Set(done);
  const pts = Array.from({ length: 31 }, (_, i) => {
    const a = (i / 31) * Math.PI * 2 - Math.PI / 2;
    return { d: i + 1, x: 100 + Math.cos(a) * 82, y: 100 + Math.sin(a) * 82 };
  });
  // tamamlanan ardışık günleri ince altın çizgiyle bağla
  const segs = pts.filter((p, i) => set.has(p.d) && set.has(pts[(i + 1) % 31].d) && p.d !== 31).map((p, i) => ({ a: p, b: pts[(p.d) % 31], k: i }));
  return (
    <div className={"relative mx-auto aspect-square w-full " + (className ?? "")}>
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`31 günün ${done.length} tanesi tamamlandı`}>
        <defs>
          <radialGradient id="pr-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(210,70,92,.18)" />
            <stop offset="1" stopColor="rgba(210,70,92,0)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#pr-glow)" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(220,199,161,.12)" strokeWidth=".6" />
        {segs.map((s) => (
          <line key={s.k} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke="rgba(233,205,150,.55)" strokeWidth=".7" />
        ))}
        {pts.map((p) => {
          const on = set.has(p.d);
          const isToday = today === p.d;
          const isFresh = fresh === p.d;
          return (
            <g key={p.d}>
              {(on || isToday) && <circle cx={p.x} cy={p.y} r={isFresh ? 7 : 5} fill={isToday && !on ? "rgba(210,70,92,.25)" : "rgba(233,205,150,.22)"} className={isFresh ? "pr-pulse" : undefined} />}
              <circle cx={p.x} cy={p.y} r={on ? 2.6 : 1.5} fill={on ? "#f3e2b8" : isToday ? "#d2465c" : "rgba(244,239,230,.28)"} />
              {isToday && <circle cx={p.x} cy={p.y} r="4.6" fill="none" stroke="#d2465c" strokeWidth=".8" />}
            </g>
          );
        })}
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>}
    </div>
  );
}
