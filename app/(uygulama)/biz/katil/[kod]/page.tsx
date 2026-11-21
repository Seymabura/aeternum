import { createClient } from "@/lib/supabase/server";
import { coupleState } from "@/app/actions/biz";
import { JoinCard } from "./join-card";

export const metadata = { title: "Ortak küre daveti" };

export default async function Page({ params }: PageProps<"/biz/katil/[kod]">) {
  const { kod } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_couple_invite_info", { p_code: kod.slice(0, 20) });
  const info = (Array.isArray(data) ? data[0] : null) as { inviter: string; valid: boolean; reason: string } | null;
  const mine = await coupleState();
  return <JoinCard code={kod} inviter={info?.inviter ?? ""} valid={!!info?.valid && !mine} reason={mine ? "Zaten bir ortak küren var. Yeni birine katılmak için önce ondan ayrıl." : (info?.reason ?? "Bu davet bulunamadı.")} />;
}
