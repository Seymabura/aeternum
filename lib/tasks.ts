/** Aralık'ın 31 günlük görevi ve "küçük emekler". */

export type TaskKind = "text" | "list3" | "song" | "word" | "photo" | "letter";

export type Task = {
  day: number;
  title: string;
  hint: string;
  kind: TaskKind;
  /** list3 için alan etiketleri */
  labels?: [string, string, string];
};

export const TASKS: Task[] = [
  { day: 1, kind: "list3", title: "2026'nın en güzel 3 anı", hint: "Büyük ya da küçük, aklına ilk gelenler.", labels: ["Birinci an", "İkinci an", "Üçüncü an"] },
  { day: 2, kind: "song", title: "Bu yılın şarkısı", hint: "2026 deyince kulağında çalan şarkı." },
  { day: 3, kind: "text", title: "İyi ki vazgeçtiğin bir şey", hint: "Bu yıl bıraktığın ve iyi ki bıraktığın bir şey." },
  { day: 4, kind: "photo", title: "Seni en çok güldüren şey", hint: "Bu yıl seni en çok güldüren şeyin fotoğrafı." },
  { day: 5, kind: "text", title: "2027'de öğrenmek istediğin şey", hint: "Bir dil, bir enstrüman, bir tarif..." },
  { day: 6, kind: "text", title: "Kendine bir iltifat", hint: "Bir arkadaşına söyler gibi, kendine söyle." },
  { day: 7, kind: "text", title: "Teşekkür etmek istediğin biri", hint: "Kime, ne için? (Yakında ona kart da gönderebileceksin.)" },
  { day: 8, kind: "word", title: "Yılın kelimesi", hint: "2026'yı tek kelimeyle anlat." },
  { day: 9, kind: "list3", title: "Keşfettiğin 3 küçük mutluluk", hint: "Bir kahve, bir sokak, bir alışkanlık.", labels: ["Birincisi", "İkincisi", "Üçüncüsü"] },
  { day: 10, kind: "text", title: "Seni zorlayan ve geçtiğin şey", hint: "Neydi, nasıl atlattın?" },
  { day: 11, kind: "text", title: "İz bırakan bir kitap ya da film", hint: "Bu yıl okuduğun ya da izlediğin, aklında kalan." },
  { day: 12, kind: "photo", title: "Yılın en güzel manzarası", hint: "Bu yıl gördüğün en güzel manzaranın fotoğrafı." },
  { day: 13, kind: "text", title: "Hayatına iyi gelen biri", hint: "Bu yıl tanıştığın ya da yakınlaştığın biri." },
  { day: 14, kind: "list3", title: "Gurur duyduğun 3 şey", hint: "Kimse görmese de sen biliyorsun.", labels: ["Birincisi", "İkincisi", "Üçüncüsü"] },
  { day: 15, kind: "text", title: "Yılın en güzel yemeği", hint: "Ne yedin, nerede, kiminle?" },
  { day: 16, kind: "text", title: "Bir yıl önceki sana not", hint: "Geçen Aralık'taki sana ne söylemek isterdin?" },
  { day: 17, kind: "song", title: "2027'ye girerken çalacak şarkı", hint: "Yeni yıla hangi şarkıyla girmek istersin?" },
  { day: 18, kind: "text", title: "Attığın en cesur adım", hint: "Bu yıl korka korka da olsa yaptığın şey." },
  { day: 19, kind: "list3", title: "2027'de gitmek istediğin 3 yer", hint: "Bir şehir, bir kafe, bir tepe...", labels: ["Birinci yer", "İkinci yer", "Üçüncü yer"] },
  { day: 20, kind: "text", title: "Öğrendiğin en değerli ders", hint: "Bu yıl hayatın sana öğrettiği şey." },
  { day: 21, kind: "photo", title: "Sıradan ama güzel bir gün", hint: "Bu yıldan sıradan ama güzel bir günün fotoğrafı." },
  { day: 22, kind: "text", title: "Kahkahalarla güldüğün an", hint: "Yazarken yine gülümseyeceksin." },
  { day: 23, kind: "text", title: "Bırakmak istediğin bir alışkanlık", hint: "Ve yerine ne koymak istersin?" },
  { day: 24, kind: "list3", title: "Denemek istediğin 3 yeni şey", hint: "2027'de ilk kez yapmak istediklerin.", labels: ["Birincisi", "İkincisi", "Üçüncüsü"] },
  { day: 25, kind: "text", title: "Sana iyi gelen koku, ses, yer", hint: "Üçünden birini ya da hepsini yaz." },
  { day: 26, kind: "text", title: "Bir iyilik", hint: "Bu yıl birine yaptığın ya da sana yapılan bir iyilik." },
  { day: 27, kind: "word", title: "2027'nin kelimesi", hint: "Yeni yılın nasıl olsun istiyorsun? Tek kelime." },
  { day: 28, kind: "text", title: "Yeni yılın sana fısıldayacağı cümle", hint: "2027 sana bir şey söyleseydi ne derdi?" },
  { day: 29, kind: "photo", title: "Bu yılın sen hali", hint: "Bir selfie ya da sana benzeyen bir köşe." },
  { day: 30, kind: "list3", title: "2027 için 3 dilek", hint: "Kavanoza girecek son dilekler.", labels: ["Birinci dilek", "İkinci dilek", "Üçüncü dilek"] },
  { day: 31, kind: "letter", title: "Gelecekteki kendine mektup", hint: "Kilitlenecek ve 31 Aralık 2027'de sana geri gelecek." },
];

