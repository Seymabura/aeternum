import { renderMoon, type Light } from "./moon-render";
import { phaseLabel } from "./moon";

export type MoonPerson = {
  name: string;
  /** görünür tarih metni, ör. "12 Ağustos 2001" (gizlenebilir) */
  dateText: string;
  phaseAngle: number;
  fraction: number;
  light: [number, number, number];
  northAngle: number;
};

export type MoonPayload = {
  a: MoonPerson;
  b: MoonPerson;
  met?: MoonPerson | null;
};

export type MoonImages = {
  a: HTMLCanvasElement;
  b: HTMLCanvasElement;
  u: HTMLCanvasElement;
  met: HTMLCanvasElement | null;
  unionFraction: number;
};

/** Ay görsellerini bir kez çiz (animasyon sırasında yeniden çizilmez) */
export function buildMoons(tex: ImageData, p: MoonPayload, diameter: number, merged = 1.18): MoonImages {
  const a = renderMoon(tex, diameter, [{ L: p.a.light }], p.a.northAngle).canvas;
  const b = renderMoon(tex, diameter, [{ L: p.b.light }], p.b.northAngle).canvas;
  // birleşim: iki ışığın aydınlattığı alanların toplamı; doku yönü ilk kişinin Ay'ı
  const lights: Light[] = [{ L: p.a.light }, { L: p.b.light }];
  const u = renderMoon(tex, diameter * merged, lights, p.a.northAngle);
  const met = p.met ? renderMoon(tex, diameter * 0.38, [{ L: p.met.light }], p.met.northAngle).canvas : null;
  return { a, b, u: u.canvas, met, unionFraction: u.litFraction };
}

const SERIF = "'Bodoni Moda Variable', 'Bodoni Moda', Didot, Georgia, serif";
const SANS = "'Geist Variable', Geist, system-ui, sans-serif";
const HAND = "Caveat, 'Segoe Print', cursive";

export async function ensurePosterFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load(`400 40px ${SERIF}`),
    document.fonts.load(`italic 400 40px ${SERIF}`),
    document.fonts.load(`400 20px ${SANS}`),
    document.fonts.load(`500 20px ${HAND}`),
  ]).catch(() => {});
}

/** Tohumlu rastgele (her çizimde aynı yıldız tozu) */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function pct(f: number) {
  return `%${Math.round(f * 100)}`;
}

/** Birleşmiş hâlin kısa cümlesi */
export function unionLine(p: MoonPayload, unionFraction: number) {
  const la = phaseLabel(p.a.phaseAngle).replace(/ \(.*\)/, "").toLocaleLowerCase("tr");
  const lb = phaseLabel(p.b.phaseAngle).replace(/ \(.*\)/, "").toLocaleLowerCase("tr");
  const full = unionFraction >= 0.985;
  if (la === lb) return `İkiniz de ${la === "dolunay" ? "bir dolunay" : `bir ${la}`} gecesinde doğdunuz.`;
  return full ? `Biri ${la}, biri ${lb}. Birlikte tam bir Ay.` : `Biri ${la}, biri ${lb}.`;
}

/**
 * Posteri çizer. progress: 0 = iki Ay yan yana, 1 = birleşmiş.
 * w×h her boyutta orantılı çalışır (telefon ekranı, 4K duvar kağıdı, A4 poster).
 */
