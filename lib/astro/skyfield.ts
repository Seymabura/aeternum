/**
 * Gerçekçi gece gökyüzü motoru (fotoğraf benzeri).
 * - Kamera, gökyüzüne bakan geniş açılı bir objektif gibi çalışır (stereografik perspektif).
 * - Yıldızlar fotometrik parlaklık, B–V rengi, Gauss çekirdek + Moffat haleyle çizilir.
 * - Samanyolu yoğunluk haritası + gök koordinatlarına sabitlenmiş fraktal toz dokusu.
 * - Ufuk, hava kütlesi sönümlemesi, hava ışıması (airglow) ve Ay ışığı parıltısı.
 * Her şey çıktı çözünürlüğünde sıfırdan çizilir (4K dahil); yazı yoktur.
 */
import * as A from "astronomy-engine";
import { geoEquirectangular, geoPath } from "d3-geo";
import { renderMoon, type Light } from "./moon-render";

export type StarRow = [number, number, number, number];
/** katman → çokgen → halka → [boylam(-180..180), dec] */
export type MilkyWay = [number, number][][][][];
export type ConstellationLines = { id: string; rank: number; l: [number, number][][] }[];
type V3 = [number, number, number];

const D2R = Math.PI / 180;
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const eq = (raDeg: number, decDeg: number): V3 => {
  const r = raDeg * D2R;
  const d = decDeg * D2R;
  return [Math.cos(d) * Math.cos(r), Math.cos(d) * Math.sin(r), Math.sin(d)];
};

// ---------------------------------------------------------------- katalog (bir kez hazırlanır)

export type Catalog = { n: number; vec: Float32Array; mag: Float32Array; bin: Uint8Array; mw: MilkyWay; lines: ConstellationLines };
const BINS = 12;

/** B–V → sıcaklık (Ballesteros) → sRGB; doygunluk ~%40'a indirilir */
export function bvToRgb(bv: number): [number, number, number] {
  const T = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
  const t = T / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
    b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  } else {
    r = 329.7 * Math.pow(t - 60, -0.1332);
    g = 288.12 * Math.pow(t - 60, -0.0755);
    b = 255;
  }
  const c = [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
  const gray = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  const sat = 0.4;
  return c.map((v) => Math.round(gray + (v - gray) * sat + (255 - gray) * 0.12)) as [number, number, number];
}
const binBv = (i: number) => -0.3 + (i / (BINS - 1)) * 2.1;
const BIN_RGB = Array.from({ length: BINS }, (_, i) => bvToRgb(binBv(i)));

export function buildCatalog(rows: StarRow[], mw: MilkyWay, lines: ConstellationLines): Catalog {
  const n = rows.length;
  const vec = new Float32Array(n * 3);
  const mag = new Float32Array(n);
  const bin = new Uint8Array(n);
  rows.forEach(([ra, dec, m, bv], i) => {
    const v = eq(ra, dec);
    vec[i * 3] = v[0];
    vec[i * 3 + 1] = v[1];
    vec[i * 3 + 2] = v[2];
    mag[i] = m;
    bin[i] = Math.round(clamp((bv + 0.3) / 2.1) * (BINS - 1));
  });
  return { n, vec, mag, bin, mw, lines };
}

// ---------------------------------------------------------------- yıldız sprite'ları

const spriteCache = new Map<number, HTMLCanvasElement>();
/** Gauss çekirdek + Moffat kuyruk; merkez beyaza yakın (parlak yıldız doygunluğu) */
function sprite(b: number): HTMLCanvasElement {
  if (spriteCache.has(b)) return spriteCache.get(b)!;
  const S = 96;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const [cr, cg, cb] = BIN_RGB[b];
  const sigma = S * 0.045;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const r = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2);
      const core = Math.exp(-(r * r) / (2 * sigma * sigma));
      const halo = 0.085 / Math.pow(1 + (r / (sigma * 2.4)) ** 2, 2.2);
      const I = Math.min(1, core + halo) * (1 - smooth(S * 0.42, S * 0.5, r));
      const w = Math.min(1, core * 1.4); // merkez beyaz
      const i = (y * S + x) * 4;
      img.data[i] = cr + (255 - cr) * w;
      img.data[i + 1] = cg + (255 - cg) * w;
      img.data[i + 2] = cb + (255 - cb) * w;
      img.data[i + 3] = 255 * I;
    }
  ctx.putImageData(img, 0, 0);
  spriteCache.set(b, c);
  return c;
}

