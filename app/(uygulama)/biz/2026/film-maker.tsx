"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Copy, Download, ImagePlus, Link2, Pencil, X } from "lucide-react";
import { FilmPlayer, type FilmHandle } from "@/components/biz/film-player";
import { ConsentDialog } from "@/components/biz/consent-dialog";
import { MONTHS_TR, type FilmData } from "@/lib/film/engine";
import { compressImage } from "@/lib/image";
import { shareOrDownload } from "@/lib/share";
import { createClient } from "@/lib/supabase/client";
import { todayIso } from "@/lib/astro/time";
import { cn } from "@/lib/utils";

type Slot = { blob: Blob; url: string; note: string } | null;
const STEPS = ["İsimler", "Tarih", "Fotoğraflar", "Şarkı", "Kelime", "Son cümle"];

export function FilmMaker({ userId }: { userId: string }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [met, setMet] = useState("");
  const [slots, setSlots] = useState<Slot[]>(() => Array(12).fill(null));
  const [song, setSong] = useState({ title: "", artist: "" });
  const [word, setWord] = useState("");
  const [line, setLine] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const count = slots.filter(Boolean).length;
  const film: FilmData | null = useMemo(
    () =>
      done
        ? {
            names: [a.trim(), b.trim()],
            met,
            months: slots.flatMap((s, i) => (s ? [{ m: i + 1, src: s.url, note: s.note.trim() || undefined }] : [])),
            song: song.title.trim() ? { title: song.title.trim(), artist: song.artist.trim() } : null,
            word: word.trim() || undefined,
            line: line.trim() || undefined,
          }
        : null,
    [done, a, b, met, slots, song, word, line],
  );

  function next() {
    if (step === 0 && (!a.trim() || !b.trim())) return setErr("İki ismi de yaz.");
    if (step === 1) {
      if (!met) return setErr("Bir tarih seç.");
      if (met > todayIso()) return setErr("Tarih bugünden sonra olamaz.");
    }
    if (step === 2 && count < 3) return setErr("En az 3 ay için birer fotoğraf seç.");
    if (step === 4 && /\s/.test(word.trim())) return setErr("Tek bir kelime yaz.");
    setErr(null);
    if (step === STEPS.length - 1) return setDone(true);
    setStep((s) => s + 1);
  }

  async function addPhoto(i: number, file?: File) {
    if (!file) return;
    try {
      const blob = await compressImage(file, 1600, 0.85); // yeniden kodlama EXIF/GPS bilgisini siler
      setSlots((s) => {
        const n = [...s];
        if (n[i]) URL.revokeObjectURL(n[i]!.url);
        n[i] = { blob, url: URL.createObjectURL(blob), note: n[i]?.note ?? "" };
        return n;
      });
    } catch {
      toast.error("Bu fotoğraf açılamadı.");
    }
  }

  if (film) return <FilmResult film={film} slots={slots} userId={userId} onEdit={() => (setDone(false), setStep(2))} />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/biz" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Biz
      </Link>
      <p className="eyebrow mt-10">
        Bizim 2026&apos;mız · {step + 1}/{STEPS.length}
      </p>
      <h1 className="display mt-5 text-[2.5rem] sm:text-[3.5rem]">
        {
          [
            "Filmin iki kahramanı",
            "Ne zamandan beri birliktesiniz?",
            "Her aydan bir kare",
            "Yılın şarkısı",
            "2026'yı tek kelimeyle anlat",
            "Ona son bir cümle",
          ][step]
        }
      </h1>
      <p className="mt-4 max-w-lg text-ink-soft">
        {
          [
            "Film boyunca bu isimler görünecek.",
            "Tanıştığınız ya da birlikte olduğunuz gün. Birlikte geçen günleri sayacağız.",
            "En az 3 ay seç. Fotoğraflar bu cihazda küçültülür; konum bilgisi silinir. Sen bağlantı oluşturmadıkça hiçbir yere yüklenmez.",
            "Sadece şarkının adı ve sanatçısı. Ses ya da söz eklemiyoruz.",
            "İsteğe bağlı. Boş bırakabilirsin.",
            "Daktiloyla yazılır gibi belirecek. En fazla 120 karakter.",
          ][step]
        }
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mt-10">
          {step === 0 && (
            <div className="grid max-w-lg grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="fa">Senin adın</label>
                <input id="fa" className="field" maxLength={20} value={a} onChange={(e) => setA(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="fb">Onun adı</label>
                <input id="fb" className="field" maxLength={20} value={b} onChange={(e) => setB(e.target.value)} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="max-w-xs">
              <label className="label" htmlFor="met">Tarih</label>
              <input id="met" type="date" min="1950-01-01" max={todayIso()} className="field [color-scheme:dark]" value={met} onChange={(e) => setMet(e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <>
              <p className="num text-sm text-ink-soft">{count}/12 ay</p>
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {slots.map((s, i) => (
                  <li key={i}>
                    <PhotoSlot
                      month={MONTHS_TR[i]}
                      slot={s}
                      onFile={(f) => addPhoto(i, f)}
                      onRemove={() =>
                        setSlots((x) => {
                          const n = [...x];
                          if (n[i]) URL.revokeObjectURL(n[i]!.url);
                          n[i] = null;
                          return n;
                        })
                      }
                      onNote={(note) =>
                        setSlots((x) => {
                          const n = [...x];
                          if (n[i]) n[i] = { ...n[i]!, note };
                          return n;
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
          {step === 3 && (
            <div className="grid max-w-lg gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="st">Şarkı adı</label>
                <input id="st" className="field" maxLength={60} value={song.title} onChange={(e) => setSong((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="sa">Sanatçı</label>
                <input id="sa" className="field" maxLength={60} value={song.artist} onChange={(e) => setSong((s) => ({ ...s, artist: e.target.value }))} />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="max-w-xs">
              <label className="label" htmlFor="w">Kelime</label>
              <input id="w" className="field display !text-[1.6rem] italic" maxLength={18} value={word} onChange={(e) => setWord(e.target.value)} placeholder="huzur" />
            </div>
          )}
          {step === 5 && (
            <div className="max-w-lg">
              <label className="label" htmlFor="l">Cümlen</label>
              <textarea id="l" className="field !font-sans !text-base !leading-relaxed" rows={3} maxLength={120} value={line} onChange={(e) => setLine(e.target.value)} />
              <p className="num mt-1 text-right text-xs text-ink-mute">{line.length}/120</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {err && <p role="alert" className="mt-5 text-sm text-bordo">{err}</p>}
      <div className="mt-10 flex gap-3">
        {step > 0 && (
          <button className="btn btn-ghost" onClick={() => (setErr(null), setStep((s) => s - 1))}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Geri
          </button>
        )}
        <button className="btn btn-primary" onClick={next}>
          {step === STEPS.length - 1 ? "Filmi oluştur" : "Devam"} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function PhotoSlot({ month, slot, onFile, onRemove, onNote }: { month: string; slot: Slot; onFile: (f?: File) => void; onRemove: () => void; onNote: (n: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn("relative block aspect-[3/4] w-full overflow-hidden rounded-[14px] border text-left transition-colors", slot ? "border-champagne/25" : "border-dashed border-champagne/15 hover:border-champagne/40")}
        aria-label={`${month} fotoğrafı ${slot ? "değiştir" : "ekle"}`}
      >
        {slot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-ink-mute">
            <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
          </span>
        )}
        <span className="display absolute left-2.5 top-2 text-[1.05rem] italic text-ink [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">{month}</span>
      </button>
      {slot && (
        <div className="mt-1.5 flex items-center gap-1">
          <input className="min-w-0 flex-1 rounded-[10px] border border-champagne/10 bg-transparent px-2 py-1.5 text-xs outline-none focus:border-champagne/40" maxLength={60} placeholder="kısa not" value={slot.note} onChange={(e) => onNote(e.target.value)} />
          <button type="button" onClick={onRemove} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:text-bordo" aria-label={`${month} fotoğrafını kaldır`}>
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

function FilmResult({ film, slots, userId, onEdit }: { film: FilmData; slots: Slot[]; userId: string; onEdit: () => void }) {
  const player = useRef<FilmHandle>(null);
  const [rec, setRec] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const [sharing, setSharing] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  /** Onay verildikten sonra fotoğrafları paylaşılan (herkese açık) klasöre kopyalar */
  async function upload() {
    const supabase = createClient();
    const months: { m: number; path: string; note?: string }[] = [];
    try {
      for (let i = 0; i < 12; i++) {
        const s = slots[i];
        if (!s) continue;
        const path = `${userId}/film/${crypto.randomUUID()}.${s.blob.type === "image/webp" ? "webp" : "jpg"}`;
        const { error } = await supabase.storage.from("shared").upload(path, s.blob, { contentType: s.blob.type, upsert: false });
        if (error) throw error;
        months.push({ m: i + 1, path, note: s.note.trim() || undefined });
      }
    } catch (e) {
      if (months.length) await supabase.storage.from("shared").remove(months.map((m) => m.path));
      throw e;
    }
    return { payload: { names: film.names, met: film.met, months, song: film.song, word: film.word, line: film.line }, files: months.map((m) => m.path) };
  }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-16">
      <FilmPlayer ref={player} film={film} className="mx-auto max-w-[24rem] shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
      <div className="lg:sticky lg:top-28">
        <p className="eyebrow">Bizim 2026&apos;mız</p>
        <h1 className="display mt-5 text-[2.5rem] sm:text-[3.25rem]">
          {film.names[0]} <span className="gold-shine italic">&</span> {film.names[1]}
        </h1>
        <p className="mt-4 text-ink-soft">Sağa dokun: sonraki sahne. Sola dokun: önceki. Basılı tut: duraklat. Klavyede ← → ve boşluk.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {rec === null ? (
            <button
              className="btn btn-primary"
              onClick={async () => {
                abort.current = new AbortController();
                setRec(0);
                try {
                  const { blob, ext } = await player.current!.record((p) => setRec(p), abort.current.signal);
                  await shareOrDownload(blob, `aeternum-bizim-2026.${ext}`, "Bizim 2026'mız");
                } catch (e) {
                  if ((e as Error).name !== "AbortError") toast.error((e as Error).message || "Video kaydedilemedi.");
                } finally {
                  setRec(null);
                }
              }}
            >
              <Download className="h-4 w-4" strokeWidth={1.5} /> Video olarak indir
            </button>
          ) : (
            <div className="sheet flex min-h-12 w-full max-w-sm items-center gap-4 px-5">
              <span className="num text-sm text-ink-soft">Kaydediliyor %{Math.round(rec * 100)}</span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full bg-champagne" style={{ width: `${rec * 100}%` }} />
              </span>
              <button className="text-sm text-bordo" onClick={() => abort.current?.abort()}>
                İptal
              </button>
            </div>
          )}
          <button className="btn btn-ghost" onClick={onEdit} disabled={rec !== null}>
            <Pencil className="h-4 w-4" strokeWidth={1.5} /> Düzenle
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-mute">Kayıt gerçek zamanlı yapılır (yaklaşık 1 dakika), sekmeyi açık tut.</p>
        <div className="mt-10">
          {link ? (
            <div className="sheet flex items-center gap-3 p-3 pl-5">
              <Check className="h-4 w-4 shrink-0 text-champagne" />
              <span className="min-w-0 flex-1 truncate text-sm">{link.replace(/^https?:\/\//, "")}</span>
              <button className="btn btn-ghost btn-sm" onClick={async () => (await navigator.clipboard.writeText(link), toast.success("Bağlantı kopyalandı"))}>
                <Copy className="h-4 w-4" strokeWidth={1.5} /> Kopyala
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => setSharing(true)}>
              <Link2 className="h-4 w-4" strokeWidth={1.5} /> Bağlantı oluştur
            </button>
          )}
        </div>
      </div>
      {sharing && (
        <ConsentDialog kind="film" prepare={upload} onClose={() => setSharing(false)} onShared={(u) => (setLink(u), setSharing(false))} />
      )}
    </div>
  );
}
