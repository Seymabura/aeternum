/** Vision board kütüphanesi. Kaynaklar: Unsplash lisanslı görseller ve site sahibinin arşivi (ART_LICENSES.md). */
export const VISION_CATS = {"basari": "Kariyer ve başarı", "stil": "Alışveriş ve stil", "guzellik": "Güzellik ve bakım", "sevgi": "Aşk ve ilişki", "seyahat": "Seyahat", "luks": "Araba ve özgürlük", "saglik": "Sağlık ve beslenme", "huzur": "Huzur ve çiçekler", "doga": "Doğa", "ev": "Ev", "ogrenme": "Öğrenme", "sanat": "Sanat ve eğlence", "sehir": "Şehir"} as const;

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
  "src": "/vision/basari-1.webp",
  "cat": "basari",
  "alt": "MacBook Pro, white ceramic mug,and black smartphone on table",
  "credit": "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/basari-2.webp",
  "cat": "basari",
  "alt": "brown wooden table and chairs",
  "credit": "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/basari-3.webp",
  "cat": "basari",
  "alt": "a woman in a graduation cap and gown",
  "credit": "https://images.unsplash.com/photo-1623461487986-9400110de28e",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/basari-4.webp",
  "cat": "basari",
  "alt": "A graduate throws cap in the air on a road",
  "credit": "https://images.unsplash.com/photo-1770223859888-0afec016dc56",
  "w": 640,
  "h": 820
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
  "src": "/vision/sevgi-1.webp",
  "cat": "sevgi",
  "alt": "four friends laughing and high fiving over coffee",
  "credit": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sevgi-2.webp",
  "cat": "sevgi",
  "alt": "People enjoying a candlelit dinner at a dimly lit restaurant",
  "credit": "https://images.unsplash.com/photo-1778694277039-5cbf0b9a1fcf",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sevgi-3.webp",
  "cat": "sevgi",
  "alt": "man carrying woman and kiss under clear blue sky",
  "credit": "https://images.unsplash.com/photo-1559435578-231f6137aac5",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sevgi-4.webp",
  "cat": "sevgi",
  "alt": "two people sitting on a bench in the snow",
  "credit": "https://images.unsplash.com/photo-1692780289940-909b778a7906",
  "w": 640,
  "h": 820
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
  "src": "/vision/seyahat-1.webp",
  "cat": "seyahat",
  "alt": "The Pont Alexandre III bridge illuminated at night in Paris, France",
  "credit": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-2.webp",
  "cat": "seyahat",
  "alt": "Eiffel tower view from a parisian street cafe",
  "credit": "https://images.unsplash.com/photo-1766773549088-62b781012d36",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-3.webp",
  "cat": "seyahat",
  "alt": "a bunch of hot air balloons flying in the sky",
  "credit": "https://images.unsplash.com/photo-1695415683093-ae5f213ea898",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-4.webp",
  "cat": "seyahat",
  "alt": "Many hot air balloons floating over the rocky landscape of Cappadocia ",
  "credit": "https://images.unsplash.com/photo-1787117230742-4ca4f2ac8bfa",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-5.webp",
  "cat": "seyahat",
  "alt": "white and blue concrete building near body of water during daytime",
  "credit": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-6.webp",
  "cat": "seyahat",
  "alt": "White buildings with blue domes overlook the ocean in santorini",
  "credit": "https://images.unsplash.com/photo-1783442828255-cd8ea1f13750",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-7.webp",
  "cat": "seyahat",
  "alt": "Rialto Bridge, Venice Italy",
  "credit": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/seyahat-8.webp",
  "cat": "seyahat",
  "alt": "Gondolas on water with historic buildings and seagull",
  "credit": "https://images.unsplash.com/photo-1767738912443-46be91790af7",
  "w": 640,
  "h": 820
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
  "src": "/vision/saglik-1.webp",
  "cat": "saglik",
  "alt": "silhouette photography of woman doing yoga",
  "credit": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/saglik-2.webp",
  "cat": "saglik",
  "alt": "woman doing yoga meditation on brown parquet flooring",
  "credit": "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/saglik-3.webp",
  "cat": "saglik",
  "alt": "A man running down a street next to a fountain",
  "credit": "https://images.unsplash.com/photo-1727094141271-9bea5bc8c757",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/saglik-4.webp",
  "cat": "saglik",
  "alt": "A woman running a race with blurred background",
  "credit": "https://images.unsplash.com/photo-1758506971649-7063f5518cf3",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/saglik-5.webp",
  "cat": "saglik",
  "alt": "fruit lot on ceramic plate",
  "credit": "https://images.unsplash.com/photo-1467453678174-768ec283a940",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/saglik-6.webp",
  "cat": "saglik",
  "alt": "A variety of healthy breakfast bowls and dishes",
  "credit": "https://images.unsplash.com/photo-1767277672167-18105701959b",
  "w": 640,
  "h": 820
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
  "src": "/vision/huzur-1.webp",
  "cat": "huzur",
  "alt": "person reading book on brown and beige textile",
  "credit": "https://images.unsplash.com/photo-1630343710506-89f8b9f21d31",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/huzur-2.webp",
  "cat": "huzur",
  "alt": "Cozy living room with fireplace and two armchairs",
  "credit": "https://images.unsplash.com/photo-1773847400278-3b409bd5aa76",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/huzur-3.webp",
  "cat": "huzur",
  "alt": "green plant in white ceramic mug beside window",
  "credit": "https://images.unsplash.com/photo-1590243014495-5491de7112a7",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/huzur-4.webp",
  "cat": "huzur",
  "alt": "white ceramic teacup on saucer on brown wooden table",
  "credit": "https://images.unsplash.com/photo-1600181718409-9fe89f2a6fce",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/huzur-5.webp",
  "cat": "huzur",
  "alt": "white and blue knit textile",
  "credit": "https://images.unsplash.com/photo-1600369672770-985fd30004eb",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/huzur-6.webp",
  "cat": "huzur",
  "alt": "Woman in a sweater resting on a chair",
  "credit": "https://images.unsplash.com/photo-1762803841292-4bd571730968",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/doga-1.webp",
  "cat": "doga",
  "alt": "a group of pine trees covered in snow",
  "credit": "https://images.unsplash.com/photo-1675373420153-809b8d1da50c",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/doga-2.webp",
  "cat": "doga",
  "alt": "Snow-covered pine trees with sunlight filtering through",
  "credit": "https://images.unsplash.com/photo-1763906478076-bcf5d1d3047f",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/doga-3.webp",
  "cat": "doga",
  "alt": "seashore during golden hour",
  "credit": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/doga-4.webp",
  "cat": "doga",
  "alt": "Ocean waves at sunset with warm orange sky",
  "credit": "https://images.unsplash.com/photo-1773820681050-0a836221436a",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/doga-5.webp",
  "cat": "doga",
  "alt": "silhouette of trees near Aurora Borealis at night",
  "credit": "https://images.unsplash.com/photo-1483347756197-71ef80e95f73",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/doga-6.webp",
  "cat": "doga",
  "alt": "Aurora borealis illuminates dark night sky over ocean and cliffs",
  "credit": "https://images.unsplash.com/photo-1780590128863-4c1b4a087fc3",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ev-1.webp",
  "cat": "ev",
  "alt": "a living room filled with furniture and a large window",
  "credit": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ev-2.webp",
  "cat": "ev",
  "alt": "Cozy living room with sectional sofa and fireplace",
  "credit": "https://images.unsplash.com/photo-1770736158887-9a0f3702416e",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ev-3.webp",
  "cat": "ev",
  "alt": "shallow photography of leaves",
  "credit": "https://images.unsplash.com/photo-1503149779833-1de50ebe5f8a",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ev-4.webp",
  "cat": "ev",
  "alt": "Young plants growing in pots on a sunny windowsill",
  "credit": "https://images.unsplash.com/photo-1768407313710-9fb5f82c63d6",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ogrenme-1.webp",
  "cat": "ogrenme",
  "alt": "pile of open paperback books",
  "credit": "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ogrenme-2.webp",
  "cat": "ogrenme",
  "alt": "Open books and hanging light bulbs create a unique display",
  "credit": "https://images.unsplash.com/photo-1780535196998-ffca01a77055",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ogrenme-3.webp",
  "cat": "ogrenme",
  "alt": "a close up of a piano with a person in the background",
  "credit": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/ogrenme-4.webp",
  "cat": "ogrenme",
  "alt": "A miniature grand piano with a bench",
  "credit": "https://images.unsplash.com/photo-1762463554991-63cce82d6dea",
  "w": 640,
  "h": 820
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
 },
 {
  "src": "/vision/sanat-1.webp",
  "cat": "sanat",
  "alt": "assorted-color paintbrushes",
  "credit": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sanat-2.webp",
  "cat": "sanat",
  "alt": "Messy artist's workspace filled with art supplies",
  "credit": "https://images.unsplash.com/photo-1784386178066-5ec051949ead",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sanat-3.webp",
  "cat": "sanat",
  "alt": "black and gray Canon camera on white surface",
  "credit": "https://images.unsplash.com/photo-1516961642265-531546e84af2",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sanat-4.webp",
  "cat": "sanat",
  "alt": "Medium format camera focused on rippling water",
  "credit": "https://images.unsplash.com/photo-1763315152539-06fc234b526c",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sehir-1.webp",
  "cat": "sehir",
  "alt": "The Maiden Tower on the Bosphorus in Istanbul under a vibrant orange s",
  "credit": "https://images.unsplash.com/photo-1636537511494-c3e558e0702b",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sehir-2.webp",
  "cat": "sehir",
  "alt": "top view photography of lighted city",
  "credit": "https://images.unsplash.com/photo-1518084823714-2f59a7315a39",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sehir-3.webp",
  "cat": "sehir",
  "alt": "The Williamsburg Bridge illuminated at night with the New York City sk",
  "credit": "https://images.unsplash.com/photo-1518391846015-55a9cc003b25",
  "w": 640,
  "h": 820
 },
 {
  "src": "/vision/sehir-4.webp",
  "cat": "sehir",
  "alt": "Christmas tree on snowy city street with buildings",
  "credit": "https://images.unsplash.com/photo-1758229561242-9b9f1c1a00f7",
  "w": 640,
  "h": 820
 }
];
