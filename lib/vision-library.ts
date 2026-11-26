/** Vision board kütüphanesi: site sahibinin arşivinden fotoğraflar (ART_LICENSES.md). */
export const VISION_CATS = {"kariyer": "Meslekler", "okul": "Okul ve mezuniyet", "dil": "Yabancı dil", "para": "Para ve bolluk", "stil": "Alışveriş ve stil", "guzellik": "Güzellik ve bakım", "sevgi": "Aşk ve evlilik", "seyahat": "Seyahat", "luks": "Araba ve ev", "saglik": "Spor ve sağlık", "cicek": "Çiçekler", "doga": "Doğa ve hayvanlar", "sanat": "Sanat, müzik, kitap", "soz": "Sözler ve semboller"} as const;

export type VisionCat = keyof typeof VISION_CATS;

/** Renk filtresi: her fotoğrafın baskın rengi (otomatik bulundu, gözle düzeltildi) */
export const VISION_COLORS = {"pembe": ["Pembe", "#f3a6bd"], "kirmizi": ["Kırmızı", "#b3203a"], "mor": ["Mor", "#9b7ad1"], "mavi": ["Mavi", "#7fa8de"], "yesil": ["Yeşil", "#7fa27a"], "sari": ["Sarı", "#ecd27a"], "turuncu": ["Turuncu", "#e39a5c"], "bej": ["Bej", "#cbb393"], "beyaz": ["Beyaz", "#f4f1ea"], "siyah": ["Siyah", "#1d1a1f"]} as const satisfies Record<string, readonly [string, string]>;
export type VisionColor = keyof typeof VISION_COLORS;

export type VisionPhoto = { src: string; cat: VisionCat; alt: string; credit: string; w: number; h: number; tags: string[]; color: VisionColor };

