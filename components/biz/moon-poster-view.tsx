"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { loadMoonTexture, MOON_2K, MOON_4K } from "@/lib/astro/moon-render";
import { buildMoons, drawPoster, ensurePosterFonts, EXPORTS, moonLayout, pct, unionFractionOf, type MoonImages, type MoonPayload } from "@/lib/astro/moon-poster";
import { makeDirScene, renderSky, type SkyLayers } from "@/lib/astro/skyfield";
import { loadCatalog } from "@/components/biz/sky-view";
import { phaseLabel } from "@/lib/astro/moon";
import { shareOrDownload } from "@/lib/share";
import { cn } from "@/lib/utils";

export type MoonPosterHandle = {
  merge: (to: boolean) => void;
  /** only: çiftte sadece bir kişinin Ay'ı; caption: isim, tarih ve evre yazısı */
  exportAs: (id: (typeof EXPORTS)[number]["id"], opts?: { only?: "a" | "b"; caption?: boolean; note?: string }) => Promise<void>;
};

/**
 * İki Ay posterinin canlı önizlemesi (9:16). Ay'lar bir kez çizilir; animasyon sadece yerleşimi değiştirir.
 */
export const MoonPosterView = forwardRef<MoonPosterHandle, { payload: MoonPayload; autoMerge?: boolean; className?: string; onMerged?: (m: boolean) => void }>(
  function MoonPosterView({ payload, autoMerge = true, className, onMerged }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<MoonImages | null>(null);
    const texRef = useRef<ImageData | null>(null);
    const progRef = useRef(0);
    const animRef = useRef(0);
    const skyRef = useRef<SkyLayers | null>(null);
    const loopRef = useRef(0);
    const t0 = useRef(0);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);
    const [size, setSize] = useState({ w: 360, h: 640 });

    // boyut
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

    const draw = () => {
      const c = canvasRef.current;
      const img = imgRef.current;
      if (!c || !img) return;
      const ctx = c.getContext("2d")!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const el = (performance.now() - t0.current) / 1000;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      drawPoster(ctx, c.width, c.height, payload, img, progRef.current, skyRef.current ? { layers: skyRef.current, t: reduce ? undefined : el, reveal: reduce ? 1 : Math.min(1, el / 1.5) } : null);
    };

    // Ay'ları hazırla
    useEffect(() => {
      let dead = false;
      (async () => {
        try {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const W = size.w * dpr;
          const H = size.h * dpr;
          // büyük ekranlarda ön izleme de 4K dokuyla
          const [tex] = await Promise.all([loadMoonTexture(W > 900 ? MOON_4K : MOON_2K), ensurePosterFonts()]);
          if (dead) return;
          texRef.current = tex;
          imgRef.current = buildMoons(tex, payload, W, H);
          skyRef.current = await skyFor(payload, W, H);
          if (dead) return;
          const c = canvasRef.current!;
          c.width = W;
          c.height = H;
          setReady(true);
          t0.current = performance.now();
          // yıldızların parıldaması için sürekli döngü
          cancelAnimationFrame(loopRef.current);
          const loop = () => {
            if (!document.hidden) draw();
            loopRef.current = requestAnimationFrame(loop);
          };
          loopRef.current = requestAnimationFrame(loop);
        } catch {
          if (!dead) setFailed(true);
        }
      })();
      return () => {
        dead = true;
        cancelAnimationFrame(loopRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload, size.w, size.h]);

    function animateTo(target: number, ms = 2400) {
      cancelAnimationFrame(animRef.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const from = progRef.current;
      const t0 = performance.now();
      const dur = reduce ? 1 : ms;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        progRef.current = from + (target - from) * k;
        if (k < 1) animRef.current = requestAnimationFrame(step);
        else onMerged?.(target === 1);
      };
      animRef.current = requestAnimationFrame(step);
    }

    // ilk açılışta bir kez birleş
    const played = useRef(false);
    useEffect(() => {
      if (!ready || !autoMerge || !payload.b || played.current) return;
      played.current = true;
      const t = setTimeout(() => animateTo(1), 900);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, autoMerge]);

    useEffect(
      () => () => {
        cancelAnimationFrame(animRef.current);
        cancelAnimationFrame(loopRef.current);
      },
      [],
    );

    useImperativeHandle(ref, () => ({
      merge: (to) => animateTo(to ? 1 : 0),
      async exportAs(id, opts) {
        const spec = EXPORTS.find((e) => e.id === id)!;
        const p: MoonPayload = opts?.only && payload.b ? { a: payload[opts.only]!, b: null } : payload;
        const tex = await loadMoonTexture(MOON_4K);
        const c = document.createElement("canvas");
        c.width = spec.w;
        c.height = spec.h;
        const imgs = buildMoons(tex, p, spec.w, spec.h);
        const sky = await skyFor(p, spec.w, spec.h);
        drawPoster(c.getContext("2d")!, spec.w, spec.h, p, imgs, progRef.current > 0.5 ? 1 : 0, sky ? { layers: sky } : null, captionFor(p, !!opts?.caption, opts?.note));
        const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
        if (!blob) throw new Error("png");
        const names = [p.a.name, p.b?.name].filter(Boolean).join("-").toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü-]+/g, "-");
        await shareOrDownload(blob, `aeternum-ay-${names}-${spec.id}.png`, "Doğduğun gecenin Ay'ı");
      },
    }));

    const label = [payload.a, payload.b]
      .filter((m): m is NonNullable<typeof m> => !!m)
      .map((m) => `${m.name} doğduğu gece Ay: ${phaseLabel(m.phaseAngle)}, yüzde ${Math.round(m.fraction * 100)} aydınlık.`)
      .join(" ");

    return (
      <div ref={wrapRef} className={cn("relative w-full", className)} style={{ aspectRatio: "9 / 16" }}>
        <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 h-full w-full rounded-[22px]" style={{ width: size.w, height: size.h }} />
        {!ready && !failed && <div className="shimmer absolute inset-0 rounded-[22px]" />}
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-[22px] bg-paper-3 p-6 text-center">
            {/* yedek: dokusuz basit diskler */}
            <div className="flex gap-6">
              {[payload.a, payload.b].filter((m): m is NonNullable<typeof m> => !!m).map((m) => (
                <svg key={m.name} viewBox="-1 -1 2 2" className="h-24 w-24" aria-hidden>
                  <circle r="1" fill="#1a2238" />
                  <PhaseMask angle={m.phaseAngle} />
                </svg>
              ))}
            </div>
            <p className="text-sm text-ink-soft">
              {[payload.a, payload.b]
                .filter((m): m is NonNullable<typeof m> => !!m)
                .map((m) => `${m.name}: ${phaseLabel(m.phaseAngle)} ${pct(m.fraction)}`)
                .join(" · ")}
            </p>
          </div>
        )}
      </div>
    );
  },
);

