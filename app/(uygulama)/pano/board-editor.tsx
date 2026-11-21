"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Group, Image as KImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  BringToFront,
  Camera,
  Check,
  Copy,
  Download,
  Loader2,
  Palette,
  Pencil,
  Redo2,
  SendToBack,
  Smartphone,
  Sparkles,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { saveBoard } from "@/app/actions/board";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import { shareOrDownload } from "@/lib/share";
import { BACKGROUNDS, drawBackground, makeBackgroundCanvas, type BgKind } from "@/lib/board/backgrounds";
import {
  BOARD_H,
  BOARD_W,
  EMPTY_BOARD,
  EXPORTS,
  FONTS,
  INK_COLORS,
  NOTE_COLORS,
  STICKERS,
  TAPE_COLORS,
  type Board,
  type BoardItem,
  type FontKey,
  type NoteItem,
  type PhotoItem,
  type TapeItem,
  type TextItem,
} from "@/lib/board/types";
import { cn } from "@/lib/utils";

const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------- resim yükleme
const imgCache = new Map<string, HTMLImageElement>();
function useImg(src: string | null | undefined) {
  const [loaded, setLoaded] = useState<{ src: string; img: HTMLImageElement } | null>(null);
  useEffect(() => {
    if (!src || imgCache.has(src)) return;
    const im = new window.Image();
    if (!src.startsWith("blob:") && !src.startsWith("/")) im.crossOrigin = "anonymous";
    im.onload = () => {
      imgCache.set(src, im);
      setLoaded({ src, img: im });
    };
    im.src = src;
  }, [src]);
  if (!src) return null;
  return imgCache.get(src) ?? (loaded?.src === src ? loaded.img : null);
}

// ---------------------------------------------------------------- yardımcı şekiller
function tornPoints(w: number, h: number, seed: number, edges: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean }) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts: number[] = [];
  const step = 14;
  const amp = 7;
  for (let x = 0; x <= w; x += step) pts.push(x, edges.top ? r() * amp : 0);
  for (let y = 0; y <= h; y += step) pts.push(w - (edges.right ? r() * amp : 0), y);
  for (let x = w; x >= 0; x -= step) pts.push(x, h - (edges.bottom ? r() * amp : 0));
  for (let y = h; y >= 0; y -= step) pts.push(edges.left ? r() * amp : 0, y);
  return pts;
}

function hashSeed(id: string) {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h;
}

const patternCache = new Map<string, HTMLCanvasElement>();
function tapePattern(color: string, pattern: TapeItem["pattern"]) {
  const key = color + pattern;
  const hit = patternCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 24;
  const g = c.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 24, 24);
  g.fillStyle = "rgba(255,255,255,.38)";
  if (pattern === "stripe") {
    g.beginPath();
    g.moveTo(0, 24);
    g.lineTo(12, 0);
    g.lineTo(20, 0);
    g.lineTo(8, 24);
    g.fill();
    g.beginPath();
    g.moveTo(24, 12);
    g.lineTo(24, 24);
    g.lineTo(18, 24);
    g.fill();
  } else if (pattern === "dots") {
    g.beginPath();
    g.arc(6, 6, 3, 0, 7);
    g.arc(18, 18, 3, 0, 7);
    g.fill();
  } else if (pattern === "grid") {
    g.fillRect(0, 0, 24, 2);
    g.fillRect(0, 0, 2, 24);
  }
  patternCache.set(key, c);
  return c;
}

// ---------------------------------------------------------------- öğeler
type ItemProps = {
  item: BoardItem;
  urls: Record<string, string>;
  onSelect: () => void;
  onChange: (patch: Partial<BoardItem>) => void;
  onEdit: () => void;
};

