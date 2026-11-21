/**
 * Ay'ı tarayıcıda, piksel piksel çizer (WebGL gerekmez, her çözünürlükte aynı sonuç).
 * Doku: NASA SVS CGI Moon Kit (LROC renk mozaiği, kamu malı), eşdikdörtgen, 0° boylam ortada.
 */

export type Light = { L: [number, number, number]; w?: number };

const texCache = new Map<string, Promise<ImageData>>();

/** Ön izleme için 2K, dışa aktarma için 4K doku */
export const MOON_2K = "/moon/lroc-2k.webp";
export const MOON_4K = "/moon/lroc-4k.webp";

/** Ay dokusunu bir kez yükler ve piksellerini önbelleğe alır */
export function loadMoonTexture(src = MOON_2K): Promise<ImageData> {
  let texPromise = texCache.get(src);
  if (!texPromise) {
    texPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, c.width, c.height));
      };
      img.onerror = () => {
        texCache.delete(src);
        reject(new Error("Ay dokusu yüklenemedi"));
      };
      img.src = src;
    });
    texCache.set(src, texPromise);
  }
  return texPromise;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Tek bir Ay diski çizer ve canvas döndürür.
 * lights: birden fazla ışık verilirse aydınlık alanların BİRLEŞİMİ çizilir (iki Ay'ın birleşmesi).
 * Dönüş: { canvas, litFraction } — litFraction, görünen diskin aydınlık alan oranı.
 */
export function renderMoon(
  tex: ImageData,
  diameter: number,
  lights: Light[],
  northAngle = 0,
  opts: { earthshine?: number } = {},
): { canvas: HTMLCanvasElement; litFraction: number } {
  const D = Math.max(8, Math.round(diameter));
  const c = document.createElement("canvas");
  c.width = D;
  c.height = D;
  const ctx = c.getContext("2d")!;
  const out = ctx.createImageData(D, D);
  const o = out.data;
  const r = D / 2;
  const tw = tex.width;
  const th = tex.height;
  const td = tex.data;
  const cs = Math.cos(northAngle);
  const sn = Math.sin(northAngle);
  const es = opts.earthshine ?? 0.1;
  let disc = 0;
  let lit = 0;

  for (let py = 0; py < D; py++) {
    const y = (r - py - 0.5) / r;
    for (let px = 0; px < D; px++) {
      const x = (px + 0.5 - r) / r;
      const d2 = x * x + y * y;
      if (d2 > 1.0 + 2 / r) continue;
      const dd = Math.sqrt(d2);
      const edge = Math.min(1, Math.max(0, (1 - dd) * r + 0.5));
      const z = Math.sqrt(Math.max(0, 1 - Math.min(1, d2)));

      // aydınlanma (birden çok ışığın birleşimi)
      let b = 0;
      let mask = 0;
      for (const l of lights) {
        const ndl = x * l.L[0] + y * l.L[1] + z * l.L[2];
        const m = smooth(-0.02, 0.05, ndl) * (l.w ?? 1);
        // Lommel-Seeliger: dolunayda kenarlar kararmaz
        const mu0 = Math.max(0, ndl);
        const ls = mu0 + z > 0 ? (2 * mu0) / (mu0 + z) : 0;
        const bi = m * (0.72 + 0.28 * Math.min(1.2, ls));
        if (bi > b) b = bi;
        if (m > mask) mask = m;
      }
      if (d2 <= 1) {
        disc++;
        if (mask > 0.5) lit++;
      }

      // ekran → Ay gövdesi (kuzey yukarı)
      const bx = x * cs + y * sn;
      const by = -x * sn + y * cs;
      const lat = Math.asin(Math.max(-1, Math.min(1, by)));
      const lon = Math.atan2(bx, z);
      const u = ((lon + Math.PI) / (2 * Math.PI)) * tw - 0.5;
      const v = ((Math.PI / 2 - lat) / Math.PI) * th - 0.5;
      // çift doğrusal örnekleme
      const x0 = Math.floor(u);
      const y0 = Math.max(0, Math.min(th - 1, Math.floor(v)));
      const fx = u - x0;
      const fy = v - Math.floor(v);
      const x0w = ((x0 % tw) + tw) % tw;
      const x1w = (x0w + 1) % tw;
      const y1 = Math.min(th - 1, y0 + 1);
      const i00 = (y0 * tw + x0w) * 4;
      const i10 = (y0 * tw + x1w) * 4;
      const i01 = (y1 * tw + x0w) * 4;
      const i11 = (y1 * tw + x1w) * 4;
      const oi = (py * D + px) * 4;
      for (let k = 0; k < 3; k++) {
        const t = (td[i00 + k] * (1 - fx) + td[i10 + k] * fx) * (1 - fy) + (td[i01 + k] * (1 - fx) + td[i11 + k] * fx) * fy;
        // dünya ışığı: karanlık yarıda çok hafif buz mavisi
        const tint = k === 0 ? 0.72 : k === 1 ? 0.8 : 0.95;
        const val = t * b * 1.12 + (t * es + 9) * tint * (1 - b);
        o[oi + k] = val > 255 ? 255 : val;
      }
      // karanlık yarı neredeyse saydam: gökyüzü arkadan hafifçe görünür
      o[oi + 3] = 255 * edge * (0.82 + 0.18 * Math.min(1, b * 1.6));
    }
  }
  ctx.putImageData(out, 0, 0);
  return { canvas: c, litFraction: disc ? lit / disc : 0 };
}
