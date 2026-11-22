import type { BoardFormat, VisionItem, VisionLayout } from "@/app/actions/extras";
import { isSticker, VISION_LIBRARY } from "@/lib/vision-library";

/** Pano boyutları: konumlar her formatın kendi mantıksal biriminde tutulur */
export type FormatDef = { id: BoardFormat; label: string; group: string; W: number; H: number; clock?: boolean; radius: number; exports: { id: string; label: string; w: number; h: number }[] };
export const FORMATS: FormatDef[] = [
  { id: "telefon", label: "Telefon", group: "Telefon", W: 1179, H: 2556, clock: true, radius: 34, exports: [{ id: "iphone", label: "iPhone", w: 1290, h: 2796 }, { id: "android", label: "Android", w: 1440, h: 3120 }, { id: "4k", label: "4K telefon", w: 2160, h: 4680 }] },
  { id: "tablet-dikey", label: "Tablet dikey", group: "Tablet", W: 1536, H: 2048, radius: 24, exports: [{ id: "ipad", label: "iPad", w: 1640, h: 2186 }, { id: "ipadpro", label: "iPad Pro", w: 2048, h: 2732 }] },
  { id: "tablet-yatay", label: "Tablet yatay", group: "Tablet", W: 2048, H: 1536, radius: 24, exports: [{ id: "ipad", label: "iPad", w: 2186, h: 1640 }, { id: "ipadpro", label: "iPad Pro", w: 2732, h: 2048 }] },
  { id: "masaustu", label: "Bilgisayar", group: "Bilgisayar", W: 1920, H: 1080, radius: 12, exports: [{ id: "fhd", label: "Full HD", w: 1920, h: 1080 }, { id: "qhd", label: "2K", w: 2560, h: 1440 }, { id: "4k", label: "4K", w: 3840, h: 2160 }] },
  { id: "ig-kare", label: "Instagram kare", group: "Sosyal medya", W: 1080, H: 1080, radius: 8, exports: [{ id: "kare", label: "Instagram kare", w: 1080, h: 1080 }, { id: "kare2x", label: "Yüksek çözünürlük", w: 2160, h: 2160 }] },
  { id: "ig-hikaye", label: "Instagram hikâyesi", group: "Sosyal medya", W: 1080, H: 1920, radius: 18, exports: [{ id: "hikaye", label: "Hikâye", w: 1080, h: 1920 }, { id: "hikaye2x", label: "Yüksek çözünürlük", w: 2160, h: 3840 }] },
  { id: "x", label: "X gönderisi", group: "Sosyal medya", W: 1600, H: 900, radius: 12, exports: [{ id: "x", label: "X gönderisi", w: 1600, h: 900 }, { id: "x2", label: "Yüksek çözünürlük", w: 3200, h: 1800 }] },
];
export const fmtOf = (id: string | null | undefined) => FORMATS.find((f) => f.id === id) ?? FORMATS[0];
/** Telefon kilit ekranında saatin kapladığı üst bölge */
export const clockSafe = (f: FormatDef) => (f.clock ? Math.round(f.H * 0.243) : 0);
/** Formatın kısa kenarına göre ölçek (telefon = 1) */
export const unit = (f: FormatDef) => Math.min(f.W, f.H) / 1179;

export const TONES: Record<string, { bg: string | null; fg: string; label: string }> = {
  gece: { bg: "linear-gradient(160deg,#1a1016,#050407)", fg: "#ecdfc4", label: "Gece" },
  sampanya: { bg: "linear-gradient(160deg,#f6eedc,#cdb892)", fg: "#1a1408", label: "Şampanya" },
  nar: { bg: "linear-gradient(160deg,#b52a42,#4a0b16)", fg: "#fbefe6", label: "Nar" },
  gul: { bg: "linear-gradient(160deg,#f3d6d2,#c98b8b)", fg: "#2a1220", label: "Gül" },
  buz: { bg: "linear-gradient(160deg,#eef2fb,#b9c6e2)", fg: "#12131a", label: "Buz" },
  zumrut: { bg: "linear-gradient(160deg,#2f5a4f,#13281f)", fg: "#ecdfc4", label: "Zümrüt" },
  yazi: { bg: null, fg: "#f3eee6", label: "Sadece yazı" },
};