// ---------------------------------------------------------------- 3B değer gürültüsü (gök koordinatına sabit)

function hash3(x: number, y: number, z: number) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}
function fbm(x: number, y: number, z: number) {
  let s = 0, a = 0.5, f = 1;
  for (let o = 0; o < 5; o++) {
    s += a * noise3(x * f, y * f, z * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s / 0.97;
}

// ---------------------------------------------------------------- Samanyolu haritası

type MwMap = { w: number; h: number; d: Float32Array };
const mwCache = new WeakMap<Catalog, MwMap>();
/** 5 parlaklık katmanını eşdikdörtgen bir dokuya, delikleriyle (evenodd) doldurur; RA 0/360 sarmasını çözer */
function milkyWayMap(cat: Catalog): MwMap {
  const hit = mwCache.get(cat);
  if (hit) return hit;
  const w = 1440;
  const h = 720;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.globalCompositeOperation = "lighter";
  // d3-geo küresel çokgenleri doğru keser (RA 0/360 sarması, kutuplar)
  const proj = geoEquirectangular().scale(w / (2 * Math.PI)).translate([w / 2, h / 2]).precision(0.2);
  const path = geoPath(proj, ctx);
  cat.mw.forEach((layer) => {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    path({ type: "MultiPolygon", coordinates: layer });
    ctx.fill();
  });
  const px = ctx.getImageData(0, 0, w, h).data;
  let d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = px[i * 4] / 255;
  for (let pass = 0; pass < 3; pass++) d = boxBlur(d, w, h, 9);
  const m = { w, h, d };
  mwCache.set(cat, m);
  return m;
}

function sampleMw(m: MwMap, v: V3) {
  const lon = Math.atan2(v[1], v[0]) / D2R; // -180..180
  const dec = Math.asin(clamp(v[2], -1, 1)) / D2R;
  const x = ((lon + 180) / 360) * m.w - 0.5;
  const y = ((90 - dec) / 180) * m.h - 0.5;
  const x0 = Math.floor(x);
  const y0 = clamp(Math.floor(y), 0, m.h - 2);
  const fx = x - x0;
  const fy = clamp(y - y0, 0, 1);
  const xa = ((x0 % m.w) + m.w) % m.w;
  const xb = (xa + 1) % m.w;
  const d = m.d;
  return (d[y0 * m.w + xa] * (1 - fx) + d[y0 * m.w + xb] * fx) * (1 - fy) + (d[(y0 + 1) * m.w + xa] * (1 - fx) + d[(y0 + 1) * m.w + xb] * fx) * fy;
}

// ---------------------------------------------------------------- görünüm

export type ViewDir = "oto" | "kuzey" | "dogu" | "guney" | "bati" | "basucu";

export type SkyScene = {
  when: Date;
  lat: number;
  lon: number;
  /** ufuk (zemin) çizilsin mi; İki Ay'da kapalı */
  ground: boolean;
  /** kameranın baktığı yön, EQJ birim vektör ve "yukarı" */
  f: V3;
  u: V3;
  r: V3;
  /** yatay görüş açısı (derece) */
  hfov: number;
  zenith: V3;
  moon: { v: V3; light: V3; north: number; phase: number; fraction: number; alt: number } | null;
  planets: { v: V3; mag: number }[];
};

function camFromHorizontal(rotHE: A.RotationMatrix, t: A.AstroTime, azDeg: number, altDeg: number) {
  const az = azDeg * D2R;
  const al = altDeg * D2R;
  // yatay: x=kuzey, y=batı, z=başucu
  const fH: V3 = [Math.cos(al) * Math.cos(az), -Math.cos(al) * Math.sin(az), Math.sin(al)];
  let uH: V3;
  if (altDeg > 89) uH = [Math.cos(az), -Math.sin(az), 0];
  else {
    const z: V3 = [0, 0, 1];
    const k = dot(z, fH);
    uH = norm([z[0] - k * fH[0], z[1] - k * fH[1], z[2] - k * fH[2]]);
  }
  const toE = (v: V3): V3 => {
    const o = A.RotateVector(rotHE, new A.Vector(v[0], v[1], v[2], t));
    return [o.x, o.y, o.z];
  };
  const f = norm(toE(fH));
  const u = norm(toE(uH));
  const r = norm(cross(f, u));
  return { f, u, r };
}

/** Yaz Samanyolu merkezi ya da en parlak bölge yönünde otomatik kadraj */
function autoAzimuth(rotEH: A.RotationMatrix, t: A.AstroTime, cat: Catalog) {
  const toH = (v: V3) => {
    const o = A.RotateVector(rotEH, new A.Vector(v[0], v[1], v[2], t));
    return [o.x, o.y, o.z] as V3;
  };
  let best = 180;
  let score = -1;
  const gc = toH(eq(266.4, -28.94)); // galaksi merkezi
  for (let az = 0; az < 360; az += 15) {
    const f: V3 = [Math.cos(50 * D2R) * Math.cos(az * D2R), -Math.cos(50 * D2R) * Math.sin(az * D2R), Math.sin(50 * D2R)];
    let s = 0;
    for (let i = 0; i < Math.min(cat.n, 300); i++) {
      const h = toH([cat.vec[i * 3], cat.vec[i * 3 + 1], cat.vec[i * 3 + 2]]);
      if (h[2] < 0.12) continue;
      if (dot(h, f) > Math.cos(48 * D2R)) s += Math.pow(10, -0.4 * (cat.mag[i] - 3));
    }
    if (gc[2] > 0.1 && dot(gc, f) > Math.cos(45 * D2R)) s *= 1.6;
    if (s > score) {
      score = s;
      best = az;
    }
  }
  return best;
}

export function makeScene(when: Date, lat: number, lon: number, cat: Catalog, dir: ViewDir, hfov: number): SkyScene {
  const t = A.MakeTime(when);
  const obs = new A.Observer(lat, lon, 0);
  const rotEH = A.Rotation_EQJ_HOR(t, obs);
  const rotHE = A.InverseRotation(rotEH);
  const az = dir === "kuzey" ? 0 : dir === "dogu" ? 90 : dir === "guney" ? 180 : dir === "bati" ? 270 : dir === "basucu" ? 180 : autoAzimuth(rotEH, t, cat);
  const alt = dir === "basucu" ? 90 : 63;
  const cam = camFromHorizontal(rotHE, t, az, alt);
  const zo = A.RotateVector(rotHE, new A.Vector(0, 0, 1, t));
  return { when, lat, lon, ground: true, hfov, zenith: [zo.x, zo.y, zo.z], ...cam, ...bodies(t, obs, rotEH) };
}

/** İki Ay: kamera, Ay'ın o gece gökte durduğu yöne bakar (sadece yön saklanır; tarih/saat gerekmez) */
export function makeDirScene(moonVec: V3, fraction: number, hfov = 70): SkyScene {
  const f = norm(moonVec);
  const np: V3 = [0, 0, 1];
  const k = dot(np, f);
  const u = norm([np[0] - k * f[0], np[1] - k * f[1], np[2] - k * f[2]]);
  const r = norm(cross(f, u));
  return { when: new Date(0), lat: 0, lon: 0, ground: false, hfov, zenith: [0, 0, 1], f, u, r, moon: { v: f, light: [0, 0, 1], north: 0, phase: 180, fraction, alt: 60 }, planets: [] };
}

/** Bir anda Ay'ın gök yönü (EQJ birim vektör) */
export function moonDirection(when: Date): V3 {
  const g = A.GeoVector(A.Body.Moon, A.MakeTime(when), true);
  return norm([g.x, g.y, g.z]);
}

/** İki Ay: kamera Ay'ın gökteki yönüne bakar (ufuk yok) */
export function makeMoonScene(when: Date, lat: number, lon: number, hfov = 70): SkyScene {
  const t = A.MakeTime(when);
  const obs = new A.Observer(lat, lon, 0);
  const rotEH = A.Rotation_EQJ_HOR(t, obs);
  const b = bodies(t, obs, rotEH, true);
  const f = b.moon!.v;
  const np: V3 = [0, 0, 1];
  const k = dot(np, f);
  const u = norm([np[0] - k * f[0], np[1] - k * f[1], np[2] - k * f[2]]);
  const r = norm(cross(f, u));
  return { when, lat, lon, ground: false, hfov, zenith: [0, 0, 1], f, u, r, ...b };
}

function bodies(t: A.AstroTime, obs: A.Observer, rotEH: A.RotationMatrix, forceMoon = false) {
  const mv = A.GeoVector(A.Body.Moon, t, true);
  const ov = A.ObserverVector(t, obs, false);
  const mTopo = norm([mv.x - ov.x, mv.y - ov.y, mv.z - ov.z]);
  const h = A.RotateVector(rotEH, new A.Vector(mTopo[0], mTopo[1], mTopo[2], t));
  const sv = A.GeoVector(A.Body.Sun, t, true);
  const ill = A.Illumination(A.Body.Moon, t);
  const toSun = norm([sv.x - mv.x, sv.y - mv.y, sv.z - mv.z]);
  const moon = h.z > -0.02 || forceMoon ? { v: mTopo, light: toSun, north: 0, phase: A.MoonPhase(t), fraction: ill.phase_fraction, alt: Math.asin(h.z) / D2R } : null;
  const planets: { v: V3; mag: number }[] = [];
  for (const b of [A.Body.Venus, A.Body.Jupiter, A.Body.Mars, A.Body.Saturn, A.Body.Mercury]) {
    const g = A.GeoVector(b, t, true);
    const v = norm([g.x - ov.x, g.y - ov.y, g.z - ov.z]);
    planets.push({ v, mag: A.Illumination(b, t).mag });
  }
  return { moon, planets };
}

// ---------------------------------------------------------------- çizim

export type RenderOpts = {
  limitMag?: number;
  lines?: boolean;
  /** ilerleme bildirimi (0..1), büyük çıktılarda */
  onProgress?: (p: number) => void;
  /** İki Ay: büyük Ay posterde çizilecek; burada sadece parıltı ve yıldız sönümü */
  moonGlowOnly?: boolean;
  /** ekran ölçeği (yıldız boyutu); varsayılan h/1920 */
  scale?: number;
  /** döndürme animasyonu için hızlı ve kesintisiz (bekleme yok, düşük çözünürlüklü arka plan) */
  fast?: boolean;
  /** kadraj merkezinin dikey konumu (0..1), varsayılan 0.5 */
  cyFrac?: number;
};

export type SkyLayers = {
  bg: HTMLCanvasElement;
  stars: HTMLCanvasElement;
  /** canlı titreşim için en parlak yıldızlar (ekran koordinatı) */
  bright: { x: number; y: number; size: number; bin: number; alt: number; seed: number; planet?: boolean }[];
  moonPx: { x: number; y: number; d: number } | null;
};

const yieldReal = () => new Promise<void>((r) => setTimeout(r, 0));

export async function renderSky(scene: SkyScene, cat: Catalog, W: number, H: number, opts: RenderOpts = {}): Promise<SkyLayers> {
  const { f, u, r, zenith } = scene;
  const k = W / 2 / (2 * Math.tan((scene.hfov * D2R) / 4));
  const cx = W / 2;
  const cy = H * (opts.cyFrac ?? 0.5);
  const s = opts.scale ?? H / 1920;
  const prog = opts.onProgress ?? (() => {});
  const yieldFrame = opts.fast ? async () => {} : yieldReal;

  const project = (v: V3): [number, number, number] | null => {
    const dz = dot(v, f);
    if (dz < -0.3) return null;
    const X = (2 * dot(v, r)) / (1 + dz);
    const Y = (2 * dot(v, u)) / (1 + dz);
    return [cx + k * X, cy - k * Y, dz];
  };

  // ------------------------------------------------ arka plan (düşük çözünürlük, piksel piksel)
  const LW = Math.max(120, Math.round(W / (opts.fast ? 8 : 4)));
  const LH = Math.max(210, Math.round(H / (opts.fast ? 8 : 4)));
  // Samanyolu yoğunluğu: gök koordinatlarında (eşdikdörtgen) bir kez hazırlanmış harita
  const mwMap = milkyWayMap(cat);

  const bg = document.createElement("canvas");
  bg.width = LW;
  bg.height = LH;
  const bctx = bg.getContext("2d")!;
  const img = bctx.createImageData(LW, LH);
  const lk = LW / W;
  const kL = k * lk;
  const moonV = scene.moon?.v;
  const moonUp = scene.moon && (scene.moon.alt > -2 || !scene.ground) ? 1 : 0;
  for (let py = 0; py < LH; py++) {
    for (let px = 0; px < LW; px++) {
      const X = (px + 0.5 - LW / 2) / kL;
      const Y = (cy * lk - py - 0.5) / kL;
      const p2 = X * X + Y * Y;
      const den = 4 + p2;
      const a = (4 * X) / den, b = (4 * Y) / den, c = (4 - p2) / den;
      const d: V3 = [a * r[0] + b * u[0] + c * f[0], a * r[1] + b * u[1] + c * f[1], a * r[2] + b * u[2] + c * f[2]];
      const sAlt = scene.ground ? dot(d, zenith) : 0.6;
      let R = 2, G = 2, B = 5;
      const i = (py * LW + px) * 4;
      {
        const sa = Math.max(0, sAlt);
        const hz = Math.pow(1 - clamp(sa), 3);
        R += 4 * hz;
        G += 5 * hz;
        B += 6 * hz;
        // hava ışıması (airglow): ufka yakın çok soluk yeşilimsi gri
        const ag = Math.exp(-sa / 0.14) * (scene.ground ? 1 : 0);
        R += 5 * ag;
        G += 8 * ag;
        B += 6 * ag;
        // Samanyolu
        const md = sampleMw(mwMap, d);
        if (md > 0.005) {
          const n1 = fbm(d[0] * 6 + 3, d[1] * 6 - 1, d[2] * 6);
          const n2 = fbm(d[0] * 34 - 5, d[1] * 34 + 2, d[2] * 34 + 7);
          const lane = smooth(0.55, 0.8, n2) * 0.32; // ince, koyu toz damarları
          const core = md * md; // iç katmanlar daha parlak
          const glow = (0.55 * md + 0.75 * core) * (0.7 + 0.6 * n1) * (1 - lane * smooth(0.3, 0.9, md));
          const ext = scene.ground ? smooth(0, 0.35, sAlt) : 1;
          const warm = smooth(0.4, 0.9, md);
          const L = 22 * glow * ext;
          R += L * (0.86 + 0.14 * warm);
          G += L * (0.84 + 0.06 * warm);
          B += L * (0.86 - 0.1 * warm);
        }
        // Ay ışığı parıltısı
        if (moonV && moonUp) {
          const cosd = dot(d, moonV);
          const ang = Math.acos(clamp(cosd, -1, 1));
          const gl = (opts.moonGlowOnly ? 0.7 : 0.35) * scene.moon!.fraction;
          // İki Ay'da Ay ekranın çoğunu kapladığı için parıltı ölçeği görüş açısına göre büyür
          const sc = opts.moonGlowOnly ? (scene.hfov * D2R) / 1.2 : 1;
          const m = gl * (Math.exp(-ang / (0.5 * sc)) * 22 + Math.exp(-ang / (0.09 * sc)) * 30);
          R += m * 0.85;
          G += m * 0.88;
          B += m * 0.98;
        }
      }
      if (scene.ground && sAlt < 0.004) {
        // zemin: kömür siyahı; ufuk çizgisi yumuşak geçişli
        const g = smooth(-0.2, 0, sAlt);
        const gr = 2 + 4 * g, gg = 2 + 4 * g, gb = 3 + 5 * g;
        const k2 = smooth(-0.012, 0.004, sAlt);
        R = gr + (R - gr) * k2;
        G = gg + (G - gg) * k2;
        B = gb + (B - gb) * k2;
      }
      img.data[i] = R;
      img.data[i + 1] = G;
      img.data[i + 2] = B;
      img.data[i + 3] = 255;
    }
    if (py % 60 === 0) {
      prog(0.35 * (py / LH));
      await yieldFrame();
    }
  }
  bctx.putImageData(img, 0, 0);
  // tam çözünürlüğe yumuşak büyütme + ince gren
  const bgFull = document.createElement("canvas");
  bgFull.width = W;
  bgFull.height = H;
  const gctx = bgFull.getContext("2d")!;
  gctx.imageSmoothingEnabled = true;
  gctx.imageSmoothingQuality = "high";
  gctx.drawImage(bg, 0, 0, W, H);
  gctx.globalAlpha = 0.022;
  gctx.fillStyle = gctx.createPattern(grainTile(), "repeat")!;
  gctx.fillRect(0, 0, W, H);
  gctx.globalAlpha = 1;
  prog(0.4);

  // ------------------------------------------------ yıldızlar
  const stars = document.createElement("canvas");
  stars.width = W;
  stars.height = H;
  const sctx = stars.getContext("2d")!;
  sctx.globalCompositeOperation = "lighter";
  const limit = opts.limitMag ?? 8;
  const bright: SkyLayers["bright"] = [];
  const pt = Math.max(1, Math.round(1.05 * s));
  const fills = BIN_RGB.map(([a, b, c]) => `rgb(${a},${b},${c})`);
  let curBin = -1;

  for (let i = 0; i < cat.n; i++) {
    let m = cat.mag[i];
    if (m > limit) break;
    const v: V3 = [cat.vec[i * 3], cat.vec[i * 3 + 1], cat.vec[i * 3 + 2]];
    const p = project(v);
    if (!p) continue;
    const [x, y] = p;
    if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
    let alt = 60;
    let bin = cat.bin[i];
    if (scene.ground) {
      const sa = dot(v, zenith);
      if (sa < 0.002) continue;
      alt = Math.asin(sa) / D2R;
      // hava kütlesi (Kasten–Young) → sönüm ve kızarma
      const X = 1 / (Math.sin(alt * D2R) + 0.50572 * Math.pow(alt + 6.07995, -1.6364));
      m += 0.22 * (X - 1);
      bin = Math.min(BINS - 1, bin + Math.round(0.35 * (X - 1)));
    }
    // Ay ışığı: Ay'a yakın sönük yıldızlar kaybolur
    if (moonV && moonUp) {
      const ang = Math.acos(clamp(dot(v, moonV), -1, 1)) / D2R;
      const a0 = opts.moonGlowOnly ? scene.hfov * 0.45 : 4;
      const a1 = opts.moonGlowOnly ? scene.hfov * 1.1 : 45;
      const lim = 4 + 4 * smooth(a0, a1, ang) + (1 - scene.moon!.fraction) * 2;
      if (m > lim) continue;
    }
    if (m > limit) continue;
    const I = Math.pow(10, -0.4 * (m - 6)); // kadir 6 → 1
    if (I < 2.2) {
      // alt piksel yıldız: ışığı opaklıkla korunur
      if (bin !== curBin) {
        sctx.fillStyle = fills[bin];
        curBin = bin;
      }
      sctx.globalAlpha = clamp(0.1 + 0.42 * Math.pow(I, 0.75));
      sctx.fillRect(Math.round(x - pt / 2), Math.round(y - pt / 2), pt, pt);
    } else {
      const size = s * (6 + 10.5 * Math.log10(I));
      sctx.globalAlpha = clamp(0.55 + 0.2 * Math.log10(I));
      sctx.drawImage(sprite(bin), x - size / 2, y - size / 2, size, size);
      if (bright.length < 320 && m < 4.2) bright.push({ x, y, size, bin, alt, seed: i });
    }
    if (i % 6000 === 0) {
      prog(0.4 + 0.45 * (i / cat.n));
      await yieldFrame();
    }
  }
  sctx.globalAlpha = 1;

  // kırınım ışınları: sadece en parlak birkaç yıldız
  const top = bright.filter((b) => b.size > s * 26).slice(0, 7);
  for (const b of top) spikes(sctx, b.x, b.y, b.size * 1.9, s, fills[b.bin]);

  // gezegenler: titreşmeyen sabit noktalar
  for (const pl of scene.planets) {
    if (pl.mag > 2.5) continue;
    const p = project(pl.v);
    if (!p) continue;
    if (scene.ground && dot(pl.v, zenith) < 0.01) continue;
    const I = Math.pow(10, -0.4 * (pl.mag - 6));
    const size = s * (8 + 11 * Math.log10(I));
    sctx.globalAlpha = 0.95;
    sctx.drawImage(sprite(6), p[0] - size / 2, p[1] - size / 2, size, size);
    bright.push({ x: p[0], y: p[1], size, bin: 6, alt: 60, seed: -1, planet: true });
  }
  sctx.globalAlpha = 1;

  // takımyıldız çizgileri (isteğe bağlı)
  if (opts.lines) {
    sctx.globalCompositeOperation = "source-over";
    sctx.strokeStyle = "rgba(242,238,230,.18)";
    sctx.lineWidth = Math.max(0.5, 0.5 * s);
    for (const c of cat.lines)
      for (const pl of c.l)
        for (let j = 1; j < pl.length; j++) {
          const va = eq(pl[j - 1][0], pl[j - 1][1]);
          const vb = eq(pl[j][0], pl[j][1]);
          if (scene.ground && (dot(va, zenith) < 0 || dot(vb, zenith) < 0)) continue;
          const a = project(va);
          const b = project(vb);
          if (!a || !b) continue;
          sctx.beginPath();
          sctx.moveTo(a[0], a[1]);
          sctx.lineTo(b[0], b[1]);
          sctx.stroke();
        }
  }

  // Gökyüzü sahnesinde Ay (küçük ama net, doğal haleyle)
  let moonPx: SkyLayers["moonPx"] = null;
  if (scene.moon && !opts.moonGlowOnly && moonUp) {
    const p = project(scene.moon.v);
    if (p && p[0] > -40 && p[1] > -40 && p[0] < W + 40 && p[1] < H + 40) {
      const dReal = (k * 2 * Math.tan(0.26 * D2R)) * 1.0;
      const d = Math.max(dReal, 16 * s);
      moonPx = { x: p[0], y: p[1], d };
    }
  }
  prog(0.95);
  return { bg: bgFull, stars, bright, moonPx };
}

function spikes(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, s: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const a of [Math.PI / 4, -Math.PI / 4]) {
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len;
    for (const sg of [1, -1]) {
      const g = ctx.createLinearGradient(x, y, x + dx * sg, y + dy * sg);
      g.addColorStop(0, color.replace("rgb", "rgba").replace(")", ",0.22)"));
      g.addColorStop(1, color.replace("rgb", "rgba").replace(")", ",0)"));
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(0.6, 0.8 * s);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx * sg, y + dy * sg);
      ctx.stroke();
    }
  }
  ctx.restore();
}

