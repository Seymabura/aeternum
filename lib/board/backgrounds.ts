/** Dilek panosu arka planları: tuvale çizilir (dosya yok, her boyutta keskin). */

export type BgKind = "mantar" | "kraft" | "defter" | "gece" | "krem" | "cam";

export const BACKGROUNDS: { id: BgKind; name: string; swatch: string }[] = [
  { id: "mantar", name: "Mantar pano", swatch: "#b98c5c" },
  { id: "kraft", name: "Kraft kağıt", swatch: "#c9a57a" },
  { id: "defter", name: "Defter sayfası", swatch: "#fbf6ea" },
  { id: "gece", name: "Gece gökyüzü", swatch: "#1b2a41" },
  { id: "krem", name: "Krem kağıt", swatch: "#f3e7d1" },
  { id: "cam", name: "Çam yeşili", swatch: "#1e3a2f" },
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, u: number, alpha: number, r: () => number, n = 1) {
  const count = Math.round((w * h) / (u * u * 90) * n);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = r() < 0.5 ? `rgba(0,0,0,${alpha * r()})` : `rgba(255,255,255,${alpha * r()})`;
    ctx.fillRect(r() * w, r() * h, u * (0.8 + r()), u * (0.8 + r()));
  }
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(40,20,10,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** u: 1080 genişliğe göre ölçek birimi */
export function drawBackground(ctx: CanvasRenderingContext2D, kind: BgKind, w: number, h: number, u: number) {
  const r = rng(42);
  ctx.save();
  switch (kind) {
    case "mantar": {
      ctx.fillStyle = "#b98c5c";
      ctx.fillRect(0, 0, w, h);
      const n = Math.round((w * h) / (u * u * 30));
      const cols = ["#8f6338", "#a87a4a", "#cfa271", "#d9b384", "#7a5230", "#c4935f"];
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = cols[Math.floor(r() * cols.length)];
        ctx.globalAlpha = 0.35 + r() * 0.5;
        ctx.beginPath();
        ctx.ellipse(r() * w, r() * h, u * (1 + r() * 3.2), u * (0.8 + r() * 2.4), r() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      grain(ctx, w, h, u, 0.12, r);
      vignette(ctx, w, h, 0.35);
      break;
    }
    case "kraft": {
      ctx.fillStyle = "#c9a57a";
      ctx.fillRect(0, 0, w, h);
      const n = Math.round((w * h) / (u * u * 70));
      for (let i = 0; i < n; i++) {
        const x = r() * w;
        const y = r() * h;
        const a = r() * Math.PI;
        const l = u * (4 + r() * 14);
        ctx.strokeStyle = r() < 0.6 ? "rgba(110,72,40,.18)" : "rgba(255,240,210,.22)";
        ctx.lineWidth = u * (0.4 + r() * 0.8);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      grain(ctx, w, h, u, 0.1, r);
      vignette(ctx, w, h, 0.25);
      break;
    }
    case "defter": {
      ctx.fillStyle = "#fbf6ea";
      ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, u, 0.05, r, 0.6);
      const gap = 64 * u;
      ctx.strokeStyle = "rgba(91,127,166,.38)";
      ctx.lineWidth = 2.2 * u;
      for (let y = gap * 2.5; y < h; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(184,50,63,.55)";
      ctx.lineWidth = 2.6 * u;
      const mx = Math.min(140 * u, w * 0.13);
      ctx.beginPath();
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx, h);
      ctx.stroke();
      ctx.fillStyle = "#e6d9bf";
      for (let y = h * 0.12; y < h; y += h / 6) {
        ctx.beginPath();
        ctx.arc(mx * 0.42, y, 20 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      vignette(ctx, w, h, 0.12);
      break;
    }
    case "gece": {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0c1424");
      g.addColorStop(0.5, "#1b2a41");
      g.addColorStop(0.85, "#3a2f4f");
      g.addColorStop(1, "#5a3a4a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const n = Math.round((w * h) / (u * u * 900));
      for (let i = 0; i < n; i++) {
        const x = r() * w;
        const y = r() * h * 0.9;
        const s = u * (0.6 + r() * r() * 3);
        ctx.fillStyle = `rgba(255,248,230,${0.35 + r() * 0.65})`;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
        if (r() < 0.04) {
          ctx.strokeStyle = "rgba(255,240,200,.6)";
          ctx.lineWidth = u * 1.2;
          ctx.beginPath();
          ctx.moveTo(x - s * 6, y);
          ctx.lineTo(x + s * 6, y);
          ctx.moveTo(x, y - s * 6);
          ctx.lineTo(x, y + s * 6);
          ctx.stroke();
        }
      }
      // ufukta çam silueti
      ctx.fillStyle = "#0b1410";
      const base = h * 0.94;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 22 * u) {
        const th = (60 + r() * 140) * u;
        ctx.lineTo(x, base);
        ctx.lineTo(x + 11 * u, base - th);
      }
      ctx.lineTo(w, base);
      ctx.lineTo(w, h);
      ctx.fill();
      break;
    }
    case "krem": {
      ctx.fillStyle = "#f3e7d1";
      ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, u, 0.08, r);
      vignette(ctx, w, h, 0.2);
      break;
    }
    case "cam": {
      ctx.fillStyle = "#1e3a2f";
      ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, u, 0.1, r);
      ctx.strokeStyle = "rgba(200,146,42,.25)";
      ctx.lineWidth = 3 * u;
      ctx.strokeRect(36 * u, 36 * u, w - 72 * u, h - 72 * u);
      ctx.lineWidth = 1.2 * u;
      ctx.strokeRect(50 * u, 50 * u, w - 100 * u, h - 100 * u);
      vignette(ctx, w, h, 0.3);
      break;
    }
  }
  ctx.restore();
}

export function makeBackgroundCanvas(kind: BgKind, w: number, h: number, u: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(w);
  c.height = Math.round(h);
  drawBackground(c.getContext("2d")!, kind, c.width, c.height, u);
  return c;
}
