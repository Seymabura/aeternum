/**
 * "Bizim 2026'mız" film motoru.
 * Her kare zamandan (t, saniye) hesaplanır: aynı t → aynı görüntü. Bu yüzden hem canlı oynatma
 * hem de video kaydı aynı çizim yolunu kullanır (DOM yok, her şey tek canvas'ta).
 */

export type FilmMonth = { m: number; src: string; note?: string };
export type FilmData = {
  names: [string, string];
  /** YYYY-MM-DD */
  met: string;
  months: FilmMonth[];
  song?: { title: string; artist: string } | null;
  word?: string;
  line?: string;
};

export type FilmAssets = {
  photos: Map<string, CanvasImageSource & { width: number; height: number }>;
  moon: HTMLCanvasElement | null;
  moonText: string;
};

type SceneKind = "open" | "count" | "photo" | "moon" | "song" | "word" | "line" | "final";
export type Scene = { kind: SceneKind; dur: number; start: number; photo?: FilmMonth; typing?: number[] };

const SERIF = "'Bodoni Moda Variable', 'Bodoni Moda', Didot, Georgia, serif";
const SANS = "'Geist Variable', Geist, system-ui, sans-serif";
const HAND = "Caveat, 'Segoe Print', cursive";
export const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function buildScenes(f: FilmData): Scene[] {
  const list: Omit<Scene, "start">[] = [{ kind: "open", dur: 4.5 }, { kind: "count", dur: 5 }];
  for (const p of [...f.months].sort((a, b) => a.m - b.m)) list.push({ kind: "photo", dur: 3.6, photo: p });
  list.push({ kind: "moon", dur: 5 });
  if (f.song?.title) list.push({ kind: "song", dur: 4.6 });
  if (f.word) list.push({ kind: "word", dur: 4.2 });
  if (f.line) {
    // insan ritminde daktilo: her karakter 40–90 ms (tohumlu)
    const R = rng(f.line.length * 977 + 13);
    const typing: number[] = [];
    let acc = 0.5;
    for (const ch of f.line) {
      acc += (40 + R() * 50) / 1000 + (/[.,!?]/.test(ch) ? 0.18 : 0);
      typing.push(acc);
    }
    list.push({ kind: "line", dur: acc + 2.6, typing });
  }
  list.push({ kind: "final", dur: 8.5 });
  let t = 0;
  return list.map((s) => {
    const out = { ...s, start: t } as Scene;
    t += s.dur;
    return out;
  });
}

export function totalDuration(sc: Scene[]) {
  const last = sc[sc.length - 1];
  return last.start + last.dur;
}

export function sceneIndexAt(sc: Scene[], t: number) {
  for (let i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start) return i;
  return 0;
}

/** Birlikte geçen süre (31 Aralık 2026 23:59 İstanbul'a kadar) */
export function together(met: string) {
  const end = Date.UTC(2026, 11, 31, 20, 59); // 23:59 TR
  const [y, m, d] = met.split("-").map(Number);
  const start = Date.UTC(y, m - 1, d, -3, 0);
  const total = Math.max(0, Math.floor((end - start) / 86400000));
  const yearStart = Date.UTC(2025, 11, 31, 21, 0);
  const thisYear = Math.max(0, Math.min(365, Math.floor((end - Math.max(start, yearStart)) / 86400000) + 1));
  return { total, thisYear, before2026: start < yearStart };
}

// ---------------------------------------------------------------- arka plan

