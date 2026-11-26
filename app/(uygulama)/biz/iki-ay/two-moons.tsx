"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Copy, Download, Heart, Link2, Loader2, Moon, RotateCcw, UserRound } from "lucide-react";
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

type Person = { name: string; date: string; city: City };
type Mode = "tek" | "cift";
const empty = (): Person => ({ name: "", date: "", city: DEFAULT_CITY });

function validDate(d: string): string | null {
  if (!d) return "Doğum tarihini Gün.Ay.Yıl şeklinde yaz, ör. 14.03.2005";
  if (d > todayIso()) return "Doğum tarihi bugünden sonra olamaz.";
  if (d < "1900-01-01") return "1900'den önceki tarihler desteklenmiyor.";
  return null;
}

/** Ay bir günde ancak birkaç derece ilerler; saat sormadan öğle 12:00'ye göre hesaplıyoruz. */
function toMoon(p: Person, nameFallback: string): MoonPerson {
  const when = zonedToUtc(p.date, "12:00", p.city.tz);
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

type Step = "mod" | "a" | "b" | "sonuc";

export function TwoMoons() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<Step>("mod");
  const [a, setA] = useState<Person>(empty);
  const [b, setB] = useState<Person>(empty);
  const [err, setErr] = useState<string | null>(null);

  const payload: MoonPayload | null = useMemo(() => {
    if (step !== "sonuc") return null;
    return mode === "cift" ? { a: toMoon(a, "Sen"), b: toMoon(b, "O"), met: null } : { a: toMoon(a, "Sen"), b: null };
  }, [step, mode, a, b]);

  function pick(m: Mode) {
    setMode(m);
    setErr(null);
    setStep("a");
  }

  function next() {
    const e = validDate(step === "a" ? a.date : b.date);
    if (e) return setErr(e);
    setErr(null);
    setStep(step === "a" && mode === "cift" ? "b" : "sonuc");
  }

  function back() {
    setErr(null);
    setStep(step === "b" ? "a" : "mod");
  }

  const total = mode === "cift" ? 2 : 1;
  const idx = step === "b" ? 2 : 1;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/biz" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Biz
      </Link>

      {step === "mod" && (
        <div className="mx-auto mt-10 max-w-2xl">
          <h1 className="display text-[2.5rem] leading-[1.05] sm:text-[3.5rem]">Doğduğun gecenin Ay&apos;ı</h1>
          <p className="mt-4 max-w-lg text-ink-soft">Doğduğun gece gökyüzünde nasıl bir Ay vardı? Gerçek gökbilim hesabıyla bul, telefonuna duvar kağıdı yap.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <ModeCard icon={UserRound} title="Sadece ben" text="Kendi doğduğun gecenin Ay'ı." onClick={() => pick("tek")} />
            <ModeCard icon={Heart} title="Sevgilimle" text="İkinizin Ay'ı yan yana, istersen tek bir Ay'da birleşir." onClick={() => pick("cift")} accent />
          </div>
          <p className="mt-6 text-xs text-ink-mute">Bilgiler sadece bu cihazda hesaplanır, kaydedilmez.</p>
        </div>
      )}

      {(step === "a" || step === "b") && (
        <div className="mx-auto mt-10 max-w-lg">
          {total > 1 && (
            <p className="text-sm text-ink-mute">
              <span className="num">{idx}</span>/<span className="num">{total}</span>
            </p>
          )}
          <h1 className="display mt-3 text-[2.25rem] leading-[1.08] sm:text-[3.25rem]">
            {step === "a" ? <>Sen doğduğunda gökyüzünde hangi Ay vardı?</> : <>Peki o doğduğunda?</>}
          </h1>

          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <PersonFields p={step === "a" ? a : b} set={step === "a" ? setA : setB} who={step === "a" ? "Adın" : "Onun adı"} />
              {err && (
                <p role="alert" className="text-sm text-bordo">
                  {err}
                </p>
              )}
              <div className="flex items-center gap-3 pt-5">
                <button type="button" className="btn btn-ghost" onClick={back}>
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Geri
                </button>
                <button type="submit" className="btn btn-primary">
                  {step === "a" && mode === "cift" ? "Devam" : mode === "cift" ? "Ay'ları göster" : "Ay'ımı göster"} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      )}

      {step === "sonuc" && payload && (
        <Result
          payload={payload}
          onEdit={() => setStep("a")}
          onAddPartner={() => {
            setMode("cift");
            setStep("b");
          }}
        />
      )}
    </div>
  );
}

