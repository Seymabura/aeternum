/**
 * Aralık'ın 31 günlük "kendine iyi bak" görevleri.
 * Basit, tatlı, 5-20 dakikalık şeyler. Her biri kar küresine bir süs ekler.
 */

export type TaskKind = "do" | "text" | "list3" | "word" | "photo" | "letter";

export type Task = {
  day: number;
  title: string;
  hint: string;
  kind: TaskKind;
  /** küreye eklenecek süsün adı (gösterim için) */
  gift: string;
  /** "do" görevlerinde isteğe bağlı not sorusu */
  ask?: string;
  labels?: [string, string, string];
};

export const TASKS: Task[] = [
  { day: 1, kind: "do", title: "Güne bir bardak suyla başla", hint: "Telefonuna bakmadan önce. Küçük ama iyi bir başlangıç.", gift: "ilk çam", ask: "Bugün nasıl uyandın?" },
  { day: 2, kind: "do", title: "10 dakika telefonsuz yürü", hint: "Kulaklık da yok. Sadece sen, hava ve adımların.", gift: "kardan adam", ask: "Yürürken ne fark ettin?" },
  { day: 3, kind: "text", title: "Kendine bir iltifat yaz", hint: "En yakın arkadaşına söyler gibi, kendine söyle.", gift: "sokak lambası" },
  { day: 4, kind: "do", title: "Birine 'aklıma geldin' de", hint: "Uzun zamandır konuşmadığın birine kısa bir mesaj ya da sesli mesaj.", gift: "küçük ev", ask: "Kime yazdın?" },
  { day: 5, kind: "do", title: "Odanda 10 dakikalık bir dokunuş", hint: "Yatağını topla, masanı aç, bir köşeyi güzelleştir.", gift: "kızak", ask: "Neyi değiştirdin?" },
  { day: 6, kind: "list3", title: "Bugün teşekkür ettiğin 3 şey", hint: "Bir kahve, bir mesaj, bir an. Küçük olsun yeter.", gift: "yıldız", labels: ["Birincisi", "İkincisi", "Üçüncüsü"] },
  { day: 7, kind: "do", title: "Bir şarkıda 5 dakika dans et", hint: "Kimse görmüyor. Sesini aç.", gift: "hediye kutusu", ask: "Hangi şarkı?" },
  { day: 8, kind: "do", title: "Ekran süreni kontrol et", hint: "Bak, yargılama. Yarın için 30 dakikalık bir söz ver.", gift: "ikinci çam", ask: "Bugünkü ekran süren?" },
  { day: 9, kind: "do", title: "Bir kitaptan 10 sayfa oku", hint: "Hangi kitap olursa. 10 sayfa, sadece 10.", gift: "bank", ask: "Aklında kalan bir cümle?" },
  { day: 10, kind: "photo", title: "Bugün gökyüzünü çek", hint: "Pencereden ya da sokaktan. Bugünün gökyüzü bir daha olmayacak.", gift: "ay" },
  { day: 11, kind: "do", title: "Kullanmadığın 5 eşyayı ayır", hint: "Bağışla, hediye et ya da vedalaş. Hafiflik iyi gelir.", gift: "çit", ask: "Neleri ayırdın?" },
  { day: 12, kind: "do", title: "Telefonsuz bir sıcak içecek", hint: "Çay, kahve, salep. Sadece iç, başka hiçbir şey yapma.", gift: "ikinci ev", ask: "Ne içtin?" },
  { day: 13, kind: "text", title: "Bu yıl öğrendiğin en değerli ders", hint: "Hayatın sana bu yıl ne öğretti?", gift: "üçüncü çam" },
  { day: 14, kind: "do", title: "Birine küçük bir iyilik yap", hint: "Bir kapı tut, bir çay ısmarla, bir yorum yaz.", gift: "geyik", ask: "Ne yaptın?" },
  { day: 15, kind: "do", title: "5 dakika nefes egzersizi", hint: "4 saniye al, 7 saniye tut, 8 saniyede ver. Dört tur.", gift: "fener", ask: "Sonrasında nasıl hissettin?" },
  { day: 16, kind: "text", title: "Bir yıl önceki sana not yaz", hint: "Geçen Aralık'taki sana ne söylemek isterdin?", gift: "kuşlar" },
  { day: 17, kind: "photo", title: "Sevdiğin bir yemeği kendin yap", hint: "Basit olsun. Bir fotoğrafını çekmeyi unutma.", gift: "ikinci hediye" },
  { day: 18, kind: "do", title: "Uyumadan 1 saat önce ekranı kapat", hint: "Kitap, müzik, sohbet ya da sessizlik.", gift: "baca dumanı", ask: "O bir saatte ne yaptın?" },
  { day: 19, kind: "list3", title: "2027'de gitmek istediğin 3 yer", hint: "Bir şehir, bir kafe, bir tepe...", gift: "sıcak hava balonu", labels: ["Birinci yer", "İkinci yer", "Üçüncü yer"] },
  { day: 20, kind: "do", title: "Bugün 8.000 adım", hint: "Merdivenleri seç, bir durak erken in.", gift: "kızakta hediyeler", ask: "Kaç adım oldu?" },
  { day: 21, kind: "text", title: "Bir korkunun üstüne küçük bir adım", hint: "Neden korkuyorsun ve bugün hangi küçük adımı attın?", gift: "kule" },
  { day: 22, kind: "do", title: "Bir hobiye 20 dakika ayır", hint: "Çizim, örgü, gitar, yemek, yazı... Sadece keyif için.", gift: "ışık zinciri", ask: "Neyle uğraştın?" },
  { day: 23, kind: "do", title: "Ailenden biriyle uzun bir sohbet", hint: "Telefon kapalı, acele yok.", gift: "küçük tren", ask: "Konuşurken seni ne gülümsetti?" },
  { day: 24, kind: "do", title: "Bir gün boyunca hiç şikâyet etme", hint: "Zor, biliyoruz. Kaçırırsan gülümse ve devam et.", gift: "kardinal kuşu", ask: "Nasıl geçti?" },
  { day: 25, kind: "list3", title: "Bu yılın en güzel 3 anı", hint: "Büyük ya da küçük, aklına ilk gelenler.", gift: "çam ağacı süsleri", labels: ["Birinci an", "İkinci an", "Üçüncü an"] },
  { day: 26, kind: "text", title: "Birini affet (kendini de)", hint: "Kimseye göndermek zorunda değilsin. Sadece yaz ve bırak.", gift: "kalp" },
  { day: 27, kind: "word", title: "2027'nin kelimesini seç", hint: "Yeni yılın nasıl olsun? Tek kelime.", gift: "2027 tabelası" },
  { day: 28, kind: "do", title: "Kendine bir randevu ver", hint: "Tek başına bir kahve, bir sergi, bir yürüyüş. Kendinle vakit.", gift: "kardan kale", ask: "Nereye gittin?" },
  { day: 29, kind: "photo", title: "Bu yılın sen hali", hint: "Bir selfie ya da sana benzeyen bir köşe.", gift: "büyük kar tanesi" },
  { day: 30, kind: "list3", title: "2027 için 3 dilek", hint: "Kürene girecek son dilekler.", gift: "kayan yıldız", labels: ["Birinci dilek", "İkinci dilek", "Üçüncü dilek"] },
  { day: 31, kind: "letter", title: "Kürene 2027'ye mesajını bırak", hint: "Mektubun 31 Aralık 2027'de açılacak.", gift: "mühürlü mektup" },
];

export type Bonus = { id: number; openDay: number; prompt: string };

/** Küçük ışıklar: her biri küreye bir peri ışığı ekler. openDay 0 = Kasım hazırlığı. */
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
  /** "do" görevleri: yapıldı + isteğe bağlı not */
  done?: boolean;
  note?: string;
};

/** Cevaptan yıl sonu özetine düşecek kısa not. */
export function answerSummary(task: Task, a: TaskAnswer): string {
  switch (task.kind) {
    case "list3":
      return (a.items ?? []).filter(Boolean).join(" · ");
    case "word":
      return a.word ?? "";
    case "photo":
      return a.caption || "Bir fotoğraf";
    case "do":
      return a.note || task.title;
    default:
      return a.text ?? "";
  }
}
