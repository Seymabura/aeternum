"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  BringToFront,
  Download,
  Frame,
  ImagePlus,
  LayoutGrid,
  Library,
  Loader2,
  Palette,
  Redo2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Search,
  SendToBack,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { addVision, deleteVision, setVisionBg, updateVision, type VisionFont, type VisionItem, type VisionLayout } from "@/app/actions/extras";
import { isSticker, VISION_CATS, VISION_LIBRARY, VISION_STICKERS, type VisionCat } from "@/lib/vision-library";
import { applyTemplate, BGS, BH, BW, CLOCK_SAFE, FONT_CSS, FONT_LABEL, fontStyle, TEXT_COLORS, maxZ, photoMeta, renderBoard, TEMPLATES, TONES, VISION_EXPORTS, wordFontSize } from "@/lib/vision/board";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import { shareOrDownload } from "@/lib/share";
import { cn } from "@/lib/utils";

type Tab = "foto" | "sus" | "yazi" | "arka" | "duzen";
type Gesture =
  | { kind: "move"; id: string; sx: number; sy: number; l0: VisionLayout }
  | { kind: "scale"; id: string; cx: number; cy: number; d0: number; l0: VisionLayout; free: boolean }
  | { kind: "rotate"; id: string; cx: number; cy: number; a0: number; l0: VisionLayout }
  | { kind: "pinch"; id: string; d0: number; a0: number; l0: VisionLayout };

const MIN = 90;
const SNAP = 14;

