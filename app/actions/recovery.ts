"use server";

import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { codeToCredentials, formatCode, hasRecoveryEmail, normalizeCode, RECOVERY_ALPHABET } from "@/lib/recovery";

function randomPart(n: number) {
  const b = crypto.getRandomValues(new Uint8Array(n));
  let s = "";
  for (const x of b) s += RECOVERY_ALPHABET[x % RECOVERY_ALPHABET.length];
  return s;
}

/** Defter için kurtarma kodu üretir. Kod tekrar gösterilemez; yenisi eskisini geçersiz kılar. */
export async function createRecoveryCode() {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum bulunamadı. Sayfayı yenile." };
  if (user.email && !hasRecoveryEmail(user.email)) return { ok: false as const, error: "Bu defter zaten e-postaya bağlı." };
  const supabase = await createClient();
  // kimlik kısmı ilk koddan sonra sabit kalır (e-posta değişmez), sadece gizli kısım yenilenir
  const id = hasRecoveryEmail(user.email) ? user.email!.split("@")[0].toUpperCase() : randomPart(8);
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = (attempt === 0 ? id : randomPart(8)) + randomPart(8);
    const { email, password } = codeToCredentials(code);
    const { error } = await supabase.auth.updateUser(user.email === email ? { password } : { email, password });
    if (!error) return { ok: true as const, code: formatCode(code) };
    if (!/already|exists|registered/i.test(error.message)) return { ok: false as const, error: "Kod oluşturulamadı. Biraz sonra tekrar dene." };
  }
  return { ok: false as const, error: "Kod oluşturulamadı. Tekrar dene." };
}

/** Kodu girilen defteri bu cihazda açar */
export async function restoreFromCode(raw: string) {
  const c = normalizeCode(raw ?? "");
  if (c.length !== 16) return { ok: false as const, error: "Kod 16 karakter olmalı, ör. ABCD-EFGH-JKMN-PQRS." };
  const supabase = await createClient();
  const { email, password } = codeToCredentials(c);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (/rate|too many/i.test(error.message)) return { ok: false as const, error: "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene." };
    return { ok: false as const, error: "Bu kod eşleşmedi. Harfleri kontrol edip tekrar dene." };
  }
  redirect("/takvim?kurtarildi=1");
}
