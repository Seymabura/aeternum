"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Download, ImagePlus, Library, Loader2, Maximize2, Minimize2, Trash2, Type, X } from "lucide-react";
import { addVision, deleteVision, updateVision, type VisionItem } from "@/app/actions/extras";
import { VISION_CATS, VISION_LIBRARY, type VisionCat } from "@/lib/vision-library";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import { shareOrDownload } from "@/lib/share";
import { cn } from "@/lib/utils";

export const TONES: Record<string, { bg: string; fg: string; label: string }> = {
  gece: { bg: "linear-gradient(160deg,#1d2a52,#0a1122)", fg: "#e9dcc0", label: "Gece" },
  sampanya: { bg: "linear-gradient(160deg,#f6eedc,#cdb892)", fg: "#0a1122", label: "Şampanya" },
  buz: { bg: "linear-gradient(160deg,#e8f0ff,#a9bfe8)", fg: "#0a1122", label: "Buz" },
  gul: { bg: "linear-gradient(160deg,#f3d6d2,#c98b8b)", fg: "#2a1220", label: "Gül" },
  zumrut: { bg: "linear-gradient(160deg,#2f5a4f,#13281f)", fg: "#e9dcc0", label: "Zümrüt" },
};
const ASPECT = { s: "aspect-square", m: "aspect-[3/4]", l: "aspect-[2/3]" } as const;
const NEXT_SIZE = { s: "m", m: "l", l: "s" } as const;