export function VisionStudio({ initial, urls: initialUrls, userId, bg: initialBg }: { initial: VisionItem[]; urls: Record<string, string>; userId: string; bg: string }) {
  // düzeni olmayan eski parçalar kolaja yerleşir
  const [items, setItems] = useState<VisionItem[]>(() => {
    const missing = initial.filter((i) => !i.layout);
    if (!missing.length) return initial;
    const lay = applyTemplate(initial, "kolaj");
    return initial.map((i) => (i.layout ? i : { ...i, layout: lay[i.id] }));
  });
  const [urls, setUrls] = useState(initialUrls);
  const [bg, setBg] = useState(BGS[initialBg] ? initialBg : "sampanya");
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("foto");
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ v: boolean; h: boolean }>({ v: false, h: false });
  const [scale, setScale] = useState(0.3);
  const [hist, setHist] = useState<{ past: Record<string, VisionLayout>[]; future: Record<string, VisionLayout>[] }>({ past: [], future: [] });
  const stage = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dirty = useRef(new Set<string>());
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // ilk açılışta eski parçaların yeni düzenini kaydet
  useEffect(() => {
    initial.filter((i) => !i.layout).forEach((i) => dirty.current.add(i.id));
    flushSoon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BW));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const srcOf = useCallback((it: VisionItem) => (it.src?.startsWith("/") ? it.src : it.src ? urls[it.src] : undefined), [urls]);
  const selected = items.find((i) => i.id === sel) ?? null;

  // ------------------------------------------------------------ kayıt ve geçmiş
  function flushSoon() {
    if (saveT.current) clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      const ids = [...dirty.current];
      dirty.current.clear();
      for (const id of ids) {
        const it = itemsRef.current.find((i) => i.id === id);
        if (it?.layout) void updateVision(id, { layout: it.layout });
      }
    }, 700);
  }
  const snapshot = () => Object.fromEntries(itemsRef.current.map((i) => [i.id, i.layout!]));
  function commit(before: Record<string, VisionLayout>) {
    setHist((h) => ({ past: [...h.past.slice(-40), before], future: [] }));
  }
  function setLayouts(map: Record<string, VisionLayout>) {
    setItems((xs) => xs.map((i) => (map[i.id] ? { ...i, layout: map[i.id] } : i)));
    Object.keys(map).forEach((id) => dirty.current.add(id));
    flushSoon();
  }
  function patch(id: string, p: Partial<VisionLayout>, record = true) {
    const before = snapshot();
    setItems((xs) => xs.map((i) => (i.id === id ? { ...i, layout: { ...i.layout!, ...p } } : i)));
    dirty.current.add(id);
    flushSoon();
    if (record) commit(before);
  }
  function undo() {
    const prev = hist.past.at(-1);
    if (!prev) return;
    const now = snapshot();
    setLayouts(prev);
    setHist({ past: hist.past.slice(0, -1), future: [now, ...hist.future] });
  }
  function redo() {
    const next = hist.future[0];
    if (!next) return;
    const now = snapshot();
    setLayouts(next);
    setHist({ past: [...hist.past, now], future: hist.future.slice(1) });
  }

  // ------------------------------------------------------------ ekleme
  async function add(input: Parameters<typeof addVision>[0], at?: { x: number; y: number }) {
    if (itemsRef.current.length >= 60) return void toast.error("Pano dolu (60 parça).");
    const r = await addVision(input);
    if (!r.ok) return void toast.error(r.error);
    setItems((x) => [...x, r.item]);
    setSel(r.item.id);
    if (at && r.item.layout) {
      // bırakılan noktaya ortala
      const l = r.item.layout;
      patch(r.item.id, { x: Math.round(at.x - l.w / 2), y: Math.round(at.y - l.h / 2) }, false);
    }
  }
  function placeFor(aspect: number, w = 540, frame: VisionLayout["frame"] = "beyaz"): VisionLayout {
    const h = Math.round(w * aspect);
    const n = itemsRef.current.length;
    return {
      x: Math.round((BW - w) / 2 + ((n * 47) % 120) - 60),
      y: Math.round(Math.max(CLOCK_SAFE, BH * 0.46 - h / 2) + ((n * 71) % 160) - 80),
      w,
      h,
      r: ((n * 29) % 7) - 3,
      z: maxZ(itemsRef.current) + 1,
      frame,
      font: "serif",
    };
  }
  function addPhoto(src: string, at?: { x: number; y: number }) {
    const m = photoMeta(src);
    const sticker = isSticker(src);
    void add({ kind: "image", src, size: "s", layout: placeFor(m ? m.h / m.w : 1.3, sticker ? 260 : 540, sticker ? "yok" : "beyaz") }, at);
  }
  async function upload(f?: File) {
    if (!f) return;
    setBusy("Fotoğraf yükleniyor");
    try {
      const blob = await compressImage(f, 1600, 0.84);
      const bmp = await createImageBitmap(blob);
      const aspect = bmp.height / bmp.width;
      bmp.close();
      const path = `${userId}/vision/${crypto.randomUUID()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await createClient().storage.from("uploads").upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      setUrls((u) => ({ ...u, [path]: URL.createObjectURL(blob) }));
      await add({ kind: "image", src: path, size: "m", layout: placeFor(aspect) });
      setSheet(false);
    } catch {
      toast.error("Fotoğraf eklenemedi. Tekrar dene.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function remove(id: string) {
    setItems((x) => x.filter((y) => y.id !== id));
    setSel(null);
    const r = await deleteVision(id);
    if (!r.ok) toast.error("Silinemedi.");
  }
  function layer(id: string, dir: 1 | -1) {
    const zs = itemsRef.current.map((i) => i.layout!.z);
    patch(id, { z: dir === 1 ? Math.max(...zs) + 1 : Math.min(...zs) - 1 < 0 ? 0 : Math.min(...zs) - 1 });
  }

  // ------------------------------------------------------------ hareket
  const toBoard = (cx: number, cy: number) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * BW, y: ((cy - r.top) / r.height) * BH };
  };

  function onDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const target = e.target as HTMLElement;
    const handle = target.closest<HTMLElement>("[data-handle]")?.dataset.handle;
    const id = target.closest<HTMLElement>("[data-item]")?.dataset.item ?? (handle ? sel : null);
    stage.current?.setPointerCapture(e.pointerId);
    // iki parmak: seçili parçayı büyüt/döndür
    if (pointers.current.size === 2 && sel) {
      const [a, b] = [...pointers.current.values()];
      const it = itemsRef.current.find((i) => i.id === sel);
      if (it?.layout) gesture.current = { kind: "pinch", id: sel, d0: Math.hypot(a.x - b.x, a.y - b.y), a0: Math.atan2(b.y - a.y, b.x - a.x), l0: { ...it.layout } };
      return;
    }
    if (!id) {
      setSel(null);
      gesture.current = null;
      return;
    }
    const it = itemsRef.current.find((i) => i.id === id);
    if (!it?.layout) return;
    setSel(id);
    const p = toBoard(e.clientX, e.clientY);
    const l = it.layout;
    const cx = l.x + l.w / 2;
    const cy = l.y + l.h / 2;
    if (handle === "scale") gesture.current = { kind: "scale", id, cx, cy, d0: Math.hypot(p.x - cx, p.y - cy), l0: { ...l }, free: e.shiftKey };
    else if (handle === "rotate") gesture.current = { kind: "rotate", id, cx, cy, a0: Math.atan2(p.y - cy, p.x - cx), l0: { ...l } };
    else gesture.current = { kind: "move", id, sx: p.x, sy: p.y, l0: { ...l } };
    histBefore.current = snapshot();
  }
  const histBefore = useRef<Record<string, VisionLayout> | null>(null);
  const moved = useRef(false);

  function onMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    let next: VisionLayout | null = null;
    if (g.kind === "pinch") {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const k = Math.hypot(a.x - b.x, a.y - b.y) / g.d0;
      const ang = Math.atan2(b.y - a.y, b.x - a.x) - g.a0;
      const w = Math.max(MIN, g.l0.w * k);
      const h = (w / g.l0.w) * g.l0.h;
      next = { ...g.l0, w, h, x: g.l0.x + (g.l0.w - w) / 2, y: g.l0.y + (g.l0.h - h) / 2, r: g.l0.r + (ang * 180) / Math.PI };
    } else {
      const p = toBoard(e.clientX, e.clientY);
      if (g.kind === "move") {
        let x = g.l0.x + (p.x - g.sx);
        let y = g.l0.y + (p.y - g.sy);
        const cx = x + g.l0.w / 2;
        const cy = y + g.l0.h / 2;
        const v = Math.abs(cx - BW / 2) < SNAP;
        const h = Math.abs(cy - BH / 2) < SNAP;
        if (v) x = BW / 2 - g.l0.w / 2;
        if (h) y = BH / 2 - g.l0.h / 2;
        setGuides({ v, h });
        next = { ...g.l0, x, y };
      } else if (g.kind === "scale") {
        if (g.free || e.shiftKey) {
          // serbest: köşeden genişlik ve yükseklik ayrı (kırpma oranı değişir)
          const rad = (-g.l0.r * Math.PI) / 180;
          const dx = p.x - g.cx;
          const dy = p.y - g.cy;
          const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
          const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
          const w = Math.max(MIN, Math.abs(lx) * 2);
          const h = Math.max(MIN, Math.abs(ly) * 2);
          next = { ...g.l0, w, h, x: g.cx - w / 2, y: g.cy - h / 2 };
        } else {
          const k = Math.hypot(p.x - g.cx, p.y - g.cy) / Math.max(1, g.d0);
          const w = Math.max(MIN, g.l0.w * k);
          const h = (w / g.l0.w) * g.l0.h;
          next = { ...g.l0, w, h, x: g.cx - w / 2, y: g.cy - h / 2 };
        }
      } else if (g.kind === "rotate") {
        let r = g.l0.r + ((Math.atan2(p.y - g.cy, p.x - g.cx) - g.a0) * 180) / Math.PI;
        r = ((r + 540) % 360) - 180;
        if (Math.abs(r) < 3) r = 0;
        next = { ...g.l0, r };
      }
    }
    if (next) {
      moved.current = true;
      const n = next;
      const id = g.id;
      setItems((xs) => xs.map((i) => (i.id === id ? { ...i, layout: n } : i)));
    }
  }

  function onUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0 && gesture.current?.kind === "pinch") return;
    const g = gesture.current;
    gesture.current = null;
    setGuides({ v: false, h: false });
    if (g && moved.current) {
      const it = itemsRef.current.find((i) => i.id === g.id);
      if (it?.layout) {
        const l = it.layout;
        setItems((xs) => xs.map((i) => (i.id === g.id ? { ...i, layout: { ...l, x: Math.round(l.x), y: Math.round(l.y), w: Math.round(l.w), h: Math.round(l.h), r: Math.round(l.r * 10) / 10 } } : i)));
      }
      dirty.current.add(g.id);
      flushSoon();
      if (histBefore.current) commit(histBefore.current);
    }
    moved.current = false;
  }

  // klavye: ok tuşlarıyla taşı, +/- ile büyüt, Delete ile sil, Ctrl+Z geri al
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (!sel) return;
      const it = itemsRef.current.find((i) => i.id === sel);
      if (!it?.layout) return;
      const l = it.layout;
      const step = e.shiftKey ? 40 : 8;
      const map: Record<string, Partial<VisionLayout>> = {
        ArrowLeft: { x: l.x - step },
        ArrowRight: { x: l.x + step },
        ArrowUp: { y: l.y - step },
        ArrowDown: { y: l.y + step },
      };
      if (map[e.key]) {
        e.preventDefault();
        patch(sel, map[e.key]);
      } else if (e.key === "+" || e.key === "=" || e.key === "-") {
        e.preventDefault();
        const k = e.key === "-" ? 0.94 : 1.06;
        const w = Math.max(MIN, l.w * k);
        const h = (w / l.w) * l.h;
        patch(sel, { w: Math.round(w), h: Math.round(h), x: Math.round(l.x + (l.w - w) / 2), y: Math.round(l.y + (l.h - h) / 2) });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        void remove(sel);
      } else if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ------------------------------------------------------------ dışa aktar
  async function exportAs(id: (typeof VISION_EXPORTS)[number]["id"]) {
    const spec = VISION_EXPORTS.find((x) => x.id === id)!;
    setBusy("Duvar kağıdı hazırlanıyor");
    try {
      const blob = await renderBoard(itemsRef.current, bg, srcOf, spec.w, spec.h);
      await shareOrDownload(blob, `aeternum-vision-${spec.id}.png`, "Vision board");
    } catch {
      toast.error("İndirilemedi. Tekrar dener misin?");
    } finally {
      setBusy(null);
    }
  }

  const sorted = useMemo(() => [...items].sort((a, b) => (a.layout?.z ?? 0) - (b.layout?.z ?? 0)), [items]);
  const ink = BGS[bg]?.ink ?? "#f3eee6";

  const panel = (
    <StudioPanel
      tab={tab}
      setTab={setTab}
      onPhoto={(src) => {
        addPhoto(src);
        setSheet(false);
      }}
      onUpload={() => fileRef.current?.click()}
      editing={selected?.kind === "word" ? selected : null}
      onWord={async (w) => {
        if (selected?.kind === "word") {
          // seçili yazıyı güncelle
          const id = selected.id;
          setItems((xs) => xs.map((i) => (i.id === id ? { ...i, text: w.text, tone: w.tone, layout: { ...i.layout!, font: w.font, c: w.c || undefined, caps: w.caps || undefined } } : i)));
          const it = itemsRef.current.find((i) => i.id === id)!;
          await updateVision(id, { text: w.text, tone: w.tone, layout: { ...it.layout!, font: w.font, c: w.c || undefined, caps: w.caps || undefined } });
          toast.success("Yazı güncellendi");
        } else {
          const width = Math.min(860, Math.max(380, w.text.length * (w.caps ? 58 : 46)));
          await add({ kind: "word", text: w.text, tone: w.tone, size: "s", layout: { ...placeFor(w.tone === "yazi" ? 0.34 : 0.42, width, "yok"), r: 0, font: w.font, c: w.c || undefined, caps: w.caps || undefined } });
        }
        setSheet(false);
      }}
      bg={bg}
      onBg={(b) => {
        setBg(b);
        void setVisionBg(b);
      }}
      onTemplate={(t) => {
        if (!items.length) return void toast("Önce panoya birkaç fotoğraf ekle.");
        const before = snapshot();
        setLayouts(applyTemplate(itemsRef.current, t));
        commit(before);
        setSheet(false);
      }}
    />
  );

  return (
    <div>
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display text-[2.75rem] leading-[1] sm:text-[4rem]">Vision board</h1>
          <p className="mt-4 max-w-lg text-ink-soft">Gelecek yılını fotoğraflarla ve kelimelerle kur. Parçaları sürükle, köşeden büyüt, üstteki noktadan döndür. Bitince telefonuna duvar kağıdı yap.</p>
        </div>
        <ExportMenu disabled={!!busy || items.length === 0} onPick={exportAs} />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="flex flex-col items-center">
          {/* üst araç çubuğu */}
          <div className="mb-4 flex w-full max-w-[460px] items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <IconBtn label="Geri al" onClick={undo} disabled={!hist.past.length}>
                <Undo2 className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="İleri al" onClick={redo} disabled={!hist.future.length}>
                <Redo2 className="h-4 w-4" />
              </IconBtn>
            </div>
            <span className="num text-xs text-ink-mute">{items.length}/60 parça</span>
          </div>

          {/* pano */}
          <div
            ref={stage}
            className="vb-stage relative w-full max-w-[460px] touch-none select-none overflow-hidden rounded-[34px] border border-white/10 shadow-[0_60px_120px_-50px_rgba(0,0,0,1),0_0_0_8px_rgba(14,13,18,0.9),0_0_0_9px_rgba(220,199,161,0.14)]"
            style={{ aspectRatio: `${BW} / ${BH}`, background: BGS[bg]?.css, ["--s" as string]: scale }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const src = e.dataTransfer.getData("text/vision");
              if (src) addPhoto(src, toBoard(e.clientX, e.clientY));
            }}
            role="application"
            aria-label="Vision board panosu. Bir parçayı seçip ok tuşlarıyla taşıyabilir, artı ve eksiyle büyütüp küçültebilirsin."
          >
            {BGS[bg]?.stars && <div aria-hidden className="night-stars pointer-events-none absolute inset-0 opacity-70" />}
            {/* kilit ekranı saati alanı */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center pt-[7%] opacity-[.18]" style={{ height: `${(CLOCK_SAFE / BH) * 100}%`, color: ink }}>
              <span className="text-[calc(var(--s)*40px)]">Cuma 1 Ocak</span>
              <span className="font-semibold leading-none tracking-tight text-[calc(var(--s)*230px)]">9:41</span>
            </div>
            {items.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center" style={{ color: ink }}>
                <p className="display text-[1.8rem] italic">Panon boş</p>
                <p className="mt-2 text-sm opacity-70">Kütüphaneden bir fotoğraf seç ya da buraya sürükle.</p>
              </div>
            )}
            {guides.v && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-nar-soft/80" style={{ zIndex: 9998 }} />}
            {guides.h && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-nar-soft/80" style={{ zIndex: 9998 }} />}

            {sorted.map((it) => {
              const l = it.layout!;
              const isSel = sel === it.id;
              return (
                <div
                  key={it.id}
                  data-item={it.id}
                  role="button"
                  tabIndex={0}
                  aria-label={it.kind === "word" ? `Yazı: ${it.text}` : photoMeta(it.src)?.alt ?? "Fotoğraf"}
                  aria-pressed={isSel}
                  onFocus={() => setSel(it.id)}
                  className="absolute cursor-grab outline-none active:cursor-grabbing"
                  style={{
                    left: `${(l.x / BW) * 100}%`,
                    top: `${(l.y / BH) * 100}%`,
                    width: `${(l.w / BW) * 100}%`,
                    height: `${(l.h / BH) * 100}%`,
                    transform: `rotate(${l.r}deg)`,
                    zIndex: l.z + 1,
                  }}
                >
                  <Piece it={it} src={srcOf(it)} bgInk={ink} />
                  {isSel && (
                    <>
                      <span aria-hidden className="pointer-events-none absolute -inset-[3px] rounded-[6px] border-[1.5px] border-champagne shadow-[0_0_0_1px_rgba(0,0,0,.4)]" />
                      <span aria-hidden className="pointer-events-none absolute -top-7 left-1/2 h-6 w-px -translate-x-1/2 bg-champagne" />
                      <span
                        data-handle="rotate"
                        aria-hidden
                        className="absolute -top-10 left-1/2 grid h-7 w-7 -translate-x-1/2 cursor-alias place-items-center rounded-full border border-champagne bg-[#0b0a10]"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-champagne" />
                      </span>
                      <span data-handle="scale" aria-hidden className="absolute -bottom-3 -right-3 h-6 w-6 cursor-nwse-resize rounded-full border-2 border-[#0b0a10] bg-champagne shadow" />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* seçili parça araçları */}
          <div className="mt-5 flex min-h-12 w-full max-w-[460px] flex-wrap items-center justify-center gap-1 rounded-full border border-white/[.08] bg-[rgba(14,13,18,0.6)] p-1 backdrop-blur-xl">
            {selected ? (
              <>
                <IconBtn label="Öne getir" onClick={() => layer(selected.id, 1)}>
                  <BringToFront className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Arkaya gönder" onClick={() => layer(selected.id, -1)}>
                  <SendToBack className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Sola döndür" onClick={() => patch(selected.id, { r: Math.round((selected.layout?.r ?? 0) - 10) })}>
                  <RotateCcw className="h-4 w-4" />
                </IconBtn>
                <IconBtn label="Sağa döndür" onClick={() => patch(selected.id, { r: Math.round((selected.layout?.r ?? 0) + 10) })}>
                  <RotateCw className="h-4 w-4" />
                </IconBtn>
                {selected.kind === "image" ? (
                  isSticker(selected.src) ? null : (
                    <TextBtn
                      label={{ beyaz: "Çerçeveli", polaroid: "Polaroid", keskin: "Keskin", yok: "Çerçevesiz" }[selected.layout?.frame ?? "yok"]}
                      icon={Frame}
                      onClick={() => {
                        const order = ["beyaz", "polaroid", "keskin", "yok"] as const;
                        const cur = order.indexOf(selected.layout?.frame ?? "yok");
                        patch(selected.id, { frame: order[(cur + 1) % order.length] });
                      }}
                    />
                  )
                ) : (
                  <TextBtn
                    label="Yazıyı düzenle"
                    icon={Type}
                    onClick={() => {
                      setTab("yazi");
                      if (window.matchMedia("(max-width: 1023px)").matches) setSheet(true);
                    }}
                  />
                )}
                {selected.layout?.r ? (
                  <TextBtn label="Düzelt" icon={Undo2} onClick={() => patch(selected.id, { r: 0 })} />
                ) : null}
                <IconBtn label="Sil" onClick={() => remove(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </>
            ) : (
              <p className="px-4 text-sm text-ink-mute">Düzenlemek için bir parçaya dokun.</p>
            )}
          </div>

          {/* telefon: panel düğmeleri */}
          <div className="mt-4 grid w-full max-w-[460px] grid-cols-5 gap-1.5 lg:hidden">
            {(
              [
                { t: "foto", label: "Fotoğraf", icon: Library },
                { t: "sus", label: "Süs", icon: Sparkles },
                { t: "yazi", label: "Yazı", icon: Type },
                { t: "arka", label: "Tema", icon: Palette },
                { t: "duzen", label: "Düzen", icon: LayoutGrid },
              ] as const
            ).map(({ t, label, icon: Icon }) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setSheet(true);
                }}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[16px] border border-white/[.08] bg-[rgba(14,13,18,0.6)] text-xs text-ink-soft"
              >
                <Icon className="h-5 w-5 text-champagne" /> {label}
              </button>
            ))}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex max-h-[calc(100dvh-7.5rem)] flex-col rounded-[26px] border border-white/[.08] bg-[rgba(10,9,13,0.72)] p-5 backdrop-blur-xl">{panel}</div>
        </aside>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />

      {sheet && (
        <div className="fixed inset-0 z-[70] flex items-end bg-[rgba(2,2,3,0.6)] backdrop-blur-sm lg:hidden" onClick={() => setSheet(false)}>
          <div className="safe-bottom flex h-[78dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0c0b0f] p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Pano araçları">
            <div className="mb-3 flex justify-end">
              <button onClick={() => setSheet(false)} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}

      {busy && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-[rgba(2,2,3,0.65)] backdrop-blur-sm" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-champagne" />
          <p className="text-sm text-ink-soft">{busy}</p>
        </div>
      )}
    </div>
  );
}

function Piece({ it, src, bgInk }: { it: VisionItem; src?: string; bgInk: string }) {
  const l = it.layout!;
  if (it.kind === "image" && isSticker(it.src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={it.src!} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-[0_calc(var(--s)*8px)_calc(var(--s)*14px)_rgba(0,0,0,.35)]" />;
  }
  if (it.kind === "image") {
    const img = src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
    ) : (
      <span className="shimmer block h-full w-full" />
    );
    if (l.frame === "beyaz")
      return (
        <div className="h-full w-full rounded-[calc(var(--s)*6px)] bg-[#fbf9f4] shadow-[0_calc(var(--s)*10px)_calc(var(--s)*26px)_rgba(0,0,0,.4)]" style={{ padding: `calc(var(--s) * ${Math.min(l.w, l.h) * 0.035}px)` }}>
          <div className="h-full w-full overflow-hidden rounded-[calc(var(--s)*3px)]">{img}</div>
        </div>
      );
    if (l.frame === "polaroid")
      return (
        <div className="h-full w-full bg-[#faf7f1] shadow-[0_calc(var(--s)*14px)_calc(var(--s)*36px)_rgba(0,0,0,.45)]" style={{ padding: `${(l.w * 0.045 * 100) / l.h}% 4.5% ${(l.w * 0.16 * 100) / l.h}%` }}>
          <div className="h-full w-full overflow-hidden">{img}</div>
        </div>
      );
    return <div className={cn("h-full w-full overflow-hidden", l.frame === "keskin" ? "" : "rounded-[calc(var(--s)*16px)]")}>{img}</div>;
  }
  const tone = TONES[it.tone ?? "gece"] ?? TONES.gece;
  const font = l.font ?? "serif";
  const fs = wordFontSize(it.text ?? "", l.w, l.h, font, l.caps);
  const st = fontStyle(font);
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-[calc(var(--s)*18px)] px-[6%] text-center leading-[1.08]"
      style={{
        background: tone.bg ?? "transparent",
        color: l.c || (it.tone === "yazi" ? bgInk : tone.fg),
        fontFamily: FONT_CSS[font],
        fontStyle: st.italic ? "italic" : "normal",
        fontWeight: st.weight,
        fontSize: `calc(var(--s) * ${fs}px)`,
        textTransform: l.caps ? "uppercase" : undefined,
        letterSpacing: l.caps ? "0.12em" : undefined,
      }}
    >
      {it.text}
    </div>
  );
}

function StudioPanel({
  tab,
  setTab,
  onPhoto,
  onUpload,
  onWord,
  editing,
  bg,
  onBg,
  onTemplate,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onPhoto: (src: string) => void;
  onUpload: () => void;
  onWord: (w: WordSpec) => Promise<void>;
  editing: VisionItem | null;
  bg: string;
  onBg: (b: string) => void;
  onTemplate: (t: (typeof TEMPLATES)[number]["id"]) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 grid shrink-0 grid-cols-5 gap-1 rounded-full border border-white/[.08] bg-black/30 p-1" role="tablist">
        {(
          [
            ["foto", "Fotoğraf"],
            ["sus", "Süs"],
            ["yazi", "Yazı"],
            ["arka", "Tema"],
            ["duzen", "Düzen"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("min-h-9 rounded-full text-[0.8rem] transition-colors", tab === t ? "bg-champagne text-[#1a1408]" : "text-ink-soft hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-2">
      {tab === "foto" && <PhotoTab onPhoto={onPhoto} onUpload={onUpload} />}
      {tab === "sus" && (
        <div>
          <p className="mb-4 text-sm text-ink-soft">Dokun ya da panoya sürükle. Süsleri de büyütüp döndürebilirsin.</p>
          <div className="grid grid-cols-4 gap-2">
            {VISION_STICKERS.map((v) => (
              <button
                key={v.src}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/vision", v.src)}
                onClick={() => onPhoto(v.src)}
                title={v.alt}
                aria-label={`${v.alt} süsünü ekle`}
                className="grid aspect-square place-items-center rounded-[14px] border border-white/[.06] bg-white/[.03] p-2.5 transition-colors hover:border-champagne/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.src} alt="" className="h-full w-full object-contain" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}
      {tab === "yazi" && <WordTab key={editing?.id ?? "yeni"} onWord={onWord} editing={editing} bg={bg} />}
      {tab === "arka" && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(BGS).map(([k, b]) => (
            <button key={k} onClick={() => onBg(k)} aria-pressed={bg === k} className="text-center text-xs text-ink-soft">
              <span className={cn("block aspect-[9/16] rounded-[14px] border-2", bg === k ? "border-champagne" : "border-white/10")} style={{ background: b.css }} />
              <span className="mt-1.5 block">{b.label}</span>
            </button>
          ))}
        </div>
      )}
      {tab === "duzen" && (
        <div>
          <p className="mb-4 text-sm text-ink-soft">Panodaki parçaları tek dokunuşla yerleştir. Sonra istediğin gibi oynatabilirsin; beğenmezsen geri al.</p>
          <div className="grid grid-cols-3 gap-2.5">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => onTemplate(t.id)} className="rounded-[16px] border border-white/10 bg-white/[.02] p-3 text-left text-sm transition-colors hover:border-champagne/40">
                <TemplateGlyph id={t.id} />
                <span className="mt-2 block text-ink">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

const GLYPH_ITEMS: VisionItem[] = Array.from({ length: 7 }, (_, i) => ({
  id: `g${i}`,
  kind: i === 6 ? "word" : "image",
  src: null,
  text: i === 6 ? "2027" : null,
  tone: null,
  size: "m",
  layout: null,
}));

function TemplateGlyph({ id }: { id: (typeof TEMPLATES)[number]["id"] }) {
  const lay = useMemo(() => applyTemplate(GLYPH_ITEMS, id), [id]);
  return (
    <svg viewBox={`0 0 ${BW} ${BH}`} className="h-28 w-full" aria-hidden>
      <rect x="8" y="8" width={BW - 16} height={BH - 16} rx="110" className="fill-black/30 stroke-white/15" strokeWidth="10" />
      {Object.entries(lay).map(([k, l]) => (
        <rect
          key={k}
          x={l.x}
          y={l.y}
          width={l.w}
          height={l.h}
          rx="18"
          transform={`rotate(${l.r} ${l.x + l.w / 2} ${l.y + l.h / 2})`}
          className={k === "g6" ? "fill-nar-soft/50" : "fill-champagne/30 stroke-champagne/70"}
          strokeWidth="10"
        />
      ))}
    </svg>
  );
}

function PhotoTab({ onPhoto, onUpload }: { onPhoto: (src: string) => void; onUpload: () => void }) {
  const [cat, setCat] = useState<VisionCat | "hepsi">("hepsi");
  const [q, setQ] = useState("");
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    VISION_LIBRARY.forEach((v) => (c[v.cat] = (c[v.cat] ?? 0) + 1));
    return c;
  }, []);
  const list = VISION_LIBRARY.filter((v) => (cat === "hepsi" || v.cat === cat) && (!q.trim() || v.alt.toLocaleLowerCase("tr").includes(q.trim().toLocaleLowerCase("tr")) || VISION_CATS[v.cat].toLocaleLowerCase("tr").includes(q.trim().toLocaleLowerCase("tr"))));
  return (
    <div>
      <button onClick={onUpload} className="btn btn-ghost btn-sm mb-4 w-full">
        <ImagePlus className="h-4 w-4" /> Kendi fotoğrafını yükle
      </button>
      <label className="relative mb-3 block">
        <span className="sr-only">Fotoğraf ara</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara: Paris, çiçek, mezuniyet..." className="field !pl-10 !py-2.5 text-sm" />
      </label>
      <div className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {(["hepsi", ...Object.keys(VISION_CATS)] as (VisionCat | "hepsi")[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={cn("min-h-9 shrink-0 rounded-full border px-3.5 text-[0.8rem] transition-colors", cat === c ? "border-champagne/60 bg-champagne/10 text-gold" : "border-white/10 text-ink-soft hover:text-ink")}
          >
            {c === "hepsi" ? "Hepsi" : VISION_CATS[c]} <span className="num text-ink-mute">{c === "hepsi" ? VISION_LIBRARY.length : counts[c]}</span>
          </button>
        ))}
      </div>
      <div className="columns-3 gap-2 [&>*]:mb-2">
        {list.map((v) => (
          <button
            key={v.src}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/vision", v.src)}
            onClick={() => onPhoto(v.src)}
            className="group relative block w-full overflow-hidden rounded-[12px] border border-white/[.06]"
            style={{ aspectRatio: `${v.w} / ${v.h}` }}
            title={v.alt}
          >
            <Image src={v.src} alt={v.alt} fill sizes="130px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-5 text-left text-[0.65rem] text-white/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Panoya ekle
            </span>
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="py-8 text-center text-sm text-ink-mute">Bu aramayla eşleşen fotoğraf yok.</p>}
      <p className="mt-3 text-center text-xs text-ink-mute">Fotoğrafı panoya sürükleyebilir ya da dokunarak ekleyebilirsin.</p>
    </div>
  );
}

type WordSpec = { text: string; tone: string; font: VisionFont; c: string; caps: boolean };

const IDEAS: Record<string, string[]> = {
  Kelimeler: ["huzur", "cesaret", "bolluk", "özgürlük", "aşk", "sağlık", "denge", "şükür", "2027"],
  Olumlamalar: ["Hak ettiğim her şey bana geliyor", "Kendime nazik davranıyorum", "Her gün biraz daha güçlüyüm", "Bolluk ve bereket içindeyim", "Sevilmeyi hak ediyorum"],
  Hedefler: ["Yeni şehirler görmek", "Mezun oluyorum", "Hayalimdeki iş", "Kendi arabam", "Sağlıklı bir beden", "Kendi evim"],
  Başlıklar: ["2027 benim yılım", "Vision board 2027", "Hayallerim gerçek oluyor", "Bu yıl, benim yılım"],
};

function WordTab({ onWord, editing, bg }: { onWord: (w: WordSpec) => Promise<void>; editing: VisionItem | null; bg: string }) {
  const [text, setText] = useState(editing?.text ?? "");
  const [tone, setTone] = useState(editing?.tone ?? "yazi");
  const [font, setFont] = useState<VisionFont>(editing?.layout?.font ?? "serif");
  const [c, setC] = useState(editing?.layout?.c ?? "");
  const [caps, setCaps] = useState(!!editing?.layout?.caps);
  const [group, setGroup] = useState("Kelimeler");
  const [pending, start] = useTransition();
  const t = TONES[tone] ?? TONES.yazi;
  const st = fontStyle(font);
  const color = c || (tone === "yazi" ? BGS[bg]?.ink ?? "#f3eee6" : t.fg);
  return (
    <div>
      {editing && <p className="mb-3 rounded-[12px] border border-champagne/25 bg-champagne/[.06] px-3 py-2 text-xs text-gold">Seçili yazıyı düzenliyorsun. Yeni yazı eklemek için panoda boş bir yere dokun.</p>}
      {/* önizleme: panonun temasının üstünde */}
      <div className="mb-4 flex aspect-[2.2/1] items-center justify-center overflow-hidden rounded-[18px] border border-white/[.06] p-4 text-center" style={{ background: BGS[bg]?.css }}>
        <span
          className="max-w-full rounded-[10px] px-4 py-2 leading-tight"
          style={{
            background: t.bg ?? "transparent",
            color,
            fontFamily: FONT_CSS[font],
            fontStyle: st.italic ? "italic" : "normal",
            fontWeight: st.weight,
            fontSize: text.length > 24 ? "1.35rem" : "2rem",
            textTransform: caps ? "uppercase" : undefined,
            letterSpacing: caps ? "0.12em" : undefined,
          }}
        >
          {text || "huzur"}
        </span>
      </div>
      <textarea className="field resize-none" rows={2} value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder="Bir kelime, bir hedef ya da bir cümle" aria-label="Yazı" />
      <div className="mt-1 text-right text-[0.7rem] text-ink-mute num">{text.length}/80</div>

      <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto">
        {Object.keys(IDEAS).map((g) => (
          <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g} className={cn("min-h-8 shrink-0 rounded-full px-3 text-[0.78rem]", group === g ? "bg-white/10 text-ink" : "text-ink-mute hover:text-ink")}>
            {g}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {IDEAS[group].map((i) => (
          <button key={i} onClick={() => setText(i)} className="min-h-8 rounded-full border border-white/10 px-3 text-left text-[0.8rem] text-ink-soft hover:border-champagne/40 hover:text-ink">
            {i}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-xs text-ink-mute">Yazı tipi</p>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(FONT_CSS) as VisionFont[]).map((f) => {
          const fs = fontStyle(f);
          return (
            <button
              key={f}
              onClick={() => setFont(f)}
              aria-pressed={font === f}
              className={cn("min-h-12 rounded-[12px] border text-[1.05rem]", font === f ? "border-champagne/60 bg-champagne/[.06] text-gold" : "border-white/10 text-ink-soft hover:text-ink")}
              style={{ fontFamily: FONT_CSS[f], fontStyle: fs.italic ? "italic" : "normal", fontWeight: fs.weight }}
            >
              {FONT_LABEL[f]}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-ink-mute">Renk</p>
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={caps} onChange={(e) => setCaps(e.target.checked)} className="h-4 w-4 accent-[#dcc7a1]" />
          BÜYÜK HARF
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {TEXT_COLORS.map((x) => (
          <button
            key={x.label}
            onClick={() => setC(x.c)}
            aria-label={x.label}
            aria-pressed={c === x.c}
            title={x.label}
            className={cn("grid h-9 w-9 place-items-center rounded-full border-2 text-[0.6rem] text-ink-soft", c === x.c ? "border-champagne" : "border-white/10")}
            style={{ background: x.c || "conic-gradient(#f3eee6, #e2c98f, #9e1b32, #1a1408, #f3eee6)" }}
          >
            {!x.c && <span className="rounded-full bg-black/60 px-1">A</span>}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-xs text-ink-mute">Zemin</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(TONES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setTone(k)}
            aria-label={v.label}
            aria-pressed={tone === k}
            title={v.label}
            className={cn("h-9 w-9 rounded-full border-2", tone === k ? "border-champagne" : "border-white/10")}
            style={{ background: v.bg ?? "repeating-linear-gradient(45deg,#0b0a10 0 4px,#1b1820 4px 8px)" }}
          />
        ))}
      </div>
      <button
        className="btn btn-primary mt-6 w-full"
        disabled={pending || !text.trim()}
        onClick={() =>
          start(async () => {
            await onWord({ text: text.trim(), tone, font, c, caps });
            if (!editing) setText("");
          })
        }
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? "Değişiklikleri kaydet" : "Panoya ekle"}
      </button>
    </div>
  );
}

function ExportMenu({ disabled, onPick }: { disabled: boolean; onPick: (id: (typeof VISION_EXPORTS)[number]["id"]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="btn btn-primary" disabled={disabled} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Download className="h-4 w-4" /> Duvar kağıdı olarak indir
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-[18px] border border-white/10 bg-[#0c0b0f] p-1.5 shadow-[var(--shadow-lift)]" role="menu">
          {VISION_EXPORTS.map((x) => (
            <button
              key={x.id}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onPick(x.id);
              }}
              className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-sm text-ink hover:bg-white/5"
            >
              <span>{x.label}</span>
              <span className="num inline-flex items-center gap-1 text-xs text-ink-mute">
                {x.w}×{x.h} <ArrowDownToLine className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-white/10 hover:text-ink disabled:opacity-30">
      {children}
    </button>
  );
}

function TextBtn({ label, icon: Icon, onClick }: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-[0.8rem] text-ink-soft transition-colors hover:bg-white/10 hover:text-ink">
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
