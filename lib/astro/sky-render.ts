import type { Sky } from "./sky";
import { starColor } from "./sky";
import { CONSTELLATION_TR } from "./constellation-names";
import { initialOf, letterStrokes } from "./letters";

export type SkyMeta = { names: [string, string]; dateText: string; place: string; coords: string; line?: string };

const SERIF = "'Bodoni Moda Variable', 'Bodoni Moda', Didot, Georgia, serif";
const SANS = "'Geist Variable', Geist, system-ui, sans-serif";
const HAND = "Caveat, 'Segoe Print', cursive";

export async function ensureSkyFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([document.fonts.load(`400 40px ${SERIF}`), document.fonts.load(`400 20px ${SANS}`), document.fonts.load(`500 20px ${HAND}`)]).catch(() => {});
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Ay evresini küçük bir disk olarak çizer (yarım daire + elips yöntemi) */
function drawPhase(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number) {
  const a = ((angle % 360) + 360) % 360;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(40,50,80,.9)";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  const k = Math.cos((a * Math.PI) / 180);
  const waxing = a < 180;
  ctx.fillStyle = "#efe6d2";
  ctx.shadowColor = "rgba(239,230,210,.7)";
  ctx.shadowBlur = r * 1.5;
  ctx.beginPath();
  // aydınlık yarım
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, !waxing);
  // terminatör (elips)
  ctx.ellipse(0, 0, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0 ? waxing : !waxing);
  ctx.fill();
  ctx.restore();
}

type Layout = { cx: number; cy: number; R: number; textY: number; u: number };

export function skyLayout(w: number, h: number): Layout {
  const square = w / h > 0.8;
  const u = Math.min(w, h * 0.5625);
  if (square) {
    const R = Math.min(w, h) * 0.36;
    return { cx: w / 2, cy: h * 0.42, R, textY: h * 0.42 + R + h * 0.075, u: Math.min(w, h) * 0.7 };
  }
  const R = Math.min(w * 0.43, h * 0.27);
  return { cx: w / 2, cy: h * 0.38, R, textY: h * 0.38 + R + u * 0.15, u };
}

/**
 * Gökyüzü posteri. progress 0..1: açılışta yıldızlar parlaklık sırasıyla belirir, sonra çizgiler çizilir.
 */
