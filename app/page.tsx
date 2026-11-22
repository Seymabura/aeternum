import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CalendarDays, Images, Lock, Mail, Moon, Sparkles } from "lucide-react";
import { Globe, Moons } from "@/components/icons";
import { Logo, Sparkle } from "@/components/logo";
import { LandingNav } from "@/components/landing-nav";
import { BigCountdown, Countdown } from "@/components/countdown";
import { GlobeHero } from "@/components/globe-hero";
import { todayIndexLocal } from "@/lib/day";

const START = "/takvim";

const TOOLS = [
  { href: "/takvim", name: "31 günlük görev", hint: "Her gece yeni bir kutu", icon: CalendarDays },
  { href: "/kure", name: "Kar küresi", hint: "Her görev bir süs", icon: Globe },
  { href: "/biz/iki-ay", name: "İki Ay", hint: "Doğduğunuz gecelerin Ay'ı", icon: Moon },
  { href: "/biz/gokyuzu", name: "Gökyüzümüz", hint: "Tanıştığınız gecenin yıldızları", icon: Sparkles },
  { href: "/biz/kure", name: "Ortak küre", hint: "Partnerinle birlikte süsle", icon: Moons },
  { href: "/kure", name: "2027'ye mektup", hint: "Mühürle, bir yıl sonra aç", icon: Mail },
  { href: "/vision", name: "Vision board", hint: "2027'yi görsellerle kur", icon: Images },
] as const;