export function drawPoster(ctx: CanvasRenderingContext2D, w: number, h: number, p: MoonPayload, img: MoonImages, progress: number, opts: { hideDates?: boolean } = {}) {
  const u = Math.min(w, h * 0.5625); // 9:16 referans genişliği
  ctx.save();
  // ---------------------------------------------------------------- zemin
  const g = ctx.createRadialGradient(w / 2, h * 0.38, 0, w / 2, h * 0.38, Math.max(w, h) * 0.85);
  g.addColorStop(0, "#111a36");
  g.addColorStop(0.45, "#080d1d");
  g.addColorStop(1, "#04060c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // yıldız tozu
  const R = rng(20261231);
  const n = Math.round((w * h) / 9000);
  for (let i = 0; i < n; i++) {
    const x = R() * w;
    const y = R() * h;
    const m = R();
    const s = (m > 0.985 ? 1.6 : m > 0.9 ? 1.0 : 0.6) * (u / 1080) * 1.6;
    ctx.globalAlpha = 0.18 + R() * 0.5;
    ctx.fillStyle = m > 0.7 ? "#e9dcc0" : "#b9cdf2";
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ---------------------------------------------------------------- yerleşim
  const D = u * 0.34;
  const cy = h * 0.49;
  const gap = u * 0.215;
  const t = easeInOut(Math.min(1, Math.max(0, progress)));
  const xa = w / 2 - gap * (1 - t);
  const xb = w / 2 + gap * (1 - t);

  // bağlayan ince yay (birleştikçe kaybolur)
  if (t < 0.98) {
    ctx.globalAlpha = 0.5 * (1 - t);
    ctx.strokeStyle = "#dcc7a1";
    ctx.lineWidth = Math.max(1, u / 900);
    ctx.beginPath();
    ctx.moveTo(xa, cy - D * 0.62);
    ctx.quadraticCurveTo(w / 2, cy - D * 1.05, xb, cy - D * 0.62);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // tanıştığınız gecenin küçük Ay'ı
  if (img.met && p.met) {
    const md = D * 0.38;
    const my = h * 0.22;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(img.met, w / 2 - md / 2, my - md / 2, md, md);
    ctx.globalAlpha = 1;
    text(ctx, "Tanıştığınız gece", w / 2, my + md / 2 + u * 0.045, `${u * 0.022}px ${SANS}`, "#98a1b6");
    text(ctx, `${phaseLabel(p.met.phaseAngle).replace(/ \(.*\)/, "")} · ${pct(p.met.fraction)}`, w / 2, my + md / 2 + u * 0.078, `${u * 0.022}px ${SANS}`, "#dcc7a1");
  }

  // birleşim parlaması
  const full = img.unionFraction >= 0.985;
  if (t > 0.7) {
    const k = (t - 0.7) / 0.3;
    const halo = ctx.createRadialGradient(w / 2, cy, D * 0.4, w / 2, cy, D * (full ? 1.25 : 0.95));
    halo.addColorStop(0, `rgba(233,220,192,${(full ? 0.32 : 0.16) * k})`);
    halo.addColorStop(1, "rgba(233,220,192,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
  }

  // iki Ay
  const fadeSingles = t > 0.82 ? 1 - (t - 0.82) / 0.18 : 1;
  ctx.globalAlpha = fadeSingles;
  ctx.drawImage(img.a, xa - D / 2, cy - D / 2, D, D);
  ctx.globalCompositeOperation = "lighten";
  ctx.drawImage(img.b, xb - D / 2, cy - D / 2, D, D);
  ctx.globalCompositeOperation = "source-over";
  if (t > 0.82) {
    const DU = D * (1 + 0.18 * ease((t - 0.82) / 0.18));
    ctx.globalAlpha = (t - 0.82) / 0.18;
    ctx.drawImage(img.u, w / 2 - DU / 2, cy - DU / 2, DU, DU);
  }
  ctx.globalAlpha = 1;

  // ---------------------------------------------------------------- yazılar
  const labelY = cy + D / 2 + u * 0.085;
  if (t < 0.6) {
    const al = 1 - t / 0.6;
    ctx.globalAlpha = al;
    person(ctx, p.a, xa, labelY, u, opts.hideDates);
    person(ctx, p.b, xb, labelY, u, opts.hideDates);
    ctx.globalAlpha = 1;
  }
  if (t > 0.75) {
    const al = (t - 0.75) / 0.25;
    ctx.globalAlpha = al;
    const ny = cy + D * 0.59 + u * 0.1;
    text(ctx, `${p.a.name} & ${p.b.name}`, w / 2, ny, `400 ${u * 0.062}px ${SERIF}`, "#f2eee6");
    text(ctx, unionLine(p, img.unionFraction), w / 2, ny + u * 0.06, `${u * 0.026}px ${SANS}`, "#98a1b6");
    text(ctx, full ? "İkimiz birlikte: %100" : `İkimiz birlikte: ${pct(img.unionFraction)}`, w / 2, ny + u * 0.115, `400 ${u * 0.036}px ${SERIF}`, "#e9dcc0");
    ctx.globalAlpha = 1;
  }

  // imza
  text(ctx, "✦ AETERNUM · 2026", w / 2, h - u * 0.07, `500 ${u * 0.018}px ${SANS}`, "rgba(220,199,161,.55)", u * 0.006);
  ctx.restore();
}

function person(ctx: CanvasRenderingContext2D, m: MoonPerson, x: number, y: number, u: number, hideDates?: boolean) {
  text(ctx, m.name, x, y, `400 ${u * 0.052}px ${SERIF}`, "#f2eee6");
  let yy = y + u * 0.05;
  if (!hideDates && m.dateText) {
    text(ctx, m.dateText, x, yy, `${u * 0.024}px ${SANS}`, "#98a1b6");
    yy += u * 0.038;
  }
  text(ctx, `${phaseLabel(m.phaseAngle).replace(/ \(.*\)/, "")} · ${pct(m.fraction)}`, x, yy, `${u * 0.024}px ${SANS}`, "#dcc7a1");
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, spacing = 0) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (spacing && "letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  if (spacing && "letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
}

export const EXPORTS = [
  { id: "iphone", label: "iPhone duvar kağıdı", w: 1179, h: 2556 },
  { id: "android", label: "Android duvar kağıdı", w: 1080, h: 2400 },
  { id: "story", label: "Hikâye (9:16)", w: 1080, h: 1920 },
  { id: "poster", label: "Poster (A4, baskı)", w: 2480, h: 3508 },
] as const;

export { HAND };
