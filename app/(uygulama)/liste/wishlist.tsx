"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Check, ExternalLink, Gift, Loader2, Plus, SlidersHorizontal, Target, Trash2 } from "lucide-react";
import { addWish, deleteWish, toggleWish, type WishItem, type WishKind } from "@/app/actions/extras";
import { cn } from "@/lib/utils";

const CATS = ["Seyahat", "Kariyer", "Sağlık", "Kendim", "Sevdiklerim", "Öğrenme", "Ev", "Para"];

export function Wishlist({ initial }: { initial: WishItem[] }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<WishKind>("istek");
  const [cat, setCat] = useState<string | null>(null);
  const shown = items.filter((i) => i.kind === tab && (tab === "istek" || !cat || i.category === cat));
  const hedef = items.filter((i) => i.kind === "hedef");
  const done = hedef.filter((i) => i.done).length;
  const pct = hedef.length ? Math.round((done / hedef.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rise">
        <p className="eyebrow">wishlist</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">
          İstediklerin, <em className="gold-shine italic">yapacakların</em>
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">Yeni yıldan beklediğin her şey burada: hediye listen ve 2027 hedeflerin.</p>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="sheet relative grid grid-cols-2 !rounded-full p-1">
          {(["istek", "hedef"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn("relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors sm:px-5", tab === k ? "text-midnight" : "text-ink-soft")}
            >
              {tab === k && (
                <motion.span layoutId="tabpill" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-[#fbf5e8] to-[#d8c39c]" transition={{ type: "spring", damping: 26, stiffness: 300 }} />
              )}
              {k === "istek" ? <Gift className="h-4 w-4" /> : <Target className="h-4 w-4" />}
              {k === "istek" ? "İstediklerim" : "Yapacaklarım"}
              <span className="text-xs opacity-60">{items.filter((i) => i.kind === k).length}</span>
            </button>
          ))}
        </div>
        {tab === "hedef" && hedef.length > 0 && <Ring pct={pct} />}
      </div>

      <AddForm kind={tab} onAdd={(it) => setItems((x) => [...x, it])} defaultCat={cat} />

      {tab === "hedef" && (
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={!cat} onClick={() => setCat(null)}>Tümü</Chip>
          {CATS.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
              {c}
            </Chip>
          ))}
        </div>
      )}

      <ul className="mt-5 space-y-2.5">
        <AnimatePresence initial={false}>
          {shown.map((it) => (
            <motion.li
              key={it.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="sheet group flex items-center gap-4 px-4 py-3.5"
            >
              {it.kind === "hedef" ? (
                <button
                  onClick={async () => {
                    setItems((x) => x.map((y) => (y.id === it.id ? { ...y, done: !y.done } : y)));
                    const r = await toggleWish(it.id, !it.done);
                    if (!r.ok) toast.error("Kaydedilemedi");
                    else if (!it.done) toast.success("Bir tik daha ✦");
                  }}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                    it.done ? "border-transparent bg-gradient-to-b from-[#fbf5e8] to-[#c9b089] text-midnight" : "border-white/25 hover:border-champagne",
                  )}
                  aria-label={it.done ? "Tamamlanmadı yap" : "Tamamlandı"}
                >
                  {it.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-champagne/20 bg-champagne/[.07] text-champagne">
                  <Gift className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-[0.98rem]", it.done && "text-ink-soft line-through decoration-white/25")}>{it.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-soft">
                  {it.category && <span>{it.category}</span>}
                  {it.price && <span className="text-gold">{it.price}</span>}
                  {it.note && <span className="truncate">{it.note}</span>}
                </p>
              </div>
              {it.url && (
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-ink-soft hover:text-champagne" aria-label="Bağlantıyı aç">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={async () => {
                  setItems((x) => x.filter((y) => y.id !== it.id));
                  await deleteWish(it.id);
                }}
                className="rounded-full p-2 text-ink-soft opacity-60 transition-opacity hover:text-bordo group-hover:opacity-100"
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {shown.length === 0 && (
        <div className="mt-10 text-center">
          <p className="display text-3xl italic text-ink-soft">{tab === "istek" ? "Henüz bir dileğin yok" : "2027 seni bekliyor"}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {tab === "istek" ? "Aklındaki ilk hediyeyi yaz, linkini ekle." : "Bir hedef yaz, kategorisini seç. Tamamlayınca tikle."}
          </p>
        </div>
      )}
    </div>
  );
}

function AddForm({ kind, onAdd, defaultCat }: { kind: WishKind; onAdd: (i: WishItem) => void; defaultCat: string | null }) {
  const [title, setTitle] = useState("");
  const [more, setMore] = useState(false);
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(defaultCat ?? "");
  const [pending, start] = useTransition();
  const placeholder = useMemo(
    () => (kind === "istek" ? ["Analog fotoğraf makinesi", "Kaşmir atkı", "Bir kutu Türk kahvesi"] : ["Her ay bir kitap", "Kapadokya'da balon", "Yüzme öğrenmek"])[Math.floor(Math.random() * 3)],
    [kind],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addWish({ kind, title, url, price, category: kind === "hedef" ? category : undefined });
      if (!r.ok) return void toast.error(r.error);
      onAdd(r.item);
      setTitle("");
      setUrl("");
      setPrice("");
    });
  }

  return (
    <form onSubmit={submit} className="sheet mt-5 p-2">
      <div className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          placeholder={`Ör. ${placeholder}`}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[1rem] outline-none placeholder:text-ink-soft/60"
        />
        <button type="button" onClick={() => setMore((m) => !m)} className={cn("rounded-full p-2.5 text-ink-soft hover:text-ink", more && "text-champagne")} aria-label="Ayrıntılar">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button className="btn btn-primary !px-4 !py-2.5" disabled={pending || !title.trim()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ekle
        </button>
      </div>
      {more && (
        <div className="grid gap-2 border-t border-white/[.06] p-2 pt-3 sm:grid-cols-2">
          {kind === "istek" ? (
            <>
              <input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ürün linki (isteğe bağlı)" inputMode="url" />
              <input className="field" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Fiyat (ör. 1.250 TL)" maxLength={40} />
            </>
          ) : (
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {CATS.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? "" : c)}>
                  {c}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active ? "border-champagne/50 bg-champagne/15 text-gold" : "border-white/10 bg-white/[.03] text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="url(#rg)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .6s" }} />
        <defs>
          <linearGradient id="rg">
            <stop offset="0" stopColor="#fbf5e8" />
            <stop offset="1" stopColor="#c9b089" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-sm text-ink-soft">
        <b className="display text-2xl text-ink">%{pct}</b>
      </span>
    </div>
  );
}
