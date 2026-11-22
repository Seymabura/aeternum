"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Copy, Download, Link2, Loader2, RotateCcw } from "lucide-react";
import { CityPicker } from "@/components/biz/city-picker";
import { DateInput } from "@/components/biz/date-input";
import { MoonPosterView, type MoonPosterHandle } from "@/components/biz/moon-poster-view";
import { DEFAULT_CITY, type City } from "@/lib/astro/cities";
import { moonAt } from "@/lib/astro/moon";
import { moonDirection } from "@/lib/astro/skyfield";
import { EXPORTS, pct, unionFractionOf, unionLine, type MoonPayload, type MoonPerson } from "@/lib/astro/moon-poster";
import { todayIso, trDate, zonedToUtc } from "@/lib/astro/time";
import { ConsentDialog } from "@/components/biz/consent-dialog";
import { cn } from "@/lib/utils";

type Person = { name: string; date: string; time: string; city: City };
const empty = (): Person => ({ name: "", date: "", time: "", city: DEFAULT_CITY });

function validDate(d: string): string | null {
  if (!d) return "Tarihi Gün.Ay.Yıl şeklinde yaz, ör. 14.03.2005";
  if (d > todayIso()) return "Tarih bugünden sonra olamaz.";
  if (d < "1900-01-01") return "1900'den önceki tarihler desteklenmiyor.";
  return null;
}

function toMoon(p: Person, nameFallback: string): MoonPerson {
  const when = zonedToUtc(p.date, p.time || "12:00", p.city.tz);
  const m = moonAt(when, p.city.lat, p.city.lon);
  return {
    name: p.name.trim() || nameFallback,
    dateText: trDate(p.date),
    phaseAngle: Math.round(m.phaseAngle * 10) / 10,
    fraction: Math.round(m.fraction * 1000) / 1000,
    light: m.light.map((v) => Math.round(v * 1e4) / 1e4) as [number, number, number],
    northAngle: Math.round(m.northAngle * 1e4) / 1e4,
    v: moonDirection(when).map((x) => Math.round(x * 1e4) / 1e4) as [number, number, number],
  };
}

export function TwoMoons() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Person>(empty);
  const [b, setB] = useState<Person>(empty);
  const [met, setMet] = useState<{ date: string; city: City }>({ date: "", city: DEFAULT_CITY });
  const [err, setErr] = useState<string | null>(null);

  const payload: MoonPayload | null = useMemo(() => {
    if (step < 2) return null;
    return {
      a: toMoon(a, "Sen"),
      b: toMoon(b, "O"),
      met: null,
    };
  }, [step, a, b, met]);

  function next() {
    const p = step === 0 ? a : b;
    if (step < 2) {
      if (!p.name.trim()) return setErr("Bir isim yaz.");
      const e = validDate(p.date);
      if (e) return setErr(step === 0 ? e.replace("Tarih", "Doğum tarihi") : e.replace("Tarih", "Doğum tarihi"));
    }
    setErr(null);
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/biz" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Biz
      </Link>

      {step < 2 ? (
        <div className="mx-auto mt-10 max-w-lg">
          <p className="eyebrow">İki Ay · {step + 1}/2</p>
          <h1 className="display mt-5 text-[2.5rem] sm:text-[3.5rem]">
            {step === 0 ? <>Sen doğduğunda gökyüzünde hangi Ay vardı?</> : <>Peki o doğduğunda?</>}
          </h1>
          <p className="mt-4 text-ink-soft">
            Saati bilmiyorsan boş bırak: Ay bir gün içinde çok az değişir, öğle 12:00 üzerinden hesaplarız. Bilgiler sadece bu cihazda hesaplanır, kaydedilmez.
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 space-y-5"
            >
              <PersonFields p={step === 0 ? a : b} set={step === 0 ? setA : setB} who={step === 0 ? "Adın" : "Onun adı"} />
            </motion.div>
          </AnimatePresence>

          {err && (
            <p role="alert" className="mt-4 text-sm text-bordo">
              {err}
            </p>
          )}

          <div className="mt-10 flex items-center gap-3">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => (setErr(null), setStep((s) => s - 1))}>
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Geri
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={next}>
              {step === 1 ? "Ay'ları göster" : "Devam"} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : (
        payload && <Result payload={payload} onEdit={() => setStep(0)} />
      )}
    </div>
  );
}

