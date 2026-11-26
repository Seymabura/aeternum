import { SITE_HOST } from "@/lib/site";
/** 1080×1920 hikâye kartları: gece siyahı gökyüzü, 31 adım halkası, gün bilgisi. */
const W = 1080;
const H = 1920;
const SERIF = '"Bodoni Moda Variable", "Bodoni Moda", Didot, Georgia, serif';
const SANS = '"Geist Variable", Geist, system-ui, sans-serif';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function paintNight(ctx: CanvasRenderingContext2D, w: number, h: number, seed = 7) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, h * 0.55);
  g.addColorStop(0, "rgba(220,199,161,0.10)");
  g.addColorStop(0.5, "rgba(120,110,140,0.04)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 520; i++) {
    const x = r() * w;
    const y = r() * h;
    const m = Math.pow(r(), 3.2);
    const rad = 0.5 + m * 2.2;
    const warm = r();
    const col = warm < 0.2 ? "255,214,170" : warm < 0.35 ? "190,210,255" : "255,250,240";
    ctx.fillStyle = `rgba(${col},${0.25 + m * 0.75})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    if (m > 0.55) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, rad * 6);
      halo.addColorStop(0, `rgba(${col},0.25)`);
      halo.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(x - rad * 6, y - rad * 6, rad * 12, rad * 12);
    }
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > max && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

export function wordmark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(233,220,192,0.95)";
  ctx.font = `500 44px ${SERIF}`;
  ctx.fillText("Aeternum", w / 2, h - 150);
  ctx.fillStyle = "rgba(244,239,230,0.5)";
  ctx.font = `400 28px ${SANS}`;
  ctx.fillText(SITE_HOST, w / 2, h - 100);
}

/** 31 günlük halka: tamamlananlar altın, son gün nar */
function drawRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, done: number[], fresh?: number) {
  const set = new Set(done);
  const pts = Array.from({ length: 31 }, (_, i) => {
    const a = (i / 31) * Math.PI * 2 - Math.PI / 2;
    return { d: i + 1, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.25);
  glow.addColorStop(0, "rgba(210,70,92,0.16)");
  glow.addColorStop(1, "rgba(210,70,92,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6);
  ctx.strokeStyle = "rgba(220,199,161,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(233,205,150,0.55)";
  ctx.lineWidth = 2.4;
  pts.forEach((p, i) => {
    const n = pts[(i + 1) % 31];
    if (p.d !== 31 && set.has(p.d) && set.has(n.d)) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    }
  });
  for (const p of pts) {
    const on = set.has(p.d);
    if (on) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.d === fresh ? 34 : 22);
      g.addColorStop(0, p.d === fresh ? "rgba(255,140,160,0.55)" : "rgba(243,226,184,0.4)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(p.x - 40, p.y - 40, 80, 80);
    }
    ctx.fillStyle = p.d === fresh ? "#ff9aab" : on ? "#f3e2b8" : "rgba(244,239,230,0.25)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, on ? 8.5 : 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export async function taskStoryCard(o: { day: number; title: string; done: number[] }) {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  paintNight(ctx, W, H, o.day * 31 + 5);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,180,190,0.9)";
  ctx.font = `400 34px ${SANS}`;
  ctx.fillText(`${o.day} Aralık`, W / 2, 210);
  ctx.fillStyle = "#f4efe6";
  ctx.font = `500 88px ${SERIF}`;
  const lines = wrap(ctx, o.title, 900).slice(0, 3);
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 330 + i * 100));
  const cy = 330 + lines.length * 100 + 400;
  drawRing(ctx, W / 2, cy, 330, o.done, o.day);
  ctx.fillStyle = "#f4efe6";
  ctx.font = `500 160px ${SERIF}`;
  ctx.textBaseline = "middle";
  ctx.fillText(String(o.day).padStart(2, "0"), W / 2, cy - 10);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(244,239,230,0.72)";
  ctx.font = `400 36px ${SANS}`;
  ctx.fillText(`${o.done.length}/31  ·  yeni yıla 31 adım`, W / 2, H - 330);
  wordmark(ctx, W, H);
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}

export async function yearStoryCard(o: { count: number; bestStreak: number; word: string | null; done: number[] }) {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  paintNight(ctx, W, H, 2026);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(220,199,161,0.9)";
  ctx.font = `400 34px ${SANS}`;
  ctx.fillText("Benim Aralık'ım", W / 2, 220);
  ctx.fillStyle = "#f4efe6";
  ctx.font = `500 150px ${SERIF}`;
  ctx.fillText("2026", W / 2, 380);
  drawRing(ctx, W / 2, 820, 330, o.done);
  const y = H - 560;
  const cols = [
    { n: `${o.count}/31`, l: "görev" },
    { n: `${o.bestStreak}`, l: "gün seri" },
  ];
  cols.forEach((x, k) => {
    const cx = W / 2 + (k === 0 ? -200 : 200);
    ctx.fillStyle = "#e9dcc0";
    ctx.font = `500 110px ${SERIF}`;
    ctx.fillText(x.n, cx, y);
    ctx.fillStyle = "rgba(244,239,230,0.65)";
    ctx.font = `400 32px ${SANS}`;
    ctx.fillText(x.l, cx, y + 56);
  });
  if (o.word) {
    ctx.fillStyle = "rgba(244,239,230,0.65)";
    ctx.font = `400 32px ${SANS}`;
    ctx.fillText("2027'nin kelimesi", W / 2, H - 360);
    ctx.fillStyle = "#f4efe6";
    let fs = 88;
    ctx.font = `italic 500 ${fs}px ${SERIF}`;
    while (ctx.measureText(o.word).width > 900 && fs > 40) ctx.font = `italic 500 ${(fs -= 6)}px ${SERIF}`;
    ctx.fillText(o.word, W / 2, H - 260);
  }
  wordmark(ctx, W, H);
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}

export async function lanternStoryCard(text: string | null) {
  const { drawLantern } = await import("./lantern-draw");
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  paintNight(ctx, W, H, 1207);
  const far: [number, number, number][] = [
    [0.18, 0.2, 70], [0.82, 0.16, 56], [0.66, 0.32, 44], [0.3, 0.42, 38], [0.88, 0.48, 50], [0.12, 0.62, 34], [0.5, 0.12, 30],
  ];
  for (const [x, y, s] of far) drawLantern(ctx, x * W, y * H, s, 0.75);
  drawLantern(ctx, W / 2, H * 0.48, 380, 1);
  ctx.textAlign = "center";
  if (text) {
    ctx.fillStyle = "#f4efe6";
    ctx.font = `italic 500 64px ${SERIF}`;
    const lines = wrap(ctx, `“${text}”`, 880).slice(0, 4);
    const y0 = H - 560 - (lines.length - 1) * 38;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * 78));
  } else {
    ctx.fillStyle = "#f4efe6";
    ctx.font = `italic 500 64px ${SERIF}`;
    ctx.fillText("Dileğimi gökyüzüne bıraktım.", W / 2, H - 520);
  }
  ctx.fillStyle = "rgba(244,239,230,0.6)";
  ctx.font = `400 32px ${SANS}`;
  ctx.fillText("Bir dilek feneri", W / 2, H - 290);
  wordmark(ctx, W, H);
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}