export type BgDef = { css: string; label: string; ink: string; group: string; img?: string; stars?: boolean };
const tema = (k: string) => `/vision/tema/${k}.svg`;
export const BGS: Record<string, BgDef> = {
  sampanya: { css: "linear-gradient(170deg, #f7efdf, #e6d6b6 60%, #d4bf97)", label: "Şampanya", ink: "#1a1408", group: "Şampanya ve altın" },
  altin: { css: "linear-gradient(165deg, #fbf1d6, #e2c48a 45%, #b48a45)", label: "Altın", ink: "#2a1d08", group: "Şampanya ve altın" },
  inci: { css: "radial-gradient(120% 80% at 30% 10%, #ffffff, #f3eee8 45%, #ddd4cb)", label: "İnci", ink: "#2a2420", group: "Şampanya ve altın" },
  mermer: { css: "linear-gradient(160deg, #f6f4f0, #ece8e2 40%, #f8f6f2 55%, #e4dfd7)", label: "Mermer", ink: "#22201c", group: "Şampanya ve altın" },
  kagit: { css: "linear-gradient(170deg, #f3ece0, #e9dfcd)", label: "Kâğıt", ink: "#1a1408", group: "Şampanya ve altın" },
  nar: { css: "radial-gradient(120% 70% at 50% 0%, #6b1424, #2a0610 58%, #120306)", label: "Nar", ink: "#fbefe6", group: "Kırmızılar", stars: true },
  bordo: { css: "radial-gradient(120% 70% at 50% 0%, #4a0f1c, #23060d 58%, #0e0205)", label: "Bordo", ink: "#f6e6dc", group: "Kırmızılar" },
  yakut: { css: "linear-gradient(170deg, #b3203a, #7a0f24 55%, #3d0712)", label: "Yakut", ink: "#fff1ea", group: "Kırmızılar" },
  gulkurusu: { css: "linear-gradient(170deg, #e7c4c0, #c99592 55%, #a86f6e)", label: "Gül kurusu", ink: "#2c1214", group: "Kırmızılar" },
  pudra: { css: "linear-gradient(170deg, #fbefec, #f1d4d0 55%, #e2b7b4)", label: "Pudra", ink: "#3a1a1e", group: "Pembeler" },
  gul: { css: "linear-gradient(170deg, #f8e3df, #e8bdb8)", label: "Gül", ink: "#2a1220", group: "Pembeler" },
  seftali: { css: "linear-gradient(170deg, #fdeee3, #f7cdb3 55%, #eda88a)", label: "Şeftali", ink: "#3a1d10", group: "Pembeler" },
  fusya: { css: "linear-gradient(170deg, #f05a9c, #c0246e 55%, #6e0b3c)", label: "Fuşya", ink: "#fff0f6", group: "Pembeler" },
  lavanta: { css: "linear-gradient(170deg, #efe8f7, #d7c8ea 55%, #b9a3d6)", label: "Lavanta", ink: "#241638", group: "Pembeler" },
  gecemavisi: { css: "radial-gradient(120% 70% at 50% 0%, #1d2b52, #0b1328 58%, #04070f)", label: "Gece mavisi", ink: "#eef1fa", group: "Maviler", stars: true },
  safir: { css: "linear-gradient(170deg, #2b56b8, #173581 55%, #0a1a45)", label: "Safir", ink: "#f2f5ff", group: "Maviler" },
  gokmavisi: { css: "linear-gradient(170deg, #eaf4fd, #bcdcf5 55%, #8fc1ea)", label: "Gök mavisi", ink: "#0f2236", group: "Maviler" },
  buz: { css: "linear-gradient(170deg, #f1f4f8, #d9e0ea 55%, #bcc7d6)", label: "Buz mavisi", ink: "#16202c", group: "Maviler" },
  zumrut: { css: "radial-gradient(120% 70% at 50% 0%, #1f5446, #0e2b23 58%, #061510)", label: "Zümrüt", ink: "#f0e6cf", group: "Yeşiller" },
  adacayi: { css: "linear-gradient(170deg, #eef1e8, #cfd8c3 55%, #a9b89a)", label: "Adaçayı", ink: "#1d2618", group: "Yeşiller" },
  nane: { css: "linear-gradient(170deg, #eefaf4, #c7ecdb 55%, #9cd8bf)", label: "Nane", ink: "#0f2a1f", group: "Yeşiller" },
  zeytin: { css: "radial-gradient(120% 70% at 50% 0%, #4a4a2c, #23231a 58%, #0f0f0a)", label: "Zeytin", ink: "#f1ead6", group: "Yeşiller" },
  gece: { css: "radial-gradient(120% 70% at 50% 0%, #17121a, #050406 58%, #020203)", label: "Gece", ink: "#f3eee6", group: "Koyular", stars: true },
  murdum: { css: "radial-gradient(120% 70% at 50% 0%, #3e1838, #1b0a19 58%, #0a0309)", label: "Mürdüm", ink: "#f4e6ee", group: "Koyular", stars: true },
  kahve: { css: "radial-gradient(120% 70% at 50% 0%, #5a3f2c, #2c1e15 58%, #120c08)", label: "Kahve", ink: "#f3e7d8", group: "Koyular" },
  antrasit: { css: "radial-gradient(120% 70% at 50% 0%, #3a3b40, #1b1c1f 58%, #0b0b0d)", label: "Antrasit", ink: "#f0eee9", group: "Koyular" },
};
export const BG_GROUPS = ["Şampanya ve altın", "Kırmızılar", "Pembeler", "Maviler", "Yeşiller", "Koyular"];

