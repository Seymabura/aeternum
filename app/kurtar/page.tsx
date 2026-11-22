import Link from "next/link";
import { Logo } from "@/components/logo";
import { RestoreForm } from "./restore-form";

export const metadata = { title: "Defterini geri getir", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <Logo />
      <div className="my-auto py-16">
        <h1 className="display text-[2.5rem] sm:text-[3rem]">Defterini geri getir</h1>
        <p className="mt-4 text-ink-soft">Başka bir cihazda aldığın kurtarma kodunu yaz. Görevlerin, küren, mektubun ve vision board’un bu cihazda açılır.</p>
        <RestoreForm />
        <p className="mt-10 text-sm text-ink-mute">
          Kodun yok mu? Eski cihazında <span className="text-ink-soft">Profil</span> sayfasından alabilirsin. Kod yoksa defter geri getirilemez.{" "}
          <Link href="/" className="link-line !text-ink-soft">Ana sayfaya dön</Link>
        </p>
      </div>
    </main>
  );
}
