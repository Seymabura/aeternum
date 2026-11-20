import "server-only";
import sections from "./sections.json";

const MAP = sections as Record<string, number[]>;

export function regionSections(imageId: string): number[] | null {
  return MAP[imageId] ?? null;
}
