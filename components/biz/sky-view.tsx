"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { buildCatalog, composeSky, makeScene, renderSky, smallMoon, type Catalog, type ConstellationLines, type MilkyWay, type SkyLayers, type StarRow, type ViewDir } from "@/lib/astro/skyfield";
import { loadMoonTexture } from "@/lib/astro/moon-render";
import { shareOrDownload } from "@/lib/share";
import { cn } from "@/lib/utils";

let catPromise: Promise<Catalog> | null = null;
/** Derin yıldız kataloğu (kadir ≤ 8, ~41.000 yıldız) + Samanyolu + takımyıldız çizgileri */
export function loadCatalog() {
  if (!catPromise) {
    catPromise = Promise.all([
      fetch("/sky/stars8.json").then((r) => r.json() as Promise<StarRow[]>),
      fetch("/sky/milkyway.json").then((r) => r.json() as Promise<MilkyWay>),
      fetch("/sky/constellations.json").then((r) => r.json() as Promise<{ lines: ConstellationLines }>),
    ]).then(([s, mw, c]) => buildCatalog(s, mw, c.lines));
    catPromise.catch(() => (catPromise = null));
  }
  return catPromise;
}

export type SkyMeta = { names: [string, string]; dateText: string; place: string; coords: string; line?: string };
export type SkyInput = { when: string; lat: number; lon: number; meta: SkyMeta; dir?: ViewDir; lines?: boolean };

export const SKY_EXPORTS = [
  { id: "iphone", label: "iPhone duvar kağıdı", w: 1290, h: 2796 },
  { id: "android", label: "Android duvar kağıdı", w: 1440, h: 3200 },
  { id: "4k", label: "4K dikey", w: 2160, h: 3840 },
  { id: "story", label: "Hikâye (9:16)", w: 1080, h: 1920 },
  { id: "masaustu", label: "Masaüstü 4K", w: 3840, h: 2160 },
] as const;
export type SkyExportId = (typeof SKY_EXPORTS)[number]["id"];

export type SkyHandle = { exportAs: (id: SkyExportId, onProgress?: (p: number) => void) => Promise<void>; spin: (on: boolean) => void };

/** Bir sahneyi verilen boyutta baştan sona çizer (dışa aktarma ve ön izleme ortak) */
export async function paintSky(input: SkyInput, cat: Catalog, W: number, H: number, opts: { onProgress?: (p: number) => void; limitMag?: number; fast?: boolean; offsetMin?: number } = {}) {
  const landscape = W > H;
  const when = new Date(new Date(input.when).getTime() + (opts.offsetMin ?? 0) * 60000);
  const scene = makeScene(when, input.lat, input.lon, cat, input.dir ?? "oto", landscape ? 120 : 95);
  const layers = await renderSky(scene, cat, W, H, { lines: input.lines, limitMag: opts.limitMag, onProgress: opts.onProgress, fast: opts.fast, scale: Math.min(W, H) / 1080 });
  let moonImg: HTMLCanvasElement | null = null;
  if (layers.moonPx) {
    const tex = await loadMoonTexture();
    moonImg = smallMoon(tex, scene, layers.moonPx.d);
  }
  return { layers, moonImg, scene };
}

export const SkyView = forwardRef<SkyHandle, { input: SkyInput; className?: string; onSpin?: (on: boolean) => void }>(function SkyView({ input, className, onSpin }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<Catalog | null>(null);
  const layersRef = useRef<{ layers: SkyLayers; moonImg: HTMLCanvasElement | null } | null>(null);
  const raf = useRef(0);
  const spinning = useRef(false);
  const offset = useRef(0);
  const t0 = useRef(0);
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

  // katmanları hazırla
  useEffect(() => {
    let dead = false;
    cancelAnimationFrame(raf.current);
    setReady(false);
    (async () => {
      const cat = await loadCatalog();
      if (dead) return;
      catRef.current = cat;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.round(size.w * dpr);
      const H = Math.round(size.h * dpr);
      const res = await paintSky(input, cat, W, H, { limitMag: 7.5 });
      if (dead) return;
      layersRef.current = res;
      const c = canvasRef.current!;
      c.width = W;
      c.height = H;
      setReady(true);
      t0.current = performance.now();
      loop();
    })();
    return () => {
      dead = true;
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, size.w, size.h]);

  function loop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = async (now: number) => {
      const c = canvasRef.current;
      const L = layersRef.current;
      if (!c || !L) return;
      if (!document.hidden) {
        const el = (now - t0.current) / 1000;
        const reveal = reduce ? 1 : Math.min(1, el / 1.5);
        composeSky(c.getContext("2d")!, L.layers, { t: reduce ? undefined : el, reveal, moonImg: L.moonImg });
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  useImperativeHandle(ref, () => ({
    spin(on) {
      spinning.current = on;
      onSpin?.(on);
      cancelAnimationFrame(raf.current);
      const c = canvasRef.current;
      const cat = catRef.current;
      if (!c || !cat) return;
      if (!on) {
        offset.current = 0;
        (async () => {
          layersRef.current = await paintSky(input, cat, c.width, c.height, { limitMag: 7.5 });
          t0.current = performance.now() - 2000;
          loop();
        })();
        return;
      }
      let last = performance.now();
      let busy = false;
      const step = async (now: number) => {
        if (!spinning.current) return;
        if (!busy) {
          busy = true;
          offset.current += ((now - last) / 1000) * 10; // 1 sn = 10 dk
          last = now;
          if (offset.current > 12 * 60) offset.current = -12 * 60;
          const res = await paintSky(input, cat, c.width, c.height, { limitMag: 6.5, fast: true, offsetMin: offset.current });
          if (spinning.current) composeSky(c.getContext("2d")!, res.layers, { moonImg: res.moonImg });
          busy = false;
        }
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    async exportAs(id, onProgress) {
      const spec = SKY_EXPORTS.find((e) => e.id === id)!;
      const cat = catRef.current ?? (await loadCatalog());
      const res = await paintSky(input, cat, spec.w, spec.h, { onProgress });
      const c = document.createElement("canvas");
      c.width = spec.w;
      c.height = spec.h;
      composeSky(c.getContext("2d")!, res.layers, { moonImg: res.moonImg });
      onProgress?.(1);
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error("png");
      await shareOrDownload(blob, `aeternum-gokyuzu-${spec.id}.png`, "Gökyüzümüz");
    },
  }));

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div ref={wrapRef} className={cn("relative w-full overflow-hidden rounded-[22px] bg-[#020205]", className)} style={{ aspectRatio: "9 / 16" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${input.meta.dateText}, ${input.meta.place} gökyüzü: o an görünen gerçek yıldızlar ve Samanyolu.`}
        className="absolute inset-0"
        style={{ width: size.w, height: size.h }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-ink-mute">Yıldızlar yerleşiyor…</span>
        </div>
      )}
    </div>
  );
});
