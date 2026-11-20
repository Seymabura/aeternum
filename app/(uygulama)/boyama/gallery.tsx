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
              cat === c ? "border-bordo bg-bordo text-paper-3" : "border-ink/15 bg-paper-3/70 text-ink-soft hover:bg-paper-3",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((a, i) => {
          const pr = progress[a.id];
          return (
            <li key={a.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
              <Link href={`/boyama/${a.id}`} className="group block">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-ink/10 bg-[#fffaf1] p-2 shadow-[var(--shadow-paper)] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-lift)]",
                    a.w === a.h ? "aspect-square" : "aspect-[4/5]",
                  )}
                >
                  <Image src={`/art/thumbs/${a.id}.webp`} alt={a.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-2" />
                  {a.id === last && (
                    <span className="absolute left-2 top-2 rounded-full bg-mum px-2 py-0.5 text-[0.7rem] font-semibold text-white">
                      devam et
                    </span>
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
      <p className="hand mt-10 text-center text-2xl text-latte">yeni resimler ve kendi fotoğrafını boyama yolda...</p>
    </>
  );
}
