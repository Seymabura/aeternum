"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Flag, Loader2, Share2, Trash2, X } from "lucide-react";
import { deleteLantern, releaseLantern, reportLantern, type SkyLantern } from "@/app/actions/fener";
import { lanternProblem } from "@/lib/lantern-filter";
import { shareOrDownload } from "@/lib/share";
import { lanternStoryCard } from "@/lib/story-card";

const Scene = dynamic(() => import("./lantern-scene"), {
  ssr: false,
  loading: () => <div aria-hidden className="night-stars fixed inset-0 -z-[5] bg-night" />,
});

export function LanternSky({ initial }: { initial: SkyLantern[] }) {
  const [list, setList] = useState(initial);
  const [fresh, setFresh] = useState<string | null>(null);
  const [picked, setPicked] = useState<SkyLantern | null>(null);
  const [text, setText] = useState("");
  const [priv, setPriv] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [last, setLast] = useState<SkyLantern | null>(null);
  const [hideText, setHideText] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [pending, start] = useTransition();

  function release(e: React.FormEvent) {
    e.preventDefault();
    const p = lanternProblem(text);
    if (p) return setErr(p);
    setErr(null);
    start(async () => {
      const r = await releaseLantern(text, priv);
      if (!r.ok) return setErr(r.error);
      setList((l) => [r.lantern, ...l]);
      setFresh(r.lantern.id);
      setLast(r.lantern);
      setText("");
      toast.success("Fenerin gökyüzünde");
    });
  }

  async function share() {
    if (!last) return;
    setSharing(true);
    try {
      await shareOrDownload(await lanternStoryCard(hideText ? null : last.text), "aeternum-fener.png", "Dilek feneri");
    } catch {
      toast.error("Kart hazırlanamadı. Tekrar dene.");
    } finally {
      setSharing(false);
    }
  }

  const others = list.filter((l) => !l.mine).length;

  return (
    <div className="relative -mx-5 -mt-10 min-h-[calc(100dvh-5rem)] sm:-mx-8">
      <Scene lanterns={list} fresh={fresh} onPick={setPicked} />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[1240px] flex-col justify-between px-5 pb-40 pt-8 sm:px-8 md:pb-10">
        <div className="max-w-xl">
          <h1 className="display text-[2.75rem] leading-[1] sm:text-[4.25rem]">Dilek feneri</h1>
          <p className="mt-4 max-w-md text-ink-soft">
            Dileğini yaz ve fenerini bırak. Herkesin feneri aynı gökyüzünde süzülür; kimin olduğu görünmez. Bir fenere dokunursan dileğini okursun.
          </p>
          <p className="num mt-3 text-sm text-ink-mute">{others > 0 ? `Gökyüzünde ${others} fener daha var.` : "Gökyüzündeki ilk fener seninki olabilir."}</p>
        </div>

        <div className="pointer-events-auto mt-10 w-full max-w-md self-start rounded-[24px] border border-nar-soft/20 bg-[rgba(10,6,8,0.72)] p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,1),0_0_60px_-30px_rgba(158,27,50,.7)] backdrop-blur-xl sm:p-6">
          {last ? (
            <div>
              <p className="display text-[1.6rem]">Fenerin gökyüzünde.</p>
              <p className="mt-2 text-sm text-ink-soft">{last.text}</p>
              <label className="mt-5 flex items-center gap-2.5 text-sm text-ink-soft">
                <input type="checkbox" checked={hideText} onChange={(e) => setHideText(e.target.checked)} className="h-4 w-4 accent-[#d2465c]" />
                Kartta dileğim yazmasın
              </label>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn btn-primary btn-sm" onClick={share} disabled={sharing}>
                  {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" strokeWidth={1.5} />} Hikâye olarak paylaş
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setLast(null)}>
                  Bir fener daha
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={release}>
              <label htmlFor="dilek" className="text-sm text-ink-soft">
                Dileğin
              </label>
              <textarea
                id="dilek"
                rows={2}
                maxLength={80}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setErr(null);
                }}
                aria-invalid={!!err}
                aria-describedby={err ? "dilek-hata" : undefined}
                placeholder="2027'de..."
                className="field mt-2 resize-none text-[1.05rem]"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink-mute">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} className="h-4 w-4 accent-[#d2465c]" />
                  Sadece ben göreyim
                </label>
                <span className="num">{text.length}/80</span>
              </div>
              {err && (
                <p id="dilek-hata" role="alert" className="mt-3 text-sm text-nar-soft">
                  {err}
                </p>
              )}
              <button className="btn btn-primary mt-5 w-full" disabled={pending || text.trim().length < 2}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Feneri bırak
              </button>
            </form>
          )}
        </div>
      </div>

      <AnimatePresence>
        {picked && (
          <motion.div
            className="fixed inset-x-4 bottom-28 z-50 mx-auto max-w-sm rounded-[22px] border border-champagne/20 bg-[rgba(8,6,8,0.86)] p-6 text-center shadow-[0_40px_80px_-30px_rgba(0,0,0,1)] backdrop-blur-xl md:bottom-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Fenerdeki dilek"
          >
            <button aria-label="Kapat" onClick={() => setPicked(null)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:text-ink">
              <X className="h-4 w-4" />
            </button>
            <p className="display px-4 text-[1.5rem] italic leading-snug">“{picked.text}”</p>
            <p className="mt-3 text-xs text-ink-mute">
              {picked.mine ? "Senin fenerin" : "Bir dilek"}, {new Date(picked.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
            </p>
            <div className="mt-4 flex justify-center">
              {picked.mine ? (
                <button
                  className="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink"
                  onClick={async () => {
                    const r = await deleteLantern(picked.id);
                    if (!r.ok) return void toast.error(r.error);
                    setList((l) => l.filter((x) => x.id !== picked.id));
                    setPicked(null);
                    toast("Fenerin söndü");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Fenerimi söndür
                </button>
              ) : (
                <button
                  className="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink"
                  onClick={async () => {
                    await reportLantern(picked.id);
                    setList((l) => l.filter((x) => x.id !== picked.id));
                    setPicked(null);
                    toast("Bildirdin, teşekkürler");
                  }}
                >
                  <Flag className="h-3.5 w-3.5" /> Uygunsuz, bildir
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
