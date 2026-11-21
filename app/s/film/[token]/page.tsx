import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = { title: "Bağlantı kullanılmıyor", robots: { index: false, follow: false } };

/** "Bizim 2026'mız" filmi kaldırıldı; eski bağlantılar nazik bir sayfaya düşer. */
export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="display mt-10 text-[2.25rem]">Bu bağlantı artık kullanılmıyor</h1>
      <p className="mt-4 text-ink-soft">Kısa film özelliği kaldırıldı. Yerine doğduğunuz gecelerin Ay&apos;ını ve tanıştığınız gecenin gökyüzünü yapabilirsin.</p>
      <Link href="/biz" prefetch={false} className="btn btn-primary mt-8">
        Biz sayfasına git
      </Link>
    </main>
  );
}
