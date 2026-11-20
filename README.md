# Aeternum ✨🕯️

> Bu yıldan sonsuza kalanlar.

Yılbaşına kadar her gün küçük bir görev: resmini boya, dilek panonu doldur, anılarını biriktir.

## Çalıştırma (Windows)
- `baslat.cmd` dosyasına çift tıkla. İlk seferde paketleri kurar, sonra tarayıcıda `localhost:3000` açılır.
- GitHub'a göndermek için `github-gonder.cmd` dosyasına çift tıkla.

## Yapı
| Klasör | Ne var |
|---|---|
| `app/` | Sayfalar: ana sayfa, giriş, takvim, boyama, dilek panosu, profil, gizlilik, KVKK |
| `app/actions/` | Sunucu işlemleri (görev kaydetme, boyama, pano, hesap) |
| `lib/tasks.ts` | 31 günlük görev ve küçük emekler |
| `supabase/schema.sql` | Veritabanı tabloları, güvenlik kuralları, tarih kilidi |
| `scripts/art/` | Boyama resimlerini üreten program (`python3 scripts/art/scenes.py`) |
| `public/art/` | Üretilmiş boyama resimleri |

## Güvenlik
- Kutuların açılma kontrolü veritabanında, Türkiye saatiyle yapılır (`ae_today_index`).
- Her tablo Row Level Security ile korunur: herkes yalnızca kendi verisini görür.
- Fotoğraflar gizli depoda, kişiye özel süreli linklerle gösterilir.

Görsel lisansları: `ART_LICENSES.md`