function ModeCard({ icon: Icon, title, text, onClick, accent }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; text: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-36 flex-col justify-between rounded-[22px] border p-6 text-left transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5",
        accent ? "border-nar-soft/35 bg-nar/[.12] hover:border-nar-soft/70" : "border-white/10 bg-white/[.02] hover:border-nar-soft/50",
      )}
    >
      <Icon className="h-5 w-5 text-[#ff9aab]" strokeWidth={1.5} />
      <span>
        <span className="display block text-[1.75rem]">{title}</span>
        <span className="mt-1 block text-sm text-ink-soft">{text}</span>
      </span>
    </button>
  );
}

function PersonFields({ p, set, who }: { p: Person; set: React.Dispatch<React.SetStateAction<Person>>; who: string }) {
  return (
    <>
      <div>
        <label className="label" htmlFor="ad">
          {who} <span className="text-ink-mute">(isteğe bağlı)</span>
        </label>
        <input id="ad" className="field" maxLength={24} value={p.name} onChange={(e) => set((x) => ({ ...x, name: e.target.value }))} autoComplete="given-name" />
      </div>
      <DateInput label="Doğum tarihi" value={p.date} onChange={(d) => set((x) => ({ ...x, date: d }))} />
      <CityPicker value={p.city} onChange={(c) => set((x) => ({ ...x, city: c }))} label="Doğduğu şehir" />
    </>
  );
}

type Which = "ikisi" | "a" | "b";

