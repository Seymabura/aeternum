-- Aeternum · Kasım önizlemesini kapat (25 Kasım 2026'da çalıştırıldı)
-- Görevler 1 Aralık 00:00'dan (Türkiye) itibaren her gün bir tane açılır.
update public.app_config set value = '0' where key = 'preview_all';
