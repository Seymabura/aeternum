"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

/** 31 Aralık gecesi modu: 23:00'ten (TR) itibaren geri sayım, 00:00'da "2027'ye hoş geldin". Önizleme: ?yilbasi=1 */
const MIDNIGHT = Date.UTC(2026, 11, 31, 21, 0, 0); // 1 Ocak 2027 00:00 İstanbul
const START = MIDNIGHT - 60 * 60 * 1000;
const END = MIDNIGHT + 2 * 60 * 60 * 1000;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function NewYearNight() {
  const [target, setTarget] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const autoOpened = useRef(false);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("yilbasi") === "1";
    const t = Date.now();
    if (preview) {
      setTarget(t + 12_000);
      setOpen(true);
    } else if (t >= START && t < END) {
      setTarget(MIDNIGHT);
      try {
        if (sessionStorage.getItem("ae-nye-hidden") === "1") setHidden(true);
      } catch {}
    }
    setNow(t);
  }, []);

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [target]);

  const left = target ? Math.max(0, target - now) : 0;
  const arrived = !!target && left === 0;

  useEffect(() => {
    // son dakikada ve gece yarısında tam ekran aç
    if (target && !autoOpened.current && left > 0 && left <= 60_000) {
      autoOpened.current = true;
      setOpen(true);
      setHidden(false);
    }
  }, [left, target]);

  useEffect(() => {
    if (arrived) setOpen(true);
  }, [arrived]);

  if (!target) return null;
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);

  return (
    <>
      {!open && !hidden && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-[70] -translate-x-1/2 rounded-full border border-champagne/30 bg-black/80 px-5 py-2.5 text-sm text-ink shadow-[0_10px_40px_rgba(0,0,0,.6)] backdrop-blur-md md:bottom-6"
        >
          {arrived ? (
            "2027'ye hoş geldin ✦"
          ) : (
            <>
              Yeni yıla <span className="num text-gold">{h > 0 ? `${h}:` : ""}{pad(m)}:{pad(s)}</span>
            </>
          )}
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] flex flex-col items-center justify-center overflow-hidden bg-black px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            role="dialog"
            aria-modal="true"
            aria-label={arrived ? "2027'ye hoş geldin" : "Yeni yıla geri sayım"}
          >
            <div aria-hidden className="night-stars pointer-events-none absolute inset-0 opacity-90" />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(220,199,161,.12), transparent 60%)" }} />
            <button
              aria-label="Kapat"
              onClick={() => {
                setOpen(false);
                setHidden(true);
                try {
                  sessionStorage.setItem("ae-nye-hidden", "1");
                } catch {}
              }}
              className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:text-ink"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {arrived ? <Welcome /> : <Count h={h} m={m} s={s} final={left <= 10_000} sec={Math.ceil(left / 1000)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Count({ h, m, s, final, sec }: { h: number; m: number; s: number; final: boolean; sec: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <p className="text-ink-soft">2026&apos;nın son {h > 0 ? "saati" : m > 0 ? "dakikaları" : "saniyeleri"}</p>
      {final ? (
        <AnimatePresence mode="popLayout">
          <motion.p
            key={sec}
            className="display num gold-shine mt-4 text-[10rem] leading-none sm:text-[16rem]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.25, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.45 }}
          >
            {sec}
          </motion.p>
        </AnimatePresence>
      ) : (
        <p className="display num mt-4 text-[4.5rem] leading-none tracking-tight sm:text-[8rem]">
          {h > 0 && <>{h}:</>}
          {pad(m)}:<span className="text-gold">{pad(s)}</span>
        </p>
      )}
      <p className="mt-8 text-sm text-ink-mute">Gece yarısı İstanbul saatiyle</p>
    </div>
  );
}

function Welcome() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    resize();
    addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number; life: number; hue: number };
    const ps: P[] = [];
    const burst = (x: number, y: number) => {
      for (let k = 0; k < 90; k++) {
        const a = (k / 90) * Math.PI * 2;
        const v = 1.2 + Math.random() * 3.2;
        ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, hue: Math.random() });
      }
    };
    let t = 0;
    let raf = 0;
    const tick = () => {
      t++;
      if (t % 70 === 1 && t < 900) burst(c.width * (0.2 + Math.random() * 0.6), c.height * (0.18 + Math.random() * 0.3));
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "lighter";
      for (let k = ps.length - 1; k >= 0; k--) {
        const p = ps[k];
        p.x += p.vx * dpr;
        p.y += p.vy * dpr;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.035;
        p.life -= 0.009;
        if (p.life <= 0) {
          ps.splice(k, 1);
          continue;
        }
        ctx.fillStyle = p.hue < 0.7 ? `rgba(233,210,160,${p.life})` : `rgba(255,248,235,${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, [reduce]);
  return (
    <>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        <p className="display gold-shine text-[6rem] leading-none sm:text-[11rem]">2027</p>
        <p className="display mt-6 text-[2rem] sm:text-[3rem]">Hoş geldin.</p>
        <p className="mx-auto mt-5 max-w-sm text-ink-soft">2026&apos;dan kalanlar burada saklı. Mutlu yıllar.</p>
      </motion.div>
    </>
  );
}
