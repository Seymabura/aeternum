import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Ambience } from "@/components/ambience";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Aeternum · Bu yıldan sonsuza kalanlar",
    template: "%s · Aeternum",
  },
  description:
    "Yılbaşına kadar her gün kendin için küçük bir şey yap, kar küreni süsle, wishlist ve vision board'unu kur, 2027'deki kendine mesaj bırak.",
  openGraph: {
    title: "Aeternum · Bu yıldan sonsuza kalanlar",
    description: "Her gün küçük bir ritüel, yılın sonunda sonsuza saklayacağın bir kar küresi.",
    locale: "tr_TR",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#07060c",
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
