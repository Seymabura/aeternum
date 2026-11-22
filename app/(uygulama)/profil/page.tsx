import Link from "next/link";
import { getProgress, requireUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { RecoveryCard } from "./recovery-card";
import { InstallApp } from "@/components/install-app";
import { hasRecoveryEmail } from "@/lib/recovery";

export const metadata = { title: "Ben" };

export default async function ProfilePage({ searchParams }: PageProps<"/profil">) {
  const sp = await searchParams;
  const user = await requireUser();
  const p = await getProgress();
  const supabase = await createClient();
  const { data: prof } = await supabase.from("profiles").select("display_name,email_reminders").eq("id", user.id).maybeSingle();
  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div>
        <p className="eyebrow">Profil</p>
        <h1 className="display mt-5 text-[2.75rem] sm:text-[3.5rem]">Defterin</h1>
        <p className="mt-4 text-ink-soft">Görevlerin, mektubun ve panoların bu defterde.</p>
      </div>
      <dl className="sheet grid grid-cols-3 py-6">
        <Stat n={p.entries.length} total="/31" label="gün" first />
        <Stat n={p.streak} label="gün seri" />
        <Stat n={p.bonusIds.length} total="/17" label="ışık" />
      </dl>
      {(!user.email || hasRecoveryEmail(user.email)) && <RecoveryCard has={hasRecoveryEmail(user.email)} />}
      <InstallApp />
      <ProfileForm
        name={prof?.display_name ?? ""}
        reminders={prof?.email_reminders ?? false}
        resetPassword={sp.sifre === "1"}
      />
      <p className="flex justify-center gap-6 text-sm">
        <Link href="/gizlilik" className="link-line !text-ink-soft hover:!text-ink">Gizlilik</Link>
        <Link href="/kvkk" className="link-line !text-ink-soft hover:!text-ink">KVKK Aydınlatma Metni</Link>
      </p>
    </div>
  );
}

function Stat({ n, total, label, first }: { n: number; total?: string; label: string; first?: boolean }) {
  return (
    <div className="relative text-center">
      {!first && <span aria-hidden className="hairline-v absolute inset-y-0 left-0" />}
      <dd className="display num text-[2.25rem] leading-none">
        {n}
        {total && <span className="text-base text-ink-mute">{total}</span>}
      </dd>
      <dt className="mt-2 text-xs text-ink-soft">{label}</dt>
    </div>
  );
}
