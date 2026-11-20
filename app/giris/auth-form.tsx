"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "giris" | "kayit" | "unuttum";

const TR_ERR: Record<string, string> = {
  "Invalid login credentials": "E-posta ya da şifre hatalı.",
  "Email not confirmed": "Önce e-postandaki doğrulama linkine tıklamalısın.",
  "User already registered": "Bu e-postayla zaten bir hesap var, giriş yapmayı dene.",
};

export function AuthForm({ next, error, googleEnabled }: { next: string; error?: boolean; googleEnabled: boolean }) {
  const [mode, setMode] = useState<Mode>("giris");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    const name = String(f.get("name") || "").trim();
    setBusy(true);
    try {
      if (mode === "giris") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else if (mode === "kayit") {
        if (password.length < 8) throw new Error("Şifre en az 8 karakter olmalı.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else setSent(email);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/profil?sifre=1`,
        });
        if (error) throw error;
        setSent(email);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(TR_ERR[msg] ?? (msg.includes("rate") ? "Çok fazla deneme oldu, biraz sonra tekrar dene." : msg));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      toast.error("Google ile giriş şu an çalışmıyor.");
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="py-4 text-center">
        <p className="text-4xl">✉️</p>
        <h1 className="display mt-3 text-2xl">E-postanı kontrol et</h1>
        <p className="mt-2 text-ink-soft">
          <b>{sent}</b> adresine bir link gönderdik. Linke tıklayınca defterin açılacak.
        </p>
        <button className="btn btn-ghost mt-6" onClick={() => setSent(null)}>
          Geri dön
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="display text-3xl">{mode === "kayit" ? "Defterini oluştur" : mode === "unuttum" ? "Şifreni yenile" : "Tekrar hoş geldin"}</h1>
      <p className="mt-1 text-ink-soft">
        {mode === "kayit" ? "Bir dakikada hazır." : mode === "unuttum" ? "E-postana yenileme linki gönderelim." : "Defterin seni bekliyor."}
      </p>
      {error && <p className="mt-3 rounded-lg bg-bordo/10 px-3 py-2 text-sm text-bordo">Giriş linki geçersiz ya da süresi dolmuş.</p>}

      {googleEnabled && mode !== "unuttum" && (
        <>
          <button type="button" onClick={google} disabled={busy} className="btn btn-ghost mt-6 w-full py-3">
            <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Google ile devam et
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-ink/15" /> ya da e-postayla <span className="h-px flex-1 bg-ink/15" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className={cn("space-y-3.5", !googleEnabled && "mt-6")}>
        {mode === "kayit" && (
          <div>
            <label className="label" htmlFor="name">Adın</label>
            <input id="name" name="name" className="field" maxLength={40} placeholder="Sana nasıl seslenelim?" autoComplete="given-name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">E-posta</label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" inputMode="email" />
        </div>
        {mode !== "unuttum" && (
          <div>
            <label className="label" htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={mode === "kayit" ? 8 : 1}
              className="field"
              autoComplete={mode === "kayit" ? "new-password" : "current-password"}
            />
          </div>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary mt-2 w-full py-3.5 text-base">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "kayit" ? "Kayıt ol" : mode === "unuttum" ? "Link gönder" : "Giriş yap"}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        {mode === "giris" ? (
          <>
            <button className="text-bordo underline-offset-4 hover:underline" onClick={() => setMode("kayit")}>
              Hesabın yok mu? Kayıt ol
            </button>
            <button className="text-ink-soft underline-offset-4 hover:underline" onClick={() => setMode("unuttum")}>
              Şifremi unuttum
            </button>
          </>
        ) : (
          <button className="text-bordo underline-offset-4 hover:underline" onClick={() => setMode("giris")}>
            Zaten hesabım var, giriş yap
          </button>
        )}
      </div>
    </div>
  );
}
