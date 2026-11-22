import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/takvim", "/profil", "/vision", "/kure", "/biz", "/ozet"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Oturumu tazeler (bu satırı silme)
  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isApp = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  const isPrefetch =
    request.headers.get("next-router-prefetch") !== null ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch");
  if (!data.user && isApp && !isPrefetch) {
    // Girişsiz kullanım: ilk ziyarette bu cihaza özel anonim bir defter açılır
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      const to = request.nextUrl.clone();
      to.pathname = "/";
      to.searchParams.set("hata", "1");
      return NextResponse.redirect(to);
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|art/|stickers/|sw.js|offline.html|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|woff2?)$).*)"],
};