export const FONT_CSS = {
  serif: '"Bodoni Moda Variable", "Bodoni Moda", Georgia, serif',
  klasik: '"Fraunces Variable", Fraunces, Georgia, serif',
  sans: '"Geist Variable", Geist, system-ui, sans-serif',
  el: '"Caveat", "Segoe Print", cursive',
  kaligrafi: '"Dancing Script", "Segoe Script", cursive',
  defter: '"Patrick Hand", "Segoe Print", cursive',
} as const;
export const FONT_LABEL: Record<keyof typeof FONT_CSS, string> = { serif: "Zarif", klasik: "Klasik", sans: "Sade", el: "El yazısı", kaligrafi: "Kaligrafi", defter: "Defter" };
/** Yazı tipine göre stil (italik/kalınlık) */
export function fontStyle(f: keyof typeof FONT_CSS) {
  return { italic: f === "serif" || f === "klasik", weight: f === "kaligrafi" ? 600 : f === "serif" || f === "klasik" ? 400 : f === "defter" ? 400 : 500 };
}
export const TEXT_COLORS = [
  { c: "", label: "Otomatik" },
  { c: "#f3eee6", label: "Fildişi" },
  { c: "#e2c98f", label: "Altın" },
  { c: "#9e1b32", label: "Nar" },
  { c: "#d2465c", label: "Gül kurusu" },
  { c: "#1a1408", label: "Siyah" },
  { c: "#ffffff", label: "Beyaz" },
];

export function photoMeta(src: string | null) {
  return VISION_LIBRARY.find((v) => v.src === src);
}
export { isSticker };

/** Yazı boyutu (pano biriminde): kutuya sığacak en büyük boy */
export function wordFontSize(text: string, w: number, h: number, font: keyof typeof FONT_CSS = "serif", caps = false) {
  if (caps) return wordFontSize(text, w * 0.78, h, font);
  const k = font === "el" || font === "defter" ? 0.42 : font === "kaligrafi" ? 0.46 : font === "sans" ? 0.52 : 0.5;
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
export type TemplateId = "kolaj" | "polaroid" | "izgara" | "odak" | "dergi" | "yelpaze" | "kalp" | "daire" | "film" | "defter";
export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "kolaj", label: "Kolaj" },
  { id: "dergi", label: "Dergi kapağı" },
  { id: "polaroid", label: "Polaroid" },
  { id: "defter", label: "Anı defteri" },
  { id: "yelpaze", label: "Yelpaze" },
  { id: "kalp", label: "Kalp" },
  { id: "daire", label: "Çember" },
  { id: "film", label: "Film şeridi" },
  { id: "izgara", label: "Izgara" },
  { id: "odak", label: "Tek büyük" },
];