let grain: HTMLCanvasElement | null = null;
function grainTile() {
  if (grain) return grain;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const im = ctx.createImageData(256, 256);
  let sd = 12345;
  for (let i = 0; i < 256 * 256; i++) {
    sd = (sd * 1664525 + 1013904223) >>> 0;
    const v = sd >>> 24;
    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
    im.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
  grain = c;
  return c;
}

function boxBlur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const win = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / win;
      acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / win;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/** Katmanları tek tuvalde birleştirir. t (sn) verilirse parlak yıldızlar gerçekçi şekilde titrer. */
export function composeSky(
  ctx: CanvasRenderingContext2D,
  L: SkyLayers,
  opts: { t?: number; reveal?: number; moonImg?: HTMLCanvasElement | null } = {},
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const rv = opts.reveal ?? 1;
  // göz karanlığa alışıyor: önce parlaklar, sonra sönükler, en son Samanyolu
  const aBright = smooth(0, 0.35, rv);
  const aFaint = smooth(0.25, 0.75, rv);
  const aBg = smooth(0.55, 1, rv);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#020205";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.35 + 0.65 * aBg;
  ctx.drawImage(L.bg, 0, 0);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = aFaint;
  ctx.drawImage(L.stars, 0, 0);
  ctx.globalAlpha = 1;
  // titreşim: parlak yıldızların üstüne küçük, zamanla değişen ek ışık
  if (opts.t !== undefined) {
    const t = opts.t;
    for (const b of L.bright) {
      if (b.planet) continue;
      const lowness = 1 - clamp((b.alt - 5) / 60);
      const amp = (0.06 + 0.14 * lowness) * clamp(b.size / 30, 0.4, 1);
      const sd = b.seed * 0.618;
      const w =
        Math.sin(t * (2 + (sd % 1) * 4) * Math.PI * 2 + sd * 7) * 0.5 +
        Math.sin(t * (3.1 + ((sd * 1.7) % 1) * 3) * Math.PI * 2 + sd * 3) * 0.3 +
        Math.sin(t * (5.3 + ((sd * 2.3) % 1)) * Math.PI * 2 + sd) * 0.2;
      const k = amp * w;
      const size = b.size * (1 + k * 0.6);
      if (k <= 0) continue;
      ctx.globalAlpha = clamp(k * 2.2) * aBright;
      // alçak yıldızlarda anlık renk kayması (kromatik titreşim)
      const bin = lowness > 0.6 && Math.sin(t * 9 + sd) > 0.7 ? Math.max(0, b.bin - 3) : b.bin;
      ctx.drawImage(sprite(bin), b.x - size / 2, b.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }
  // gökyüzündeki Ay
  if (L.moonPx && opts.moonImg) {
    const { x, y, d } = L.moonPx;
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(x, y, d * 0.4, x, y, d * 6);
    halo.addColorStop(0, "rgba(235,232,222,.28)");
    halo.addColorStop(1, "rgba(235,232,222,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - d * 6, y - d * 6, d * 12, d * 12);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(opts.moonImg, x - d / 2, y - d / 2, d, d);
  }
  ctx.restore();
}

/** Gökyüzü sahnesindeki küçük Ay görseli */
export function smallMoon(tex: ImageData, scene: SkyScene, d: number) {
  if (!scene.moon) return null;
  // ışığı kamera eksenlerine çevir
  const L = scene.moon.light;
  const light: V3 = norm([dot(L, scene.r), dot(L, scene.u), -dot(L, scene.f)]);
  // Ay'ın kuzeyi (gök kuzeyi) ekranda
  const np: V3 = [0, 0, 1];
  const north = Math.atan2(-dot(np, scene.r), dot(np, scene.u));
  return renderMoon(tex, Math.max(8, d * 1.6), [{ L: light } as Light], north, { earthshine: 0.08 }).canvas;
}
