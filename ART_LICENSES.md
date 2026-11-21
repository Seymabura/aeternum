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
