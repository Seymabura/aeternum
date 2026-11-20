import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { MAX_EFFORT, type TaskAnswer } from "@/lib/tasks";
import { todayIndexLocal } from "@/lib/day";

export type EntryRow = {
  day: number;
  on_time: boolean;
  completed_at: string;
  answer: TaskAnswer;
  photo_path: string | null;
};

export type Progress = {
  userId: string;
  name: string;
  today: number;
  entries: EntryRow[];
  bonusIds: number[];
  effort: number;
  streak: number;
  bestStreak: number;
};

export const getToday = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ae_today_index");
  if (error || typeof data !== "number") return todayIndexLocal();
  return data;
});

export function computeStreaks(entries: { day: number; on_time: boolean }[], today: number) {
  const onTime = new Set(entries.filter((e) => e.on_time).map((e) => e.day));
  let best = 0;
  let run = 0;
  for (let d = 1; d <= 31; d++) {
    if (onTime.has(d)) {
      run++;
      best = Math.max(best, run);
    } else run = 0;
  }
  // güncel seri: bugün yapıldıysa bugünden, yapılmadıysa dünden geriye say
  let cur = 0;
  const last = Math.min(today, 31);
  let d = onTime.has(last) ? last : last - 1;
  while (d >= 1 && onTime.has(d)) {
    cur++;
    d--;
  }
  return { streak: cur, bestStreak: best };
}

/** Oturum zorunlu sayfalar için: kullanıcı yoksa girişe yollar. */
export const requireUser = cache(async () => {
  const user = await getUser();
  if (!user) redirect("/giris");
  return user;
});

export const getProgress = cache(async (): Promise<Progress> => {
  const user = await requireUser();
  const supabase = await createClient();
  const [today, entriesRes, bonusRes, profileRes] = await Promise.all([
    getToday(),
    supabase.from("task_entries").select("day,on_time,completed_at,answer,photo_path").order("day"),
    supabase.from("bonus_entries").select("bonus_id"),
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
  ]);
  const entries = (entriesRes.data ?? []) as EntryRow[];
  const bonusIds = (bonusRes.data ?? []).map((b: { bonus_id: number }) => b.bonus_id);
  const effort = Math.min(MAX_EFFORT, 1 + entries.length + bonusIds.length);
  const { streak, bestStreak } = computeStreaks(entries, today);
  const name =
    profileRes.data?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Sen";
  return { userId: user.id, name, today, entries, bonusIds, effort, streak, bestStreak };
});
