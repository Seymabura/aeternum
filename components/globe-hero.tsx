"use client";

import dynamic from "next/dynamic";
import type { GlobeProps } from "./snow-globe";
import { cn } from "@/lib/utils";

const SnowGlobe = dynamic(() => import("./snow-globe"), {
  ssr: false,
  // 3D yüklenene kadar küre fotoğrafı
  loading: () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/showcase/kure.webp" alt="" className="h-full w-full scale-[0.92] object-contain opacity-60 blur-[1px]" />
  ),
});

export function GlobeHero({ className, ...props }: GlobeProps) {
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[560px]", className)}>
      <div
        className="pointer-events-none absolute inset-[12%] rounded-full opacity-80 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(185,205,242,.22), rgba(220,199,161,.10) 45%, transparent 70%)" }}
      />
      <SnowGlobe {...props} className="relative h-full w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
