-- Aeternum · "Biz" bölümü (sevgililer)
-- Ortak küre, ortak 2027 listesi, davetler ve paylaşım bağlantıları.
-- Supabase SQL Editor'de bir kez çalıştır.

-- ------------------------------------------------------------ tablolar
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'partner')),
  name text not null default '' check (char_length(name) <= 40),
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

create table if not exists public.couple_invites (
  code text primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz
);

create table if not exists public.couple_list (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  added_by uuid references auth.users(id) on delete set null default auth.uid(),
  done boolean not null default false,
  position double precision not null default extract(epoch from now()),
  created_at timestamptz not null default now()
);
create index if not exists couple_list_couple on public.couple_list(couple_id);

create table if not exists public.shares (
  token text primary key check (char_length(token) between 20 and 64),
  owner uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('ay', 'gok', 'film')),
  payload jsonb not null check (pg_column_size(payload) < 32768),
  files text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists shares_owner on public.shares(owner);

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.couple_list enable row level security;
alter table public.shares enable row level security;

-- ------------------------------------------------------------ yardımcı
create or replace function public.ae_my_couple()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from couple_members where user_id = auth.uid() limit 1;
$$;
revoke all on function public.ae_my_couple() from public, anon;
grant execute on function public.ae_my_couple() to authenticated;

-- ------------------------------------------------------------ politikalar
drop policy if exists "cift gor" on public.couples;
create policy "cift gor" on public.couples for select to authenticated using (id = public.ae_my_couple());

drop policy if exists "uyeler gor" on public.couple_members;
create policy "uyeler gor" on public.couple_members for select to authenticated using (couple_id = public.ae_my_couple());

-- davetlere doğrudan erişim yok (sadece RPC)

drop policy if exists "liste gor" on public.couple_list;
create policy "liste gor" on public.couple_list for select to authenticated using (couple_id = public.ae_my_couple());
drop policy if exists "liste ekle" on public.couple_list;
create policy "liste ekle" on public.couple_list for insert to authenticated
  with check (couple_id = public.ae_my_couple() and added_by = auth.uid());
drop policy if exists "liste guncelle" on public.couple_list;
create policy "liste guncelle" on public.couple_list for update to authenticated
  using (couple_id = public.ae_my_couple()) with check (couple_id = public.ae_my_couple());
drop policy if exists "liste sil" on public.couple_list;
create policy "liste sil" on public.couple_list for delete to authenticated using (couple_id = public.ae_my_couple());

drop policy if exists "paylasim sahibi" on public.shares;
create policy "paylasim sahibi" on public.shares for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

grant select on public.couples, public.couple_members to authenticated;
grant select, insert, update, delete on public.couple_list, public.shares to authenticated;

-- liste sınırı
create or replace function public.ae_couple_list_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from couple_list where couple_id = new.couple_id) >= 200 then
    raise exception 'Liste dolu (200)';
  end if;
  return new;
end;
$$;
drop trigger if exists couple_list_limit on public.couple_list;
create trigger couple_list_limit before insert on public.couple_list for each row execute function public.ae_couple_list_limit();

-- paylaşım sınırı (kişi başı 30)
create or replace function public.ae_shares_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from shares where owner = new.owner) >= 30 then
    raise exception 'En fazla 30 bağlantı oluşturabilirsin';
  end if;
  return new;
end;
$$;
drop trigger if exists shares_limit on public.shares;
create trigger shares_limit before insert on public.shares for each row execute function public.ae_shares_limit();

