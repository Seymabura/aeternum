"use server";

import { createClient, getUser } from "@/lib/supabase/server";

export type JournalDay = { day: number; mine: string | null; partner_done: boolean; partner: string | null };
export type JournalState = { started_on: string; ritual: string; today: number; days: JournalDay[] } | null;

export async function journalState(): Promise<JournalState> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_journal_state");
  return (data as JournalState) ?? null;
}

export async function startJournal(ritual: string) {
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(ritual)) return { ok: false as const, error: "Saati SS:DD biçiminde seç." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("ae_journal_start", { p_ritual: ritual });
  if (error) return { ok: false as const, error: error.message.includes("eşleş") ? "Önce sevgilinle eşleşmelisiniz." : "Defter başlatılamadı." };
  return { ok: true as const };
}

export async function answerJournal(day: number, text: string) {
  const t = (text ?? "").trim();
  if (!t) return { ok: false as const, error: "Bir şeyler yaz." };
  if (t.length > 1000) return { ok: false as const, error: "Cevap en fazla 1000 karakter olabilir." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("ae_journal_answer", { p_day: Math.round(day), p_text: t });
  if (error) {
    const m = error.message;
    return { ok: false as const, error: m.includes("açılmadı") ? "Bu soru henüz açılmadı." : m.includes("değiştirilemez") ? "Cevaplar açıldı; artık değiştirilemez." : "Kaydedilemedi. Tekrar dene." };
  }
  return { ok: true as const };
}
