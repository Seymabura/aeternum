import { requireUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { VisionItem } from "@/app/actions/extras";
import { VisionStudio } from "./studio";
import { Goals } from "./goals";
import type { WishItem } from "@/app/actions/extras";

export const metadata = { title: "Vision board" };

export default async function VisionPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("vision_items").select("id,kind,src,text,tone,size,layout").order("position", { ascending: true });
  const items = (data ?? []) as VisionItem[];
  const own = items.filter((i) => i.src && !i.src.startsWith("/")).map((i) => i.src!) as string[];
  const urls: Record<string, string> = {};
  if (own.length) {
    const { data: signed } = await supabase.storage.from("uploads").createSignedUrls(own, 60 * 60 * 6);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
  }
  const { data: goals } = await supabase
    .from("wish_items")
    .select("id,kind,title,note,url,price,category,done,image_url,store,fav")
    .eq("kind", "hedef")
    .order("position", { ascending: true });
  const { data: prof } = await supabase.from("profiles").select("vision_bg").eq("id", user.id).maybeSingle();
  return (
    <>
      <VisionStudio initial={items} urls={urls} userId={user.id} bg={prof?.vision_bg ?? "gece"} />
      <Goals initial={(goals ?? []) as WishItem[]} />
    </>
  );
}
