import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { NewYearNight } from "@/components/new-year-night";
import { PwaRegister } from "@/components/install-app";
import { Ambience } from "@/components/ambience";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Aeternum · Anların sonsuza kaldığı yer",
    template: "%s · Aeternum",
  },
  description:
    "Doğduğunuz gecelerin Ay'ı, tanıştığınız gecenin gökyüzü, vision board ve 2027'ye mektup. Aralık'a özel 31 günlük küçük görevler.",
  openGraph: {
    title: "Aeternum · Anların sonsuza kaldığı yer",
    description: "Anların sonsuza kaldığı yer: gökyüzü, Ay, vision board, zaman kapsülü mektuplar ve Aralık'a özel 31 günlük görevler.",
    locale: "tr_TR",
    type: "website",
  },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Aeternum", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#020203",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="relative min-h-full flex flex-col">
        <Ambience />
        {children}
        <NewYearNight />
        <PwaRegister />
        <Toaster
          position="bottom-center"
          offset={96}
          icons={{ success: <span className="text-champagne">✦</span>, info: <span className="text-champagne">✦</span> }}
          toastOptions={{
            style: {
              background: "rgba(13,20,38,.82)",
              color: "#f2eee6",
              border: "1px solid rgba(220,199,161,.16)",
              borderRadius: "999px",
              backdropFilter: "blur(24px) saturate(140%)",
              boxShadow: "0 20px 50px -20px rgba(0,0,0,.9)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