function Result({ payload, onEdit, onAddPartner }: { payload: MoonPayload; onEdit: () => void; onAddPartner: () => void }) {
  const view = useRef<MoonPosterHandle>(null);
  const [merged, setMerged] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [hideDates, setHideDates] = useState(false);
  const [caption, setCaption] = useState(false);
  const [note, setNote] = useState("");
  const [which, setWhich] = useState<Which>("ikisi");
  const [sharing, setSharing] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const pair = payload.b ?? null;
  const people = pair ? [payload.a, pair] : [payload.a];
  // "Sadece …" seçilince önizlemede de sadece o kişinin Ay'ı görünür
  const shown: MoonPayload = useMemo(() => (pair && which !== "ikisi" ? { a: which === "a" ? payload.a : pair, b: null } : payload), [payload, pair, which]);

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-28">
        <MoonPosterView key={which} ref={view} payload={shown} onMerged={setMerged} className="mx-auto max-w-[26rem] shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
        {pair && which !== "ikisi" && <p className="mt-3 text-center text-sm text-ink-soft">{shown.a.name} doğduğu gecenin Ay&apos;ı</p>}
      </div>

      <div>
        <p className="text-sm text-[#ff9aab]">Doğduğun gecenin Ay&apos;ı</p>
        <h1 className="display mt-4 text-[2.5rem] leading-[1.05] sm:text-[3.25rem]">
          {pair ? (
            <>
              {payload.a.name} <span className="text-nar-soft italic">&</span> {pair.name}
            </>
          ) : (
            <>{payload.a.name === "Sen" ? "Senin Ay'ın" : payload.a.name}</>
          )}
        </h1>
        <dl className={cn("mt-8 grid border-y border-champagne/10", pair ? "grid-cols-2" : "grid-cols-1")}>
          {people.map((m, i) => (
            <div key={i} className="relative py-5 pr-4">
              {i > 0 && <span aria-hidden className="hairline-v absolute inset-y-0 left-[-1rem] hidden sm:block" />}
              <dt className="text-sm text-ink-soft">
                {m.name}
                {m.dateText && <span className="text-ink-mute"> · {m.dateText}</span>}
              </dt>
              <dd className="display mt-1 text-[1.5rem]">{moonName(m.phaseAngle)}</dd>
              <dd className="num text-sm text-champagne">%{Math.round(m.fraction * 100)} aydınlık</dd>
            </div>
          ))}
        </dl>

        {pair && (
          <div className="mt-6">
            <p className="display text-[1.6rem] italic text-gold">İkimiz birlikte: {pct(unionFractionOf(payload))}</p>
            <p className="mt-1 text-sm text-ink-soft">{unionLine(payload)}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {pair && which === "ikisi" && (
            <button className="btn btn-primary" onClick={() => view.current?.merge(!merged)}>
              {merged ? "Ayır" : "Birleştir"}
            </button>
          )}
          {!pair && (
            <button className="btn btn-primary" onClick={onAddPartner}>
              <Heart className="h-4 w-4" strokeWidth={1.5} /> Sevgilininkini de ekle
            </button>
          )}
          <button className="btn btn-ghost" onClick={onEdit}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Bilgileri değiştir
          </button>
        </div>

        <h2 className="mt-12 text-sm text-ink-soft">İndir</h2>
        {pair && (
          <div role="radiogroup" aria-label="Hangi Ay indirilsin" className="mt-3 grid grid-cols-3 gap-1 rounded-[14px] border border-white/10 p-1">
            {(
              [
                ["ikisi", "İkisi birlikte"],
                ["a", `Sadece ${payload.a.name}`],
                ["b", `Sadece ${pair.name}`],
              ] as [Which, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                role="radio"
                aria-checked={which === k}
                onClick={() => {
                  setWhich(k);
                  setMerged(false);
                }}
                className={cn("min-h-10 truncate rounded-[10px] px-2 text-[0.8rem] transition-colors", which === k ? "bg-nar/25 text-[#ffe3e7]" : "text-ink-soft hover:text-ink")}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
          <input type="checkbox" className="h-4 w-4 accent-[#d2465c]" checked={caption} onChange={(e) => setCaption(e.target.checked)} />
          Görselde isim, tarih ve evre yazsın
        </label>
        <div className="mt-4">
          <label htmlFor="gorsel-yazi" className="label">
            Görsele kendi yazını ekle <span className="text-ink-mute">(isteğe bağlı)</span>
          </label>
          <input
            id="gorsel-yazi"
            className="field"
            maxLength={60}
            placeholder="İyi ki doğdun, ilk Ay'ımız…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-describedby="gorsel-yazi-not"
          />
          <p id="gorsel-yazi-not" className="mt-1.5 flex justify-between text-xs text-ink-mute">
            <span>Ay&apos;ın altına yazılır.</span>
            <span className="num">{note.length}/60</span>
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXPORTS.map((e) => (
            <button
              key={e.id}
              disabled={!!busy}
              onClick={async () => {
                setBusy(e.id);
                try {
                  await view.current?.exportAs(e.id, {
                    only: pair && which !== "ikisi" ? which : undefined,
                    caption,
                    note: note.trim() || undefined,
                  });
                } catch {
                  toast.error("İndirilemedi. Tekrar dene.");
                } finally {
                  setBusy(null);
                }
              }}
              className="flex min-h-12 items-center justify-between rounded-[14px] border border-champagne/12 px-4 text-left text-sm transition-colors hover:border-nar-soft/50 disabled:opacity-50"
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
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button className="btn btn-ghost" onClick={() => setSharing(true)}>
                <Link2 className="h-4 w-4" strokeWidth={1.5} /> Bağlantı oluştur
              </button>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
                <input type="checkbox" className="h-4 w-4 accent-[#d2465c]" checked={hideDates} onChange={(e) => setHideDates(e.target.checked)} />
                Bağlantıda doğum tarihini gösterme
              </label>
            </div>
          )}
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs text-ink-mute">
          <Moon className="h-3.5 w-3.5" strokeWidth={1.5} /> Ay evresi gerçek gökbilim hesabıyla bulunur. Ay görüntüsü: NASA SVS.
        </p>
      </div>

      {sharing && (
        <ConsentDialog
          onClose={() => setSharing(false)}
          onShared={(url) => {
            setLink(url);
            setSharing(false);
          }}
          payload={hideDates ? { ...payload, a: { ...payload.a, dateText: "" }, b: payload.b ? { ...payload.b, dateText: "" } : null } : payload}
        />
      )}
    </div>
  );
}

function moonName(angle: number) {
  const a = ((angle % 360) + 360) % 360;
  return a < 11.25 || a >= 348.75 ? "Yeni Ay" : a < 78.75 ? "Hilal" : a < 101.25 ? "İlk Dördün" : a < 168.75 ? "Şişkin Ay" : a < 191.25 ? "Dolunay" : a < 258.75 ? "Şişkin Ay" : a < 281.25 ? "Son Dördün" : "Hilal";
}