function background(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, u: number) {
  const g = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, h);
  g.addColorStop(0, "#101a38");
  g.addColorStop(0.5, "#080d1d");
  g.addColorStop(1, "#04060c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const R = rng(42);
  for (let i = 0; i < 160; i++) {
    const x = R() * w;
    const y = R() * h;
    const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + R() * 1.4) + R() * 6);
    ctx.globalAlpha = 0.12 + 0.35 * tw * R();
    ctx.fillStyle = R() > 0.6 ? "#e9dcc0" : "#b9cdf2";
    ctx.beginPath();
    ctx.arc(x, y, (0.6 + R() * 0.9) * (u / 1080) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function snow(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, u: number, amount = 1) {
  const R = rng(7);
  const n = Math.round(140 * amount);
  for (let i = 0; i < n; i++) {
    const sp = 0.03 + R() * 0.06;
    const y = ((R() + t * sp) % 1.1) * h - h * 0.05;
    const x = R() * w + Math.sin(t * (0.4 + R()) + R() * 6) * u * 0.02;
    ctx.globalAlpha = 0.25 + R() * 0.55;
    ctx.fillStyle = "#f2eee6";
    ctx.beginPath();
    ctx.arc(x, y, (1 + R() * 2.4) * (u / 1080) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s, x, y);
}

/** Maskeli yukarı kayan satır (sitedeki .mask-line'ın canvas karşılığı) */
function maskLine(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, font: string, color: string, p: number) {
  const k = ease(p);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y - size * 1.05, ctx.canvas.width, size * 1.35);
  ctx.clip();
  text(ctx, s, x, y + size * 1.1 * (1 - k), font, color);
  ctx.restore();
}

function wrap(ctx: CanvasRenderingContext2D, s: string, maxW: number): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const wd of words) {
    const test = cur ? `${cur} ${wd}` : wd;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = wd;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitCover(img: { width: number; height: number }, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  return { dw: img.width * s, dh: img.height * s };
}

// ---------------------------------------------------------------- havai fişek → baş harfler

type Particle = { vx: number; vy: number; tx: number; ty: number; c: string; s: number; delay: number };
const fwCache = new Map<string, { parts: Particle[]; bx: number; by: number }>();

function fireworks(key: string, letters: string, w: number, h: number, u: number, n: number) {
  const k = `${key}|${w}|${h}|${n}`;
  if (fwCache.has(k)) return fwCache.get(k)!;
  // harf şeklinden hedef noktalar
  const oc = document.createElement("canvas");
  const ow = 600;
  const oh = 260;
  oc.width = ow;
  oc.height = oh;
  const o = oc.getContext("2d", { willReadFrequently: true })!;
  o.fillStyle = "#fff";
  o.font = `400 210px ${SERIF}`;
  o.textAlign = "center";
  o.textBaseline = "middle";
  o.fillText(letters, ow / 2, oh / 2 + 10);
  const data = o.getImageData(0, 0, ow, oh).data;
  const pts: [number, number][] = [];
  for (let y = 0; y < oh; y += 3) for (let x = 0; x < ow; x += 3) if (data[(y * ow + x) * 4 + 3] > 140) pts.push([x, y]);
  const R = rng(letters.length * 131 + 7);
  const scale = (w * 0.78) / ow;
  const bx = w / 2;
  const by = h * 0.36;
  const palette = ["#f3e6c8", "#dcc7a1", "#e9dcc0", "#f2eee6", "#b9cdf2"];
  const parts: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2;
    const sp = (0.25 + Math.pow(R(), 0.6) * 0.75) * u * 0.62;
    const [px, py] = pts.length ? pts[Math.floor(R() * pts.length)] : [ow / 2, oh / 2];
    parts.push({
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      tx: bx + (px - ow / 2) * scale,
      ty: by + (py - oh / 2) * scale,
      c: palette[Math.floor(R() * palette.length)],
      s: (1.3 + R() * 1.8) * (u / 1080) * 2.4,
      delay: R() * 0.35,
    });
  }
  const res = { parts, bx, by };
  fwCache.set(k, res);
  return res;
}

