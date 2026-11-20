"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { getArt, openSections } from "@/lib/art";
import { regionSections } from "@/lib/art/sections.server";
import { MAX_EFFORT } from "@/lib/tasks";

export type Stroke = { c: string; w: number; d: string };

const COLOR = /^#[0-9a-f]{6}$/i;

export async function saveColoring(imageId: string, fills: Record<string, string>, strokes: Stroke[]) {
  const user = await getUser();
  if (!user) return { ok: false, error: "Oturum kapalı" };
  const art = getArt(imageId);
  const secs = regionSections(imageId);
  if (!art || !secs) return { ok: false, error: "Resim bulunamadı" };

  const supabase = await createClient();
  const [{ count: t }, { count: b }] = await Promise.all([
    supabase.from("task_entries").select("day", { count: "exact", head: true }),
    supabase.from("bonus_entries").select("bonus_id", { count: "exact", head: true }),
  ]);
  const effort = Math.min(MAX_EFFORT, 1 + (t ?? 0) + (b ?? 0));
  const open = openSections(effort, art.sections);

  // sunucu kontrolü: kilitli bölgelere boya yazılamaz
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fills ?? {})) {
    const i = Number(k);
    if (Number.isInteger(i) && i >= 0 && i < secs.length && secs[i] < open && COLOR.test(v)) clean[k] = v.toLowerCase();
  }
  const cleanStrokes = (Array.isArray(strokes) ? strokes : [])
    .filter((s) => s && COLOR.test(s.c) && typeof s.d === "string" && s.d.length < 20000 && s.w > 0 && s.w <= 80)
    .slice(-600)
    .map((s) => ({ c: s.c.toLowerCase(), w: Math.round(s.w * 10) / 10, d: s.d }));

  const { error } = await supabase.from("colorings").upsert({
    user_id: user.id,
    image_id: imageId,
    fills: clean,
    strokes: cleanStrokes,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "Kaydedilemedi" };
  return { ok: true };
}
