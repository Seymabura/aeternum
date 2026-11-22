"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
 * Gece gökyüzü: derin lacivert katmanlar, ufukta soğuk ay ışığı,
 * yavaşça göz kırpan yıldızlar, ince kar ve film greni.
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
  // .spot kartlarında imleci takip eden ışık
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement | null)?.closest?.(".spot") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -10%, #121016 0%, #09080c 38%, #030304 75%), linear-gradient(180deg, #060508, #020203)",
        }}
      />
      {/* ay ışığı haresi */}
      <div
        className="absolute left-1/2 top-[-18vh] h-[70vh] w-[110vw] -translate-x-1/2 opacity-70"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(220,210,190,.07), rgba(220,210,190,.02) 45%, transparent 70%)" }}
      />
      {/* şampanya yansıması (alt) */}
      <div
        className="absolute bottom-[-25vh] left-1/2 h-[55vh] w-[90vw] -translate-x-1/2 opacity-60"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(220,199,161,.12), transparent 70%)" }}
      />
      <Stars motion={motion} />
      {snow && <Dust motion={motion} />}
      {/* film greni */}
      <div
        className="absolute inset-0 opacity-[.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 180px 30px rgba(2,3,8,.7)" }} />
    </div>
  );
}

/** Göz kırpan yıldızlar (tek seferlik çizim + yavaş parıltı) */
function Stars({ motion }: { motion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let w = 0,
      h = 0,
      raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: Math.random() < 0.92 ? 0.35 + Math.random() * 0.6 : 0.9 + Math.random() * 0.8,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(st.p + (t / 1000) * st.s));
        ctx.fillStyle = `rgba(235,240,255,${a * (1 - st.y / (h * 1.1))})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
        if (st.r > 1.2) {
          ctx.strokeStyle = `rgba(235,240,255,${a * 0.25})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(st.x - st.r * 4, st.y);
          ctx.lineTo(st.x + st.r * 4, st.y);
          ctx.moveTo(st.x, st.y - st.r * 4);
          ctx.lineTo(st.x, st.y + st.r * 4);
          ctx.stroke();
        }
      }
      if (motion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [motion]);
  return <canvas ref={ref} className="absolute inset-0" />;
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
    const n = Math.round(Math.min(55, (w * h) / 22000));
    type P = { x: number; y: number; r: number; s: number; d: number; spark: boolean; tw: number };
    const ps: P[] = Array.from({ length: n }, () => {
      const spark = false;
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
