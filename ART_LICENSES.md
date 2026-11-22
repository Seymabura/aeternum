# Görsel kaynaklar ve lisanslar

Aeternum'daki tüm boyama resimleri, çıkartmalar, arka planlar ve ikonlar bu proje için
sıfırdan üretilmiştir. Başka bir kaynaktan alınmış görsel yoktur.

| Ne | Nerede | Nasıl üretildi | Lisans |
|---|---|---|---|
| Boyama resimleri (Karlı İstanbul, Şömine Başında Kedi, Karlı Köy Gecesi, Pencere Kenarında Çay, Kış Mandalası) | `public/art/*.json`, `public/art/thumbs/*.webp` | Site sahibinin ChatGPT hesabıyla, bu proje için yazılan promptlarla üretilen çizgi çizimler; `scripts/art/vectorize.py` ile vektöre ve boyanabilir bölgelere çevrildi | Site sahibine ait (OpenAI kullanım koşullarına göre üretilen içeriğin hakları kullanıcıya aittir) |
| (Eski, kullanılmayan) geometrik resim üreticisi | `scripts/art/scenes.py` | Python + Shapely | CC0 / kamu malı |
| 21 çıkartma | `public/stickers/*.svg` | `scripts/stickers.py` | CC0 / kamu malı |
| Dilek panosu arka planları | `lib/board/backgrounds.ts` | Tarayıcıda kodla çizilir | CC0 / kamu malı |
| Mum logosu, favicon | `components/logo.tsx`, `public/icon.svg` | Elle yazılmış SVG | CC0 / kamu malı |

## Yazı tipleri (SIL Open Font License 1.1)
- Fraunces — Undercase Type (`@fontsource-variable/fraunces`)
- Caveat — Impallari Type (`@fontsource/caveat`)
- Dancing Script — Impallari Type (`@fontsource/dancing-script`)
- Patrick Hand — Patrick Wagesreiter (`@fontsource/patrick-hand`)

## İkonlar
- Lucide (`lucide-react`) — ISC lisansı

Yeni resim eklerken: dışarıdan alınan her görselin kaynağı ve lisansı (yalnızca CC0 / kamu malı)
bu tabloya eklenmelidir.

## Biz bölümü

- **Ay dokusu** (`public/moon/lroc-2k.webp`, `public/moon/full-520.png`): NASA Goddard Scientific Visualization Studio, *CGI Moon Kit* — LRO Wide Angle Camera renk mozaiği (`lroc_color_poles_2k.tif`), https://svs.gsfc.nasa.gov/4720. NASA görselleri kamu malıdır (public domain). WebP'ye yeniden kodlandı.
- **Yıldız ve takımyıldız verisi** (`public/sky/*.json`): d3-celestial, © 2015 Olaf Frohn, BSD-3-Clause lisansı (https://github.com/ofrohn/d3-celestial). Kaynak veriler: Hipparcos/Yale Bright Star katalogları. `scripts/sky/build.mjs` ile küçültüldü.
- **Gökbilim hesapları**: astronomy-engine, © Don Cross, MIT lisansı (https://github.com/cosinekitty/astronomy).
- **Şehir arama**: Open-Meteo Geocoding API (CC BY 4.0, GeoNames verisi).

## Vision board kütüphanesi (site sahibinin arşivi)
`public/vision/*.webp` dosyalarının tamamı site sahibinin verdiği klasörden alındı (Kasım 2026). Kaynakları (çoğu Pinterest) ve kullanım hakları doğrulanmadı; hak sahibi talep ederse `lib/vision-library.ts` içinden ilgili satır ve dosya kaldırılmalıdır.


## Vision board temaları ve süsleri
`public/vision/tema/*.svg` ve `public/vision/sus/*.svg` bu proje için kodla çizildi.
