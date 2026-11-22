"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  BringToFront,
  Check,
  ChevronDown,
  Copy,
  Pencil,
  Plus,
  Save,
  Share2,
  Upload,
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
import { addVision, createBoard, deleteBoard, deleteVision, duplicateBoard, updateBoard, updateVision, type BoardFormat, type VisionBoard, type VisionFont, type VisionItem, type VisionLayout } from "@/app/actions/extras";
import { isSticker, VISION_CATS, VISION_LIBRARY, type VisionCat } from "@/lib/vision-library";
import { applyTemplate, BG_GROUPS, BGS, clockSafe, FONT_CSS, FONT_LABEL, FORMATS, fmtOf, fontStyle, TEXT_COLORS, maxZ, photoMeta, renderBoard, TEMPLATES, TONES, unit, wordFontSize, type FormatDef } from "@/lib/vision/board";
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

type EditorProps = {
  board: VisionBoard;
  initial: VisionItem[];
  urls: Record<string, string>;
  userId: string;
  onItems: (items: VisionItem[]) => void;
  onBg: (bg: string) => void;
  onUrls: (u: Record<string, string>) => void;
  header: React.ReactNode;
};

function BoardEditor({ board, initial, urls: initialUrls, userId, onItems, onBg, onUrls, header }: EditorProps) {
  const f = fmtOf(board.format);
  const BW = f.W;
  const BH = f.H;
  const CLOCK_SAFE = clockSafe(f);
  const U = unit(f);
  // düzeni olmayan eski parçalar kolaja yerleşir
  const [items, setItems] = useState<VisionItem[]>(() => {
    const missing = initial.filter((i) => !i.layout);
    if (!missing.length) return initial;
    const lay = applyTemplate(initial, "kolaj", f);
    return initial.map((i) => (i.layout ? i : { ...i, layout: lay[i.id] }));
  });
  const [urls, setUrls] = useState(initialUrls);
  const [bg, setBg] = useState(BGS[board.bg] ? board.bg : "sampanya");
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("foto");
  const [sheet, setSheet] = useState(false);
  // yalnızca "Yazıyı düzenle" denince düzenleme moduna geçilir
  const [editId, setEditId] = useState<string | null>(null);
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
  // üst bileşen panolar arasında geçişte son hâli bilsin
  useEffect(() => onItems(items), [items, onItems]);
  useEffect(() => onUrls(urls), [urls, onUrls]);
  // pano değişirken bekleyen kayıtları hemen gönder
  useEffect(
    () => () => {
      if (saveT.current) clearTimeout(saveT.current);
      for (const id of dirty.current) {
        const it = itemsRef.current.find((i) => i.id === id);
        if (it?.layout) void updateVision(id, { layout: it.layout });
      }
    },
    [],
  );

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
  }, [BW]);

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
  async function add(input: Omit<Parameters<typeof addVision>[0], "board">, at?: { x: number; y: number }) {
    if (itemsRef.current.length >= 60) return void toast.error("Pano dolu (60 parça).");
    const r = await addVision({ ...input, board: board.id });
    if (!r.ok) return void toast.error(r.error);
    setItems((x) => [...x, r.item]);
    setSel(r.item.id);
    if (at && r.item.layout) {
      // bırakılan noktaya ortala
      const l = r.item.layout;
      patch(r.item.id, { x: Math.round(at.x - l.w / 2), y: Math.round(at.y - l.h / 2) }, false);
    }
  }
  function placeFor(aspect: number, w0 = 540, frame: VisionLayout["frame"] = "beyaz"): VisionLayout {
    const w = Math.round(w0 * U);
    const h = Math.round(w * aspect);
    const n = itemsRef.current.length;
    return {
      x: Math.round((BW - w) / 2 + (((n * 47) % 120) - 60) * U),
      y: Math.round(Math.max(CLOCK_SAFE, BH * 0.46 - h / 2) + (((n * 71) % 160) - 80) * U),
      w,
      h,
      r: ((n * 29) % 7) - 3,
      z: maxZ(itemsRef.current) + 1,
      frame,
      font: "serif",
    };
  }
  function addPhoto(src: string, at?: { x: number; y: number }, aspect?: number) {
    const m = photoMeta(src);
    const sticker = isSticker(src);
    void add({ kind: "image", src, size: "s", layout: placeFor(aspect ?? (m ? m.h / m.w : 1.3), sticker ? 300 : 540, sticker ? "yok" : "beyaz") }, at);
  }
  // kendi süsünü yükle: şeffaf PNG ya da WebP, en fazla 5 MB
  const stickerRef = useRef<HTMLInputElement>(null);
  const [stickers, setStickers] = useState<{ path: string; url: string; aspect: number }[] | null>(null);
  const loadStickers = useCallback(async () => {
    const sb = createClient();
    const { data } = await sb.storage.from("uploads").list(`${userId}/sus`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    const paths = ((data ?? []) as { name: string }[]).filter((o) => o.name && !o.name.startsWith(".")).map((o) => `${userId}/sus/${o.name}`);
    if (!paths.length) return setStickers([]);
    const { data: signed } = await sb.storage.from("uploads").createSignedUrls(paths, 60 * 60 * 6);
    const list = ((signed ?? []) as { path: string | null; signedUrl: string }[]).filter((x) => x.signedUrl && x.path).map((x) => ({ path: x.path!, url: x.signedUrl, aspect: 1 }));
    setUrls((u) => ({ ...Object.fromEntries(list.map((x) => [x.path, x.url])), ...u }));
    setStickers(list);
  }, [userId]);
  async function uploadSticker(file?: File) {
    if (!file) return;
    if (!["image/png", "image/webp"].includes(file.type)) return void toast.error("Süs için arka planı şeffaf bir PNG ya da WebP seç.");
    if (file.size > 5 * 1024 * 1024) return void toast.error("Dosya 5 MB'tan küçük olmalı.");
    setBusy("Süs yükleniyor");
    try {
      const bmp = await createImageBitmap(file);
      const aspect = bmp.height / bmp.width;
      bmp.close();
      const path = `${userId}/sus/${crypto.randomUUID()}.${file.type === "image/webp" ? "webp" : "png"}`;
      const { error } = await createClient().storage.from("uploads").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const url = URL.createObjectURL(file);
      setUrls((u) => ({ ...u, [path]: url }));
      setStickers((s) => [{ path, url, aspect }, ...(s ?? [])]);
      addPhoto(path, undefined, aspect);
      setSheet(false);
    } catch {
      toast.error("Süs yüklenemedi. Tekrar dene.");
    } finally {
      setBusy(null);
      if (stickerRef.current) stickerRef.current.value = "";
    }
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
    const it = itemsRef.current.find((i) => i.id === id);
    if (!it) return;
    setItems((x) => x.filter((y) => y.id !== id));
    setSel(null);
    // yüklenen fotoğraf dosyası geri alınabilsin diye hemen silinmez; parça kaydı silinir, geri alınca yeniden eklenir
    const r = await deleteVision(id);
    if (!r.ok) return void toast.error("Silinemedi.");
    toast("Parça silindi", {
      action: {
        label: "Geri al",
        onClick: async () => {
          const back = await addVision({ board: board.id, kind: it.kind, src: it.src ?? undefined, text: it.text ?? undefined, tone: it.tone ?? undefined, size: it.size, layout: it.layout ?? undefined });
          if (back.ok) setItems((x) => [...x, back.item]);
          else toast.error("Geri alınamadı.");
        },
      },
    });
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
    if (handle === "delete" && sel) {
      pointers.current.delete(e.pointerId);
      void remove(sel);
      return;
    }
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
  async function exportAs(spec: { id: string; w: number; h: number }) {
    setBusy("Görsel hazırlanıyor");
    try {
      const blob = await renderBoard(itemsRef.current, bg, srcOf, spec.w, spec.h, f);
      await shareOrDownload(blob, `aeternum-vision-${board.format}-${spec.id}.png`, "Vision board");
    } catch {
      toast.error("İndirilemedi. Tekrar dener misin?");
    } finally {
      setBusy(null);
    }
  }

  // panonun ekrandaki en geniş hâli: dikeyler dar, yataylar geniş; yükseklik ekranın %74'ünü geçmesin
  const stageMax = f.W >= f.H ? `min(100%, 900px, calc(74vh * ${(f.W / f.H).toFixed(3)}))` : `min(${f.id === "telefon" ? 460 : 560}px, 100%, calc(86vh * ${(f.W / f.H).toFixed(3)}))`;

  async function shareAs(kind: "x" | "story") {
    setBusy("Görsel hazırlanıyor");
    try {
      if (kind === "story") {
        const blob = await renderBoard(itemsRef.current, bg, srcOf, 1080, 1920, f);
        await shareOrDownload(blob, "aeternum-vision-hikaye.png", "Vision board");
        return;
      }
      const spec = f.exports[0];
      const blob = await renderBoard(itemsRef.current, bg, srcOf, spec.w, spec.h, f);
      const text = "2027 vision board'umu hazırladım ✦";
      const url = "https://aeternum-26.netlify.app";
      const file = new File([blob], "aeternum-vision.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (mobile && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], text: `${text} ${url}` });
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      // bilgisayar: görseli indir, X'in gönderi penceresini aç
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "aeternum-vision.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "noopener");
      toast("Görsel indirildi", { description: "X'te açılan gönderine indirilen görseli sürükleyip bırak.", duration: 8000 });
    } catch {
      toast.error("Paylaşım hazırlanamadı. Tekrar dene.");
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
      f={f}
      stickers={stickers}
      onLoadStickers={loadStickers}
      onUploadSticker={() => stickerRef.current?.click()}
      onSticker={(st) => {
        addPhoto(st.path, undefined, st.aspect);
        setSheet(false);
      }}
      onUpload={() => fileRef.current?.click()}
      editing={items.find((i) => i.id === editId && i.kind === "word") ?? null}
      onNewWord={() => setEditId(null)}
      onWord={async (w) => {
        const editing = items.find((i) => i.id === editId && i.kind === "word");
        if (editing) {
          // seçili yazıyı güncelle
          const id = editing.id;
          setEditId(null);
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
        onBg(b);
        void updateBoard(board.id, { bg: b });
      }}
      onTemplate={(t) => {
        if (!items.length) return void toast("Önce panoya birkaç fotoğraf ekle.");
        const before = snapshot();
        setLayouts(applyTemplate(itemsRef.current, t, f));
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
          <p className="mt-4 max-w-lg text-ink-soft">Gelecek yılını fotoğraflarla ve kelimelerle kur. Parçaları sürükle, köşeden büyüt, üstteki noktadan döndür.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareMenu disabled={!!busy || items.length === 0} onPick={shareAs} />
          <ExportMenu f={f} disabled={!!busy || items.length === 0} onPick={exportAs} />
        </div>
      </section>
      {header}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="flex flex-col items-center">
          {/* üst araç çubuğu */}
          <div className="mb-4 flex w-full items-center justify-between gap-2" style={{ maxWidth: stageMax }}>
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
            className="vb-stage relative isolate w-full touch-none select-none border border-white/10 shadow-[0_60px_120px_-50px_rgba(0,0,0,1),0_0_0_8px_rgba(14,13,18,0.9),0_0_0_9px_rgba(220,199,161,0.14)]"
            style={{ aspectRatio: `${BW} / ${BH}`, maxWidth: stageMax, borderRadius: f.radius, ["--s" as string]: scale }}
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
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: f.radius, background: BGS[bg]?.css }}>
            {BGS[bg]?.stars && <div aria-hidden className="night-stars pointer-events-none absolute inset-0 opacity-70" />}
            {/* kilit ekranı saati alanı */}
            {f.clock && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center pt-[7%] opacity-[.18]" style={{ height: `${(CLOCK_SAFE / BH) * 100}%`, color: ink }}>
              <span className="text-[calc(var(--s)*40px)]">Cuma 1 Ocak</span>
              <span className="font-semibold leading-none tracking-tight text-[calc(var(--s)*230px)]">9:41</span>
            </div>}
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
                </div>
              );
            })}
            </div>
            {/* seçim çerçevesi ve tutamaçlar: kırpılmasın diye panonun dışına taşabilir */}
            {selected?.layout && (
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: `${(selected.layout.x / BW) * 100}%`,
                  top: `${(selected.layout.y / BH) * 100}%`,
                  width: `${(selected.layout.w / BW) * 100}%`,
                  height: `${(selected.layout.h / BH) * 100}%`,
                  transform: `rotate(${selected.layout.r}deg)`,
                  zIndex: 99999,
                }}
              >
                <span className="absolute -inset-[3px] rounded-[6px] border-[1.5px] border-champagne shadow-[0_0_0_1px_rgba(0,0,0,.4)]" />
                <span className="absolute -top-7 left-1/2 h-6 w-px -translate-x-1/2 bg-champagne" />
                <span data-handle="rotate" className="pointer-events-auto absolute -top-10 left-1/2 grid h-7 w-7 -translate-x-1/2 cursor-alias place-items-center rounded-full border border-champagne bg-[#0b0a10]">
                  <RotateCcw className="h-3.5 w-3.5 text-champagne" />
                </span>
                <span data-handle="scale" className="pointer-events-auto absolute -bottom-3 -right-3 h-6 w-6 cursor-nwse-resize rounded-full border-2 border-[#0b0a10] bg-champagne shadow" />
                <span
                  data-handle="delete"
                  title="Sil"
                  className="pointer-events-auto absolute -right-3 -top-10 grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-nar-soft bg-[#2a0610] shadow-[0_0_0_3px_rgba(2,2,3,.6)] transition-transform hover:scale-110"
                >
                  <Trash2 className="h-3.5 w-3.5 text-[#ffd9df]" />
                </span>
              </div>
            )}
          </div>

          {/* seçili parça araçları */}
          <div style={{ maxWidth: stageMax }} className="mt-5 flex min-h-12 w-full flex-wrap items-center justify-center gap-1 rounded-full border border-white/[.08] bg-[rgba(14,13,18,0.6)] p-1 backdrop-blur-xl">
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
                      setEditId(selected.id);
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
          <div style={{ maxWidth: stageMax }} className="mt-4 grid w-full grid-cols-5 gap-1.5 lg:hidden">
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
      <input ref={stickerRef} type="file" accept="image/png,image/webp" hidden onChange={(e) => uploadSticker(e.target.files?.[0])} />

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
  onNewWord,
  bg,
  onBg,
  onTemplate,
  f,
  stickers,
  onLoadStickers,
  onUploadSticker,
  onSticker,
}: {
  f: FormatDef;
  stickers: { path: string; url: string; aspect: number }[] | null;
  onLoadStickers: () => void;
  onUploadSticker: () => void;
  onSticker: (s: { path: string; url: string; aspect: number }) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  onPhoto: (src: string) => void;
  onUpload: () => void;
  onWord: (w: WordSpec) => Promise<void>;
  editing: VisionItem | null;
  onNewWord: () => void;
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
            className={cn("min-h-9 rounded-full text-[0.8rem] transition-colors", tab === t ? "bg-gradient-to-b from-[#c52c48] to-[#7a1226] text-[#fbefd8] shadow-[0_0_0_1px_rgba(233,205,150,.6),0_6px_18px_-8px_rgba(158,27,50,.9)]" : "text-ink-soft hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-2">
      {tab === "foto" && <PhotoTab onPhoto={onPhoto} onUpload={onUpload} />}
      {tab === "sus" && <StickerTab stickers={stickers} onLoad={onLoadStickers} onUpload={onUploadSticker} onPick={onSticker} />}
      {tab === "yazi" && <WordTab key={editing?.id ?? "yeni"} onWord={onWord} editing={editing} onNew={onNewWord} bg={bg} />}
      {tab === "arka" && (
        <div className="space-y-6">
          {BG_GROUPS.map((g) => (
            <div key={g}>
              <p className="mb-2.5 text-xs text-ink-mute">{g}</p>
              <div className="grid grid-cols-4 gap-2.5">
                {Object.entries(BGS)
                  .filter(([, b]) => b.group === g)
                  .map(([k, b]) => (
                    <button key={k} onClick={() => onBg(k)} aria-pressed={bg === k} className="text-center text-[0.7rem] text-ink-soft">
                      <span
                        className={cn("block rounded-[12px] border-2 transition-transform", bg === k ? "scale-[1.03] border-champagne shadow-[0_0_0_3px_rgba(158,27,50,.45)]" : "border-white/10 hover:border-white/30")}
                        style={{ background: b.css, aspectRatio: `${Math.min(f.W / f.H, 1.4)}` }}
                      />
                      <span className="mt-1.5 block leading-tight">{b.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "duzen" && (
        <div>
          <p className="mb-4 text-sm text-ink-soft">Panodaki parçaları tek dokunuşla yerleştir. Sonra istediğin gibi oynatabilirsin; beğenmezsen geri al.</p>
          <div className="grid grid-cols-3 gap-2.5">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => onTemplate(t.id)} className="rounded-[16px] border border-white/10 bg-white/[.02] p-3 text-left text-sm transition-colors hover:border-champagne/40">
                <TemplateGlyph id={t.id} f={f} />
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

function TemplateGlyph({ id, f }: { id: (typeof TEMPLATES)[number]["id"]; f: FormatDef }) {
  const lay = useMemo(() => applyTemplate(GLYPH_ITEMS, id, f), [id, f]);
  const BW = f.W;
  const BH = f.H;
  return (
    <svg viewBox={`0 0 ${BW} ${BH}`} className="h-24 w-full" aria-hidden>
      <rect x="8" y="8" width={BW - 16} height={BH - 16} rx={f.radius * 3} className="fill-black/30 stroke-white/15" strokeWidth="10" />
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

function WordTab({ onWord, editing, onNew, bg }: { onWord: (w: WordSpec) => Promise<void>; editing: VisionItem | null; onNew: () => void; bg: string }) {
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
      {editing && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-[12px] border border-champagne/25 bg-champagne/[.06] px-3 py-2 text-xs text-gold">
          <span>Seçili yazıyı düzenliyorsun.</span>
          <button onClick={onNew} className="shrink-0 rounded-full border border-champagne/40 px-2.5 py-1 text-[0.7rem] hover:bg-champagne/10">
            Yeni yazı ekle
          </button>
        </div>
      )}
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

function StickerTab({
  stickers,
  onLoad,
  onUpload,
  onPick,
}: {
  stickers: { path: string; url: string; aspect: number }[] | null;
  onLoad: () => void;
  onUpload: () => void;
  onPick: (s: { path: string; url: string; aspect: number }) => void;
}) {
  useEffect(() => {
    if (stickers === null) onLoad();
  }, [stickers, onLoad]);
  return (
    <div>
      <button onClick={onUpload} className="btn btn-ghost btn-sm w-full">
        <Upload className="h-4 w-4" /> Kendi süsünü ekle
      </button>
      <p className="mt-2 text-xs text-ink-mute">Arka planı şeffaf bir PNG ya da WebP seç (en fazla 5 MB). Süsler çerçevesiz eklenir; büyütüp döndürebilirsin.</p>
      <p className="mb-2.5 mt-6 text-xs text-ink-mute">Süslerim</p>
      {stickers === null ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="shimmer aspect-square rounded-[14px]" />
          ))}
        </div>
      ) : stickers.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-white/10 px-4 py-6 text-center text-sm text-ink-soft">Henüz süs yüklemedin. Yüklediğin süsler burada durur, istediğin panoda tekrar kullanırsın.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {stickers.map((st) => (
            <button
              key={st.path}
              onClick={() => onPick(st)}
              aria-label="Bu süsü panoya ekle"
              className="grid aspect-square place-items-center rounded-[14px] border border-white/[.06] bg-[repeating-conic-gradient(#ffffff0d_0_25%,transparent_0_50%)] bg-[length:14px_14px] p-2 transition-colors hover:border-champagne/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={st.url} alt="" className="h-full w-full object-contain" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExportMenu({ f, disabled, onPick }: { f: FormatDef; disabled: boolean; onPick: (spec: { id: string; w: number; h: number }) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="btn btn-primary" disabled={disabled} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Download className="h-4 w-4" /> İndir
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-[18px] border border-white/10 bg-[#0c0b0f] p-1.5 shadow-[var(--shadow-lift)]" role="menu">
          {f.exports.map((x) => (
            <button
              key={x.id}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onPick(x);
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

function ShareMenu({ disabled, onPick }: { disabled: boolean; onPick: (k: "x" | "story") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="btn btn-ghost" disabled={disabled} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Share2 className="h-4 w-4" /> Paylaş
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-[18px] border border-white/10 bg-[#0c0b0f] p-1.5 shadow-[var(--shadow-lift)]" role="menu">
          <button role="menuitem" onClick={() => (setOpen(false), onPick("x"))} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm text-ink hover:bg-white/5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
            </svg>
            X&apos;te paylaş
          </button>
          <button role="menuitem" onClick={() => (setOpen(false), onPick("story"))} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm text-ink hover:bg-white/5">
            <ArrowDownToLine className="h-4 w-4" /> Hikâye boyutunda indir
          </button>
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


// ---------------------------------------------------------------- panolar

const FORMAT_ICON: Record<BoardFormat, string> = {
  telefon: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z",
  "tablet-dikey": "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z",
  "tablet-yatay": "M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z",
  masaustu: "M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 16h6",
  "ig-kare": "M4 4h16v16H4z",
  "ig-hikaye": "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z",
  x: "M2 6h20v12H2z",
};

function FormatGlyph({ id, className }: { id: BoardFormat; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" className={className} aria-hidden>
      <path d={FORMAT_ICON[id]} />
    </svg>
  );
}

/** Panonun küçük önizlemesi (parçaların gerçek yerleşimiyle) */
function BoardThumb({ board, items, srcOf }: { board: VisionBoard; items: VisionItem[]; srcOf: (i: VisionItem) => string | undefined }) {
  const f = fmtOf(board.format);
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-white/10" style={{ aspectRatio: `${f.W} / ${f.H}`, background: BGS[board.bg]?.css ?? BGS.sampanya.css }}>
      {items
        .filter((i) => i.layout)
        .sort((a, b) => a.layout!.z - b.layout!.z)
        .slice(-24)
        .map((it) => {
          const l = it.layout!;
          const s = srcOf(it);
          return (
            <span
              key={it.id}
              className="absolute overflow-hidden"
              style={{ left: `${(l.x / f.W) * 100}%`, top: `${(l.y / f.H) * 100}%`, width: `${(l.w / f.W) * 100}%`, height: `${(l.h / f.H) * 100}%`, transform: `rotate(${l.r}deg)` }}
            >
              {it.kind === "image" && s ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s} alt="" className={cn("h-full w-full", isSticker(it.src) ? "object-contain" : "object-cover")} loading="lazy" />
              ) : (
                <span className="block h-full w-full rounded-[2px] bg-white/30" />
              )}
            </span>
          );
        })}
    </div>
  );
}

function NewBoardDialog({ title, defaultName, onClose, onCreate }: { title: string; defaultName: string; onClose: () => void; onCreate: (name: string, format: BoardFormat) => Promise<void> }) {
  const [name, setName] = useState(defaultName);
  const [format, setFormat] = useState<BoardFormat>("telefon");
  const [pending, start] = useTransition();
  const groups = [...new Set(FORMATS.map((x) => x.group))];
  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-[rgba(2,2,3,0.7)] backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="safe-bottom w-full max-w-lg rounded-t-[28px] border border-white/10 bg-[#0c0b0f] p-6 shadow-[var(--shadow-lift)] sm:rounded-[28px] sm:p-8" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="flex items-center justify-between">
          <h2 className="display text-[2rem]">{title}</h2>
          <button onClick={onClose} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="mt-5 block text-sm text-ink-soft" htmlFor="pano-ad">
          Panonun adı
        </label>
        <input id="pano-ad" className="field mt-2" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        <p className="mb-3 mt-6 text-sm text-ink-soft">Boyut</p>
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 text-xs text-ink-mute">{g}</p>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.filter((x) => x.group === g).map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setFormat(x.id)}
                    aria-pressed={format === x.id}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-[14px] border px-2 text-center text-[0.78rem] transition-colors",
                      format === x.id ? "border-nar-soft/70 bg-nar/15 text-ink" : "border-white/10 text-ink-soft hover:text-ink",
                    )}
                  >
                    <FormatGlyph id={x.id} className={cn("h-6 w-6", format === x.id ? "text-nar-soft" : "text-champagne")} />
                    {x.label}
                    <span className="num text-[0.65rem] text-ink-mute">
                      {x.W}×{x.H}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary mt-7 w-full" disabled={pending} onClick={() => start(() => onCreate(name.trim() || "Panom", format))}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Panoyu oluştur
        </button>
      </div>
    </div>
  );
}

export function VisionStudio({
  boards: initialBoards,
  items: initialItems,
  urls: initialUrls,
  userId,
}: {
  boards: VisionBoard[];
  items: VisionItem[];
  urls: Record<string, string>;
  userId: string;
}) {
  const [boards, setBoards] = useState(initialBoards);
  const [byBoard, setByBoard] = useState<Record<string, VisionItem[]>>(() => {
    const m: Record<string, VisionItem[]> = {};
    for (const b of initialBoards) m[b.id] = [];
    for (const it of initialItems) if (it.board_id && m[it.board_id]) m[it.board_id].push(it);
    return m;
  });
  const [current, setCurrent] = useState<string | null>(initialBoards[0]?.id ?? null);
  const [urls, setUrls] = useState(initialUrls);
  const [dialog, setDialog] = useState<null | "new" | "saveNew">(null);
  const [listOpen, setListOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const board = boards.find((b) => b.id === current) ?? null;
  const srcOf = useCallback((it: VisionItem) => (it.src?.startsWith("/") ? it.src : it.src ? urls[it.src] : undefined), [urls]);

  const onItems = useCallback((xs: VisionItem[]) => {
    if (!current) return;
    setByBoard((m) => (m[current] === xs ? m : { ...m, [current]: xs }));
  }, [current]);
  const onUrls = useCallback((u: Record<string, string>) => setUrls((p) => (p === u ? p : { ...p, ...u })), []);

  async function create(name: string, format: BoardFormat) {
    const r = await createBoard({ name, format, bg: board?.bg ?? "sampanya" });
    if (!r.ok) return void toast.error(r.error);
    setBoards((b) => [r.board, ...b]);
    setByBoard((m) => ({ ...m, [r.board.id]: [] }));
    setCurrent(r.board.id);
    setDialog(null);
    setListOpen(false);
    toast.success(`"${r.board.name}" hazır`);
  }

  // ilk kez gelen kullanıcı için otomatik pano
  const creating = useRef(false);
  useEffect(() => {
    if (boards.length || creating.current) return;
    creating.current = true;
    void createBoard({ name: "İlk panom", format: "telefon" }).then((r) => {
      if (!r.ok) return void toast.error(r.error);
      setBoards([r.board]);
      setByBoard({ [r.board.id]: [] });
      setCurrent(r.board.id);
    });
  }, [boards.length]);

  if (!board) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-champagne" />
      </div>
    );
  }

  const header = (
    <div className="mt-8 flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setListOpen((o) => !o)}
          aria-expanded={listOpen}
          className="flex min-h-11 items-center gap-2.5 rounded-full border border-white/10 bg-[rgba(14,13,18,0.6)] py-1.5 pl-3 pr-4 text-sm text-ink backdrop-blur-xl hover:border-champagne/30"
        >
          <FormatGlyph id={board.format} className="h-4 w-4 text-champagne" />
          <span className="max-w-[12rem] truncate">{board.name}</span>
          <span className="text-ink-mute">{fmtOf(board.format).label}</span>
          <ChevronDown className="h-4 w-4 text-ink-mute" />
        </button>
        {listOpen && (
          <div className="absolute left-0 top-full z-40 mt-2 w-[min(92vw,26rem)] rounded-[22px] border border-white/10 bg-[#0c0b0f] p-3 shadow-[var(--shadow-lift)]">
            <p className="px-2 pb-2 text-xs text-ink-mute">Panolarım ({boards.length}/20)</p>
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto overscroll-contain">
              {boards.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => {
                      setCurrent(b.id);
                      setListOpen(false);
                    }}
                    className={cn("flex w-full items-center gap-3 rounded-[14px] p-2 text-left hover:bg-white/5", b.id === board.id && "bg-nar/10 ring-1 ring-nar-soft/40")}
                  >
                    <div className="w-14 shrink-0">
                      <BoardThumb board={b} items={byBoard[b.id] ?? []} srcOf={srcOf} />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{b.name}</span>
                      <span className="block text-xs text-ink-mute">
                        {fmtOf(b.format).label} · {(byBoard[b.id] ?? []).length} parça · {new Date(b.updated_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                      </span>
                    </span>
                    {b.id === board.id && <Check className="h-4 w-4 text-nar-soft" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-white/[.06] pt-3">
              <button
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-full text-xs text-ink-soft hover:bg-white/5 hover:text-ink"
                onClick={() => {
                  setRenaming(true);
                  setListOpen(false);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Adını değiştir
              </button>
              <button
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-full text-xs text-ink-soft hover:bg-white/5 hover:text-ink"
                onClick={async () => {
                  const r = await duplicateBoard(board.id);
                  if (!r.ok) return void toast.error(r.error);
                  setBoards((x) => [r.board, ...x]);
                  setByBoard((m) => ({ ...m, [r.board.id]: r.items }));
                  setCurrent(r.board.id);
                  setListOpen(false);
                  toast.success("Pano kopyalandı");
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Kopyala
              </button>
              <button
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-full text-xs text-nar-soft hover:bg-nar/10"
                onClick={async () => {
                  if (!window.confirm(`"${board.name}" panosu ve içindeki her şey silinsin mi? Bu geri alınamaz.`)) return;
                  const r = await deleteBoard(board.id);
                  if (!r.ok) return void toast.error("Silinemedi.");
                  const rest = boards.filter((b) => b.id !== board.id);
                  setBoards(rest);
                  setCurrent(rest[0]?.id ?? null);
                  setListOpen(false);
                  toast("Pano silindi");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Sil
              </button>
            </div>
          </div>
        )}
      </div>
      <button onClick={() => setDialog("new")} className="btn btn-ghost btn-sm">
        <Plus className="h-4 w-4" /> Yeni pano
      </button>
      <button onClick={() => setDialog("saveNew")} className="btn btn-ghost btn-sm">
        <Save className="h-4 w-4" /> Kaydet ve yeni pano
      </button>
      <span className="text-xs text-ink-mute">Her değişiklik otomatik kaydedilir.</span>
      {renaming && (
        <RenameDialog
          name={board.name}
          onClose={() => setRenaming(false)}
          onSave={async (name) => {
            await updateBoard(board.id, { name });
            setBoards((x) => x.map((b) => (b.id === board.id ? { ...b, name } : b)));
            setRenaming(false);
          }}
        />
      )}
    </div>
  );

  return (
    <>
      <BoardEditor
        key={board.id}
        board={board}
        initial={byBoard[board.id] ?? []}
        urls={urls}
        userId={userId}
        onItems={onItems}
        onUrls={onUrls}
        onBg={(bg) => setBoards((x) => x.map((b) => (b.id === board.id ? { ...b, bg } : b)))}
        header={header}
      />
      {dialog === "new" && <NewBoardDialog title="Yeni pano" defaultName={`Pano ${boards.length + 1}`} onClose={() => setDialog(null)} onCreate={create} />}
      {dialog === "saveNew" && (
        <SaveThenNew
          current={board.name}
          count={boards.length}
          onClose={() => setDialog(null)}
          onDone={async (savedName, name, format) => {
            if (savedName !== board.name) {
              await updateBoard(board.id, { name: savedName });
              setBoards((x) => x.map((b) => (b.id === board.id ? { ...b, name: savedName } : b)));
            }
            await create(name, format);
          }}
        />
      )}
    </>
  );
}

function RenameDialog({ name, onClose, onSave }: { name: string; onClose: () => void; onSave: (n: string) => Promise<void> }) {
  const [v, setV] = useState(name);
  const [pending, start] = useTransition();
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[rgba(2,2,3,0.7)] px-5 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#0c0b0f] p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Panonun adını değiştir">
        <label htmlFor="ad" className="text-sm text-ink-soft">
          Panonun adı
        </label>
        <input id="ad" className="field mt-2" value={v} maxLength={40} onChange={(e) => setV(e.target.value)} autoFocus />
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn-primary btn-sm" disabled={pending || !v.trim()} onClick={() => start(() => onSave(v.trim()))}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveThenNew({ current, count, onClose, onDone }: { current: string; count: number; onClose: () => void; onDone: (saved: string, name: string, format: BoardFormat) => Promise<void> }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [saved, setSaved] = useState(current);
  if (step === 2) return <NewBoardDialog title="Yeni pano" defaultName={`Pano ${count + 1}`} onClose={onClose} onCreate={(n, f) => onDone(saved.trim() || current, n, f)} />;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[rgba(2,2,3,0.7)] px-5 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#0c0b0f] p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Panoyu kaydet">
        <h2 className="display text-[1.7rem]">Panoyu kaydet</h2>
        <p className="mt-1 text-sm text-ink-soft">Bu panoya bir ad ver; sonra yeni panonun boyutunu seçeceksin.</p>
        <input className="field mt-4" value={saved} maxLength={40} onChange={(e) => setSaved(e.target.value)} autoFocus aria-label="Panonun adı" />
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setStep(2)}>
            Kaydet ve devam et
          </button>
        </div>
      </div>
    </div>
  );
}
