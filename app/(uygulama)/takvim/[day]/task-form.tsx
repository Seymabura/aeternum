"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Camera, Loader2, Share2 } from "lucide-react";
import { taskStoryCard } from "@/lib/story-card";
import { shareOrDownload } from "@/lib/share";
import { saveTask } from "@/app/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import type { Task, TaskAnswer } from "@/lib/tasks";
import { ProgressRing } from "@/components/progress-ring";

export function TaskForm({
  task,
  userId,
  initial,
  initialPhoto,
  initialPath,
  days,
}: {
  days: number[];
  task: Task;
  userId: string;
  initial: TaskAnswer | null;
  initialPhoto: string | null;
  initialPath: string | null;
}) {
  const [a, setA] = useState<TaskAnswer>(initial ?? (task.kind === "list3" ? { items: ["", "", ""] } : {}));
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [path, setPath] = useState<string | null>(initialPath);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const set = (patch: Partial<TaskAnswer>) => setA((x) => ({ ...x, ...patch }));

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return void toast.error("Bir fotoğraf seçmelisin.");
    setUploading(true);
    try {
      const blob = await compressImage(f);
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      const p = `${userId}/gorev/${task.day}-${Date.now()}.${ext}`;
      const { error } = await createClient().storage.from("uploads").upload(p, blob, { contentType: blob.type });
      if (error) throw error;
      setPath(p);
      setPhoto(URL.createObjectURL(blob));
    } catch {
      toast.error("Fotoğraf yüklenemedi, tekrar dener misin?");
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveTask(task.day, a, path);
      if (!r.ok) return void toast.error(r.error);
      if (r.first) setCelebrate(true);
      if (task.kind === "do") set({ done: true });
      else toast.success("Güncellendi");
      router.refresh();
    });
  }

  return (
    <>
      <form onSubmit={submit} className="mt-10 space-y-5">
        {task.kind === "letter" && (
          <div className="rounded-[14px] border border-champagne/15 bg-[rgba(14,13,18,0.55)] p-5 text-center">
            <p className="text-ink-soft">Mektubunu yazıp mühürlüyorsun. 31 Aralık 2027&apos;de açılacak.</p>
            <Link href="/mektup" className="btn btn-primary mt-4">
              Mektubunu yaz
            </Link>
            <p className="mt-3 text-xs text-ink-soft">Mektubu kapattıysan aşağıdan günü tamamla.</p>
          </div>
        )}
        {task.kind === "text" && (
          <textarea
            className="field min-h-48"
            rows={6}
            maxLength={2000}
            value={a.text ?? ""}
            onChange={(e) => set({ text: e.target.value })}
            placeholder="Buraya yaz..."
          />
        )}
        {task.kind === "list3" &&
          [0, 1, 2].map((i) => (
            <div key={i}>
              <label className="label">{task.labels?.[i]}</label>
              <input
                className="field hand !text-[1.45rem]"
                maxLength={240}
                value={a.items?.[i] ?? ""}
                onChange={(e) => {
                  const items = [...(a.items ?? ["", "", ""])];
                  items[i] = e.target.value;
                  set({ items });
                }}
              />
            </div>
          ))}
        {task.kind === "do" && (
          <>
            <div className="rounded-[14px] border border-champagne/15 bg-[rgba(14,13,18,0.55)] p-4 text-sm text-ink-soft">
              Yaptığında aşağıdaki düğmeye bas; yeni yıla 31 adımından biri daha tamamlanacak.
            </div>
            {task.ask && (
              <div>
                <label className="label">{task.ask} (isteğe bağlı)</label>
                <textarea className="field" rows={3} maxLength={600} value={a.note ?? ""} onChange={(e) => set({ note: e.target.value })} />
              </div>
            )}
          </>
        )}
        {task.kind === "word" && (
          <>
            <input
              className="field display !py-4 text-center !text-3xl italic"
              maxLength={40}
              placeholder="tek kelime"
              value={a.word ?? ""}
              onChange={(e) => set({ word: e.target.value })}
            />
            <div>
              <label className="label">Neden bu kelime? (isteğe bağlı)</label>
              <textarea className="field" rows={3} maxLength={400} value={a.why ?? ""} onChange={(e) => set({ why: e.target.value })} />
            </div>
          </>
        )}
        {task.kind === "photo" && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative mx-auto block w-full max-w-xs -rotate-1 bg-[#fffdf8] p-3 pb-14 shadow-[var(--shadow-lift)]"
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-paper-2">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-latte" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-ink-soft">
                    <Camera className="h-7 w-7" strokeWidth={1.5} /> Fotoğraf seç
                  </span>
                )}
              </div>
              <span className="hand absolute bottom-3 left-0 right-0 text-center text-xl text-ink-soft">
                {photo ? "değiştirmek için dokun" : "polaroid'in burada"}
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <div>
              <label className="label">Kısa bir not</label>
              <input className="field hand !text-[1.45rem]" maxLength={240} value={a.caption ?? ""} onChange={(e) => set({ caption: e.target.value })} />
            </div>
            <p className="text-xs text-ink-soft">Fotoğrafın gizli kalır, sadece sen görürsün.</p>
          </>
        )}
        <button className="btn btn-primary w-full sm:w-auto sm:min-w-56" disabled={pending || uploading}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Güncelle" : task.kind === "do" ? "Yaptım ✦" : "Tamamla ✦"}
        </button>
      </form>

      <AnimatePresence>{celebrate && <Celebration day={task.day} title={task.title} gift={task.gift} days={days} onClose={() => setCelebrate(false)} />}</AnimatePresence>
    </>
  );
}

