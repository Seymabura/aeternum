import type { VisionItem, VisionLayout } from "@/app/actions/extras";
import { isSticker, VISION_LIBRARY, VISION_STICKERS } from "@/lib/vision-library";

/** Pano mantıksal boyutu: modern telefon ekranı oranı (9:19.5). Tüm konumlar bu birimde. */
export const BW = 1179;
export const BH = 2556;
/** Kilit ekranında saatin kapladığı üst bölge: otomatik düzenler buraya yerleştirmez. */
export const CLOCK_SAFE = 620;

export const TONES: Record<string, { bg: string | null; fg: string; label: string }> = {
  gece: { bg: "linear-gradient(160deg,#1a1016,#050407)", fg: "#ecdfc4", label: "Gece" },
  sampanya: { bg: "linear-gradient(160deg,#f6eedc,#cdb892)", fg: "#1a1408", label: "Şampanya" },
  nar: { bg: "linear-gradient(160deg,#b52a42,#4a0b16)", fg: "#fbefe6", label: "Nar" },
  gul: { bg: "linear-gradient(160deg,#f3d6d2,#c98b8b)", fg: "#2a1220", label: "Gül" },
  buz: { bg: "linear-gradient(160deg,#eef2fb,#b9c6e2)", fg: "#12131a", label: "Buz" },
  zumrut: { bg: "linear-gradient(160deg,#2f5a4f,#13281f)", fg: "#ecdfc4", label: "Zümrüt" },
  yazi: { bg: null, fg: "#f3eee6", label: "Sadece yazı" },
};

export type BgDef = { css: string; label: string; ink: string; img?: string; stars?: boolean };
const tema = (k: string) => `/vision/tema/${k}.svg`;
export const BGS: Record<string, BgDef> = {
  gece: { css: "radial-gradient(120% 60% at 50% 0%, #17121a, #050406 60%, #020203)", label: "Gece", ink: "#f3eee6", stars: true },
  yildizli: { css: `#0b0710 url(${tema("yildizli")}) center/cover`, label: "Yıldızlı gece", ink: "#f3eee6", img: tema("yildizli") },
  narbahce: { css: `#2a0610 url(${tema("narbahce")}) center/cover`, label: "Nar bahçesi", ink: "#fbefe6", img: tema("narbahce") },
  nar: { css: "radial-gradient(120% 70% at 50% 0%, #6b1424, #2a0610 55%, #120306)", label: "Nar", ink: "#fbefe6", stars: true },
  pembe: { css: `#f9c9d6 url(${tema("pembe")}) center/cover`, label: "Pembe fiyonk", ink: "#3a1422", img: tema("pembe") },
  bahar: { css: `#f6eee0 url(${tema("bahar")}) center/cover`, label: "Bahar", ink: "#2c2418", img: tema("bahar") },
  kar: { css: `#b9c9dc url(${tema("kar")}) center/cover`, label: "Kar", ink: "#14202e", img: tema("kar") },
  konfeti: { css: `#f4e6c8 url(${tema("konfeti")}) center/cover`, label: "Konfeti", ink: "#2a1d08", img: tema("konfeti") },
  lavanta: { css: `#cbb5e6 url(${tema("lavanta")}) center/cover`, label: "Lavanta", ink: "#241638", img: tema("lavanta") },
  zumrut: { css: `#0e2b23 url(${tema("zumrut")}) center/cover`, label: "Zümrüt", ink: "#f0e6cf", img: tema("zumrut") },
  kareli: { css: `#fbf2f3 url(${tema("kareli")}) center/cover`, label: "Pötikare", ink: "#3a1422", img: tema("kareli") },
  cizgili: { css: `#fbf6ee url(${tema("cizgili")}) center/cover`, label: "Çizgili", ink: "#2c2418", img: tema("cizgili") },
  sampanya: { css: "linear-gradient(170deg, #f7efdf, #e6d6b6 60%, #d4bf97)", label: "Şampanya", ink: "#1a1408" },
  kagit: { css: "linear-gradient(170deg, #f3ece0, #e9dfcd)", label: "Kâğıt", ink: "#1a1408" },
  gul: { css: "linear-gradient(170deg, #f8e3df, #e8bdb8)", label: "Gül", ink: "#2a1220" },
};

