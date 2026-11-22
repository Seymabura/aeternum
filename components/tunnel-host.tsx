"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Lenis from "lenis";

const YearTunnel = dynamic(() => import("./year-tunnel"), {
  ssr: false,
  loading: () => <div aria-hidden className="night-stars fixed inset-0 -z-[5] bg-night" />,
});

/** Ana sayfa: 3D tünel + yumuşak kaydırma (hareket azaltma açıksa kapalı) */
export function TunnelHost() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true });
    // menüdeki #bağlantılar da yumuşak gitsin
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);
  return <YearTunnel />;
}
