import Link from "next/link";
import { ArrowRight, Brush, CalendarHeart, Lock, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { BigCountdown, Countdown } from "@/components/countdown";
import { getUser } from "@/lib/supabase/server";
import { todayIndexLocal } from "@/lib/day";

export default async function Home() {
  const user = await getUser().catch(() => null);
  const today = todayIndexLocal();
  const cta = user ? "/takvim" : "/giris";

  return (
    <div className="relative overflow-x-clip">
      {/* ------------------------------------------------------------ üst menü */}
      <header className="sticky top-0 z-40 px-4 pt-4">
        <nav className="sheet mx-auto flex max-w-6xl items-center justify-between !rounded-full px-4 py-2.5 sm:px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <a href="#nasil" className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink sm:block">
              Nasıl çalışır
            </a>
            <Link href={cta} className="btn btn-primary !px-4 !py-2 text-sm">
              {user ? "Defterim" : "Başla"}
            </Link>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div className="rise">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/20 bg-gold/[.06] px-3.5 py-1.5 text-[0.8rem] text-ink-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mum opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mum" />
            </span>
            {today === 0 ? (
              <>
                Takvim açılıyor · <Countdown mode="december" className="font-semibold text-ink" />
              </>
            ) : today <= 31 ? (
              <>Bugünün kutusu açık · {today} Aralık</>
            ) : (
              <>Kavanozlar açıldı</>
            )}
          </p>

          <h1 className="display mt-7 text-[3.5rem] leading-[0.95] sm:text-[5.4rem]">
            Bu yıldan
            <br />
            <em className="gold-shine pr-2">sonsuza</em>
            <br className="sm:hidden" /> kalanlar.
          </h1>

          <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            Aralık boyunca her gece bir kutu açılır. Her küçük görev boyamanda yeni bir bölüm açar, dilek panonu süsler,
            anı kavanozuna bir not bırakır. <span className="text-ink">31 Aralık gecesi hepsi sana dönüşür.</span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={cta} className="btn btn-primary px-7 py-4 text-base">
              {user ? "Defterime git" : "Defterimi aç"} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#nasil" className="btn btn-ghost px-6 py-4 text-base">
              Nasıl çalışır?
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-ink-soft">
            <span>
              <b className="display text-2xl text-ink">31</b> kutu
            </span>
            <span className="h-6 w-px bg-ink/15" />
            <span>
              <b className="display text-2xl text-ink">5</b> dk / gün
            </span>
            <span className="h-6 w-px bg-ink/15" />
            <span>
              <b className="display text-2xl text-ink">∞</b> anı
            </span>
          </div>
        </div>

        <PhoneHero today={today} />
      </section>

      {/* ------------------------------------------------------------ geri sayım */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <p className="label text-center !tracking-[0.3em]">{today === 0 ? "ilk kutuya" : "sıradaki kutuya"}</p>
        <div className="mt-4">
          <BigCountdown mode={today === 0 ? "december" : "midnight"} />
        </div>
        <p className="mt-4 text-center text-sm text-ink-soft">Kutular Türkiye saatiyle gece 00:00&apos;da açılır.</p>
      </section>

      {/* ------------------------------------------------------------ nasıl */}
      <section id="nasil" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label !tracking-[0.3em]">nasıl çalışır</p>
          <h2 className="display mt-3 text-4xl sm:text-6xl">
            Her gün <em className="gold-shine">biraz</em> emek
          </h2>
          <p className="mt-4 text-ink-soft">Günde beş dakika. Kasım&apos;da gelenler hazırlığa şimdiden başlayabilir.</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {/* takvim */}
          <article className="sheet beam overflow-hidden p-6 md:col-span-4">
            <Icon><CalendarHeart className="h-5 w-5" /></Icon>
            <h3 className="display mt-4 text-2xl">Advent takvimi</h3>
            <p className="mt-2 max-w-sm text-ink-soft">31 kutu, her gece 00:00&apos;da bir tanesi açılır. Zamanında yaparsan serin 🔥 büyür.</p>
            <div className="mt-6 grid grid-cols-8 gap-1.5 sm:gap-2">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((d) => (
                <div
                  key={d}
                  className={
                    "flex aspect-square items-center justify-center rounded-lg text-xs font-semibold sm:text-sm " +
                    (d < 7
                      ? "bg-gradient-to-b from-[#3c8a6e] to-[#1f4d40] text-ink"
                      : d === 7
                        ? "glow-today bg-gradient-to-b from-[#ffd59a] to-[#d96f35] text-[#1a0d06]"
                        : "border border-ink/10 bg-ink/[.03] text-ink-soft/70")
                  }
                >
                  {d > 7 ? <Lock className="h-3 w-3 opacity-50" /> : d}
                </div>
              ))}
            </div>
          </article>

          {/* kavanoz */}
          <article className="sheet relative overflow-hidden p-6 md:col-span-2">
            <span className="hand absolute right-5 top-5 rotate-6 text-xl text-mum">yakında</span>
            <Jar />
            <h3 className="display mt-2 text-2xl">Anı kavanozu</h3>
            <p className="mt-2 text-ink-soft">Her cevabın katlanıp kavanoza düşer. 31 Aralık gece yarısı açılır.</p>
          </article>

          {/* boyama */}
          <article className="sheet overflow-hidden p-6 md:col-span-3">
            <Icon><Brush className="h-5 w-5" /></Icon>
            <h3 className="display mt-4 text-2xl">Emek boyama</h3>
            <p className="mt-2 text-ink-soft">Duvar kağıdı boyutunda, detaylı çizimler. Her görev resminde yeni bir bölüm açar, yıl sonunda telefonunun ekranı olur.</p>
            <div className="mt-6 flex -space-x-3">
              {["#f2a24a", "#b8364a", "#2f6b55", "#e8c98a", "#5b7fa6", "#8e5ba8"].map((c) => (
                <span key={c} className="h-10 w-10 rounded-full border-2 border-paper shadow-lg" style={{ background: `radial-gradient(circle at 35% 30%, #fff8, transparent 40%), ${c}` }} />
              ))}
            </div>
          </article>

          {/* pano */}
          <article className="sheet overflow-hidden p-6 md:col-span-3">
            <Icon><Sparkles className="h-5 w-5" /></Icon>
            <h3 className="display mt-4 text-2xl">Dilek panosu</h3>
            <p className="mt-2 text-ink-soft">Fotoğraf, çıkartma, washi bant, el yazısı. Telefon duvar kağıdı ya da Instagram boyutunda indir.</p>
            <div className="relative mt-6 h-24">
              <div className="absolute left-2 top-1 h-20 w-16 -rotate-6 bg-[#fffdf7] p-1 pb-4 shadow-xl"><div className="h-full w-full bg-gradient-to-br from-[#3d1220] to-[#f2a24a]" /></div>
              <div className="absolute left-20 top-3 h-20 w-16 rotate-3 bg-[#fffdf7] p-1 pb-4 shadow-xl"><div className="h-full w-full bg-gradient-to-br from-[#0f1a2e] to-[#5b7fa6]" /></div>
              <div className="hand absolute left-40 top-6 rotate-[-4deg] rounded-sm bg-[#fdf3c8] px-3 py-2 text-xl text-[#2e2019] shadow-xl">2027 benim yılım</div>
            </div>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------------------ final */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="sheet beam relative overflow-hidden px-7 py-14 text-center sm:px-14">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, rgba(242,162,74,.55), transparent 65%)" }} />
          <p className="hand text-3xl text-mum">31 Aralık, 00:00</p>
          <h2 className="display mx-auto mt-3 max-w-3xl text-4xl sm:text-6xl">
            Yılın özeti, kavanozun ve <em className="gold-shine">2027&apos;ye mektubun</em> aynı anda açılır.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-ink-soft">Tamamladığın görevler, en uzun serin, boyadığın resimler, yılın şarkısı. Hikâye gibi kaydırılan, paylaşılabilir kartlar.</p>
          <Link href={cta} className="btn btn-primary mt-9 px-8 py-4 text-base">
            Hemen başla <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/[.07]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ink-soft">
          <span className="display italic">aeternum · bu yıldan sonsuza kalanlar</span>
          <nav className="flex gap-5">
            <Link href="/gizlilik" className="hover:text-ink">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-ink">KVKK Aydınlatma Metni</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/20 to-gold/[.04] text-gold shadow-[0_0_30px_-8px_rgba(232,201,138,.6)]">
      {children}
    </span>
  );
}