function PersonFields({ p, set, who }: { p: Person; set: React.Dispatch<React.SetStateAction<Person>>; who: string }) {
  return (
    <>
      <div>
        <label className="label" htmlFor="ad">
          {who}
        </label>
        <input id="ad" className="field" maxLength={24} value={p.name} onChange={(e) => set((x) => ({ ...x, name: e.target.value }))} autoComplete="given-name" />
      </div>
      <div className="grid grid-cols-[1fr_8.5rem] gap-3">
        <DateInput label="Doğum tarihi" value={p.date} onChange={(d) => set((x) => ({ ...x, date: d }))} />
        <div>
          <label className="label" htmlFor="saat">
            Saat
          </label>
          <input id="saat" type="time" className="field" value={p.time} onChange={(e) => set((x) => ({ ...x, time: e.target.value }))} />
        </div>
      </div>
      <CityPicker value={p.city} onChange={(c) => set((x) => ({ ...x, city: c }))} label="Doğduğu şehir" />
    </>
  );
}

function Result({ payload, onEdit }: { payload: MoonPayload; onEdit: () => void }) {
  const view = useRef<MoonPosterHandle>(null);
  const [merged, setMerged] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [hideDates, setHideDates] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
      <MoonPosterView ref={view} payload={payload} onMerged={setMerged} className="mx-auto max-w-[26rem] shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />

      <div className="lg:sticky lg:top-28">
        <p className="eyebrow">İki Ay</p>
        <h1 className="display mt-5 text-[2.5rem] sm:text-[3.25rem]">
          {payload.a.name} <span className="gold-shine italic">&</span> {payload.b.name}
        </h1>
        <dl className="mt-8 grid grid-cols-2 border-y border-champagne/10">
          {[payload.a, payload.b].map((m, i) => (
            <div key={i} className="relative py-5 pr-4">
              {i > 0 && <span aria-hidden className="hairline-v absolute inset-y-0 left-[-1rem] hidden sm:block" />}
              <dt className="text-sm text-ink-soft">{m.name}</dt>
              <dd className="display mt-1 text-[1.5rem]">{moonName(m.phaseAngle)}</dd>
              <dd className="num text-sm text-champagne">%{Math.round(m.fraction * 100)} aydınlık</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <p className="display text-[1.6rem] italic text-gold">İkimiz birlikte: {pct(unionFractionOf(payload))}</p>
          <p className="mt-1 text-sm text-ink-soft">{unionLine(payload)}</p>
          {payload.met && (
            <p className="mt-3 text-sm text-ink-soft">
              Tanıştığınız gece: <span className="text-champagne">{moonName(payload.met.phaseAngle)} · {pct(payload.met.fraction)}</span>
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => view.current?.merge(!merged)}>
            {merged ? "Ayır" : "Birleştir"}
          </button>
          <button className="btn btn-ghost" onClick={onEdit}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Bilgileri değiştir
          </button>
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
          <input type="checkbox" className="h-4 w-4 accent-[#dcc7a1]" checked={hideDates} onChange={(e) => setHideDates(e.target.checked)} />
          Bağlantıda doğum tarihlerini gösterme
        </label>

        <h2 className="mt-12 text-sm text-ink-soft">İndir</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXPORTS.map((e) => (
            <button
              key={e.id}
              disabled={!!busy}
              onClick={async () => {
                setBusy(e.id);
                try {
                  await view.current?.exportAs(e.id);
                } catch {
                  toast.error("İndirilemedi. Tekrar dene.");
                } finally {
                  setBusy(null);
                }
              }}
              className="flex min-h-12 items-center justify-between rounded-[14px] border border-champagne/12 px-4 text-left text-sm transition-colors hover:border-champagne/35 disabled:opacity-50"
            >
              <span>
                {e.label}
                <span className="num block text-xs text-ink-mute">
                  {e.w}×{e.h}
                </span>
              </span>
              {busy === e.id ? <Loader2 className="h-4 w-4 animate-spin text-champagne" /> : <Download className="h-4 w-4 text-ink-soft" strokeWidth={1.5} />}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {link ? (
            <div className="sheet flex items-center gap-3 p-3 pl-5">
              <Check className="h-4 w-4 shrink-0 text-champagne" />
              <span className="min-w-0 flex-1 truncate text-sm">{link.replace(/^https?:\/\//, "")}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  toast.success("Bağlantı kopyalandı");
                }}
              >
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
        <ConsentDialog
          onClose={() => setSharing(false)}
          onShared={(url) => {
            setLink(url);
            setSharing(false);
          }}
          payload={hideDates ? { ...payload, a: { ...payload.a, dateText: "" }, b: { ...payload.b, dateText: "" } } : payload}
        />
      )}
    </div>
  );
}

function moonName(angle: number) {
  // kısa ad + yön
  const a = ((angle % 360) + 360) % 360;
  const base = a < 11.25 || a >= 348.75 ? "Yeni Ay" : a < 78.75 ? "Hilal" : a < 101.25 ? "İlk Dördün" : a < 168.75 ? "Şişkin Ay" : a < 191.25 ? "Dolunay" : a < 258.75 ? "Şişkin Ay" : a < 281.25 ? "Son Dördün" : "Hilal";
  return base;
}

