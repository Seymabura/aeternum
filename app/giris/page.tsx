import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/supabase/server";
import { AuthForm } from "./auth-form";

export const metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: PageProps<"/giris">) {
  const sp = await searchParams;
  const next = typeof sp.sonra === "string" && sp.sonra.startsWith("/") ? sp.sonra : "/takvim";
  if (await getUser().catch(() => null)) redirect(next);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Logo className="mb-8" />
      <div className="sheet relative w-full max-w-sm p-6 sm:p-7">
        <span className="washi -top-3 left-8 rotate-[-6deg]" />
        <AuthForm next={next} error={sp.hata === "1"} googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1"} />
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-ink-soft">
        Devam ederek <a className="underline" href="/gizlilik">Gizlilik</a> ve{" "}
        <a className="underline" href="/kvkk">KVKK Aydınlatma Metni</a>&apos;ni okuduğunu kabul edersin. Anıların varsayılan
        olarak sadece sana görünür.
      </p>
    </main>
  );
}