function itemSize(item: BoardItem): [number, number] {
  switch (item.type) {
    case "photo": {
      const pad = item.frame === "polaroid" ? item.w * 0.06 : item.frame === "plain" ? 14 : 0;
      const bottom = item.frame === "polaroid" ? item.w * 0.24 : pad;
      return [item.w + pad * 2, item.h + pad + bottom];
    }
    case "sticker":
      return [item.size, item.size];
    case "text":
      return [item.width, item.size * 1.3 * Math.max(1, item.text.split("\n").length)];
    case "tape":
      return [item.w, 46];
    case "note":
      return [item.w, item.h];
  }
}

function ItemNode({ item, urls, onSelect, onChange, onEdit }: ItemProps) {
  const [w, h] = itemSize(item);
  const common = {
    id: item.id,
    x: item.x,
    y: item.y,
    rotation: item.rot,
    scaleX: item.scale,
    scaleY: item.scale,
    offsetX: w / 2,
    offsetY: h / 2,
    draggable: true,
    onMouseDown: onSelect,
    onTouchStart: onSelect,
    onDblClick: onEdit,
    onDblTap: onEdit,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onChange({ x: e.target.x(), y: e.target.y() }),
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const n = e.target;
      onChange({ x: n.x(), y: n.y(), rot: n.rotation(), scale: Math.max(0.15, Math.min(6, n.scaleX())) });
    },
  };
  switch (item.type) {
    case "photo":
      return (
        <Group {...common}>
          <PhotoBody item={item} url={urls[item.path]} />
        </Group>
      );
    case "sticker":
      return (
        <Group {...common}>
          <StickerBody item={item} />
        </Group>
      );
    case "text": {
      const f = FONTS[item.font];
      return (
        <Group {...common}>
          <Rect width={w} height={h} fill="transparent" />
          <Text
            text={item.text}
            width={item.width}
            fontFamily={f.family}
            fontStyle={f.style}
            fontSize={item.size}
            fill={item.color}
            align="center"
            lineHeight={1.15}
            shadowColor="rgba(0,0,0,.25)"
            shadowBlur={item.color === "#fbf6ea" || item.color === "#ffffff" ? 8 : 0}
          />
        </Group>
      );
    }
    case "tape": {
      const pts = tornPoints(item.w, 46, hashSeed(item.id), { left: true, right: true });
      return (
        <Group {...common} opacity={0.88}>
          <Line points={pts} closed fillPatternImage={tapePattern(item.color, item.pattern) as unknown as HTMLImageElement} shadowColor="rgba(0,0,0,.18)" shadowBlur={3} shadowOffsetY={1} />
        </Group>
      );
    }
    case "note": {
      const pts = tornPoints(item.w, item.h, hashSeed(item.id), { top: true });
      const f = FONTS[item.font];
      return (
        <Group {...common}>
          <Line points={pts} closed fill={item.color} shadowColor="rgba(40,20,10,.35)" shadowBlur={14} shadowOffsetY={6} />
          <Text
            text={item.text}
            x={30}
            y={34}
            width={item.w - 60}
            height={item.h - 60}
            fontFamily={f.family}
            fontStyle={f.style}
            fontSize={item.font === "caveat" ? 46 : 38}
            fill="#2e2019"
            lineHeight={1.2}
            verticalAlign="middle"
            align="center"
          />
        </Group>
      );
    }
  }
}

