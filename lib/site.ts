/** Sitenin kendi adresi. Netlify'daki NEXT_PUBLIC_SITE_URL'den gelir; alan adı değişirse sadece orayı değiştirmek yeter. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "https://aeternum-bice.vercel.app"
).replace(/\/+$/, "");
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
