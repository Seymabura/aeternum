/** Kâğıt dilek feneri: 2D çizim (3D doku + paylaşım kartı için ortak). (cx, cy) fenerin merkezi, h yüksekliği. */
export function drawLantern(ctx: CanvasRenderingContext2D, cx: number, cy: number, h: number, glow = 1) {
  const w = h * 0.72;
  const top = cy - h / 2;
  const bot = cy + h / 2;
  // dış hare
  const halo = ctx.createRadialGradient(cx, cy + h * 0.1, 0, cx, cy + h * 0.1, h * 1.25);
  halo.addColorStop(0, `rgba(255,150,90,${0.38 * glow})`);
  halo.addColorStop(0.35, `rgba(210,70,92,${0.16 * glow})`);
  halo.addColorStop(1, "rgba(158,27,50,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(cx - h * 1.3, cy - h * 1.2, h * 2.6, h * 2.6);

  // gövde (üstte geniş, altta dar, yumuşak köşeli)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.46, top + h * 0.06);
  ctx.quadraticCurveTo(cx - w * 0.5, top, cx - w * 0.4, top);
  ctx.lineTo(cx + w * 0.4, top);
  ctx.quadraticCurveTo(cx + w * 0.5, top, cx + w * 0.46, top + h * 0.06);
  ctx.bezierCurveTo(cx + w * 0.44, top + h * 0.5, cx + w * 0.38, bot - h * 0.12, cx + w * 0.3, bot);
  ctx.lineTo(cx - w * 0.3, bot);
  ctx.bezierCurveTo(cx - w * 0.38, bot - h * 0.12, cx - w * 0.44, top + h * 0.5, cx - w * 0.46, top + h * 0.06);
  ctx.closePath();
  const body = ctx.createRadialGradient(cx, bot - h * 0.18, h * 0.02, cx, cy, h * 0.75);
  body.addColorStop(0, `rgba(255,236,190,${0.98})`);
  body.addColorStop(0.28, "rgba(255,170,96,0.96)");
  body.addColorStop(0.62, "rgba(210,70,92,0.92)");
  body.addColorStop(1, "rgba(110,16,34,0.95)");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.clip();
  // kâğıt kıvrımları
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "rgba(60,6,16,1)";
  ctx.lineWidth = Math.max(1, h * 0.012);
  for (const f of [-0.22, 0, 0.22]) {
    ctx.beginPath();
    ctx.moveTo(cx + w * f * 1.9, top);
    ctx.lineTo(cx + w * f * 1.3, bot);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  // ağız ve alev
  const fl = ctx.createRadialGradient(cx, bot - h * 0.02, 0, cx, bot - h * 0.02, h * 0.16);
  fl.addColorStop(0, "rgba(255,252,235,1)");
  fl.addColorStop(0.4, "rgba(255,200,120,0.85)");
  fl.addColorStop(1, "rgba(255,140,80,0)");
  ctx.fillStyle = fl;
  ctx.beginPath();
  ctx.ellipse(cx, bot - h * 0.02, h * 0.16, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}
