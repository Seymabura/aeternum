"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { buildScenes, drawFrame, ensureFilmFonts, sceneIndexAt, totalDuration, type FilmAssets, type FilmData } from "@/lib/film/engine";
import { loadMoonTexture, renderMoon } from "@/lib/astro/moon-render";
import { moonAt, phaseLabel } from "@/lib/astro/moon";
import { zonedToUtc } from "@/lib/astro/time";
import { cn } from "@/lib/utils";

export type FilmHandle = {
  record: (onProgress: (p: number) => void, signal: AbortSignal) => Promise<{ blob: Blob; ext: string }>;
};

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

async function prepareAssets(f: FilmData, moonSize: number): Promise<FilmAssets> {
  const photos = new Map<string, HTMLImageElement>();
  await Promise.all(
    f.months.map(async (m) => {
      try {
        photos.set(m.src, await loadImg(m.src));
      } catch {
        /* görsel yüklenemezse o ay atlanır */
      }
    }),
  );
  let moon: HTMLCanvasElement | null = null;
  let moonText = "";
  try {
    const tex = await loadMoonTexture();
    const info = moonAt(zonedToUtc(f.met, "21:00", "Europe/Istanbul"), 41.0082, 28.9784);
    moon = renderMoon(tex, moonSize, [{ L: info.light }], info.northAngle).canvas;
    moonText = `${phaseLabel(info.phaseAngle).replace(/ \(.*\)/, "")} · %${Math.round(info.fraction * 100)}`;
  } catch {
    /* ay çizilemezse sahne sade kalır */
  }
  return { photos, moon, moonText };
}