export function VisionBoard({ initial, urls: initialUrls, userId }: { initial: VisionItem[]; urls: Record<string, string>; userId: string }) {
  const [items, setItems] = useState(initial);
  const [urls, setUrls] = useState(initialUrls);
  const [panel, setPanel] = useState<null | "lib" | "word">(null);
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const srcOf = (it: VisionItem) => (it.src?.startsWith("/") ? it.src : it.src ? urls[it.src] : undefined);

  async function add(input: Parameters<typeof addVision>[0]) {
    const r = await addVision(input);
    if (!r.ok) return toast.error(r.error), false;
    setItems((x) => [...x, r.item]);
    return true;
  }

  async function upload(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      const blob = await compressImage(f, 1400, 0.82);
      const path = `${userId}/vision/${crypto.randomUUID()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await createClient().storage.from("uploads").upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      setUrls((u) => ({ ...u, [path]: URL.createObjectURL(blob) }));
      await add({ kind: "image", src: path, size: "m" });
    } catch {
      toast.error("Fotoğraf eklenemedi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function exportWallpaper() {
    setBusy(true);
    try {
      const blob = await renderWallpaper(items, srcOf);
      await shareOrDownload(blob, "aeternum-vision-board.png", "Vision board 2027");
    } catch {
      toast.error("İndirilemedi, tekrar dener misin?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <section className="rise flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">vision board</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">
            2027&apos;yi <em className="gold-shine italic">gör</em>
          </h1>
          <p className="mt-3 max-w-lg text-ink-soft">Hayal ettiğin yılı görsellerle, kelimelerle kur. Bitince telefonuna duvar kağıdı yap.</p>
        </div>
        <button onClick={exportWallpaper} disabled={busy || items.length === 0} className="btn btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Duvar kağıdı yap
        </button>
      </section>

      <div className="sheet mt-7 flex flex-wrap gap-2 !rounded-full p-1.5">
        <Tool icon={Library} label="Kütüphane" onClick={() => setPanel("lib")} />
        <Tool icon={ImagePlus} label="Fotoğraf yükle" onClick={() => fileRef.current?.click()} />
        <Tool icon={Type} label="Kelime" onClick={() => setPanel("word")} />
        <span className="ml-auto self-center pr-3 text-xs text-ink-soft">{items.length}/60</span>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </div>

      {items.length === 0 ? (
        <div className="mt-10 grid gap-4 text-center">
          <p className="display text-3xl italic text-ink-soft">Panon boş, hayal etmeye başla</p>
          <button onClick={() => setPanel("lib")} className="btn btn-ghost mx-auto">
            <Library className="h-4 w-4" /> Kütüphaneden seç
          </button>
        </div>
      ) : (
        <div className="mt-6 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          <AnimatePresence initial={false}>
            {items.map((it) => {
              const tone = TONES[it.tone ?? "gece"] ?? TONES.gece;
              const s = srcOf(it);
              return (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative mb-3 break-inside-avoid sm:mb-4"
                >
                  <button
                    onClick={() => setSel(sel === it.id ? null : it.id)}
                    className={cn(
                      "relative block w-full overflow-hidden rounded-[18px] border shadow-[0_20px_40px_-24px_rgba(0,0,0,.9)] transition-all",
                      ASPECT[it.size],
                      sel === it.id ? "border-champagne/70 ring-2 ring-champagne/30" : "border-white/[.08]",
                    )}
                    style={it.kind === "word" ? { background: tone.bg } : undefined}
                  >
                    {it.kind === "image" ? (
                      s ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="absolute inset-0 animate-pulse bg-white/5" />
                      )
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span className="display text-[1.7rem] italic leading-tight sm:text-3xl" style={{ color: tone.fg }}>
                          {it.text}
                        </span>
                      </span>
                    )}
                  </button>
                  {sel === it.id && (
                    <div className="absolute inset-x-2 bottom-2 flex justify-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur">
                      <IconBtn
                        label="Boyut"
                        onClick={async () => {
                          const size = NEXT_SIZE[it.size];
                          setItems((x) => x.map((y) => (y.id === it.id ? { ...y, size } : y)));
                          await updateVision(it.id, { size });
                        }}
                      >
                        {it.size === "l" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </IconBtn>
                      <IconBtn
                        label="Sil"
                        onClick={async () => {
                          setItems((x) => x.filter((y) => y.id !== it.id));
                          setSel(null);
                          await deleteVision(it.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {panel === "lib" && <LibraryPanel onClose={() => setPanel(null)} onPick={(src) => add({ kind: "image", src, size: Math.random() < 0.35 ? "l" : "m" })} />}
      {panel === "word" && (
        <WordPanel
          onClose={() => setPanel(null)}
          onAdd={async (text, tone) => {
            if (await add({ kind: "word", text, tone, size: "s" })) setPanel(null);
          }}
        />
      )}
      {busy && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-champagne" />
        </div>
      )}
    </div>
  );
}

function LibraryPanel({ onClose, onPick }: { onClose: () => void; onPick: (src: string) => void }) {
  const [cat, setCat] = useState<VisionCat>("seyahat");
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <Sheet title="Kütüphane" onClose={onClose}>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-3">
        {(Object.keys(VISION_CATS) as VisionCat[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm", cat === c ? "border-champagne/50 bg-champagne/15 text-gold" : "border-white/10 text-ink-soft")}
          >
            {VISION_CATS[c]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {VISION_LIBRARY.filter((v) => v.cat === cat).map((v) => (
          <button
            key={v.src}
            onClick={() => {
              onPick(v.src);
              setAdded((s) => new Set(s).add(v.src));
            }}
            className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10"
          >
            <Image src={v.src} alt={v.alt} fill sizes="160px" className="object-cover transition-transform hover:scale-105" />
            {added.has(v.src) && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-gold">eklendi ✦</span>}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-ink-soft">Görseller Unsplash lisansıyla ücretsizdir.</p>
    </Sheet>
  );
}

function WordPanel({ onClose, onAdd }: { onClose: () => void; onAdd: (text: string, tone: string) => void }) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("gece");
  const [pending, start] = useTransition();
  const ideas = ["huzur", "cesaret", "yeni şehirler", "sağlık", "aşk", "bolluk", "özgürlük", "kendime iyi bak"];
  return (
    <Sheet title="Kelime ekle" onClose={onClose}>
      <div className="mx-auto mb-5 flex aspect-[2/1] max-w-xs items-center justify-center rounded-2xl p-4 text-center" style={{ background: TONES[tone].bg }}>
        <span className="display text-3xl italic" style={{ color: TONES[tone].fg }}>
          {text || "huzur"}
        </span>
      </div>
      <input className="field" value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder="Bir kelime ya da kısa bir cümle" autoFocus />
      <div className="mt-3 flex flex-wrap gap-2">
        {ideas.map((i) => (
          <button key={i} onClick={() => setText(i)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-ink-soft hover:text-ink">
            {i}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {Object.entries(TONES).map(([k, t]) => (
          <button
            key={k}
            onClick={() => setTone(k)}
            className={cn("h-9 w-9 rounded-full border-2", tone === k ? "border-champagne" : "border-transparent")}
            style={{ background: t.bg }}
            aria-label={t.label}
          />
        ))}
      </div>
      <button className="btn btn-primary mt-5 w-full" disabled={pending || !text.trim()} onClick={() => start(() => onAdd(text, tone))}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Panoya ekle
      </button>
    </Sheet>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="safe-bottom max-h-[82dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#0d1426] p-5 shadow-[var(--shadow-lift)] sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-3xl">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/5" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Tool({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-white/5 hover:text-ink">
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="rounded-full p-2 text-ink hover:bg-white/10">
      {children}
    </button>
  );
}

/** Vision board'u 1179×2556 telefon duvar kağıdına dizer. */
async function renderWallpaper(items: VisionItem[], srcOf: (i: VisionItem) => string | undefined): Promise<Blob> {
  const W = 1179,
    H = 2556;
  await Promise.all([document.fonts.load('italic 400 80px "Bodoni Moda Variable"'), document.fonts.load('500 30px "Geist Variable"')]).catch(() => null);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#111a36");
  bg.addColorStop(0.5, "#0a1122");
  bg.addColorStop(1, "#05070d");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // yıldızlar
  for (let i = 0; i < 220; i++) {
    g.fillStyle = `rgba(235,240,255,${Math.random() * 0.5 + 0.1})`;
    g.beginPath();
    g.arc(Math.random() * W, Math.random() * H, Math.random() * 1.6 + 0.3, 0, Math.PI * 2);
    g.fill();
  }
  // saat alanını boş bırak; başlık
  g.fillStyle = "#e9dcc0";
  g.textAlign = "center";
  g.font = 'italic 400 92px "Bodoni Moda Variable", Georgia, serif';
  g.fillText("2027", W / 2, 760);
  g.font = '500 26px "Geist Variable", sans-serif';
  g.fillStyle = "rgba(233,220,192,.7)";
  g.fillText("V İ S I O N   B O A R D", W / 2, 812);

  const cols = 2,
    gap = 26,
    pad = 70,
    top = 880,
    bottom = H - 200;
  const colW = (W - pad * 2 - gap * (cols - 1)) / cols;
  const heights = new Array(cols).fill(top);
  const ratio = { s: 1, m: 4 / 3, l: 3 / 2 } as const;
  const load = (src: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const im = new window.Image();
      if (!src.startsWith("/") && !src.startsWith("blob:")) im.crossOrigin = "anonymous";
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    });
  for (const it of items) {
    const c = heights.indexOf(Math.min(...heights));
    const x = pad + c * (colW + gap);
    const h = colW * ratio[it.size];
    const y = heights[c];
    if (y + h > bottom) continue;
    heights[c] += h + gap;
    g.save();
    roundRect(g, x, y, colW, h, 26);
    g.clip();
    if (it.kind === "image") {
      const s = srcOf(it);
      if (s) {
        try {
          const im = await load(s);
          const r = Math.max(colW / im.width, h / im.height);
          const w2 = im.width * r,
            h2 = im.height * r;
          g.drawImage(im, x + (colW - w2) / 2, y + (h - h2) / 2, w2, h2);
        } catch {}
      }
    } else {
      const t = TONES[it.tone ?? "gece"] ?? TONES.gece;
      const stops = t.bg.match(/#[0-9a-f]{6}/gi) ?? ["#1d2a52", "#0a1122"];
      const lg = g.createLinearGradient(x, y, x + colW, y + h);
      lg.addColorStop(0, stops[0]);
      lg.addColorStop(1, stops[1]);
      g.fillStyle = lg;
      g.fillRect(x, y, colW, h);
      g.fillStyle = t.fg;
      g.font = 'italic 400 58px "Bodoni Moda Variable", Georgia, serif';
      wrapText(g, it.text ?? "", x + colW / 2, y + h / 2, colW - 60, 64);
    }
    g.restore();
    g.strokeStyle = "rgba(255,255,255,.12)";
    g.lineWidth = 2;
    roundRect(g, x, y, colW, h, 26);
    g.stroke();
  }
  g.fillStyle = "rgba(233,220,192,.5)";
  g.font = '500 24px "Geist Variable", sans-serif';
  g.fillText("A E T E R N U M", W / 2, H - 120);
  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej()), "image/png"));
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function wrapText(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, maxW: number, lh: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (g.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((l, i) => g.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh));
}
