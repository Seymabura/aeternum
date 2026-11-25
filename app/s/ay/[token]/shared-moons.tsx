"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MoonPosterView, type MoonPosterHandle } from "@/components/biz/moon-poster-view";
import { pct, unionFractionOf, unionLine, type MoonPayload } from "@/lib/astro/moon-poster";
import { phaseLabel } from "@/lib/astro/moon";
import { Logo } from "@/components/logo";

const short = (a: number) => phaseLabel(a).replace(/ \(.*\)/, "");

export function SharedMoons({ payload }: { payload: MoonPayload }) {
  const view = useRef<MoonPosterHandle>(null);
  const [merged, setMerged] = useState(false);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 py-8">
      <Logo />
      <MoonPosterView ref={view} payload={payload} onMerged={setMerged} className="mt-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
      <h1 className="display mt-8 text-center text-[2.25rem]">
        {payload.a.name}
        {payload.b && (
          <>
            {" "}
            <span className="italic text-nar-soft">&</span> {payload.b.name}
          </>
        )}
      </h1>
      <dl className={`mt-5 grid w-full border-y border-champagne/10 py-4 text-center ${payload.b ? "grid-cols-2" : "grid-cols-1"}`}>
        {[payload.a, payload.b].filter((m): m is NonNullable<typeof m> => !!m).map((m, i) => (
          <div key={i}>
            <dt className="text-sm text-ink-soft">{m.name}</dt>
            {m.dateText && <dd className="text-xs text-ink-mute">{m.dateText}</dd>}
            <dd className="display mt-1 text-[1.3rem]">{short(m.phaseAngle)}</dd>
            <dd className="num text-sm text-champagne">{pct(m.fraction)} aydınlık</dd>
          </div>
        ))}
      </dl>
      {payload.b && (
        <>
          <p className="display mt-5 text-[1.4rem] italic text-gold">İkimiz birlikte: {pct(unionFractionOf(payload))}</p>
          <p className="mt-1 text-center text-sm text-ink-soft">{unionLine(payload)}</p>
        </>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {payload.b && (
          <button className="btn btn-ghost" onClick={() => view.current?.merge(!merged)}>
            {merged ? "Ayır" : "Birleştir"}
          </button>
        )}
        <Link href="/biz/iki-ay" prefetch={false} className="btn btn-primary">
          Kendi Ay&apos;ını bul
        </Link>
      </div>
      <p className="mt-8 text-center text-xs text-ink-mute">Ay evreleri gerçek gökbilim hesabıyla bulunur. Ay görüntüsü: NASA SVS.</p>
    </main>
  );
}
