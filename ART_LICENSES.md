# Görsel kaynaklar ve lisanslar

Aeternum'daki tüm boyama resimleri, çıkartmalar, arka planlar ve ikonlar bu proje için
sıfırdan üretilmiştir. Başka bir kaynaktan alınmış görsel yoktur.

| Ne | Nerede | Nasıl üretildi | Lisans |
|---|---|---|---|
| 13 boyama resmi (mandalalar, kış kasabası, deniz feneri, kitaplık, çay köşesi, şömine başında kedi, orman evi, kış buketi, baykuş, çelenk, çiçekli pencere) | `public/art/*.json`, `public/art/thumbs/*.webp` | `scripts/art/scenes.py` (Python + Shapely ile geometrik çizim) | CC0 / kamu malı |
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