export const VISION_LIBRARY: VisionPhoto[] = [
 {
  "src": "/vision/basari-5.webp",
  "cat": "kariyer",
  "alt": "Tablette kalp anatomisi, stetoskop ve tıp notları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "doktor",
   "tıp",
   "stetoskop",
   "ders",
   "öğrenci"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/basari-6.webp",
  "cat": "kariyer",
  "alt": "Ekranında kodla çizilmiş pembe kalp olan dizüstü bilgisayar",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1304,
  "tags": [
   "yazılım",
   "kod",
   "bilgisayar",
   "pembe",
   "kalp"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/basari-7.webp",
  "cat": "kariyer",
  "alt": "Gece kod yazılan dizüstü bilgisayar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 887,
  "tags": [
   "yazılım",
   "kod",
   "bilgisayar",
   "gece",
   "mühendis"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n1.webp",
  "cat": "kariyer",
  "alt": "Yeşil ışıklı masada kod yazılan iki ekran",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "yazılım",
   "kod",
   "bilgisayar",
   "mühendis",
   "siber güvenlik",
   "çalışma masası"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n2.webp",
  "cat": "kariyer",
  "alt": "Adliyede cübbeler ve 'Adalet mülkün temelidir' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 859,
  "tags": [
   "avukat",
   "hukuk",
   "hakim",
   "adliye",
   "cübbe"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/kariyer-n3.webp",
  "cat": "kariyer",
  "alt": "Şantiyede proje çizimini inceleyen mimar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "mimar",
   "mühendis",
   "inşaat",
   "şantiye",
   "proje"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n4.webp",
  "cat": "kariyer",
  "alt": "Yerde mimari çizim yapan öğrenci",
  "credit": "Kullanıcı arşivi",
  "w": 675,
  "h": 1200,
  "tags": [
   "mimar",
   "iç mimar",
   "çizim",
   "öğrenci",
   "proje"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/kariyer-n5.webp",
  "cat": "kariyer",
  "alt": "Nakışlı psikoloji önlüğü",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "psikolog",
   "psikoloji",
   "önlük",
   "üniversite",
   "bölüm"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/kariyer-n6.webp",
  "cat": "kariyer",
  "alt": "Gece kokpitte uçağı hazırlayan kadın pilot",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "pilot",
   "kokpit",
   "havacılık",
   "uçak",
   "kadın pilot"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n7.webp",
  "cat": "kariyer",
  "alt": "'Psychologist' yazılı kapı tabelası",
  "credit": "Kullanıcı arşivi",
  "w": 500,
  "h": 500,
  "tags": [
   "psikolog",
   "psikoloji",
   "tabela",
   "söz",
   "meslek"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n8.webp",
  "cat": "kariyer",
  "alt": "'She is a pilot' yazısı, pembe zemin",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "pilot",
   "söz",
   "havacılık",
   "pembe",
   "meslek"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/kariyer-n9.webp",
  "cat": "kariyer",
  "alt": "Kokpitte uçuş paneli ayarlayan kadın pilot",
  "credit": "Kullanıcı arşivi",
  "w": 1080,
  "h": 1355,
  "tags": [
   "pilot",
   "kokpit",
   "havacılık",
   "uçak",
   "kadın pilot"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/kariyer-n10.webp",
  "cat": "kariyer",
  "alt": "Avukat cübbesi ve kırmızı dosya",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 862,
  "tags": [
   "avukat",
   "hukuk",
   "cübbe",
   "dosya",
   "stajyer"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/kariyer-n11.webp",
  "cat": "kariyer",
  "alt": "Öğretmen kelimesinin sözlük tanımı",
  "credit": "Kullanıcı arşivi",
  "w": 570,
  "h": 570,
  "tags": [
   "öğretmen",
   "eğitim",
   "söz",
   "meslek",
   "sözlük"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/kariyer-n12.webp",
  "cat": "kariyer",
  "alt": "Tahtaya ders yazan öğretmen",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "öğretmen",
   "sınıf",
   "eğitim",
   "ders",
   "okul"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/kariyer-n13.webp",
  "cat": "kariyer",
  "alt": "Üst üste psikoloji kitapları",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 940,
  "tags": [
   "psikoloji",
   "kitap",
   "psikolog",
   "ders",
   "üniversite"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n14.webp",
  "cat": "kariyer",
  "alt": "'She is an architect' yazısı, pembe zemin",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "mimar",
   "söz",
   "meslek",
   "pembe",
   "mimarlık"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/kariyer-n15.webp",
  "cat": "kariyer",
  "alt": "'She is a teacher' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 713,
  "tags": [
   "öğretmen",
   "söz",
   "meslek",
   "eğitim",
   "pembe"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/kariyer-n16.webp",
  "cat": "kariyer",
  "alt": "Gece şehir ışıkları üstünde uçak kokpiti",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "pilot",
   "kokpit",
   "gece",
   "havacılık",
   "şehir ışıkları"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/kariyer-n17.webp",
  "cat": "kariyer",
  "alt": "Bordo ojeli elle Anayasa Hukuku kitabı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 942,
  "tags": [
   "hukuk",
   "avukat",
   "kitap",
   "ders",
   "üniversite"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/kariyer-n18.webp",
  "cat": "kariyer",
  "alt": "Beyaz önlük, stetoskop ve pembe çiçek",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "doktor",
   "tıp",
   "stetoskop",
   "önlük",
   "hemşire"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/basari-8.webp",
  "cat": "okul",
  "alt": "Mezuniyet töreninde havaya atılan kepler",
  "credit": "Kullanıcı arşivi",
  "w": 1050,
  "h": 1400,
  "tags": [
   "mezuniyet",
   "kep",
   "diploma",
   "üniversite",
   "kutlama"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/basari-9.webp",
  "cat": "okul",
  "alt": "Mezuniyet cübbesiyle çiçek tutan genç kadın, tarihi kampüs önünde",
  "credit": "Kullanıcı arşivi",
  "w": 1054,
  "h": 1400,
  "tags": [
   "mezuniyet",
   "cübbe",
   "çiçek",
   "üniversite",
   "kampüs"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/okul-n1.webp",
  "cat": "okul",
  "alt": "Mezuniyet kepli pembe kadın silüeti",
  "credit": "Kullanıcı arşivi",
  "w": 675,
  "h": 1200,
  "tags": [
   "mezuniyet",
   "kep",
   "öğrenci",
   "diploma",
   "pembe"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/okul-n2.webp",
  "cat": "okul",
  "alt": "Ekranında 'Graduation' araması yazan telefon",
  "credit": "Kullanıcı arşivi",
  "w": 792,
  "h": 912,
  "tags": [
   "mezuniyet",
   "telefon",
   "diploma",
   "okul",
   "söz"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/okul-n3.webp",
  "cat": "okul",
  "alt": "Mezuniyet kepli silüet, 'Discipline' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1101,
  "tags": [
   "disiplin",
   "mezuniyet",
   "motivasyon",
   "söz",
   "kep"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/okul-n4.webp",
  "cat": "okul",
  "alt": "'Hot girls study hard' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 472,
  "h": 472,
  "tags": [
   "ders",
   "ders çalışmak",
   "motivasyon",
   "söz",
   "sınav"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/okul-k1.webp",
  "cat": "okul",
  "alt": "Dua eden iki kız ve 'Akademik başarı' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 735,
  "tags": [
   "akademik başarı",
   "ders",
   "sınav",
   "dua"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/okul-k2.webp",
  "cat": "okul",
  "alt": "Boğaziçi Üniversitesi kapısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "üniversite",
   "boğaziçi",
   "kampüs",
   "istanbul"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/okul-k3.webp",
  "cat": "okul",
  "alt": "Ege Üniversitesi tabelası",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1102,
  "tags": [
   "üniversite",
   "ege",
   "kampüs",
   "izmir"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/okul-k4.webp",
  "cat": "okul",
  "alt": "'Academic girl era' yazılı, ders çalışan kadın",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 686,
  "tags": [
   "ders",
   "akademik",
   "not",
   "motivasyon"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/okul-k5.webp",
  "cat": "okul",
  "alt": "Üniversite kampüsü girişi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "üniversite",
   "kampüs",
   "giriş",
   "sonbahar"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/okul-k6.webp",
  "cat": "okul",
  "alt": "'120 TYT 80 AYT' net hedefi",
  "credit": "Kullanıcı arşivi",
  "w": 530,
  "h": 344,
  "tags": [
   "yks",
   "tyt",
   "ayt",
   "sınav",
   "net"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/okul-k7.webp",
  "cat": "okul",
  "alt": "Gece Yıldız Teknik Üniversitesi kapısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "üniversite",
   "ytü",
   "kampüs",
   "mühendislik"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/okul-k8.webp",
  "cat": "okul",
  "alt": "Matematik 40 doğru 0 yanlış",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 428,
  "tags": [
   "matematik",
   "sınav",
   "yks",
   "net"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/okul-k9.webp",
  "cat": "okul",
  "alt": "Galatasaray Üniversitesi kapısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "üniversite",
   "galatasaray",
   "kampüs",
   "istanbul"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/okul-k10.webp",
  "cat": "okul",
  "alt": "Gün batımında üniversite binası",
  "credit": "Kullanıcı arşivi",
  "w": 718,
  "h": 1276,
  "tags": [
   "üniversite",
   "kampüs",
   "gün batımı",
   "mezuniyet"
  ],
  "color": "turuncu"
 },
 {
  "src": "/vision/okul-k11.webp",
  "cat": "okul",
  "alt": "Koç Üniversitesi tabelası",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 294,
  "tags": [
   "üniversite",
   "koç",
   "kampüs",
   "istanbul"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/okul-k12.webp",
  "cat": "okul",
  "alt": "Dokuz Eylül Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 590,
  "h": 540,
  "tags": [
   "üniversite",
   "dokuz eylül",
   "deü",
   "izmir"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/okul-k13.webp",
  "cat": "okul",
  "alt": "İstanbul Teknik Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1030,
  "tags": [
   "üniversite",
   "itü",
   "mühendislik",
   "istanbul"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/okul-k14.webp",
  "cat": "okul",
  "alt": "Boğaziçi Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "üniversite",
   "boğaziçi",
   "istanbul",
   "kampüs"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/okul-k15.webp",
  "cat": "okul",
  "alt": "Ankara Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "üniversite",
   "ankara",
   "kampüs",
   "hukuk"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/okul-k16.webp",
  "cat": "okul",
  "alt": "İstanbul Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 300,
  "h": 300,
  "tags": [
   "üniversite",
   "istanbul üniversitesi",
   "istanbul",
   "tıp"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/okul-k17.webp",
  "cat": "okul",
  "alt": "Marmara Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 250,
  "h": 253,
  "tags": [
   "üniversite",
   "marmara",
   "istanbul",
   "kampüs"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/okul-k18.webp",
  "cat": "okul",
  "alt": "Gazi Üniversitesi logosu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "üniversite",
   "gazi",
   "ankara",
   "kampüs"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/dil-k1.webp",
  "cat": "dil",
  "alt": "Rusya bayrağı ve C1 C2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 414,
  "tags": [
   "rusça",
   "dil",
   "yabancı dil",
   "c1"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/dil-k2.webp",
  "cat": "dil",
  "alt": "ABD bayrağı ve C1 C2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 414,
  "tags": [
   "ingilizce",
   "dil",
   "yabancı dil",
   "c1"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/dil-k3.webp",
  "cat": "dil",
  "alt": "İngiltere bayrağı ve B2/C1 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 490,
  "tags": [
   "ingilizce",
   "dil",
   "yabancı dil",
   "b2"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/dil-k4.webp",
  "cat": "dil",
  "alt": "İspanya bayrağı ve C1 C2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "ispanyolca",
   "dil",
   "yabancı dil",
   "c1"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/dil-k5.webp",
  "cat": "dil",
  "alt": "Fransa bayrağı ve C1 C2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 414,
  "tags": [
   "fransızca",
   "dil",
   "yabancı dil",
   "c1"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/dil-k6.webp",
  "cat": "dil",
  "alt": "Almanya bayrağı ve C1 C2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 653,
  "h": 482,
  "tags": [
   "almanca",
   "dil",
   "yabancı dil",
   "c1"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/dil-k7.webp",
  "cat": "dil",
  "alt": "Güney Kore bayrağı ve B1-B2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "korece",
   "dil",
   "yabancı dil",
   "b1"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/dil-k8.webp",
  "cat": "dil",
  "alt": "Çin bayrağı ve B1-B2 seviyesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "çince",
   "dil",
   "yabancı dil",
   "b1"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/para-m1.webp",
  "cat": "para",
  "alt": "Elinde dolar desteleri tutan kadın",
  "credit": "Kullanıcı arşivi",
  "w": 474,
  "h": 644,
  "tags": [
   "para",
   "zenginlik",
   "bolluk",
   "dolar",
   "finans"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/para-m2.webp",
  "cat": "para",
  "alt": "Pembe kurdeleli dolar destesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1104,
  "tags": [
   "para",
   "bolluk",
   "dolar",
   "pembe",
   "finans"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/para-m3.webp",
  "cat": "para",
  "alt": "Kurdeleli dolar desteleri, 'Financial Freedom'",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 947,
  "tags": [
   "para",
   "finansal özgürlük",
   "bolluk",
   "dolar",
   "söz"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/para-k1.webp",
  "cat": "para",
  "alt": "Elde para dolu cüzdan",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "para",
   "bolluk",
   "cüzdan",
   "zenginlik"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/stil-1.webp",
  "cat": "stil",
  "alt": "Elinde lüks mağaza çantaları taşıyan kadın",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "alışveriş",
   "çanta",
   "moda",
   "lüks",
   "marka"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-2.webp",
  "cat": "stil",
  "alt": "Hediye paketleri, mücevher kutusu ve pembe şakayıklar",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1279,
  "tags": [
   "hediye",
   "mücevher",
   "şakayık",
   "pembe",
   "takı"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/stil-3.webp",
  "cat": "stil",
  "alt": "Renkli alışveriş çantaları",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 978,
  "tags": [
   "alışveriş",
   "poşet",
   "renkli",
   "moda",
   "hediye"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-4.webp",
  "cat": "stil",
  "alt": "Topuklu ayakkabı ve babet koleksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1148,
  "tags": [
   "ayakkabı",
   "topuklu",
   "babet",
   "moda",
   "koleksiyon"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-5.webp",
  "cat": "stil",
  "alt": "Parfüm şişeleri koleksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 900,
  "tags": [
   "parfüm",
   "koku",
   "koleksiyon",
   "bakım",
   "lüks"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-6.webp",
  "cat": "stil",
  "alt": "Beyaz atlet, pembe eşofman ve omuz çantasıyla rahat stil",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920,
  "tags": [
   "kıyafet",
   "kombin",
   "eşofman",
   "çanta",
   "rahat"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/stil-n1.webp",
  "cat": "stil",
  "alt": "Yatağın üstünde yeni iPhone'lar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "telefon",
   "iphone",
   "teknoloji",
   "alışveriş",
   "hediye"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/stil-n2.webp",
  "cat": "stil",
  "alt": "Yatakta markalı alışveriş poşetleri",
  "credit": "Kullanıcı arşivi",
  "w": 900,
  "h": 1200,
  "tags": [
   "alışveriş",
   "poşet",
   "moda",
   "kıyafet",
   "hediye"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-k1.webp",
  "cat": "stil",
  "alt": "Elde alışveriş poşetleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "alışveriş",
   "poşet",
   "moda",
   "şehir"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/stil-k2.webp",
  "cat": "stil",
  "alt": "Elde MAC ve Zara poşetleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "alışveriş",
   "poşet",
   "moda",
   "makyaj"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-k3.webp",
  "cat": "stil",
  "alt": "Gardıropta asılı kıyafetler ve çantalar",
  "credit": "Kullanıcı arşivi",
  "w": 720,
  "h": 1280,
  "tags": [
   "gardırop",
   "kıyafet",
   "çanta",
   "moda"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-k4.webp",
  "cat": "stil",
  "alt": "Yürüyen merdivende alışveriş poşetleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "alışveriş",
   "poşet",
   "avm",
   "moda"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-k5.webp",
  "cat": "stil",
  "alt": "Işıklı giyinme odası",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "gardırop",
   "giyinme odası",
   "ev",
   "düzen"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-k6.webp",
  "cat": "stil",
  "alt": "Ayakkabılar ve kıyafetlerle dolu gardırop",
  "credit": "Kullanıcı arşivi",
  "w": 675,
  "h": 1200,
  "tags": [
   "gardırop",
   "ayakkabı",
   "kıyafet",
   "düzen"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/stil-k7.webp",
  "cat": "stil",
  "alt": "Palmiyeler arasında kahve ve alışveriş poşetleri",
  "credit": "Kullanıcı arşivi",
  "w": 720,
  "h": 960,
  "tags": [
   "alışveriş",
   "kahve",
   "yaz",
   "poşet"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/guzellik-m1.webp",
  "cat": "guzellik",
  "alt": "Pembe cilt bakım ürünleri tepsisi",
  "credit": "Kullanıcı arşivi",
  "w": 564,
  "h": 1001,
  "tags": [
   "cilt bakımı",
   "bakım",
   "pembe",
   "kozmetik",
   "rutin"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-m2.webp",
  "cat": "guzellik",
  "alt": "Aynalı makyaj masası ve pembe bakım ürünleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920,
  "tags": [
   "bakım",
   "makyaj",
   "ayna",
   "pembe",
   "rutin"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-m3.webp",
  "cat": "guzellik",
  "alt": "Uzun dalgalı sarı saçlar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "saç",
   "dalgalı saç",
   "sarı",
   "bakım",
   "güzellik"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-m4.webp",
  "cat": "guzellik",
  "alt": "Uzun parlak koyu saçlar, 'healthy hair'",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "saç",
   "sağlıklı saç",
   "bakım",
   "güzellik",
   "kahverengi"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-1.webp",
  "cat": "guzellik",
  "alt": "Uzun kirpikli kahverengi göz yakın çekim",
  "credit": "Kullanıcı arşivi",
  "w": 600,
  "h": 589,
  "tags": [
   "göz",
   "kirpik",
   "makyaj",
   "bakım",
   "yakın çekim"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-2.webp",
  "cat": "guzellik",
  "alt": "Pembe tonlu french manikür",
  "credit": "Kullanıcı arşivi",
  "w": 408,
  "h": 680,
  "tags": [
   "tırnak",
   "manikür",
   "oje",
   "pembe",
   "bakım"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-3.webp",
  "cat": "guzellik",
  "alt": "Parlak dudak yakın çekim",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "dudak",
   "makyaj",
   "parlatıcı",
   "bakım",
   "güzellik"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/guzellik-4.webp",
  "cat": "guzellik",
  "alt": "Işıltılı, bakımlı cilt",
  "credit": "Kullanıcı arşivi",
  "w": 576,
  "h": 1024,
  "tags": [
   "cilt",
   "cilt bakımı",
   "ışıltı",
   "bakım",
   "güzellik"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-5.webp",
  "cat": "guzellik",
  "alt": "Bordo ojeli elde şarap kadehi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1290,
  "tags": [
   "oje",
   "bordo",
   "şarap",
   "tırnak",
   "akşam"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/guzellik-k1.webp",
  "cat": "guzellik",
  "alt": "Rafta dizili cilt bakım ürünleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "cilt bakımı",
   "serum",
   "krem",
   "bakım rutini"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/guzellik-k2.webp",
  "cat": "guzellik",
  "alt": "Aynanın önünde cilt bakım ve parfüm şişeleri",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1040,
  "tags": [
   "cilt bakımı",
   "bakım rutini",
   "serum",
   "parfüm"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k3.webp",
  "cat": "guzellik",
  "alt": "Masada makyaj ürünleri, ruj ve pudra",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1068,
  "tags": [
   "makyaj",
   "ruj",
   "pudra",
   "güzellik"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k4.webp",
  "cat": "guzellik",
  "alt": "Sokakta uzun dalgalı sarı saçlar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "saç",
   "sarı saç",
   "dalgalı saç",
   "uzun saç"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k5.webp",
  "cat": "guzellik",
  "alt": "Uzun kirpikli göz yakın çekim",
  "credit": "Kullanıcı arşivi",
  "w": 600,
  "h": 600,
  "tags": [
   "kirpik",
   "göz",
   "makyaj",
   "güzellik"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k6.webp",
  "cat": "guzellik",
  "alt": "Mumun yanında parfüm şişeleri ve takılar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "parfüm",
   "koku",
   "takı",
   "lüks"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k7.webp",
  "cat": "guzellik",
  "alt": "Ruj ve allık koleksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "makyaj",
   "ruj",
   "allık",
   "koleksiyon"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k8.webp",
  "cat": "guzellik",
  "alt": "Uzun bakımlı tırnaklı el",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "tırnak",
   "manikür",
   "el bakımı",
   "nude"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k9.webp",
  "cat": "guzellik",
  "alt": "Parlak ciltli yüz ve küpe",
  "credit": "Kullanıcı arşivi",
  "w": 703,
  "h": 838,
  "tags": [
   "cilt",
   "parlak cilt",
   "küpe",
   "bakım"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k10.webp",
  "cat": "guzellik",
  "alt": "Sınıfta tokayla toplanmış sarı saçlar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 946,
  "tags": [
   "saç",
   "sarı saç",
   "toka",
   "okul"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k11.webp",
  "cat": "guzellik",
  "alt": "Pembe süslü far paleti ve ayna",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1039,
  "tags": [
   "makyaj",
   "far",
   "pembe",
   "ayna"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k12.webp",
  "cat": "guzellik",
  "alt": "Tepside parfüm şişeleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 979,
  "tags": [
   "parfüm",
   "koku",
   "lüks",
   "şişe"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k13.webp",
  "cat": "guzellik",
  "alt": "Uzun dalgalı kızıl saçlar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1104,
  "tags": [
   "saç",
   "kızıl saç",
   "dalgalı saç",
   "uzun saç"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k14.webp",
  "cat": "guzellik",
  "alt": "Pembe makyaj ürünleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "makyaj",
   "pembe",
   "far",
   "ruj"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k15.webp",
  "cat": "guzellik",
  "alt": "Rafta pembe makyaj koleksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920,
  "tags": [
   "makyaj",
   "pembe",
   "koleksiyon",
   "far"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k16.webp",
  "cat": "guzellik",
  "alt": "Parlak ve pürüzsüz cilt",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "cilt",
   "parlak cilt",
   "bakım",
   "makyaj"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k17.webp",
  "cat": "guzellik",
  "alt": "Uzun düz kahverengi saçlar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "saç",
   "kahverengi saç",
   "düz saç",
   "uzun saç"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k18.webp",
  "cat": "guzellik",
  "alt": "'My skin is so clear' yazılı temiz cilt",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 799,
  "tags": [
   "cilt",
   "temiz cilt",
   "olumlama",
   "bakım"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k19.webp",
  "cat": "guzellik",
  "alt": "Havluyla yüz maskesi yapan kız",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "maske",
   "cilt bakımı",
   "bakım rutini",
   "spa"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/guzellik-k20.webp",
  "cat": "guzellik",
  "alt": "Tabakta dudak parlatıcıları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "makyaj",
   "dudak",
   "parlatıcı",
   "pembe"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k21.webp",
  "cat": "guzellik",
  "alt": "Uzun kirpikli göz",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 716,
  "tags": [
   "kirpik",
   "göz",
   "makyaj",
   "güzellik"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k22.webp",
  "cat": "guzellik",
  "alt": "Parlak pembe dudaklar",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 459,
  "tags": [
   "dudak",
   "parlatıcı",
   "makyaj",
   "pembe"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k23.webp",
  "cat": "guzellik",
  "alt": "Bakımlı tırnaklar ve pijama",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "tırnak",
   "manikür",
   "el bakımı",
   "rahat"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k24.webp",
  "cat": "guzellik",
  "alt": "Işıklı makyaj masası",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1198,
  "tags": [
   "makyaj",
   "makyaj masası",
   "ayna",
   "düzen"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k25.webp",
  "cat": "guzellik",
  "alt": "Pembe far paleti ve süslü ayna",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "makyaj",
   "pembe",
   "far",
   "ayna"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/guzellik-k26.webp",
  "cat": "guzellik",
  "alt": "Cilt bakım ürünleri ve yüz roller",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1104,
  "tags": [
   "cilt bakımı",
   "serum",
   "bakım rutini",
   "roller"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/guzellik-k27.webp",
  "cat": "guzellik",
  "alt": "Doğal makyajlı yüz ve dudaklar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 987,
  "tags": [
   "dudak",
   "doğal makyaj",
   "cilt",
   "yüz"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/sevgi-m1.webp",
  "cat": "sevgi",
  "alt": "Kalp şeklinde boyun boyuna iki kuğu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 743,
  "tags": [
   "kuğu",
   "kalp",
   "aşk",
   "göl",
   "beyaz"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/sevgi-m2.webp",
  "cat": "sevgi",
  "alt": "Öpüşen çiftin gölgesi",
  "credit": "Kullanıcı arşivi",
  "w": 356,
  "h": 356,
  "tags": [
   "sevgili",
   "aşk",
   "gölge",
   "öpücük",
   "romantik"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/sevgi-m3.webp",
  "cat": "sevgi",
  "alt": "El ele koşan gelin ve damat",
  "credit": "Kullanıcı arşivi",
  "w": 976,
  "h": 1200,
  "tags": [
   "düğün",
   "evlilik",
   "gelin",
   "aşk",
   "el ele"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/sevgi-m4.webp",
  "cat": "sevgi",
  "alt": "Yeşil tepede uzanan eller",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 960,
  "tags": [
   "el ele",
   "sevgili",
   "doğa",
   "yeşil",
   "aşk"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/sevgi-m5.webp",
  "cat": "sevgi",
  "alt": "Pembe suda kalp yapan iki kuğu",
  "credit": "Kullanıcı arşivi",
  "w": 710,
  "h": 710,
  "tags": [
   "kuğu",
   "kalp",
   "aşk",
   "pembe",
   "romantik"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/sevgi-5.webp",
  "cat": "sevgi",
  "alt": "Sevgilisinin koluna sarılmış, tek taş yüzüklü el",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 971,
  "tags": [
   "yüzük",
   "tek taş",
   "sevgili",
   "nişan",
   "aşk"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/sevgi-6.webp",
  "cat": "sevgi",
  "alt": "Kırmızı gül buketi taşıyan çift",
  "credit": "Kullanıcı arşivi",
  "w": 470,
  "h": 627,
  "tags": [
   "gül",
   "buket",
   "sevgili",
   "çift",
   "aşk"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/sevgi-7.webp",
  "cat": "sevgi",
  "alt": "Kocaman pembe şakayık buketi",
  "credit": "Kullanıcı arşivi",
  "w": 799,
  "h": 1400,
  "tags": [
   "şakayık",
   "buket",
   "çiçek",
   "pembe",
   "sevgili"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/sevgi-n1.webp",
  "cat": "sevgi",
  "alt": "Beyaz buketli gelinlik ve duvak",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1266,
  "tags": [
   "gelinlik",
   "düğün",
   "evlilik",
   "gelin",
   "çiçek"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/sevgi-n2.webp",
  "cat": "sevgi",
  "alt": "Nikah günü el ele tutuşan gelin ve damat",
  "credit": "Kullanıcı arşivi",
  "w": 1050,
  "h": 1400,
  "tags": [
   "düğün",
   "nikah",
   "evlilik",
   "yüzük",
   "aşk"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/sevgi-n3.webp",
  "cat": "sevgi",
  "alt": "Arabada gelin buketi ve aile cüzdanı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "evlilik",
   "nikah",
   "aile cüzdanı",
   "gelin",
   "çiçek"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/seyahat-9.webp",
  "cat": "seyahat",
  "alt": "Karlı ormanın üstünde kuzey ışıkları",
  "credit": "Kullanıcı arşivi",
  "w": 720,
  "h": 900,
  "tags": [
   "kuzey ışıkları",
   "kar",
   "orman",
   "norveç",
   "kış"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/seyahat-10.webp",
  "cat": "seyahat",
  "alt": "Londra'da kırmızı telefon kulübesi ve Big Ben",
  "credit": "Kullanıcı arşivi",
  "w": 823,
  "h": 1400,
  "tags": [
   "londra",
   "big ben",
   "ingiltere",
   "şehir",
   "yurt dışı"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/seyahat-11.webp",
  "cat": "seyahat",
  "alt": "Paris'te kafe terasından Eyfel Kulesi",
  "credit": "Kullanıcı arşivi",
  "w": 546,
  "h": 852,
  "tags": [
   "paris",
   "eyfel",
   "fransa",
   "kafe",
   "yurt dışı"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/seyahat-12.webp",
  "cat": "seyahat",
  "alt": "Gün batımında Positano kıyısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "positano",
   "italya",
   "deniz",
   "yaz",
   "tatil"
  ],
  "color": "turuncu"
 },
 {
  "src": "/vision/seyahat-13.webp",
  "cat": "seyahat",
  "alt": "Uçak penceresinden gün batımı",
  "credit": "Kullanıcı arşivi",
  "w": 564,
  "h": 999,
  "tags": [
   "uçak",
   "gün batımı",
   "bulut",
   "seyahat",
   "pencere"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/seyahat-n1.webp",
  "cat": "seyahat",
  "alt": "Havalimanında bordo pasaport ve biniş kartı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "pasaport",
   "havalimanı",
   "yurt dışı",
   "tatil",
   "uçak"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/seyahat-n2.webp",
  "cat": "seyahat",
  "alt": "Uçak penceresinden bulutların üstünde gün batımı",
  "credit": "Kullanıcı arşivi",
  "w": 900,
  "h": 1200,
  "tags": [
   "uçak",
   "seyahat",
   "gün batımı",
   "bulut",
   "tatil"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/seyahat-n3.webp",
  "cat": "seyahat",
  "alt": "Uçak penceresinde pasaport ve biniş kartı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "pasaport",
   "uçak",
   "seyahat",
   "yurt dışı",
   "tatil"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/seyahat-k1.webp",
  "cat": "seyahat",
  "alt": "Roma'da Trevi Çeşmesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "roma",
   "italya",
   "avrupa",
   "tatil"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/seyahat-k2.webp",
  "cat": "seyahat",
  "alt": "Gece Galata Kulesi ve Türk bayrağı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "istanbul",
   "galata",
   "gece",
   "şehir"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/seyahat-k3.webp",
  "cat": "seyahat",
  "alt": "Uçak penceresinde pasaport",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "pasaport",
   "uçak",
   "yolculuk",
   "tatil"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/seyahat-k4.webp",
  "cat": "seyahat",
  "alt": "Gece uçaktan şehir ışıkları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "uçak",
   "gece",
   "şehir",
   "yolculuk"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/seyahat-k5.webp",
  "cat": "seyahat",
  "alt": "Çiçekler arasında Kolezyum",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1104,
  "tags": [
   "roma",
   "italya",
   "avrupa",
   "bahar"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/seyahat-k6.webp",
  "cat": "seyahat",
  "alt": "Balkondan Eyfel Kulesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 974,
  "tags": [
   "paris",
   "fransa",
   "avrupa",
   "balkon"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/luks-1.webp",
  "cat": "luks",
  "alt": "Bilezikli elle BMW direksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "araba",
   "bmw",
   "direksiyon",
   "bileklik",
   "ehliyet"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-2.webp",
  "cat": "luks",
  "alt": "Kürk ceket ve yüzüklerle Porsche direksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "araba",
   "porsche",
   "kürk",
   "yüzük",
   "lüks"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-3.webp",
  "cat": "luks",
  "alt": "Arabada çiçek buketi ve hediye paketleri",
  "credit": "Kullanıcı arşivi",
  "w": 676,
  "h": 1200,
  "tags": [
   "araba",
   "çiçek",
   "hediye",
   "buket",
   "sürpriz"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/luks-4.webp",
  "cat": "luks",
  "alt": "Pembe Porsche ve araba anahtarı",
  "credit": "Kullanıcı arşivi",
  "w": 564,
  "h": 691,
  "tags": [
   "araba",
   "porsche",
   "pembe",
   "anahtar",
   "lüks"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/luks-n1.webp",
  "cat": "luks",
  "alt": "Ojeli elle BMW direksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 978,
  "tags": [
   "araba",
   "bmw",
   "direksiyon",
   "ehliyet",
   "özgürlük"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-n2.webp",
  "cat": "luks",
  "alt": "Beyaz Fiat 500 ve araba anahtarı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "araba",
   "anahtar",
   "ilk arabam",
   "ehliyet",
   "beyaz"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/luks-n3.webp",
  "cat": "luks",
  "alt": "Boş yeni evin anahtarı, 'own house' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 933,
  "h": 1400,
  "tags": [
   "ev",
   "kendi evim",
   "anahtar",
   "yeni ev",
   "daire"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/luks-n4.webp",
  "cat": "luks",
  "alt": "Mercedes önünde araba anahtarı tutan el",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 919,
  "tags": [
   "araba",
   "mercedes",
   "anahtar",
   "lüks",
   "ehliyet"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-n5.webp",
  "cat": "luks",
  "alt": "Gün doğumunda Audi ile otoyolda sürüş",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "araba",
   "audi",
   "yol",
   "sürüş",
   "özgürlük"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/luks-k1.webp",
  "cat": "luks",
  "alt": "Kırmızı kurdeleli siyah araba ve anahtarı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1332,
  "tags": [
   "araba",
   "hediye",
   "anahtar",
   "ehliyet"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-k2.webp",
  "cat": "luks",
  "alt": "Elde araba anahtarı, arkada siyah araba",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "araba",
   "anahtar",
   "ehliyet",
   "yeni araba"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-k3.webp",
  "cat": "luks",
  "alt": "Kırmızı kurdeleli araba ve anahtar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1047,
  "tags": [
   "araba",
   "hediye",
   "anahtar",
   "yeni araba"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/luks-k4.webp",
  "cat": "luks",
  "alt": "Şehir manzaralı evde anahtar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1104,
  "tags": [
   "ev",
   "anahtar",
   "yeni ev",
   "manzara"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/luks-k5.webp",
  "cat": "luks",
  "alt": "Gün batımında araba kullanan kız",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "araba",
   "ehliyet",
   "gün batımı",
   "yolculuk"
  ],
  "color": "turuncu"
 },
 {
  "src": "/vision/saglik-7.webp",
  "cat": "saglik",
  "alt": "Avokadolu tost, yumurta ve meyveli kahvaltı tabağı",
  "credit": "Kullanıcı arşivi",
  "w": 788,
  "h": 1400,
  "tags": [
   "kahvaltı",
   "avokado",
   "yumurta",
   "sağlıklı",
   "beslenme"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/saglik-8.webp",
  "cat": "saglik",
  "alt": "Çilek, muz ve yaban mersinli yoğurt kasesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 966,
  "tags": [
   "yoğurt",
   "meyve",
   "çilek",
   "sağlıklı",
   "beslenme"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/saglik-n1.webp",
  "cat": "saglik",
  "alt": "Pembe spor ekipmanları, dambıl ve spor ayakkabı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "spor",
   "gym",
   "fitness",
   "dambıl",
   "pembe"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/saglik-n2.webp",
  "cat": "saglik",
  "alt": "Spor salonunda antrenman yapan kadın",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "spor",
   "gym",
   "fitness",
   "antrenman",
   "güçlü"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/saglik-n3.webp",
  "cat": "saglik",
  "alt": "Pilates reformer üzerinde esneme, siyah beyaz",
  "credit": "Kullanıcı arşivi",
  "w": 740,
  "h": 1152,
  "tags": [
   "pilates",
   "spor",
   "esneme",
   "beden",
   "reformer"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/saglik-n4.webp",
  "cat": "saglik",
  "alt": "Pembe pilates ekipmanları ve buzlu kahve",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1036,
  "tags": [
   "pilates",
   "spor",
   "pembe",
   "kahve",
   "sabah rutini"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/saglik-k1.webp",
  "cat": "saglik",
  "alt": "Pilates matında egzersiz yapan kız",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920,
  "tags": [
   "pilates",
   "spor",
   "egzersiz",
   "sağlık"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/saglik-k2.webp",
  "cat": "saglik",
  "alt": "Meyveli kase, limonlu su ve bitki çayı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1147,
  "tags": [
   "sağlıklı beslenme",
   "kahvaltı",
   "çay",
   "sağlık"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/saglik-k3.webp",
  "cat": "saglik",
  "alt": "Beyaz büstiyerle fit bel ve karın",
  "credit": "Kullanıcı arşivi",
  "w": 548,
  "h": 802,
  "tags": [
   "fit",
   "spor",
   "pilates",
   "sağlık"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/saglik-k4.webp",
  "cat": "saglik",
  "alt": "Beyaz atlet ve pembe eşofmanla fit görünüm",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920,
  "tags": [
   "fit",
   "spor",
   "sağlık",
   "rahat"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/cicek-m1.webp",
  "cat": "cicek",
  "alt": "Beyaz zambaklar yakın çekim",
  "credit": "Kullanıcı arşivi",
  "w": 900,
  "h": 1200,
  "tags": [
   "zambak",
   "çiçek",
   "beyaz",
   "doğa",
   "bahar"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/cicek-m2.webp",
  "cat": "cicek",
  "alt": "Mavi gül buketi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920,
  "tags": [
   "gül",
   "buket",
   "mavi",
   "çiçek",
   "hediye"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/cicek-m3.webp",
  "cat": "cicek",
  "alt": "Pembe güller",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "gül",
   "pembe",
   "çiçek",
   "romantik",
   "buket"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/cicek-m4.webp",
  "cat": "cicek",
  "alt": "Duvarda gölgesiyle siyah gül",
  "credit": "Kullanıcı arşivi",
  "w": 1120,
  "h": 1400,
  "tags": [
   "gül",
   "siyah",
   "gölge",
   "çiçek",
   "sade"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/cicek-m5.webp",
  "cat": "cicek",
  "alt": "Koyu yeşil zemin üstünde beyaz çiçekler",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 723,
  "tags": [
   "çiçek",
   "yeşil",
   "desen",
   "bahar",
   "doğa"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/cicek-m6.webp",
  "cat": "cicek",
  "alt": "Beyaz laleler",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "lale",
   "beyaz",
   "çiçek",
   "bahar",
   "buket"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/cicek-m7.webp",
  "cat": "cicek",
  "alt": "Çimenlikte beyaz laleler",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "lale",
   "bahçe",
   "doğa",
   "bahar",
   "beyaz"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/cicek-m8.webp",
  "cat": "cicek",
  "alt": "Kırmızı güller",
  "credit": "Kullanıcı arşivi",
  "w": 1096,
  "h": 1200,
  "tags": [
   "gül",
   "kırmızı",
   "aşk",
   "çiçek",
   "buket"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/cicek-m9.webp",
  "cat": "cicek",
  "alt": "Çiçekçide renkli buketler",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1307,
  "tags": [
   "çiçek",
   "buket",
   "çiçekçi",
   "lale",
   "renkli"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/cicek-m10.webp",
  "cat": "cicek",
  "alt": "Açık mavi laleler",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 884,
  "tags": [
   "lale",
   "mavi",
   "buket",
   "çiçek",
   "bahar"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/cicek-m11.webp",
  "cat": "cicek",
  "alt": "Pembe şakayık buketi",
  "credit": "Kullanıcı arşivi",
  "w": 675,
  "h": 1200,
  "tags": [
   "şakayık",
   "pembe",
   "buket",
   "çiçek",
   "hediye"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/cicek-m12.webp",
  "cat": "cicek",
  "alt": "Sarı lale buketi",
  "credit": "Kullanıcı arşivi",
  "w": 720,
  "h": 960,
  "tags": [
   "lale",
   "sarı",
   "buket",
   "çiçek",
   "bahar"
  ],
  "color": "sari"
 },
 {
  "src": "/vision/cicek-m13.webp",
  "cat": "cicek",
  "alt": "Kucak dolusu lale ve papatya buketi",
  "credit": "Kullanıcı arşivi",
  "w": 896,
  "h": 1184,
  "tags": [
   "lale",
   "papatya",
   "buket",
   "çiçek",
   "renkli"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/cicek-m14.webp",
  "cat": "cicek",
  "alt": "Lila şebboy buketi",
  "credit": "Kullanıcı arşivi",
  "w": 1080,
  "h": 1080,
  "tags": [
   "mor",
   "lila",
   "buket",
   "çiçek",
   "hediye"
  ],
  "color": "mor"
 },
 {
  "src": "/vision/cicek-m15.webp",
  "cat": "cicek",
  "alt": "Mor lale buketi",
  "credit": "Kullanıcı arşivi",
  "w": 623,
  "h": 792,
  "tags": [
   "lale",
   "mor",
   "buket",
   "çiçek",
   "bahar"
  ],
  "color": "mor"
 },
 {
  "src": "/vision/cicek-m16.webp",
  "cat": "cicek",
  "alt": "Mavi çiçek buketi",
  "credit": "Kullanıcı arşivi",
  "w": 1051,
  "h": 1400,
  "tags": [
   "buket",
   "mavi",
   "çiçek",
   "hediye",
   "sokak"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/cicek-m17.webp",
  "cat": "cicek",
  "alt": "Koyu kırmızı güller",
  "credit": "Kullanıcı arşivi",
  "w": 1024,
  "h": 1024,
  "tags": [
   "gül",
   "kırmızı",
   "bordo",
   "çiçek",
   "aşk"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/cicek-m18.webp",
  "cat": "cicek",
  "alt": "Beyaz ve turuncu zambaklar, sıcak ışık",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "zambak",
   "çiçek",
   "sıcak",
   "kahverengi",
   "sonbahar"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/cicek-m19.webp",
  "cat": "cicek",
  "alt": "Kırmızı beyaz gül buketi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "gül",
   "buket",
   "kırmızı",
   "çiçek",
   "hediye"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/huzur-7.webp",
  "cat": "cicek",
  "alt": "Pembe ve beyaz lale buketleri",
  "credit": "Kullanıcı arşivi",
  "w": 900,
  "h": 1200,
  "tags": [
   "lale",
   "çiçek",
   "buket",
   "pembe",
   "bahar"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/huzur-8.webp",
  "cat": "cicek",
  "alt": "Pembe zambaklar",
  "credit": "Kullanıcı arşivi",
  "w": 675,
  "h": 1200,
  "tags": [
   "zambak",
   "çiçek",
   "pembe",
   "huzur",
   "bahar"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/huzur-9.webp",
  "cat": "cicek",
  "alt": "Kırmızı, beyaz ve mor lale buketi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "lale",
   "çiçek",
   "buket",
   "renkli",
   "bahar"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/doga-m1.webp",
  "cat": "doga",
  "alt": "Sarı battaniyede uyuyan kedi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "kedi",
   "hayvan",
   "huzur",
   "sarı",
   "uyku"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/doga-m2.webp",
  "cat": "doga",
  "alt": "İnci beyazı deniz kabukları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "deniz kabuğu",
   "inci",
   "beyaz",
   "deniz",
   "doku"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/doga-m3.webp",
  "cat": "doga",
  "alt": "Parmağa konan kelebek, güneşli ağaçlar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "kelebek",
   "doğa",
   "ağaç",
   "güneş",
   "yeşil"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/doga-m4.webp",
  "cat": "doga",
  "alt": "Sarımsı deniz kabukları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 774,
  "tags": [
   "deniz kabuğu",
   "sarı",
   "deniz",
   "doku",
   "yaz"
  ],
  "color": "sari"
 },
 {
  "src": "/vision/doga-m5.webp",
  "cat": "doga",
  "alt": "Parlayan suda kanat çırpan kuğu",
  "credit": "Kullanıcı arşivi",
  "w": 597,
  "h": 896,
  "tags": [
   "kuğu",
   "göl",
   "su",
   "ışık",
   "doğa"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/doga-m6.webp",
  "cat": "doga",
  "alt": "Çiçekli ağaç altında gölde iki kuğu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 990,
  "tags": [
   "kuğu",
   "göl",
   "bahar",
   "doğa",
   "yeşil"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/doga-m7.webp",
  "cat": "doga",
  "alt": "Mor ametist taşları",
  "credit": "Kullanıcı arşivi",
  "w": 800,
  "h": 800,
  "tags": [
   "ametist",
   "taş",
   "kristal",
   "mor",
   "enerji"
  ],
  "color": "mor"
 },
 {
  "src": "/vision/doga-m8.webp",
  "cat": "doga",
  "alt": "Çimenlerde beyaz kedi",
  "credit": "Kullanıcı arşivi",
  "w": 400,
  "h": 401,
  "tags": [
   "kedi",
   "beyaz",
   "hayvan",
   "çimen",
   "doğa"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/doga-m9.webp",
  "cat": "doga",
  "alt": "Gün batımında dalgalar ve sahil",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "deniz",
   "sahil",
   "dalga",
   "gün batımı",
   "yaz"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/doga-m10.webp",
  "cat": "doga",
  "alt": "Karanlık suda beyaz kuğu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 977,
  "tags": [
   "kuğu",
   "gece",
   "siyah",
   "göl",
   "zarif"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/doga-m11.webp",
  "cat": "doga",
  "alt": "Çiçekler arasında yavru geyik",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 765,
  "tags": [
   "geyik",
   "hayvan",
   "orman",
   "çiçek",
   "masal"
  ],
  "color": "turuncu"
 },
 {
  "src": "/vision/doga-m12.webp",
  "cat": "doga",
  "alt": "Yeşil yeşim taşları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "taş",
   "yeşil",
   "kristal",
   "doğa",
   "enerji"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/doga-m13.webp",
  "cat": "doga",
  "alt": "Mavi tonlu deniz kabukları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "deniz kabuğu",
   "mavi",
   "deniz",
   "doku",
   "yaz"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/doga-m14.webp",
  "cat": "doga",
  "alt": "Pembe çiçekler arasında gölde kuğu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "kuğu",
   "göl",
   "çiçek",
   "doğa",
   "bahar"
  ],
  "color": "yesil"
 },
 {
  "src": "/vision/sanat-m1.webp",
  "cat": "sanat",
  "alt": "Piyanoda nota kâğıdı ve gün ışığı",
  "credit": "Kullanıcı arşivi",
  "w": 564,
  "h": 1002,
  "tags": [
   "müzik",
   "piyano",
   "nota",
   "sanat",
   "hobi"
  ],
  "color": "turuncu"
 },
 {
  "src": "/vision/sanat-m2.webp",
  "cat": "sanat",
  "alt": "Konserde konfeti ve mor ışıklar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "konser",
   "müzik",
   "eğlence",
   "konfeti",
   "mor"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/sanat-m3.webp",
  "cat": "sanat",
  "alt": "Duvarda mavi tonlu çerçeveli fotoğraflar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "sergi",
   "fotoğraf",
   "sanat",
   "galeri",
   "mavi"
  ],
  "color": "mavi"
 },
 {
  "src": "/vision/sanat-m4.webp",
  "cat": "sanat",
  "alt": "Yatakta eski dijital fotoğraf makinesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1026,
  "tags": [
   "fotoğraf makinesi",
   "retro",
   "hobi",
   "anı",
   "sarı"
  ],
  "color": "sari"
 },
 {
  "src": "/vision/sanat-m5.webp",
  "cat": "sanat",
  "alt": "Müzede tablo fotoğraflayan kadın",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 904,
  "tags": [
   "müze",
   "sanat",
   "tablo",
   "sergi",
   "gezi"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/huzur-n1.webp",
  "cat": "sanat",
  "alt": "Pembe pijamayla yatakta kitap okumak",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "kitap",
   "okumak",
   "yatak",
   "pembe",
   "dinlenme"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/huzur-n2.webp",
  "cat": "sanat",
  "alt": "Gün batımında bahçede kitap okumak",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1185,
  "tags": [
   "kitap",
   "okumak",
   "gün batımı",
   "bahçe",
   "huzur"
  ],
  "color": "bej"
 },
 {
  "src": "/vision/sanat-5.webp",
  "cat": "sanat",
  "alt": "Konserde ışıklar ve kalabalık",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981,
  "tags": [
   "konser",
   "müzik",
   "ışık",
   "eğlence",
   "kalabalık"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/sanat-6.webp",
  "cat": "sanat",
  "alt": "Eski dijital fotoğraf makineleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308,
  "tags": [
   "fotoğraf makinesi",
   "fotoğraf",
   "retro",
   "hobi",
   "anı"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/soz-m1.webp",
  "cat": "soz",
  "alt": "'Pretty soul, pretty mind' olumlaması, dua eden kadın",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 713,
  "tags": [
   "olumlama",
   "söz",
   "huzur",
   "güzellik",
   "dua"
  ],
  "color": "siyah"
 },
 {
  "src": "/vision/soz-m2.webp",
  "cat": "soz",
  "alt": "'Everything I want, wants me more' yazılı bordo kalp",
  "credit": "Kullanıcı arşivi",
  "w": 731,
  "h": 733,
  "tags": [
   "olumlama",
   "söz",
   "kalp",
   "çekim yasası",
   "bordo"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/soz-m3.webp",
  "cat": "soz",
  "alt": "'I am so lucky' yazısı, pembe",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "olumlama",
   "şans",
   "söz",
   "pembe",
   "şanslıyım"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m4.webp",
  "cat": "soz",
  "alt": "'Hg hot girl' periyodik tablo arması",
  "credit": "Kullanıcı arşivi",
  "w": 299,
  "h": 292,
  "tags": [
   "periyodik tablo",
   "söz",
   "pembe",
   "eğlenceli",
   "özgüven"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m5.webp",
  "cat": "soz",
  "alt": "Pembe simli pi sembolü",
  "credit": "Kullanıcı arşivi",
  "w": 750,
  "h": 785,
  "tags": [
   "pi",
   "sembol",
   "pembe",
   "simli",
   "matematik"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m6.webp",
  "cat": "soz",
  "alt": "'Cu Cutie' periyodik tablo kartı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "periyodik tablo",
   "söz",
   "pembe",
   "eğlenceli",
   "tatlı"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m7.webp",
  "cat": "soz",
  "alt": "'Pr Princess' periyodik tablo kartı",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 724,
  "tags": [
   "periyodik tablo",
   "prenses",
   "söz",
   "pembe",
   "eğlenceli"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m8.webp",
  "cat": "soz",
  "alt": "'Yes you can' yazısı, bordo zemin",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 908,
  "tags": [
   "motivasyon",
   "söz",
   "bordo",
   "başarı",
   "yapabilirsin"
  ],
  "color": "kirmizi"
 },
 {
  "src": "/vision/soz-m9.webp",
  "cat": "soz",
  "alt": "Üç pembe piksel kalp",
  "credit": "Kullanıcı arşivi",
  "w": 600,
  "h": 600,
  "tags": [
   "kalp",
   "piksel",
   "pembe",
   "sembol",
   "sevgi"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m10.webp",
  "cat": "soz",
  "alt": "'An Angel' periyodik tablo kartı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 730,
  "tags": [
   "periyodik tablo",
   "melek",
   "söz",
   "pembe",
   "mavi"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m11.webp",
  "cat": "soz",
  "alt": "'2027 is my year' yazısı, pembe",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "2027",
   "benim yılım",
   "söz",
   "pembe",
   "yeni yıl"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m12.webp",
  "cat": "soz",
  "alt": "'ICoNiC' periyodik tablo yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 1200,
  "h": 675,
  "tags": [
   "periyodik tablo",
   "ikonik",
   "söz",
   "pembe",
   "eğlenceli"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m13.webp",
  "cat": "soz",
  "alt": "'This is my glow up year' yazılı bordo çiçek",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "glow up",
   "benim yılım",
   "söz",
   "bordo",
   "değişim"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m14.webp",
  "cat": "soz",
  "alt": "Pembe piksel fiyonk",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "fiyonk",
   "piksel",
   "pembe",
   "sembol",
   "tatlı"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m15.webp",
  "cat": "soz",
  "alt": "'SLaY' periyodik tablo yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "periyodik tablo",
   "slay",
   "söz",
   "pembe",
   "eğlenceli"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m16.webp",
  "cat": "soz",
  "alt": "Cinsiyet: Diva yazılı form",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 702,
  "tags": [
   "diva",
   "söz",
   "eğlenceli",
   "pembe",
   "özgüven"
  ],
  "color": "beyaz"
 },
 {
  "src": "/vision/soz-m17.webp",
  "cat": "soz",
  "alt": "'B.I.T.C.H.' kısaltmalı pembe özgüven sözü",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "özgüven",
   "söz",
   "pembe",
   "eğlenceli",
   "kadın"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m18.webp",
  "cat": "soz",
  "alt": "Hesap makinesinde 'this user is a diva' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 911,
  "tags": [
   "diva",
   "söz",
   "pembe",
   "eğlenceli",
   "retro"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m19.webp",
  "cat": "soz",
  "alt": "'I'm just a girl' yazılı pembe çıkartma",
  "credit": "Kullanıcı arşivi",
  "w": 1080,
  "h": 1080,
  "tags": [
   "söz",
   "kız",
   "pembe",
   "eğlenceli",
   "çıkartma"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-m20.webp",
  "cat": "soz",
  "alt": "'2027' yazısı, pembe zemin",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736,
  "tags": [
   "2027",
   "yeni yıl",
   "söz",
   "pembe",
   "hedef"
  ],
  "color": "pembe"
 },
 {
  "src": "/vision/soz-k1.webp",
  "cat": "soz",
  "alt": "Pembe zeminde 'This is my year' yazısı",
  "credit": "Kullanıcı arşivi",
  "w": 320,
  "h": 360,
  "tags": [
   "benim yılım",
   "motivasyon",
   "yeni yıl",
   "2027"
  ],
  "color": "pembe"
 }
];

/** Aramada Türkçe karakter ve büyük/küçük harf farkını yok sayar: "Öğretmen" = "ogretmen". */
export function foldTr(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INDEX = new Map(VISION_LIBRARY.map((v) => [v.src, foldTr([v.alt, VISION_CATS[v.cat], VISION_COLORS[v.color][0], ...v.tags].join(" "))]));

/** Her kelime etiketlerde, açıklamada ya da kategori adında geçmeli. */
export function matchesQuery(v: VisionPhoto, q: string) {
  const words = foldTr(q).split(" ").filter(Boolean);
  if (!words.length) return true;
  const hay = INDEX.get(v.src) ?? "";
  return words.every((w) => hay.includes(w));
}

/** En çok kullanılan etiketler: arama kutusunun altında öneri olarak gösterilir. */
export const POPULAR_TAGS: string[] = (() => {
  const c = new Map<string, number>();
  VISION_LIBRARY.forEach((v) => v.tags.forEach((t) => c.set(t, (c.get(t) ?? 0) + 1)));
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([t]) => t);
})();

/** Kullanıcının kendi yüklediği süsler: uploads/<uid>/sus/... */
export const isSticker = (src: string | null | undefined) => !!src && /^[0-9a-f-]{36}\/sus\//.test(src);
