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
        <div className="sheet mx-auto flex max-w-6xl items-center justify-between gap-3 !rounded-full py-1.5 pl-5 pr-1.5">
          <Logo href="/" />
          <TopLinks />
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-soft sm:flex" title="Seri: üst üste zamanında yapılan görevler">
              <span className="text-champagne">✦</span> {p.streak} gün seri
            </span>
            <Link
              href="/kure"
              className="flex items-center gap-2 rounded-full border border-champagne/25 bg-champagne/[.06] px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-champagne/12"
            >
              <span className="h-3 w-3 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#b9cdf2_45%,#5b6d96)] shadow-[0_0_10px_rgba(185,205,242,.6)]" />
              Küre
            </Link>
            <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink-soft hover:text-ink" aria-label="Ben">
              <UserRound className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-8 md:pb-14">{children}</main>
      <BottomNav />
    </div>
  );
}
