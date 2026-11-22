-- Vision board stüdyosu: serbest yerleşim (konum, boyut, açı, katman, çerçeve, yazı tipi) + pano arka planı
alter table public.vision_items add column if not exists layout jsonb check (layout is null or pg_column_size(layout) < 600);
alter table public.profiles add column if not exists vision_bg text check (vision_bg is null or char_length(vision_bg) <= 20);
