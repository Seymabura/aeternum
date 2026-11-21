"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

/** Ortalı, yüzen cam menü. Kaydırınca biraz küçülür ve koyulaşır. */
export function LandingNav({ start }: { start: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={cn(
          "mx-auto flex max-w-[720px] items-center justify-between rounded-full border pl-5 pr-1.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "backdrop-blur-xl backdrop-saturate-150",
          scrolled
            ? "border-champagne/15 bg-[rgba(10,15,28,0.82)] py-1 shadow-[0_18px_40px_-20px_rgba(0,0,0,.8)]"
            : "border-champagne/10 bg-[rgba(18,26,46,0.45)] py-1.5",
        )}
      >
        <Logo />
        <div className="flex items-center gap-1">
          <a href="#ozellikler" className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink sm:block">
            Özellikler
          </a>
          <a href="#nasil" className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink sm:block">
            Nasıl çalışır
          </a>
          <Link prefetch={false} href={start} className="btn btn-primary btn-sm">
            Başla
          </Link>
        </div>
      </nav>
    </header>
  );
}
