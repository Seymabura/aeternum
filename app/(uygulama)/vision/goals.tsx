"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { addWish, deleteWish, toggleWish, type WishItem } from "@/app/actions/extras";
import { cn } from "@/lib/utils";

const CATS = ["Seyahat", "Kariyer", "Sağlık", "Kendim", "Sevdiklerim", "Öğrenme", "Ev", "Para"];

/** 2027 hedefleri: vision board'un yazılı yarısı */
export function Goals({ initial }: { initial: WishItem[] }) {
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Kendim");
  const [pending, start] = useTransition();
  const done = items.filter((i) => i.done).length;

  return (
    <section className="mt-24 grid gap-12 border-t border-champagne/10 pt-16 md:mt-32 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16 md:pt-24">
      <div className="md:sticky md:top-28 md:self-start">
        <p className="eyebrow">2027 hedeflerim</p>
        <h2 className="display mt-5 text-[2.5rem] sm:text-[3rem]">
          Hayalden <em className="gold-shine italic">plana</em>
        </h2>
        <p className="mt-4 text-ink-soft">Panodaki hayalleri küçük, yazılı adımlara çevir.</p>
        {items.length > 0 && (
          <p className="num mt-8 text-ink-soft">
            <span className="display text-[3rem] leading-none text-ink">{done}</span>
            <span className="text-ink-mute"> / {items.length}</span> tamam
          </p>
        )}

        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await addWish({ kind: "hedef", title, category: cat });
              if (!r.ok) return void toast.error(r.error);
              setItems((x) => [...x, r.item]);
              setTitle("");
            });
          }}
        >
          <label className="sr-only" htmlFor="goal">Yeni hedef</label>
          <input id="goal" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} placeholder="Ör. Her ay bir kitap" className="field" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={cn(
                  "min-h-9 rounded-full border px-3.5 text-xs transition-colors",
                  cat === c ? "border-champagne/50 text-champagne" : "border-champagne/10 text-ink-soft hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="btn btn-primary mt-5" disabled={pending || !title.trim()}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={1.5} />} Hedefi ekle
          </button>
        </form>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-start justify-center border-y border-champagne/10 py-12">
            <p className="display text-[1.75rem]">Henüz bir hedef yok</p>
            <p className="mt-2 text-ink-soft">Soldan ilk hedefini yaz; tamamladıkça işaretlersin.</p>
          </div>
        ) : (
          <ol className="border-t border-champagne/10">
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <motion.li
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group grid grid-cols-[2rem_1fr_auto_auto] items-center gap-4 border-b border-champagne/10 py-5"
                >
                  <span className="display num text-sm italic text-ink-mute">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    {it.category && <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-champagne/70">{it.category}</p>}
                    <p className="relative mt-1 inline-block max-w-full truncate text-[1.0625rem] leading-snug">
                      <span className={cn("transition-colors duration-500", it.done && "text-ink-soft")}>{it.title}</span>
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-px w-full origin-left bg-champagne transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ transform: `scaleX(${it.done ? 1 : 0})` }}
                      />
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setItems((x) => x.map((y) => (y.id === it.id ? { ...y, done: !y.done } : y)));
                      await toggleWish(it.id, !it.done);
                    }}
                    className="flex h-11 w-11 items-center justify-center"
                    aria-label={it.done ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
                    aria-pressed={it.done}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300",
                        it.done ? "border-transparent bg-[linear-gradient(180deg,#f3e6c8,#dcc7a1_55%,#a88a5c)] text-[#1a1408]" : "border-champagne/30 hover:border-champagne",
                      )}
                    >
                      {it.done && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      setItems((x) => x.filter((y) => y.id !== it.id));
                      await deleteWish(it.id);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-colors hover:text-bordo"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </section>
  );
}
