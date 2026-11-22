"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { VISION_LIBRARY } from "@/lib/vision-library";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

// ---------------------------------------------------------------- 2027 hedefleri (wish_items, kind = "hedef")

export type WishKind = "istek" | "hedef";
export type WishItem = {
  id: string;
  kind: WishKind;
  title: string;
  note: string | null;
  url: string | null;
  price: string | null;
  category: string | null;
  done: boolean;
  image_url?: string | null;
  store?: string | null;
  fav?: boolean;
};

const WISH_COLS = "id,kind,title,note,url,price,category,done,image_url,store,fav";

export async function addWish(input: {
  kind: WishKind;
  title: string;
  url?: string;
  price?: string;
  note?: string;
  category?: string;
  image_url?: string;
  store?: string;
}) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum yok" };
  const title = clip(input.title, 140);
  if (!title) return { ok: false as const, error: "Bir şey yazmalısın." };
  const url = clip(input.url, 500);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wish_items")
    .insert({
      user_id: user.id,
      kind: input.kind === "hedef" ? "hedef" : "istek",
      title,
      url: /^https?:\/\//.test(url) ? url : null,
      price: clip(input.price, 40) || null,
      note: clip(input.note, 500) || null,
      category: clip(input.category, 30) || null,
      image_url: (() => {
        const im = clip(input.image_url, 800);
        return /^https:\/\//.test(im) || im.startsWith(`${user.id}/`) ? im : null;
      })(),
      store: clip(input.store, 60) || null,
    })
    .select(WISH_COLS)
    .single();
  if (error) return { ok: false as const, error: error.message.includes("dolu") ? "Liste dolu (300 madde)." : "Eklenemedi." };
  revalidatePath("/vision");
  return { ok: true as const, item: data as WishItem };
}

export async function toggleWish(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("wish_items").update({ done }).eq("id", id);
  return { ok: !error };
}

export async function deleteWish(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wish_items").delete().eq("id", id);
  revalidatePath("/vision");
  return { ok: !error };
}

// ---------------------------------------------------------------- vision board

export type VisionItem = {
  id: string;
  kind: "image" | "word";
  src: string | null;
  text: string | null;
  tone: string | null;
  size: "s" | "m" | "l";
  layout: VisionLayout | null;
};

export type VisionLayout = { x: number; y: number; w: number; h: number; r: number; z: number; frame?: "yok" | "polaroid" | "keskin"; font?: "serif" | "sans" | "el" };

const FRAMES = ["yok", "polaroid", "keskin"];
const FONTS = ["serif", "sans", "el"];
const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null);
function cleanLayout(l: unknown): VisionLayout | null {
  if (!l || typeof l !== "object") return null;
  const o = l as Record<string, unknown>;
  const x = num(o.x, -2000, 4000), y = num(o.y, -2000, 5000), w = num(o.w, 40, 4000), h = num(o.h, 40, 6000), r = num(o.r, -360, 360), z = num(o.z, 0, 10000);
  if ([x, y, w, h, r, z].some((v) => v === null)) return null;
  return {
    x: Math.round(x!), y: Math.round(y!), w: Math.round(w!), h: Math.round(h!), r: Math.round(r! * 10) / 10, z: Math.round(z!),
    frame: FRAMES.includes(String(o.frame)) ? (o.frame as VisionLayout["frame"]) : "yok",
    font: FONTS.includes(String(o.font)) ? (o.font as VisionLayout["font"]) : "serif",
  };
}

const TONES = ["gece", "sampanya", "buz", "gul", "zumrut", "nar", "yazi"];
const LIB = new Set(VISION_LIBRARY.map((v) => v.src));

export async function addVision(input: { kind: "image" | "word"; src?: string; text?: string; tone?: string; size?: string; layout?: VisionLayout }) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum yok" };
  const supabase = await createClient();
  let src: string | null = null;
  let text: string | null = null;
  if (input.kind === "image") {
    const s = clip(input.src, 300);
    if (!(LIB.has(s) || s.startsWith(`${user.id}/vision/`))) return { ok: false as const, error: "Geçersiz görsel" };
    src = s;
  } else {
    text = clip(input.text, 80);
    if (!text) return { ok: false as const, error: "Bir kelime yaz." };
  }
  const { data, error } = await supabase
    .from("vision_items")
    .insert({
      user_id: user.id,
      kind: input.kind,
      src,
      text,
      tone: TONES.includes(String(input.tone)) ? input.tone : "gece",
      size: ["s", "m", "l"].includes(String(input.size)) ? input.size : "m",
      layout: cleanLayout(input.layout),
    })
    .select("id,kind,src,text,tone,size,layout")
    .single();
  if (error) return { ok: false as const, error: error.message.includes("dolu") ? "Pano dolu (60 parça)." : "Eklenemedi." };
  revalidatePath("/vision");
  return { ok: true as const, item: data as VisionItem };
}

export async function updateVision(id: string, patch: { size?: string; tone?: string; layout?: VisionLayout; text?: string }) {
  const supabase = await createClient();
  const p: Record<string, unknown> = {};
  if (patch.layout) {
    const l = cleanLayout(patch.layout);
    if (l) p.layout = l;
  }
  if (typeof patch.text === "string" && patch.text.trim()) p.text = clip(patch.text, 80);
  if (patch.size && ["s", "m", "l"].includes(patch.size)) p.size = patch.size;
  if (patch.tone && TONES.includes(patch.tone)) p.tone = patch.tone;
  const { error } = await supabase.from("vision_items").update(p).eq("id", id);
  return { ok: !error };
}

export async function deleteVision(id: string) {
  const user = await getUser();
  const supabase = await createClient();
  const { data } = await supabase.from("vision_items").select("src").eq("id", id).maybeSingle();
  if (user && data?.src?.startsWith(`${user.id}/`)) await supabase.storage.from("uploads").remove([data.src]);
  const { error } = await supabase.from("vision_items").delete().eq("id", id);
  revalidatePath("/vision");
  return { ok: !error };
}

// ---------------------------------------------------------------- mesaj küresi

export async function sealCapsule(message: string, email: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum yok" };
  const msg = clip(message, 6000);
  if (msg.length < 3) return { ok: false as const, error: "Biraz daha yaz, 2027'deki sen merak ediyor." };
  const mail = clip(email, 200);
  if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return { ok: false as const, error: "E-posta adresi geçersiz görünüyor." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("ae_capsule_seal", { msg, mail: mail || null });
  if (error) return { ok: false as const, error: error.message.includes("zaten") ? "Küren zaten kapatılmış." : "Kapatılamadı, tekrar dener misin?" };
  revalidatePath("/kure");
  return { ok: true as const };
}

export async function setVisionBg(bg: string) {
  const user = await getUser();
  if (!user) return { ok: false as const };
  if (!/^[a-z]{2,20}$/.test(bg)) return { ok: false as const };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ vision_bg: bg }).eq("id", user.id);
  return { ok: !error };
}
