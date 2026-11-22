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
  board_id?: string | null;
};

export type VisionBoard = { id: string; name: string; format: BoardFormat; bg: string; created_at: string; updated_at: string };
export type BoardFormat = "telefon" | "tablet-dikey" | "tablet-yatay" | "masaustu" | "ig-kare" | "ig-hikaye" | "x";
const FORMATS: BoardFormat[] = ["telefon", "tablet-dikey", "tablet-yatay", "masaustu", "ig-kare", "ig-hikaye", "x"];

export type VisionLayout = { x: number; y: number; w: number; h: number; r: number; z: number; frame?: "yok" | "beyaz" | "polaroid" | "keskin"; font?: VisionFont; c?: string; caps?: boolean };
export type VisionFont = "serif" | "sans" | "el" | "kaligrafi" | "klasik" | "defter";

const FRAMES = ["yok", "beyaz", "polaroid", "keskin"];
const FONTS = ["serif", "sans", "el", "kaligrafi", "klasik", "defter"];
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
    ...(typeof o.c === "string" && /^#[0-9a-f]{6}$/i.test(o.c) ? { c: o.c } : {}),
    ...(o.caps === true ? { caps: true } : {}),
  };
}

const TONES = ["gece", "sampanya", "buz", "gul", "zumrut", "nar", "yazi"];
const LIB = new Set(VISION_LIBRARY.map((v) => v.src));

export async function addVision(input: { board: string; kind: "image" | "word"; src?: string; text?: string; tone?: string; size?: string; layout?: VisionLayout }) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum yok" };
  const supabase = await createClient();
  let src: string | null = null;
  let text: string | null = null;
  if (input.kind === "image") {
    const s = clip(input.src, 300);
    if (!(LIB.has(s) || s.startsWith(`${user.id}/vision/`) || s.startsWith(`${user.id}/sus/`)) || s.includes("..")) return { ok: false as const, error: "Geçersiz görsel" };
    src = s;
  } else {
    text = clip(input.text, 80);
    if (!text) return { ok: false as const, error: "Bir kelime yaz." };
  }
  const { data, error } = await supabase
    .from("vision_items")
    .insert({
      user_id: user.id,
      board_id: input.board,
      kind: input.kind,
      src,
      text,
      tone: TONES.includes(String(input.tone)) ? input.tone : "gece",
      size: ["s", "m", "l"].includes(String(input.size)) ? input.size : "m",
      layout: cleanLayout(input.layout),
    })
    .select("id,kind,src,text,tone,size,layout,board_id")
    .single();
  if (error) return { ok: false as const, error: error.message.includes("dolu") ? "Pano dolu (60 parça)." : "Eklenemedi." };
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

/** Yüklenen dosyayı, başka bir parça kullanmıyorsa depodan siler */
async function removeUnused(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, srcs: string[]) {
  const own = [...new Set(srcs.filter((s) => s.startsWith(`${userId}/vision/`)))];
  if (!own.length) return;
  const { data } = await supabase.from("vision_items").select("src").in("src", own);
  const still = new Set((data ?? []).map((r: { src: string }) => r.src));
  const gone = own.filter((s) => !still.has(s));
  if (gone.length) await supabase.storage.from("uploads").remove(gone);
}

export async function deleteVision(id: string) {
  const user = await getUser();
  if (!user) return { ok: false as const };
  const supabase = await createClient();
  const { data } = await supabase.from("vision_items").select("src").eq("id", id).maybeSingle();
  const { error } = await supabase.from("vision_items").delete().eq("id", id);
  if (!error && data?.src) await removeUnused(supabase, user.id, [data.src]);
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
  if (error) return { ok: false as const, error: error.message.includes("zaten") ? "Mektubun zaten mühürlü." : "Kapatılamadı, tekrar dener misin?" };
  revalidatePath("/mektup");
  return { ok: true as const };
}

// ---------------------------------------------------------------- panolar

const cleanName = (v: unknown) => clip(v, 40) || "Panom";

export async function createBoard(input: { name?: string; format: string; bg?: string }) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum bulunamadı. Sayfayı yenile." };
  if (!FORMATS.includes(input.format as BoardFormat)) return { ok: false as const, error: "Geçersiz boyut." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vision_boards")
    .insert({ user_id: user.id, name: cleanName(input.name), format: input.format, bg: /^[a-z0-9-]{2,24}$/.test(String(input.bg)) ? input.bg : "sampanya" })
    .select("id,name,format,bg,created_at,updated_at")
    .single();
  if (error) return { ok: false as const, error: error.message.includes("sınır") ? "En fazla 20 pano oluşturabilirsin." : "Pano oluşturulamadı." };
  return { ok: true as const, board: data as VisionBoard };
}

export async function updateBoard(id: string, patch: { name?: string; bg?: string }) {
  const supabase = await createClient();
  const p: Record<string, string> = {};
  if (patch.name !== undefined) p.name = cleanName(patch.name);
  if (patch.bg && /^[a-z0-9-]{2,24}$/.test(patch.bg)) p.bg = patch.bg;
  const { error } = await supabase.from("vision_boards").update(p).eq("id", id);
  return { ok: !error };
}

export async function deleteBoard(id: string) {
  const user = await getUser();
  if (!user) return { ok: false as const };
  const supabase = await createClient();
  const { data: own } = await supabase.from("vision_items").select("src").eq("board_id", id);
  const files = (own ?? []).map((r: { src: string | null }) => r.src).filter((s): s is string => !!s);
  const { error } = await supabase.from("vision_boards").delete().eq("id", id);
  if (!error) await removeUnused(supabase, user.id, files);
  return { ok: !error };
}

export async function duplicateBoard(id: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Oturum yok" };
  const supabase = await createClient();
  const { data: b } = await supabase.from("vision_boards").select("name,format,bg").eq("id", id).maybeSingle();
  if (!b) return { ok: false as const, error: "Pano bulunamadı." };
  const r = await createBoard({ name: `${b.name} (kopya)`.slice(0, 40), format: b.format, bg: b.bg });
  if (!r.ok) return r;
  const { data: items } = await supabase.from("vision_items").select("kind,src,text,tone,size,layout,position").eq("board_id", id);
  if (items?.length) {
    // yüklenen fotoğraflar aynı dosyayı paylaşır; dosya ancak hiçbir parça kullanmıyorsa silinir
    const rows = items.map((i) => ({ ...i, user_id: user.id, board_id: r.board.id }));
    const { error } = await supabase.from("vision_items").insert(rows);
    if (error) return { ok: false as const, error: "Kopyalanamadı." };
  }
  const { data: copied } = await supabase.from("vision_items").select("id,kind,src,text,tone,size,layout,board_id").eq("board_id", r.board.id);
  return { ok: true as const, board: r.board, items: (copied ?? []) as VisionItem[] };
}
