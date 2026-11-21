-- =====================================================================
-- Aeternum · 2. kısım: Wishlist, Vision board, Mesaj küresi
-- (schema.sql'den sonra çalıştırılır; tekrar çalıştırmak güvenli)
-- =====================================================================

-- ---------------------------------------------------------------- wishlist
create table if not exists public.wish_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('istek', 'hedef')),
  title text not null check (char_length(title) between 1 and 140),
  note text check (char_length(note) <= 500),
  url text check (char_length(url) <= 500),
  price text check (char_length(price) <= 40),
  category text check (char_length(category) <= 30),
  done boolean not null default false,
  position double precision not null default extract(epoch from now()),
  created_at timestamptz not null default now()
);
create index if not exists wish_items_user on public.wish_items(user_id, kind, position);
alter table public.wish_items enable row level security;
drop policy if exists "wish kendi" on public.wish_items;
create policy "wish kendi" on public.wish_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- kişi başı en fazla 300 madde
create or replace function public.ae_wish_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from wish_items where user_id = new.user_id) >= 300 then
    raise exception 'Liste dolu' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists ae_wish_limit on public.wish_items;
create trigger ae_wish_limit before insert on public.wish_items for each row execute function public.ae_wish_limit();

-- ---------------------------------------------------------------- vision board
create table if not exists public.vision_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('image', 'word')),
  src text check (char_length(src) <= 300),          -- /vision/... (kütüphane) ya da uploads yolu
  text text check (char_length(text) <= 80),
  tone text check (char_length(tone) <= 20),         -- kelime kartı rengi
  size text not null default 'm' check (size in ('s', 'm', 'l')),
  position double precision not null default extract(epoch from now()),
  created_at timestamptz not null default now()
);
create index if not exists vision_items_user on public.vision_items(user_id, position);
alter table public.vision_items enable row level security;
drop policy if exists "vision kendi" on public.vision_items;
create policy "vision kendi" on public.vision_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.ae_vision_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from vision_items where user_id = new.user_id) >= 60 then
    raise exception 'Pano dolu' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists ae_vision_limit on public.vision_items;
create trigger ae_vision_limit before insert on public.vision_items for each row execute function public.ae_vision_limit();

-- ---------------------------------------------------------------- mesaj küresi (zaman kapsülü)
-- Mesaj kapatıldıktan sonra 31 Aralık 2027'ye kadar KİMSE okuyamaz (sahibi de).
-- Tabloya doğrudan okuma izni yok; sadece aşağıdaki fonksiyonlar kullanılır.
create table if not exists public.capsules (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  message text not null check (char_length(message) between 1 and 6000),
  email text check (email is null or (char_length(email) <= 200 and email like '%@%.%')),
  sealed_at timestamptz not null default now(),
  opens_at date not null default date '2027-12-31',
  sent_at timestamptz
);
alter table public.capsules enable row level security;
-- (politika yok: dışarıdan okunamaz/yazılamaz)

create or replace function public.ae_capsule_seal(msg text, mail text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Oturum yok'; end if;
  if exists (select 1 from capsules where user_id = auth.uid()) then
    raise exception 'Küre zaten kapatıldı' using errcode = 'P0001';
  end if;
  insert into capsules(user_id, message, email) values (auth.uid(), left(trim(msg), 6000), nullif(trim(mail), ''));
end;
$$;

create or replace function public.ae_capsule_status()
returns table(sealed_at timestamptz, opens_at date, chars int, has_email boolean)
language sql stable security definer set search_path = public as $$
  select sealed_at, opens_at, char_length(message), email is not null from capsules where user_id = auth.uid();
$$;

create or replace function public.ae_capsule_open()
returns text language plpgsql stable security definer set search_path = public as $$
declare m text;
begin
  select message into m from capsules
   where user_id = auth.uid() and (now() at time zone 'Europe/Istanbul')::date >= opens_at;
  return m;
end;
$$;

revoke all on function public.ae_capsule_seal(text, text) from public, anon;
revoke all on function public.ae_capsule_status() from public, anon;
revoke all on function public.ae_capsule_open() from public, anon;
grant execute on function public.ae_capsule_seal(text, text) to authenticated;
grant execute on function public.ae_capsule_status() to authenticated;
grant execute on function public.ae_capsule_open() to authenticated;

grant select, insert, update, delete on public.wish_items, public.vision_items to authenticated;
