import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { coupleState } from "@/app/actions/biz";
import { journalState } from "@/app/actions/defter";
import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { PrintButton } from "./print-button";

export const metadata = { title: "Anı kitapçığımız" };

export default async function KitapPage() {
  const [couple, journal] = await Promise.all([coupleState(), journalState()]);
  const me = couple?.members.find((m) => m.me)?.name || "Ben";
  const partner = couple?.members.find((m) => !m.me)?.name || "Sevgilim";
  const pages = (journal?.days ?? []).filter((d) => d.mine && d.partner);
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/biz/defter" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Ortak defter
        </Link>
        {pages.length > 0 && <PrintButton />}
      </div>
      <header className="mt-12 text-center print:mt-0">
        <p className="text-sm text-[#ffb3bf] print:text-[#9e1b32]">Ortak defter</p>
        <h1 className="display mt-3 text-[2.8rem] leading-[1.05] sm:text-[3.6rem] print:text-black">
          {me} &amp; {partner}
        </h1>
        <p className="mt-3 text-ink-soft print:text-neutral-600">
          {pages.length} sayfa{journal ? `, ${new Date(journal.started_on).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} başlangıçlı` : ""}
        </p>
      </header>
      {pages.length === 0 ? (
        <p className="mt-16 text-center text-ink-soft">İkinizin de cevapladığı ilk soru burada belirecek.</p>
      ) : (
        <ol className="mt-14 space-y-14">
          {pages.map((d) => (
            <li key={d.day} className="break-inside-avoid">
              <p className="text-xs text-ink-mute print:text-neutral-500">{d.day}. gün</p>
              <h2 className="display mt-2 text-[1.7rem] leading-snug print:text-black">{JOURNAL_QUESTIONS[d.day - 1]}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <blockquote className="rounded-[14px] border border-champagne/20 p-4 print:border-neutral-300">
                  <p className="text-xs text-ink-mute print:text-neutral-500">{me}</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink print:text-black">{d.mine}</p>
                </blockquote>
                <blockquote className="rounded-[14px] border border-nar-soft/30 p-4 print:border-neutral-300">
                  <p className="text-xs text-ink-mute print:text-neutral-500">{partner}</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink print:text-black">{d.partner}</p>
                </blockquote>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
