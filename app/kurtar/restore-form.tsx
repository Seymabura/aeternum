"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { restoreFromCode } from "@/app/actions/recovery";

function mask(raw: string) {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  return c.match(/.{1,4}/g)?.join("-") ?? "";
}

export function RestoreForm() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-10"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        start(async () => {
          const r = await restoreFromCode(code);
          if (r && !r.ok) setErr(r.error);
        });
      }}
    >
      <label htmlFor="kod" className="label">
        Kurtarma kodu
      </label>
      <input
        id="kod"
        className="field num text-center text-[1.25rem] tracking-[0.18em]"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="XXXX-XXXX-XXXX-XXXX"
        value={code}
        aria-invalid={!!err}
        aria-describedby={err ? "kod-hata" : "kod-not"}
        onChange={(e) => setCode(mask(e.target.value))}
      />
      {err ? (
        <p id="kod-hata" role="alert" className="mt-2 text-sm text-bordo">
          {err}
        </p>
      ) : (
        <p id="kod-not" className="mt-2 text-xs text-ink-mute">
          Bu cihazda başka bir defter açıksa, onun yerine kodundaki defter açılır.
        </p>
      )}
      <button className="btn btn-primary mt-6 w-full" disabled={pending || code.replace(/-/g, "").length !== 16}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Defterimi aç
      </button>
    </form>
  );
}
