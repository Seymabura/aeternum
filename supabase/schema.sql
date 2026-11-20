-- =====================================================================
-- Aeternum veritabanı şeması
-- Supabase > SQL Editor'a yapıştırıp bir kez çalıştırılır (tekrar çalıştırmak güvenli).
--
-- Güvenlik fikri:
--  * Herkes yalnızca kendi satırlarını görür/değiştirir (Row Level Security).
--  * "Bugün hangi kutu açık?" kararı VERİTABANINDA, Türkiye saatiyle verilir.
--    Telefonunun saatini ileri alan biri gelecek kutuyu açamaz.
-- =====================================================================

-- ---------------------------------------------------------------- ayarlar
create table if not exists public.app_config (
  key text primary key,
  value text not null
);
alter table public.app_config enable row level security;  -- politikası yok: dışarıdan okunamaz/yazılamaz

insert into public.app_config(key, value) values
  ('event_year', '2026'),
  ('day_offset', '0')   -- sadece test için: gün kaydırma (yayında 0 kalmalı)
on conflict (key) do nothing;

-- Bugünün indeksi: Aralık öncesi 0 (hazırlık), 1-31 Aralık günü, sonrası 32
create or replace function public.ae_today_index()
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  y int;
  off int;
  d date;
begin
  select value::int into y from app_config where key = 'event_year';
  select value::int into off from app_config where key = 'day_offset';
  d := (now() at time zone 'Europe/Istanbul')::date + coalesce(off, 0);
  if d < make_date(y, 12, 1) then
    return 0;
  elsif d > make_date(y, 12, 31) then
    return 32;
  end if;
  return extract(day from d)::int;
end;
$$;
grant execute on function public.ae_today_index() to anon, authenticated;

-- ---------------------------------------------------------------- profiller
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  email_reminders boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profil kendi" on public.profiles;
create policy "profil kendi" on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function public.ae_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name',
                  new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 40)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ae_on_auth_user_created on auth.users;
create trigger ae_on_auth_user_created
  after insert on auth.users
  for each row execute function public.ae_handle_new_user();

-- ---------------------------------------------------------------- günlük görevler
create table if not exists public.task_entries (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  day smallint not null check (day between 1 and 31),
  answer jsonb not null check (pg_column_size(answer) < 20000),
  photo_path text,
  completed_at timestamptz not null default now(),
  on_time boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.task_entries enable row level security;

drop policy if exists "gorev kendi" on public.task_entries;
create policy "gorev kendi" on public.task_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.ae_task_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  today int := public.ae_today_index();
begin
  if tg_op = 'INSERT' then
    if new.day > today then
      raise exception 'Bu kutu henüz açılmadı' using errcode = 'P0001';
    end if;
    new.completed_at := now();
    new.on_time := (new.day = today);
  else
    -- tamamlanma zamanı ve seri bilgisi sonradan değiştirilemez
    new.user_id := old.user_id;
    new.day := old.day;
    new.completed_at := old.completed_at;
    new.on_time := old.on_time;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ae_task_guard on public.task_entries;
create trigger ae_task_guard
  before insert or update on public.task_entries
  for each row execute function public.ae_task_guard();

-- ---------------------------------------------------------------- küçük emekler (bonus)
create table if not exists public.bonus_defs (
  id smallint primary key,
  open_day smallint not null
);
alter table public.bonus_defs enable row level security;
drop policy if exists "bonus herkes okur" on public.bonus_defs;
create policy "bonus herkes okur" on public.bonus_defs for select using (true);

insert into public.bonus_defs(id, open_day) values
  (1, 0), (2, 0), (3, 0),
  (4, 2), (5, 4), (6, 6), (7, 8), (8, 10), (9, 12), (10, 14),
  (11, 16), (12, 18), (13, 20), (14, 22), (15, 24), (16, 26), (17, 28)
on conflict (id) do update set open_day = excluded.open_day;

create table if not exists public.bonus_entries (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  bonus_id smallint not null references public.bonus_defs(id),
  answer text not null check (char_length(answer) between 1 and 280),
  completed_at timestamptz not null default now(),
  primary key (user_id, bonus_id)
);
alter table public.bonus_entries enable row level security;

drop policy if exists "bonus kendi" on public.bonus_entries;
create policy "bonus kendi" on public.bonus_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.ae_bonus_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  od int;
begin
  select open_day into od from bonus_defs where id = new.bonus_id;
  if od is null or od > public.ae_today_index() then
    raise exception 'Bu küçük emek henüz açılmadı' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;
    new.bonus_id := old.bonus_id;
    new.completed_at := old.completed_at;
  else
    new.completed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists ae_bonus_guard on public.bonus_entries;
create trigger ae_bonus_guard
  before insert or update on public.bonus_entries
  for each row execute function public.ae_bonus_guard();

-- Kişinin "emek" puanı: 1 (hediye) + görevler + küçük emekler, en fazla 32
create or replace function public.ae_effort(uid uuid default auth.uid())
returns int
language sql
stable
security definer
set search_path = public
as $$
  select least(32,
    1 + (select count(*) from task_entries where user_id = uid)
      + (select count(*) from bonus_entries where user_id = uid))::int
  where uid = auth.uid();
$$;
grant execute on function public.ae_effort(uuid) to authenticated;

-- ---------------------------------------------------------------- boyamalar
create table if not exists public.colorings (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  image_id text not null check (char_length(image_id) <= 64),
  fills jsonb not null default '{}'::jsonb check (pg_column_size(fills) < 120000),
  strokes jsonb not null default '[]'::jsonb check (pg_column_size(strokes) < 600000),
  updated_at timestamptz not null default now(),
  primary key (user_id, image_id)
);
alter table public.colorings enable row level security;

drop policy if exists "boyama kendi" on public.colorings;
create policy "boyama kendi" on public.colorings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- dilek panosu
create table if not exists public.boards (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 400000),
  updated_at timestamptz not null default now()
);
alter table public.boards enable row level security;

drop policy if exists "pano kendi" on public.boards;
create policy "pano kendi" on public.boards
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- dosya deposu
-- Gizli kova: yol "kullanici-id/..." şeklinde, herkes sadece kendi klasörüne erişir.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "uploads kendi okur" on storage.objects;
create policy "uploads kendi okur" on storage.objects
  for select to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "uploads kendi yazar" on storage.objects;
create policy "uploads kendi yazar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "uploads kendi günceller" on storage.objects;
create policy "uploads kendi günceller" on storage.objects
  for update to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "uploads kendi siler" on storage.objects;
create policy "uploads kendi siler" on storage.objects
  for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------- API erişim izinleri
-- (Yeni Supabase projelerinde tablolar otomatik açılmıyor; RLS yine her satırı korur.)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.task_entries, public.bonus_entries,
  public.colorings, public.boards to authenticated;
grant select on public.bonus_defs to anon, authenticated;

-- ---------------------------------------------------------------- hesap silme (KVKK)
-- Kullanıcı önce kendi dosyalarını siler (depo politikası izin verir), sonra bu fonksiyonla
-- hesabını siler. Diğer tüm tablolar "on delete cascade" ile birlikte silinir.
create or replace function public.ae_delete_me()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Oturum yok';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.ae_delete_me() from public, anon;
grant execute on function public.ae_delete_me() to authenticated;
