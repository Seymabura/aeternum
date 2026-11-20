"use client";

import { useEffect, useState } from "react";
import { msUntilDecember, msUntilTrMidnight } from "@/lib/day";

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
const pad = (n: number) => String(n).padStart(2, "0");

/** mode="december": 1 Aralık'a; mode="midnight": bir sonraki kutuya */
export function Countdown({ mode, className }: { mode: "december" | "midnight"; className?: string }) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const f = () => setMs(mode === "december" ? msUntilDecember() : msUntilTrMidnight());
    f();
    const t = setInterval(f, 1000);
    return () => clearInterval(t);
  }, [mode]);
  if (ms === null) return <span className={className}>&nbsp;</span>;
  const { d, h, m, s } = split(ms);
  return (
    <span className={className} suppressHydrationWarning>
      {d > 0 && <>{d} gün </>}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