export const FONT_CSS = {
  serif: '"Bodoni Moda Variable", "Bodoni Moda", Georgia, serif',
  sans: '"Geist Variable", Geist, system-ui, sans-serif',
  el: '"Caveat", "Segoe Print", cursive',
} as const;

export function photoMeta(src: string | null) {
  return VISION_LIBRARY.find((v) => v.src === src) ?? VISION_STICKERS.find((v) => v.src === src);
}
export { isSticker };

/** Yazı boyutu (pano biriminde): kutuya sığacak en büyük boy */
export function wordFontSize(text: string, w: number, h: number, font: keyof typeof FONT_CSS = "serif") {
  const k = font === "el" ? 0.42 : font === "sans" ? 0.52 : 0.5;
  const words = text.split(" ");
  const longest = Math.max(...words.map((x) => x.length), 3);
  const lines = Math.max(1, Math.ceil(text.length / Math.max(longest, 10)));
  return Math.max(28, Math.min(h * 0.62 / lines, (w * 0.86) / (longest * k)));
}

export function maxZ(items: VisionItem[]) {
  return items.reduce((m, i) => Math.max(m, i.layout?.z ?? 0), 0);
}

function aspectOf(it: VisionItem, natural?: Record<string, number>) {
  if (it.kind === "word") return 0.42;
  const m = photoMeta(it.src);
  if (m) return m.h / m.w;
  return natural?.[it.id] ?? 1.3;
}

/** Hazır düzenler: mevcut parçaları panoya yerleştirir */
export type TemplateId = "kolaj" | "polaroid" | "izgara" | "odak";
export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "kolaj", label: "Kolaj" },
  { id: "polaroid", label: "Polaroid" },
  { id: "izgara", label: "Izgara" },
  { id: "odak", label: "Tek büyük" },
];

export function applyTemplate(items: VisionItem[], t: TemplateId, natural?: Record<string, number>): Record<string, VisionLayout> {
  const out: Record<string, VisionLayout> = {};
  const pad = 54;
  const top = CLOCK_SAFE;
  const bottom = BH - 150;
  const list = items.filter((i) => !isSticker(i.src));
  if (t === "kolaj") {
    const cols = list.length > 6 ? 3 : 2;
    const gap = 18;
    const cw = (BW - pad * 2 - gap * (cols - 1)) / cols;
    const hs = new Array(cols).fill(top);
    list.forEach((it, i) => {
      const c = hs.indexOf(Math.min(...hs));
      const a = Math.min(1.6, Math.max(0.42, aspectOf(it, natural)));
      const h = cw * a;
      out[it.id] = { x: pad + c * (cw + gap), y: hs[c], w: cw, h, r: 0, z: i + 1, frame: "beyaz", font: it.layout?.font ?? "serif" };
      hs[c] += h + gap;
    });
    // taşarsa hepsini üst-ortaya göre küçült
    const maxH = Math.max(...hs) - top;
    if (maxH > bottom - top) {
      const k = (bottom - top) / maxH;
      for (const l of Object.values(out)) {
        l.x = BW / 2 + (l.x - BW / 2) * k;
        l.y = top + (l.y - top) * k;
        l.w *= k;
        l.h *= k;
      }
    }
  } else if (t === "polaroid") {
    const cols = list.length > 4 ? 2 : 1;
    const rows = Math.ceil(list.length / cols);
    const cellW = (BW - pad * 2) / cols;
    const cellH = (bottom - top) / Math.max(rows, 1);
    list.forEach((it, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const a = Math.min(1.3, Math.max(0.42, aspectOf(it, natural)));
      let w = Math.min(cellW * 1.08, (cellH * 1.15) / a);
      if (cols === 1) w = Math.min(w, BW * 0.72);
      const h = w * a;
      const jitter = ((i * 37) % 7) - 3;
      out[it.id] = {
        x: pad + c * cellW + (cellW - w) / 2 + jitter * 6,
        y: top + r * cellH + (cellH - h) / 2,
        w,
        h,
        r: (i % 2 ? 1 : -1) * (2 + ((i * 13) % 5)),
        z: i + 1,
        frame: it.kind === "image" ? "polaroid" : "yok",
        font: it.layout?.font ?? (it.kind === "word" ? "el" : "serif"),
      };
    });
  } else if (t === "izgara") {
    const cols = 3;
    const gap = 12;
    const cw = (BW - pad * 2 - gap * (cols - 1)) / cols;
    const rows = Math.ceil(list.length / cols);
    const ch = Math.min(cw * 1.25, (bottom - top - gap * (rows - 1)) / Math.max(rows, 1));
    list.forEach((it, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      out[it.id] = { x: pad + c * (cw + gap), y: top + r * (ch + gap), w: cw, h: ch, r: 0, z: i + 1, frame: "keskin", font: it.layout?.font ?? "serif" };
    });
  } else {
    // odak: ilk fotoğraf büyük, diğerleri altta küçük şerit
    const first = list.find((i) => i.kind === "image") ?? list[0];
    const rest = list.filter((i) => i !== first);
    if (first) {
      const w = BW - pad * 2;
      const h = Math.min(w * Math.min(1.35, aspectOf(first, natural)), (bottom - top) * 0.62);
      out[first.id] = { x: pad, y: top, w, h, r: 0, z: 1, frame: "yok", font: "serif" };
      const y0 = top + h + 24;
      const cols = Math.min(3, Math.max(1, rest.length));
      const gap = 16;
      const cw = (w - gap * (cols - 1)) / cols;
      const rowsN = Math.ceil(rest.length / cols);
      const ch = Math.min(cw * 1.2, (bottom - y0 - gap * (rowsN - 1)) / Math.max(1, rowsN));
      rest.forEach((it, i) => {
        out[it.id] = { x: pad + (i % cols) * (cw + gap), y: y0 + Math.floor(i / cols) * (ch + gap), w: cw, h: ch, r: 0, z: i + 2, frame: "yok", font: it.layout?.font ?? "serif" };
      });
    }
  }
  for (const id in out) {
    const l = out[id];
    l.x = Math.round(l.x);
    l.y = Math.round(l.y);
    l.w = Math.round(l.w);
    l.h = Math.round(l.h);
  }
  return out;
}

