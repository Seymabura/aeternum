import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Logo } from "@/components/logo";
import { Countdown } from "@/components/countdown";
import { ArtStatic } from "@/components/art-static";
import { getUser } from "@/lib/supabase/server";
import { todayIndexLocal } from "@/lib/day";
import type { ArtData } from "@/lib/art";
import mandala from "@/public/art/kar-mandala.json";
import demoFills from "@/lib/art/demo-fills.json";

export default async function Home() {
  const user = await getUser().catch(() => null);
  const today = todayIndexLocal();
  const cta = user ? "/takvim" : "/giris";

  return (
    <div className="relative overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <Link href={cta} className="btn btn-ghost text-sm">
          {user ? "Defterime git" : "Giriş yap"}
        </Link>
      </header>

      {/* ---------------------------------------------------------------- hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1.05fr_1fr] md:pt-14">
        <div className="rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-3/80 px-3 py-1.5 text-sm text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-mum shadow-[0_0_10px_2px_rgba(226,134,59,.6)]" />
            {today === 0 ? (
              <>
                Takvimin açılmasına <Countdown mode="december" className="font-semibold tabular-nums text-ink" />
              </>
            ) : today <= 31 ? (
              <>Bugünün kutusu açık · {today} Aralık</>
            ) : (
              <>Kavanozlar açıldı ✨</>
            )}
          </p>
          <h1 className="display text-[3.1rem] leading-[0.98] sm:text-7xl">
            Bu yıldan
            <br />
            <em className="text-bordo">sonsuza</em> kalanlar.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">
            Yılbaşına kadar her gün küçük bir görev. Her görev boyama resminde yeni bir bölüm açar, dilek panonu doldurur,
            anı kavanozuna bir not düşürür. 31 Aralık gecesi hepsi sana özel bir hikâyeye dönüşür.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={cta} className="btn btn-primary px-6 py-3.5 text-base">
              {user ? "Defterime git" : "Defterimi aç"} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#nasil" className="btn btn-ghost px-5 py-3.5 text-base">
              Nasıl çalışır?
            </a>
          </div>
          <p className="hand mt-6 text-2xl text-latte">ücretsiz · telefonda çok güzel 🕯️</p>
        </div>

        <HeroCollage />
      </section>

      {/* ---------------------------------------------------------------- nasıl */}
      <section id="nasil" className="border-y border-ink/8 bg-paper-3/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="display text-4xl sm:text-5xl">
            Her gün <em className="text-bordo">biraz</em> emek
          </h2>
          <p className="mt-3 max-w-xl text-ink-soft">Günde beş dakika. Kasım&apos;da gelenler hazırlığa şimdiden başlayabilir.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature n="01" title="Advent takvimi" text="1–31 Aralık, her gece 00:00'da yeni kutu. Zamanında yaparsan serin 🔥 büyür." />
            <Feature n="02" title="Emek boyama" text="Mandala, kış kasabası, şömine başında kedi... Her görev resminde yeni bir bölüm açar." />
            <Feature n="03" title="Dilek panosu" text="Fotoğraf, çıkartma, washi bant, el yazısı. Telefon duvar kağıdı olarak indir." />
            <Feature
              n="04"
              title="Anı kavanozu"
              text="Her cevabın katlanıp kavanoza düşer. 31 Aralık gece yarısına kadar açılmaz."
              soon
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- final */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-[28px] bg-cam px-7 py-12 text-paper-3 sm:px-12">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #e2863b, transparent 65%)" }}
          />
          <p className="hand text-3xl text-hardal">31 Aralık, 00:00</p>
          <h2 className="display mt-2 max-w-2xl text-4xl sm:text-5xl">
            Yılın özeti, kavanozun ve 2027&apos;ye mektubun aynı anda açılır.
          </h2>
          <p className="mt-4 max-w-xl text-paper-2/80">
            Tamamladığın görevler, en uzun serin, boyadığın resimler ve yılın şarkısı; kaydırılan kartlar halinde. Her
            biri paylaşılabilir.
          </p>
          <Link href={cta} className="btn mt-8 bg-paper-3 px-6 py-3.5 text-base text-cam hover:bg-white">
            Hemen başla <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ink-soft">
          <span className="display italic">aeternum · bu yıldan sonsuza kalanlar</span>
          <nav className="flex gap-5">
            <Link href="/gizlilik" className="hover:text-bordo">
              Gizlilik
            </Link>
            <Link href="/kvkk" className="hover:text-bordo">
              KVKK Aydınlatma Metni
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Feature({ n, title, text, soon }: { n: string; title: string; text: string; soon?: boolean }) {
  return (
    <div className="sheet relative p-5">
      <span className="display text-3xl italic text-hardal">{n}</span>
      <h3 className="display mt-2 text-xl">{title}</h3>
      <p className="mt-2 text-[0.95rem] text-ink-soft">{text}</p>
      {soon && <span className="hand absolute right-4 top-4 rotate-6 text-xl text-bordo">yakında</span>}
    </div>
  );
}

function HeroCollage() {
  const days = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="relative mx-auto aspect-[4/4.4] w-full max-w-[460px] rise" style={{ animationDelay: ".15s" }}>
      {/* polaroid: boyanan mandala */}
      <div className="absolute left-[2%] top-[1%] w-[62%] -rotate-[5deg] bg-[#fffdf8] p-3 pb-12 shadow-[var(--shadow-lift)]">
        <ArtStatic art={mandala as ArtData} fills={demoFills as Record<string, string>} openCount={18} className="block w-full" />
        <p className="hand absolute bottom-2.5 left-0 right-0 text-center text-2xl text-ink">18. gün, yarısı boyandı</p>
        <span className="washi -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
      </div>

      {/* takvim kartı */}
      <div className="sheet absolute -bottom-[7%] -right-[1%] w-[56%] rotate-[3deg] p-3 shadow-[var(--shadow-lift)]">
        <p className="display mb-2 text-base italic">Aralık</p>
        <div className="grid grid-cols-4 gap-1.5">
          {days.map((d) => (
            <div
              key={d}
              className={
                "relative flex aspect-square items-center justify-center rounded-lg text-sm font-semibold " +
                (d < 8
                  ? "bg-cam text-paper-3"
                  : d === 8
                    ? "glow-today bg-bordo text-paper-3"
                    : "border border-ink/10 bg-paper-2/70 text-ink-soft")
              }
            >
              {d}
              {d < 8 && <span className="absolute -right-0.5 -top-1 text-[10px]">✓</span>}
              {d > 8 && <Lock className="absolute bottom-1 right-1 h-2.5 w-2.5 opacity-40" />}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-soft">🔥 7 günlük seri</p>
      </div>

      {/* not kağıdı */}
      <div className="absolute right-[3%] top-[8%] w-[38%] rotate-[7deg] bg-[#fdf3c8] p-3 shadow-[var(--shadow-paper)]" style={{ clipPath: "polygon(0 3%, 100% 0, 98% 97%, 3% 100%)" }}>
        <p className="hand text-xl leading-tight text-ink">
          yılın kelimesi:
          <br />
          <span className="text-2xl text-bordo">&ldquo;cesaret&rdquo;</span>
        </p>
      </div>
    </div>
  );
}
