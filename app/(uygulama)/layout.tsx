import Link from "next/link";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { BottomNav, TopLinks } from "@/components/app-nav";
import { getProgress } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/setup-notice";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) return <SetupNotice />;
  const p = await getProgress();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full border border-champagne/10 bg-[rgba(8,7,11,0.72)] py-1.5 pl-5 pr-1.5 backdrop-blur-xl backdrop-saturate-150">
          <Logo href="/" />
          <TopLinks />
          <div className="flex items-center gap-1.5">
            <span className="num hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-soft sm:flex" title="Seri: üst üste zamanında yapılan görevler">
              <span className="text-champagne">✦</span> {p.entries.length}/31 gün, {p.streak} gün seri
            </span>
            <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/15 text-ink-soft transition-colors hover:border-champagne/35 hover:text-ink" aria-label="Profil">
              <UserRound className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 pb-36 pt-10 sm:px-8 md:pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
