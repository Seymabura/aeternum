import catalog from "./catalog.json";
import { MAX_EFFORT } from "@/lib/tasks";

export type ArtMeta = {
  id: string;
  title: string;
  category: string;
  w: number;
  h: number;
  regions: number;
  sections: number;
};

export type ArtData = {
  id: string;
  title: string;
  category: string;
  w: number;
  h: number;
  regions: string[];
  sections: number[];
  lines: string;
};

export const ART: ArtMeta[] = catalog as ArtMeta[];
export const CATEGORIES = ["Çiçekler", "Kış", "Hayvanlar", "Mandala", "Şehir", "Sıcak Köşeler"] as const;

export function getArt(id: string) {
  return ART.find((a) => a.id === id) ?? null;
}

/** Emeğe göre açık bölüm sayısı (bölüm 0..n-1 açık) */
export function openSections(effort: number, total: number) {
  return Math.max(1, Math.min(total, Math.round((effort * total) / MAX_EFFORT)));
}
