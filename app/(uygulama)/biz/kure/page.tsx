import { coupleState } from "@/app/actions/biz";
import { createClient } from "@/lib/supabase/server";
import { getProgress } from "@/lib/data";
import { CoupleGlobe, type ListItem } from "./couple-globe";

export const metadata = { title: "Ortak küre" };

export default async function Page() {
  const [state, p] = await Promise.all([coupleState(), getProgress()]);
  let items: ListItem[] = [];
  if (state) {
    const supabase = await createClient();
    const { data } = await supabase.from("couple_list").select("id,title,done,added_by,position").eq("couple_id", state.id).order("position", { ascending: true });
    items = (data ?? []) as ListItem[];
  }
  return <CoupleGlobe initial={state} items={items} myDays={p.entries.map((e) => e.day)} lights={p.bonusIds.length} myName={p.name ?? ""} userId={p.userId} />;
}
