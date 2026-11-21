import Link from "next/link";
import { ArrowRight, Palette, Sparkles } from "lucide-react";
import { getProgress } from "@/lib/data";
import { BONUSES, TASKS } from "@/lib/tasks";
import { Countdown } from "@/components/countdown";
import { AdventGrid } from "./advent-grid";
import { BonusList } from "./bonus-list";

export const metadata = { title: "Takvim" };

export default async function CalendarPage() {
  const p = await getProgress();
  const done = p.entries.map((e) => e.day);
  const onTime = p.entries.filter((e) => e.on_time).map((e) => e.day);
  const bonuses = BONUSES.filter((b) => b.openDay <= p.today);
  const todayTask = TASKS.find((t) => t.day === p.today);
  const todayDone = done.includes(p.today);

  return (
    <div className="space-y-8">
      <section className="rise">
        <p className="eyebrow">aralık defteri</p>
        {p.today === 0 ? (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">Takvimin <em className="gold-shine italic">hazırlanıyor</em></h1>
            <p className="mt-2 text-ink-soft">
              İlk kutu 1 Aralık 00:00&apos;da açılıyor:{" "}
              <Countdown mode="december" className="font-semibold tabular-nums text-ink" />. Bu arada aşağıdaki hazırlık
              emekleriyle boyamanda bölüm açabilir, dilek panonu kurabilirsin.
            </p>
          </>
        ) : p.today <= 31 ? (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">
              {p.today} Aralık{todayDone ? ", bugünün emeği tamam" : ""}
            </h1>
            <p className="mt-2 text-ink-soft">
              {todayDone ? "Yarının kutusu " : "Bugünün kutusu açık. Sonraki kutu "}
              <Countdown mode="midnight" className="font-semibold tabular-nums text-ink" /> sonra açılıyor.
            </p>
            {todayTask && !todayDone && (
              <Link href={`/takvim/${p.today}`} className="sheet mt-5 flex items-center justify-between gap-4 p-4 hover:shadow-[var(--shadow-lift)]">
                <span>
                  <span className="label !mb-1">Bugünün görevi</span>
                  <span className="display text-xl">{todayTask.title}</span>
                </span>
                <span className="btn btn-primary shrink-0">
                  Aç <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )}
          </>
        ) : (
          <h1 className="display mt-3 text-5xl sm:text-6xl">Yıl bitti, defterin dolu ✨</h1>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="display text-3xl italic">Aralık</h2>
          <p className="text-sm text-ink-soft">
            {done.length}/31 kutu · en uzun seri {p.bestStreak}
          </p>
        </div>
        <AdventGrid today={p.today} done={done} onTime={onTime} />
        <p className="mt-3 text-xs text-ink-soft">
          Kaçırdığın günleri sonradan da yapabilirsin; resmin yine açılır ama seri 🔥 bozulur.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="sheet p-5">
          <h2 className="display text-3xl">{p.today === 0 ? "Hazırlık emekleri" : "Küçük emekler"}</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            İstersen ekstra emekle resmini daha hızlı açabilirsin. Her biri boyamada bir bölüm daha açar.
          </p>
          <BonusList items={bonuses} done={p.bonusIds} />
          {p.today < 28 && (
            <p className="mt-3 text-xs text-ink-soft">Yeni küçük emekler Aralık boyunca iki günde bir açılır.</p>
          )}
        </section>
        <div className="grid gap-4 self-start">
          <Link href="/boyama" className="sheet group flex items-center gap-4 p-5 hover:shadow-[var(--shadow-lift)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-champagne/25 bg-champagne/10 text-champagne">
              <Palette />
            </span>
            <span className="flex-1">
              <span className="display block text-2xl">Emek boyama</span>
              <span className="text-sm text-ink-soft">{p.effort}/32 bölüm açık</span>
            </span>
            <ArrowRight className="text-ink-soft transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/pano" className="sheet group flex items-center gap-4 p-5 hover:shadow-[var(--shadow-lift)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-champagne/25 bg-champagne/10 text-champagne">
              <Sparkles />
            </span>
            <span className="flex-1">
              <span className="display block text-2xl">Duvar kağıdı stüdyosu</span>
              <span className="text-sm text-ink-soft">Telefonun için tasarla</span>
            </span>
            <ArrowRight className="text-ink-soft transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
