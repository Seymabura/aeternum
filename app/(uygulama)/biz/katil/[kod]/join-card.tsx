"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { joinCouple } from "@/app/actions/biz";

export function JoinCard({ code, inviter }: { code: string; inviter: string }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div>
      <p className="text-sm text-[#ffb3bf]">Ortak defter</p>
      <h1 className="display mt-3 text-[2.6rem] leading-[1.05] sm:text-[3.2rem]">
        {inviter ? `${inviter} seninle bir defter tutmak istiyor.` : "Seninle bir defter tutmak isteyen biri var."}
      </h1>
      <p className="mt-4 text-ink-soft">30 gün boyunca her gün bir soru. İkiniz de cevaplayınca cevaplar birlikte açılır.</p>
      <form
        className="mt-8 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          start(async () => {
            const r = await joinCouple(code, name);
            if (!r.ok) return setErr(r.error);
            router.push("/biz/defter");
          });
        }}
      >
        <label htmlFor="ad" className="label">
          Adın
        </label>
        <input id="ad" className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Defterde görünecek ad" />
        {err && (
          <p role="alert" className="mt-2 text-sm text-nar-soft">
            {err}
          </p>
        )}
        <button className="btn btn-primary mt-6 w-full" disabled={pending || !name.trim()}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Deftere katıl
        </button>
      </form>
    </div>
  );
}
