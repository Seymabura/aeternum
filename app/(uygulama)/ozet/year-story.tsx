"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Share2, X } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { shareOrDownload } from "@/lib/share";
import { yearStoryCard } from "@/lib/story-card";

export type StoryData = {
  name: string;
  count: number;
  onTime: number;
  bestStreak: number;
  lights: number;
  days: number[];
  moments: string[];
  word: string | null;
  habits: string[];
  letter: { opensAt: string } | null;
};

type Slide = { id: string; render: () => React.ReactNode };
const ease = [0.22, 1, 0.36, 1] as const;

function Big({ children }: { children: React.ReactNode }) {
  return <h2 className="display text-[2.75rem] leading-[1.02] sm:text-[4.5rem]">{children}</h2>;
}

export function YearStory({ data }: { data: StoryData }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    try {
      const blob = await yearStoryCard({
        count: data.count,
        bestStreak: data.bestStreak,
        word: data.word,
        done: data.days,
      });
      await shareOrDownload(blob, "aeternum-2026.png", "2026'm");
    } catch {
      toast.error("Kart hazırlanamadı. Tekrar dene.");
    } finally {
      setBusy(false);
    }
  }

  const slides = useMemo<Slide[]>(() => {
    const s: Slide[] = [
      {
        id: "acilis",
        render: () => (
          <>
            <p className="text-ink-soft">{data.name ? `${data.name}, ` : ""}bu Aralık kendine</p>
            <Big>
              <span className="num gold-shine">{data.count}</span> kez zaman ayırdın.
            </Big>
            <p className="mt-6 text-ink-soft">31 günün {data.count} tanesi. Her biri Aralık takımyıldızında bir yıldız oldu.</p>
          </>
        ),
      },
      {
        id: "seri",
        render: () => (
          <dl className="grid w-full grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              { n: data.bestStreak, l: "gün üst üste" },
              { n: data.onTime, l: "görev tam gününde" },
              { n: data.lights, l: "küçük ışık" },
            ].map((x) => (
              <div key={x.l}>
                <dd className="display num text-[4.5rem] leading-none text-gold sm:text-[5.5rem]">{x.n}</dd>
                <dt className="mt-3 text-ink-soft">{x.l}</dt>
              </div>
            ))}
          </dl>
        ),
      },
    ];
    if (data.moments.length)
      s.push({
        id: "anlar",
        render: () => (
          <>
            <p className="text-ink-soft">Bu yılın en güzel anları</p>
            <ol className="mt-8 space-y-6">
              {data.moments.map((m, k) => (
                <li key={k} className="display text-[1.9rem] leading-tight sm:text-[2.6rem]">
                  {m}
                </li>
              ))}
            </ol>
          </>
        ),
      });
    if (data.word)
      s.push({
        id: "kelime",
        render: () => (
          <>
            <p className="text-ink-soft">2027&apos;nin kelimesi</p>
            <p className="display gold-shine mt-6 break-words text-[4rem] italic leading-none sm:text-[7rem]">{data.word}</p>
          </>
        ),
      });
    if (data.habits.length)
      s.push({
        id: "aliskanlik",
        render: () => (
          <>
            <p className="text-ink-soft">2027&apos;de seninle gelecek alışkanlıklar</p>
            <ul className="mt-8 space-y-5">
              {data.habits.map((h, k) => (
                <li key={k} className="flex gap-4 text-[1.4rem] sm:text-[1.8rem]">
                  <span aria-hidden className="text-champagne">✦</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </>
        ),
      });
    s.push({
      id: "mektup",
      render: () =>
        data.letter ? (
          <>
            <p className="text-ink-soft">Bir de mektubun var</p>
            <Big>Mühürlendi.</Big>
            <p className="mt-6 text-ink-soft">
              {new Date(data.letter.opensAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} günü açılacak. O zamana kadar
              kimse okuyamaz, sen de.
            </p>
          </>
        ) : (
          <>
            <p className="text-ink-soft">Son bir şey</p>
            <Big>2027&apos;deki sana yaz.</Big>
            <Link href="/mektup" className="btn btn-primary mt-8">
              Mektubunu yaz
            </Link>
          </>
        ),
    });
    s.push({
      id: "kure",
      render: () => (
        <div className="flex w-full flex-col items-center text-center">
          <ProgressRing done={data.days} className="max-w-[360px]">
            <span className="display num text-[3.4rem] leading-none">{data.count}</span>
            <span className="mt-1 text-xs text-ink-soft">/31 gün</span>
          </ProgressRing>
          <h2 className="display mt-2 text-[2.4rem] sm:text-[3.2rem]">Bu senin 2026&apos;n.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn btn-primary" onClick={share} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" strokeWidth={1.5} />} Kartı paylaş
            </button>
            <Link href="/takvim" className="btn btn-ghost">
              Takvime dön
            </Link>
          </div>
        </div>
      ),
    });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, busy]);

  const last = slides.length - 1;
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(last, x + d))), [last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [go]);

  const slide = slides[i];
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black" role="region" aria-roledescription="hikâye" aria-label="2026 özetin">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(220,199,161,.10), transparent 60%)" }} />
      <div className="night-stars pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 flex items-center gap-1.5 px-4 pt-[max(16px,env(safe-area-inset-top))]">
        {slides.map((x, k) => (
          <span key={x.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
            <span className="block h-full rounded-full bg-champagne transition-[width] duration-500" style={{ width: k <= i ? "100%" : "0%" }} />
          </span>
        ))}
        <Link href="/takvim" aria-label="Kapat" className="ml-2 grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:text-ink">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center">
        {/* dokunma alanları */}
        {i > 0 && <button aria-label="Önceki" className="absolute inset-y-0 left-0 z-0 w-1/3 cursor-w-resize" onClick={() => go(-1)} />}
        {i < last && <button aria-label="Sonraki" className="absolute inset-y-0 right-0 z-0 w-2/3 cursor-e-resize" onClick={() => go(1)} />}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="pointer-events-none relative z-[1] mx-auto w-full max-w-2xl px-7 [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.7, ease }}
          >
            {slide.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-sm text-ink-mute">
        <button onClick={() => go(-1)} disabled={i === 0} className="inline-flex items-center gap-1 disabled:opacity-0">
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>
        <span className="num">
          {i + 1}/{slides.length}
        </span>
        <button onClick={() => go(1)} disabled={i === last} className="inline-flex items-center gap-1 disabled:opacity-0">
          İleri <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
