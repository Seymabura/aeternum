import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShare } from "@/lib/shares";
import type { SkyInput } from "@/components/biz/sky-view";
import { SharedSky } from "./shared-sky";

export async function generateMetadata({ params }: PageProps<"/s/gok/[token]">): Promise<Metadata> {
  const { token } = await params;
  const s = await getShare(token);
  if (!s || s.kind !== "gok") return { title: "Bulunamadı" };
  const p = s.payload as SkyInput;
  return { title: `${p.meta.names.filter(Boolean).join(" & ") || p.meta.dateText} · Gökyüzü`, description: `${p.meta.dateText}, ${p.meta.place} gökyüzü.`, robots: { index: false, follow: false } };
}

export default async function Page({ params }: PageProps<"/s/gok/[token]">) {
  const { token } = await params;
  const s = await getShare(token);
  if (!s || s.kind !== "gok") notFound();
  return <SharedSky input={s.payload as SkyInput} />;
}
