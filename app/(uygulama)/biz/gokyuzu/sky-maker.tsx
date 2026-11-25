"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Copy, Download, Link2, Loader2, RotateCcw } from "lucide-react";
import { CityPicker } from "@/components/biz/city-picker";
import { DateInput } from "@/components/biz/date-input";
import { ConsentDialog } from "@/components/biz/consent-dialog";
import { SKY_EXPORTS, SkyView, type SkyHandle, type SkyInput } from "@/components/biz/sky-view";
import type { ViewDir } from "@/lib/astro/skyfield";
import { DEFAULT_CITY, formatCoords, type City } from "@/lib/astro/cities";
import { todayIso, trDate, zonedToUtc } from "@/lib/astro/time";
import { cn } from "@/lib/utils";

export function SkyMaker() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("21:00");
  const [city, setCity] = useState<City>(DEFAULT_CITY);
  const [line, setLine] = useState("");
  const [input, setInput] = useState<SkyInput | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function show() {
    if (!date) return setErr("Bir tarih seç.");
    if (date < "1900-01-01") return setErr("1900'den önceki tarihler desteklenmiyor.");
    if (date > "2100-12-31") return setErr("Bu kadar ileri bir tarih desteklenmiyor.");
    setErr(null);
    const when = zonedToUtc(date, time || "21:00", city.tz).toISOString();
    setInput({
      when,
      lat: city.lat,
      lon: city.lon,
      meta: {
        names: [a.trim(), b.trim()].filter(Boolean),
        dateText: `${trDate(date)}, ${time || "21:00"}`,
        place: city.country && city.country !== "Türkiye" ? `${city.name}, ${city.country}` : city.name,
        coords: formatCoords(city.lat, city.lon),
        line: line.trim() || undefined,
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/biz" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Biz
      </Link>
      {!input ? (
        <div className="mx-auto mt-10 max-w-lg">
          <p className="text-sm text-[#ff9aab]">Bir gecenin gökyüzü</p>
          <h1 className="display mt-4 text-[2.5rem] leading-[1.05] sm:text-[3.5rem]">O gece gökyüzünde ne vardı?</h1>
          <p className="mt-4 text-ink-soft">Doğduğun gece, tanıştığınız gece ya da unutmak istemediğin bir gece. Tarih, saat ve şehri seç; o an o şehirden görünen gerçek yıldızları, Ay&apos;ı ve gezegenleri çizelim.</p>
          <div className="mt-10 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="a">Senin adın</label>
                <input id="a" className="field" placeholder="İsteğe bağlı" maxLength={24} value={a} onChange={(e) => setA(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="b">Onun adı</label>
                <input id="b" className="field" placeholder="İsteğe bağlı" maxLength={24} value={b} onChange={(e) => setB(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_8.5rem] gap-3">
              <DateInput label="Tarih" value={date} onChange={setDate} />
              <div>
                <label className="label" htmlFor="saat">Saat</label>
                <input id="saat" type="time" className="field [color-scheme:dark]" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <CityPicker value={city} onChange={setCity} label="Şehir" />
            <div>
              <label className="label" htmlFor="line">Kısa bir cümle (isteğe bağlı)</label>
              <input id="line" className="field hand !text-[1.4rem]" maxLength={60} value={line} onChange={(e) => setLine(e.target.value)} placeholder="o akşam her şey başladı" />
            </div>
          </div>
          {err && <p role="alert" className="mt-4 text-sm text-bordo">{err}</p>}
          <button className="btn btn-primary mt-10" onClick={show}>
            Gökyüzünü çiz <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <p className="mt-4 text-xs text-ink-mute">Bugün: {trDate(todayIso())}. Gelecekteki bir tarih de seçebilirsin (yıldönümü gibi).</p>
        </div>
      ) : (
        <SkyResult input={input} onEdit={() => setInput(null)} />
      )}
    </div>
  );
}

const DIRS: { id: ViewDir; label: string }[] = [
  { id: "oto", label: "En güzel yön" },
  { id: "kuzey", label: "Kuzey" },
  { id: "dogu", label: "Doğu" },
  { id: "guney", label: "Güney" },
  { id: "bati", label: "Batı" },
  { id: "basucu", label: "Başucu" },
];

function SkyResult({ input: initial, onEdit }: { input: SkyInput; onEdit: () => void }) {
  const view = useRef<SkyHandle>(null);
  const [input, setInput] = useState<SkyInput>({ ...initial, dir: initial.dir ?? "oto", lines: false });
  const [spin, setSpin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [prog, setProg] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
      <SkyView ref={view} input={input} onSpin={setSpin} className="mx-auto max-w-[26rem] shadow-[0_40px_90px_-30px_rgba(0,0,0,.95)]" />
      <div className="lg:sticky lg:top-28">
        <p className="text-sm text-[#ff9aab]">Bir gecenin gökyüzü</p>
        <h1 className="display mt-5 text-[2.5rem] sm:text-[3.25rem]">
          <Names names={input.meta.names} fallback={input.meta.dateText} />
        </h1>
        <p className="mt-4 text-ink-soft">
          {input.meta.dateText} · {input.meta.place}
          <span className="num block text-sm text-champagne">{input.meta.coords}</span>
        </p>
        {input.meta.line && <p className="hand mt-3 text-2xl text-gold/80">{input.meta.line}</p>}

        <h2 className="mt-10 text-sm text-ink-soft">Nereye bakalım?</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Bakış yönü">
          {DIRS.map((d) => (
            <button
              key={d.id}
              role="radio"
              aria-checked={input.dir === d.id}
              onClick={() => setInput((i) => ({ ...i, dir: d.id }))}
              className={cn("min-h-10 rounded-full border px-4 text-sm transition-colors", input.dir === d.id ? "border-champagne/60 text-champagne" : "border-champagne/12 text-ink-soft hover:text-ink")}
            >
              {d.label}
            </button>
          ))}
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
          <input type="checkbox" className="h-4 w-4 accent-[#dcc7a1]" checked={!!input.lines} onChange={(e) => setInput((i) => ({ ...i, lines: e.target.checked }))} />
          Takımyıldız çizgileri
        </label>

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => view.current?.spin(!spin)}>
            {spin ? "Durdur" : "O gece nasıl döndü?"}
          </button>
          <button className="btn btn-ghost" onClick={onEdit}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Değiştir
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-mute">Döndürünce 1 saniye 10 dakikaya denk gelir.</p>

        <h2 className="mt-12 text-sm text-ink-soft">İndir</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SKY_EXPORTS.map((e) => (
            <button
              key={e.id}
              disabled={!!busy}
              onClick={async () => {
                setBusy(e.id);
                setProg(0);
                try {
                  await view.current?.exportAs(e.id, setProg);
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
                <span className="num block text-xs text-ink-mute">{e.w}×{e.h}</span>
              </span>
              {busy === e.id ? (
                <span className="num flex items-center gap-2 text-xs text-champagne">
                  Hazırlanıyor %{Math.round(prog * 100)} <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                <Download className="h-4 w-4 text-ink-soft" strokeWidth={1.5} />
              )}
            </button>
          ))}
        </div>
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
        <ConsentDialog
          kind="gok"
          payload={{ ...input, names: input.meta.names }}
          onClose={() => setSharing(false)}
          onShared={(u) => (setLink(u), setSharing(false))}
        />
      )}
    </div>
  );
}

function Names({ names, fallback }: { names: string[]; fallback: string }) {
  const n = names.filter(Boolean);
  if (!n.length) return <>{fallback.split(",")[0]}</>;
  if (n.length === 1) return <>{n[0]}</>;
  return (
    <>
      {n[0]} <span className="italic text-nar-soft">&</span> {n[1]}
    </>
  );
}
