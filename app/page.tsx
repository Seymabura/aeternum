import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Gift, Lock } from "lucide-react";
import { Logo, Sparkle } from "@/components/logo";
import { BigCountdown, Countdown } from "@/components/countdown";
import { GlobeHero } from "@/components/globe-hero";
import { todayIndexLocal } from "@/lib/day";

const START = "/takvim";

export default function Home() {
  const today = todayIndexLocal();

  return (
    <div className="relative overflow-x-clip">
      {/* ------------------------------------------------------------ menü */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="sheet mx-auto flex max-w-6xl items-center justify-between !rounded-full py-2 pl-5 pr-2">
          <Logo />
          <div className="flex items-center gap-1">
            <a href="#ozellikler" className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink md:block">
              Özellikler
            </a>
            <a href="#kure" className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink md:block">
              Mesaj küresi
            </a>
            <Link prefetch={false} href={START} className="btn btn-primary !px-4 !py-2.5 text-sm">
              Başla
            </Link>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-4 px-5 pb-10 pt-28 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="rise relative z-10 text-center lg:text-left">
          <p className="eyebrow inline-flex items-center gap-3">
            <span className="h-px w-8 bg-champagne/60" /> 1 — 31 Aralık 2026 <span className="h-px w-8 bg-champagne/60 lg:hidden" />
          </p>
          <h1 className="display mt-7 text-[3.6rem] sm:text-[5.6rem] lg:text-[6.4rem]">
            Bu yıldan
            <br />
            <em className="gold-shine pr-3 font-normal italic">sonsuza</em>
            <br />
            kalanlar.
          </h1>
          <p className="mx-auto mt-7 max-w-md text-[1.05rem] leading-relaxed text-ink-soft lg:mx-0">
            Yılbaşına kadar her gece bir kutu açılır. Boyar, dilersin, hayal edersin. 2027&apos;deki kendine bir mesaj bırakırsın.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link prefetch={false} href={START} className="btn btn-primary px-7 py-4 text-base">
              Defterini aç <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#ozellikler" className="btn btn-ghost px-6 py-4 text-base">
              Neler var?
            </a>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft lg:justify-start">
            <Check className="h-4 w-4 text-champagne" /> Üyelik yok, giriş yok. Dokun ve başla.
          </p>
        </div>

        <div className="relative -mt-4 lg:mt-0">
          <GlobeHero />
          <p className="hand -mt-2 text-center text-2xl text-gold/70">küreye dokun, karı savur</p>
        </div>

        <a href="#ozellikler" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-ink-soft lg:flex">
          keşfet
          <span className="h-10 w-px bg-gradient-to-b from-champagne/70 to-transparent" />
        </a>
      </section>

      {/* ------------------------------------------------------------ özellikler */}
      <section id="ozellikler" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Aralık defteri</p>
          <h2 className="display mt-4 text-[2.7rem] sm:text-6xl">
            Altı küçük ritüel, <em className="gold-shine whitespace-nowrap italic">tek bir yıl</em>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-12 md:gap-5">
          {/* takvim */}
          <Tile href="/takvim" n="01" title="Advent takvimi" text="31 kutu. Her gece 00:00'da biri açılır, içinden küçük bir görev çıkar. Zamanında yaparsan serin büyür." className="md:col-span-7">
            <div className="mt-6 grid grid-cols-8 gap-1.5 sm:gap-2">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((d) => (
                <div
                  key={d}
                  className={
                    "flex aspect-square items-center justify-center rounded-[10px] text-[0.7rem] font-medium sm:text-sm " +
                    (d < 9
                      ? "border border-champagne/30 bg-gradient-to-b from-champagne/25 to-champagne/[.06] text-gold"
                      : d === 9
                        ? "glow-today bg-gradient-to-b from-[#fbf5e8] to-[#c9b089] text-midnight"
                        : "border border-white/[.07] bg-white/[.02] text-ink-soft/50")
                  }
                >
                  {d > 9 ? <Lock className="h-3 w-3" /> : d}
                </div>
              ))}
            </div>
          </Tile>

          {/* boyama */}
          <Tile href="/boyama" n="02" title="Emek boyama" text="İstanbul, şömine başı, karlı köy... Her görev resminde yeni bir bölüm açar." className="md:col-span-5 md:row-span-2" tall>
            <div className="relative mt-6 aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image src="/showcase/boyama.webp" alt="Boyanmış İstanbul resmi" fill sizes="(max-width: 768px) 90vw, 40vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-ink backdrop-blur">18 / 32 bölüm</span>
            </div>
          </Tile>

          {/* duvar kağıdı */}
          <Tile href="/pano" n="03" title="Duvar kağıdı stüdyosu" text="Boyadığın resimleri, fotoğraflarını, yazılarını birleştir. Telefonuna 4K duvar kağıdı olarak indir." className="md:col-span-7">
            <div className="relative mt-8 flex h-52 items-end justify-center gap-2 sm:h-72 sm:gap-3">
              {[
                { src: "/showcase/kedi.webp", r: "-rotate-[8deg] translate-y-3", t: "22:47" },
                { src: "/showcase/duvar.webp", r: "z-10 -translate-y-1", t: "23:59" },
                { src: "/showcase/boyama.webp", r: "rotate-[8deg] translate-y-3", t: "00:00" },
              ].map((p) => (
                <div key={p.src} className={"relative aspect-[9/19.5] h-full shrink-0 overflow-hidden rounded-[26px] border-[3px] border-[#1d2540] shadow-[0_30px_50px_-20px_rgba(0,0,0,.9)] transition-transform duration-500 group-hover:-translate-y-2 " + p.r}>
                  <Image src={p.src} alt="" fill sizes="140px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 top-4 text-center text-white">
                    <p className="text-[0.45rem] font-medium tracking-wide opacity-90">Çarşamba 31 Aralık</p>
                    <p className="display text-[1.9rem] leading-none">{p.t}</p>
                  </div>
                  <div className="absolute bottom-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["iPhone 1179×2556", "Android 1080×2400", "Story 9:16", "Gönderi 4:5"].map((f) => (
                <span key={f} className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-ink-soft">
                  {f}
                </span>
              ))}
            </div>
          </Tile>

          {/* wishlist */}
          <Tile href="/liste" n="04" title="Wishlist" text="İstediklerin ve 2027'de yapacakların tek listede. İstersen arkadaşlarına link at." className="md:col-span-4">
            <div className="mt-6 space-y-2">
              {[
                { t: "Kapadokya'da balon turu", d: true },
                { t: "Analog fotoğraf makinesi", gift: true },
                { t: "Her ay bir kitap", d: false },
              ].map((x) => (
                <div key={x.t} className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2.5 text-sm">
                  {x.gift ? (
                    <Gift className="h-4 w-4 text-champagne" />
                  ) : (
                    <span className={"flex h-4 w-4 items-center justify-center rounded-full border " + (x.d ? "border-champagne bg-champagne text-midnight" : "border-white/25")}>
                      {x.d && <Check className="h-3 w-3" />}
                    </span>
                  )}
                  <span className={x.d ? "text-ink-soft line-through decoration-white/20" : ""}>{x.t}</span>
                </div>
              ))}
            </div>
          </Tile>

          {/* vision board */}
          <Tile href="/vision" n="05" title="Vision board" text="2027'nin nasıl görüneceğini hayal et: görseller, kelimeler, renkler." className="md:col-span-4">
            <div className="mt-6 grid h-36 grid-cols-3 grid-rows-2 gap-2">
              <div className="relative col-span-1 row-span-2 overflow-hidden rounded-xl">
                <Image src="/showcase/kedi.webp" alt="" fill sizes="120px" className="object-cover" />
              </div>
              <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-[#26345e] to-[#0b1328] p-2 text-center">
                <span className="display text-lg italic text-gold">huzur</span>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#e9dcc0] to-[#b0905f]" />
              <div className="col-span-2 flex items-center justify-center rounded-xl border border-white/10 bg-white/[.03] px-2 text-center">
                <span className="hand text-xl text-ink">yeni şehirler, eski dostlar</span>
              </div>
            </div>
          </Tile>

          {/* mesaj küresi */}
          <Tile href="/kure" n="06" title="Mesaj küresi" text="2027'deki kendine bir mesaj yaz, küreye kapat. 31 Aralık 2027'de açılır." className="md:col-span-4" accent>
            <div className="relative mt-6 flex h-36 items-center justify-center">
              <div className="absolute h-28 w-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.55),rgba(185,205,242,.18)_35%,rgba(185,205,242,.05)_70%)] shadow-[inset_0_0_30px_rgba(185,205,242,.35),0_0_60px_rgba(185,205,242,.15)] ring-1 ring-white/20" />
              <div className="absolute bottom-2 h-6 w-24 rounded-[50%] bg-gradient-to-b from-[#e6d2ad] to-[#8f7650] shadow-lg" />
              <div className="relative -mt-4 rotate-[-8deg] rounded-sm bg-[#f6f1e6] px-3 py-1.5 text-[#141826] shadow-xl">
                <span className="hand text-lg">sevgili 2027 ben,</span>
              </div>
            </div>
          </Tile>
        </div>
      </section>

      {/* ------------------------------------------------------------ geri sayım */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <p className="eyebrow">{today === 0 ? "ilk kutu açılıyor" : "sıradaki kutu"}</p>
        <div className="mt-6">
          <BigCountdown mode={today === 0 ? "december" : "midnight"} />
        </div>
        <p className="mt-5 text-sm text-ink-soft">Kutular Türkiye saatiyle gece 00:00&apos;da açılır.</p>
      </section>

      {/* ------------------------------------------------------------ küre / final */}
      <section id="kure" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24 pt-10">
        <div className="sheet beam relative overflow-hidden px-6 py-16 text-center sm:px-14">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-80 w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(185,205,242,.35), transparent 65%)" }}
          />
          <Sparkle className="mx-auto h-4 w-4 text-champagne" />
          <p className="eyebrow mt-5">31 Aralık 2026 · 00:00</p>
          <h2 className="display mx-auto mt-5 max-w-3xl text-[2.6rem] sm:text-6xl">
            Yılın özeti açılır, <em className="gold-shine italic">mesajın</em> bir yıl yolculuğa çıkar.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-ink-soft">
            Tamamladığın kutular, en uzun serin, boyadığın resimler, yılın şarkısı ve kelimesi. Hikâye gibi kaydırılan, paylaşılabilir kartlar.
          </p>
          <Link prefetch={false} href={START} className="btn btn-primary mt-10 px-8 py-4 text-base">
            Hemen başla <ArrowRight className="h-4 w-4" />
          </Link>
          {today === 0 && (
            <p className="mt-5 text-sm text-ink-soft">
              İlk kutuya <Countdown mode="december" className="text-ink" />
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-white/[.06]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-ink-soft">
          <Logo />
          <nav className="flex gap-6">
            <Link href="/gizlilik" className="hover:text-ink">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-ink">KVKK</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Tile({
  href,
  n,
  title,
  text,
  className,
  children,
  tall,
  accent,
}: {
  href: string;
  n: string;
  title: string;
  text: string;
  className?: string;
  children?: React.ReactNode;
  tall?: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={
        "sheet group relative flex flex-col overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:border-champagne/25 hover:shadow-[var(--shadow-lift)] sm:p-7 " +
        (accent ? "beam " : "") +
        (className ?? "")
      }
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs tracking-widest text-champagne/70">{n}</span>
        <ArrowUpRight className="h-5 w-5 text-ink-soft transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne" />
      </div>
      <h3 className="display mt-4 text-[1.9rem] sm:text-[2.1rem]">{title}</h3>
      <p className={"mt-2 text-[0.95rem] leading-relaxed text-ink-soft " + (tall ? "max-w-sm" : "max-w-md")}>{text}</p>
      {children}
    </Link>
  );
}
