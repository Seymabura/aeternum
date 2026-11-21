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
      <section className="rise">
        <p className="label !tracking-[0.3em]">emek boyama</p>
        <h1 className="display mt-2 text-4xl sm:text-6xl">
          Emeğin <em className="gold-shine">renge</em> dönüşsün
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Her görev, her resimde yeni bir bölüm açar. Bitirdiğin resim telefonunun duvar kağıdı olur.
        </p>
        <div className="sheet mt-6 max-w-xl p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">Açık bölüm</span>
            <span className="display text-2xl">
              {p.effort}
              <span className="text-base text-ink-soft">/32</span>
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[repeat(32,1fr)] gap-[3px]">
            {Array.from({ length: 32 }, (_, i) => (
              <span
                key={i}
                className={
                  "h-2.5 rounded-full " +
                  (i < p.effort ? "bg-gradient-to-b from-[#ffd59a] to-[#d96f35] shadow-[0_0_8px_rgba(242,162,74,.6)]" : "bg-ink/10")
                }
              />
            ))}
          </div>
        </div>
      </section>
      <Gallery items={ART} progress={progress} last={last} />
    </div>
  );
}
