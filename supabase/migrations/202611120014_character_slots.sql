-- Round 25 (2026-11-12): up to 4 characters per account.
--
-- public.player_profiles stays the ACCOUNT row (invite code, ban, admin) and keeps display_name / class_id / gender as
-- the account's ACTIVE character, so everything that reads them today (realm server, admin console, rankings) keeps
-- working unchanged. The characters themselves live in public.player_characters (slot 1-4).
--   · the existing character of every account becomes its slot 1 (nothing is deleted or rewritten)
--   · create_character(name, class, gender) adds a character in the first free slot and makes it active
--   · select_character(id) makes one of the account's own characters active
-- Players can read their own characters; only these two functions write them. Safe to run twice.

create table if not exists public.player_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.player_profiles(user_id) on delete cascade,
  slot smallint not null check (slot between 1 and 4),
  name text not null check (name ~ '^[A-Za-z0-9_฀-๿]{3,16}$'),
  class_id text not null check (class_id in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor')),
  gender text not null default 'm' check (gender in ('m','f')),
  created_at timestamptz not null default now(),
  last_played_at timestamptz,
  unique (user_id, slot)
);
create unique index if not exists player_characters_name_ci on public.player_characters (lower(name));
create index if not exists player_characters_user on public.player_characters (user_id, slot);

alter table public.player_characters enable row level security;
revoke all on table public.player_characters from anon, authenticated;
grant select on table public.player_characters to authenticated;
drop policy if exists "own characters or admin" on public.player_characters;
create policy "own characters or admin" on public.player_characters for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- every account's current character becomes slot 1 (accounts without a character get no row)
insert into public.player_characters (user_id, slot, name, class_id, gender, created_at)
select p.user_id, 1, p.display_name, p.class_id, coalesce(p.gender, 'm'), coalesce(p.character_created_at, p.created_at)
from public.player_profiles p
where p.display_name is not null and p.class_id is not null
  and p.class_id in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor')
  and not exists (select 1 from public.player_characters c where c.user_id = p.user_id)
on conflict do nothing;

-- the old create_character returned void; a function's return type can't be changed in place, so it is replaced
drop function if exists public.create_character(text, text, text);
create function public.create_character(p_name text, p_class text, p_gender text default 'm') returns uuid
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype; free smallint; new_id uuid;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p_class not in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor') then raise exception 'CLASS_INVALID'; end if;
  if coalesce(p_gender,'m') not in ('m','f') then raise exception 'GENDER_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_characters where lower(name) = lower(p_name))
     or exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name) and user_id <> me) then raise exception 'NAME_TAKEN'; end if;
  select s into free from generate_series(1, 4) s where not exists (select 1 from public.player_characters c where c.user_id = me and c.slot = s) order by s limit 1;
  if free is null then raise exception 'SLOTS_FULL'; end if;
  insert into public.player_characters (user_id, slot, name, class_id, gender) values (me, free, p_name, p_class, coalesce(p_gender,'m')) returning id into new_id;
  update public.player_profiles set display_name = p_name, class_id = p_class, gender = coalesce(p_gender,'m'),
    character_created_at = coalesce(character_created_at, now()) where user_id = me;
  return new_id;
end $$;

create or replace function public.select_character(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); c public.player_characters%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into c from public.player_characters where id = p_id and user_id = me;
  if not found then raise exception 'NOT_YOUR_CHARACTER'; end if;
  if exists(select 1 from public.player_profiles where user_id = me and banned) then raise exception 'BANNED'; end if;
  update public.player_profiles set display_name = c.name, class_id = c.class_id, gender = c.gender where user_id = me;
  update public.player_characters set last_played_at = now() where id = p_id;
end $$;


revoke all on function public.create_character(text, text, text), public.select_character(uuid) from public, anon;
grant execute on function public.create_character(text, text, text), public.select_character(uuid) to authenticated;
