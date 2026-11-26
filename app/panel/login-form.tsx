"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { panelLogin } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(panelLogin, undefined);
  return (
    <form action={action} className="mt-10">
      <label htmlFor="key" className="label">
        Panel şifresi
      </label>
      <input
        id="key"
        name="key"
        type="password"
        className="field"
        autoComplete="current-password"
        aria-invalid={!!state?.error}
        aria-describedby={state?.error ? "key-hata" : undefined}
      />
      {state?.error && (
        <p id="key-hata" role="alert" className="mt-2 text-sm text-bordo">
          {state.error}
        </p>
      )}
      <button className="btn btn-primary mt-6 w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Paneli aç
      </button>
    </form>
  );
}
