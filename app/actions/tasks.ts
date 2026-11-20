"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { BONUSES, TASKS, type TaskAnswer } from "@/lib/tasks";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

function cleanAnswer(kind: string, a: TaskAnswer): TaskAnswer | null {
  switch (kind) {
    case "list3": {
      const items = (Array.isArray(a.items) ? a.items : []).slice(0, 3).map((x) => clip(x, 240));
      return items.some(Boolean) ? { items } : null;
    }
    case "song": {
      const title = clip(a.title, 120);
      const link = clip(a.link, 300);
      return title ? { title, artist: clip(a.artist, 120), link: /^https?:\/\//.test(link) ? link : "" } : null;
    }
    case "word": {
      const word = clip(a.word, 40);
      return word ? { word, why: clip(a.why, 400) } : null;
    }
    case "photo":
      return { caption: clip(a.caption, 240) };
    case "letter": {
      const text = clip(a.text, 6000);
      return text ? { text } : null;
    }
    default: {
      const text = clip(a.text, 2000);
      return text ? { text } : null;
    }
  }
}

export async function saveTask(day: number, answer: TaskAnswer, photoPath?: string | null) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Önce giriş yapmalısın." };
  const task = TASKS.find((t) => t.day === day);
  if (!task) return { ok: false as const, error: "Böyle bir gün yok." };
  const clean = cleanAnswer(task.kind, answer);
  if (!clean) return { ok: false as const, error: "Biraz daha yazmalısın 🙂" };
  if (task.kind === "photo") {
    if (!photoPath || !photoPath.startsWith(`${user.id}/`)) return { ok: false as const, error: "Bir fotoğraf seçmelisin." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("task_entries").select("day").eq("day", day).maybeSingle();
  const row = { day, answer: clean, photo_path: task.kind === "photo" ? photoPath : null };
  const { error } = existing
    ? await supabase.from("task_entries").update(row).eq("day", day).eq("user_id", user.id)
    : await supabase.from("task_entries").insert({ ...row, user_id: user.id });
  if (error) {
    if (error.message?.includes("açılmadı")) return { ok: false as const, error: "Bu kutu henüz açılmadı. Sabırla bekle 🕯️" };
    return { ok: false as const, error: "Kaydedilemedi, tekrar dener misin?" };
  }
  revalidatePath("/takvim");
  revalidatePath("/boyama");
  return { ok: true as const, first: !existing };
}

export async function saveBonus(id: number, answer: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Önce giriş yapmalısın." };
  if (!BONUSES.some((b) => b.id === id)) return { ok: false as const, error: "Bulunamadı." };
  const text = clip(answer, 280);
  if (!text) return { ok: false as const, error: "Bir şeyler yazmalısın." };
  const supabase = await createClient();
  const { error } = await supabase.from("bonus_entries").upsert({ user_id: user.id, bonus_id: id, answer: text });
  if (error) {
    if (error.message?.includes("açılmadı")) return { ok: false as const, error: "Bu küçük emek henüz açılmadı." };
    return { ok: false as const, error: "Kaydedilemedi." };
  }
  revalidatePath("/takvim");
  revalidatePath("/boyama");
  return { ok: true as const };
}
