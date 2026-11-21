"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

const KEY = "ae-snow";
const listeners = new Set<() => void>();
function readSnow() {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}
export function setSnow(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l());
}
export function useSnow() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readSnow,
    () => false,
  );
}

/**
 * Gece gökyüzü: yavaşça akan mum ışığı/gece degradesi (WebGL shader),
 * üstünde altın toz ve kar, kenarlarda karanlık vinyet.
 */
export function Ambience() {
  const snow = useSnow();
  const [motion, setMotion] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setMotion(!m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={["#120a1e", "#4a1530", "#1a2350", "#7a3414", "#2a1038"]}
        distortion={0.85}
        swirl={0.35}
        grainMixer={0.18}
        grainOverlay={0.06}
        speed={motion ? 0.12 : 0}
        maxPixelCount={1920 * 1080}
      />
      {/* mum ışığı: alttan yükselen sıcak parıltı */}
      <div
        className="absolute inset-x-0 bottom-[-30vh] h-[80vh] opacity-70"
        style={{ background: "radial-gradient(60% 50% at 50% 60%, rgba(242,140,60,.28), rgba(184,54,74,.12) 45%, transparent 70%)" }}
      />
      {/* üstte derin gece */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% -10%, rgba(10,12,30,.0), rgba(7,6,12,.2) 80%)" }} />
      {/* kenar vinyeti */}
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 160px 20px rgba(4,3,8,.6)" }} />
      {snow && <Dust motion={motion} />}
    </div>
  );
}

/** Kar taneleri ve süzülen altın kıvılcımlar */
function Dust({ motion }: { motion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !motion) return;
    const ctx = cv.getContext("2d")!;
    let w = 0,
      h = 0,
      raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const n = Math.round(Math.min(90, (w * h) / 14000));
    type P = { x: number; y: number; r: number; s: number; d: number; spark: boolean; tw: number };
    const ps: P[] = Array.from({ length: n }, () => {
      const spark = Math.random() < 0.28;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: spark ? 0.6 + Math.random() * 1.2 : 0.7 + Math.random() * 1.9,
        s: spark ? -(0.12 + Math.random() * 0.25) : 0.2 + Math.random() * 0.5,
        d: Math.random() * Math.PI * 2,
        spark,
        tw: Math.random() * Math.PI * 2,
      };
    });
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.d += 0.008 * dt;
        p.tw += 0.05 * dt;
        p.y += p.s * dt;
        p.x += Math.sin(p.d) * (p.spark ? 0.2 : 0.3) * dt;
        if (p.y > h + 6) {
          p.y = -6;
          p.x = Math.random() * w;
        } else if (p.y < -6) {
          p.y = h + 6;
          p.x = Math.random() * w;
        }
        if (p.spark) {
          const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(p.tw));
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, `rgba(255,214,150,${a})`);
          g.addColorStop(1, "rgba(242,140,60,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(255,248,238,${0.25 + p.r * 0.14})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", vis);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [motion]);
  return <canvas ref={ref} className="absolute inset-0" />;
}
