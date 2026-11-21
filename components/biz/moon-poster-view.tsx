"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { loadMoonTexture } from "@/lib/astro/moon-render";
import { buildMoons, drawPoster, ensurePosterFonts, EXPORTS, pct, type MoonImages, type MoonPayload } from "@/lib/astro/moon-poster";
import { phaseLabel } from "@/lib/astro/moon";
import { shareOrDownload } from "@/lib/share";
import { cn } from "@/lib/utils";

export type MoonPosterHandle = {
  merge: (to: boolean) => void;
  exportAs: (id: (typeof EXPORTS)[number]["id"]) => Promise<void>;
};

/**
 * İki Ay posterinin canlı önizlemesi (9:16). Ay'lar bir kez çizilir; animasyon sadece yerleşimi değiştirir.
 */
export const MoonPosterView = forwardRef<MoonPosterHandle, { payload: MoonPayload; autoMerge?: boolean; hideDates?: boolean; className?: string; onMerged?: (m: boolean) => void }>(
  function MoonPosterView({ payload, autoMerge = true, hideDates, className, onMerged }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<MoonImages | null>(null);
    const texRef = useRef<ImageData | null>(null);
    const progRef = useRef(0);
    const animRef = useRef(0);
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
      drawPoster(ctx, c.width, c.height, payload, img, progRef.current, { hideDates });
    };

    // Ay'ları hazırla
    useEffect(() => {
      let dead = false;
      (async () => {
        try {
          const [tex] = await Promise.all([loadMoonTexture(), ensurePosterFonts()]);
          if (dead) return;
          texRef.current = tex;
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const W = size.w * dpr;
          const H = size.h * dpr;
          const u = Math.min(W, H * 0.5625);
          imgRef.current = buildMoons(tex, payload, u * 0.34);
          const c = canvasRef.current!;
          c.width = W;
          c.height = H;
          setReady(true);
          draw();
        } catch {
          if (!dead) setFailed(true);
        }
      })();
      return () => {
        dead = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload, size.w, size.h, hideDates]);

    function animateTo(target: number, ms = 2400) {
      cancelAnimationFrame(animRef.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const from = progRef.current;
      const t0 = performance.now();
      const dur = reduce ? 1 : ms;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        progRef.current = from + (target - from) * k;
        draw();
        if (k < 1) animRef.current = requestAnimationFrame(step);
        else onMerged?.(target === 1);
      };
      animRef.current = requestAnimationFrame(step);
    }

    // ilk açılışta bir kez birleş
    const played = useRef(false);
    useEffect(() => {
      if (!ready || !autoMerge || played.current) return;
      played.current = true;
      const t = setTimeout(() => animateTo(1), 900);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, autoMerge]);

    useEffect(() => () => cancelAnimationFrame(animRef.current), []);

    useImperativeHandle(ref, () => ({
      merge: (to) => animateTo(to ? 1 : 0),
      async exportAs(id) {
        const spec = EXPORTS.find((e) => e.id === id)!;
        const tex = texRef.current ?? (await loadMoonTexture());
        const c = document.createElement("canvas");
        c.width = spec.w;
        c.height = spec.h;
        const u = Math.min(spec.w, spec.h * 0.5625);
        const imgs = buildMoons(tex, payload, u * 0.34);
        drawPoster(c.getContext("2d")!, spec.w, spec.h, payload, imgs, progRef.current > 0.5 ? 1 : 0, { hideDates });
        const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
        if (!blob) throw new Error("png");
        const names = `${payload.a.name}-${payload.b.name}`.toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü-]+/g, "-");
        await shareOrDownload(blob, `aeternum-iki-ay-${names}-${spec.id}.png`, "İki Ay");
      },
    }));

    const label = `${payload.a.name} doğduğu gece Ay: ${phaseLabel(payload.a.phaseAngle)}, yüzde ${Math.round(payload.a.fraction * 100)} aydınlık. ${payload.b.name} doğduğu gece Ay: ${phaseLabel(payload.b.phaseAngle)}, yüzde ${Math.round(payload.b.fraction * 100)} aydınlık.`;

    return (
      <div ref={wrapRef} className={cn("relative w-full", className)} style={{ aspectRatio: "9 / 16" }}>
        <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 h-full w-full rounded-[22px]" style={{ width: size.w, height: size.h }} />
        {!ready && !failed && <div className="shimmer absolute inset-0 rounded-[22px]" />}
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-[22px] bg-paper-3 p-6 text-center">
            {/* yedek: dokusuz basit diskler */}
            <div className="flex gap-6">
              {[payload.a, payload.b].map((m) => (
                <svg key={m.name} viewBox="-1 -1 2 2" className="h-24 w-24" aria-hidden>
                  <circle r="1" fill="#1a2238" />
                  <PhaseMask angle={m.phaseAngle} />
                </svg>
              ))}
            </div>
            <p className="text-sm text-ink-soft">
              {payload.a.name}: {phaseLabel(payload.a.phaseAngle)} {pct(payload.a.fraction)} · {payload.b.name}: {phaseLabel(payload.b.phaseAngle)} {pct(payload.b.fraction)}
            </p>
          </div>
        )}
      </div>
    );
  },
);

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
