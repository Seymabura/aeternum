"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, BellRing, BookOpen, Check, Copy, Loader2, Lock, MessageCircleHeart, Pencil } from "lucide-react";
import { createInvite, type CoupleState } from "@/app/actions/biz";
import { answerJournal, startJournal, type JournalDay, type JournalState } from "@/app/actions/defter";
import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { cn } from "@/lib/utils";

const SITE = "https://aeternum-26.netlify.app";
const wa = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export function Journal({ couple, journal }: { couple: CoupleState; journal: JournalState }) {
  const router = useRouter();
  // sevgilin cevaplamış olabilir: sayfaya dönünce tazele
  useEffect(() => {
    const f = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, [router]);

  const me = couple?.members.find((m) => m.me);
  const partner = couple?.members.find((m) => !m.me);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/biz" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Biz
      </Link>
      {!couple || !partner ? (
        <Invite couple={couple} myName={me?.name ?? ""} />
      ) : !journal ? (
        <Start partner={partner.name} />
      ) : (
        <Book journal={journal} partner={partner.name || "Sevgilin"} />
      )}
    </div>
  );
}

// ------------------------------------------------------------ 1) davet
function Invite({ couple, myName }: { couple: CoupleState; myName: string }) {
  const [name, setName] = useState(myName);
  const [code, setCode] = useState(couple?.invite?.code ?? null);
  const [pending, start] = useTransition();
  const link = code ? `${SITE}/biz/katil/${code}` : "";
  return (
    <section className="mt-10">
      <h1 className="display text-[2.8rem] leading-[1.02] sm:text-[4.2rem]">Ortak defter</h1>
      <p className="mt-5 max-w-lg text-ink-soft">
        30 gün boyunca her gece ikinize aynı soru gelir. İkiniz de cevaplayınca cevaplar birlikte açılır; birbirinizi etkilemeden yazarsınız. Sonunda ikinizin anı kitapçığı olur.
      </p>
      <ol className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          ["Davet et", "Sevgiline bir bağlantı gönder."],
          ["Saatinizi seçin", "Her akşam aynı saatte, bir dakika."],
          ["Birlikte doldurun", "30 soru, 30 gün, bir defter."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-[18px] border border-white/[.08] bg-white/[.02] p-5">
            <span className="display num text-[1.6rem] italic text-[#ff9aab]">{i + 1}</span>
            <p className="mt-2 text-ink">{t}</p>
            <p className="mt-1 text-sm text-ink-soft">{d}</p>
          </li>
        ))}
      </ol>

      <div className="sheet mt-10 p-6 sm:p-8">
        {!code ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await createInvite(name);
                if (!r.ok) return void toast.error(r.error);
                setCode(r.code);
              });
            }}
          >
            <label htmlFor="ad" className="label">
              Adın
            </label>
            <input id="ad" className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Defterde görünecek ad" />
            <button className="btn btn-primary mt-6" disabled={pending || !name.trim()}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Davet bağlantısı oluştur
            </button>
          </form>
        ) : (
          <div>
            <p className="text-ink">Davet hazır. Sevgiline gönder; bağlantıya dokununca defter ikinizin olur.</p>
            <p className="num mt-4 select-all break-all rounded-[14px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-gold">{link}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="btn btn-primary" href={wa(`Seninle 30 günlük bir defter tutmak istiyorum 💌 ${link}`)} target="_blank" rel="noopener noreferrer">
                <MessageCircleHeart className="h-4 w-4" /> WhatsApp ile gönder
              </a>
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  toast.success("Bağlantı kopyalandı");
                }}
              >
                <Copy className="h-4 w-4" /> Kopyala
              </button>
            </div>
            <p className="mt-4 text-xs text-ink-mute">Bağlantı 7 gün geçerli. Sevgilin katılınca bu sayfa kendiliğinden deftere dönüşür.</p>
          </div>
        )}
      </div>
      <Preview />
    </section>
  );
}

