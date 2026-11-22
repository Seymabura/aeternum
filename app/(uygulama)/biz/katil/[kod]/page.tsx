import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JoinCard } from "./join-card";

export const metadata = { title: "Ortak defter daveti" };

export default async function JoinPage({ params }: PageProps<"/biz/katil/[kod]">) {
  const { kod } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("ae_couple_invite_info", { p_code: kod });
  const info = (Array.isArray(data) ? data[0] : null) as { inviter: string; valid: boolean; reason: string } | null;
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      {info?.valid ? (
        <JoinCard code={kod} inviter={info.inviter} />
      ) : (
        <>
          <h1 className="display text-[2.4rem]">Davet açılamadı</h1>
          <p className="mt-3 text-ink-soft">{info?.reason || "Bu davet bulunamadı."}</p>
          <Link href="/biz/defter" className="btn btn-ghost mt-8">
            Ortak deftere git
          </Link>
        </>
      )}
    </div>
  );
}
