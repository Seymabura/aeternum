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
    "Yılbaşına kadar her gün küçük bir görev: resmini boya, dilek panonu doldur, anılarını biriktir. 31 Aralık gecesi hepsi sana özel bir sonuca dönüşsün.",
  openGraph: {
    title: "Aeternum · Bu yıldan sonsuza kalanlar",
    description: "Her gün küçük bir emek, yılın sonunda sonsuza saklayacağın bir defter.",
    locale: "tr_TR",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f3e7d1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="paper-grain min-h-full flex flex-col">
        {children}
        <Ambience />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fbf5ea",
              color: "#2e2019",
              border: "1px solid rgba(46,32,25,.15)",
              fontFamily: "var(--font-serif)",
            },
          }}
        />
      </body>
    </html>
  );
}
