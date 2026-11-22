"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { cleanLantern, lanternProblem } from "@/lib/lantern-filter";

export type SkyLantern = { id: string; text: string; created_at: string; mine: boolean };

export async function loadSky(): Promise<SkyLantern[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_lantern_sky");
  return (data ?? []) as SkyLantern[];
}

export async function releaseLantern(raw: string, priv: boolean) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum bulunamadı. Sayfayı yenile." };
  const problem = lanternProblem(raw ?? "");
  if (problem) return { ok: false as const, error: problem };
  const supabase = await createClient();
  const text = cleanLantern(raw);
  const { data, error } = await supabase.rpc("ae_lantern_release", { p_text: text, p_private: !!priv });
  if (error) {
    if (error.message.includes("limit")) return { ok: false as const, error: "Bugün 3 fener bıraktın. Yarın yenilerini bırakabilirsin." };
    if (error.message.includes("uygunsuz")) return { ok: false as const, error: "Bu dilek ortak gökyüzüne uygun değil. Biraz daha nazik yazar mısın?" };
    return { ok: false as const, error: "Fener bırakılamadı. Tekrar dene." };
  }
  return { ok: true as const, lantern: { id: data as string, text, created_at: new Date().toISOString(), mine: true } satisfies SkyLantern };
}

export async function reportLantern(id: string) {
  const supabase = await createClient();
  await supabase.rpc("ae_lantern_report", { p_id: id });
  return { ok: true as const };
}

export async function deleteLantern(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lanterns").delete().eq("id", id);
  return error ? { ok: false as const, error: "Silinemedi." } : { ok: true as const };
}
