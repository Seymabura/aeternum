"use client";

import { useEffect, useState } from "react";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { msUntilDecember, msUntilTrMidnight } from "@/lib/day";
import { cn } from "@/lib/utils";

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function useRemaining(mode: "december" | "midnight") {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const f = () => setMs(mode === "december" ? msUntilDecember() : msUntilTrMidnight());
    f();
    const t = setInterval(f, 1000);
    return () => clearInterval(t);
  }, [mode]);
  return ms;
}

const two = { minimumIntegerDigits: 2 } as const;

/** Satır içi geri sayım: "10 gün 04:12:09" */
export function Countdown({ mode, className }: { mode: "december" | "midnight"; className?: string }) {
  const ms = useRemaining(mode);
  if (ms === null) return <span className={className}>&nbsp;</span>;
  const { d, h, m, s } = split(ms);
  return (
    <span className={cn("tabular-nums", className)}>
      <NumberFlowGroup>
        {d > 0 && (
          <>
            <NumberFlow value={d} /> gün{" "}
          </>
        )}
        <NumberFlow value={h} format={two} />:<NumberFlow value={m} format={two} />:
        <NumberFlow value={s} format={two} />
      </NumberFlowGroup>
    </span>
  );
}

/** Büyük geri sayım şeridi: ince altın çizgilerle ayrılmış Bodoni rakamlar */
export function BigCountdown({ mode }: { mode: "december" | "midnight" }) {
  const ms = useRemaining(mode);
  const { d, h, m, s } = split(ms ?? 0);
  const cells = [
    { v: d, l: "gün" },
    { v: h, l: "saat" },
    { v: m, l: "dakika" },
    { v: s, l: "saniye" },
  ];
  return (
    <div className="grid grid-cols-4">
      <NumberFlowGroup>
        {cells.map((c, i) => (
          <div key={c.l} className="relative flex flex-col items-center px-1 py-2">
            {i > 0 && <span aria-hidden className="hairline-v absolute inset-y-0 left-0" />}
            <span className="display num text-[2.6rem] font-light leading-none text-ink sm:text-[5.5rem]">
              {ms === null ? "––" : <NumberFlow value={c.v} format={two} />}
            </span>
            <span className="mt-3 text-xs text-ink-soft sm:text-sm">{c.l}</span>
          </div>
        ))}
      </NumberFlowGroup>
    </div>
  );
}
