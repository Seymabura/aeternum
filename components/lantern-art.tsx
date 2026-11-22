"use client";

import { useEffect, useRef } from "react";
import { drawLantern } from "@/lib/lantern-draw";

/** Statik fener çizimleri (ana sayfa görseli) */
export function LanternArt({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    const x = c.getContext("2d")!;
    x.scale(dpr, dpr);
    x.fillStyle = "#020203";
    x.fillRect(0, 0, w, h);
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 140; i++) {
      x.fillStyle = `rgba(255,250,240,${0.15 + r() * 0.6})`;
      x.beginPath();
      x.arc(r() * w, r() * h, 0.4 + r() * 0.9, 0, 7);
      x.fill();
    }
    const L = [
      [0.5, 0.62, 0.3],
      [0.24, 0.36, 0.13],
      [0.78, 0.28, 0.1],
      [0.66, 0.14, 0.06],
      [0.34, 0.12, 0.05],
      [0.86, 0.6, 0.08],
    ];
    for (const [px, py, sz] of L.slice().reverse()) drawLantern(x, px * w, py * h, sz * h, 0.9);
  }, []);
  return <canvas ref={ref} aria-hidden className={className} />;
}
