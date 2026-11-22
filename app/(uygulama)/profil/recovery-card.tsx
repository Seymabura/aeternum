"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, ShieldCheck } from "lucide-react";
import { createRecoveryCode } from "@/app/actions/recovery";

/** Girişsiz defteri korumak için kurtarma kodu */
export function RecoveryCard({ has }: { has: boolean }) {
  const [code, setCode] = useState<string | null>(null);
  const [ok, setOk] = useState(has);
  const [ask, setAsk] = useState(false);
  const [pending, start] = useTransition();

  function create() {
    start(async () => {
      const r = await createRecoveryCode();
      if (!r.ok) return void toast.error(r.error);
      setCode(r.code);
      setOk(true);
      setAsk(false);
    });
  }

  return (
    <section id="kurtarma" className="sheet scroll-mt-28 p-6 sm:p-8" style={{ borderColor: ok ? undefined : "rgba(220,199,161,.3)" }}>
      <div className="flex items-start gap-3">
        <ShieldCheck className={ok ? "mt-1 h-5 w-5 shrink-0 text-champagne" : "mt-1 h-5 w-5 shrink-0 text-ink-soft"} strokeWidth={1.5} />
        <div>
          <h2 className="display text-[1.6rem]">{ok ? "Defterin korunuyor" : "Defterini koru"}</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Defterin bu tarayıcıda saklanıyor. Telefonunu değiştirir ya da tarayıcı verilerini silersen kaybolmasın diye bir kurtarma kodu al.
            Başka bir cihazda <span className="text-ink">aeternum-26.netlify.app/kurtar</span> adresine yazınca her şey geri gelir.
          </p>
        </div>
      </div>

      {code ? (
        <div className="mt-6 rounded-[18px] border border-champagne/30 bg-[rgba(4,6,12,.5)] p-5 text-center">
          <p className="text-xs text-ink-soft">Kurtarma kodun</p>
          <p className="num mt-2 select-all text-[1.35rem] tracking-[0.16em] text-gold sm:text-[1.6rem]">{code}</p>
          <button
            className="btn btn-ghost btn-sm mt-4"
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              toast.success("Kod kopyalandı");
            }}
          >
            <Copy className="h-4 w-4" strokeWidth={1.5} /> Kopyala
          </button>
          <p className="mt-4 text-xs text-ink-soft">Ekran görüntüsü al ya da notlarına yaz. Bu kodu bir daha gösteremeyiz.</p>
        </div>
      ) : ok ? (
        <div className="mt-6">
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Check className="h-4 w-4 text-champagne" /> Kurtarma kodun oluşturuldu.
          </p>
          {!ask ? (
            <button className="mt-3 text-sm text-ink-mute underline-offset-4 hover:text-ink hover:underline" onClick={() => setAsk(true)}>
              Kodumu kaybettim, yenisini oluştur
            </button>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink-soft">Eski kod geçersiz olur.</p>
              <button className="btn btn-primary btn-sm" onClick={create} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Yeni kod oluştur
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAsk(false)}>
                Vazgeç
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="btn btn-primary mt-6" onClick={create} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Kurtarma kodu oluştur
        </button>
      )}
    </section>
  );
}