// ---------------------------------------------------------------- dışa aktarma

export const VISION_EXPORTS = [
  { id: "iphone", label: "iPhone", w: 1290, h: 2796 },
  { id: "android", label: "Android", w: 1440, h: 3200 },
  { id: "4k", label: "4K telefon", w: 2160, h: 4680 },
  { id: "story", label: "Instagram hikâyesi", w: 1080, h: 1920 },
] as const;

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    if (!src.startsWith("/") && !src.startsWith("blob:")) im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

async function paintBg(g: CanvasRenderingContext2D, W: number, H: number, bg: string) {
  const def = BGS[bg] ?? BGS.gece;
  if (def.img) {
    const im = await loadImg(def.img).catch(() => null);
    if (im) {
      const k = Math.max(W / BW, H / BH);
      const iw = BW * k;
      const ih = BH * k;
      g.drawImage(im, (W - iw) / 2, (H - ih) / 2, iw, ih);
      return;
    }
  }
  const grad = (stops: [number, string][], radial = false) => {
    const gr = radial ? g.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.9) : g.createLinearGradient(0, 0, W * 0.2, H);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  };
  if (bg === "nar") grad([[0, "#6b1424"], [0.55, "#2a0610"], [1, "#120306"]], true);
  else if (bg === "sampanya") grad([[0, "#f7efdf"], [0.6, "#e6d6b6"], [1, "#d4bf97"]]);
  else if (bg === "kagit") grad([[0, "#f3ece0"], [1, "#e9dfcd"]]);
  else if (bg === "gul") grad([[0, "#f8e3df"], [1, "#e8bdb8"]]);
  else grad([[0, "#17121a"], [0.6, "#050406"], [1, "#020203"]], true);
  if (bg === "gece" || bg === "nar") {
    let s = 9;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(255,248,236,${0.12 + rnd() * 0.5})`;
      g.beginPath();
      g.arc(rnd() * W, rnd() * H, (0.4 + rnd() * 1.4) * (W / 1179), 0, Math.PI * 2);
      g.fill();
    }
  }
}

export async function renderBoard(items: VisionItem[], bg: string, srcOf: (i: VisionItem) => string | undefined, W: number, H: number) {
  await Promise.all([
    document.fonts.load(`italic 400 80px ${FONT_CSS.serif}`),
    document.fonts.load(`500 60px ${FONT_CSS.sans}`),
    document.fonts.load(`500 60px ${FONT_CSS.el}`),
  ]).catch(() => null);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  await paintBg(g, W, H, bg);
  const s = Math.min(W / BW, H / BH);
  const ox = (W - BW * s) / 2;
  const oy = (H - BH * s) / 2;
  const sorted = [...items].filter((i) => i.layout).sort((a, b) => a.layout!.z - b.layout!.z);
  const imgs = await Promise.all(sorted.map((it) => (it.kind === "image" && srcOf(it) ? loadImg(srcOf(it)!).catch(() => null) : Promise.resolve(null))));
  sorted.forEach((it, k) => {
    const l = it.layout!;
    g.save();
    g.translate(ox + (l.x + l.w / 2) * s, oy + (l.y + l.h / 2) * s);
    g.rotate((l.r * Math.PI) / 180);
    const w = l.w * s;
    const h = l.h * s;
    const x = -w / 2;
    const y = -h / 2;
    if (it.kind === "image" && isSticker(it.src)) {
      const im = imgs[k];
      if (im) {
        const r = Math.min(w / im.width, h / im.height);
        g.drawImage(im, -im.width * r / 2, -im.height * r / 2, im.width * r, im.height * r);
      }
    } else if (it.kind === "image") {
      const im = imgs[k];
      let ix = x, iy = y, iw = w, ih = h, rad = 16 * s;
      if (l.frame === "beyaz") {
        g.shadowColor = "rgba(0,0,0,.35)";
        g.shadowBlur = 24 * s;
        g.shadowOffsetY = 10 * s;
        g.fillStyle = "#fbf9f4";
        rr(g, x, y, w, h, 6 * s);
        g.fill();
        g.shadowColor = "transparent";
        const p = Math.min(w, h) * 0.035;
        ix = x + p; iy = y + p; iw = w - p * 2; ih = h - p * 2; rad = 3 * s;
      } else if (l.frame === "polaroid") {
        g.shadowColor = "rgba(0,0,0,.45)";
        g.shadowBlur = 30 * s;
        g.shadowOffsetY = 12 * s;
        g.fillStyle = "#faf7f1";
        g.fillRect(x, y, w, h);
        g.shadowColor = "transparent";
        const p = w * 0.045;
        ix = x + p; iy = y + p; iw = w - p * 2; ih = h - p - w * 0.16; rad = 0;
      } else if (l.frame === "keskin") rad = 0;
      g.save();
      rr(g, ix, iy, iw, ih, rad);
      g.clip();
      if (im) {
        const r = Math.max(iw / im.width, ih / im.height);
        g.drawImage(im, ix + (iw - im.width * r) / 2, iy + (ih - im.height * r) / 2, im.width * r, im.height * r);
      } else {
        g.fillStyle = "#222";
        g.fillRect(ix, iy, iw, ih);
      }
      g.restore();
    } else {
      const tone = TONES[it.tone ?? "gece"] ?? TONES.gece;
      if (tone.bg) {
        const stops = tone.bg.match(/#[0-9a-f]{6}/gi)!;
        const lg = g.createLinearGradient(x, y, x + w, y + h);
        lg.addColorStop(0, stops[0]);
        lg.addColorStop(1, stops[1]);
        g.fillStyle = lg;
        rr(g, x, y, w, h, 18 * s);
        g.fill();
      }
      const font = l.font ?? "serif";
      const fs = wordFontSize(it.text ?? "", l.w, l.h, font) * s;
      g.fillStyle = it.tone === "yazi" ? BGS[bg]?.ink ?? tone.fg : tone.fg;
      g.font = `${font === "serif" ? "italic 400" : "500"} ${fs}px ${FONT_CSS[font]}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const words = (it.text ?? "").split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const wd of words) {
        const t = cur ? cur + " " + wd : wd;
        if (g.measureText(t).width > w * 0.9 && cur) {
          lines.push(cur);
          cur = wd;
        } else cur = t;
      }
      if (cur) lines.push(cur);
      lines.forEach((ln, i) => g.fillText(ln, 0, (i - (lines.length - 1) / 2) * fs * 1.08));
    }
    g.restore();
  });
  return new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}
