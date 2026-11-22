"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { deleteAccount, updateProfile } from "@/app/actions/account";
import { createClient } from "@/lib/supabase/client";
import { setSnow, useSnow } from "@/components/ambience";

export function ProfileForm({ name, reminders, resetPassword }: { name: string; reminders: boolean; resetPassword: boolean }) {
  const [n, setN] = useState(name);
  const [r, setR] = useState(reminders);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState("");
  const [pw, setPw] = useState("");
  const snow = useSnow();

  return (
    <>
      {resetPassword && (
        <form
          className="sheet space-y-3 border-mum/50 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (pw.length < 8) return void toast.error("Şifre en az 8 karakter olmalı.");
            const { error } = await createClient().auth.updateUser({ password: pw });
            if (error) toast.error("Şifre değiştirilemedi.");
            else {
              toast.success("Yeni şifren kaydedildi.");
              setPw("");
            }
          }}
        >
          <h2 className="display text-xl">Yeni şifre belirle</h2>
          <input type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" minLength={8} />
          <button className="btn btn-primary">Kaydet</button>
        </form>
      )}

      <form
        className="sheet space-y-5 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await updateProfile({ name: n, reminders: r });
            if (res.ok) toast.success("Kaydedildi");
            else toast.error(res.error);
          });
        }}
      >
        <div>
          <label className="label" htmlFor="ad">Adın</label>
          <input id="ad" className="field" value={n} maxLength={40} onChange={(e) => setN(e.target.value)} />
        </div>
        <Toggle checked={r} onChange={setR} title="Günlük hatırlatma e-postası" desc="“Bugünün kutusu açıldı” e-postası (Aralık boyunca, yakında)." />
        <Toggle checked={snow} onChange={setSnow} title="Yağan kar" desc="Arka planda yavaşça yağan kar." />
        <button className="btn btn-primary" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet
        </button>
      </form>

      <details className="rounded-[28px] border border-bordo/35 p-6 sm:p-8">
        <summary className="cursor-pointer text-sm text-bordo marker:text-bordo/60">Defterimi ve tüm verilerimi sil</summary>
        <p className="mt-3 text-sm text-ink-soft">
          Görev cevapların, mektubun, vision board, paylaşım bağlantıların, duvar kağıtların ve yüklediğin tüm fotoğraflar kalıcı olarak silinir. Bu işlem geri
          alınamaz. Onaylamak için kutuya <b>SİL</b> yaz.
        </p>
        <div className="mt-3 flex gap-2">
          <input className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="SİL" />
          <button
            type="button"
            className="btn shrink-0 border border-bordo/60 text-bordo hover:bg-bordo/10"
            disabled={pending || confirm.trim().toLocaleLowerCase("tr") !== "sil"}
            onClick={() =>
              start(async () => {
                const res = await deleteAccount(confirm);
                if (res && !res.ok) toast.error(res.error);
              })
            }
          >
            Sil
          </button>
        </div>
      </details>
    </>
  );
}

function Toggle({ checked, onChange, title, desc }: { checked: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-sm text-ink-soft">{desc}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={"relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors " + (checked ? "bg-[linear-gradient(180deg,#f3e6c8,#dcc7a1_55%,#a88a5c)]" : "bg-white/15")}
      >
        <span className={"absolute top-1 h-5 w-5 rounded-full bg-midnight shadow transition-all " + (checked ? "left-6" : "left-1")} />
      </button>
    </label>
  );
}
