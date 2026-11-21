-- Aeternum · Wishlist ve kısa film kaldırıldı (22 Kasım 2026)
-- Kullanıcı verisi kaybolmasın diye tablolar SİLİNMEDİ:
--   wish_items (kind = 'istek' satırları artık kullanılmıyor; kind = 'hedef' Vision board'da kullanılıyor)
--   shares (kind = 'film' satırları artık açılmıyor; /s/film/* "kullanılmıyor" sayfası gösterir)
-- İleride temizlik için: supabase/temizlik-film-wishlist.sql (ONAYLI, elle çalıştırılır)
comment on table public.wish_items is 'kind=hedef: Vision board 2027 hedefleri. kind=istek: kaldırılan wishlist (22.11.2026), temizlenebilir.';
