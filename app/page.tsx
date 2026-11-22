import Link from "next/link";
import Image from "next/image";
import { BookHeart, CalendarDays, Images, Mail, Moon, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { LandingNav } from "@/components/landing-nav";
import { BigCountdown } from "@/components/countdown";
import { StarRoadHost } from "@/components/star-road-host";
import { todayIndexLocal } from "@/lib/day";

const TOOLS = [
  { href: "/biz/iki-ay", name: "İki Ay", hint: "Doğduğunuz gecelerin Ay'ı, tek bir Ay'da", icon: Moon, nar: true },
  { href: "/biz/gokyuzu", name: "Gökyüzümüz", hint: "Bir gecenin gerçek yıldızları", icon: Sparkles },
  { href: "/mektup", name: "2027'ye mektup", hint: "Mühürle, bir yıl sonra aç", icon: Mail },
  { href: "/vision", name: "Vision board", hint: "Gelecek yılını kur", icon: Images },
  { href: "/biz/defter", name: "Ortak defter", hint: "30 gün, 30 soru, ikiniz", icon: BookHeart },
  { href: "/takvim", name: "31 gün", hint: "Aralık'a özel görevler", icon: CalendarDays },
] as const;

export default function Home() {
  const today = todayIndexLocal();
  return (
    <div className="relative overflow-x-clip">
      <StarRoadHost />
      <LandingNav />

      {/* ------------------------------------------------------------ giriş */}
      {/* geniş ekranda: araçlar solda, başlık sağda; telefonda başlık üstte */}
      <section className="relative mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-12 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:pt-28">
        <div className="text-center lg:order-2 lg:text-right">
        <h1 className="display text-[3.4rem] leading-[0.98] sm:text-[6rem] lg:text-[6.6rem] xl:text-[7.2rem]" aria-label="Anların sonsuza kaldığı yer.">
          <span className="mask-line"><span style={{ animationDelay: "150ms" }}>Anların</span></span>
          <span className="mask-line"><span className="infinite-word" style={{ animationDelay: "260ms" }}>sonsuza</span></span>
          <span className="mask-line"><span style={{ animationDelay: "370ms" }}>kaldığı yer.</span></span>
        </h1>
        <p className="rise mx-auto mt-8 max-w-[34rem] text-[1.05rem] leading-relaxed text-ink-soft lg:ml-auto lg:mr-0" style={{ animationDelay: "600ms" }}>
          Doğduğun gecenin Ay&apos;ı, tanıştığınız gecenin gökyüzü, bir yıl sonra açılacak bir mektup. Saklamak istediğin anlar için küçük dijital hatıralar. Üyelik yok.
        </p>
        </div>

        <nav aria-label="Araçlar" className="rise mx-auto grid w-full max-w-[56rem] grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:order-1 lg:mx-0 lg:max-w-none lg:grid-cols-2" style={{ animationDelay: "760ms" }}>
          {TOOLS.map(({ href, name, hint, icon: Icon, ...rest }) => {
            const nar = "nar" in rest;
            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={
                  "tool-card group relative flex items-center gap-3 overflow-hidden rounded-[18px] border px-4 py-3.5 text-left backdrop-blur-md transition-[border-color,background-color,transform] duration-500 sm:flex-col sm:items-start sm:gap-2 sm:px-5 sm:py-5 " +
                  (nar
                    ? "border-nar-soft/45 bg-[rgba(74,11,22,0.42)] shadow-[0_0_40px_-18px_rgba(210,70,92,.8)] hover:border-nar-soft/80"
                    : "border-white/[.08] bg-[rgba(8,7,11,0.5)] hover:border-nar-soft/40 hover:shadow-[0_0_36px_-20px_rgba(210,70,92,.9)]")
                }
              >
                <Icon className={"h-5 w-5 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 " + (nar ? "text-[#ff9aab]" : "text-champagne")} strokeWidth={1.5} />
                <span className="min-w-0">
                  <span className="block text-[0.9rem] font-medium leading-tight text-ink sm:text-[0.95rem]">{name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </section>

      {/* ------------------------------------------------------------ anlar */}
      <section id="anlar" className="relative mx-auto max-w-[1240px] scroll-mt-24 px-5 py-24 sm:px-8 md:py-40">
        <h2 className="display max-w-3xl text-[2.6rem] leading-[1.02] sm:text-[4.5rem]">Bir gece, olduğu gibi.</h2>
        <p className="mt-5 max-w-md text-ink-soft">Gerçek gökyüzü hesabıyla çizilir. Yazısız, 4K, telefonuna duvar kağıdı olur.</p>

        <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-10 lg:mx-auto lg:max-w-4xl">
          <Moment href="/biz/iki-ay" title="İki Ay" text="İkinizin doğduğu gecelerin Ay'ı, tek bir Ay'da buluşur." cta="Ayınızı oluşturun" className="md:mt-0">
            <Image src="/showcase/biz-ay.webp" alt="Siyah gökyüzünde birleşen iki Ay" fill sizes="(min-width:768px) 30vw, 90vw" className="object-cover" />
          </Moment>
          <Moment href="/biz/gokyuzu" title="Gökyüzümüz" text="Tanıştığınız gece, o şehrin üstündeki yıldızlar." cta="O geceyi çizin" className="md:mt-20">
            <Image src="/showcase/biz-gok.webp" alt="Yıldızlarla dolu gerçekçi gece gökyüzü" fill sizes="(min-width:768px) 30vw, 90vw" className="object-cover" />
          </Moment>
        </div>
      </section>

      {/* ------------------------------------------------------------ gelecek */}
      <section id="gelecek" className="relative mx-auto max-w-[1240px] scroll-mt-24 px-5 py-24 sm:px-8 md:py-36">
        <div className="grid items-center gap-16 md:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="display text-[2.6rem] leading-[1.02] sm:text-[4.5rem]">Gelecekteki sana.</h2>
            <p className="mt-5 max-w-md text-ink-soft">
              Bir mektup yaz ve mühürle. 31 Aralık 2027 gece yarısına kadar kimse okuyamaz, sen bile. Yanına gelecek yılın panosunu kur: görseller, kelimeler, hedefler.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem]">
              <Link href="/mektup" prefetch={false} className="link-line">Mektubunu yaz</Link>
              <Link href="/vision" prefetch={false} className="link-line">Panonu kur</Link>
            </div>
          </div>

          <div className="relative h-[22rem] sm:h-[26rem]">
            {/* pano */}
            <div className="absolute right-0 top-0 grid h-[15rem] w-[62%] rotate-[3deg] grid-cols-2 grid-rows-2 gap-2 rounded-[14px] border border-white/10 bg-[rgba(14,13,18,0.7)] p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,.95)] sm:h-[18rem]">
              <div className="relative row-span-2 overflow-hidden rounded-lg">
                <Image src="/showcase/kedi.webp" alt="" fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-[#2a1219] to-[#0b0a10]">
                <span className="display text-xl italic text-gold">huzur</span>
              </div>
              <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-[#e9dcc0] to-[#b0905f] px-2 text-center">
                <span className="hand text-lg leading-tight text-[#1a1408]">yeni şehirler</span>
              </div>
            </div>
            {/* mektup */}
            <div className="paper-tex absolute bottom-0 left-0 w-[68%] max-w-[22rem] -rotate-[4deg] rounded-[6px] px-7 py-6 text-[#1a1408] shadow-[0_50px_80px_-30px_rgba(0,0,0,1)]">
              <p className="hand text-[1.6rem] leading-tight">Sevgili 2027&apos;deki ben,</p>
              <div className="mt-3 space-y-3">
                {[92, 80, 86, 54].map((w, i) => (
                  <div key={i} className="h-px bg-[#1a1408]/15" style={{ width: `${w}%` }} />
                ))}
              </div>
              <p className="hand mt-4 text-right text-xl text-[#1a1408]/60">Aralık 2026</p>
              <svg viewBox="0 0 64 64" className="absolute -right-5 -top-5 h-16 w-16 drop-shadow-[0_8px_12px_rgba(0,0,0,.5)]" aria-hidden>
                <defs>
                  <radialGradient id="waxl" cx="38%" cy="32%" r="70%">
                    <stop offset="0" stopColor="#d2465c" />
                    <stop offset=".55" stopColor="#9e1b32" />
                    <stop offset="1" stopColor="#4a0b16" />
                  </radialGradient>
                </defs>
                <path d="M32 3c4 0 6 3 9 4s7 0 9 3 1 6 3 9 5 5 5 9-3 6-4 9 0 7-3 9-6 1-9 3-5 5-9 5-6-3-9-4-7 0-9-3-1-6-3-9-5-5-5-9 3-6 4-9 0-7 3-9 6-1 9-3 5-4 9-4Z" fill="url(#waxl)" />
                <path d="M32 21c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10Z" fill="rgba(40,8,14,.55)" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ sezon: aralık */}
      <section id="aralik" className="relative scroll-mt-20 px-3 py-16 sm:px-6 md:py-24">
        <div className="season relative mx-auto max-w-[1320px] overflow-hidden rounded-[36px] border border-nar-soft/20 px-6 py-16 sm:px-12 md:py-24">
          <div aria-hidden className="season-snow pointer-events-none absolute inset-0" />
          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm text-nar-soft">Sezon</p>
              <h2 className="display mt-2 text-[4.5rem] leading-[0.9] sm:text-[8rem]">Aralık</h2>
              <p className="mt-6 max-w-md text-[1.05rem] text-ink-soft">
                Yılın son ayı için hazırladık: her gece bir kutu açılır, içinden kendin için küçük bir iyilik çıkar. Ayın sonunda 2026&apos;n tek bir hikâyede toplanır.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/takvim" prefetch={false} className="btn btn-primary">
                  Takvimi aç
                </Link>
                <Link href="/mektup" prefetch={false} className="btn btn-ghost">
                  2027&apos;ye mektup
                </Link>
              </div>
            </div>
            <div>
              <p className="display text-[1.5rem] italic text-gold">{today === 0 ? "İlk kutuya" : "Sıradaki kutuya"}</p>
              <div className="mt-4">
                <BigCountdown mode={today === 0 ? "december" : "midnight"} />
              </div>
              <div className="mt-10 grid grid-cols-8 gap-1.5 sm:gap-2" aria-hidden>
                {Array.from({ length: 24 }, (_, i) => i + 1).map((d) => (
                  <div
                    key={d}
                    className={
                      "flex aspect-square items-center justify-center rounded-[10px] text-[0.7rem] sm:text-xs " +
                      (d <= 31 && d < 1 + today
                        ? "border border-champagne/30 bg-champagne/[.08] text-gold"
                        : d === Math.max(1, today)
                          ? "bg-gradient-to-b from-[#fbf5e8] to-[#c9b089] text-midnight"
                          : "border border-white/[.07] bg-white/[.02] text-ink-mute")
                    }
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[.06]">
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

function Moment({
  href,
  title,
  text,
  cta,
  className,
  nar,
  children,
}: {
  href: string;
  title: string;
  text: string;
  cta: string;
  className?: string;
  nar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch={false} className={"group block " + (className ?? "")}>
      <div
        className={
          "relative aspect-[3/4] overflow-hidden rounded-[22px] border shadow-[0_50px_90px_-40px_rgba(0,0,0,1)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 " +
          (nar ? "border-nar-soft/25" : "border-white/10")
        }
      >
        {children}
      </div>
      <h3 className="display mt-6 text-[2rem]">{title}</h3>
      <p className="mt-2 max-w-xs text-ink-soft">{text}</p>
      <span className={"link-line mt-4 inline-block text-sm " + (nar ? "!text-nar-soft" : "")}>{cta}</span>
    </Link>
  );
}
