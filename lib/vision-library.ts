/** Vision board kütüphanesi: Unsplash lisanslı ücretsiz görseller (kaynaklar ART_LICENSES.md). */
export const VISION_CATS = {"seyahat": "Seyahat", "huzur": "Huzur", "doga": "Doğa", "ev": "Ev", "basari": "Başarı", "saglik": "Sağlık", "sevgi": "Sevgi", "ogrenme": "Öğrenme", "sanat": "Sanat", "sehir": "Şehir"} as const;

export type VisionCat = keyof typeof VISION_CATS;

export const VISION_LIBRARY: { src: string; cat: VisionCat; alt: string; credit: string }[] = [
 {
  "src": "/vision/seyahat-1.webp",
  "cat": "seyahat",
  "alt": "The Pont Alexandre III bridge illuminated at night in Paris, France",
  "credit": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a"
 },
 {
  "src": "/vision/seyahat-2.webp",
  "cat": "seyahat",
  "alt": "Eiffel tower view from a parisian street cafe",
  "credit": "https://images.unsplash.com/photo-1766773549088-62b781012d36"
 },
 {
  "src": "/vision/seyahat-3.webp",
  "cat": "seyahat",
  "alt": "a bunch of hot air balloons flying in the sky",
  "credit": "https://images.unsplash.com/photo-1695415683093-ae5f213ea898"
 },
 {
  "src": "/vision/seyahat-4.webp",
  "cat": "seyahat",
  "alt": "Many hot air balloons floating over the rocky landscape of Cappadocia ",
  "credit": "https://images.unsplash.com/photo-1787117230742-4ca4f2ac8bfa"
 },
 {
  "src": "/vision/seyahat-5.webp",
  "cat": "seyahat",
  "alt": "white and blue concrete building near body of water during daytime",
  "credit": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e"
 },
 {
  "src": "/vision/seyahat-6.webp",
  "cat": "seyahat",
  "alt": "White buildings with blue domes overlook the ocean in santorini",
  "credit": "https://images.unsplash.com/photo-1783442828255-cd8ea1f13750"
 },
 {
  "src": "/vision/seyahat-7.webp",
  "cat": "seyahat",
  "alt": "Rialto Bridge, Venice Italy",
  "credit": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9"
 },
 {
  "src": "/vision/seyahat-8.webp",
  "cat": "seyahat",
  "alt": "Gondolas on water with historic buildings and seagull",
  "credit": "https://images.unsplash.com/photo-1767738912443-46be91790af7"
 },
 {
  "src": "/vision/huzur-1.webp",
  "cat": "huzur",
  "alt": "person reading book on brown and beige textile",
  "credit": "https://images.unsplash.com/photo-1630343710506-89f8b9f21d31"
 },
 {
  "src": "/vision/huzur-2.webp",
  "cat": "huzur",
  "alt": "Cozy living room with fireplace and two armchairs",
  "credit": "https://images.unsplash.com/photo-1773847400278-3b409bd5aa76"
 },
 {
  "src": "/vision/huzur-3.webp",
  "cat": "huzur",
  "alt": "green plant in white ceramic mug beside window",
  "credit": "https://images.unsplash.com/photo-1590243014495-5491de7112a7"
 },
 {
  "src": "/vision/huzur-4.webp",
  "cat": "huzur",
  "alt": "white ceramic teacup on saucer on brown wooden table",
  "credit": "https://images.unsplash.com/photo-1600181718409-9fe89f2a6fce"
 },
 {
  "src": "/vision/huzur-5.webp",
  "cat": "huzur",
  "alt": "white and blue knit textile",
  "credit": "https://images.unsplash.com/photo-1600369672770-985fd30004eb"
 },
 {
  "src": "/vision/huzur-6.webp",
  "cat": "huzur",
  "alt": "Woman in a sweater resting on a chair",
  "credit": "https://images.unsplash.com/photo-1762803841292-4bd571730968"
 },
 {
  "src": "/vision/doga-1.webp",
  "cat": "doga",
  "alt": "a group of pine trees covered in snow",
  "credit": "https://images.unsplash.com/photo-1675373420153-809b8d1da50c"
 },
 {
  "src": "/vision/doga-2.webp",
  "cat": "doga",
  "alt": "Snow-covered pine trees with sunlight filtering through",
  "credit": "https://images.unsplash.com/photo-1763906478076-bcf5d1d3047f"
 },
 {
  "src": "/vision/doga-3.webp",
  "cat": "doga",
  "alt": "seashore during golden hour",
  "credit": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
 },
 {
  "src": "/vision/doga-4.webp",
  "cat": "doga",
  "alt": "Ocean waves at sunset with warm orange sky",
  "credit": "https://images.unsplash.com/photo-1773820681050-0a836221436a"
 },
 {
  "src": "/vision/doga-5.webp",
  "cat": "doga",
  "alt": "silhouette of trees near Aurora Borealis at night",
  "credit": "https://images.unsplash.com/photo-1483347756197-71ef80e95f73"
 },
 {
  "src": "/vision/doga-6.webp",
  "cat": "doga",
  "alt": "Aurora borealis illuminates dark night sky over ocean and cliffs",
  "credit": "https://images.unsplash.com/photo-1780590128863-4c1b4a087fc3"
 },
 {
  "src": "/vision/ev-1.webp",
  "cat": "ev",
  "alt": "a living room filled with furniture and a large window",
  "credit": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92"
 },
 {
  "src": "/vision/ev-2.webp",
  "cat": "ev",
  "alt": "Cozy living room with sectional sofa and fireplace",
  "credit": "https://images.unsplash.com/photo-1770736158887-9a0f3702416e"
 },
 {
  "src": "/vision/ev-3.webp",
  "cat": "ev",
  "alt": "shallow photography of leaves",
  "credit": "https://images.unsplash.com/photo-1503149779833-1de50ebe5f8a"
 },
 {
  "src": "/vision/ev-4.webp",
  "cat": "ev",
  "alt": "Young plants growing in pots on a sunny windowsill",
  "credit": "https://images.unsplash.com/photo-1768407313710-9fb5f82c63d6"
 },
 {
  "src": "/vision/basari-1.webp",
  "cat": "basari",
  "alt": "MacBook Pro, white ceramic mug,and black smartphone on table",
  "credit": "https://images.unsplash.com/photo-1499750310107-5fef28a66643"
 },
 {
  "src": "/vision/basari-2.webp",
  "cat": "basari",
  "alt": "brown wooden table and chairs",
  "credit": "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7"
 },
 {
  "src": "/vision/basari-3.webp",
  "cat": "basari",
  "alt": "a woman in a graduation cap and gown",
  "credit": "https://images.unsplash.com/photo-1623461487986-9400110de28e"
 },
 {
  "src": "/vision/basari-4.webp",
  "cat": "basari",
  "alt": "A graduate throws cap in the air on a road",
  "credit": "https://images.unsplash.com/photo-1770223859888-0afec016dc56"
 },
 {
  "src": "/vision/saglik-1.webp",
  "cat": "saglik",
  "alt": "silhouette photography of woman doing yoga",
  "credit": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"
 },
 {
  "src": "/vision/saglik-2.webp",
  "cat": "saglik",
  "alt": "woman doing yoga meditation on brown parquet flooring",
  "credit": "https://images.unsplash.com/photo-1506126613408-eca07ce68773"
 },
 {
  "src": "/vision/saglik-3.webp",
  "cat": "saglik",
  "alt": "A man running down a street next to a fountain",
  "credit": "https://images.unsplash.com/photo-1727094141271-9bea5bc8c757"
 },
 {
  "src": "/vision/saglik-4.webp",
  "cat": "saglik",
  "alt": "A woman running a race with blurred background",
  "credit": "https://images.unsplash.com/photo-1758506971649-7063f5518cf3"
 },
 {
  "src": "/vision/saglik-5.webp",
  "cat": "saglik",
  "alt": "fruit lot on ceramic plate",
  "credit": "https://images.unsplash.com/photo-1467453678174-768ec283a940"
 },
 {
  "src": "/vision/saglik-6.webp",
  "cat": "saglik",
  "alt": "A variety of healthy breakfast bowls and dishes",
  "credit": "https://images.unsplash.com/photo-1767277672167-18105701959b"
 },
 {
  "src": "/vision/sevgi-1.webp",
  "cat": "sevgi",
  "alt": "four friends laughing and high fiving over coffee",
  "credit": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59"
 },
 {
  "src": "/vision/sevgi-2.webp",
  "cat": "sevgi",
  "alt": "People enjoying a candlelit dinner at a dimly lit restaurant",
  "credit": "https://images.unsplash.com/photo-1778694277039-5cbf0b9a1fcf"
 },
 {
  "src": "/vision/sevgi-3.webp",
  "cat": "sevgi",
  "alt": "man carrying woman and kiss under clear blue sky",
  "credit": "https://images.unsplash.com/photo-1559435578-231f6137aac5"
 },
 {
  "src": "/vision/sevgi-4.webp",
  "cat": "sevgi",
  "alt": "two people sitting on a bench in the snow",
  "credit": "https://images.unsplash.com/photo-1692780289940-909b778a7906"
 },
 {
  "src": "/vision/ogrenme-1.webp",
  "cat": "ogrenme",
  "alt": "pile of open paperback books",
  "credit": "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38"
 },
 {
  "src": "/vision/ogrenme-2.webp",
  "cat": "ogrenme",
  "alt": "Open books and hanging light bulbs create a unique display",
  "credit": "https://images.unsplash.com/photo-1780535196998-ffca01a77055"
 },
 {
  "src": "/vision/ogrenme-3.webp",
  "cat": "ogrenme",
  "alt": "a close up of a piano with a person in the background",
  "credit": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0"
 },
 {
  "src": "/vision/ogrenme-4.webp",
  "cat": "ogrenme",
  "alt": "A miniature grand piano with a bench",
  "credit": "https://images.unsplash.com/photo-1762463554991-63cce82d6dea"
 },
 {
  "src": "/vision/sanat-1.webp",
  "cat": "sanat",
  "alt": "assorted-color paintbrushes",
  "credit": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b"
 },
 {
  "src": "/vision/sanat-2.webp",
  "cat": "sanat",
  "alt": "Messy artist's workspace filled with art supplies",
  "credit": "https://images.unsplash.com/photo-1784386178066-5ec051949ead"
 },
 {
  "src": "/vision/sanat-3.webp",
  "cat": "sanat",
  "alt": "black and gray Canon camera on white surface",
  "credit": "https://images.unsplash.com/photo-1516961642265-531546e84af2"
 },
 {
  "src": "/vision/sanat-4.webp",
  "cat": "sanat",
  "alt": "Medium format camera focused on rippling water",
  "credit": "https://images.unsplash.com/photo-1763315152539-06fc234b526c"
 },
 {
  "src": "/vision/sehir-1.webp",
  "cat": "sehir",
  "alt": "The Maiden Tower on the Bosphorus in Istanbul under a vibrant orange s",
  "credit": "https://images.unsplash.com/photo-1636537511494-c3e558e0702b"
 },
 {
  "src": "/vision/sehir-2.webp",
  "cat": "sehir",
  "alt": "top view photography of lighted city",
  "credit": "https://images.unsplash.com/photo-1518084823714-2f59a7315a39"
 },
 {
  "src": "/vision/sehir-3.webp",
  "cat": "sehir",
  "alt": "The Williamsburg Bridge illuminated at night with the New York City sk",
  "credit": "https://images.unsplash.com/photo-1518391846015-55a9cc003b25"
 },
 {
  "src": "/vision/sehir-4.webp",
  "cat": "sehir",
  "alt": "Christmas tree on snowy city street with buildings",
  "credit": "https://images.unsplash.com/photo-1758229561242-9b9f1c1a00f7"
 }
];
