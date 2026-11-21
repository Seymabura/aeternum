"use server";

import type { City } from "@/lib/astro/cities";

const cache = new Map<string, City[]>();

/** Dünya şehirleri (Open-Meteo Geocoding, ücretsiz, anahtar gerektirmez) */
export async function searchWorldCities(q: string): Promise<City[]> {
  const term = (q ?? "").trim().slice(0, 60);
  if (term.length < 2) return [];
  const key = term.toLocaleLowerCase("tr");
  if (cache.has(key)) return cache.get(key)!;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=8&language=tr&format=json`, {
      signal: ctrl.signal,
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    clearTimeout(t);
    if (!r.ok) return [];
    const j = (await r.json()) as { results?: { name: string; latitude: number; longitude: number; timezone?: string; country?: string; admin1?: string }[] };
    const out: City[] = (j.results ?? [])
      .filter((x) => x.timezone)
      .map((x) => ({
        name: x.admin1 && x.admin1 !== x.name ? `${x.name}, ${x.admin1}` : x.name,
        lat: x.latitude,
        lon: x.longitude,
        tz: x.timezone!,
        country: x.country,
      }));
    if (cache.size > 500) cache.clear();
    cache.set(key, out);
    return out;
  } catch {
    return [];
  }
}