export const FilmPlayer = forwardRef<FilmHandle, { film: FilmData; className?: string; autoPlay?: boolean }>(function FilmPlayer({ film, className, autoPlay = true }, ref) {
  const scenes = useMemo(() => buildScenes(film), [film]);
  const total = totalDuration(scenes);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const assetsRef = useRef<FilmAssets | null>(null);
  const tRef = useRef(0);
  const playingRef = useRef(autoPlay);
  const raf = useRef(0);
  const lowPower = useRef(false);
  const [size, setSize] = useState({ w: 360, h: 640 });
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(autoPlay);
  const [idx, setIdx] = useState(0);
  const [, force] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lowPower.current = (navigator.hardwareConcurrency ?? 8) <= 4;
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      setSize({ w, h: Math.round((w * 16) / 9) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paint = () => {
    const c = canvasRef.current;
    const a = assetsRef.current;
    if (!c || !a) return;
    drawFrame(c.getContext("2d")!, c.width, c.height, film, scenes, a, tRef.current, { reduced: reduced.current, lowPower: lowPower.current });
  };

  useEffect(() => {
    let dead = false;
    setReady(false);
    (async () => {
      await ensureFilmFonts();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = size.w * dpr;
      const H = size.h * dpr;
      assetsRef.current = await prepareAssets(film, Math.min(W, H * 0.5625) * 0.55);
      if (dead) return;
      const c = canvasRef.current!;
      c.width = W;
      c.height = H;
      setReady(true);
      paint();
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film, size.w, size.h]);

  // oynatma döngüsü
  useEffect(() => {
    if (!ready) return;
    let last = performance.now();
    let slow = 0;
    let frames = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current && !document.hidden) {
        tRef.current = Math.min(total, tRef.current + dt);
        // ilk 60 karede yavaşsa parçacıkları azalt
        if (frames < 60) {
          frames++;
          slow += dt;
          if (frames === 60 && slow / 60 > 0.022) lowPower.current = true;
        }
        paint();
        const i = sceneIndexAt(scenes, tRef.current);
        setIdx((p) => (p === i ? p : i));
        if (tRef.current >= total) {
          playingRef.current = false;
          setPlaying(false);
        }
      }
      force((x) => (x + 1) % 1000000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, scenes, total]);

  function jump(i: number) {
    const k = Math.max(0, Math.min(scenes.length - 1, i));
    tRef.current = scenes[k].start + 0.001;
    setIdx(k);
    paint();
  }
  function toggle(to?: boolean) {
    const v = to ?? !playingRef.current;
    if (v && tRef.current >= total) tRef.current = 0;
    playingRef.current = v;
    setPlaying(v);
  }

  // klavye: ←/→ ve boşluk
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input,textarea")) return;
      if (e.key === "ArrowRight") jump(sceneIndexAt(scenes, tRef.current) + 1);
      else if (e.key === "ArrowLeft") jump(sceneIndexAt(scenes, tRef.current) - 1);
      else if (e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes]);

  // dokun: sol/sağ yarı; basılı tut: duraklat
  const hold = useRef<{ t: number; x: number; timer: number; held: boolean } | null>(null);

  useImperativeHandle(ref, () => ({
    async record(onProgress, signal) {
      const W = 1080;
      const H = 1920;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      c.style.cssText = "position:fixed;left:-9999px;top:0;width:10px;height:10px;opacity:0;pointer-events:none";
      document.body.appendChild(c);
      const ctx = c.getContext("2d")!;
      const assets = await prepareAssets(film, Math.min(W, H * 0.5625) * 0.55);
      const types = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
      const mime = types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
      if (!mime) {
        c.remove();
        throw new Error("Bu tarayıcı video kaydını desteklemiyor.");
      }
      drawFrame(ctx, W, H, film, scenes, assets, 0, { reduced: reduced.current });
      const stream = c.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const done = new Promise<void>((r) => (rec.onstop = () => r()));
      rec.start(500);
      const t0 = performance.now();
      await new Promise<void>((resolve) => {
        const step = () => {
          if (signal.aborted) return resolve();
          const T = Math.min(total, (performance.now() - t0) / 1000);
          drawFrame(ctx, W, H, film, scenes, assets, T, { reduced: reduced.current });
          onProgress(T / total);
          if (T >= total) return resolve();
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      rec.stop();
      await done;
      stream.getTracks().forEach((t) => t.stop());
      c.remove();
      if (signal.aborted) throw new DOMException("iptal", "AbortError");
      const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
      return { blob: new Blob(chunks, { type: mime.split(";")[0] }), ext };
    },
  }));

  return (
    <div ref={wrapRef} className={cn("relative w-full select-none overflow-hidden rounded-[22px]", className)} style={{ aspectRatio: "9 / 16" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${film.names[0]} ve ${film.names[1]} için 2026 filmi. Sahne ${idx + 1} / ${scenes.length}.`}
        className="absolute inset-0"
        style={{ width: size.w, height: size.h }}
        onPointerDown={(e) => {
          const timer = window.setTimeout(() => {
            if (hold.current) {
              hold.current.held = true;
              toggle(false);
            }
          }, 220);
          hold.current = { t: performance.now(), x: e.nativeEvent.offsetX, timer, held: false };
        }}
        onPointerUp={() => {
          const h = hold.current;
          hold.current = null;
          if (!h) return;
          clearTimeout(h.timer);
          if (h.held) return toggle(true);
          const i = sceneIndexAt(scenes, tRef.current);
          if (h.x < size.w * 0.33) jump(i - 1);
          else jump(i + 1);
        }}
        onPointerLeave={() => {
          if (hold.current?.held) toggle(true);
          if (hold.current) clearTimeout(hold.current.timer);
          hold.current = null;
        }}
      />
      {/* ilerleme çubukları (kayda girmez) */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex gap-1">
        {scenes.map((s, i) => {
          const fill = i < idx ? 1 : i > idx ? 0 : Math.min(1, (tRef.current - s.start) / s.dur);
          return (
            <span key={i} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/20">
              <span className="block h-full bg-[#f3e6c8]" style={{ width: `${fill * 100}%` }} />
            </span>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => toggle()}
        className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(4,6,12,.5)] text-ink backdrop-blur-md"
        aria-label={playing ? "Duraklat" : tRef.current >= total ? "Baştan oynat" : "Oynat"}
      >
        {playing ? <Pause className="h-4 w-4" strokeWidth={1.5} /> : tRef.current >= total ? <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> : <Play className="h-4 w-4" strokeWidth={1.5} />}
      </button>
      {!ready && <div className="shimmer absolute inset-0" />}
    </div>
  );
});
