import Link from "next/link";
import { getProgress, requireUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Ben" };

export default async function ProfilePage({ searchParams }: PageProps<"/profil">) {
  const sp = await searchParams;
  const user = await requireUser();
  const p = await getProgress();
  const supabase = await createClient();
  const { data: prof } = await supabase.from("profiles").select("display_name,email_reminders").eq("id", user.id).maybeSingle();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="display text-5xl sm:text-6xl">Ben</h1>
        <p className="mt-2 text-ink-soft">Defterin bu cihazda saklanıyor. Tarayıcı verilerini silersen defterin de silinir.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat n={p.entries.length} label="kutu" />
        <Stat n={p.streak} label="seri 🔥" />
        <Stat n={p.effort} label="emek" />
      </div>
      <ProfileForm
        name={prof?.display_name ?? ""}
        reminders={prof?.email_reminders ?? false}
        resetPassword={sp.sifre === "1"}
      />
      <p className="text-center text-sm text-ink-soft">
        <Link href="/gizlilik" className="underline">Gizlilik</Link> ·{" "}
        <Link href="/kvkk" className="underline">KVKK Aydınlatma Metni</Link>
      </p>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="sheet p-4 text-center">
      <p className="display text-3xl">{n}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
