"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Check, ExternalLink, Heart, ImagePlus, Link2, Loader2, Plus, Trash2, X } from "lucide-react";
import { addWish, deleteWish, favWish, previewLink, toggleWish, type WishItem } from "@/app/actions/extras";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";

type Filter = "hepsi" | "favori" | "alindi";

export function Wishlist({ initial, urls: initialUrls, userId }: { initial: WishItem[]; urls: Record<string, string>; userId: string }) {
  const [items, setItems] = useState(initial);
  const [urls, setUrls] = useState(initialUrls);
  const [filter, setFilter] = useState<Filter>("hepsi");
  const [adding, setAdding] = useState(false);

  const shown = items.filter((i) => (filter === "favori" ? i.fav : filter === "alindi" ? i.done : true));
  const img = (i: WishItem) => (i.image_url ? (i.image_url.startsWith("http") ? i.image_url : urls[i.image_url]) : undefined);

  return (
    <div>
      <section className="rise flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Wishlist</p>
          <h1 className="display mt-5 text-[2.75rem] sm:text-[4rem]">
            Dilek <em className="gold-shine italic">vitrinim</em>
          </h1>
          <p className="mt-5 max-w-md text-ink-soft">İstediğin her şey tek bir vitrinde. Ürün linkini yapıştır, görseli ve fiyatı kendiliğinden gelsin.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Dilek ekle
        </button>
      </section>

      <div role="tablist" aria-label="Filtre" className="no-scrollbar mt-12 inline-flex max-w-full overflow-x-auto rounded-full border border-champagne/12 bg-[rgba(18,26,46,0.55)] p-1 backdrop-blur-xl">
        {(
          [
            ["hepsi", `Hepsi ${items.length}`],
            ["favori", `En çok istediklerim ${items.filter((i) => i.fav).length}`],
            ["alindi", `Alındı ${items.filter((i) => i.done).length}`],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={cn("relative min-h-10 shrink-0 rounded-full px-4 text-sm transition-colors duration-300", filter === k ? "text-[#1a1408]" : "text-ink-soft hover:text-ink")}
          >
            {filter === k && (
              <motion.span
                layoutId="wish-filter"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#f3e6c8,#dcc7a1)]"
              />
            )}
            <span className="num relative">{l}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="sheet mt-8 flex w-full flex-col items-center px-6 py-20 text-center">
          <EmptyShowcase />
          <h2 className="display mt-8 text-[2rem]">{filter === "hepsi" ? "Vitrinin henüz boş" : "Burada henüz bir şey yok"}</h2>
          <p className="mt-3 text-ink-soft">Bir ürün linki yapıştır ya da fotoğraf ekle.</p>
          {filter === "hepsi" && (
            <button onClick={() => setAdding(true)} className="btn btn-primary mt-8">
              İlk dileğini ekle
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {shown.map((it) => (
              <motion.li key={it.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group">
                <div className="relative">
                  <div className={cn("relative aspect-[4/5] overflow-hidden rounded-[14px] border border-champagne/10 bg-gradient-to-br from-[#1d2a52] to-[#0a1122] shadow-[0_24px_50px_-24px_rgba(0,0,0,.9)]", it.done && "grayscale-[.6]")}>
                    {img(it) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img(it)} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" loading="lazy" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span className="display text-[1.4rem] italic text-gold/90">{it.title}</span>
                      </span>
                    )}
                    
                    <button
                      onClick={async () => {
                        setItems((x) => x.map((y) => (y.id === it.id ? { ...y, fav: !y.fav } : y)));
                        await favWish(it.id, !it.fav);
                      }}
                      className={cn("absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors", it.fav ? "bg-bordo text-ink" : "bg-[rgba(4,6,12,.45)] text-ink hover:bg-[rgba(4,6,12,.65)]")}
                      aria-label="En çok istediklerime ekle"
                    >
                      <Heart className="h-4 w-4" strokeWidth={1.5} fill={it.fav ? "currentColor" : "none"} />
                    </button>
                    {it.done && (
                      <span className="absolute inset-x-0 bottom-5 bg-[linear-gradient(90deg,rgba(168,138,92,.0),rgba(220,199,161,.95)_20%,rgba(243,230,200,.95)_50%,rgba(220,199,161,.95)_80%,rgba(168,138,92,0))] py-1.5 text-center text-xs font-medium tracking-wide text-[#1a1408]">alındı ✦</span>
                    )}
                  </div>
                  <div className="pt-4">
                    {it.store && <p className="truncate text-[0.6875rem] uppercase tracking-[0.2em] text-champagne/80">{it.store}</p>}
                    <p className="display mt-1.5 line-clamp-2 text-[1.125rem] leading-snug">{it.title}</p>
                    {it.price && <p className="num mt-1.5 text-sm text-ink-soft">{it.price}</p>}
                    <div className="mt-3 flex items-center gap-1 border-t border-champagne/10 pt-2">
                      <button
                        onClick={async () => {
                          setItems((x) => x.map((y) => (y.id === it.id ? { ...y, done: !y.done } : y)));
                          await toggleWish(it.id, !it.done);
                          if (!it.done) toast.success("Dileğin gerçek oldu");
                        }}
                        className={cn("-ml-2 flex h-11 items-center gap-1.5 rounded-full px-2 text-xs transition-colors", it.done ? "text-gold" : "text-ink-soft hover:text-ink")}
                      >
                        <Check className="h-4 w-4" strokeWidth={1.5} /> {it.done ? "Alındı" : "Aldım"}
                      </button>
                      {it.url && (
                        <a href={it.url} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:text-champagne" aria-label="Ürüne git">
                          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          setItems((x) => x.filter((y) => y.id !== it.id));
                          await deleteWish(it.id);
                        }}
                        className="-mr-2 ml-auto flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-colors hover:text-bordo"
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {adding && (
        <AddSheet
          userId={userId}
          onClose={() => setAdding(false)}
          onAdded={(it, local) => {
            setItems((x) => [it, ...x]);
            if (local && it.image_url) setUrls((u) => ({ ...u, [it.image_url!]: local }));
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function AddSheet({ userId, onClose, onAdded }: { userId: string; onClose: () => void; onAdded: (i: WishItem, localUrl?: string) => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [image, setImage] = useState("");
  const [local, setLocal] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchPreview(u: string) {
    if (!/^https?:\/\//.test(u.trim())) return;
    setLoading(true);
    const r = await previewLink(u.trim());
    setLoading(false);
    if (!r.ok) return void toast("Bu linkten bilgi alamadık, kendin yazabilirsin.");
    if (r.title) setTitle(r.title);
    if (r.image) {
      setImage(r.image);
      setLocal(undefined);
    }
    if (r.price) setPrice(r.price);
    if (r.store) setStore(r.store);
  }

  async function onFile(f?: File) {
    if (!f) return;
    setLoading(true);
    try {
      const blob = await compressImage(f, 1000, 0.82);
      const path = `${userId}/wish/${crypto.randomUUID()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await createClient().storage.from("uploads").upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      setImage(path);
      setLocal(URL.createObjectURL(blob));
    } catch {
      toast.error("Fotoğraf eklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  const previewSrc = local ?? (image.startsWith("http") ? image : undefined);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(4,6,12,0.72)] backdrop-blur-sm sm:items-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Yeni dilek"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="safe-bottom max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-champagne/12 bg-[#0d1426] p-6 shadow-[0_-30px_80px_-30px_rgba(0,0,0,.9)] sm:rounded-[28px] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink-mute/60 sm:hidden" />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display text-[2rem]">Yeni dilek</h2>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-white/5 hover:text-ink" aria-label="Kapat">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <label className="label">Ürün linki</label>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" strokeWidth={1.5} />
          <input
            className="field !pl-10"
            value={url}
            inputMode="url"
            placeholder="https://..."
            onChange={(e) => setUrl(e.target.value)}
            onPaste={(e) => {
              const t = e.clipboardData.getData("text");
              setTimeout(() => fetchPreview(t), 0);
            }}
            onBlur={() => url && !title && fetchPreview(url)}
          />
          
        </div>

        <div className="mt-5 grid grid-cols-[110px_1fr] gap-4">
          <button onClick={() => fileRef.current?.click()} className={cn("relative aspect-[4/5] overflow-hidden rounded-[14px] border border-dashed border-champagne/20 bg-[rgba(18,26,46,0.55)] text-ink-soft hover:border-champagne/40", loading && "shimmer border-solid")}>
            {loading ? null : previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-1 text-xs">
                <ImagePlus className="h-5 w-5" strokeWidth={1.5} /> Görsel
              </span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <div className="space-y-2.5">
            {loading ? (
              <>
                <div className="shimmer h-12 rounded-[14px]" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="shimmer h-12 rounded-[14px]" />
                  <div className="shimmer h-12 rounded-[14px]" />
                </div>
              </>
            ) : (
              <>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} placeholder="Ne istiyorsun?" />
            <div className="grid grid-cols-2 gap-2">
              <input className="field" value={price} onChange={(e) => setPrice(e.target.value)} maxLength={40} placeholder="Fiyat" />
              <input className="field" value={store} onChange={(e) => setStore(e.target.value)} maxLength={60} placeholder="Mağaza" />
            </div>
              </>
            )}
          </div>
        </div>

        <button
          className="btn btn-primary mt-8 w-full"
          disabled={pending || loading || !title.trim()}
          onClick={() =>
            start(async () => {
              const r = await addWish({ kind: "istek", title, url, price, store, image_url: image });
              if (!r.ok) return void toast.error(r.error);
              onAdded(r.item, local);
            })
          }
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={1.5} />} Vitrine ekle
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Boş vitrin: üç zarif ince çizgi kart */
function EmptyShowcase() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-auto text-champagne" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1" opacity=".55">
        <rect x="20" y="22" width="56" height="74" rx="6" transform="rotate(-8 48 59)" />
        <rect x="144" y="22" width="56" height="74" rx="6" transform="rotate(8 172 59)" />
      </g>
      <rect x="80" y="10" width="60" height="80" rx="6" stroke="currentColor" strokeWidth="1.2" fill="rgba(220,199,161,.05)" />
      <path d="M110 34c.6 6 5 10.4 11 11-6 .6-10.4 5-11 11-.6-6-5-10.4-11-11 6-.6 10.4-5 11-11Z" fill="currentColor" />
      <path d="M92 102h56" stroke="currentColor" strokeWidth="1" opacity=".4" />
    </svg>
  );
}