export function applyTemplate(items: VisionItem[], t: TemplateId, f: FormatDef, natural?: Record<string, number>): Record<string, VisionLayout> {
  // hesap, genişliği 1179 olan sanal bir tuvalde yapılır, sonra formata ölçeklenir
  const BW = 1179;
  const BH = Math.round((1179 * f.H) / f.W);
  const wide = BW > BH;
  const out: Record<string, VisionLayout> = {};
  const pad = wide ? 40 : 54;
  const top = f.clock ? 620 : pad;
  const bottom = f.clock ? BH - 150 : BH - pad;
  const list = items.filter((i) => !isSticker(i.src));
  if (t === "kolaj") {
    const cols = wide ? (list.length > 8 ? 5 : 4) : list.length > 6 ? 3 : 2;
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
    const cols = wide ? Math.min(list.length, list.length > 6 ? 4 : 3) : list.length > 4 ? 2 : 1;
    const rows = Math.ceil(list.length / cols);
    const cellW = (BW - pad * 2) / cols;
    const cellH = (bottom - top) / Math.max(rows, 1);
    list.forEach((it, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const a = Math.min(1.3, Math.max(0.42, aspectOf(it, natural)));
      let w = Math.min(cellW * 1.08, (cellH * 1.15) / a);
      if (cols === 1) w = Math.min(w, BW * 0.72);
      w = Math.min(w, (cellH * 1.05) / a);
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
    const cols = wide ? Math.min(6, Math.max(3, Math.ceil(Math.sqrt(list.length * 1.8)))) : 3;
    const gap = 12;
    const cw = (BW - pad * 2 - gap * (cols - 1)) / cols;
    const rows = Math.ceil(list.length / cols);
    const ch = Math.min(cw * 1.25, (bottom - top - gap * (rows - 1)) / Math.max(rows, 1));
    list.forEach((it, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      out[it.id] = { x: pad + c * (cw + gap), y: top + r * (ch + gap), w: cw, h: ch, r: 0, z: i + 1, frame: "keskin", font: it.layout?.font ?? "serif" };
    });
  } else if (t === "dergi") {
    // dergi kapağı: üstte büyük kapak fotoğrafı, altında iki sütun; kelimeler başlık gibi
    const photos = list.filter((i) => i.kind === "image");
    const words = list.filter((i) => i.kind === "word");
    const w = BW - pad * 2;
    let y = top;
    words.slice(0, 1).forEach((it, i) => {
      out[it.id] = { x: pad, y, w, h: 190, r: 0, z: 100 + i, frame: "yok", font: "serif" };
      y += 200;
    });
    const hero = photos[0];
    if (hero) {
      const h = Math.min(w * 0.85, (bottom - y) * 0.42);
      out[hero.id] = { x: pad, y, w, h, r: 0, z: 1, frame: "keskin", font: "serif" };
      y += h + 18;
    }
    const rest = [...photos.slice(1), ...words.slice(1)];
    const cols = rest.length > 6 ? 3 : 2;
    const gap = 18;
    const cw = (w - gap * (cols - 1)) / cols;
    const rows = Math.ceil(rest.length / cols);
    const ch = Math.min(cw * 1.25, (bottom - y - gap * (rows - 1)) / Math.max(1, rows));
    rest.forEach((it, i) => {
      out[it.id] = { x: pad + (i % cols) * (cw + gap), y: y + Math.floor(i / cols) * (ch + gap), w: cw, h: ch, r: 0, z: i + 2, frame: it.kind === "image" ? "keskin" : "yok", font: it.layout?.font ?? "serif" };
    });
  } else if (t === "yelpaze") {
    // yelpaze: fotoğraflar alttaki bir noktadan açılan yay üzerinde
    const n = list.length;
    const w = Math.min(500, Math.max(300, 2200 / Math.max(n, 1)));
    const R = BW * 0.78;
    const maxHalf = (Math.asin(Math.min(1, (BW / 2 - pad - w * 0.55) / R)) * 180) / Math.PI;
    const spread = Math.min(maxHalf * 2, 14 * (n - 1));
    const pivot = { x: BW / 2, y: (wide ? (top + bottom) / 2 : BH * 0.62) + R };
    list.forEach((it, i) => {
      const a = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1);
      const rad = (a * Math.PI) / 180;
      const h = w * Math.min(1.45, Math.max(0.5, aspectOf(it, natural)));
      const cx = pivot.x + Math.sin(rad) * R;
      const cy = pivot.y - Math.cos(rad) * R;
      out[it.id] = { x: cx - w / 2, y: cy - h / 2, w, h, r: a, z: i + 1, frame: it.kind === "image" ? "beyaz" : "yok", font: it.layout?.font ?? "serif" };
    });
  } else if (t === "kalp") {
    // kalp: fotoğraflar kalp eğrisi boyunca eşit aralıkla, hafif üst üste; ortada ilk kelime
    const words = list.filter((i) => i.kind === "word");
    const photos = list.filter((i) => i.kind === "image");
    const n = Math.max(photos.length, 1);
    const curve = (tt: number) => ({ x: 16 * Math.sin(tt) ** 3, y: -(13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt)) });
    // yay uzunluğuna göre örnekle
    const N = 720;
    const pts = Array.from({ length: N + 1 }, (_, i) => curve((i / N) * Math.PI * 2));
    const acc = [0];
    for (let i = 1; i <= N; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const per = acc[N];
    let size = 260;
    let S = 26;
    for (let k = 0; k < 6; k++) {
      S = Math.min((BW - pad * 2 - size) / 32, (bottom - top - size) / 30);
      size = Math.max(150, Math.min(340, ((per * S) / n) * 1.15));
    }
    const cx = BW / 2;
    const cy = (top + bottom) / 2 - 2 * S;
    photos.forEach((it, i) => {
      const target = (per * i) / n;
      let j = 0;
      while (j < N && acc[j] < target) j++;
      const pt = pts[j];
      out[it.id] = { x: cx + pt.x * S - size / 2, y: cy + pt.y * S - size / 2, w: size, h: size, r: ((i * 23) % 11) - 5, z: i + 1, frame: "beyaz", font: "serif" };
    });
    words.forEach((it, i) => {
      out[it.id] = { x: cx - 240, y: cy + 2 * S - 65 + i * 140, w: 480, h: 130, r: 0, z: 100 + i, frame: "yok", font: it.layout?.font ?? "kaligrafi" };
    });
  } else if (t === "daire") {
    // çember: fotoğraflar bir halka üzerinde, ortada kelime
    const words = list.filter((i) => i.kind === "word");
    const photos = list.filter((i) => i.kind === "image");
    const n = Math.max(photos.length, 1);
    const cx = BW / 2;
    const cy = (top + bottom) / 2;
    const R = Math.min(BW * 0.36, (bottom - top) / 2 - 120);
    const size = Math.max(120, Math.min(320, (2 * Math.PI * R) / n * 0.92, R * 0.9));
    photos.forEach((it, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      out[it.id] = { x: cx + Math.cos(a) * R - size / 2, y: cy + Math.sin(a) * R - size / 2, w: size, h: size, r: 0, z: i + 1, frame: "beyaz", font: "serif" };
    });
    words.forEach((it, i) => {
      out[it.id] = { x: cx - 230, y: cy - 75 + (i - (words.length - 1) / 2) * 150, w: 460, h: 140, r: 0, z: 100 + i, frame: "yok", font: it.layout?.font ?? "serif" };
    });
  } else if (t === "film") {
    // film şeridi: dikey formatta tek sütun, yatayda tek sıra
    const n = Math.max(list.length, 1);
    if (wide) {
      const gap = 14;
      const w = Math.min(420, (BW - pad * 2 - gap * (n - 1)) / n);
      const h = Math.min(bottom - top, w * 1.3);
      const x0 = (BW - (w * n + gap * (n - 1))) / 2;
      list.forEach((it, i) => {
        out[it.id] = { x: x0 + i * (w + gap), y: (BH - h) / 2, w, h, r: 0, z: i + 1, frame: it.kind === "image" ? "keskin" : "yok", font: it.layout?.font ?? "serif" };
      });
    } else {
    const gap = 16;
    const h = Math.min(520, (bottom - top - gap * (n - 1)) / n);
    const w = Math.min(BW * 0.72, h * 1.25);
    list.forEach((it, i) => {
      out[it.id] = { x: (BW - w) / 2, y: top + i * (h + gap), w, h, r: 0, z: i + 1, frame: it.kind === "image" ? "keskin" : "yok", font: it.layout?.font ?? "serif" };
    });
    }
  } else if (t === "defter") {
    // anı defteri: farklı boylarda, üst üste binen, eğik fotoğraflar
    const n = Math.max(list.length, 1);
    const cols = wide ? Math.min(n, 4) : n > 5 ? 2 : 1;
    const rows = Math.ceil(n / cols);
    const cellH = (bottom - top) / rows;
    list.forEach((it, i) => {
      const big = i % 3 === 0;
      const a = Math.min(1.35, Math.max(0.42, aspectOf(it, natural)));
      const w = (cols === 1 ? BW * 0.66 : (BW / cols) * 1.0) * (big ? 1.1 : 0.88);
      const h = Math.min(w * a, cellH * 1.25);
      const ww = h / a;
      const c = i % cols;
      const r = Math.floor(i / cols);
      const cx = cols === 1 ? BW / 2 + (i % 2 ? 90 : -90) : pad + ((BW - pad * 2) / cols) * (c + 0.5);
      const cy = top + r * cellH + cellH / 2 + ((i * 41) % 60) - 30;
      out[it.id] = {
        x: cx - ww / 2,
        y: cy - h / 2,
        w: ww,
        h,
        r: ((i * 37) % 15) - 7,
        z: i + 1,
        frame: it.kind === "image" ? (i % 2 ? "polaroid" : "beyaz") : "yok",
        font: it.layout?.font ?? (it.kind === "word" ? "el" : "serif"),
      };
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
  const k = f.W / BW;
  for (const id in out) {
    const l = out[id];
    l.x = Math.round(l.x * k);
    l.y = Math.round(l.y * k);
    l.w = Math.round(l.w * k);
    l.h = Math.round(l.h * k);
  }
  return out;
}

// ---------------------------------------------------------------- dışa aktarma

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

async function paintBg(g: CanvasRenderingContext2D, W: number, H: number, bg: string, BW: number, BH: number) {
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
  // css degradesindeki renkleri sırayla kullan
  // css degradesindeki renkleri ve yüzdeleri aynen kullan (ekrandakiyle aynı görünüm)
  const stops = [...def.css.matchAll(/(#[0-9a-f]{6})(?:\s+(\d+)%)?/gi)].slice(0, 5);
  const list = stops.map((m, i) => [m[2] ? Number(m[2]) / 100 : i / Math.max(1, stops.length - 1), m[1]] as [number, string]);
  grad(list.length ? list : [[0, "#17121a"], [1, "#020203"]], def.css.startsWith("radial"));
  if (def.stars) {
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

export async function renderBoard(items: VisionItem[], bg: string, srcOf: (i: VisionItem) => string | undefined, W: number, H: number, f: FormatDef) {
  const BW = f.W;
  const BH = f.H;
  await Promise.all([
    document.fonts.load(`italic 400 80px ${FONT_CSS.serif}`),
    document.fonts.load(`500 60px ${FONT_CSS.sans}`),
    document.fonts.load(`500 60px ${FONT_CSS.el}`),
    document.fonts.load(`600 60px ${FONT_CSS.kaligrafi}`),
    document.fonts.load(`italic 400 60px ${FONT_CSS.klasik}`),
    document.fonts.load(`400 60px ${FONT_CSS.defter}`),
  ]).catch(() => null);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  await paintBg(g, W, H, bg, BW, BH);
  const s = Math.min(W / BW, H / BH);
  const ox = (W - BW * s) / 2;
  const oy = (H - BH * s) / 2;
  // Türkçe ve Latin karakterleri de yükle
  await Promise.all(items.filter((i) => i.kind === "word" && i.layout?.font).map((i) => document.fonts.load(`60px ${FONT_CSS[i.layout!.font!]}`, i.text ?? "a"))).catch(() => null);
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
      const fs = wordFontSize(it.text ?? "", l.w, l.h, font, l.caps) * s;
      g.fillStyle = l.c || (it.tone === "yazi" ? BGS[bg]?.ink ?? tone.fg : tone.fg);
      const st = fontStyle(font);
      g.font = `${st.italic ? "italic " : ""}${st.weight} ${fs}px ${FONT_CSS[font]}`;
      if (l.caps) (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${fs * 0.12}px`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const words = (l.caps ? (it.text ?? "").toLocaleUpperCase("tr") : it.text ?? "").split(" ");
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
