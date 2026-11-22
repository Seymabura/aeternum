import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getProgress, requireUser } from "@/lib/data";
import { hasRecoveryEmail } from "@/lib/recovery";
import { RestoredToast } from "./restored-toast";
import { InstallApp } from "@/components/install-app";
import { TASKS } from "@/lib/tasks";
import { Countdown } from "@/components/countdown";
import { GlobeHero } from "@/components/globe-hero";
import { AdventGrid } from "./advent-grid";

export const metadata = { title: "Takvim" };

export default async function CalendarPage({ searchParams }: PageProps<"/takvim">) {
  const sp = await searchParams;
  const p = await getProgress();
  const user = await requireUser();
  const needsCode = !user.email && p.entries.length >= 2;
  const yearDone = p.today >= 31;
  const done = p.entries.map((e) => e.day);
  const onTime = p.entries.filter((e) => e.on_time).map((e) => e.day);
    const todayTask = TASKS.find((t) => t.day === p.today);
  const todayDone = done.includes(p.today);
  const firstTask = TASKS[0];

  return (
    <div className="space-y-16 md:space-y-24">
      {sp.kurtarildi === "1" && <RestoredToast />}
      {(needsCode || yearDone) && (
        <div className="-mb-8 space-y-3 md:-mb-14">
          {yearDone && (
            <Link href="/ozet" className="sheet flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:border-champagne/40" style={{ borderColor: "rgba(220,199,161,.28)" }}>
              <span>
                <span className="display block text-[1.35rem]">2026&apos;n hazır</span>
                <span className="text-sm text-ink-soft">Aralık boyunca biriktirdiklerin tek bir hikâyede.</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-champagne" strokeWidth={1.5} />
            </Link>
          )}
          {needsCode && (
            <Link href="/profil#kurtarma" className="flex items-center gap-3 rounded-[18px] border border-white/[.08] bg-white/[.025] px-5 py-3.5 text-sm text-ink-soft transition-colors hover:text-ink">
              <ShieldCheck className="h-4 w-4 shrink-0 text-champagne" strokeWidth={1.5} />
              <span className="flex-1">Defterin sadece bu tarayıcıda. Kaybolmasın diye kurtarma kodu al.</span>
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            </Link>
          )}
        </div>
      )}
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
      {p.today < 31 && <InstallApp compact />}

    </div>
  );
}