function PhotoBody({ item, url }: { item: PhotoItem; url?: string }) {
  const img = useImg(url);
  const pad = item.frame === "polaroid" ? item.w * 0.06 : item.frame === "plain" ? 14 : 0;
  const bottom = item.frame === "polaroid" ? item.w * 0.24 : pad;
  const W = item.w + pad * 2;
  const H = item.h + pad + bottom;
  // görseli kırparak (cover) yerleştir
  let crop: { x: number; y: number; width: number; height: number } | undefined;
  if (img) {
    const ir = img.width / img.height;
    const fr = item.w / item.h;
    crop = ir > fr ? { x: (img.width - img.height * fr) / 2, y: 0, width: img.height * fr, height: img.height } : { x: 0, y: (img.height - img.width / fr) / 2, width: img.width, height: img.width / fr };
  }
  if (item.frame === "torn") {
    const pts = tornPoints(W, H, hashSeed(item.id), { top: true, bottom: true, left: true, right: true });
    return (
      <>
        <Line points={pts} closed fill="#fffdf7" shadowColor="rgba(40,20,10,.35)" shadowBlur={12} shadowOffsetY={5} />
        <Group
          clipFunc={(ctx) => {
            ctx.beginPath();
            ctx.moveTo(pts[0] + 6, pts[1] + 6);
            for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] * 0.985 + 7, pts[i + 1] * 0.985 + 7);
            ctx.closePath();
          }}
        >
          {img ? <KImage image={img} width={W} height={H} crop={crop} /> : <Rect width={W} height={H} fill="#e6d9bf" />}
        </Group>
      </>
    );
  }
  return (
    <>
      <Rect width={W} height={H} fill="#fffdf7" cornerRadius={2} shadowColor="rgba(40,20,10,.38)" shadowBlur={16} shadowOffsetY={7} />
      {img ? <KImage image={img} x={pad} y={pad} width={item.w} height={item.h} crop={crop} /> : <Rect x={pad} y={pad} width={item.w} height={item.h} fill="#e6d9bf" />}
      {item.frame === "polaroid" && item.caption && (
        <Text
          text={item.caption}
          x={pad}
          y={item.h + pad + bottom * 0.18}
          width={item.w}
          height={bottom * 0.7}
          fontFamily="Caveat"
          fontStyle="700"
          fontSize={Math.max(28, item.w * 0.085)}
          fill="#2e2019"
          align="center"
          verticalAlign="middle"
        />
      )}
    </>
  );
}

function StickerBody({ item }: { item: { name: string; size: number } }) {
  const img = useImg(`/stickers/${item.name}.svg`);
  return img ? (
    <KImage image={img} width={item.size} height={item.size} shadowColor="rgba(40,20,10,.35)" shadowBlur={10} shadowOffsetY={4} />
  ) : (
    <Rect width={item.size} height={item.size} />
  );
}

