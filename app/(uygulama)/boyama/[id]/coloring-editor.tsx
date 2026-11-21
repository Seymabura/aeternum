"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brush,
  Check,
  Download,
  Eraser,
  Loader2,
  Lock,
  Maximize,
  PaintBucket,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { saveColoring, type Stroke } from "@/app/actions/coloring";
import type { ArtData, ArtMeta } from "@/lib/art";
import { cn } from "@/lib/utils";
import { PALETTES } from "./palettes";
import { shareOrDownload } from "@/lib/share";

type Tool = "fill" | "brush" | "eraser";
type Snap = { fills: Record<string, string>; strokes: Stroke[] };

const PAPER = "#fffaf1";

export function ColoringEditor({
  meta,
  open,
  effort,
  initialFills,
  initialStrokes,
}: {
  meta: ArtMeta;
  open: number;
  effort: number;
  initialFills: Record<string, string>;
  initialStrokes: Stroke[];
}) {
  const [art, setArt] = useState<ArtData | null>(null);
  const [snap, setSnap] = useState<Snap>({ fills: initialFills, strokes: initialStrokes });
  const [past, setPast] = useState<Snap[]>([]);
  const [future, setFuture] = useState<Snap[]>([]);
  const [tool, setTool] = useState<Tool>("fill");
  const [color, setColor] = useState(PALETTES[0].colors[0]);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [size, setSize] = useState(10);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty" | "error">("saved");
  const [live, setLive] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ReactZoomPanPinchRef>(null);
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const pointsRef = useRef<number[]>([]);
  const pointersRef = useRef(new Set<number>());
  const drawingRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(snap);
  useLayoutEffect(() => {
    latest.current = snap;
  }, [snap]);
  const [liveW, setLiveW] = useState(10);

  useEffect(() => {
    let alive = true;
    fetch(`/art/${meta.id}.json`)
      .then((r) => r.json())
      .then((d: ArtData) => alive && setArt(d))
      .catch(() => toast.error("Resim yüklenemedi"));
    return () => {
      alive = false;
    };
  }, [meta.id]);

  // ------------------------------------------------------------ kaydetme
  const flush = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    setSaveState("saving");
    const r = await saveColoring(meta.id, latest.current.fills, latest.current.strokes);
    setSaveState(r.ok ? "saved" : "error");
    if (!r.ok) toast.error(r.error ?? "Kaydedilemedi");
  }, [meta.id]);

  const commit = useCallback(
    (next: Snap) => {
      const prev = latest.current;
      latest.current = next;
      setPast((p) => [...p.slice(-80), prev]);
      setFuture([]);
      setSnap(next);
      setSaveState("dirty");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flush, 1400);
    },
    [flush],
  );

  useEffect(() => {
    const onHide = () => {
      if (document.hidden && saveTimer.current) flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (saveTimer.current) flush();
    };
  }, [flush]);

  function undo() {
    if (!past.length) return;
    setFuture((f) => [latest.current, ...f]);
    setSnap(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setSaveState("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 1400);
  }
  function redo() {
    if (!future.length) return;
    setPast((p) => [...p, latest.current]);
    setSnap(future[0]);
    setFuture((f) => f.slice(1));
    setSaveState("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 1400);
  }

  function pickColor(c: string) {
    setColor(c);
    if (tool === "eraser") setTool("fill");
    setRecent((r) => [c, ...r.filter((x) => x !== c)].slice(0, 8));
  }

  // ------------------------------------------------------------ türetilmiş katmanlar
  const layers = useMemo(() => {
    if (!art) return null;
    let unlocked = "";
    let locked = "";
    let nextSec = "";
    art.regions.forEach((d, i) => {
      const s = art.sections[i];
      if (s < open) unlocked += d;
      else {
        locked += d;
        if (s === open) nextSec += d;
      }
    });
    return { unlocked, locked, nextSec, outline: art.regions.join("") };
  }, [art, open]);

  const total = art?.regions.length ?? meta.regions;
  const filled = Object.keys(snap.fills).length;

  // ------------------------------------------------------------ etkileşim
  function svgPoint(e: React.PointerEvent) {
    const svg = svgRef.current!;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y] as const;
  }

  function onPointerDown(e: React.PointerEvent) {
    pointersRef.current.add(e.pointerId);
    downRef.current = { x: e.clientX, y: e.clientY };
    if (tool === "fill" || !art) return;
    if (pointersRef.current.size > 1) {
      // iki parmak: yakınlaştırma; çizimi iptal et
      drawingRef.current = false;
      setLive(null);
      return;
    }
    const pt = svgPoint(e);
    if (!pt) return;
    drawingRef.current = true;
    pointsRef.current = [pt[0], pt[1]];
    setLiveW((size * Math.max(art.w, art.h)) / 1000 / Math.sqrt(zoomRef.current?.state.scale ?? 1));
    setLive(`M${pt[0].toFixed(1)} ${pt[1].toFixed(1)}l0 0`);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drawingRef.current || tool === "fill") return;
    const pt = svgPoint(e);
    if (!pt) return;
    const pts = pointsRef.current;
    const lx = pts[pts.length - 2];
    const ly = pts[pts.length - 1];
    const scale = zoomRef.current?.state.scale ?? 1;
    if (Math.hypot(pt[0] - lx, pt[1] - ly) < 1.5 / scale) return;
    pts.push(pt[0], pt[1]);
    setLive(pathFrom(pts));
  }

  function onPointerUp(e: React.PointerEvent) {
    pointersRef.current.delete(e.pointerId);
    const down = downRef.current;
    const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 99;
    if (drawingRef.current && tool !== "fill") {
      drawingRef.current = false;
      const pts = pointsRef.current;
      setLive(null);
      if (pts.length >= 2) {
        const scale = zoomRef.current?.state.scale ?? 1;
        const w = (size * (art ? Math.max(art.w, art.h) / 1000 : 1)) / Math.sqrt(scale);
        const d = pts.length === 2 ? `M${pts[0].toFixed(1)} ${pts[1].toFixed(1)}l0.1 0` : pathFrom(pts);
        commit({ ...latest.current, strokes: [...latest.current.strokes, { c: tool === "eraser" ? PAPER : color, w, d }] });
      }
      // silgi ile kısa dokunuş: bölgenin dolgusunu da sil
      if (tool === "eraser" && moved < 6) eraseRegionAt(e);
      return;
    }
    if (tool === "fill" && moved < 8) fillAt(e);
  }

  function regionIndexAt(e: React.PointerEvent) {
    const el = document.elementFromPoint(e.clientX, e.clientY) as SVGElement | null;
    const idx = el?.getAttribute?.("data-i");
    return idx == null ? null : Number(idx);
  }

  function fillAt(e: React.PointerEvent) {
    if (!art) return;
    const i = regionIndexAt(e);
    if (i === null) return;
    if (art.sections[i] >= open) {
      const need = art.sections[i] + 1;
      toast(`Bu bölge ${need - open === 1 ? "bir sonraki" : `${need - open} emek sonraki`} bölümde açılacak 🔒`, {
        description: "Takvimden görev ya da küçük emek tamamlayınca açılır.",
      });
      return;
    }
    if (latest.current.fills[i] === color) return;
    commit({ ...latest.current, fills: { ...latest.current.fills, [i]: color } });
  }

  function eraseRegionAt(e: React.PointerEvent) {
    const i = regionIndexAt(e);
    if (i === null || !latest.current.fills[i]) return;
    const fills = { ...latest.current.fills };
    delete fills[i];
    commit({ ...latest.current, fills });
  }

  async function download() {
    if (!svgRef.current || !art) return;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.querySelector("[data-locked]")?.remove();
    clone.querySelector("[data-next]")?.remove();
    clone.setAttribute("width", String(art.w));
    clone.setAttribute("height", String(art.h));
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    await img.decode();
    const scale = 2;
    const pad = 60;
    const cv = document.createElement("canvas");
    cv.width = art.w * scale + pad * 2;
    cv.height = art.h * scale + pad * 2 + 70;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#f3e7d1";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, pad, pad, art.w * scale, art.h * scale);
    ctx.fillStyle = "#2e2019";
    ctx.font = "italic 600 34px 'Fraunces Variable', Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText("aeternum", cv.width - pad, cv.height - 40);
    ctx.textAlign = "left";
    ctx.font = "500 36px Caveat, cursive";
    ctx.fillText(art.title, pad, cv.height - 40);
    const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/png"));
    if (blob) await shareOrDownload(blob, `aeternum-${art.id}.png`, art.title);
  }

  const palette = PALETTES[paletteIdx];
  const sw = art ? Math.max(art.w, art.h) / 520 : 2;

  return (
    <div className="fixed inset-x-0 bottom-[62px] top-[57px] z-30 flex flex-col bg-paper md:bottom-0">
      {/* üst çubuk */}
      <div className="flex items-center gap-2 border-b border-ink/8 bg-paper/90 px-3 py-2">
        <Link href="/boyama" className="rounded-full p-2 hover:bg-paper-2" aria-label="Geri">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="display truncate text-lg leading-tight">{meta.title}</h1>
          <p className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span>
              {open}/{meta.sections} bölüm · %{Math.round((filled / total) * 100)}
            </span>
            <span aria-live="polite" className="inline-flex items-center gap-1">
              {saveState === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
              {saveState === "saved" && <Check className="h-3 w-3 text-cam" />}
              {saveState === "error" && <span className="text-bordo">kaydedilemedi</span>}
            </span>
          </p>
        </div>
        <IconBtn label="Geri al" onClick={undo} disabled={!past.length}>
          <Undo2 className="h-5 w-5" />
        </IconBtn>
        <IconBtn label="İleri al" onClick={redo} disabled={!future.length}>
          <Redo2 className="h-5 w-5" />
        </IconBtn>
        <IconBtn label="İndir" onClick={download} disabled={!art}>
          <Download className="h-5 w-5" />
        </IconBtn>
      </div>

      {/* tuval */}
      <div className="relative min-h-0 flex-1 touch-none select-none bg-[radial-gradient(ellipse_at_center,#f8eedc,#efe1c6)]">
        {!art || !layers ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-latte" />
          </div>
        ) : (
          <TransformWrapper
            ref={zoomRef}
            minScale={1}
            maxScale={10}
            centerOnInit
            doubleClick={{ disabled: true }}
            panning={{ disabled: tool !== "fill", velocityDisabled: true }}
            wheel={{ step: 0.12 }}
            pinch={{ step: 6 }}
          >
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${art.w} ${art.h}`}
                xmlns="http://www.w3.org/2000/svg"
                className={cn("h-full w-full p-3", tool === "fill" ? "cursor-pointer" : "cursor-crosshair")}
                preserveAspectRatio="xMidYMid meet"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={(e) => {
                  pointersRef.current.delete(e.pointerId);
                  drawingRef.current = false;
                  setLive(null);
                }}
              >
                <defs>
                  <clipPath id="unlocked">
                    <path d={layers.unlocked} />
                  </clipPath>
                  <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="14" height="14" fill="#efe2c9" />
                    <line x1="0" y1="0" x2="0" y2="14" stroke="#cdb894" strokeWidth="3.5" />
                  </pattern>
                </defs>
                <rect width={art.w} height={art.h} fill={PAPER} />
                <g>
                  {art.regions.map((d, i) => (
                    <path key={i} d={d} data-i={i} fill={snap.fills[i] ?? PAPER} />
                  ))}
                </g>
                <g clipPath="url(#unlocked)" pointerEvents="none">
                  {snap.strokes.map((s, i) => (
                    <path key={i} d={s.d} stroke={s.c} strokeWidth={s.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                  {live && (
                    <path
                      d={live}
                      stroke={tool === "eraser" ? PAPER : color}
                      strokeWidth={liveW}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
                {layers.locked && (
                  <path data-locked d={layers.locked} fill="url(#hatch)" opacity={0.82} pointerEvents="none" />
                )}
                {layers.nextSec && (
                  <path
                    data-next
                    d={layers.nextSec}
                    fill="rgba(226,134,59,.12)"
                    stroke="#e2863b"
                    strokeWidth={sw * 1.4}
                    strokeDasharray={`${sw * 4} ${sw * 3}`}
                    pointerEvents="none"
                  />
                )}
                {art.ink ? (
                  <path d={art.ink} fill="#1d1620" fillRule="evenodd" pointerEvents="none" />
                ) : (
                  <path d={layers.outline} fill="none" stroke="#2e2019" strokeWidth={sw} strokeLinejoin="round" pointerEvents="none" />
                )}
                {art.lines && (
                  <path d={art.lines} fill="none" stroke="#2e2019" strokeWidth={sw * 0.8} strokeLinecap="round" pointerEvents="none" />
                )}
              </svg>
            </TransformComponent>
          </TransformWrapper>
        )}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <IconBtn label="Yakınlaştır" onClick={() => zoomRef.current?.zoomIn(0.5)} floating>
            <ZoomIn className="h-4.5 w-4.5" />
          </IconBtn>
          <IconBtn label="Uzaklaştır" onClick={() => zoomRef.current?.zoomOut(0.5)} floating>
            <ZoomOut className="h-4.5 w-4.5" />
          </IconBtn>
          <IconBtn label="Sığdır" onClick={() => zoomRef.current?.resetTransform()} floating>
            <Maximize className="h-4.5 w-4.5" />
          </IconBtn>
        </div>
        {open < meta.sections && (
          <Link
            href="/takvim"
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-3/95 px-3 py-1.5 text-xs shadow-[var(--shadow-paper)]"
          >
            <Lock className="h-3.5 w-3.5 text-mum" /> Turuncu kesikli alan bir sonraki emekte açılır
          </Link>
        )}
      </div>

      {/* araç çubuğu */}
      <div className="border-t border-ink/10 bg-paper-3/95 px-3 pb-3 pt-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-ink/12 bg-paper p-0.5">
              <ToolBtn active={tool === "fill"} onClick={() => setTool("fill")} label="Kova">
                <PaintBucket className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn active={tool === "brush"} onClick={() => setTool("brush")} label="Fırça">
                <Brush className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")} label="Silgi">
                <Eraser className="h-4 w-4" />
              </ToolBtn>
            </div>
            {tool !== "fill" ? (
              <label className="flex flex-1 items-center gap-2 text-xs text-ink-soft">
                <span className="hidden sm:inline">Kalınlık</span>
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="flex-1 accent-[#7a1f2b]"
                  aria-label="Fırça kalınlığı"
                />
                <span className="inline-block rounded-full bg-ink" style={{ width: size / 2 + 4, height: size / 2 + 4 }} />
              </label>
            ) : (
              <select
                value={paletteIdx}
                onChange={(e) => setPaletteIdx(Number(e.target.value))}
                className="field !w-auto flex-1 !rounded-full !py-1.5 !text-sm"
                aria-label="Palet"
              >
                {PALETTES.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <label
              className="relative h-9 w-9 shrink-0 cursor-pointer rounded-full border-2 border-paper-3 shadow-[0_0_0_1px_rgba(46,32,25,.25)]"
              style={{ background: color }}
              title="Özel renk"
            >
              <input
                type="color"
                value={color}
                onChange={(e) => pickColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Özel renk seç"
              />
              <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-paper-3 text-[10px] shadow">
                +
              </span>
            </label>
          </div>
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5">
            {palette.colors.map((c) => (
              <Swatch key={c} c={c} active={c === color && tool !== "eraser"} onClick={() => pickColor(c)} />
            ))}
            {recent.filter((c) => !palette.colors.includes(c)).length > 0 && <span className="mx-1 h-6 w-px shrink-0 bg-ink/15" />}
            {recent
              .filter((c) => !palette.colors.includes(c))
              .map((c) => (
                <Swatch key={"r" + c} c={c} small active={c === color && tool !== "eraser"} onClick={() => pickColor(c)} />
              ))}
          </div>
        </div>
      </div>
      {effort < 2 && (
        <p className="sr-only">Henüz sadece hediye bölüm açık. Görev yaptıkça yeni bölümler açılır.</p>
      )}
    </div>
  );
}

function pathFrom(pts: number[]) {
  let d = `M${pts[0].toFixed(1)} ${pts[1].toFixed(1)}`;
  // yumuşak çizgi: orta noktalardan ikinci derece eğri
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2;
    const my = (pts[i + 1] + pts[i + 3]) / 2;
    d += `Q${pts[i].toFixed(1)} ${pts[i + 1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const n = pts.length;
  d += `L${pts[n - 2].toFixed(1)} ${pts[n - 1].toFixed(1)}`;
  return d;
}

function Swatch({ c, active, onClick, small }: { c: string; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Renk ${c}`}
      className={cn(
        "shrink-0 rounded-full border border-ink/15 transition-transform",
        small ? "h-7 w-7" : "h-9 w-9",
        active && "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-paper-3",
      )}
      style={{ background: c }}
    />
  );
}

function ToolBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-ink text-paper-3" : "text-ink-soft hover:text-ink",
      )}
      aria-pressed={active}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  floating,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  floating?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-full p-2 text-ink transition-colors disabled:opacity-35",
        floating ? "border border-ink/10 bg-paper-3/95 shadow-[var(--shadow-paper)]" : "hover:bg-paper-2",
      )}
    >
      {children}
    </button>
  );
}
