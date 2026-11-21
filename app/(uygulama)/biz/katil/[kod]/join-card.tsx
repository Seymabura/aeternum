"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GlobeHero } from "@/components/globe-hero";
import { joinCouple } from "@/app/actions/biz";

export function JoinCard({ code, inviter, valid, reason }: { code: string; inviter: string; valid: boolean; reason: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="mx-auto max-w-md text-center">
      <GlobeHero days={[1, 2, 4, 6, 9, 14]} className="max-w-[300px]" />
      {valid ? (
        <>
          <p className="eyebrow mt-2">Davet</p>
          <h1 className="display mt-5 text-[2.5rem]">
            {inviter || "Biri"} seni <em className="gold-shine italic">ortak küresine</em> davet ediyor
          </h1>
          <p className="mt-4 text-ink-soft">Aralık boyunca ikiniz de görev yaptıkça aynı kar küresi süslenecek. Görev cevaplarınız birbirinize görünmez; sadece hangi günleri yaptığınız.</p>
          <form
            className="mx-auto mt-8 max-w-xs space-y-4 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return void toast.error("Adını yaz.");
              start(async () => {
                const r = await joinCouple(code, name);
                if (!r.ok) return void toast.error(r.error);
                toast.success("Ortak küreniz hazır");
                router.push("/biz/kure");
              });
            }}
          >
            <div>
              <label className="label" htmlFor="ad">Adın</label>
              <input id="ad" className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Katıl
              </button>
              <Link href="/takvim" className="btn btn-ghost">
                Hayır
              </Link>
            </div>
          </form>
        </>
      ) : (
        <>
          <h1 className="display mt-6 text-[2.25rem]">Bu davet açılamadı</h1>
          <p className="mt-4 text-ink-soft">{reason}</p>
          <Link href="/biz" className="btn btn-ghost mt-8">
            Biz sayfasına git
          </Link>
        </>
      )}
    </div>
  );
}
