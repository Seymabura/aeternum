"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { GlobeHero } from "@/components/globe-hero";
import { sealCapsule } from "@/app/actions/extras";
import { TASKS } from "@/lib/tasks";
import Link from "next/link";

type Status = { sealedAt: string; opensAt: string; chars: number; hasEmail: boolean } | null;

const PROMPTS = [
  "Şu an en çok neyi merak ediyorum:",
  "Bu yıl beni en çok güldüren şey:",
  "2027'de umarım şunu başarmışsındır:",
  "Unutma ki:",
  "Şu an yanımdaki insanlar:",
];

export function Capsule({ status, opened, days, lights, today }: { status: Status; opened: string | null; days: number[]; lights: number; today: number }) {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [flying, setFlying] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const sealed = !!status;
  const daysLeft = status ? Math.max(0, Math.ceil((new Date(status.opensAt + "T00:00:00+03:00").getTime() - Date.now()) / 86400000)) : 0;

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
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.05fr]">
      <div className="lg:sticky lg:top-24">
        <GlobeHero days={days} lights={lights} />
        <p className="hand -mt-2 text-center text-2xl text-gold/70">küreye dokun, karı savur</p>
      </div>

      <div>
        <p className="eyebrow">Kar küren</p>
        <h1 className="display mt-5 text-[2.75rem] sm:text-[4rem]">
          Her gün <em className="gold-shine italic">biraz daha</em> senin.
        </h1>
        <p className="mt-5 max-w-md text-ink-soft">Tamamladığın her görev kürene bir süs, her küçük ritüel bir peri ışığı ekler. 31 Aralık&apos;ta küren dolmuş olur.</p>
        <div className="mt-10 grid grid-cols-3 gap-3">
          <Stat n={days.length} total="/31" label="süs" />
          <Stat n={lights} total="/17" label="ışık" />
          <Stat n={status ? 1 : 0} total="/1" label="mektup" />
        </div>
        {(() => {
          const next = TASKS.find((t) => !days.includes(t.day) && t.day <= Math.max(today, 1));
          const tomorrow = TASKS.find((t) => t.day === today + 1);
          return next ? (
            <Link href={`/takvim/${next.day}`} className="sheet spot lift mt-3 flex items-center justify-between gap-3 px-6 py-5">
              <span>
                <span className="block text-sm text-ink-soft">Sıradaki süs</span>
                <span className="display mt-1 block text-[1.5rem]">{next.gift}</span>
              </span>
              <span className="text-sm text-champagne">{next.day} Aralık</span>
            </Link>
          ) : tomorrow ? (
            <p className="mt-4 text-sm text-ink-soft">Yarının süsü: <span className="text-gold">{tomorrow.gift}</span></p>
          ) : null;
        })()}
        <div className="hairline my-16" />
        <p className="eyebrow">2027&apos;ye mesaj</p>
        {opened ? (
          <>
            <h2 className="display mt-3 text-4xl sm:text-5xl">
              Bir yıl önceki <em className="gold-shine italic">senden</em>
            </h2>
            <article className="paper-tex relative mt-8 rounded-[6px] p-8 text-[#1a1408] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]">
              <WaxSeal className="absolute -right-4 -top-4" broken />
              <p className="hand whitespace-pre-wrap text-[1.7rem] leading-snug">{opened}</p>
            </article>
          </>
        ) : sealed ? (
          <>
            <h2 className="display mt-3 text-4xl sm:text-5xl">
              Mesajın <em className="gold-shine italic">kürede</em>
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              {new Date(status!.sealedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde kapattın. Kimse
              okuyamaz, sen bile. 31 Aralık 2027 gece yarısı açılacak.
            </p>
            <div className="sheet relative mt-8 flex items-center gap-6 p-7" style={{ borderColor: "rgba(220,199,161,.22)" }}>
              <WaxSeal />
              <div>
                <p className="text-sm text-ink-soft">Açılmasına</p>
                <p className="display num text-[3.5rem] leading-none text-ink">
                  {daysLeft} <span className="text-[1.5rem] italic text-champagne">gün</span>
                </p>
              </div>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
              {status!.hasEmail ? (
                <>
                  <Mail className="h-4 w-4 text-champagne" strokeWidth={1.5} /> O gün e-postana da gönderilecek.
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-champagne" strokeWidth={1.5} /> Açılış günü bu cihazdan Aeternum&apos;a girmen yeterli.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h2 className="display mt-3 text-4xl sm:text-5xl">
              2027&apos;deki <em className="gold-shine italic">kendine</em> yaz
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">Mektubunu küreye kapat. 31 Aralık 2027&apos;ye kadar kimse okuyamaz, sen bile.</p>

            <AnimatePresence>
              {!flying && (
                <motion.div
                  style={{ transformPerspective: 900, transformOrigin: "50% 0%" }}
                  exit={{ rotateX: [0, 70, 70], scale: [1, 0.6, 0.08], x: [0, 0, -280], y: [0, 40, -160], opacity: [1, 1, 0] }}
                  transition={{ duration: 1.4, times: [0, 0.4, 1], ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="paper-tex relative mt-8 rounded-[6px] p-6 text-[#1a1408] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] sm:p-8">
                    <WaxSeal className="absolute -right-4 -top-4" />
                    <p className="hand text-[1.6rem]">Sevgili 2027&apos;deki ben,</p>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={9}
                      maxLength={6000}
                      placeholder="Bugün..."
                      className="hand mt-2 w-full resize-none bg-[repeating-linear-gradient(180deg,transparent_0_calc(2.1rem-1px),rgba(80,60,20,.14)_calc(2.1rem-1px)_2.1rem)] bg-[length:100%_2.1rem] text-[1.5rem] leading-[2.1rem] text-[#1a1408] outline-none placeholder:text-[#1a1408]/35"
                    />
                    <p className="num mt-1 text-right text-xs text-[#1a1408]/50">{text.length}/6000</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!flying && (
              <>
                <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
                  {PROMPTS.map((p) => (
                    <button key={p} onClick={() => setText((t) => (t ? t + "\n\n" : "") + p + " ")} className="shrink-0 rounded-full border border-champagne/12 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-champagne/30 hover:text-ink">
                      {p}
                    </button>
                  ))}
                </div>
                <label className="mt-5 block">
                  <span className="label">E-posta (isteğe bağlı)</span>
                  <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Açılış günü e-postana da gelsin" />
                </label>
                <button className="btn btn-primary mt-8 w-full sm:w-auto" disabled={text.trim().length < 3} onClick={() => setConfirm(true)}>
                  Mühürle ve küreye bırak ✦
                </button>
              </>
            )}
          </>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(4,6,12,0.8)] px-6 backdrop-blur-sm" onClick={() => setConfirm(false)}>
          <div className="sheet-solid w-full max-w-sm p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <WaxSeal className="mx-auto" />
            <h2 className="display mt-5 text-[2rem]">Mühürlensin mi?</h2>
            <p className="mt-3 text-ink-soft">Kapattıktan sonra mesajı değiştiremez ve okuyamazsın. 31 Aralık 2027&apos;de açılacak.</p>
            <div className="mt-6 grid gap-2">
              <button className="btn btn-primary" onClick={seal} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Mühürle
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

function Stat({ n, total, label }: { n: number; total: string; label: string }) {
  return (
    <div className="sheet px-3 py-5 text-center">
      <p className="display num text-[2.25rem] leading-none text-ink">
        {n}
        <span className="text-base text-ink-mute">{total}</span>
      </p>
      <p className="mt-2 text-xs text-ink-soft">{label}</p>
    </div>
  );
}

/** Bordo balmumu mühür, ✦ baskılı */
function WaxSeal({ className, broken }: { className?: string; broken?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={"h-16 w-16 shrink-0 drop-shadow-[0_8px_12px_rgba(0,0,0,.45)] " + (className ?? "")} aria-hidden>
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#c45a62" />
          <stop offset=".55" stopColor="#8f2f39" />
          <stop offset="1" stopColor="#5e1a24" />
        </radialGradient>
      </defs>
      <path
        d="M32 3c4 0 6 3 9 4s7 0 9 3 1 6 3 9 5 5 5 9-3 6-4 9 0 7-3 9-6 1-9 3-5 5-9 5-6-3-9-4-7 0-9-3-1-6-3-9-5-5-5-9 3-6 4-9 0-7 3-9 6-1 9-3 5-4 9-4Z"
        fill="url(#wax)"
      />
      <circle cx="32" cy="32" r="17" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="2" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="rgba(255,200,200,.15)" strokeWidth="1" transform="translate(-.6 -.6)" />
      <path d="M32 21c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10Z" fill="rgba(40,8,14,.55)" />
      {broken && <path d="M14 18l14 16-6 12" fill="none" stroke="#3a0e15" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}
