import { renderMoon } from "./moon-render";
import { composeSky, type SkyLayers } from "./skyfield";
import { phaseLabel } from "./moon";

export type MoonPerson = {
  name: string;
  /** görünür tarih metni, ör. "12 Ağustos 2001" (gizlenebilir) */
  dateText: string;
  phaseAngle: number;
  fraction: number;
  light: [number, number, number];
  northAngle: number;
  /** o gece Ay'ın gökteki yönü (EQJ birim vektör): arka plandaki gerçek yıldızlar için */
  v?: [number, number, number];
};

export type MoonPayload = {
  a: MoonPerson;
  /** yoksa tek kişilik poster: sadece a'nın Ay'ı */
  b?: MoonPerson | null;
  met?: MoonPerson | null;
};

export const isSingle = (p: MoonPayload) => !p.b;

export type MoonImages = {
  a: HTMLCanvasElement;
  b: HTMLCanvasElement;
  u: HTMLCanvasElement;
  unionFraction: number;
};

/** İki Ay'ın birleşimi: aydınlık oranları toplanır (en fazla dolunay). */
export function unionFractionOf(p: MoonPayload) {
  return p.b ? Math.min(1, p.a.fraction + p.b.fraction) : p.a.fraction;
}

/**
 * Birleşmiş Ay için doğal bir evre ışığı: toplam aydınlık oranına karşılık gelen evre,
 * ilk kişinin Ay'ının aydınlık tarafı yönünde. Böylece sonuç üst üste binmiş iki disk değil,
 * tek ve gerçek görünümlü bir Ay olur.
 */
export function unionLight(p: MoonPayload): [number, number, number] {
  if (!p.b) return p.a.light;
  const f = unionFractionOf(p);
  const ang = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * f))); // 0 yeni ay … π dolunay
  let dx = p.a.light[0];
  let dy = p.a.light[1];
  const n = Math.hypot(dx, dy);
  if (n < 1e-4) {
    dx = p.b.light[0] || 1;
    dy = p.b.light[1];
  }
  const m = Math.hypot(dx, dy) || 1;
  return [(dx / m) * Math.sin(ang), (dy / m) * Math.sin(ang), -Math.cos(ang)];
}

/** Yerleşim ölçüleri (9:16 referansına göre) */
export function moonLayout(w: number, h: number) {
  // yatay (X gönderisi, masaüstü): Ay'lar yüksekliğe göre büyür, biraz yukarıda durur
  if (w > h) {
    const u = h * 0.72;
    return { u, single: u * 0.4, merged: u * 0.86, cy: h * 0.47 };
  }
  const u = Math.min(w, h * 0.5625);
  return { u, single: u * 0.4, merged: u * 0.86, cy: h * 0.56 };
}

/** Ay görsellerini bir kez çiz (animasyon sırasında yeniden çizilmez) */
export function buildMoons(tex: ImageData, p: MoonPayload, w: number, h: number): MoonImages {
  const L = moonLayout(w, h);
  if (!p.b) {
    const one = renderMoon(tex, L.merged, [{ L: p.a.light }], p.a.northAngle, { sharpen: 0.35 }).canvas;
    return { a: one, b: one, u: one, unionFraction: p.a.fraction };
  }
  const a = renderMoon(tex, L.single, [{ L: p.a.light }], p.a.northAngle, { sharpen: 0.35 }).canvas;
  const b = renderMoon(tex, L.single, [{ L: p.b.light }], p.b.northAngle, { sharpen: 0.35 }).canvas;
  const u = renderMoon(tex, L.merged, [{ L: unionLight(p) }], p.a.northAngle, { sharpen: 0.35 }).canvas;
  return { a, b, u, unionFraction: unionFractionOf(p) };
}

const SERIF = "'Bodoni Moda Variable', 'Bodoni Moda', Didot, Georgia, serif";
const SANS = "'Geist Variable', Geist, system-ui, sans-serif";

export async function ensurePosterFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([document.fonts.load(`400 40px ${SERIF}`), document.fonts.load(`400 20px ${SANS}`)]).catch(() => {});
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));

export function pct(f: number) {
  return `%${Math.round(f * 100)}`;
}

