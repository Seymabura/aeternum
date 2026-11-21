import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listShares } from "@/app/actions/biz";
import { GlobeHero } from "@/components/globe-hero";
import { ShareList } from "./share-list";

export const metadata = { title: "Biz" };

const FEATURES = [
  {
    href: "/biz/iki-ay",
    title: "İki Ay",
    text: "İkinizin doğduğu gecenin Ay'ı, gerçek gökbilim hesabıyla. Yan yana durur, sonra tek bir Ay'da birleşir. Poster ve duvar kağıdı olarak indirilir.",
    img: "/showcase/biz-ay.webp",
  },
  {
    href: "/biz/gokyuzu",
    title: "Tanıştığınız gecenin gökyüzü",
    text: "O tarih, saat ve şehirden görünen gerçek yıldızlar, takımyıldızlar, Ay ve gezegenler. İsterseniz baş harfleriniz yıldızlarla çizilir.",
    img: "/showcase/biz-gok.webp",
  },
  {
    href: "/biz/2026",
    title: "Bizim 2026'mız",
    text: "Her aydan bir fotoğraf, yılın şarkısı, tek bir kelime ve son bir cümle. Kodla oynatılan, video olarak indirilebilen kısa bir film.",
    img: "/showcase/biz-film.webp",
  },
] as const;

export default async function BizPage() {
  const shares = await listShares();
  return (
    <div className="mx-auto max-w-5xl">
      <header className="max-w-2xl">
        <p className="eyebrow">Biz</p>
        <h1 className="display mt-5 text-[2.75rem] sm:text-[4.5rem]">
          İkimizin <em className="gold-shine italic">2026&apos;sı</em>
        </h1>
        <p className="mt-6 max-w-lg text-ink-soft">Birlikte geçen bir yılın gökyüzü, Ay&apos;ı ve anları. Hepsi bu cihazda hesaplanır; sen bağlantı oluşturmadıkça hiçbir yere kaydedilmez.</p>
      </header>

      <ol className="mt-16 md:mt-24">
        {FEATURES.map((f, i) => (
          <li key={f.href} className="border-t border-champagne/10">
            <Link href={f.href} className="group grid items-center gap-8 py-10 md:grid-cols-[1fr_15rem] md:gap-16 md:py-14">
              <div>
                <span className="display num text-sm italic text-ink-mute">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="display mt-3 text-[2.25rem] transition-colors duration-500 group-hover:text-gold sm:text-[3rem]">{f.title}</h2>
                <p className="mt-4 max-w-md text-ink-soft">{f.text}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-champagne">
                  Başla <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                </span>
              </div>
              <div className="relative mx-auto aspect-[9/16] w-48 overflow-hidden rounded-[18px] border border-champagne/12 shadow-[0_30px_60px_-24px_rgba(0,0,0,.9)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 md:w-60">
                <Image src={f.img} alt="" fill sizes="240px" className="object-cover" />
              </div>
            </Link>
          </li>
        ))}
        <li className="border-y border-champagne/10">
          <Link href="/biz/kure" className="group grid items-center gap-8 py-10 md:grid-cols-[1fr_15rem] md:gap-16 md:py-14">
            <div>
              <span className="display num text-sm italic text-ink-mute">04</span>
              <h2 className="display mt-3 text-[2.25rem] transition-colors duration-500 group-hover:text-gold sm:text-[3rem]">Ortak küre</h2>
              <p className="mt-4 max-w-md text-ink-soft">Partnerini davet et; ikinizin tamamladığı günler aynı kar küresini süslesin. Bir de ortak 2027 listeniz olsun.</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-champagne">
                Davet et <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
              </span>
            </div>
            <div className="mx-auto w-48 md:w-60">
              <GlobeHero days={[1, 2, 4, 6, 9, 10, 14, 22]} pairDays={[2, 9, 14]} autoRotate />
            </div>
          </Link>
        </li>
      </ol>

      {shares.length > 0 && <ShareList initial={shares} />}
    </div>
  );
}
