"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { GlobeHero } from "@/components/globe-hero";
import { sealCapsule } from "@/app/actions/extras";

type Status = { sealedAt: string; opensAt: string; chars: number; hasEmail: boolean } | null;

const PROMPTS = [
  "Şu an en çok neyi merak ediyorum:",
  "Bu yıl beni en çok güldüren şey:",
  "2027'de umarım şunu başarmışsındır:",
  "Unutma ki:",
  "Şu an yanımdaki insanlar:",
];

export function Capsule({ status, opened }: { status: Status; opened: string | null }) {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [flying, setFlying] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const sealed = !!status;
  const days = status ? Math.max(0, Math.ceil((new Date(status.opensAt + "T00:00:00+03:00").getTime() - Date.now()) / 86400000)) : 0;

  function seal() {
    start(async () => {
      const r = await sealCapsule(text, email);
      if (!r.ok) return void toast.error(r.error);
      setConfirm(false);
      setFlying(true);
      setTimeout(() => router.refresh(), 1600);
    });
  }

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
      <div className="order-2 lg:order-1">
        <GlobeHero />
        <p className="hand -mt-2 text-center text-2xl text-gold/70">{sealed ? "mesajın burada, karın altında" : "küreye dokun, karı savur"}</p>
      </div>

      <div className="order-1 lg:order-2">
        <p className="eyebrow">mesaj küresi</p>
        {opened ? (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">
              Bir yıl önceki <em className="gold-shine italic">senden</em>
            </h1>
            <article className="mt-8 rounded-[22px] bg-[#f6f1e6] p-7 text-[#141826] shadow-[var(--shadow-lift)]">
              <p className="hand whitespace-pre-wrap text-[1.7rem] leading-snug">{opened}</p>
            </article>
          </>
        ) : sealed ? (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">
              Mesajın <em className="gold-shine italic">kürede</em>
            </h1>
            <p className="mt-4 max-w-md text-ink-soft">
              {new Date(status!.sealedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde kapattın. Kimse
              okuyamaz, sen bile. 31 Aralık 2027 gece yarısı açılacak.
            </p>
            <div className="sheet beam mt-8 flex items-center gap-5 p-6">
              <span className="display text-7xl text-gold">{days}</span>
              <span className="text-ink-soft">
                gün sonra
                <br />
                <span className="text-ink">açılacak</span>
              </span>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
              {status!.hasEmail ? (
                <>
                  <Mail className="h-4 w-4 text-champagne" /> O gün e-postana da gönderilecek.
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-champagne" /> Açılış günü bu cihazdan Aeternum&apos;a girmen yeterli.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">
              2027&apos;deki <em className="gold-shine italic">kendine</em> yaz
            </h1>
            <p className="mt-4 max-w-md text-ink-soft">Mektubunu küreye kapat. 31 Aralık 2027&apos;ye kadar kimse okuyamaz, sen bile.</p>

            <AnimatePresence>
              {!flying && (
                <motion.div exit={{ scale: 0.12, x: -260, y: 120, rotate: -25, opacity: 0 }} transition={{ duration: 1.1, ease: [0.6, 0, 0.3, 1] }}>
                  <div className="relative mt-7 rounded-[22px] bg-[#f6f1e6] p-6 text-[#141826] shadow-[var(--shadow-lift)] sm:p-7">
                    <p className="hand text-[1.6rem]">Sevgili 2027&apos;deki ben,</p>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={9}
                      maxLength={6000}
                      placeholder="Bugün..."
                      className="hand mt-2 w-full resize-none bg-[repeating-linear-gradient(180deg,transparent_0_calc(2.1rem-1px),rgba(20,24,38,.12)_calc(2.1rem-1px)_2.1rem)] bg-[length:100%_2.1rem] text-[1.5rem] leading-[2.1rem] text-[#141826] outline-none placeholder:text-[#141826]/35"
                    />
                    <p className="mt-1 text-right text-xs text-[#141826]/50">{text.length}/6000</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!flying && (
              <>
                <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
                  {PROMPTS.map((p) => (
                    <button key={p} onClick={() => setText((t) => (t ? t + "\n\n" : "") + p + " ")} className="shrink-0 rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-ink-soft hover:text-ink">
                      {p}
                    </button>
                  ))}
                </div>
                <label className="mt-5 block">
                  <span className="label">E-posta (isteğe bağlı)</span>
                  <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Açılış günü e-postana da gelsin" />
                </label>
                <button className="btn btn-primary mt-6 w-full py-4 text-base" disabled={text.trim().length < 3} onClick={() => setConfirm(true)}>
                  <Lock className="h-4 w-4" /> Küreye kapat
                </button>
              </>
            )}
          </>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm" onClick={() => setConfirm(false)}>
          <div className="sheet-solid w-full max-w-sm p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <Lock className="mx-auto h-8 w-8 text-champagne" />
            <h2 className="display mt-4 text-3xl">Emin misin?</h2>
            <p className="mt-3 text-ink-soft">Kapattıktan sonra mesajı değiştiremez ve okuyamazsın. 31 Aralık 2027&apos;de açılacak.</p>
            <div className="mt-6 grid gap-2">
              <button className="btn btn-primary" onClick={seal} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Evet, kapat
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>
                Biraz daha yazayım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
