"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LIDS = [
  { bg: "linear-gradient(160deg,#1d2a52,#0d1530)", fg: "#e9dcc0", pat: "dots" },
  { bg: "linear-gradient(160deg,#16213f,#0a1122)", fg: "#dcc7a1", pat: "stripes" },
  { bg: "linear-gradient(160deg,#24315c,#111a36)", fg: "#f2eee6", pat: "stars" },
  { bg: "linear-gradient(160deg,#1a2547,#0b132a)", fg: "#b9cdf2", pat: "grid" },
  { bg: "linear-gradient(160deg,#2a2440,#120f22)", fg: "#e9dcc0", pat: "stars" },
  { bg: "linear-gradient(160deg,#18314a,#0a1626)", fg: "#dcc7a1", pat: "dots" },
] as const;

function lidStyle(day: number): React.CSSProperties {
  const l = LIDS[(day * 5) % LIDS.length];
  const fg = l.fg + "22";
  const pats: Record<string, string> = {
    dots: `radial-gradient(${fg} 1.6px, transparent 1.8px) 0 0/12px 12px`,
    stripes: `repeating-linear-gradient(135deg, ${fg} 0 4px, transparent 4px 11px)`,
    grid: `linear-gradient(${fg} 1px, transparent 1px) 0 0/14px 14px, linear-gradient(90deg, ${fg} 1px, transparent 1px) 0 0/14px 14px`,
    stars: `radial-gradient(${fg} 1px, transparent 1.4px) 0 0/9px 9px, radial-gradient(${fg} 2px, transparent 2.3px) 4px 6px/23px 19px`,
  };
  return { background: `${pats[l.pat]}, ${l.bg}`, color: l.fg, border: "1px solid rgba(220,228,255,.1)" };
}

export function AdventGrid({ today, done, onTime }: { today: number; done: number[]; onTime: number[] }) {
  const router = useRouter();
  const [opening, setOpening] = useState<number | null>(null);
  const doneSet = new Set(done);
  const onTimeSet = new Set(onTime);

  function open(day: number) {
    if (day > today) {
      const left = day - today;
      toast(today === 0 ? `Bu kutu ${day} Aralık 00:00'da açılacak` : `${left} gün sonra açılacak. Sabır da bir emek`);
      return;
    }
    if (doneSet.has(day)) {
      router.push(`/takvim/${day}`);
      return;
    }
    setOpening(day);
    setTimeout(() => router.push(`/takvim/${day}`), 650);
  }

  return (
    <ol className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 sm:gap-3 lg:grid-cols-8">
      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
        const isDone = doneSet.has(day);
        const locked = day > today;
        const isToday = day === today;
        const missed = !isDone && !locked && !isToday;
        return (
          <li key={day}>
            <button
              type="button"
              onClick={() => open(day)}
              aria-label={`${day} Aralık${isDone ? ", tamamlandı" : locked ? ", kilitli" : ", açık"}`}
              className={cn("advent-box block w-full text-left", opening === day && "opening")}
            >
              {/* kutunun içi */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[18px] border border-champagne/25 bg-gradient-to-b from-champagne/20 to-champagne/[.04]">
                {isDone ? (
                  <>
                    <span className="display text-3xl text-gold">✓</span>
                    <span className="text-[0.65rem] text-ink-soft">{onTimeSet.has(day) ? "zamanında" : "sonradan"}</span>
                  </>
                ) : (
                  <span className="text-xl text-champagne">✦</span>
                )}
              </div>
              {/* kapak */}
              {!isDone && (
                <div
                  className={cn(
                    "advent-lid flex flex-col justify-between p-2.5 shadow-[0_18px_30px_-18px_rgba(0,0,0,.9)]",
                    isToday && "glow-today",
                    locked && "opacity-55",
                  )}
                  style={lidStyle(day)}
                >
                  <span className="display text-[2rem] italic leading-none sm:text-[2.3rem]">{day}</span>
                  <span className="flex items-center justify-between text-[0.66rem] font-semibold uppercase tracking-wider opacity-90">
                    {locked ? <Lock className="h-3.5 w-3.5" /> : isToday ? "bugün" : missed ? "kaçtı" : ""}
                  </span>
                </div>
              )}
              {isDone && (
                <span className="display pointer-events-none absolute left-2.5 top-2 text-lg italic text-gold/80">{day}</span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
