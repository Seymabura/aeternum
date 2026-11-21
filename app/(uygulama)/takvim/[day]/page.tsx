import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getProgress } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { TASKS } from "@/lib/tasks";
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
      <div className="mx-auto max-w-md py-16 text-center">
        <Lock className="mx-auto h-10 w-10 text-latte" />
        <h1 className="display mt-4 text-3xl">{day} Aralık henüz kilitli</h1>
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
          <ArrowLeft className="h-4 w-4" /> Takvime dön
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

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/takvim" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-champagne">
        <ArrowLeft className="h-4 w-4" /> Takvim
      </Link>
      <article className="sheet relative overflow-hidden p-6 sm:p-8">
        
        <p className="eyebrow">{day} Aralık</p>
        <h1 className="display mt-3 text-4xl leading-tight sm:text-5xl">{task.title}</h1>
        <p className="mt-2 text-ink-soft">{task.hint}</p>
        {late && (
          <p className="mt-4 rounded-lg bg-champagne/10 px-3 py-2 text-sm text-ink">
            Bu günü kaçırmışsın. Şimdi yapabilirsin, resmin açılır ama seri 🔥 için sayılmaz.
          </p>
        )}
        <TaskForm task={task} userId={p.userId} initial={entry?.answer ?? null} initialPhoto={photoUrl} initialPath={entry?.photo_path ?? null} />
      </article>
    </div>
  );
}