/** Sevgilin katılmadan önce defterin nasıl görüneceğini gösteren örnek (gerçek veri değil) */
function Preview() {
  const sample: { q: number; me: string; them: string | null; state: "both" | "theirs" }[] = [
    { q: 1, me: "Çok sakin göründün; sonra bir güldün ve hepsi değişti.", them: "Bu kadar güzel gülen biri bana yazar mı diye düşündüm.", state: "both" },
    { q: 6, me: "", them: null, state: "theirs" },
  ];
  return (
    <div className="mt-14">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="display text-[2rem]">Defter böyle görünecek</h2>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-mute">Örnek</span>
      </div>
      <p className="mt-2 max-w-lg text-sm text-ink-soft">Aşağıdakiler örnek cevaplar. Sevgilin katılıp defteri başlatınca ilk soru sizin için açılır.</p>

      <div aria-hidden className="mt-6 grid grid-cols-10 gap-1.5 sm:grid-cols-15">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "grid aspect-[3/4] place-items-center rounded-[6px] border text-[0.65rem] num",
              i < 4
                ? "border-champagne/50 bg-gradient-to-b from-[#f3e2b8] to-[#c9a865] text-[#2a1d08]"
                : i === 4
                  ? "border-nar-soft/60 bg-nar/20 text-[#ffd6dc]"
                  : i === 5
                    ? "border-white/15 bg-white/[.04] text-ink-soft"
                    : "border-white/[.05] bg-white/[.015] text-ink-mute/50",
            )}
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {sample.map((x) => (
          <div key={x.q} aria-label="Örnek defter sayfası" className="sheet relative overflow-hidden p-6" style={{ borderColor: "rgba(220,199,161,.18)" }}>
            <p className="text-xs text-ink-mute">{x.q}. gün</p>
            <h3 className="display mt-2 text-[1.5rem] leading-snug">{JOURNAL_QUESTIONS[x.q - 1]}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[14px] border border-champagne/25 bg-champagne/[.05] p-4">
                <p className="text-[0.7rem] text-ink-mute">Sen</p>
                {x.me ? <p className="mt-1 text-sm text-ink">{x.me}</p> : <p className="hand mt-1 text-lg text-ink-mute">Bir dakikanı al, aklına geleni yaz.</p>}
              </div>
              {x.state === "both" ? (
                <div className="rounded-[14px] border border-nar-soft/35 bg-nar/[.12] p-4">
                  <p className="text-[0.7rem] text-ink-mute">Sevgilin</p>
                  <p className="mt-1 text-sm text-ink">{x.them}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-white/15 p-4 text-center">
                  <Lock className="h-4 w-4 text-[#ff9aab]" />
                  <p className="mt-1.5 text-xs text-ink">Sevgilin cevapladı.</p>
                  <p className="text-[0.7rem] text-ink-soft">Okumak için önce sen yaz.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <details className="mt-6 rounded-[18px] border border-white/[.08] bg-white/[.02] p-5">
        <summary className="cursor-pointer text-sm text-ink">30 sorunun hepsini gör</summary>
        <ol className="mt-4 grid gap-x-8 gap-y-2 text-sm text-ink-soft sm:grid-cols-2">
          {JOURNAL_QUESTIONS.map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="num w-6 shrink-0 text-right text-ink-mute">{i + 1}</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

// ------------------------------------------------------------ 2) başlat
function Start({ partner }: { partner: string }) {
  const [time, setTime] = useState("21:30");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <section className="mt-10">
      <h1 className="display text-[2.8rem] leading-[1.02] sm:text-[4rem]">{partner ? `${partner} ile` : "Sevgilinle"} defteriniz hazır.</h1>
      <p className="mt-5 max-w-lg text-ink-soft">Son bir şey: her akşam soruyu cevaplayacağınız saati seçin. O saatte telefonunuza hatırlatma ekleyebilirsiniz; küçük bir ritüel olur.</p>
      <div className="sheet mt-10 p-6 sm:p-8">
        <label htmlFor="saat" className="label">
          Bizim saatimiz
        </label>
        <input id="saat" type="time" className="field max-w-[12rem] text-[1.4rem]" value={time} onChange={(e) => setTime(e.target.value)} />
        <div className="mt-4 flex flex-wrap gap-2">
          {["08:30", "13:00", "21:30", "23:00"].map((t) => (
            <button key={t} onClick={() => setTime(t)} className={cn("min-h-9 rounded-full border px-3.5 text-sm num", time === t ? "border-nar-soft/60 text-ink" : "border-white/10 text-ink-soft")}>
              {t}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary mt-8"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await startJournal(time);
              if (!r.ok) return void toast.error(r.error);
              router.refresh();
            })
          }
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Defteri başlat
        </button>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ 3) defter
function streakOf(days: JournalDay[], today: number) {
  const both = (d?: JournalDay) => !!d && !!d.mine && d.partner_done;
  let i = today;
  if (!both(days[i - 1])) i -= 1;
  let n = 0;
  while (i >= 1 && both(days[i - 1])) {
    n++;
    i--;
  }
  return n;
}

function reminderIcs(startOn: string, ritual: string) {
  const [y, m, d] = startOn.split("-");
  const [hh, mm] = ritual.split(":");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aeternum//Ortak defter//TR",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Istanbul",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0300",
    "TZOFFSETTO:+0300",
    "TZNAME:+03",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:aeternum-defter-${startOn}@aeternum-26.netlify.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=Europe/Istanbul:${y}${m}${d}T${hh}${mm}00`,
    "DURATION:PT10M",
    "RRULE:FREQ=DAILY;COUNT=30",
    "SUMMARY:Ortak defter: bugünün sorusu",
    `DESCRIPTION:Bugünün sorusu açıldı. ${SITE}/biz/defter`,
    `URL:${SITE}/biz/defter`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Bugünün sorusu açıldı",
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ortak-defter-hatirlatma.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast.success("Takvim dosyası indi", { description: "Açınca 30 gün boyunca her akşam hatırlatma eklenir. Sevgiline de gönder." });
}

function Book({ journal, partner }: { journal: JournalState & object; partner: string }) {
  const { today, days } = journal;
  const [open, setOpen] = useState<number>(() => {
    // önce cevaplamadığın en eski açık soru, yoksa bugün
    const first = days.find((d) => !d.mine);
    return first?.day ?? today;
  });
  const streak = useMemo(() => streakOf(days, today), [days, today]);
  const done = days.filter((d) => d.mine && d.partner_done).length;
  const current = days.find((d) => d.day === open) ?? days[days.length - 1];

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#ffb3bf]">Ortak defter · {partner}</p>
          <h1 className="display mt-2 text-[2.6rem] leading-[1.02] sm:text-[3.6rem]">
            {today}. gün{today >= 30 ? ", son sayfa" : ""}
          </h1>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="display num text-[2rem] leading-none">{done}<span className="text-base text-ink-mute">/30</span></p>
            <p className="mt-1 text-xs text-ink-soft">sayfa doldu</p>
          </div>
          <div>
            <p className="display num text-[2rem] leading-none text-[#ff9aab]">{streak}</p>
            <p className="mt-1 text-xs text-ink-soft">gün üst üste</p>
          </div>
        </div>
      </div>

      {/* 30 sayfalık şerit */}
      <div className="mt-8 grid grid-cols-10 gap-1.5 sm:grid-cols-15" role="list" aria-label="Defterin sayfaları">
        {Array.from({ length: 30 }, (_, i) => {
          const d = days[i];
          const both = d && d.mine && d.partner_done;
          const mine = d && d.mine && !d.partner_done;
          const theirs = d && !d.mine && d.partner_done;
          const locked = !d;
          return (
            <button
              key={i}
              role="listitem"
              disabled={locked}
              onClick={() => setOpen(i + 1)}
              aria-label={`${i + 1}. gün${both ? ", ikiniz de cevapladınız" : mine ? ", sen cevapladın" : theirs ? `, ${partner} cevapladı` : locked ? ", henüz açılmadı" : ", cevap bekliyor"}`}
              className={cn(
                "relative aspect-[3/4] rounded-[6px] border text-[0.65rem] num transition-transform",
                open === i + 1 && "scale-110 ring-2 ring-nar-soft/70",
                both
                  ? "border-champagne/50 bg-gradient-to-b from-[#f3e2b8] to-[#c9a865] text-[#2a1d08]"
                  : mine
                    ? "border-champagne/50 bg-champagne/10 text-gold"
                    : theirs
                      ? "border-nar-soft/60 bg-nar/20 text-[#ffd6dc]"
                      : locked
                        ? "border-white/[.05] bg-white/[.015] text-ink-mute/50"
                        : "border-white/15 bg-white/[.04] text-ink-soft",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-mute">Altın: ikiniz de cevapladınız · Nar: {partner} cevapladı, sıra sende · Yeni soru her gece 00:00&apos;da açılır.</p>

      <AnimatePresence mode="wait">
        <motion.div key={current.day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <Page day={current} partner={partner} isToday={current.day === today} />
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex flex-wrap gap-3">
        <button className="btn btn-ghost btn-sm" onClick={() => reminderIcs(journal.started_on, journal.ritual)}>
          <BellRing className="h-4 w-4" /> Her akşam {journal.ritual}&apos;da hatırlat
        </button>
        <Link href="/biz/defter/kitap" className="btn btn-ghost btn-sm">
          <BookOpen className="h-4 w-4" /> Anı kitapçığımız
        </Link>
      </div>
    </section>
  );
}

function Page({ day, partner, isToday }: { day: JournalDay; partner: string; isToday: boolean }) {
  const q = JOURNAL_QUESTIONS[day.day - 1];
  const [text, setText] = useState(day.mine ?? "");
  const [editing, setEditing] = useState(!day.mine);
  const [pending, start] = useTransition();
  const router = useRouter();
  const revealed = !!day.mine && day.partner_done;

  function save() {
    start(async () => {
      const r = await answerJournal(day.day, text);
      if (!r.ok) return void toast.error(r.error);
      setEditing(false);
      toast.success(day.partner_done ? "Cevaplar açıldı ✦" : "Cevabın kaydedildi");
      router.refresh();
    });
  }

  const nudge = wa(`${partner !== "Sevgilin" ? partner + ", " : ""}${isToday ? "bugünün" : `${day.day}. günün`} sorusunu cevapladım, seninkini merak ediyorum 💌 ${SITE}/biz/defter`);

  return (
    <article className="sheet relative mt-8 overflow-hidden p-6 sm:p-10" style={{ borderColor: "rgba(220,199,161,.22)" }}>
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(210,70,92,.22),transparent_65%)] blur-2xl" />
      <p className="relative text-sm text-ink-soft">{day.day}. gün{isToday ? " · bugün" : ""}</p>
      <h2 className="display relative mt-3 text-[2rem] leading-[1.15] sm:text-[2.6rem]">{q}</h2>

      <div className="relative mt-8 grid gap-5 md:grid-cols-2">
        {/* senin cevabın */}
        <div>
          <p className="mb-2 text-xs text-ink-mute">Sen</p>
          {editing ? (
            <>
              <textarea className="field min-h-36 resize-none" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Bir dakikanı al, aklına geleni yaz." aria-label="Cevabın" />
              <button className="btn btn-primary mt-4 w-full" disabled={pending || !text.trim()} onClick={save}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Cevabımı kaydet
              </button>
            </>
          ) : (
            <div className="min-h-36 rounded-[16px] border border-champagne/25 bg-champagne/[.05] p-5">
              <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed text-ink">{day.mine}</p>
              {!revealed && (
                <button onClick={() => setEditing(true)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink">
                  <Pencil className="h-3.5 w-3.5" /> Düzenle
                </button>
              )}
            </div>
          )}
        </div>

        {/* onun cevabı */}
        <div>
          <p className="mb-2 text-xs text-ink-mute">{partner}</p>
          {revealed ? (
            <motion.div initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.9 }} className="min-h-36 rounded-[16px] border border-nar-soft/35 bg-nar/[.12] p-5">
              <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed text-ink">{day.partner}</p>
            </motion.div>
          ) : (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-[16px] border border-dashed border-white/15 bg-white/[.02] p-5 text-center">
              {day.partner_done ? (
                <>
                  <Lock className="h-5 w-5 text-[#ff9aab]" />
                  <p className="mt-2 text-sm text-ink">{partner} cevapladı.</p>
                  <p className="mt-1 text-xs text-ink-soft">Okumak için önce sen yaz.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-ink-soft">{partner} henüz yazmadı.</p>
                  {day.mine && (
                    <a href={nudge} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-4">
                      <MessageCircleHeart className="h-4 w-4" /> Ona haber ver
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {revealed && (
        <p className="relative mt-6 inline-flex items-center gap-1.5 text-sm text-gold">
          <Check className="h-4 w-4" /> Bu sayfa doldu.
        </p>
      )}
    </article>
  );
}
