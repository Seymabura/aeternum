import { notFound } from "next/navigation";
import { getProgress } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { getArt, openSections } from "@/lib/art";
import { ColoringEditor } from "./coloring-editor";

export async function generateMetadata({ params }: PageProps<"/boyama/[id]">) {
  const { id } = await params;
  return { title: getArt(id)?.title ?? "Boyama" };
}

export default async function ColoringPage({ params }: PageProps<"/boyama/[id]">) {
  const { id } = await params;
  const art = getArt(id);
  if (!art) notFound();
  const p = await getProgress();
  const supabase = await createClient();
  const { data } = await supabase.from("colorings").select("fills,strokes").eq("image_id", id).maybeSingle();
  return (
    <ColoringEditor
      meta={art}
      open={openSections(p.effort, art.sections)}
      effort={p.effort}
      initialFills={(data?.fills as Record<string, string>) ?? {}}
      initialStrokes={(data?.strokes as { c: string; w: number; d: string }[]) ?? []}
    />
  );
}