// ---------------------------------------------------------------- tek kare

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  f: FilmData,
  scenes: Scene[],
  assets: FilmAssets,
  T: number,
  opts: { reduced?: boolean; lowPower?: boolean } = {},
) {
  const u = Math.min(w, h * 0.5625);
  const i = sceneIndexAt(scenes, T);
  const sc = scenes[i];
  const t = T - sc.start;
  const p = t / sc.dur;
  background(ctx, w, h, T, u);
  const cx = w / 2;

  // sahne geçişi: başta ve sonda kısa kararma
  const fade = clamp(t / 0.45) * clamp((sc.dur - t) / 0.35);

  ctx.save();
  ctx.globalAlpha = 1;

  switch (sc.kind) {
    case "open": {
      snow(ctx, w, h, T, u, opts.lowPower ? 0.5 : 1);
      ctx.globalAlpha = clamp((sc.dur - t) / 0.4);
      maskLine(ctx, `${f.names[0]} & ${f.names[1]}`, cx, h * 0.47, u * 0.1, `400 ${u * 0.1}px ${SERIF}`, "#f2eee6", (t - 0.5) / 1.2);
      ctx.globalAlpha *= clamp((t - 1.5) / 0.8);
      text(ctx, "2026", cx, h * 0.47 + u * 0.12, `italic 400 ${u * 0.07}px ${SERIF}`, "#e9dcc0");
      break;
    }
    case "count": {
      const tg = together(f.met);
      const k = easeInOut((t - 0.4) / 2.6);
      ctx.globalAlpha = fade;
      text(ctx, "Birlikte geçen", cx, h * 0.34, `${u * 0.034}px ${SANS}`, "#98a1b6");
      const big = tg.before2026 ? tg.thisYear : tg.total;
      text(ctx, `${Math.round(big * k).toLocaleString("tr-TR")}`, cx, h * 0.48, `300 ${u * 0.26}px ${SERIF}`, "#f2eee6");
      text(ctx, tg.before2026 ? "gün, bu yıl" : "gün", cx, h * 0.48 + u * 0.08, `italic 400 ${u * 0.055}px ${SERIF}`, "#e9dcc0");
      const hours = Math.round(big * 24 * k);
      ctx.globalAlpha = fade * clamp((t - 1.6) / 0.8);
      text(ctx, `${hours.toLocaleString("tr-TR")} saat · ${(hours * 60).toLocaleString("tr-TR")} dakika`, cx, h * 0.48 + u * 0.15, `${u * 0.03}px ${SANS}`, "#dcc7a1");
      if (tg.before2026) text(ctx, `Toplamda ${tg.total.toLocaleString("tr-TR")} gün`, cx, h * 0.48 + u * 0.21, `${u * 0.03}px ${SANS}`, "#98a1b6");
      break;
    }
    case "photo": {
      const ph = sc.photo!;
      const img = assets.photos.get(ph.src);
      ctx.globalAlpha = fade;
      if (img) {
        const zoom = opts.reduced ? 1.02 : 1.02 + 0.08 * p; // Ken Burns
        const { dw, dh } = fitCover(img, w, h);
        const R = rng(ph.m * 31);
        const panX = (R() - 0.5) * 0.04 * w * p;
        const panY = (R() - 0.5) * 0.04 * h * p;
        ctx.drawImage(img as CanvasImageSource, cx - (dw * zoom) / 2 + panX, h / 2 - (dh * zoom) / 2 + panY, dw * zoom, dh * zoom);
        const shade = ctx.createLinearGradient(0, h * 0.45, 0, h);
        shade.addColorStop(0, "rgba(4,6,12,0)");
        shade.addColorStop(1, "rgba(4,6,12,.82)");
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);
        const top = ctx.createLinearGradient(0, 0, 0, h * 0.22);
        top.addColorStop(0, "rgba(4,6,12,.55)");
        top.addColorStop(1, "rgba(4,6,12,0)");
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, w, h * 0.22);
      }
      text(ctx, MONTHS_TR[ph.m - 1], u * 0.08, h * 0.12, `italic 400 ${u * 0.085}px ${SERIF}`, "#f2eee6", "left");
      if (ph.note) {
        ctx.globalAlpha = fade * clamp((t - 0.6) / 0.6);
        ctx.font = `500 ${u * 0.06}px ${HAND}`;
        const lines = wrap(ctx, ph.note, w - u * 0.16);
        lines.forEach((l, k) => text(ctx, l, u * 0.08, h - u * 0.2 - (lines.length - 1 - k) * u * 0.065, `500 ${u * 0.06}px ${HAND}`, "#f3e6c8", "left"));
      }
      break;
    }
    case "moon": {
      ctx.globalAlpha = fade;
      if (assets.moon) {
        const D = u * 0.5 * (1 + 0.04 * p);
        const halo = ctx.createRadialGradient(cx, h * 0.42, D * 0.3, cx, h * 0.42, D);
        halo.addColorStop(0, "rgba(233,220,192,.14)");
        halo.addColorStop(1, "rgba(233,220,192,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(assets.moon, cx - D / 2, h * 0.42 - D / 2, D, D);
      }
      ctx.globalAlpha = fade * clamp((t - 0.8) / 0.8);
      text(ctx, "Tanıştığınız gece", cx, h * 0.42 + u * 0.36, `${u * 0.032}px ${SANS}`, "#98a1b6");
      {
        const [nm, pc] = assets.moonText.split(" · ");
        text(ctx, nm ?? "", cx, h * 0.42 + u * 0.43, `400 ${u * 0.065}px ${SERIF}`, "#f2eee6");
        if (pc) text(ctx, `${pc} aydınlık`, cx, h * 0.42 + u * 0.49, `${u * 0.032}px ${SANS}`, "#dcc7a1");
      }
      break;
    }
    case "song": {
      ctx.globalAlpha = fade;
      const D = u * 0.56;
      const vy = h * 0.4;
      ctx.save();
      ctx.translate(cx, vy);
      ctx.rotate(opts.reduced ? 0 : T * 0.9);
      ctx.fillStyle = "#0b0f1c";
      ctx.beginPath();
      ctx.arc(0, 0, D / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(220,199,161,.12)";
      ctx.lineWidth = Math.max(1, u / 900);
      for (let r = D * 0.2; r < D / 2 - 2; r += D * 0.018) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // yansıma
      ctx.strokeStyle = "rgba(242,238,230,.12)";
      ctx.lineWidth = D * 0.05;
      ctx.beginPath();
      ctx.arc(0, 0, D * 0.36, -0.9, -0.4);
      ctx.stroke();
      const lab = ctx.createLinearGradient(-D * 0.16, -D * 0.16, D * 0.16, D * 0.16);
      lab.addColorStop(0, "#f3e6c8");
      lab.addColorStop(1, "#a88a5c");
      ctx.fillStyle = lab;
      ctx.beginPath();
      ctx.arc(0, 0, D * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1408";
      ctx.beginPath();
      ctx.arc(0, 0, D * 0.018, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = fade * clamp((t - 0.6) / 0.8);
      text(ctx, "Yılın şarkısı", cx, vy + D / 2 + u * 0.09, `${u * 0.032}px ${SANS}`, "#98a1b6");
      text(ctx, f.song!.title, cx, vy + D / 2 + u * 0.17, `400 ${u * 0.068}px ${SERIF}`, "#f2eee6");
      if (f.song!.artist) text(ctx, f.song!.artist, cx, vy + D / 2 + u * 0.225, `${u * 0.034}px ${SANS}`, "#dcc7a1");
      break;
    }
    case "word": {
      ctx.globalAlpha = fade;
      text(ctx, "Yılın kelimesi", cx, h * 0.36, `${u * 0.032}px ${SANS}`, "#98a1b6");
      const word = f.word!;
      let size = u * 0.2;
      ctx.font = `400 ${size}px ${SERIF}`;
      while (ctx.measureText(word).width > w * 0.86 && size > u * 0.06) {
        size *= 0.92;
        ctx.font = `400 ${size}px ${SERIF}`;
      }
      const total = ctx.measureText(word).width;
      let x = cx - total / 2;
      [...word].forEach((ch, k) => {
        const lp = clamp((t - 0.5 - k * 0.09) / 0.6);
        ctx.globalAlpha = fade * lp;
        ctx.font = `400 ${size}px ${SERIF}`;
        const cw = ctx.measureText(ch).width;
        text(ctx, ch, x + cw / 2, h * 0.52 + (1 - ease(lp)) * size * 0.3, `400 ${size}px ${SERIF}`, "#f2eee6");
        x += cw;
      });
      break;
    }
    case "line": {
      ctx.globalAlpha = fade;
      const s = f.line!;
      const n = sc.typing!.filter((x) => x <= t).length;
      const shown = s.slice(0, n);
      const size = u * 0.062;
      ctx.font = `400 ${size}px ${SERIF}`;
      const lines = wrap(ctx, s, w * 0.8);
      // yazılan kısmı satırlara dağıt
      let left = shown.length;
      const y0 = h * 0.47 - ((lines.length - 1) * size * 1.3) / 2;
      lines.forEach((l, k) => {
        const part = l.slice(0, Math.max(0, left));
        left -= l.length + 1;
        text(ctx, part, cx - ctx.measureText(l).width / 2, y0 + k * size * 1.3, `400 ${size}px ${SERIF}`, "#f2eee6", "left");
        if (left < 0 && left > -l.length - 2 && Math.floor(T * 2) % 2 === 0) {
          // imleç
          const cwid = ctx.measureText(part).width;
          ctx.fillStyle = "#dcc7a1";
          ctx.fillRect(cx - ctx.measureText(l).width / 2 + cwid + 3, y0 + k * size * 1.3 - size * 0.8, Math.max(2, u / 400), size * 0.95);
        }
      });
      ctx.globalAlpha = fade * clamp((t - (sc.typing!.at(-1) ?? 0) - 0.4) / 0.8);
      text(ctx, `— ${f.names[0]}`, cx, y0 + lines.length * size * 1.3 + u * 0.05, `italic 400 ${u * 0.04}px ${SERIF}`, "#dcc7a1");
      break;
    }
    case "final": {
      finale(ctx, w, h, u, f, t, opts);
      break;
    }
  }
  ctx.restore();
}

function finale(ctx: CanvasRenderingContext2D, w: number, h: number, u: number, f: FilmData, t: number, opts: { reduced?: boolean; lowPower?: boolean }) {
  const cx = w / 2;
  const initials = `${(f.names[0][0] ?? "").toLocaleUpperCase("tr")}&${(f.names[1][0] ?? "").toLocaleUpperCase("tr")}`;
  if (opts.reduced) {
    const k = clamp(t / 1.6);
    const glow = ctx.createRadialGradient(cx, h * 0.36, 0, cx, h * 0.36, u * 0.6);
    glow.addColorStop(0, `rgba(243,230,200,${0.35 * k})`);
    glow.addColorStop(1, "rgba(243,230,200,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = k;
    text(ctx, initials.replace("&", " & "), cx, h * 0.4, `400 ${u * 0.22}px ${SERIF}`, "#f3e6c8");
  } else {
    const n = opts.lowPower ? 1000 : 2000;
    const fw = fireworks(f.names.join("|"), initials.replace("&", " & "), w, h, u, n);
    // 0–1.1 sn: roket yükselir
    if (t < 1.15) {
      const k = ease(t / 1.1);
      const ry = h * 0.95 - (h * 0.95 - fw.by) * k;
      ctx.fillStyle = "#f3e6c8";
      ctx.shadowColor = "#f3e6c8";
      ctx.shadowBlur = u * 0.02;
      ctx.beginPath();
      ctx.arc(cx, ry, u * 0.006, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      const trail = ctx.createLinearGradient(0, ry, 0, ry + u * 0.18);
      trail.addColorStop(0, "rgba(243,230,200,.6)");
      trail.addColorStop(1, "rgba(243,230,200,0)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = u * 0.004;
      ctx.beginPath();
      ctx.moveTo(cx, ry);
      ctx.lineTo(cx, ry + u * 0.18);
      ctx.stroke();
    } else {
      const tb = t - 1.1;
      // patlama ışığı
      if (tb < 0.6) {
        const fl = ctx.createRadialGradient(cx, fw.by, 0, cx, fw.by, u * 0.5);
        fl.addColorStop(0, `rgba(243,230,200,${0.5 * (1 - tb / 0.6)})`);
        fl.addColorStop(1, "rgba(243,230,200,0)");
        ctx.fillStyle = fl;
        ctx.fillRect(0, 0, w, h);
      }
      const drag = 2.2;
      const g = u * 0.25;
      for (const pt of fw.parts) {
        const tt = Math.max(0, tb - pt.delay * 0.3);
        // serbest uçuş (sürtünme + yerçekimi)
        const e = (1 - Math.exp(-drag * tt)) / drag;
        let x = fw.bx + pt.vx * e;
        let y = fw.by + pt.vy * e + 0.5 * g * tt * tt * 0.4;
        // 1.2–3.4 sn: harflere yaylanma, 3.4–4.6 tut, sonra dağılıp yağ
        const form = easeInOut((tb - 1.0 - pt.delay) / 2.0);
        const release = clamp((tb - 3.9 - pt.delay) / 2.8);
        const fx = x + (pt.tx - x) * form;
        const fy = y + (pt.ty - y) * form;
        x = fx + pt.vx * 0.08 * release;
        y = fy + release * release * h * 0.55 + Math.sin(pt.tx) * release * u * 0.02;
        const alpha = clamp(1 - release * 1.1) * (tb < 0.05 ? tb / 0.05 : 1);
        if (alpha <= 0) continue;
        const twinkle = 0.75 + 0.25 * Math.sin(t * 12 + pt.tx);
        ctx.globalAlpha = alpha * twinkle;
        ctx.fillStyle = pt.c;
        ctx.fillRect(x - pt.s / 2, y - pt.s / 2, pt.s, pt.s);
      }
      ctx.globalAlpha = 1;
    }
  }
  const k = clamp((t - 4.8) / 1.0);
  ctx.globalAlpha = k;
  text(ctx, "2027'de de birlikte.", cx, h * 0.62, `italic 400 ${u * 0.075}px ${SERIF}`, "#f2eee6");
  ctx.globalAlpha = clamp((t - 5.6) / 1.0);
  text(ctx, "✦ AETERNUM", cx, h * 0.92, `500 ${u * 0.022}px ${SANS}`, "rgba(220,199,161,.6)");
  ctx.globalAlpha = 1;
}

export async function ensureFilmFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load(`400 40px ${SERIF}`),
    document.fonts.load(`italic 400 40px ${SERIF}`),
    document.fonts.load(`300 40px ${SERIF}`),
    document.fonts.load(`400 20px ${SANS}`),
    document.fonts.load(`500 20px ${HAND}`),
  ]).catch(() => {});
}
