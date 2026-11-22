-- Ortak defter: 30 gün, her gün bir soru; iki kişi de cevaplayınca cevaplar açılır
create table if not exists public.couple_journal (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  started_on date not null default (now() at time zone 'Europe/Istanbul')::date,
  ritual text not null default '21:30' check (ritual ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  created_at timestamptz not null default now()
);
create table if not exists public.journal_answers (
  couple_id uuid not null references public.couples(id) on delete cascade,
  day int not null check (day between 1 and 30),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (couple_id, day, user_id)
);
alter table public.couple_journal enable row level security;
alter table public.journal_answers enable row level security;
-- doğrudan erişim: sadece kendi cevabını görür; eşinin cevabı yalnızca RPC ile ve sen de cevapladıysan döner
drop policy if exists "defter gor" on public.couple_journal;
create policy "defter gor" on public.couple_journal for select to authenticated using (couple_id = public.ae_my_couple());
drop policy if exists "cevap kendi" on public.journal_answers;
create policy "cevap kendi" on public.journal_answers for select to authenticated using (user_id = auth.uid());
grant select on public.couple_journal, public.journal_answers to authenticated;

create or replace function public.ae_journal_today(p_start date) returns int language sql stable as $$
  select least(30, greatest(1, ((now() at time zone 'Europe/Istanbul')::date - p_start) + 1));
$$;

create or replace function public.ae_journal_start(p_ritual text) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid := ae_my_couple();
begin
  if cid is null then raise exception 'Önce eşleşmelisiniz'; end if;
  if p_ritual !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Saat geçersiz'; end if;
  insert into couple_journal (couple_id, ritual) values (cid, p_ritual)
  on conflict (couple_id) do update set ritual = excluded.ritual;
end $$;

create or replace function public.ae_journal_answer(p_day int, p_text text) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid := ae_my_couple(); st date; t text := btrim(coalesce(p_text, ''));
begin
  if cid is null then raise exception 'Önce eşleşmelisiniz'; end if;
  select started_on into st from couple_journal where couple_id = cid;
  if st is null then raise exception 'Defter başlamadı'; end if;
  if p_day < 1 or p_day > ae_journal_today(st) then raise exception 'Bu soru henüz açılmadı'; end if;
  if char_length(t) < 1 or char_length(t) > 1000 then raise exception 'Cevap 1-1000 karakter olmalı'; end if;
  -- eşi cevapladıktan sonra cevap değiştirilemez (açılmış cevaplar sabit kalır)
  if exists (select 1 from journal_answers where couple_id = cid and day = p_day and user_id = auth.uid())
     and exists (select 1 from journal_answers where couple_id = cid and day = p_day and user_id <> auth.uid()) then
    raise exception 'Cevaplar açıldı, artık değiştirilemez';
  end if;
  insert into journal_answers (couple_id, day, user_id, text) values (cid, p_day, auth.uid(), t)
  on conflict (couple_id, day, user_id) do update set text = excluded.text, updated_at = now();
end $$;

create or replace function public.ae_journal_state() returns jsonb
language sql stable security definer set search_path = public as $$
  with j as (select * from couple_journal where couple_id = ae_my_couple())
  select case when not exists (select 1 from j) then null else (
    select jsonb_build_object(
      'started_on', j.started_on,
      'ritual', j.ritual,
      'today', ae_journal_today(j.started_on),
      'days', coalesce((
        select jsonb_agg(jsonb_build_object(
          'day', d,
          'mine', mine.text,
          'partner_done', partner.text is not null,
          'partner', case when mine.text is not null then partner.text end
        ) order by d)
        from generate_series(1, ae_journal_today(j.started_on)) d
        left join journal_answers mine on mine.couple_id = j.couple_id and mine.day = d and mine.user_id = auth.uid()
        left join journal_answers partner on partner.couple_id = j.couple_id and partner.day = d and partner.user_id <> auth.uid()
      ), '[]'::jsonb)
    ) from j
  ) end;
$$;

revoke all on function public.ae_journal_start(text), public.ae_journal_answer(int, text), public.ae_journal_state() from public, anon;
grant execute on function public.ae_journal_start(text), public.ae_journal_answer(int, text), public.ae_journal_state() to authenticated;
