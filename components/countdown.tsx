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

/** Büyük, kutulu geri sayım */
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
    <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
      <NumberFlowGroup>
        {cells.map((c) => (
          <div key={c.l} className="sheet flex flex-col items-center px-2 py-4 sm:py-6">
            <span className="display text-4xl tabular-nums text-[#ffd59a] [text-shadow:0_0_24px_rgba(242,162,74,.55)] sm:text-6xl">
              {ms === null ? "––" : <NumberFlow value={c.v} format={two} />}
            </span>
            <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink-soft sm:text-xs">{c.l}</span>
          </div>
        ))}
      </NumberFlowGroup>
    </div>
  );
}
