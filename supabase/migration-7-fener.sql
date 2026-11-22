-- Dilek feneri: isimsiz ortak gökyüzü
create table if not exists public.lanterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null check (char_length(text) between 2 and 80),
  private boolean not null default false,
  hidden boolean not null default false,
  reports int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists lanterns_recent on public.lanterns (created_at desc) where not hidden and not private;
create index if not exists lanterns_user on public.lanterns (user_id, created_at desc);

create table if not exists public.lantern_reports (
  lantern_id uuid references public.lanterns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (lantern_id, user_id)
);

alter table public.lanterns enable row level security;
alter table public.lantern_reports enable row level security;

-- herkes doğrudan sadece kendi fenerlerini görür ve silebilir; ortak gökyüzü RPC ile (kimlik bilgisi olmadan)
drop policy if exists "lantern own select" on public.lanterns;
create policy "lantern own select" on public.lanterns for select using (user_id = auth.uid());
drop policy if exists "lantern own delete" on public.lanterns;
create policy "lantern own delete" on public.lanterns for delete using (user_id = auth.uid());
-- ekleme/güncelleme sadece RPC ile (politika yok = izin yok)

-- uygunsuz içerik filtresi
create or replace function public.ae_text_ok(t text) returns boolean
language sql immutable as $$
  select not (
    lower(t) ~ '(https?://|www\.|\.com\M|\.net\M|\.org\M|\.com\.tr|t\.me/|@[a-z0-9_]{3,})'
    or regexp_replace(t, '[^0-9]', '', 'g') ~ '[0-9]{7,}'
    or lower(t) ~ '(\msiktir|\msikerim|\msikeyim|\msikik|\msikiş|\msik\M|\mamk\M|\maq\M|\mamına|\morospu|\mpiç\M|\mpiçler|\myarrak|\myarak\M|\mgöt\M|\mgötveren|\manan[ıi]\M|\manan[ıi]z[ıi]\M|\moç\M|\mpezevenk|\mkahpe|\mgavat|\mibne|\mşerefsiz|\mgerizekal|\mpuşt|\mkaltak|\mamcık|\mdalyarak|\mfuck|\mshit\M|\mbitch)'
  );
$$;

create or replace function public.ae_lantern_release(p_text text, p_private boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_t text := btrim(regexp_replace(coalesce(p_text, ''), '\s+', ' ', 'g'));
begin
  if auth.uid() is null then raise exception 'oturum yok'; end if;
  if char_length(v_t) < 2 or char_length(v_t) > 80 then raise exception 'uzunluk'; end if;
  if not public.ae_text_ok(v_t) then raise exception 'uygunsuz'; end if;
  if (select count(*) from lanterns where user_id = auth.uid() and created_at > now() - interval '1 day') >= 3 then
    raise exception 'limit';
  end if;
  insert into lanterns (user_id, text, private) values (auth.uid(), v_t, coalesce(p_private, false)) returning id into v_id;
  return v_id;
end $$;

-- ortak gökyüzü: son 140 görünür fener + kendi fenerlerim (kimin olduğu dönmez)
create or replace function public.ae_lantern_sky()
returns table (id uuid, text text, created_at timestamptz, mine boolean)
language sql stable security definer set search_path = public as $$
  (select l.id, l.text, l.created_at, (l.user_id = auth.uid()) as mine
     from lanterns l where not l.hidden and not l.private
     order by l.created_at desc limit 140)
  union
  (select l.id, l.text, l.created_at, true from lanterns l
     where l.user_id = auth.uid() and not l.hidden order by l.created_at desc limit 20);
$$;

create or replace function public.ae_lantern_report(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into lantern_reports (lantern_id, user_id) values (p_id, auth.uid()) on conflict do nothing;
  if found then
    update lanterns set reports = reports + 1, hidden = (reports + 1 >= 3) where id = p_id and user_id <> auth.uid();
  end if;
end $$;

revoke all on function public.ae_lantern_release(text, boolean) from public, anon;
grant execute on function public.ae_lantern_release(text, boolean) to authenticated;
revoke all on function public.ae_lantern_sky() from public;
grant execute on function public.ae_lantern_sky() to anon, authenticated;
revoke all on function public.ae_lantern_report(uuid) from public, anon;
grant execute on function public.ae_lantern_report(uuid) to authenticated;
