/** Vision board kütüphanesi: site sahibinin arşivinden fotoğraflar (ART_LICENSES.md). */
export const VISION_CATS = {"basari": "Kariyer ve başarı", "stil": "Alışveriş ve stil", "guzellik": "Güzellik ve bakım", "sevgi": "Aşk ve ilişki", "seyahat": "Seyahat", "luks": "Araba ve özgürlük", "saglik": "Sağlık ve beslenme", "huzur": "Huzur ve çiçekler", "sanat": "Sanat ve eğlence"} as const;

export type VisionCat = keyof typeof VISION_CATS;

export type VisionPhoto = { src: string; cat: VisionCat; alt: string; credit: string; w: number; h: number };

export const VISION_LIBRARY: VisionPhoto[] = [
 {
  "src": "/vision/basari-5.webp",
  "cat": "basari",
  "alt": "Tablette kalp anatomisi, stetoskop ve tıp notları",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981
 },
 {
  "src": "/vision/basari-6.webp",
  "cat": "basari",
  "alt": "Ekranında kodla çizilmiş pembe kalp olan dizüstü bilgisayar",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1304
 },
 {
  "src": "/vision/basari-7.webp",
  "cat": "basari",
  "alt": "Gece kod yazılan dizüstü bilgisayar",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 887
 },
 {
  "src": "/vision/basari-8.webp",
  "cat": "basari",
  "alt": "Mezuniyet töreninde havaya atılan kepler",
  "credit": "Kullanıcı arşivi",
  "w": 1050,
  "h": 1400
 },
 {
  "src": "/vision/basari-9.webp",
  "cat": "basari",
  "alt": "Mezuniyet cübbesiyle çiçek tutan genç kadın, tarihi kampüs önünde",
  "credit": "Kullanıcı arşivi",
  "w": 1054,
  "h": 1400
 },
 {
  "src": "/vision/stil-1.webp",
  "cat": "stil",
  "alt": "Elinde lüks mağaza çantaları taşıyan kadın",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981
 },
 {
  "src": "/vision/stil-2.webp",
  "cat": "stil",
  "alt": "Hediye paketleri, mücevher kutusu ve pembe şakayıklar",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 1279
 },
 {
  "src": "/vision/stil-3.webp",
  "cat": "stil",
  "alt": "Renkli alışveriş çantaları",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 978
 },
 {
  "src": "/vision/stil-4.webp",
  "cat": "stil",
  "alt": "Topuklu ayakkabı ve babet koleksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1148
 },
 {
  "src": "/vision/stil-5.webp",
  "cat": "stil",
  "alt": "Parfüm şişeleri koleksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 735,
  "h": 900
 },
 {
  "src": "/vision/stil-6.webp",
  "cat": "stil",
  "alt": "Beyaz atlet, pembe eşofman ve omuz çantasıyla rahat stil",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 920
 },
 {
  "src": "/vision/guzellik-1.webp",
  "cat": "guzellik",
  "alt": "Uzun kirpikli kahverengi göz yakın çekim",
  "credit": "Kullanıcı arşivi",
  "w": 600,
  "h": 589
 },
 {
  "src": "/vision/guzellik-2.webp",
  "cat": "guzellik",
  "alt": "Pembe tonlu french manikür",
  "credit": "Kullanıcı arşivi",
  "w": 408,
  "h": 680
 },
 {
  "src": "/vision/guzellik-3.webp",
  "cat": "guzellik",
  "alt": "Parlak dudak yakın çekim",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 736
 },
 {
  "src": "/vision/guzellik-4.webp",
  "cat": "guzellik",
  "alt": "Işıltılı, bakımlı cilt",
  "credit": "Kullanıcı arşivi",
  "w": 576,
  "h": 1024
 },
 {
  "src": "/vision/guzellik-5.webp",
  "cat": "guzellik",
  "alt": "Bordo ojeli elde şarap kadehi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1290
 },
 {
  "src": "/vision/sevgi-5.webp",
  "cat": "sevgi",
  "alt": "Sevgilisinin koluna sarılmış, tek taş yüzüklü el",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 971
 },
 {
  "src": "/vision/sevgi-6.webp",
  "cat": "sevgi",
  "alt": "Kırmızı gül buketi taşıyan çift",
  "credit": "Kullanıcı arşivi",
  "w": 470,
  "h": 627
 },
 {
  "src": "/vision/sevgi-7.webp",
  "cat": "sevgi",
  "alt": "Kocaman pembe şakayık buketi",
  "credit": "Kullanıcı arşivi",
  "w": 799,
  "h": 1400
 },
 {
  "src": "/vision/seyahat-9.webp",
  "cat": "seyahat",
  "alt": "Karlı ormanın üstünde kuzey ışıkları",
  "credit": "Kullanıcı arşivi",
  "w": 720,
  "h": 900
 },
 {
  "src": "/vision/seyahat-10.webp",
  "cat": "seyahat",
  "alt": "Londra'da kırmızı telefon kulübesi ve Big Ben",
  "credit": "Kullanıcı arşivi",
  "w": 823,
  "h": 1400
 },
 {
  "src": "/vision/seyahat-11.webp",
  "cat": "seyahat",
  "alt": "Paris'te kafe terasından Eyfel Kulesi",
  "credit": "Kullanıcı arşivi",
  "w": 546,
  "h": 852
 },
 {
  "src": "/vision/seyahat-12.webp",
  "cat": "seyahat",
  "alt": "Gün batımında Positano kıyısı",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308
 },
 {
  "src": "/vision/seyahat-13.webp",
  "cat": "seyahat",
  "alt": "Uçak penceresinden gün batımı",
  "credit": "Kullanıcı arşivi",
  "w": 564,
  "h": 999
 },
 {
  "src": "/vision/luks-1.webp",
  "cat": "luks",
  "alt": "Bilezikli elle BMW direksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981
 },
 {
  "src": "/vision/luks-2.webp",
  "cat": "luks",
  "alt": "Kürk ceket ve yüzüklerle Porsche direksiyonu",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981
 },
 {
  "src": "/vision/luks-3.webp",
  "cat": "luks",
  "alt": "Arabada çiçek buketi ve hediye paketleri",
  "credit": "Kullanıcı arşivi",
  "w": 676,
  "h": 1200
 },
 {
  "src": "/vision/luks-4.webp",
  "cat": "luks",
  "alt": "Pembe Porsche ve araba anahtarı",
  "credit": "Kullanıcı arşivi",
  "w": 564,
  "h": 691
 },
 {
  "src": "/vision/saglik-7.webp",
  "cat": "saglik",
  "alt": "Avokadolu tost, yumurta ve meyveli kahvaltı tabağı",
  "credit": "Kullanıcı arşivi",
  "w": 788,
  "h": 1400
 },
 {
  "src": "/vision/saglik-8.webp",
  "cat": "saglik",
  "alt": "Çilek, muz ve yaban mersinli yoğurt kasesi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 966
 },
 {
  "src": "/vision/huzur-7.webp",
  "cat": "huzur",
  "alt": "Pembe ve beyaz lale buketleri",
  "credit": "Kullanıcı arşivi",
  "w": 900,
  "h": 1200
 },
 {
  "src": "/vision/huzur-8.webp",
  "cat": "huzur",
  "alt": "Pembe zambaklar",
  "credit": "Kullanıcı arşivi",
  "w": 675,
  "h": 1200
 },
 {
  "src": "/vision/huzur-9.webp",
  "cat": "huzur",
  "alt": "Kırmızı, beyaz ve mor lale buketi",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981
 },
 {
  "src": "/vision/sanat-5.webp",
  "cat": "sanat",
  "alt": "Konserde ışıklar ve kalabalık",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 981
 },
 {
  "src": "/vision/sanat-6.webp",
  "cat": "sanat",
  "alt": "Eski dijital fotoğraf makineleri",
  "credit": "Kullanıcı arşivi",
  "w": 736,
  "h": 1308
 }
];


/** Kullanıcının kendi yüklediği süsler: uploads/<uid>/sus/... */
export const isSticker = (src: string | null | undefined) => !!src && /^[0-9a-f-]{36}\/sus\//.test(src);
