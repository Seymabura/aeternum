import { getProgress } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ART } from "@/lib/art";
import { Gallery } from "./gallery";

export const metadata = { title: "Emek Boyama" };

export default async function ColoringIndex() {
  const p = await getProgress();
  const supabase = await createClient();
  const { data } = await supabase.from("colorings").select("image_id,fills,updated_at").order("updated_at", { ascending: false });
  const progress: Record<string, number> = {};
  let last: string | null = null;
  for (const row of data ?? []) {
    const art = ART.find((a) => a.id === row.image_id);
    if (!art) continue;
    last ??= row.image_id;
    progress[row.image_id] = Object.keys(row.fills ?? {}).length / art.regions;
  }
  return (
    <div>
      <h1 className="display text-4xl sm:text-5xl">Emek boyama</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Her görev, her resimde yeni bir bölüm açar. Şu an <b className="text-ink">{p.effort}/32</b> bölüm açık. İstediğin resmi
        seç, istediğin kadar resme başla.
      </p>
      <Gallery items={ART} progress={progress} last={last} />
    </div>
  );
}
