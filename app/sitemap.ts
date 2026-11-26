import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/biz/iki-ay`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/biz/gokyuzu`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/vision`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/gizlilik`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/kvkk`, lastModified: now, priority: 0.2 },
  ];
}
