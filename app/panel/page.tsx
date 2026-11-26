import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import { panelLogout } from "./actions";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Stats = {
  users: number;
  users_24h: number;
  users_7d: number;
  letters: number;
  boards: number;
  boards_users: number;
  moons: number;
  skies: number;
  couples: number;
  journal: number;
  tasks: number;
  task_users: number;
  wishes: number;
  daily: { d: string; n: number }[];
  at: string;
};

const fmt = new Intl.NumberFormat("tr-TR");
const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const timeFmt = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

async function load(): Promise<Stats | null> {
  const key = (await cookies()).get("ae_panel")?.value;
  if (!key) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("ae_admin_stats", { p_key: key });
    return (data as Stats | null) ?? null;
  } catch {
    return null;
  }
}

export default async function PanelPage() {
  const s = await load();

  if (!s) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
        <Logo />
        <div className="my-auto py-16">
          <h1 className="display text-[2.5rem]">Panel</h1>
          <p className="mt-4 text-ink-soft">Sitenin sayıları burada. Kimsenin yazdığı bir şey görünmez, sadece toplamlar.</p>
          <LoginForm />
        </div>
      </main>
    );
  }

  const max = Math.max(1, ...s.daily.map((d) => d.n));
  const rows: [string, number, (string | undefined)?][] = [
    ["2027’ye mektup yazan", s.letters],
    ["Vision board", s.boards, s.boards ? `${fmt.format(s.boards_users)} kişi yaptı` : undefined],
    ["Sevgilisiyle eşleşen çift", s.couples],
    ["Ortak defter yazısı", s.journal],
    ["Aralık görevi", s.tasks, s.tasks ? `${fmt.format(s.task_users)} kişi yaptı` : undefined],
    ["İstek ve hedef", s.wishes],
    ["Link ile paylaşılan Ay", s.moons],
    ["Link ile paylaşılan gökyüzü", s.skies],
  ];

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Logo />
        <form action={panelLogout}>
          <button className="text-sm text-ink-mute underline-offset-4 hover:text-ink hover:underline">Çıkış</button>
        </form>
      </div>

      <section className="mt-14">
        <p className="text-sm text-ink-mute">Siteye giren kişi</p>
        <p className="num display mt-1 text-[4.5rem] leading-none text-ink">{fmt.format(s.users)}</p>
        <p className="mt-3 text-ink-soft">
          Son 24 saatte <span className="num text-ink">{fmt.format(s.users_24h)}</span>, son 7 günde{" "}
          <span className="num text-ink">{fmt.format(s.users_7d)}</span> yeni kişi.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="gunluk">
        <h2 id="gunluk" className="text-sm text-ink-mute">
          Son 14 gün, günlük yeni kişi
        </h2>
        <ol className="mt-4 flex h-40 items-end gap-1.5">
          {s.daily.map((d, i) => {
            const last = i === s.daily.length - 1;
            return (
              <li key={d.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="num text-[0.7rem] text-ink-soft">{d.n || ""}</span>
                <span
                  className={last ? "w-full rounded-t-[4px] bg-nar-soft" : "w-full rounded-t-[4px] bg-nar"}
                  style={{ height: `${Math.max(d.n ? 4 : 1, (d.n / max) * 100)}%`, opacity: d.n ? 1 : 0.35 }}
                  title={`${dayFmt.format(new Date(d.d))}: ${d.n}`}
                />
              </li>
            );
          })}
        </ol>
        <div className="mt-2 flex justify-between text-[0.7rem] text-ink-mute">
          <span>{dayFmt.format(new Date(s.daily[0]?.d ?? s.at))}</span>
          <span>Bugün</span>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="neler">
        <h2 id="neler" className="text-sm text-ink-mute">
          Neler yapıldı
        </h2>
        <dl className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {rows.map(([label, n, sub]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="text-right">
                <span className="num text-[1.15rem] text-ink">{fmt.format(n)}</span>
                {sub && <span className="ml-2 text-sm text-ink-mute">{sub}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-ink-mute">
        Ay ve gökyüzü telefonda oluşturulduğu için sadece link ile paylaşılanlar sayılır. Siteye giren her cihaz bir kişi sayılır; aynı kişi iki cihazdan girerse iki kez sayılır. Son güncelleme {timeFmt.format(new Date(s.at))}.
      </p>
    </main>
  );
}