function Celebration({ day, title, gift, days, onClose }: { day: number; title: string; gift: string; days: number[]; onClose: () => void }) {
  const all = Array.from(new Set([...days, day]));
  const [sharing, setSharing] = useState(false);
  async function share() {
    setSharing(true);
    try {
      const blob = await taskStoryCard({ day, title, done: all });
      await shareOrDownload(blob, `aeternum-gun-${String(day).padStart(2, "0")}.png`, "Aeternum");
    } catch {
      toast.error("Kart hazırlanamadı. Tekrar dene.");
    } finally {
      setSharing(false);
    }
  }
  // hafif altın parçacıklar (sabit tohumlu, render saf kalsın)
  const sparks = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 37) % 100,
    d: 2.6 + ((i * 13) % 10) / 4,
    delay: ((i * 7) % 20) / 10,
    s: 2 + (i % 3),
  }));
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-[rgba(2,2,3,0.92)] px-6 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${day}. gün tamamlandı`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {sparks.map((p, i) => (
          <motion.span
            key={i}
            className="absolute top-[-2%] rounded-full bg-gold"
            style={{ left: `${p.x}%`, width: p.s, height: p.s, boxShadow: "0 0 8px rgba(233,220,192,.8)" }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: "105vh", opacity: [0, 1, 1, 0] }}
            transition={{ duration: p.d * 2, delay: 0.8 + p.delay, ease: "linear" }}
          />
        ))}
      </div>
      <motion.div
        className="relative w-full max-w-md text-center"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ProgressRing done={all} fresh={day} className="max-w-[300px]">
          <span className="display num text-[3.6rem] leading-none">{String(day).padStart(2, "0")}</span>
          <span className="mt-1 text-xs text-ink-soft">Aralık</span>
        </ProgressRing>
        <h2 className="display mt-4 text-[2.5rem] sm:text-[3rem]">
          Bugün <em className="gold-shine italic">tamam.</em>
        </h2>
        <p className="num mt-4 text-ink-soft">{all.length}/31 adım. Yeni yıla bir adım daha yaklaştın.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={share} disabled={sharing}>
            {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" strokeWidth={1.5} />} Hikâye olarak paylaş
          </button>
          <Link href="/takvim" className="btn btn-ghost">
            Takvime dön
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