/** Birleşmiş hâlin kısa cümlesi (yan panelde gösterilir) */
export function unionLine(p: MoonPayload) {
  if (!p.b) return "";
  const la = phaseLabel(p.a.phaseAngle).replace(/ \(.*\)/, "").toLocaleLowerCase("tr");
  const lb = phaseLabel(p.b.phaseAngle).replace(/ \(.*\)/, "").toLocaleLowerCase("tr");
  const full = unionFractionOf(p) >= 0.985;
  if (la === lb) return `İkiniz de ${la === "dolunay" ? "bir dolunay" : `bir ${la}`} gecesinde doğdunuz.${full ? " Birlikte tam bir Ay." : ""}`;
  return full ? `Biri ${la}, biri ${lb}. Birlikte tam bir Ay.` : `Biri ${la}, biri ${lb}.`;
}

/**
 * Duvar kağıdı: sadece Ay (yazı yok). progress 0 = iki Ay yan yana, 1 = tek büyük Ay.
 */
export function drawPoster(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: MoonPayload,
  img: MoonImages,
  progress: number,
  sky?: { layers: SkyLayers; t?: number; reveal?: number } | null,
  caption?: { title: string; lines: string[] } | null,
) {
  const { single, merged, cy } = moonLayout(w, h);
  if (!p.b) progress = 1;
  ctx.save();
  // ---------------------------------------------------------------- gece: o gece Ay'ın etrafındaki gerçek yıldızlar
  if (sky) {
    composeSky(ctx, sky.layers, { t: sky.t, reveal: sky.reveal });
  } else {
    ctx.fillStyle = "#020205";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";

  const t = clamp(progress);
  const k = easeInOut(t);
  const cx = w / 2;

  // ---------------------------------------------------------------- birleşme
  // İki Ay hafifçe yaklaşırken ışığa dönüşüp söner, ortada tek Ay doğar. Diskler hiç üst üste binmez.
  const gap = single * 0.62;
  const move = easeInOut(clamp(t / 0.5)) * 0.14;
  const xa = cx - gap * (1 - move);
  const xb = cx + gap * (1 - move);
  const singlesAlpha = 1 - easeInOut(clamp((t - 0.08) / 0.4));
  const ds = single * (1 + 0.06 * easeInOut(clamp(t / 0.5)));
  const unionAlpha = easeInOut(clamp((t - 0.42) / 0.5));

  // ortada beliren yumuşak ışık
  const flash = Math.sin(Math.PI * clamp((t - 0.25) / 0.55));
  if (flash > 0.001) {
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, merged * 0.62);
    halo.addColorStop(0, `rgba(240,238,232,${0.18 * flash})`);
    halo.addColorStop(0.5, `rgba(235,233,228,${0.06 * flash})`);
    halo.addColorStop(1, "rgba(235,233,228,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
  }

  if (singlesAlpha > 0) {
    ctx.globalAlpha = singlesAlpha;
    ctx.drawImage(img.a, xa - ds / 2, cy - ds / 2, ds, ds);
    ctx.drawImage(img.b, xb - ds / 2, cy - ds / 2, ds, ds);
  }
  if (unionAlpha > 0) {
    const du = merged * (0.9 + 0.1 * unionAlpha);
    ctx.globalAlpha = unionAlpha;
    ctx.drawImage(img.u, cx - du / 2, cy - du / 2, du, du);
  }
  ctx.globalAlpha = 1;

  // ---------------------------------------------------------------- isteğe bağlı yazı (isim, tarih, evre)
  if (caption) {
    const { u } = moonLayout(w, h);
    const top = Math.min(cy + merged * 0.58, h - u * 0.2);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(246,239,226,.94)";
    ctx.font = `400 ${Math.round(u * 0.072)}px ${SERIF}`;
    ctx.fillText(caption.title, cx, top + u * 0.07);
    ctx.font = `400 ${Math.round(u * 0.03)}px ${SANS}`;
    ctx.fillStyle = "rgba(220,199,161,.82)";
    caption.lines.forEach((l, i) => ctx.fillText(l, cx, top + u * (0.125 + i * 0.045)));
  }
  ctx.restore();
}

export const EXPORTS = [
  { id: "iphone", label: "iPhone duvar kağıdı", w: 1290, h: 2796 },
  { id: "android", label: "Android duvar kağıdı", w: 1440, h: 3200 },
  { id: "4k", label: "4K dikey", w: 2160, h: 3840 },
  { id: "story", label: "Hikâye (9:16)", w: 1080, h: 1920 },
  { id: "x", label: "X (Twitter) gönderisi", w: 1600, h: 900 },
  { id: "masaustu", label: "Masaüstü 4K", w: 3840, h: 2160 },
] as const;
