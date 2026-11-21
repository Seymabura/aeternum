"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MoonPosterView, type MoonPosterHandle } from "@/components/biz/moon-poster-view";
import type { MoonPayload } from "@/lib/astro/moon-poster";
import { Logo } from "@/components/logo";

export function SharedMoons({ payload }: { payload: MoonPayload }) {
  const view = useRef<MoonPosterHandle>(null);
  const [merged, setMerged] = useState(false);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 py-8">
      <Logo />
      <MoonPosterView ref={view} payload={payload} onMerged={setMerged} hideDates={!payload.a.dateText} className="mt-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn btn-ghost" onClick={() => view.current?.merge(!merged)}>
          {merged ? "Ayır" : "Birleştir"}
        </button>
        <Link href="/biz/iki-ay" prefetch={false} className="btn btn-primary">
          Kendi İki Ay'ını yap
        </Link>
      </div>
      <p className="mt-8 text-center text-xs text-ink-mute">Ay evreleri gerçek gökbilim hesabıyla bulunur. Ay görüntüsü: NASA SVS.</p>
    </main>
  );
}
