import Link from "next/link";
import { Logo } from "@/components/logo";

export const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Logo />
      <article className="sheet mt-8 p-6 sm:p-9 [&_h2]:display [&_h2]:mt-8 [&_h2]:text-2xl [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        <h1 className="display text-4xl">{title}</h1>
        <p className="!mt-1 text-sm text-ink-soft">Son güncelleme: {updated}</p>
        {children}
      </article>
      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-champagne underline">Ana sayfaya dön</Link>
      </p>
    </div>
  );
}

export function Contact() {
  return CONTACT ? (
    <a className="text-champagne underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
  ) : (
    <span>sitedeki profil sayfası üzerinden</span>
  );
}