// ---------------------------------------------------------------- ana bileşen
export default function BoardEditor({
  initial,
  urls: initialUrls,
  userId,
}: {
  initial: Board | null;
  urls: Record<string, string>;
  userId: string;
}) {
  const [board, setBoard] = useState<Board>(() => initial ?? structuredClone(EMPTY_BOARD));
  const [past, setPast] = useState<Board[]>([]);
  const [future, setFuture] = useState<Board[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [urls, setUrls] = useState(initialUrls);
  const [panel, setPanel] = useState<null | "sticker" | "bg" | "export" | "edit">(null);
  const [guide, setGuide] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [busy, setBusy] = useState(false);
  const [box, setBox] = useState({ w: 360, h: 640 });

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const bgLayerRef = useRef<Konva.Layer>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(board);
  useLayoutEffect(() => {
    latest.current = board;
  }, [board]);

  // ------------------------------------------------------------ boyut
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.min((box.w - 16) / BOARD_W, (box.h - 16) / BOARD_H);
  const sw = BOARD_W * scale;
  const sh = BOARD_H * scale;

  // ------------------------------------------------------------ fontlar hazır olunca yeniden çiz
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    Promise.all(
      Object.values(FONTS).map((f) => document.fonts.load(`${f.style === "normal" ? "" : f.style} 40px "${f.family}"`).catch(() => null)),
    ).then(() => setFontsReady(true));
  }, []);

  // ------------------------------------------------------------ arka plan
  const bgCanvas = useMemo(
    () => (typeof document === "undefined" ? null : makeBackgroundCanvas(board.bg, BOARD_W, BOARD_H, 1)),
    [board.bg],
  );

  // ------------------------------------------------------------ seçim
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selected ? stageRef.current?.findOne("#" + selected) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selected, board, fontsReady]);

  // ------------------------------------------------------------ kaydetme
  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setSaveState("saving");
    const r = await saveBoard(latest.current);
    setSaveState(r.ok ? "saved" : "dirty");
    if (!r.ok) toast.error(r.error ?? "Kaydedilemedi");
  }, []);

  useEffect(() => {
    const onHide = () => document.hidden && timer.current && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (timer.current) flush();
    };
  }, [flush]);

  const commit = useCallback(
    (next: Board) => {
      const prev = latest.current;
      latest.current = next;
      setPast((p) => [...p.slice(-60), prev]);
      setFuture([]);
      setBoard(next);
      setSaveState("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 1500);
    },
    [flush],
  );

  const update = (id: string, patch: Partial<BoardItem>) =>
    commit({ ...latest.current, items: latest.current.items.map((i) => (i.id === id ? ({ ...i, ...patch } as BoardItem) : i)) });

  function add(item: BoardItem) {
    commit({ ...latest.current, items: [...latest.current.items, item] });
    setSelected(item.id);
  }

  function undo() {
    if (!past.length) return;
    setFuture((f) => [latest.current, ...f]);
    setBoard(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setSaveState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1500);
  }
  function redo() {
    if (!future.length) return;
    setPast((p) => [...p, latest.current]);
    setBoard(future[0]);
    setFuture((f) => f.slice(1));
    setSaveState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1500);
  }

  const sel = board.items.find((i) => i.id === selected) ?? null;
  const center = () => ({ x: BOARD_W / 2 + (Math.random() - 0.5) * 160, y: BOARD_H * 0.42 + (Math.random() - 0.5) * 300 });

  // ------------------------------------------------------------ ekleme işlemleri
  async function addPhoto(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressImage(file, 1400, 0.8);
      const id = uid();
      const path = `${userId}/pano/${id}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await createClient().storage.from("uploads").upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      const local = URL.createObjectURL(blob);
      const im = new window.Image();
      im.src = local;
      await im.decode();
      const max = 520;
      const k = max / Math.max(im.width, im.height);
      setUrls((u) => ({ ...u, [path]: local }));
      add({
        id,
        type: "photo",
        path,
        w: Math.round(im.width * k),
        h: Math.round(im.height * k),
        frame: "polaroid",
        caption: "",
        ...center(),
        rot: (Math.random() - 0.5) * 10,
        scale: 1,
      });
    } catch {
      toast.error("Fotoğraf eklenemedi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addText() {
    const it: TextItem = { id: uid(), type: "text", text: "yeni yazı", font: "caveat", color: board.bg === "gece" || board.bg === "cam" ? "#fbf6ea" : "#2e2019", size: 90, width: 760, ...center(), rot: 0, scale: 1 };
    add(it);
    setPanel("edit");
  }
  function addNote() {
    const it: NoteItem = { id: uid(), type: "note", w: 420, h: 360, color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)], text: "bir dilek...", font: "caveat", ...center(), rot: (Math.random() - 0.5) * 12, scale: 1 };
    add(it);
    setPanel("edit");
  }
  function addTape() {
    const it: TapeItem = { id: uid(), type: "tape", w: 240, color: TAPE_COLORS[Math.floor(Math.random() * TAPE_COLORS.length)], pattern: (["stripe", "dots", "plain", "grid"] as const)[Math.floor(Math.random() * 4)], ...center(), rot: (Math.random() - 0.5) * 40, scale: 1 };
    add(it);
  }

  function removeSelected() {
    if (!sel) return;
    if (sel.type === "photo") createClient().storage.from("uploads").remove([sel.path]).catch(() => null);
    commit({ ...board, items: board.items.filter((i) => i.id !== sel.id) });
    setSelected(null);
  }
  function duplicate() {
    if (!sel) return;
    if (sel.type === "photo") return toast("Fotoğrafı tekrar eklemek için yeniden yükle.");
    add({ ...sel, id: uid(), x: sel.x + 40, y: sel.y + 40 });
  }
  function reorder(front: boolean) {
    if (!sel) return;
    const rest = board.items.filter((i) => i.id !== sel.id);
    commit({ ...board, items: front ? [...rest, sel] : [sel, ...rest] });
  }

  // ------------------------------------------------------------ dışa aktarma
  async function exportAs(w: number, h: number, name: string) {
    const stage = stageRef.current;
    if (!stage) return;
    setBusy(true);
    setSelected(null);
    await new Promise((r) => setTimeout(r, 60));
    try {
      trRef.current?.nodes([]);
      bgLayerRef.current?.hide();
      guideLayerRef.current?.hide();
      const k = Math.min(w / BOARD_W, h / BOARD_H);
      const items = stage.toCanvas({ pixelRatio: k / scale });
      bgLayerRef.current?.show();
      if (guide) guideLayerRef.current?.show();
      const out = document.createElement("canvas");
      out.width = w;
      out.height = h;
      const ctx = out.getContext("2d")!;
      drawBackground(ctx, board.bg, w, h, k);
      ctx.drawImage(items, (w - BOARD_W * k) / 2, (h - BOARD_H * k) / 2, BOARD_W * k, BOARD_H * k);
      // küçük imza
      ctx.font = `italic 600 ${Math.round(22 * k)}px "Fraunces Variable", Georgia, serif`;
      ctx.fillStyle = board.bg === "gece" || board.bg === "cam" ? "rgba(251,246,234,.55)" : "rgba(46,32,25,.45)";
      ctx.textAlign = "right";
      ctx.fillText("aeternum", w - 26 * k, h - 26 * k - (h > w * 1.6 ? 40 * k : 0));
      const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/png"));
      if (!blob) throw new Error();
      await shareOrDownload(blob, `aeternum-dilek-panosu-${name}.png`, "Dilek panom");
      setPanel(null);
    } catch {
      bgLayerRef.current?.show();
      toast.error("İndirilemedi. Fotoğraflar yüklendikten sonra tekrar dene.");
    } finally {
      setBusy(false);
    }
  }

  const dark = board.bg === "gece" || board.bg === "cam";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-paper">
      {/* üst çubuk */}
      <div className="flex items-center gap-1.5 border-b border-white/[.06] bg-paper/90 px-3 py-2 pt-[max(.5rem,env(safe-area-inset-top))]">
        <Link href="/takvim" className="rounded-full p-2 hover:bg-white/5" aria-label="Geri">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="display text-xl leading-tight">Duvar kağıdı stüdyosu</h1>
          <p className="flex items-center gap-1 text-xs text-ink-soft">
            {saveState === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : saveState === "saved" ? <Check className="h-3 w-3 text-cam" /> : null}
            {saveState === "saved" ? "kaydedildi" : saveState === "saving" ? "kaydediliyor" : "değişiklik var"}
          </p>
        </div>
        <TopBtn label="Geri al" onClick={undo} disabled={!past.length}>
          <Undo2 className="h-5 w-5" />
        </TopBtn>
        <TopBtn label="İleri al" onClick={redo} disabled={!future.length}>
          <Redo2 className="h-5 w-5" />
        </TopBtn>
        <TopBtn label="Kilit ekranı önizleme" onClick={() => setGuide((g) => !g)} active={guide}>
          <Smartphone className="h-5 w-5" />
        </TopBtn>
        <button className="btn btn-primary ml-1 !px-3.5 !py-2 text-sm" onClick={() => setPanel("export")}>
          <Download className="h-4 w-4" /> İndir
        </button>
      </div>

      {/* tuval */}
      <div ref={wrapRef} className="relative flex min-h-0 flex-1 touch-none items-center justify-center bg-[radial-gradient(ellipse_at_center,#16213f,#070b16)]">
        <div className="overflow-hidden rounded-[18px] shadow-[0_20px_50px_-20px_rgba(46,32,25,.6)]" style={{ width: sw, height: sh }}>
          <Stage
            ref={stageRef}
            width={sw}
            height={sh}
            scaleX={scale}
            scaleY={scale}
            onMouseDown={(e) => e.target === e.target.getStage() || e.target.name() === "bg" ? setSelected(null) : undefined}
            onTouchStart={(e) => (e.target === e.target.getStage() || e.target.name() === "bg" ? setSelected(null) : undefined)}
          >
            <Layer ref={bgLayerRef} listening>
              {bgCanvas && <KImage name="bg" image={bgCanvas as unknown as HTMLImageElement} width={BOARD_W} height={BOARD_H} />}
            </Layer>
            <Layer key={fontsReady ? "f" : "n"}>
              {board.items.map((it) => (
                <ItemNode
                  key={it.id}
                  item={it}
                  urls={urls}
                  onSelect={() => setSelected(it.id)}
                  onChange={(p) => update(it.id, p)}
                  onEdit={() => {
                    setSelected(it.id);
                    if (it.type !== "sticker" && it.type !== "tape") setPanel("edit");
                  }}
                />
              ))}
              <Transformer
                ref={trRef}
                rotateEnabled
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                anchorSize={22}
                anchorCornerRadius={11}
                anchorStroke="#7a1f2b"
                anchorFill="#fbf6ea"
                borderStroke="#7a1f2b"
                borderDash={[8, 6]}
                rotateAnchorOffset={46}
                rotationSnaps={[0, 90, 180, 270]}
                boundBoxFunc={(o, n) => (n.width < 30 || n.height < 30 ? o : n)}
              />
            </Layer>
            <Layer ref={guideLayerRef} listening={false} visible={guide}>
              <Text text="09:41" x={0} y={250} width={BOARD_W} align="center" fontFamily="Fraunces Variable" fontStyle="600" fontSize={230} fill={dark ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.85)"} shadowColor="rgba(0,0,0,.35)" shadowBlur={14} />
              <Text text="Çarşamba, 31 Aralık" x={0} y={200} width={BOARD_W} align="center" fontSize={46} fontStyle="600" fill="rgba(255,255,255,.85)" shadowColor="rgba(0,0,0,.35)" shadowBlur={10} />
              <Rect x={BOARD_W / 2 - 150} y={BOARD_H - 40} width={300} height={10} cornerRadius={5} fill="rgba(255,255,255,.8)" />
              <Rect x={70} y={BOARD_H - 210} width={110} height={110} cornerRadius={55} fill="rgba(255,255,255,.25)" />
              <Rect x={BOARD_W - 180} y={BOARD_H - 210} width={110} height={110} cornerRadius={55} fill="rgba(255,255,255,.25)" />
            </Layer>
          </Stage>
        </div>

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/40">
            <Loader2 className="h-8 w-8 animate-spin text-bordo" />
          </div>
        )}

        {/* seçili öğe araçları */}
        {sel && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-ink/10 bg-paper-3/95 p-1 shadow-[var(--shadow-lift)]">
            {sel.type !== "sticker" && sel.type !== "tape" && (
              <SelBtn label="Düzenle" onClick={() => setPanel("edit")}>
                <Pencil className="h-4 w-4" />
              </SelBtn>
            )}
            {sel.type === "tape" && (
              <SelBtn
                label="Renk"
                onClick={() => {
                  const i = TAPE_COLORS.indexOf(sel.color);
                  update(sel.id, { color: TAPE_COLORS[(i + 1) % TAPE_COLORS.length] } as Partial<TapeItem>);
                }}
              >
                <Palette className="h-4 w-4" />
              </SelBtn>
            )}
            <SelBtn label="Öne getir" onClick={() => reorder(true)}>
              <BringToFront className="h-4 w-4" />
            </SelBtn>
            <SelBtn label="Arkaya gönder" onClick={() => reorder(false)}>
              <SendToBack className="h-4 w-4" />
            </SelBtn>
            <SelBtn label="Kopyala" onClick={duplicate}>
              <Copy className="h-4 w-4" />
            </SelBtn>
            <SelBtn label="Sil" onClick={removeSelected} danger>
              <Trash2 className="h-4 w-4" />
            </SelBtn>
          </div>
        )}
      </div>

      {/* ekleme çubuğu */}
      <div className="border-t border-ink/10 bg-paper-3/95 px-2 pb-2.5 pt-2 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-2xl justify-between gap-1 overflow-x-auto">
          <AddBtn label="Fotoğraf" onClick={() => fileRef.current?.click()}>
            <Camera className="h-5 w-5" />
          </AddBtn>
          <AddBtn label="Çıkartma" onClick={() => setPanel("sticker")}>
            <Sparkles className="h-5 w-5" />
          </AddBtn>
          <AddBtn label="Yazı" onClick={addText}>
            <Type className="h-5 w-5" />
          </AddBtn>
          <AddBtn label="Not" onClick={addNote}>
            <StickyNote className="h-5 w-5" />
          </AddBtn>
          <AddBtn label="Washi" onClick={addTape}>
            <span className="block h-3 w-6 -rotate-12 rounded-[2px] bg-[repeating-linear-gradient(45deg,#c8922a_0_4px,#e2863b_4px_8px)]" />
          </AddBtn>
          <AddBtn label="Arka plan" onClick={() => setPanel("bg")}>
            <span className="block h-5 w-5 rounded-md border border-ink/20" style={{ background: BACKGROUNDS.find((b) => b.id === board.bg)?.swatch }} />
          </AddBtn>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addPhoto(e.target.files?.[0])} />
      </div>

      {/* paneller */}
      {panel === "sticker" && (
        <Sheet title="Çıkartmalar" onClose={() => setPanel(null)}>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {STICKERS.map((s) => (
              <button
                key={s}
                className="rounded-xl bg-paper-2/60 p-2 transition-transform hover:scale-105 active:scale-95"
                onClick={() => {
                  add({ id: uid(), type: "sticker", name: s, size: 220, ...center(), rot: (Math.random() - 0.5) * 20, scale: 1 });
                  setPanel(null);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/stickers/${s}.svg`} alt={s} className="aspect-square w-full" />
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {panel === "bg" && (
        <Sheet title="Arka plan" onClose={() => setPanel(null)}>
          <div className="grid grid-cols-3 gap-3">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  commit({ ...board, bg: b.id as BgKind });
                  setPanel(null);
                }}
                className={cn("overflow-hidden rounded-xl border-2 text-left", board.bg === b.id ? "border-bordo" : "border-transparent")}
              >
                <BgThumb kind={b.id} />
                <span className="block px-2 py-1.5 text-sm">{b.name}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {panel === "export" && (
        <Sheet title="Panonu indir" onClose={() => setPanel(null)}>
          <p className="-mt-1 mb-3 text-sm text-ink-soft">
            Telefonda &quot;Paylaş&quot; menüsünden <b>Fotoğraflara kaydet</b>, sonra duvar kağıdı yap. Farklı boyutlarda panon ortalanır, kenarlar arka planla dolar.
          </p>
          <div className="grid gap-2">
            {EXPORTS.map((x) => (
              <button
                key={x.id}
                disabled={busy}
                onClick={() => exportAs(x.w, x.h, x.id)}
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper px-4 py-3 text-left hover:bg-paper-2/60"
              >
                <span>
                  <span className="block font-medium">{x.name}</span>
                  <span className="text-xs text-ink-soft">
                    {x.w} × {x.h}
                  </span>
                </span>
                <ArrowDownToLine className="h-5 w-5 text-bordo" />
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {panel === "edit" && sel && (sel.type === "text" || sel.type === "note" || sel.type === "photo") && (
        <EditPanel item={sel} onClose={() => setPanel(null)} onChange={(p) => update(sel.id, p)} />
      )}
    </div>
  );
}


function BgThumb({ kind }: { kind: BgKind }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    drawBackground(c.getContext("2d")!, kind, c.width, c.height, 0.25);
  }, [kind]);
  return <canvas ref={ref} width={180} height={260} className="block aspect-[9/13] w-full" />;
}

function EditPanel({ item, onClose, onChange }: { item: TextItem | NoteItem | PhotoItem; onClose: () => void; onChange: (p: Partial<BoardItem>) => void }) {
  const [text, setText] = useState(item.type === "photo" ? item.caption ?? "" : item.text);
  const apply = (t: string) => {
    setText(t);
    onChange(item.type === "photo" ? { caption: t } : { text: t });
  };
  return (
    <Sheet title={item.type === "photo" ? "Fotoğraf" : item.type === "note" ? "Not kağıdı" : "Yazı"} onClose={onClose}>
      <div className="space-y-4">
        {(item.type !== "photo" || item.frame === "polaroid") && (
          <textarea
            autoFocus
            className="field"
            rows={item.type === "text" ? 2 : 3}
            maxLength={200}
            value={text}
            placeholder={item.type === "photo" ? "polaroid altına not" : ""}
            onChange={(e) => apply(e.target.value)}
          />
        )}
        {item.type === "photo" && (
          <div>
            <span className="label">Çerçeve</span>
            <div className="flex gap-2">
              {(
                [
                  ["polaroid", "Polaroid"],
                  ["plain", "Beyaz kenar"],
                  ["torn", "Yırtık kağıt"],
                ] as const
              ).map(([k, n]) => (
                <Chip key={k} active={item.frame === k} onClick={() => onChange({ frame: k })}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {item.type !== "photo" && (
          <div>
            <span className="label">Yazı tipi</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FONTS) as FontKey[]).map((k) => (
                <Chip key={k} active={item.font === k} onClick={() => onChange({ font: k })}>
                  <span style={{ fontFamily: FONTS[k].family, fontSize: k === "caveat" ? 20 : 16, fontStyle: k === "fraunces" ? "italic" : undefined }}>
                    {FONTS[k].name.split(" (")[0]}
                  </span>
                </Chip>
              ))}
            </div>
          </div>
        )}
        {item.type === "text" && (
          <>
            <div>
              <span className="label">Renk</span>
              <div className="flex flex-wrap gap-2">
                {INK_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onChange({ color: c })}
                    className={cn("h-8 w-8 rounded-full border border-ink/20", item.color === c && "ring-2 ring-ink ring-offset-2")}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <label className="block">
              <span className="label">Boyut</span>
              <input type="range" min={40} max={260} value={item.size} onChange={(e) => onChange({ size: Number(e.target.value) })} className="w-full accent-[#7a1f2b]" />
            </label>
          </>
        )}
        {item.type === "note" && (
          <div>
            <span className="label">Kağıt rengi</span>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ color: c })}
                  className={cn("h-8 w-8 rounded-md border border-ink/20", item.color === c && "ring-2 ring-ink ring-offset-2")}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        )}
        <button className="btn btn-primary w-full" onClick={onClose}>
          Tamam
        </button>
      </div>
    </Sheet>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/35 backdrop-blur-[2px] sm:items-center" onClick={onClose}>
      <div
        className="safe-bottom max-h-[78dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper-3 p-5 shadow-[var(--shadow-lift)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-2xl">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-paper-2" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("rounded-full border px-3.5 py-1.5 text-sm", active ? "border-champagne/50 bg-champagne/15 text-gold" : "border-white/10 bg-white/[.03]")}
    >
      {children}
    </button>
  );
}

function TopBtn({ label, onClick, disabled, active, children }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("rounded-full p-2 transition-colors disabled:opacity-35", active ? "bg-ink text-paper-3" : "hover:bg-paper-2")}
    >
      {children}
    </button>
  );
}

function SelBtn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cn("rounded-full p-2.5 hover:bg-paper-2", danger && "text-bordo")}>
      {children}
    </button>
  );
}

function AddBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[0.7rem] font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
      <span className="flex h-6 items-center">{children}</span>
      {label}
    </button>
  );
}