-- ------------------------------------------------------------ RPC: davet / katılma / ayrılma
create or replace function public.ae_couple_invite(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  cid uuid;
  c text;
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i int;
begin
  if me is null then raise exception 'Oturum yok'; end if;
  cid := ae_my_couple();
  if cid is null then
    insert into couples (created_by) values (me) returning id into cid;
    insert into couple_members (couple_id, user_id, role, name) values (cid, me, 'owner', left(coalesce(trim(p_name), ''), 40));
  else
    if (select count(*) from couple_members where couple_id = cid) >= 2 then
      raise exception 'Zaten bir ortak küren var';
    end if;
    update couple_members set name = left(coalesce(nullif(trim(p_name), ''), name), 40) where user_id = me;
  end if;
  delete from couple_invites where couple_id = cid and used_at is null;
  c := '';
  for i in 1..10 loop
    c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  insert into couple_invites (code, couple_id, created_by) values (c, cid, me);
  return c;
end;
$$;

create or replace function public.ae_couple_invite_info(p_code text)
returns table (inviter text, valid boolean, reason text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  inv couple_invites%rowtype;
begin
  select * into inv from couple_invites where code = upper(trim(p_code));
  if not found then
    return query select ''::text, false, 'Bu davet bulunamadı.'::text; return;
  end if;
  if inv.used_at is not null then
    return query select ''::text, false, 'Bu davet daha önce kullanılmış.'::text; return;
  end if;
  if inv.expires_at < now() then
    return query select ''::text, false, 'Bu davetin süresi dolmuş. Yeni bir bağlantı iste.'::text; return;
  end if;
  if inv.created_by = auth.uid() then
    return query select (select name from couple_members where user_id = inv.created_by), false, 'Bu senin kendi davetin. Bağlantıyı partnerine gönder.'::text; return;
  end if;
  return query select coalesce((select name from couple_members where user_id = inv.created_by), ''), true, ''::text;
end;
$$;

create or replace function public.ae_couple_join(p_code text, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  inv couple_invites%rowtype;
begin
  if me is null then raise exception 'Oturum yok'; end if;
  select * into inv from couple_invites where code = upper(trim(p_code)) for update;
  if not found or inv.used_at is not null or inv.expires_at < now() then
    raise exception 'Bu davet geçerli değil';
  end if;
  if inv.created_by = me then raise exception 'Kendi davetine katılamazsın'; end if;
  if ae_my_couple() is not null then raise exception 'Zaten bir ortak küren var. Önce ondan ayrıl.'; end if;
  if (select count(*) from couple_members where couple_id = inv.couple_id) >= 2 then
    raise exception 'Bu küre dolu';
  end if;
  insert into couple_members (couple_id, user_id, role, name) values (inv.couple_id, me, 'partner', left(coalesce(trim(p_name), ''), 40));
  update couple_invites set used_by = me, used_at = now() where code = inv.code;
  return inv.couple_id;
end;
$$;

create or replace function public.ae_couple_leave()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  cid uuid := ae_my_couple();
  r text;
begin
  if cid is null then return; end if;
  select role into r from couple_members where user_id = me;
  if r = 'owner' then
    -- davet eden ayrılırsa küre ve liste tamamen silinir
    delete from couples where id = cid;
  else
    delete from couple_members where user_id = me;
  end if;
end;
$$;

-- Üyelerin adı ve tamamladığı GÜN NUMARALARI (içerikler asla paylaşılmaz)
create or replace function public.ae_couple_state()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when public.ae_my_couple() is null then null else jsonb_build_object(
    'id', public.ae_my_couple(),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'me', m.user_id = auth.uid(),
        'role', m.role,
        'name', m.name,
        'days', coalesce((select jsonb_agg(t.day order by t.day) from task_entries t where t.user_id = m.user_id), '[]'::jsonb)
      ) order by m.joined_at)
      from couple_members m where m.couple_id = public.ae_my_couple()
    ), '[]'::jsonb),
    'invite', (
      select jsonb_build_object('code', i.code, 'expires_at', i.expires_at)
      from couple_invites i
      where i.couple_id = public.ae_my_couple() and i.used_at is null and i.expires_at > now()
      order by i.expires_at desc limit 1
    )
  ) end;
$$;

create or replace function public.ae_couple_rename(p_name text)
returns void language sql security definer set search_path = public as $$
  update couple_members set name = left(coalesce(trim(p_name), ''), 40) where user_id = auth.uid();
$$;

-- ------------------------------------------------------------ RPC: paylaşım (herkese açık okuma)
create or replace function public.ae_share_get(p_token text)
returns table (kind text, payload jsonb, files text[], created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.kind, s.payload, s.files, s.created_at from shares s where s.token = p_token;
$$;

revoke all on function public.ae_couple_invite(text), public.ae_couple_invite_info(text), public.ae_couple_join(text, text),
  public.ae_couple_leave(), public.ae_couple_state(), public.ae_couple_rename(text) from public, anon;
grant execute on function public.ae_couple_invite(text), public.ae_couple_invite_info(text), public.ae_couple_join(text, text),
  public.ae_couple_leave(), public.ae_couple_state(), public.ae_couple_rename(text) to authenticated;
revoke all on function public.ae_share_get(text) from public;
grant execute on function public.ae_share_get(text) to anon, authenticated;

-- ------------------------------------------------------------ realtime (ortak liste)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'couple_list') then
    alter publication supabase_realtime add table public.couple_list;
  end if;
end $$;

-- ------------------------------------------------------------ paylaşılan dosyalar (herkese açık bucket)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shared', 'shared', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "shared yukle" on storage.objects;
create policy "shared yukle" on storage.objects for insert to authenticated
  with check (bucket_id = 'shared' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "shared sil" on storage.objects;
create policy "shared sil" on storage.objects for delete to authenticated
  using (bucket_id = 'shared' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "shared kendi gor" on storage.objects;
create policy "shared kendi gor" on storage.objects for select to authenticated
  using (bucket_id = 'shared' and (storage.foldername(name))[1] = auth.uid()::text);
