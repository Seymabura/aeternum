"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#anlar", label: "Anlar" },
  { href: "#gelecek", label: "Gelecek" },
  { href: "#aralik", label: "Aralık" },
];

/** Ortalı, yüzen cam menü. Kaydırınca koyulaşır. */
export function LandingNav() {
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
        aria-label="Ana menü"
        className={cn(
          "mx-auto flex max-w-[640px] items-center justify-between rounded-full border py-2 pl-5 pr-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "backdrop-blur-xl",
          scrolled ? "border-champagne/15 bg-[rgba(6,5,8,0.78)] shadow-[0_18px_40px_-20px_rgba(0,0,0,.9)]" : "border-white/[.06] bg-[rgba(6,5,8,0.25)]",
        )}
      >
        <Logo />
        <div className="flex items-center">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={cn("rounded-full px-2.5 py-2 text-sm transition-colors hover:text-ink sm:px-4", l.href === "#aralik" ? "text-nar-soft" : "text-ink-soft")}>
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
