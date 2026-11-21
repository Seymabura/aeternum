import { requireUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { WishItem } from "@/app/actions/extras";
import { Wishlist } from "./wishlist";

export const metadata = { title: "Wishlist" };

export default async function ListPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("wish_items")
    .select("id,kind,title,note,url,price,category,done,image_url,store,fav")
    .eq("kind", "istek")
    .order("position", { ascending: false });
  const items = (data ?? []) as WishItem[];
  const own = items.filter((i) => i.image_url && !i.image_url.startsWith("http")).map((i) => i.image_url!) as string[];
  const urls: Record<string, string> = {};
  if (own.length) {
    const { data: signed } = await supabase.storage.from("uploads").createSignedUrls(own, 60 * 60 * 6);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
  }
  return <Wishlist initial={items} urls={urls} userId={user.id} />;
}
