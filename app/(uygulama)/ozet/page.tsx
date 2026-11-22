import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProgress } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Countdown } from "@/components/countdown";
import { YearStory, type StoryData } from "./year-story";

export const metadata = { title: "2026'n" };

export default async function OzetPage() {
  const p = await getProgress();
  if (p.today < 31) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="display text-[2.5rem]">2026&apos;n 31 Aralık&apos;ta hazır</h1>
        <p className="mt-3 text-ink-soft">
          Aralık boyunca yaptıkların tek bir hikâyede toplanacak. {p.today === 0 ? "İlk kutu " : "Son kutuya "}
          <Countdown mode={p.today === 0 ? "december" : "midnight"} className="text-ink" /> kaldı.
        </p>
        <Link href="/takvim" className="btn btn-ghost mt-8">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Takvime dön
        </Link>
      </div>
    );
  }
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_capsule_status");
  const st = Array.isArray(data) ? data[0] : null;
  const at = (d: number) => p.entries.find((e) => e.day === d)?.answer;
  const story: StoryData = {
    name: p.name,
    count: p.entries.length,
    onTime: p.entries.filter((e) => e.on_time).length,
    bestStreak: p.bestStreak,
    lights: p.bonusIds.length,
    days: p.entries.map((e) => e.day),
    moments: (at(25)?.items ?? []).filter(Boolean),
    word: at(27)?.word?.trim() || null,
    habits: (at(30)?.items ?? []).filter(Boolean),
    letter: st ? { opensAt: st.opens_at as string } : null,
  };
  return <YearStory data={story} />;
}
