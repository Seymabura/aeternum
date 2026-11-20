"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { timeOfDay, trParts, type TimeOfDay } from "@/lib/day";

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

/** Günün saatine göre ışık + yağan kar */
export function Ambience() {
  const snow = useSnow();
  const [tod, setTod] = useState<TimeOfDay>("day");
  useEffect(() => {
    const tick = () => setTod(timeOfDay(trParts().hour));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <div className="ambient" data-time={tod} aria-hidden />
      {snow && <Snow />}
    </>
  );
}

function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    const n = Math.round(Math.min(70, (w * h) / 16000));
    const flakes = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 2.2,
      s: 0.25 + Math.random() * 0.6,
      d: Math.random() * Math.PI * 2,
    }));
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.d += 0.01 * dt;
        f.y += f.s * dt;
        f.x += Math.sin(f.d) * 0.35 * dt;
        if (f.y > h + 5) {
          f.y = -5;
          f.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.55 + f.r * 0.12})`;
        ctx.shadowColor = "rgba(120,90,60,.25)";
        ctx.shadowBlur = 2;
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
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
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-30" aria-hidden />;
}
