import { createClient } from "@/lib/supabase/server";
import { Capsule } from "./capsule";

export const metadata = { title: "2027'ye mektup" };

export default async function MektupPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_capsule_status");
  const st = Array.isArray(data) ? data[0] : null;
  let opened: string | null = null;
  if (st) {
    const { data: m } = await supabase.rpc("ae_capsule_open");
    opened = typeof m === "string" ? m : null;
  }
  return (
    <Capsule
      status={st ? { sealedAt: st.sealed_at as string, opensAt: st.opens_at as string, chars: st.chars as number, hasEmail: st.has_email as boolean } : null}
      opened={opened}
    />
  );
}
