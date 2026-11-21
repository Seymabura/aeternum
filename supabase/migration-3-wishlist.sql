-- Aeternum · 3. kısım: görselli wishlist
alter table public.wish_items add column if not exists image_url text check (char_length(image_url) <= 800);
alter table public.wish_items add column if not exists store text check (char_length(store) <= 60);
alter table public.wish_items add column if not exists fav boolean not null default false;