function Jar() {
  return (
    <svg viewBox="0 0 120 130" className="mx-auto h-36 w-auto drop-shadow-[0_0_40px_rgba(242,162,74,.35)]" aria-hidden>
      <defs>
        <radialGradient id="jg" cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor="#ffd59a" stopOpacity=".55" />
          <stop offset="100%" stopColor="#f2a24a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jl" x1="0" x2="1">
          <stop offset="0" stopColor="#b98a4a" />
          <stop offset=".5" stopColor="#f6dfae" />
          <stop offset="1" stopColor="#b98a4a" />
        </linearGradient>
      </defs>
      <rect x="34" y="6" width="52" height="14" rx="4" fill="url(#jl)" />
      <path d="M28 26h64c7 0 12 6 12 13v70c0 9-7 15-15 15H31c-8 0-15-6-15-15V39c0-7 5-13 12-13Z" fill="rgba(255,245,230,.06)" stroke="rgba(255,236,210,.45)" strokeWidth="1.6" />
      <ellipse cx="60" cy="88" rx="40" ry="34" fill="url(#jg)" />
      {[
        [44, 100, -14, "#fdf3c8"],
        [62, 106, 10, "#f8d7cf"],
        [78, 98, -4, "#fdf3c8"],
        [52, 86, 18, "#d9ead3"],
        [70, 84, -12, "#fdf3c8"],
      ].map(([x, y, r, c], i) => (
        <rect key={i} x={Number(x) - 9} y={Number(y) - 6} width="18" height="12" rx="1.5" fill={String(c)} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <path d="M26 44c-2 22-2 44 0 64" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".35" />
    </svg>
  );
}

function PhoneHero({ today }: { today: number }) {
  const shown = Math.max(today, 7);
  return (
    <div className="relative mx-auto w-full max-w-[380px] rise" style={{ animationDelay: ".2s" }}>
      <div className="pointer-events-none absolute inset-0 -z-10 translate-y-10 scale-110 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(circle, rgba(242,140,60,.5), rgba(184,54,74,.2) 50%, transparent 70%)" }} />

      {/* telefon */}
      <div className="relative mx-auto aspect-[9/19.5] w-[78%] rotate-[-4deg] animate-float rounded-[44px] border border-white/15 bg-gradient-to-b from-[#1c1624] to-[#0b0910] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.15)]">
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-b from-[#160f1f] via-[#22121c] to-[#3a1a14]">
          <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          <div className="px-4 pt-10">
            <p className="hand text-lg text-mum">merhaba,</p>
            <p className="display text-2xl leading-tight">{shown} Aralık</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((d) => (
                <div
                  key={d}
                  className={
                    "flex aspect-[1/1.1] items-end rounded-md p-1 text-[0.6rem] font-semibold " +
                    (d < shown
                      ? "bg-gradient-to-b from-[#3c8a6e] to-[#1f4d40] text-ink"
                      : d === shown
                        ? "glow-today bg-gradient-to-b from-[#ffd59a] to-[#d96f35] text-[#1a0d06]"
                        : "border border-white/10 bg-white/[.04] text-ink-soft/60")
                  }
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-mum/40 bg-gradient-to-r from-mum/20 to-transparent p-2.5">
              <p className="text-[0.55rem] uppercase tracking-widest text-mum">bugünün görevi</p>
              <p className="display text-sm">Yılın kelimesi</p>
            </div>
            <p className="mt-3 text-[0.55rem] uppercase tracking-widest text-ink-soft">küçük emekler</p>
            {["Pencereden ne görüyorsun?", "Bugünün rengi ne?"].map((t, i) => (
              <div key={t} className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-2 py-1.5 text-[0.6rem]">
                <span className={"flex h-3.5 w-3.5 items-center justify-center rounded-full text-[0.5rem] " + (i === 0 ? "bg-cam text-ink" : "border border-white/25")}>{i === 0 ? "✓" : ""}</span>
                {t}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-3 bottom-3 flex justify-around rounded-2xl border border-white/10 bg-black/30 py-2 text-[0.55rem] text-ink-soft backdrop-blur">
            <span className="text-mum">Takvim</span><span>Boyama</span><span>Pano</span><span>Ben</span>
          </div>
        </div>
      </div>

      {/* süzülen kartlar */}
      <div className="sheet absolute -left-2 top-[16%] rotate-[-6deg] px-3.5 py-2.5 sm:-left-8" style={{ animation: "float 8s ease-in-out infinite" }}>
        <p className="text-[0.65rem] uppercase tracking-widest text-ink-soft">seri</p>
        <p className="display text-2xl">🔥 7 gün</p>
      </div>
      <div className="absolute -right-1 top-[44%] rotate-[7deg] bg-[#fdf3c8] px-4 py-3 text-[#2e2019] shadow-2xl sm:-right-6" style={{ animation: "float 9s ease-in-out infinite .6s", clipPath: "polygon(0 3%, 100% 0, 98% 97%, 3% 100%)" }}>
        <p className="hand text-lg leading-tight">yılın kelimesi:</p>
        <p className="hand text-2xl font-bold leading-tight text-[#7a1f2b]">&ldquo;cesaret&rdquo;</p>
      </div>
      <div className="sheet absolute -left-3 bottom-[10%] flex items-center gap-2.5 px-3.5 py-2.5 sm:-left-10" style={{ animation: "float 10s ease-in-out infinite 1.2s" }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#ffd59a] to-[#d96f35] text-sm">🎨</span>
        <span>
          <span className="block text-[0.65rem] uppercase tracking-widest text-ink-soft">yeni bölüm</span>
          <span className="block text-sm font-medium">açıldı · 18/32</span>
        </span>
      </div>
    </div>
  );
}
