import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShare, sharedFileUrl } from "@/lib/shares";
import type { FilmData } from "@/lib/film/engine";
import { SharedFilm } from "./shared-film";

type Stored = Omit<FilmData, "months"> & { months: { m: number; path: string; note?: string }[] };

export async function generateMetadata({ params }: PageProps<"/s/film/[token]">): Promise<Metadata> {
  const { token } = await params;
  const s = await getShare(token);
  if (!s || s.kind !== "film") return { title: "Bulunamadı" };
  const p = s.payload as Stored;
  return { title: `${p.names[0]} & ${p.names[1]} · Bizim 2026'mız`, description: "Kodla yapılmış kısa bir yıl filmi. Aeternum.", robots: { index: false, follow: false } };
}

export default async function Page({ params }: PageProps<"/s/film/[token]">) {
  const { token } = await params;
  const s = await getShare(token);
  if (!s || s.kind !== "film") notFound();
  const p = s.payload as Stored;
  const film: FilmData = { ...p, months: (p.months ?? []).map((m) => ({ m: m.m, note: m.note, src: sharedFileUrl(m.path) })) };
  return <SharedFilm film={film} />;
}
