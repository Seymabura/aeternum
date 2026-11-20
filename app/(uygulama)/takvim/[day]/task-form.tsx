"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { saveTask } from "@/app/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import type { Task, TaskAnswer } from "@/lib/tasks";

export function TaskForm({
  task,
  userId,
  initial,
  initialPhoto,
  initialPath,
}: {
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
      else toast.success("Güncellendi");
      router.refresh();
    });
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {(task.kind === "text" || task.kind === "letter") && (
          <textarea
            className="field min-h-48"
            rows={task.kind === "letter" ? 12 : 6}
            maxLength={task.kind === "letter" ? 6000 : 2000}
            value={a.text ?? ""}
            onChange={(e) => set({ text: e.target.value })}
            placeholder={task.kind === "letter" ? "Sevgili 2027'deki ben..." : "Buraya yaz..."}
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
        {task.kind === "song" && (
          <>
            <div>
              <label className="label">Şarkı</label>
              <input className="field" maxLength={120} value={a.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
            </div>
            <div>
              <label className="label">Sanatçı</label>
              <input className="field" maxLength={120} value={a.artist ?? ""} onChange={(e) => set({ artist: e.target.value })} />
            </div>
            <div>
              <label className="label">Link (isteğe bağlı)</label>
              <input
                className="field"
                type="url"
                maxLength={300}
                placeholder="https://open.spotify.com/..."
                value={a.link ?? ""}
                onChange={(e) => set({ link: e.target.value })}
              />
            </div>
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
                    <Camera className="h-8 w-8" /> Fotoğraf seç
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
        <button className="btn btn-primary w-full py-3.5 text-base" disabled={pending || uploading}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Güncelle" : task.kind === "letter" ? "Mektubu kilitle" : "Kavanoza at"}
        </button>
      </form>

      <AnimatePresence>{celebrate && <Celebration onClose={() => setCelebrate(false)} />}</AnimatePresence>
    </>
  );
}

function Celebration({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet relative w-full max-w-sm overflow-hidden p-7 text-center"
        initial={{ y: 30, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* kavanoz ve düşen kağıt */}
        <div className="relative mx-auto h-36 w-28">
          <motion.div
            className="absolute left-1/2 top-0 h-6 w-9 -translate-x-1/2 rounded-sm bg-[#fdf3c8] shadow"
            initial={{ y: -40, rotate: -20, opacity: 0 }}
            animate={{ y: 78, rotate: 14, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.3, 0.6, 0.3, 1] }}
          />
          <svg viewBox="0 0 100 130" className="absolute inset-0 h-full w-full">
            <rect x="26" y="6" width="48" height="14" rx="4" fill="#a9835f" stroke="#2e2019" strokeWidth="2" />
            <path d="M22 26h56c6 0 10 5 10 11v76c0 8-6 13-13 13H25c-7 0-13-5-13-13V37c0-6 4-11 10-11Z" fill="rgba(255,250,241,.55)" stroke="#2e2019" strokeWidth="2.2" />
            <path d="M24 44c-2 18-2 40 0 62" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
          </svg>
        </div>
        <h2 className="display mt-3 text-2xl">Kavanoza düştü</h2>
        <p className="mt-2 text-ink-soft">Boyama resminde yeni bir bölüm açıldı. Notun 31 Aralık gecesine kadar kavanozda saklı.</p>
        <div className="mt-6 grid gap-2">
          <Link href="/boyama" className="btn btn-primary py-3">
            Boyamaya git 🎨
          </Link>
          <Link href="/takvim" className="btn btn-ghost py-3">
            Takvime dön
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
