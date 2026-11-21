"use server";

import { createClient, getUser } from "@/lib/supabase/server";

export async function saveBoard(data: unknown) {
  const user = await getUser();
  if (!user) return { ok: false, error: "Oturum kapalı" };
  const json = JSON.stringify(data ?? {});
  if (json.length > 350_000) return { ok: false, error: "Pano çok büyüdü, birkaç öğeyi sil." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .upsert({ user_id: user.id, data: JSON.parse(json), updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: "Kaydedilemedi" };
  return { ok: true };
}
