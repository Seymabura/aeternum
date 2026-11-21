"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Lacivert kadife kapak + ince şampanya desen */
const PATS = [
  "radial-gradient(rgba(220,199,161,.16) 1px, transparent 1.3px) 0 0/11px 11px",
  "repeating-linear-gradient(135deg, rgba(220,199,161,.08) 0 1px, transparent 1px 9px)",
  "radial-gradient(rgba(220,199,161,.18) 1px, transparent 1.3px) 0 0/16px 16px, radial-gradient(rgba(220,199,161,.1) 1px, transparent 1.3px) 8px 8px/16px 16px",
];
function lidStyle(day: number): React.CSSProperties {
  const velvet =
    "radial-gradient(120% 90% at 30% 0%, rgba(120,140,200,.16), transparent 60%), linear-gradient(170deg, #17224a 0%, #0d1631 55%, #080e22 100%)";
  return {
    background: `${PATS[day % PATS.length]}, ${velvet}`,
    border: "1px solid rgba(220,199,161,.14)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 14px 28px -18px rgba(0,0,0,.9)",
  };
}

export function AdventGrid({ today, done, onTime }: { today: number; done: number[]; onTime: number[] }) {
  const router = useRouter();
  const [opening, setOpening] = useState<number | null>(null);
  const doneSet = new Set(done);
  const onTimeSet = new Set(onTime);

  function open(day: number) {
    if (day > today) {
      const left = day - today;
      toast(today === 0 ? `Bu kutu ${day} Aralık 00:00'da açılacak` : `${left} gün sonra açılacak. Sabırla bekle`);
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
    <ol className="grid grid-cols-4 gap-2.5 sm:gap-3 md:grid-cols-7 md:gap-4">
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
              <div
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center rounded-[18px]",
                  isDone
                    ? "bg-[linear-gradient(170deg,#f3e6c8_0%,#dcc7a1_55%,#a88a5c_130%)] text-[#1a1408] shadow-[inset_0_1px_0_rgba(255,250,240,.8)]"
                    : "bg-[radial-gradient(circle_at_50%_40%,rgba(255,220,160,.55),rgba(220,199,161,.12)_45%,#0a1122_75%)]",
                )}
              >
                {isDone ? (
                  <>
                    <span className="display num text-[1.75rem] leading-none sm:text-[2rem]">{day}</span>
                    <span className="mt-1 text-[0.625rem] font-medium opacity-70">✓ {onTimeSet.has(day) ? "zamanında" : "sonradan"}</span>
                  </>
                ) : (
                  <span className="text-xl text-gold">✦</span>
                )}
              </div>
              {/* kapak */}
              {!isDone && (
                <div
                  className={cn(
                    "advent-lid flex flex-col items-center justify-center text-ink transition-[filter] duration-300 hover:brightness-125",
                    isToday && "glow-today",
                    locked && "opacity-40",
                  )}
                  style={lidStyle(day)}
                >
                  <span className={cn("display num text-[2rem] leading-none sm:text-[2.4rem]", isToday && "text-gold")}>{day}</span>
                  <span className="absolute bottom-2.5 flex h-4 items-center text-[0.625rem] text-ink-soft">
                    {locked ? <Lock className="h-3 w-3" strokeWidth={1.5} /> : isToday ? <span className="text-champagne">bugün</span> : missed ? "bekliyor" : ""}
                  </span>
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
