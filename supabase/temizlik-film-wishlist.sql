-- Aeternum · TEK SEFERLİK TEMİZLİK (geri alınamaz)
-- Bu dosya otomatik çalıştırılmaz. Çalıştırmadan önce yedek al ve içeriği oku.
-- 1) Kısa film paylaşımlarının herkese açık fotoğrafları ve bağlantıları
-- 2) Wishlist ürünleri ve görselleri

begin;

-- 1a) film paylaşımlarındaki dosyalar ('shared' bucket, <kullanıcı>/film/...)
delete from storage.objects
where bucket_id = 'shared' and name like '%/film/%';

-- 1b) film paylaşım satırları
delete from public.shares where kind = 'film';

-- 2a) wishlist görselleri ('uploads' bucket, <kullanıcı>/wish/...)
delete from storage.objects
where bucket_id = 'uploads' and name like '%/wish/%';

-- 2b) wishlist ürünleri (2027 hedeflerine DOKUNMAZ)
delete from public.wish_items where kind = 'istek';

-- Sonuçları kontrol et; doğruysa COMMIT, değilse ROLLBACK yaz.
-- commit;
rollback;
