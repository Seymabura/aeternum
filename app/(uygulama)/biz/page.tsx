import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listShares } from "@/app/actions/biz";
import { ShareList } from "./share-list";

export const metadata = { title: "Biz" };

const FEATURES = [
  {
    href: "/biz/iki-ay",
    title: "İki Ay",
    text: "İkinizin doğduğu gecenin Ay'ı; gerçek gökbilim hesabı, NASA'nın 4K Ay görüntüsü ve o gece Ay'ın etrafındaki gerçek yıldızlarla. Yan yana durur, sonra tek bir Ay'da birleşir.",
    img: "/showcase/biz-ay.webp",
  },
  {
    href: "/biz/gokyuzu",
    title: "Tanıştığınız gecenin gökyüzü",
    text: "O tarih, saat ve şehirden görünen 40.000 gerçek yıldız ve Samanyolu; bir gece fotoğrafı gibi, ekranın tamamını kaplayan 4K duvar kağıdı.",
    img: "/showcase/biz-gok.webp",
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
        <p className="mt-6 max-w-lg text-ink-soft">Birlikte geçen bir yılın gökyüzü ve Ay&apos;ı. Hepsi bu cihazda hesaplanır; sen bağlantı oluşturmadıkça hiçbir yere kaydedilmez.</p>
      </header>

      <ol className="mt-16 md:mt-24">
        {FEATURES.map((f, i) => (
          <li key={f.href} className="border-t border-champagne/10 last:border-b">
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
          <Link href="/biz/defter" className="group grid items-center gap-8 py-10 md:grid-cols-[1fr_15rem] md:gap-16 md:py-14">
            <div>
              <span className="display num text-sm italic text-ink-mute">03</span>
              <h2 className="display mt-3 text-[2.25rem] transition-colors duration-500 group-hover:text-gold sm:text-[3rem]">Ortak defter</h2>
              <p className="mt-4 max-w-md text-ink-soft">30 gün boyunca her gece ikinize aynı soru gelir. İkiniz de cevaplayınca cevaplar birlikte açılır; sonunda ikinizin anı kitapçığı olur.</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#ff9aab]">
                Defteri aç <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
              </span>
            </div>
            <JournalArt />
          </Link>
        </li>
      </ol>

      {shares.length > 0 && <ShareList initial={shares} />}
    </div>
  );
}

/** iki kâğıt sayfa: biri senin, biri onun cevabı */
function JournalArt() {
  return (
    <div aria-hidden className="relative mx-auto h-64 w-48 md:w-60">
      <div className="paper-tex absolute left-0 top-6 h-48 w-36 -rotate-6 rounded-[6px] p-4 text-[#1a1408] shadow-[0_30px_60px_-24px_rgba(0,0,0,.95)] transition-transform duration-700 group-hover:-rotate-8">
        <p className="text-[0.6rem] opacity-60">7. gün</p>
        <p className="hand mt-1 text-lg leading-tight">Beni üç kelimeyle anlat.</p>
        <div className="mt-3 space-y-2">{[90, 70, 80].map((w, i) => <div key={i} className="h-px bg-[#1a1408]/20" style={{ width: `${w}%` }} />)}</div>
      </div>
      <div className="absolute right-0 top-0 h-48 w-36 rotate-6 rounded-[6px] border border-nar-soft/40 bg-gradient-to-b from-[#3a0a16] to-[#1a0409] p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,.95),0_0_40px_-16px_rgba(210,70,92,.8)] transition-transform duration-700 group-hover:rotate-[8deg]">
        <p className="text-[0.6rem] text-[#ffb3bf]">Onun cevabı</p>
        <div className="mt-6 grid h-20 place-items-center rounded-[6px] border border-dashed border-[#ffb3bf]/40 text-2xl">🔒</div>
      </div>
    </div>
  );
}
