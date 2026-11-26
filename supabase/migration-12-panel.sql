-- Yönetim paneli: sadece toplam sayılar döner, kullanıcı içeriği asla dönmez.
-- Şifrenin kendisi saklanmaz; app_config'te yalnızca sha256 özeti durur.
create or replace function public.ae_admin_stats(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  h text;
  today date := (now() at time zone 'Europe/Istanbul')::date;
begin
  select value into h from public.app_config where key = 'admin_key_hash';
  if h is null or p_key is null or char_length(p_key) > 200
     or encode(extensions.digest(p_key, 'sha256'), 'hex') <> h then
    perform pg_sleep(0.6);
    return null;
  end if;

  return jsonb_build_object(
    'users',      (select count(*) from auth.users),
    'users_24h',  (select count(*) from auth.users where created_at > now() - interval '24 hours'),
    'users_7d',   (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'letters',    (select count(*) from public.capsules),
    'boards',     (select count(*) from public.vision_boards),
    'boards_users', (select count(distinct user_id) from public.vision_boards),
    'moons',      (select count(*) from public.shares where kind = 'ay'),
    'skies',      (select count(*) from public.shares where kind = 'gok'),
    'couples',    (select count(*) from public.couples),
    'journal',    (select count(*) from public.couple_journal),
    'tasks',      (select count(*) from public.task_entries),
    'task_users', (select count(distinct user_id) from public.task_entries),
    'wishes',     (select count(*) from public.wish_items),
    'daily', (
      select jsonb_agg(jsonb_build_object(
               'd', to_char(d, 'YYYY-MM-DD'),
               'n', (select count(*) from auth.users u
                     where (u.created_at at time zone 'Europe/Istanbul')::date = d))
             order by d)
      from generate_series(today - 13, today, interval '1 day') g(d0),
           lateral (select g.d0::date as d) x
    ),
    'at', now()
  );
end;
$$;

revoke all on function public.ae_admin_stats(text) from public;
grant execute on function public.ae_admin_stats(text) to anon, authenticated;
