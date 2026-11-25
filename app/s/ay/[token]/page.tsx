import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShare } from "@/lib/shares";
import type { MoonPayload } from "@/lib/astro/moon-poster";
import { SharedMoons } from "./shared-moons";

export async function generateMetadata({ params }: PageProps<"/s/ay/[token]">): Promise<Metadata> {
  const { token } = await params;
  const s = await getShare(token);
  if (!s || s.kind !== "ay") return { title: "Bulunamadı" };
  const p = s.payload as MoonPayload;
  return {
    title: p.b ? `${p.a.name} & ${p.b.name} · Doğdukları gecenin Ay'ı` : `${p.a.name} · Doğduğu gecenin Ay'ı`,
    description: p.b ? "Doğdukları gecelerin Ay'ı, yan yana. Aeternum ile yapıldı." : "Doğduğu gecenin Ay'ı. Aeternum ile yapıldı.",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps<"/s/ay/[token]">) {
  const { token } = await params;
  const s = await getShare(token);
  if (!s || s.kind !== "ay") notFound();
  return <SharedMoons payload={s.payload as MoonPayload} />;
}
