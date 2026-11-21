"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type ArtMeta } from "@/lib/art";
import { cn } from "@/lib/utils";

export function Gallery({ items, progress, last }: { items: ArtMeta[]; progress: Record<string, number>; last: string | null }) {
  const [cat, setCat] = useState<string>("Tümü");
  const cats = ["Tümü", ...CATEGORIES.filter((c) => items.some((i) => i.category === c))];
  const shown = cat === "Tümü" ? items : items.filter((i) => i.category === cat);
  const sorted = last ? [...shown].sort((a, b) => (a.id === last ? -1 : b.id === last ? 1 : 0)) : shown;
  return (
    <>
      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              cat === c ? "border-transparent bg-gradient-to-b from-[#ffd59a] to-[#d96f35] text-[#1a0d06]" : "border-ink/15 bg-ink/[.04] text-ink-soft hover:text-ink",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {sorted.map((a, i) => {
          const pr = progress[a.id];
          return (
            <li key={a.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
              <Link href={`/boyama/${a.id}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-gold/15 bg-[#fbf6ea] shadow-[0_24px_50px_-24px_rgba(0,0,0,.9)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold/40 group-hover:shadow-[0_30px_60px_-20px_rgba(242,140,60,.35)]">
                  <Image src={`/art/thumbs/${a.id}.webp`} alt={a.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                  {a.id === last && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-b from-[#ffd59a] to-[#d96f35] px-2.5 py-1 text-[0.7rem] font-semibold text-[#1a0d06] shadow-lg">
                      devam et
                    </span>
                  )}
                  {pr !== undefined && (
                    <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-white/30">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#ffd59a] to-[#d96f35]" style={{ width: `${Math.max(4, pr * 100)}%` }} />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2 px-0.5">
                  <span className="display text-[1.05rem] leading-tight">{a.title}</span>
                  {pr !== undefined && <span className="shrink-0 text-xs text-ink-soft">%{Math.round(pr * 100)}</span>}
                </div>
                <span className="px-0.5 text-xs text-ink-soft">
                  {a.category} · {a.regions} parça
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="hand mt-12 text-center text-2xl text-mum/80">her hafta yeni resimler · kendi fotoğrafını boyama yolda...</p>
    </>
  );
}
