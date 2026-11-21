"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { computeSky, type ConstellationData, type StarRow } from "@/lib/astro/sky";
import { drawSkyPoster, ensureSkyFonts, SKY_EXPORTS, type SkyMeta } from "@/lib/astro/sky-render";
import { shareOrDownload } from "@/lib/share";
import { cn } from "@/lib/utils";

let dataPromise: Promise<{ stars: StarRow[]; cons: ConstellationData }> | null = null;
export function loadSkyData() {
  if (!dataPromise) {
    dataPromise = Promise.all([fetch("/sky/stars.json").then((r) => r.json()), fetch("/sky/constellations.json").then((r) => r.json())]).then(([stars, cons]) => ({ stars, cons }));
    dataPromise.catch(() => (dataPromise = null));
  }
  return dataPromise;
}

export type SkyInput = { when: string; lat: number; lon: number; meta: SkyMeta; initials: boolean };
export type SkyHandle = { exportAs: (id: (typeof SKY_EXPORTS)[number]["id"]) => Promise<void>; spin: (on: boolean) => void };

export const SkyView = forwardRef<SkyHandle, { input: SkyInput; className?: string; onSpin?: (on: boolean) => void }>(function SkyView({ input, className, onSpin }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<{ stars: StarRow[]; cons: ConstellationData } | null>(null);
  const raf = useRef(0);
  const spinning = useRef(false);
  const offset = useRef(0); // dakika
  const [size, setSize] = useState({ w: 360, h: 640 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      setSize({ w, h: Math.round((w * 16) / 9) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const render = (progress: number) => {
    const c = canvasRef.current;
    const d = dataRef.current;
    if (!c || !d) return;
    const t = new Date(new Date(input.when).getTime() + offset.current * 60000);
    const sky = computeSky(t, input.lat, input.lon, d.stars, d.cons);
    drawSkyPoster(c.getContext("2d")!, c.width, c.height, sky, input.meta, { progress, initials: input.initials && !spinning.current });
  };

  useEffect(() => {
    let dead = false;
    cancelAnimationFrame(raf.current);
    (async () => {
      const [data] = await Promise.all([loadSkyData(), ensureSkyFonts()]);
      if (dead) return;
      dataRef.current = data;
      const c = canvasRef.current!;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = size.w * dpr;
      c.height = size.h * dpr;
      setReady(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return render(1);
      const t0 = performance.now();
      const step = (now: number) => {
        if (dead) return;
        const p = Math.min(1, (now - t0) / 2600);
        render(p);
        if (p < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    })();
    return () => {
      dead = true;
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, size.w, size.h]);

  useImperativeHandle(ref, () => ({
    spin(on) {
      spinning.current = on;
      cancelAnimationFrame(raf.current);
      onSpin?.(on);
      if (!on) {
        offset.current = 0;
        render(1);
        return;
      }
      let last = performance.now();
      const step = (now: number) => {
        if (!spinning.current) return;
        offset.current += ((now - last) / 1000) * 10; // 1 sn = 10 dk
        last = now;
        if (offset.current > 12 * 60) offset.current = -12 * 60;
        render(1);
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    async exportAs(id) {
      const spec = SKY_EXPORTS.find((e) => e.id === id)!;
      const d = dataRef.current ?? (await loadSkyData());
      const c = document.createElement("canvas");
      c.width = spec.w;
      c.height = spec.h;
      const sky = computeSky(new Date(input.when), input.lat, input.lon, d.stars, d.cons);
      drawSkyPoster(c.getContext("2d")!, spec.w, spec.h, sky, input.meta, { progress: 1, initials: input.initials });
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error("png");
      await shareOrDownload(blob, `aeternum-gokyuzu-${spec.id}.png`, "Gökyüzümüz");
    },
  }));

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)} style={{ aspectRatio: "9 / 16" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${input.meta.dateText}, ${input.meta.place} gökyüzü: yıldızlar, takımyıldızlar${input.initials ? " ve baş harfleriniz" : ""}.`}
        className="absolute inset-0 rounded-[22px]"
        style={{ width: size.w, height: size.h }}
      />
      {!ready && <div className="shimmer absolute inset-0 rounded-[22px]" />}
    </div>
  );
});
