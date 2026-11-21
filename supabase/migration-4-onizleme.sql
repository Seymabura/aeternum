-- Aeternum · Önizleme modu
-- Kasım boyunca 31 kutunun hepsini açık gösterir.
-- 1 Aralık 2026 00:00'dan itibaren kendiliğinden kapanır (normal kilit düzeni başlar).
-- Elle kapatmak için:  update app_config set value = '0' where key = 'preview_all';

insert into public.app_config (key, value) values ('preview_all', '1')
on conflict (key) do update set value = excluded.value;

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
  prev int;
  d date;
begin
  select value::int into y from app_config where key = 'event_year';
  select value::int into off from app_config where key = 'day_offset';
  select value::int into prev from app_config where key = 'preview_all';
  d := (now() at time zone 'Europe/Istanbul')::date + coalesce(off, 0);
  if d < make_date(y, 12, 1) then
    if coalesce(prev, 0) = 1 then
      return 31;
    end if;
    return 0;
  elsif d > make_date(y, 12, 31) then
    return 32;
  end if;
  return extract(day from d)::int;
end;
$$;