/** Görselin altındaki yazı: isteğe bağlı isim/tarih/evre ve kişinin kendi notu. İkisi de yoksa yazı yok. */
export function captionFor(p: MoonPayload, info: boolean, note?: string) {
  const n = note?.trim() || undefined;
  if (!info) return n ? { title: "", lines: [], note: n } : null;
  const ph = (x: NonNullable<MoonPayload["b"]>) => `${phaseLabel(x.phaseAngle).replace(/ \(.*\)/, "")} · %${Math.round(x.fraction * 100)} aydınlık`;
  if (!p.b) return { title: p.a.name, lines: [p.a.dateText, ph(p.a)].filter(Boolean), note: n };
  return { title: `${p.a.name} & ${p.b.name}`, lines: [`${p.a.name}: ${ph(p.a)}`, `${p.b.name}: ${ph(p.b)}`], note: n };
}

/** O gece Ay'ın etrafındaki gerçek yıldızlar (yön yoksa Ay'ın ortalama yolu üzerinde bir yer) */
async function skyFor(p: MoonPayload, W: number, H: number): Promise<SkyLayers | null> {
  try {
    const cat = await loadCatalog();
    const v = p.a.v ?? [0.36, 0.86, 0.36];
    const scene = makeDirScene(v, unionFractionOf(p), W > H ? 95 : 70);
    return await renderSky(scene, cat, W, H, { moonGlowOnly: true, noMilkyWay: true, cyFrac: moonLayout(W, H).cy / H, scale: Math.min(W, H) / 1080, limitMag: 8 });
  } catch {
    return null;
  }
}

/** SVG yedeği: yarım daire + elips yay ile evre maskesi */
function PhaseMask({ angle }: { angle: number }) {
  const a = ((angle % 360) + 360) % 360;
  const k = Math.cos((a * Math.PI) / 180); // 1 yeni ay, -1 dolunay
  const waxing = a < 180;
  const rx = Math.abs(k);
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = k > 0 ? (waxing ? 0 : 1) : waxing ? 1 : 0;
  const d = `M0,-1 A1,1 0 0 ${sweepOuter} 0,1 A${rx},1 0 0 ${sweepInner} 0,-1Z`;
  return <path d={d} fill="#e9dcc0" />;
}
