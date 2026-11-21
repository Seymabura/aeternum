import "server-only";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

/** Herkese açık paylaşımı okur (oturum gerekmez; sadece ae_share_get RPC'si) */
export const getShare = cache(async (token: string) => {
  if (!supabaseConfigured || !/^[A-Za-z0-9]{20,64}$/.test(token)) return null;
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, { cookies: { getAll: () => [], setAll: () => {} } });
  const { data } = await supabase.rpc("ae_share_get", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  return row as { kind: "ay" | "gok" | "film"; payload: unknown; files: string[]; created_at: string };
});

export function sharedFileUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/shared/${path}`;
}
