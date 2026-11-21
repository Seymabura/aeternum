/**
 * Aralık'ın 31 günlük kendini geliştirme görevleri (karışık: beden, zihin, dil, ilişkiler, para, 2027).
 * 5-25 dakikalık şeyler. Her biri kar küresine bir süs ekler.
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
  { day: 1, kind: "do", title: "Güne bir bardak suyla başla", hint: "Telefonuna bakmadan önce. Ay boyunca böyle başlamayı dene.", gift: "ilk çam", ask: "Bugün nasıl uyandın?" },
  { day: 2, kind: "do", title: "Yeni bir dile ilk adım", hint: "Hep merak ettiğin bir dil seç ve ilk 10 kelimeyi öğren. Bir uygulama ya da kısa bir video yeter.", gift: "kardan adam", ask: "Hangi dil, hangi kelimeler?" },
  { day: 3, kind: "text", title: "Aynaya bak, 1 dakika kendine iyi şeyler söyle", hint: "Sonra aklında kalan cümleyi buraya yaz.", gift: "sokak lambası" },
  { day: 4, kind: "do", title: "20 dakika telefonsuz yürü", hint: "Kulaklık da yok. Sadece sen, hava ve adımların.", gift: "küçük ev", ask: "Yürürken ne fark ettin?" },
  { day: 5, kind: "list3", title: "En güçlü 3 yanın", hint: "Alçakgönüllülük bugün yasak.", gift: "kızak", labels: ["Birincisi", "İkincisi", "Üçüncüsü"] },
  { day: 6, kind: "do", title: "Ertelediğin bir işi bitir", hint: "O mail, o randevu, o dolap. 25 dakika ayır ve bitir.", gift: "yıldız", ask: "Neyi bitirdin?" },
  { day: 7, kind: "do", title: "Bir kitaptan 10 sayfa oku", hint: "Hangi kitap olursa. 10 sayfa, sadece 10.", gift: "hediye kutusu", ask: "Aklında kalan bir cümle?" },
  { day: 8, kind: "do", title: "Dil günü: 5 dakika tekrar", hint: "İlk 10 kelimeyi hatırla, 5 yenisini ekle. Küçük ama her gün.", gift: "ikinci çam", ask: "Bugün öğrendiğin en sevdiğin kelime?" },
  { day: 9, kind: "do", title: "Birine 'aklıma geldin' de", hint: "Uzun zamandır konuşmadığın birine kısa bir mesaj ya da sesli mesaj.", gift: "bank", ask: "Kime yazdın?" },
  { day: 10, kind: "photo", title: "Bugün gökyüzünü çek", hint: "Pencereden ya da sokaktan. Bugünün gökyüzü bir daha olmayacak.", gift: "ay" },
  { day: 11, kind: "do", title: "Dijital temizlik", hint: "Kullanmadığın 5 uygulamayı sil, 3 e-posta listesinden çık.", gift: "çit", ask: "En çok neyden kurtulduğuna sevindin?" },
  { day: 12, kind: "do", title: "Bugünkü harcamalarını yaz", hint: "Yargılamadan, sadece not et. Paranın nereye gittiğini görmek iyi gelir.", gift: "ikinci ev", ask: "Seni şaşırtan bir şey oldu mu?" },
  { day: 13, kind: "do", title: "Yeni bir beceriye 20 dakika", hint: "Bir YouTube dersi: klavye kısayolları, temel gitar akoru, origami, Excel...", gift: "üçüncü çam", ask: "Ne öğrendin?" },
  { day: 14, kind: "do", title: "Birine küçük bir iyilik yap", hint: "Bir kapı tut, bir çay ısmarla, güzel bir yorum yaz.", gift: "geyik", ask: "Ne yaptın?" },
  { day: 15, kind: "do", title: "5 dakika nefes egzersizi", hint: "4 saniye al, 7 saniye tut, 8 saniyede ver. Dört tur.", gift: "fener", ask: "Sonrasında nasıl hissettin?" },
  { day: 16, kind: "do", title: "Küçük bir 'hayır' de", hint: "İstemediğin bir şeye kibarca hayır demek de kendine iyilik.", gift: "kuşlar", ask: "Neye hayır dedin?" },
  { day: 17, kind: "photo", title: "Yeni bir tarif dene", hint: "Basit olsun. Bir fotoğrafını çekmeyi unutma.", gift: "ikinci hediye" },
  { day: 18, kind: "do", title: "Uyumadan 1 saat önce ekranı kapat", hint: "Kitap, müzik, sohbet ya da sessizlik.", gift: "baca dumanı", ask: "O bir saatte ne yaptın?" },
  { day: 19, kind: "do", title: "Bir podcast ya da belgesel bölümü", hint: "Hiç bilmediğin bir konuda. Merak kası da çalıştırılır.", gift: "sıcak hava balonu", ask: "Hangi konu?" },
  { day: 20, kind: "do", title: "Bugün 8.000 adım", hint: "Merdivenleri seç, bir durak erken in.", gift: "kızakta hediyeler", ask: "Kaç adım oldu?" },
  { day: 21, kind: "text", title: "Bir korkunun üstüne küçük bir adım", hint: "Neden korkuyorsun ve bugün hangi küçük adımı attın?", gift: "kule" },
  { day: 22, kind: "do", title: "Dil günü: kendini tanıt", hint: "Öğrendiğin dilde 3 cümle: adın, nerelisin, neyi seversin. Sesli söyle.", gift: "ışık zinciri", ask: "Cümlelerin neler?" },
  { day: 23, kind: "do", title: "Ailenden biriyle uzun bir sohbet", hint: "Telefon kapalı, acele yok.", gift: "küçük tren", ask: "Konuşurken seni ne gülümsetti?" },
  { day: 24, kind: "do", title: "Bir gün boyunca şikâyet etme", hint: "Zor, biliyoruz. Kaçırırsan gülümse ve devam et.", gift: "kardinal kuşu", ask: "Nasıl geçti?" },
  { day: 25, kind: "list3", title: "Bu yılın en güzel 3 anı", hint: "Büyük ya da küçük, aklına ilk gelenler.", gift: "çam ağacı süsleri", labels: ["Birinci an", "İkinci an", "Üçüncü an"] },
  { day: 26, kind: "text", title: "5 yıl sonraki bir günün", hint: "Nerede uyanıyorsun, kiminlesin, ne yapıyorsun? Hayal et ve yaz.", gift: "kalp" },
  { day: 27, kind: "word", title: "2027'nin kelimesini seç", hint: "Yeni yılın nasıl olsun? Tek kelime.", gift: "2027 tabelası" },
  { day: 28, kind: "do", title: "Kendine bir randevu ver", hint: "Tek başına bir kahve, bir sergi, bir yürüyüş. Kendinle vakit.", gift: "kardan kale", ask: "Nereye gittin?" },
  { day: 29, kind: "photo", title: "Bu yılın sen hali", hint: "Bir selfie ya da sana benzeyen bir köşe.", gift: "büyük kar tanesi" },
  { day: 30, kind: "list3", title: "2027'de başlayacağın 3 alışkanlık", hint: "Bu ay denediklerinden hangileri kalsın?", gift: "kayan yıldız", labels: ["Birinci alışkanlık", "İkinci alışkanlık", "Üçüncü alışkanlık"] },
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
