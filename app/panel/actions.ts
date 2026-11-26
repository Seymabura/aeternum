"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const COOKIE = "ae_panel";

export async function panelLogin(_: unknown, form: FormData): Promise<{ error: string } | undefined> {
  const key = String(form.get("key") ?? "").trim();
  if (!key || key.length > 200) return { error: "Şifreyi yaz." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ae_admin_stats", { p_key: key });
  if (error) return { error: "Bağlantı kurulamadı, biraz sonra tekrar dene." };
  if (!data) return { error: "Şifre yanlış." };
  (await cookies()).set(COOKIE, key, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/panel",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/panel");
}

export async function panelLogout() {
  (await cookies()).set(COOKIE, "", { path: "/panel", maxAge: 0 });
  redirect("/panel");
}