export type Bonus = { id: number; openDay: number; prompt: string };

/** Küçük emekler: her biri boyamada bir bölüm daha açar. openDay 0 = Kasım hazırlığı. */
export const BONUSES: Bonus[] = [
  { id: 1, openDay: 0, prompt: "Bu kışı tek kelimeyle anlat." },
  { id: 2, openDay: 0, prompt: "Şu an yanında ne var? (bir içecek, bir battaniye...)" },
  { id: 3, openDay: 0, prompt: "Aralık'ta kendine vereceğin küçük bir söz." },
  { id: 4, openDay: 2, prompt: "Bugün seni gülümseten küçük bir şey." },
  { id: 5, openDay: 4, prompt: "Bugün içtiğin en güzel şey neydi?" },
  { id: 6, openDay: 6, prompt: "Pencereden ne görüyorsun?" },
  { id: 7, openDay: 8, prompt: "Bugün aklına gelen eski bir arkadaş." },
  { id: 8, openDay: 10, prompt: "Şu an aklındaki şarkı." },
  { id: 9, openDay: 12, prompt: "Bugün kendin için ne yaptın?" },
  { id: 10, openDay: 14, prompt: "Bu hafta öğrendiğin bir şey." },
  { id: 11, openDay: 16, prompt: "Bugünün rengi ne?" },
  { id: 12, openDay: 18, prompt: "Bir cümlelik şükür." },
  { id: 13, openDay: 20, prompt: "Bugün nereye yürüdün?" },
  { id: 14, openDay: 22, prompt: "En son ne zaman kahkaha attın?" },
  { id: 15, openDay: 24, prompt: "Yılbaşı gecesi için küçük bir plan." },
  { id: 16, openDay: 26, prompt: "Bu yılın kokusu ne?" },
  { id: 17, openDay: 28, prompt: "2027'den tek bir beklentin." },
];

export const MAX_EFFORT = 32;

export type TaskAnswer = {
  text?: string;
  items?: string[];
  title?: string;
  artist?: string;
  link?: string;
  word?: string;
  why?: string;
  caption?: string;
};

/** Cevaptan kavanoza düşecek kısa not metni üretir. */
export function answerSummary(task: Task, a: TaskAnswer): string {
  switch (task.kind) {
    case "list3":
      return (a.items ?? []).filter(Boolean).join(" · ");
    case "song":
      return [a.title, a.artist].filter(Boolean).join(" — ");
    case "word":
      return a.word ?? "";
    case "photo":
      return a.caption || "Bir fotoğraf";
    default:
      return a.text ?? "";
  }
}