export default function Home() {
  const today = todayIndexLocal();

  return (
    <div className="relative overflow-x-clip">

      <LandingNav start={START} />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-6 px-5 pb-12 pt-28 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div className="relative z-10 text-center lg:text-left">
          <p className="eyebrow rise inline-flex items-center gap-3">
            <Sparkle className="h-2 w-2" /> 1 — 31 Aralık 2026
          </p>
          <h1 className="display mt-7 text-[3.25rem] sm:text-[5.25rem] lg:text-[6rem]" aria-label="Bu yıldan sonsuza kalanlar.">
            <span className="mask-line"><span style={{ animationDelay: "120ms" }}>Bu yıldan</span></span>
            <span className="mask-line"><span style={{ animationDelay: "200ms" }}><em className="gold-shine pr-3 font-normal italic">sonsuza</em></span></span>
            <span className="mask-line"><span style={{ animationDelay: "280ms" }}>kalanlar.</span></span>
          </h1>
          <nav aria-label="Araçlar" className="rise mx-auto mt-9 grid max-w-[36rem] grid-cols-4 gap-1.5 sm:gap-2.5 lg:mx-0" style={{ animationDelay: "420ms" }}>
            {TOOLS.map(({ href, name, hint, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className="group flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-[16px] border border-champagne/12 bg-[rgba(18,26,46,0.5)] px-2 py-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne/35 hover:bg-[rgba(28,38,64,0.6)] sm:min-h-[6.25rem] lg:items-start lg:px-4 lg:text-left"
              >
                <Icon className="h-5 w-5 text-champagne transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                <span className="text-[0.72rem] font-medium leading-tight text-ink sm:text-sm">{name}</span>
                <span className="hidden text-xs leading-snug text-ink-soft sm:block">{hint}</span>
              </Link>
            ))}
          </nav>
          <p className="rise mx-auto mt-8 max-w-[30rem] text-base leading-relaxed text-ink-soft lg:mx-0" style={{ animationDelay: "520ms" }}>
            Aralık boyunca her gece bir kutu açılır, içinden kendin için küçük bir görev çıkar; her biri kar küreni bir süsle büyütür. Sevdiğinle de doğduğunuz gecelerin Ay'ını ve tanıştığınız gecenin gökyüzünü duvar kağıdı yaparsınız.
          </p>
          <div className="rise mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start" style={{ animationDelay: "620ms" }}>
            <Link prefetch={false} href={START} className="btn btn-primary">
              Defterini aç <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <a href="#ozellikler" className="btn btn-ghost">
              Neler var?
            </a>
          </div>
          <p className="rise mt-6 text-[0.8125rem] text-ink-soft" style={{ animationDelay: "700ms" }}>
            Üyelik yok, giriş yok. Dokun ve başla.
          </p>
        </div>

        <div className="rise relative -mt-2 lg:mt-0" style={{ animationDelay: "800ms" }}>
          <GlobeHero full />
          <p className="hand -mt-3 text-center text-[1.6rem] text-gold/70">küreye dokun, karı savur</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ geri sayım şeridi */}
      <section aria-label="Geri sayım" className="relative border-y border-champagne/10 bg-[rgba(7,11,22,0.55)] backdrop-blur-sm">
        <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-[minmax(0,15rem)_1fr] md:py-16">
          <div className="text-center md:text-left">
            <p className="display text-[1.75rem] italic text-gold">{today === 0 ? "İlk kutuya" : "Sıradaki kutuya"}</p>
            <p className="mt-2 text-sm text-ink-soft">Kutular Türkiye saatiyle gece 00:00&apos;da açılır.</p>
          </div>
          <BigCountdown mode={today === 0 ? "december" : "midnight"} />
        </div>
      </section>

      {/* ------------------------------------------------------------ özellikler */}
      <section id="ozellikler" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-24 sm:px-8 md:py-40">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-[2.5rem] sm:text-[4rem] md:col-span-7">
            Küçük ritüeller,
            <br />
            <em className="gold-shine italic">koca bir yıl</em>
          </h2>
          <p className="max-w-sm text-ink-soft md:col-span-5 md:justify-self-end">
            Bir takvim, bir kar küresi, bir dilek vitrini. Aralık&apos;ı yavaşlatan, sana ait küçük bir defter.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-12 md:gap-5">
          {/* takvim */}
          <Tile href="/takvim" n="01" title="31 gün, 31 küçük iyilik" text="Telefonsuz bir yürüyüş, bir bardak su, birine 'aklıma geldin' demek... Her gece 00:00'da yeni bir kutu açılır." className="md:col-span-7">
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
                  {d > 9 ? <Lock className="h-3 w-3" strokeWidth={1.5} /> : d}
                </div>
              ))}
            </div>
          </Tile>

          {/* küre */}
          <Tile href="/kure" n="02" title="Kar küren" text="Her tamamlanan gün kürene bir süs ekler: çam, kardan adam, fener, geyik... 31 Aralık'ta küren dolar, içine 2027'ye mesajını bırakırsın." className="md:col-span-5 md:row-span-2" tall accent>
            <div className="relative mt-6 flex flex-1 items-center justify-center">
              <div className="pointer-events-none absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(185,205,242,.2),transparent_65%)] blur-2xl" />
              <Image src="/showcase/kure.webp" alt="Süslenmiş kar küresi" width={520} height={520} className="relative w-full max-w-[380px]" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-ink-soft">
              {["1 · ilk çam", "2 · kardan adam", "14 · geyik"].map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/[.03] px-2 py-1.5">{t}</span>
              ))}
            </div>
          </Tile>

          {/* 2027'ye mektup */}
          <Tile href="/kure" n="03" title="2027'ye mektup" text="Kendine bir mektup yaz, mühürle ve kürene bırak. 31 Aralık 2027 gece yarısına kadar kimse okuyamaz, sen bile." className="md:col-span-7">
            <div className="relative mt-8 flex h-52 items-center justify-center sm:h-72">
              <div className="paper-tex relative w-[78%] max-w-[22rem] -rotate-2 rounded-[6px] px-7 py-6 text-[#1a1408] shadow-[0_40px_70px_-30px_rgba(0,0,0,.95)] transition-transform duration-700 group-hover:-rotate-1">
                <p className="hand text-[1.6rem] leading-tight">Sevgili 2027&apos;deki ben,</p>
                <div className="mt-3 space-y-3">
                  {[92, 80, 86, 54].map((w, i) => (
                    <div key={i} className="h-px bg-[#1a1408]/15" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <p className="hand mt-4 text-right text-xl text-[#1a1408]/60">Aralık 2026</p>
                <svg viewBox="0 0 64 64" className="absolute -right-5 -top-5 h-16 w-16 drop-shadow-[0_8px_12px_rgba(0,0,0,.45)]" aria-hidden>
                  <defs>
                    <radialGradient id="waxl" cx="38%" cy="32%" r="70%">
                      <stop offset="0" stopColor="#c45a62" />
                      <stop offset=".55" stopColor="#8f2f39" />
                      <stop offset="1" stopColor="#5e1a24" />
                    </radialGradient>
                  </defs>
                  <path d="M32 3c4 0 6 3 9 4s7 0 9 3 1 6 3 9 5 5 5 9-3 6-4 9 0 7-3 9-6 1-9 3-5 5-9 5-6-3-9-4-7 0-9-3-1-6-3-9-5-5-5-9 3-6 4-9 0-7 3-9 6-1 9-3 5-4 9-4Z" fill="url(#waxl)" />
                  <path d="M32 21c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10Z" fill="rgba(40,8,14,.55)" />
                </svg>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-ink-soft">Mühürlenir, 31 Aralık 2027&apos;de açılır.</p>
          </Tile>

          {/* biz: iki ay + gökyüzü */}
          <Tile href="/biz" n="04" title="İkimizin gökyüzü" text="Doğduğunuz gecelerin Ay'ı ve tanıştığınız gecenin gerçek yıldızları. Yazısız, 4K duvar kağıdı." className="md:col-span-6">
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {["/showcase/biz-ay.webp", "/showcase/biz-gok.webp"].map((src) => (
                <div key={src} className="relative aspect-[9/12] overflow-hidden rounded-xl border border-white/10">
                  <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </Tile>

          {/* vision board */}
          <Tile href="/vision" n="05" title="Vision board" text="2027'yi görsellerle ve kelimelerle kur, hedeflerini yaz. Tek dokunuşla duvar kağıdı yap." className="md:col-span-6">
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

        </div>
      </section>

      {/* ------------------------------------------------------------ nasıl çalışır */}
      <section id="nasil" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pb-24 sm:px-8 md:pb-40">
        <h2 className="display text-[2.25rem] sm:text-[3rem]">Nasıl çalışır</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
          {[
            { t: "Kutuyu aç", d: "Her gece 00:00'da yeni bir kutu açılır. Kaçırdığın günü sonra da yapabilirsin." },
            { t: "Küçük iyiliği yap", d: "Bir bardak su, kısa bir yürüyüş, bir teşekkür. Beş dakikanı alır." },
            { t: "Küren büyüsün", d: "Her görev kar küresine bir süs ekler. 31 Aralık'ta küren tamamlanır." },
          ].map((x, i) => (
            <li key={x.t} className="relative md:px-10 md:first:pl-0 md:last:pr-0">
              {i > 0 && <span aria-hidden className="hairline-v absolute inset-y-0 left-0 hidden md:block" />}
              <span className="display block text-[4.5rem] font-light italic leading-none text-champagne/80">{i + 1}</span>
              <h3 className="display mt-6 text-[1.6rem]">{x.t}</h3>
              <p className="mt-3 max-w-xs text-ink-soft">{x.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ kapanış */}
      <section id="kure" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pb-24 sm:px-8 md:pb-32">
        <div className="sheet relative overflow-hidden px-6 py-20 text-center sm:px-14 md:py-28" style={{ borderColor: "rgba(220,199,161,.28)" }}>
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-80 w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(185,205,242,.3), transparent 65%)" }}
          />
          <Sparkle className="mx-auto h-3 w-3 text-champagne" />
          <h2 className="display mx-auto mt-8 max-w-3xl text-[2.75rem] sm:text-[4.5rem]">
            Aralık seni <em className="gold-shine italic">bekliyor.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-ink-soft">
            Defterin bu cihazda saklanır. Hesap açmana gerek yok; ilk kutu hazır olduğunda burada olacak.
          </p>
          <Link prefetch={false} href={START} className="btn btn-primary mt-10">
            Defterini aç <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          {today === 0 && (
            <p className="mt-6 text-sm text-ink-soft">
              İlk kutuya <Countdown mode="december" className="text-ink" />
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-champagne/10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-5 py-10 text-sm text-ink-soft sm:px-8">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/kurtar" className="link-line !text-ink-soft hover:!text-ink">Defterini geri getir</Link>
            <Link href="/kvkk" className="link-line !text-ink-soft hover:!text-ink">KVKK</Link>
            <Link href="/gizlilik" className="link-line !text-ink-soft hover:!text-ink">Gizlilik</Link>
          </nav>
          <p className="text-ink-mute">© 2026 Aeternum</p>
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
        "sheet spot lift group relative flex flex-col overflow-hidden p-6 sm:p-8 " +
        (accent ? "!border-champagne/25 " : "") +
        (className ?? "")
      }
    >
      <div className="flex items-start justify-between">
        <span className="display num text-sm italic text-champagne/70">{n}</span>
        <ArrowUpRight strokeWidth={1.5} className="h-5 w-5 text-ink-soft transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne" />
      </div>
      <h3 className="display mt-5 text-[1.85rem] sm:text-[2.25rem]">{title}</h3>
      <p className={"mt-2 text-[0.95rem] leading-relaxed text-ink-soft " + (tall ? "max-w-sm" : "max-w-md")}>{text}</p>
      {children}
    </Link>
  );
}
