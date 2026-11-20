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
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Logo href="/takvim" />
          <TopLinks />
          <div className="flex items-center gap-2 text-sm">
            <span
              className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper-3 px-2.5 py-1 font-semibold"
              title="Seri: üst üste zamanında yapılan görevler"
            >
              <span aria-hidden>🔥</span>
              {p.streak}
            </span>
            <span
              className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper-3 px-2.5 py-1 font-semibold"
              title="Emek: boyamada açtığın bölüm sayısı"
            >
              <span aria-hidden>🕯️</span>
              {p.effort}/32
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 md:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}
