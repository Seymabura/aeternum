"use client";

import { useEffect, useState } from "react";
import { BellRing, Check, Share, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SITE_HOST, SITE_URL } from "@/lib/site";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();

/** Service worker kaydı + kurulum isteğini yakalar. Layout'ta bir kez. */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as BIPEvent;
      listeners.forEach((f) => f());
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  return null;
}

/** 1–31 Aralık her akşam 20:00 hatırlatmalı takvim dosyası */
function reminderIcs() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aeternum//TR",
    "CALSCALE:GREGORIAN",
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
    `UID:aeternum-aralik-2026@${SITE_HOST}`,
    "DTSTAMP:20261122T000000Z",
    "DTSTART;TZID=Europe/Istanbul:20261201T200000",
    "DURATION:PT10M",
    "RRULE:FREQ=DAILY;COUNT=31",
    "SUMMARY:Aeternum: bugünün kutusu",
    `DESCRIPTION:Bugünün görevi seni bekliyor. ${SITE_URL}/takvim`,
    `URL:${SITE_URL}/takvim`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Bugünün kutusu açık",
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

function downloadIcs() {
  const blob = new Blob([reminderIcs()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aeternum-hatirlatma.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast.success("Takvim dosyası indi. Açınca hatırlatmalar eklenir.");
}

export function InstallApp({ compact }: { compact?: boolean }) {
  const [can, setCan] = useState(false);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    const f = () => setCan(!!deferred);
    f();
    listeners.add(f);
    return () => void listeners.delete(f);
  }, []);

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const r = await deferred.userChoice;
      deferred = null;
      setCan(false);
      if (r.outcome === "accepted") setInstalled(true);
    } else if (ios) setShowIos((v) => !v);
    else toast("Tarayıcının menüsünden “Ana ekrana ekle” ya da “Uygulamayı yükle”yi seç.");
  }

  return (
    <section className={compact ? "rounded-[18px] border border-white/[.08] bg-white/[.025] p-5" : "sheet p-6 sm:p-8"}>
      <h2 className={compact ? "display text-[1.35rem]" : "display text-[1.6rem]"}>Her akşam hatırlat</h2>
      <p className="mt-2 text-sm text-ink-soft">Aeternum&apos;u ana ekranına ekle ve Aralık boyunca her akşam 20:00&apos;de takviminden küçük bir hatırlatma al.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {installed ? (
          <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <Check className="h-4 w-4 text-champagne" /> Ana ekranında
          </span>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={install}>
            <Smartphone className="h-4 w-4" strokeWidth={1.5} /> {can || !ios ? "Ana ekrana ekle" : "Nasıl eklenir?"}
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={downloadIcs}>
          <BellRing className="h-4 w-4" strokeWidth={1.5} /> Takvimime hatırlatma ekle
        </button>
      </div>
      {showIos && (
        <ol className="mt-5 space-y-2 text-sm text-ink-soft">
          <li>
            1. Safari&apos;de alttaki <Share className="inline h-4 w-4 align-[-2px] text-ink" strokeWidth={1.5} /> Paylaş düğmesine dokun.
          </li>
          <li>2. Listeyi kaydırıp “Ana Ekrana Ekle”yi seç.</li>
          <li>3. Sağ üstte “Ekle”ye dokun.</li>
        </ol>
      )}
    </section>
  );
}
