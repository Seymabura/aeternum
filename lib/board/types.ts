import type { BgKind } from "./backgrounds";

export const BOARD_W = 1080;
export const BOARD_H = 2340; // 9:19.5 telefon ekranı

type Base = { id: string; x: number; y: number; rot: number; scale: number };

export type PhotoItem = Base & {
  type: "photo";
  path: string;
  w: number;
  h: number;
  frame: "polaroid" | "plain" | "torn";
  caption?: string;
};
export type StickerItem = Base & { type: "sticker"; name: string; size: number };
export type TextItem = Base & {
  type: "text";
  text: string;
  font: FontKey;
  color: string;
  size: number;
  width: number;
};
export type TapeItem = Base & { type: "tape"; w: number; color: string; pattern: "stripe" | "dots" | "plain" | "grid" };
export type NoteItem = Base & { type: "note"; w: number; h: number; color: string; text: string; font: FontKey };

export type BoardItem = PhotoItem | StickerItem | TextItem | TapeItem | NoteItem;
export type Board = { v: 1; bg: BgKind; items: BoardItem[] };

export type FontKey = "caveat" | "dancing" | "patrick" | "fraunces";
export const FONTS: Record<FontKey, { name: string; family: string; style: string }> = {
  caveat: { name: "Caveat (el yazısı)", family: "Caveat", style: "700" },
  dancing: { name: "Dancing Script", family: "Dancing Script", style: "600" },
  patrick: { name: "Patrick Hand", family: "Patrick Hand", style: "normal" },
  fraunces: { name: "Fraunces (zarif)", family: "Fraunces Variable", style: "italic 600" },
};

export const INK_COLORS = ["#2e2019", "#7a1f2b", "#1e3a2f", "#c8922a", "#e2863b", "#2f4b6e", "#fbf6ea", "#ffffff"];
export const NOTE_COLORS = ["#fdf3c8", "#f8d7cf", "#d9ead3", "#d6e4f0", "#fbf6ea", "#e9d8c2"];
export const TAPE_COLORS = ["#c8922a", "#b8323f", "#2f5a47", "#e2863b", "#5b7fa6", "#d6cdea", "#f4c7c3"];

export const STICKERS = [
  "yildiz", "kalp", "ay", "kar", "mum", "hediye", "kahve", "kupa", "kitap", "bilet", "ucak", "kamera",
  "ev", "dag", "cicek", "yaprak", "kedi", "gunes", "nota", "2027", "atac",
];

export const EXPORTS = [
  { id: "iphone", name: "Telefon duvar kağıdı (iPhone)", w: 1179, h: 2556 },
  { id: "android", name: "Telefon duvar kağıdı (Android)", w: 1080, h: 2400 },
  { id: "story", name: "Instagram hikâye", w: 1080, h: 1920 },
  { id: "post", name: "Instagram gönderi (4:5)", w: 1080, h: 1350 },
  { id: "kare", name: "Kare", w: 1080, h: 1080 },
  { id: "x", name: "X / Twitter (16:9)", w: 1600, h: 900 },
] as const;

export const EMPTY_BOARD: Board = {
  v: 1,
  bg: "gece",
  items: [
    { id: "t1", type: "text", x: 540, y: 330, rot: -3, scale: 1, text: "2027", font: "fraunces", color: "#fbf6ea", size: 190, width: 900 },
    { id: "t2", type: "text", x: 540, y: 520, rot: 2, scale: 1, text: "bu yıl benim yılım", font: "caveat", color: "#fbf6ea", size: 96, width: 900 },
    { id: "n1", type: "note", x: 330, y: 1500, rot: -6, scale: 1, w: 420, h: 380, color: "#fdf3c8", text: "dileklerim buraya...", font: "caveat" },
    { id: "tp1", type: "tape", x: 330, y: 1320, rot: -10, scale: 1, w: 220, color: "#b8323f", pattern: "stripe" },
    { id: "s1", type: "sticker", x: 820, y: 1120, rot: 10, scale: 1, name: "yildiz", size: 220 },
    { id: "s2", type: "sticker", x: 780, y: 1820, rot: -8, scale: 1, name: "bilet", size: 280 },
  ],
};
