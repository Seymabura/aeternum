import { requireUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { WishItem } from "@/app/actions/extras";
import { Wishlist } from "./wishlist";

export const metadata = { title: "Wishlist" };

export default async function ListPage() {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("wish_items").select("id,kind,title,note,url,price,category,done").order("position", { ascending: true });
  return <Wishlist initial={(data ?? []) as WishItem[]} />;
}