export function drawSkyPoster(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sky: Sky,
  meta: SkyMeta,
  opts: { progress?: number; initials?: boolean; labels?: boolean } = {},
) {
  const progress = opts.progress ?? 1;
  const { cx, cy, R, textY, u } = skyLayout(w, h);
  const s = R / 300; // ölçek
  ctx.save();

  // ---------------------------------------------------------------- zemin
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
  g.addColorStop(0, "#0d1530");
  g.addColorStop(0.5, "#070b18");
  g.addColorStop(1, "#04060c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const Rn = rng(7);
  for (let i = 0; i < (w * h) / 14000; i++) {
    ctx.globalAlpha = 0.12 + Rn() * 0.25;
    ctx.fillStyle = "#b9cdf2";
    ctx.beginPath();
    ctx.arc(Rn() * w, Rn() * h, 0.6 * (u / 1080) * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ---------------------------------------------------------------- harita dairesi
  const disc = ctx.createRadialGradient(cx, cy - R * 0.2, R * 0.1, cx, cy, R);
  disc.addColorStop(0, "#0e1838");
  disc.addColorStop(1, "#060a1a");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  const X = (p: { x: number }) => cx + p.x * R;
  const Y = (p: { y: number }) => cy + p.y * R;

  // takımyıldız çizgileri
  const lp = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
  if (lp > 0) {
    ctx.strokeStyle = "rgba(220,199,161,.35)";
    ctx.lineWidth = Math.max(0.6, 0.9 * s);
    ctx.lineCap = "round";
    for (const c of sky.lines) {
      for (const [a, b] of c.segs) {
        ctx.beginPath();
        ctx.moveTo(X(a), Y(a));
        ctx.lineTo(X(a) + (X(b) - X(a)) * lp, Y(a) + (Y(b) - Y(a)) * lp);
        ctx.stroke();
      }
    }
  }

  // yıldızlar (parlaklık sırasıyla belirir)
  const sp = Math.min(1, progress / 0.55);
  const n = sky.stars.length;
  const shown = Math.ceil(n * sp);
  for (let k = 0; k < shown; k++) {
    const st = sky.stars[k];
    if (st.alt < 0) continue;
    const r = Math.min(3.6, Math.max(0.38, 2.2 * Math.pow(10, -0.2 * st.mag))) * s * 1.25;
    const fade = k > shown - n * 0.08 ? 0.4 : 1;
    // ufka yakın olanlar biraz sönük
    const ext = st.alt < 12 ? 0.45 + (st.alt / 12) * 0.55 : 1;
    ctx.globalAlpha = Math.min(1, (0.55 + 0.45 * (1 - st.mag / 6)) * fade * ext);
    ctx.fillStyle = starColor(st.bv);
    if (st.mag < 1.6) {
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = r * 4;
    }
    ctx.beginPath();
    ctx.arc(X(st), Y(st), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  // takımyıldız adları
  if (opts.labels !== false && lp > 0.6) {
    ctx.globalAlpha = (lp - 0.6) / 0.4;
    ctx.font = `${Math.max(9, 10.5 * s)}px ${SANS}`;
    ctx.fillStyle = "rgba(220,199,161,.55)";
    ctx.textAlign = "center";
    for (const l of sky.labels) {
      if (l.rank > 1) continue;
      const name = CONSTELLATION_TR[l.id];
      if (name) ctx.fillText(name, X(l), Y(l));
    }
    ctx.globalAlpha = 1;
  }

  // Ay ve gezegenler
  if (progress > 0.4) {
    ctx.globalAlpha = Math.min(1, (progress - 0.4) / 0.3);
    for (const b of sky.bodies) {
      if (b.kind === "moon") {
        drawPhase(ctx, X(b), Y(b), 7.5 * s, b.phaseAngle ?? 180);
        label(ctx, "Ay", X(b) + 12 * s, Y(b) + 3.5 * s, s);
      } else {
        ctx.fillStyle = "#e9dcc0";
        ctx.shadowColor = "#e9dcc0";
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.arc(X(b), Y(b), 2.4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        label(ctx, b.name, X(b) + 6 * s, Y(b) + 3.5 * s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  // baş harf takımyıldızı
  if (opts.initials && progress > 0.85) {
    drawInitials(ctx, sky, meta.names, cx, cy, R, s, (progress - 0.85) / 0.15);
  }
  ctx.restore();

  // ---------------------------------------------------------------- pusula halkası
  ctx.strokeStyle = "rgba(220,199,161,.42)";
  ctx.lineWidth = Math.max(1, 1.1 * s);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.6, 0.7 * s);
  ctx.strokeStyle = "rgba(220,199,161,.28)";
  ctx.beginPath();
  ctx.arc(cx, cy, R + 14 * s, 0, Math.PI * 2);
  ctx.stroke();
  for (let d = 0; d < 360; d += 10) {
    const az = (d * Math.PI) / 180;
    const len = d % 90 === 0 ? 0 : d % 30 === 0 ? 7 : 4;
    if (!len) continue;
    const dx = -Math.sin(az);
    const dy = -Math.cos(az);
    ctx.beginPath();
    ctx.moveTo(cx + dx * R, cy + dy * R);
    ctx.lineTo(cx + dx * (R + len * s), cy + dy * (R + len * s));
    ctx.stroke();
  }
  ctx.fillStyle = "#dcc7a1";
  ctx.font = `500 ${Math.max(10, 12 * s)}px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cardinal: [string, number][] = [["K", 0], ["D", 90], ["G", 180], ["B", 270]];
  for (const [t, d] of cardinal) {
    const az = (d * Math.PI) / 180;
    ctx.fillText(t, cx - Math.sin(az) * (R + 26 * s), cy - Math.cos(az) * (R + 26 * s));
  }
  ctx.textBaseline = "alphabetic";

  // ---------------------------------------------------------------- yazılar
  const tp = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));
  ctx.globalAlpha = tp;
  ctx.textAlign = "center";
  ctx.fillStyle = "#f2eee6";
  ctx.font = `400 ${u * 0.062}px ${SERIF}`;
  ctx.fillText(`${meta.names[0]} & ${meta.names[1]}`, w / 2, textY);
  ctx.fillStyle = "#98a1b6";
  ctx.font = `${u * 0.027}px ${SANS}`;
  ctx.fillText(`${meta.dateText} · ${meta.place}`, w / 2, textY + u * 0.06);
  ctx.fillStyle = "rgba(220,199,161,.8)";
  ctx.font = `${u * 0.022}px ${SANS}`;
  ctx.fillText(meta.coords, w / 2, textY + u * 0.1);
  if (meta.line) {
    ctx.fillStyle = "#e9dcc0";
    ctx.font = `500 ${u * 0.05}px ${HAND}`;
    ctx.fillText(meta.line, w / 2, textY + u * 0.175);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(220,199,161,.5)";
  ctx.font = `500 ${u * 0.018}px ${SANS}`;
  ctx.fillText("✦ AETERNUM · 2026", w / 2, h - u * 0.06);
  ctx.restore();
}

function label(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, s: number) {
  ctx.font = `${Math.max(9, 10 * s)}px ${SANS}`;
  ctx.fillStyle = "rgba(242,238,230,.7)";
  ctx.textAlign = "left";
  ctx.fillText(t, x, y);
  ctx.textAlign = "center";
}

/** İki baş harfi, haritadaki gerçek parlak yıldızlara en yakın eşleşmeyle çizer */
function drawInitials(ctx: CanvasRenderingContext2D, sky: Sky, names: [string, string], cx: number, cy: number, R: number, s: number, alpha: number) {
  const letters = [initialOf(names[0]), initialOf(names[1])];
  const box = R * 0.3;
  const pool = sky.stars.filter((st) => st.mag < 5.2 && st.alt > 10 && Math.hypot(st.x, st.y) < 0.85);
  const used = new Set<number>();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "rgba(233,220,192,.9)";
  ctx.lineWidth = Math.max(0.8, 1.1 * s);
  ctx.setLineDash([5 * s, 4 * s]);
  letters.forEach((Lt, li) => {
    if (!Lt) return;
    const ox = cx + (li === 0 ? -1 : 1) * box * 0.72 - box / 2;
    const oy = cy - box * 0.55;
    for (const stroke of letterStrokes(Lt)) {
      const pts = stroke.map(([lx, ly]) => {
        const tx = ox + lx * box * (Lt === "I" ? 1 : 0.8) + (Lt === "I" ? 0 : box * 0.1);
        const ty = oy + ly * box;
        // en yakın kullanılmamış yıldız
        let best = -1;
        let bd = box * 0.3;
        for (const st of pool) {
          if (used.has(st.i)) continue;
          const d = Math.hypot(cx + st.x * R - tx, cy + st.y * R - ty);
          if (d < bd) {
            bd = d;
            best = st.i;
          }
        }
        if (best >= 0) {
          used.add(best);
          const st = pool.find((p) => p.i === best)!;
          return [cx + st.x * R, cy + st.y * R] as [number, number];
        }
        return [tx, ty] as [number, number];
      });
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f3e6c8";
      for (const [x, y] of pts) {
        ctx.beginPath();
        ctx.arc(x, y, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.setLineDash([5 * s, 4 * s]);
    }
  });
  ctx.restore();
}

export const SKY_EXPORTS = [
  { id: "iphone", label: "iPhone duvar kağıdı", w: 1179, h: 2556 },
  { id: "android", label: "Android duvar kağıdı", w: 1080, h: 2400 },
  { id: "story", label: "Hikâye (9:16)", w: 1080, h: 1920 },
  { id: "kare", label: "Kare (gönderi)", w: 2048, h: 2048 },
  { id: "poster", label: "Poster (A4, baskı)", w: 2480, h: 3508 },
] as const;
