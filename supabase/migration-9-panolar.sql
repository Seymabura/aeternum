-- Vision board 2.0: birden fazla pano, pano boyutları, kendi süsleri
create table if not exists public.vision_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null default 'Panom' check (char_length(name) between 1 and 40),
  format text not null default 'telefon' check (format in ('telefon','tablet-dikey','tablet-yatay','masaustu','ig-kare','ig-hikaye','x')),
  bg text not null default 'sampanya' check (bg ~ '^[a-z0-9-]{2,24}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vision_boards_user on public.vision_boards(user_id, updated_at desc);
alter table public.vision_boards enable row level security;
drop policy if exists "pano kendi" on public.vision_boards;
create policy "pano kendi" on public.vision_boards for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.vision_boards to authenticated;

-- kullanıcı başına en fazla 20 pano
create or replace function public.ae_board_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from vision_boards where user_id = new.user_id) >= 20 then
    raise exception 'Pano sınırı' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists ae_board_limit on public.vision_boards;
create trigger ae_board_limit before insert on public.vision_boards for each row execute function public.ae_board_limit();

alter table public.vision_items add column if not exists board_id uuid references public.vision_boards(id) on delete cascade;
create index if not exists vision_items_board on public.vision_items(board_id);

-- eski parçaları "İlk panom"a taşı
insert into public.vision_boards (user_id, name, format, bg)
select distinct v.user_id, 'İlk panom', 'telefon', coalesce(nullif(p.vision_bg, ''), 'sampanya')
from public.vision_items v left join public.profiles p on p.id = v.user_id
where v.board_id is null
  and not exists (select 1 from public.vision_boards b where b.user_id = v.user_id);
update public.vision_items v set board_id = (select b.id from public.vision_boards b where b.user_id = v.user_id order by b.created_at limit 1)
where v.board_id is null;
-- kaldırılan hazır süsler
delete from public.vision_items where src like '/vision/sus/%';

-- pano başına 60 parça + pano sahibinin kontrolü + pano tarihini güncelle
create or replace function public.ae_vision_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.board_id is null or not exists (select 1 from vision_boards where id = new.board_id and user_id = new.user_id) then
    raise exception 'Pano bulunamadı' using errcode = 'P0001';
  end if;
  if (select count(*) from vision_items where board_id = new.board_id) >= 60 then
    raise exception 'Pano dolu' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists ae_vision_limit on public.vision_items;
create trigger ae_vision_limit before insert on public.vision_items for each row execute function public.ae_vision_limit();

create or replace function public.ae_board_touch() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update vision_boards set updated_at = now() where id = coalesce(new.board_id, old.board_id);
  return null;
end $$;
drop trigger if exists ae_board_touch on public.vision_items;
create trigger ae_board_touch after insert or update or delete on public.vision_items for each row execute function public.ae_board_touch();

-- kendi süsleri için 5 MB
update storage.buckets set file_size_limit = 5242880 where id = 'uploads';
