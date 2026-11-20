import { getProgress } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Board } from "@/lib/board/types";
import BoardEditor from "./board-loader";

export const metadata = { title: "Dilek Panosu" };

export default async function BoardPage() {
  const p = await getProgress();
  const supabase = await createClient();
  const { data } = await supabase.from("boards").select("data").maybeSingle();
  const board = data?.data && (data.data as Board).items ? (data.data as Board) : null;
  const paths = (board?.items ?? []).flatMap((i) => (i.type === "photo" ? [i.path] : []));
  const urls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("uploads").createSignedUrls(paths, 60 * 60 * 6);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
  }
  return <BoardEditor initial={board} urls={urls} userId={p.userId} />;
}
