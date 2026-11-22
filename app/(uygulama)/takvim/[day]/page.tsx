import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getProgress } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { BONUSES, TASKS } from "@/lib/tasks";
import { BonusList } from "../bonus-list";
import { Countdown } from "@/components/countdown";
import { TaskForm } from "./task-form";

export async function generateMetadata({ params }: PageProps<"/takvim/[day]">) {
  const { day } = await params;
  return { title: `${day} Aralık` };
}

export default async function TaskPage({ params }: PageProps<"/takvim/[day]">) {
  const { day: raw } = await params;
  const day = Number(raw);
  const task = TASKS.find((t) => t.day === day);
  if (!task) notFound();
  const p = await getProgress();

  if (day > p.today) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Lock className="mx-auto h-8 w-8 text-champagne" strokeWidth={1.5} />
        <h1 className="display mt-6 text-[2.5rem]">{day} Aralık henüz kilitli</h1>
        <p className="mt-2 text-ink-soft">
          {day === p.today + 1 ? (
            <>
              <Countdown mode="midnight" className="font-semibold tabular-nums text-ink" /> sonra açılacak.
            </>
          ) : (
            "Merak güzel bir şey. Kutu zamanı gelince açılacak."
          )}
        </p>
        <Link href="/takvim" className="btn btn-ghost mt-8">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Takvime dön
        </Link>
      </div>
    );
  }

  const entry = p.entries.find((e) => e.day === day) ?? null;
  let photoUrl: string | null = null;
  if (entry?.photo_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("uploads").createSignedUrl(entry.photo_path, 3600);
    photoUrl = data?.signedUrl ?? null;
  }
  const late = !entry && day < p.today;
  // küçük ritüeller: açılmış ama yapılmamış olanlardan en eski ikisi, sadece bugünün sayfasında
  const rituals = day === p.today ? BONUSES.filter((b) => b.openDay <= p.today && !p.bonusIds.includes(b.id)).slice(0, 2) : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/takvim" className="link-line inline-flex items-center gap-1.5 text-sm !text-ink-soft hover:!text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Takvim
      </Link>
      <article className="relative mt-10 sm:mt-14">
        <p className="eyebrow rise">Gün {String(day).padStart(2, "0")}</p>
        <h1 className="display mt-5 text-[2.75rem] sm:text-[4.25rem]">
          <span className="mask-line"><span style={{ animationDelay: "80ms" }}>{task.title}</span></span>
        </h1>
        <p className="rise mt-6 max-w-lg text-[1.0625rem] text-ink-soft" style={{ animationDelay: "300ms" }}>{task.hint}</p>
        <p className="rise mt-6 inline-flex items-center gap-2 rounded-full border border-champagne/20 px-4 py-2 text-sm text-gold" style={{ animationDelay: "380ms" }}>✦ Bugünün süsü: {task.gift}</p>
        {late && (
          <p className="mt-6 rounded-[14px] border border-champagne/15 bg-champagne/[.06] px-4 py-3 text-sm text-ink">
            Bu günü kaçırmışsın. Şimdi yapabilirsin, süsün yine eklenir ama seriye sayılmaz.
          </p>
        )}
        <TaskForm days={p.entries.map((e) => e.day)} task={task} userId={p.userId} initial={entry?.answer ?? null} initialPhoto={photoUrl} initialPath={entry?.photo_path ?? null} />
      </article>
      {rituals.length > 0 && (
        <section className="mt-16 border-t border-champagne/10 pt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="display text-[1.75rem]">Bir de küçük bir ritüel</h2>
            <p className="num text-sm text-ink-soft">{p.bonusIds.length}/17 ışık</p>
          </div>
          <p className="mb-5 mt-2 text-sm text-ink-soft">Bir iki kelimelik cevap yeter. Her biri kürenin kenarına bir peri ışığı ekler.</p>
          <BonusList items={rituals} done={[]} />
        </section>
      )}
    </div>
  );
}
