"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SkyView, type SkyHandle, type SkyInput } from "@/components/biz/sky-view";
import { Logo } from "@/components/logo";

export function SharedSky({ input }: { input: SkyInput }) {
  const view = useRef<SkyHandle>(null);
  const [spin, setSpin] = useState(false);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 py-8">
      <Logo />
      <SkyView ref={view} input={input} onSpin={setSpin} className="mt-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn btn-ghost" onClick={() => view.current?.spin(!spin)}>
          {spin ? "Durdur" : "O gece nasıl döndü?"}
        </button>
        <Link href="/biz/gokyuzu" prefetch={false} className="btn btn-primary">
          Kendi gökyüzünü çiz
        </Link>
      </div>
      <p className="mt-8 text-center text-xs text-ink-mute">Yıldız konumları gerçek gökbilim hesabıyla bulunur. Yıldız verisi: d3-celestial (Olaf Frohn).</p>
    </main>
  );
}
