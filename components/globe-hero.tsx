"use client";

import dynamic from "next/dynamic";

const SnowGlobe = dynamic(() => import("./snow-globe"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-56 w-56 animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.25),rgba(185,205,242,.08)_45%,transparent_70%)] ring-1 ring-white/10" />
    </div>
  ),
});

export function GlobeHero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <div
        className="pointer-events-none absolute inset-[12%] rounded-full opacity-80 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(185,205,242,.22), rgba(220,199,161,.10) 45%, transparent 70%)" }}
      />
      <SnowGlobe className="relative h-full w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
