"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

export type ShareKind = "ay" | "gok" | "film";
export type ShareRow = { token: string; kind: ShareKind; created_at: string; title: string };

const ALPH = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Tahmin edilemez 22 karakterlik bağlantı anahtarı */
function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(22));
  let s = "";
  for (const b of bytes) s += ALPH[b % 62];
  return s;
}

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function createShare(kind: ShareKind, payload: unknown, files: string[] = []) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum bulunamadı. Sayfayı yenile." };
  if (!["ay", "gok"].includes(kind)) return { ok: false as const, error: "Geçersiz tür." };
  const json = JSON.stringify(payload ?? {});
  if (json.length > 30000) return { ok: false as const, error: "Bu paylaşım çok büyük." };
  // sadece kendi klasöründeki paylaşılan dosyalar
  const own = files.filter((f) => typeof f === "string" && f.startsWith(`${user.id}/`)).slice(0, 16);
  const supabase = await createClient();
  const token = makeToken();
  const { error } = await supabase.from("shares").insert({ token, owner: user.id, kind, payload: JSON.parse(json), files: own });
  if (error) return { ok: false as const, error: error.message.includes("30") ? "En fazla 30 bağlantı oluşturabilirsin. Eskilerden birini sil." : "Bağlantı oluşturulamadı." };
  revalidatePath("/biz");
  return { ok: true as const, token };
}

export async function deleteShare(token: string) {
  const user = await getUser();
  if (!user) return { ok: false as const };
  const supabase = await createClient();
  const { data } = await supabase.from("shares").select("files").eq("token", clip(token, 64)).maybeSingle();
  const files = (data?.files ?? []) as string[];
  if (files.length) await supabase.storage.from("shared").remove(files);
  await supabase.from("shares").delete().eq("token", clip(token, 64));
  revalidatePath("/biz");
  return { ok: true as const };
}

export async function listShares(): Promise<ShareRow[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("shares").select("token,kind,created_at,payload").order("created_at", { ascending: false });
  return (data ?? []).map((r) => {
    const p = r.payload as { a?: { name?: string }; b?: { name?: string }; names?: string[] };
    const names = p?.names ?? [p?.a?.name, p?.b?.name].filter(Boolean);
    return { token: r.token, kind: r.kind as ShareKind, created_at: r.created_at, title: (names as string[]).join(" & ") };
  });
}

// ---------------------------------------------------------------- eşleşme (ortak defter)

export type CoupleMember = { me: boolean; role: "owner" | "partner"; name: string; days: number[] };
export type CoupleState = { id: string; members: CoupleMember[]; invite: { code: string; expires_at: string } | null } | null;

export async function coupleState(): Promise<CoupleState> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_couple_state");
  return (data as CoupleState) ?? null;
}

export async function createInvite(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ae_couple_invite", { p_name: clip(name, 40) });
  if (error) return { ok: false as const, error: error.message.includes("Zaten") ? "Zaten bir sevgilinle eşleşmişsin." : "Davet oluşturulamadı." };
  revalidatePath("/biz/defter");
  return { ok: true as const, code: data as string };
}

export async function joinCouple(code: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("ae_couple_join", { p_code: clip(code, 20), p_name: clip(name, 40) });
  if (error) return { ok: false as const, error: error.message.replace(/^.*?: /, "") };
  revalidatePath("/biz/defter");
  return { ok: true as const };
}

export async function leaveCouple() {
  const supabase = await createClient();
  await supabase.rpc("ae_couple_leave");
  revalidatePath("/biz/defter");
  return { ok: true as const };
}

export async function renameMe(name: string) {
  const supabase = await createClient();
  await supabase.rpc("ae_couple_rename", { p_name: clip(name, 40) });
  revalidatePath("/biz/defter");
  return { ok: true as const };
}
