"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LIDS = [
  { bg: "#7a1f2b", fg: "#f6e3cf", pat: "dots" },
  { bg: "#1e3a2f", fg: "#e8d7b5", pat: "stripes" },
  { bg: "#c8922a", fg: "#fff3d9", pat: "stars" },
  { bg: "#a9835f", fg: "#fbf1e1", pat: "grid" },
  { bg: "#e2863b", fg: "#fff1de", pat: "dots" },
  { bg: "#5c4636", fg: "#f3e2c8", pat: "stars" },
  { bg: "#2f5a47", fg: "#f1e6cc", pat: "grid" },
  { bg: "#8c3a2a", fg: "#f8e4cc", pat: "stripes" },
] as const;

function lidStyle(day: number): React.CSSProperties {
  const l = LIDS[(day * 5) % LIDS.length];
  const fg = l.fg + "33";
  const pats: Record<string, string> = {
    dots: `radial-gradient(${fg} 1.6px, transparent 1.8px) 0 0/12px 12px`,
    stripes: `repeating-linear-gradient(135deg, ${fg} 0 4px, transparent 4px 11px)`,
    grid: `linear-gradient(${fg} 1px, transparent 1px) 0 0/14px 14px, linear-gradient(90deg, ${fg} 1px, transparent 1px) 0 0/14px 14px`,
    stars: `radial-gradient(${fg} 1px, transparent 1.4px) 0 0/9px 9px, radial-gradient(${fg} 2px, transparent 2.3px) 4px 6px/23px 19px`,
  };
  return { background: `${pats[l.pat]}, ${l.bg}`, color: l.fg };
}

export function AdventGrid({ today, done, onTime }: { today: number; done: number[]; onTime: number[] }) {
  const router = useRouter();
  const [opening, setOpening] = useState<number | null>(null);
  const doneSet = new Set(done);
  const onTimeSet = new Set(onTime);

  function open(day: number) {
    if (day > today) {
      const left = day - today;
      toast(today === 0 ? `Bu kutu ${day} Aralık 00:00'da açılacak 🕯️` : `${left} gün sonra açılacak. Sabır da bir emek 🕯️`);
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
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[14px] border border-ink/10 bg-[#fff8ec] shadow-inner">
                {isDone ? (
                  <>
                    <span className="hand text-3xl text-cam">✓</span>
                    <span className="text-[0.65rem] text-ink-soft">{onTimeSet.has(day) ? "zamanında" : "sonradan"}</span>
                  </>
                ) : (
                  <span className="text-2xl">🕯️</span>
                )}
              </div>
              {/* kapak */}
              {!isDone && (
                <div
                  className={cn(
                    "advent-lid flex flex-col justify-between p-2 shadow-[var(--shadow-paper)]",
                    isToday && "glow-today",
                    locked && "saturate-[.55] brightness-[1.04]",
                  )}
                  style={lidStyle(day)}
                >
                  <span className="display text-[1.9rem] font-semibold italic leading-none sm:text-[2.1rem]">{day}</span>
                  <span className="flex items-center justify-between text-[0.66rem] font-semibold uppercase tracking-wider opacity-90">
                    {locked ? <Lock className="h-3.5 w-3.5" /> : isToday ? "bugün" : missed ? "kaçtı" : ""}
                  </span>
                </div>
              )}
              {isDone && (
                <span className="display pointer-events-none absolute left-2 top-1.5 text-lg italic text-ink/70">{day}</span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
