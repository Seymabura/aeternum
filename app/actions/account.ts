"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

export async function updateProfile(form: { name: string; reminders: boolean }) {
  const user = await getUser();
  if (!user) return { ok: false, error: "Oturum kapalı" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: form.name.trim().slice(0, 40) || null, email_reminders: !!form.reminders });
  if (error) return { ok: false, error: "Kaydedilemedi" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Hesabı ve TÜM verileri kalıcı olarak siler (KVKK: silme hakkı). */
export async function deleteAccount(confirmText: string) {
  if (confirmText.trim().toLocaleLowerCase("tr") !== "sil") return { ok: false, error: "Onay için SİL yaz." };
  const user = await getUser();
  if (!user) return { ok: false, error: "Oturum kapalı" };
  const supabase = await createClient();
  // önce depodaki fotoğraflar (kullanıcı kendi klasörünü silebilir)
  const sweep = [
    ["uploads", [`${user.id}/pano`, `${user.id}/gorev`, `${user.id}/wish`, `${user.id}/vision`, user.id]],
    ["shared", [`${user.id}/film`, user.id]],
  ] as const;
  for (const [bucket, folders] of sweep) {
    for (const f of folders) {
      const { data } = await supabase.storage.from(bucket).list(f, { limit: 1000 });
      const files = (data ?? []).filter((x) => x.id).map((x) => `${f}/${x.name}`);
      if (files.length) await supabase.storage.from(bucket).remove(files);
    }
  }
  const { error } = await supabase.rpc("ae_delete_me");
  if (error) return { ok: false, error: "Silinemedi, lütfen tekrar dene." };
  await supabase.auth.signOut();
  redirect("/?silindi=1");
}
