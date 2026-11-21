import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProgress } from "@/lib/data";
import { BONUSES, TASKS } from "@/lib/tasks";
import { Countdown } from "@/components/countdown";
import { GlobeHero } from "@/components/globe-hero";
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
  const firstTask = TASKS[0];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* ------------------------------------------------------------ üst: bugün + küre */}
      <section className="grid items-stretch gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="sheet spot rise relative flex flex-col justify-between overflow-hidden p-7 sm:p-10" style={{ borderColor: "rgba(220,199,161,.22)" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(220,199,161,.22), transparent 65%)" }}
          />
          <div className="relative">
            <p className="eyebrow">{p.today === 0 ? "Hazırlık" : p.today <= 31 ? `Gün ${String(p.today).padStart(2, "0")}` : "Yıl bitti"}</p>
            {p.today === 0 ? (
              <>
                <h1 className="display mt-5 text-[2.6rem] sm:text-[4rem]">
                  Küren seni <em className="gold-shine italic">bekliyor.</em>
                </h1>
                <p className="mt-5 max-w-md text-ink-soft">
                  1 Aralık&apos;tan itibaren her gün kendin için küçük bir şey yapacaksın. İlk kutu{" "}
                  <Countdown mode="december" className="text-ink" /> sonra açılıyor.
                </p>
                <div className="mt-8 border-t border-champagne/10 pt-6">
                  <p className="text-sm text-ink-soft">İlk görev</p>
                  <p className="display mt-1 text-[1.6rem]">{firstTask.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">✦ Süsü: {firstTask.gift}</p>
                </div>
              </>
            ) : p.today <= 31 && todayTask ? (
              <>
                <h1 className="display mt-5 text-[2.6rem] sm:text-[4rem]">
                  {todayDone ? (
                    <>
                      Bugün <em className="gold-shine italic">tamam.</em>
                    </>
                  ) : (
                    <>{todayTask.title}</>
                  )}
                </h1>
                <p className="mt-5 max-w-md text-ink-soft">
                  {todayDone ? "Küren biraz daha parladı. Yeni kutu " : todayTask.hint + " Yeni kutu "}
                  <Countdown mode="midnight" className="text-ink" /> sonra.
                </p>
                {!todayDone && (
                  <Link href={`/takvim/${p.today}`} className="btn btn-primary mt-8">
                    Bugünün kutusunu aç <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                )}
              </>
            ) : (
              <h1 className="display mt-5 text-[2.6rem] sm:text-[4rem]">
                Küren <em className="gold-shine italic">tamamlandı.</em>
              </h1>
            )}
          </div>
        </div>

        <Link href="/kure" className="sheet group relative flex flex-col overflow-hidden p-5" aria-label="Küremi gör">
          <GlobeHero days={done} lights={p.bonusIds.length} className="max-w-[360px] transition-transform duration-700 group-hover:scale-[1.02]" />
          <dl className="mt-auto grid grid-cols-3 border-t border-champagne/10 pt-4 text-center">
            {[
              { v: `${done.length}`, s: "/31", l: "süs" },
              { v: `${p.streak}`, s: "", l: "gün seri" },
              { v: `${p.bonusIds.length}`, s: "/17", l: "ışık" },
            ].map((x, i) => (
              <div key={x.l} className="relative">
                {i > 0 && <span aria-hidden className="hairline-v absolute inset-y-0 left-0" />}
                <dd className="display num text-[2rem] leading-none text-ink">
                  {x.v}
                  <span className="text-base text-ink-mute">{x.s}</span>
                </dd>
                <dt className="mt-1.5 text-xs text-ink-soft">{x.l}</dt>
              </div>
            ))}
          </dl>
        </Link>
      </section>

      {/* ------------------------------------------------------------ takvim */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="display text-[2.5rem]">Aralık</h2>
          <p className="text-sm text-ink-soft">En uzun seri {p.bestStreak} gün</p>
        </div>
        <AdventGrid today={p.today} done={done} onTime={onTime} />
        <p className="mt-4 text-[0.8125rem] text-ink-soft">Kaçırdığın günleri sonradan da yapabilirsin. Süsün eklenir ama seriye sayılmaz.</p>
      </section>

      {/* ------------------------------------------------------------ küçük ritüeller */}
      <section className="sheet p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Küçük ritüeller</p>
            <h2 className="display mt-3 text-[2rem]">Kürende bir ışık yak</h2>
          </div>
          <p className="num text-sm text-ink-soft">{p.bonusIds.length}/17 ışık</p>
        </div>
        <p className="mb-5 mt-2 text-sm text-ink-soft">Bir iki kelimelik cevaplar. Her biri kürenin kenarına bir peri ışığı ekler.</p>
        <BonusList items={bonuses} done={p.bonusIds} />
        {p.today < 28 && <p className="mt-3 text-xs text-ink-soft">Yeni ritüeller Aralık boyunca iki günde bir açılır.</p>}
      </section>
    </div>
  );
}
