"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Lenis from "lenis";

const StarRoad = dynamic(() => import("./star-road"), {
  ssr: false,
  loading: () => <div aria-hidden className="night-stars fixed inset-0 -z-[5] bg-night" />,
});

/** Ana sayfa: sonsuz yıldız yolu + yumuşak kaydırma (hareket azaltma açıksa kapalı) */
export function StarRoadHost() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.08, smoothWheel: true });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const el = a && document.querySelector(a.getAttribute("href")!);
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
  return <StarRoad />;
}
