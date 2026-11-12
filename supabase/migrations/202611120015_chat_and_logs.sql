-- Round 25 (2026-11-12): in-game chat + per-character combat / loot history.
--
--   chat_messages   near (same map) · world · whisper — kept 30 days. Party / guild rows are accepted only once those
--                   systems exist on the server (see group_id); until then the client keeps them local.
--   combat_log      damage dealt / taken by a character — only the last 5 minutes are kept (older rows are removed on
--                   every insert batch), so the table stays tiny.
--   loot_history    every item a character received from a kill — kept forever.
-- Every row is keyed by the playing character (player_characters.id) and indexed (character, time) so one character's
-- history reads in order. Players insert rows only for their own characters and read only their own logs; chat is
-- readable by signed-in players (whispers only by the two sides). Safe to run twice.

-- ---------- chat ----------
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  channel text not null check (channel in ('near','world','whisper','party','guild')),
  char_id uuid not null references public.player_characters(id) on delete cascade,
  sender_name text not null,
  city_id text,                                   -- near: the map it was said on
  target_char uuid references public.player_characters(id) on delete cascade, -- whisper
  target_name text,
  group_id text,                                  -- party / guild id (reserved)
  body text not null check (char_length(body) between 1 and 200),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_time on public.chat_messages (created_at desc);
create index if not exists chat_messages_char on public.chat_messages (char_id, created_at desc);
create index if not exists chat_messages_target on public.chat_messages (target_char, created_at desc) where target_char is not null;

-- ---------- combat (5 minutes) ----------
create table if not exists public.combat_log (
  id bigint generated always as identity primary key,
  char_id uuid not null references public.player_characters(id) on delete cascade,
  dir text not null check (dir in ('dealt','taken')),
  amount integer not null check (amount between 0 and 100000000),
  crit boolean not null default false,
  other text,                                     -- the monster / player on the other side
  skill text,
  city_id text,
  at timestamptz not null default now()
);
create index if not exists combat_log_char on public.combat_log (char_id, at desc);
create index if not exists combat_log_at on public.combat_log (at);

-- ---------- loot (forever) ----------
create table if not exists public.loot_history (
  id bigint generated always as identity primary key,
  char_id uuid not null references public.player_characters(id) on delete cascade,
  item_def text not null,
  item_name text not null,
  rarity text,
  qty integer not null default 1 check (qty between 1 and 100000),
  enhance integer not null default 0,
  monster text,
  city_id text,
  at timestamptz not null default now()
);
create index if not exists loot_history_char on public.loot_history (char_id, at desc);

-- ---------- ownership helper ----------
create or replace function public.owns_character(p_char uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.player_characters c join public.player_profiles p on p.user_id = c.user_id
                where c.id = p_char and c.user_id = (select auth.uid()) and not p.banned)
$$;
revoke all on function public.owns_character(uuid) from public, anon;
grant execute on function public.owns_character(uuid) to authenticated;

-- ---------- RLS ----------
alter table public.chat_messages enable row level security;
alter table public.combat_log enable row level security;
alter table public.loot_history enable row level security;
revoke all on table public.chat_messages, public.combat_log, public.loot_history from anon, authenticated;
grant select, insert on table public.chat_messages, public.combat_log, public.loot_history to authenticated;

drop policy if exists "chat read" on public.chat_messages;
create policy "chat read" on public.chat_messages for select to authenticated using (
  channel in ('near','world')
  or (channel = 'whisper' and (public.owns_character(char_id) or public.owns_character(target_char)))
  or public.owns_character(char_id) or public.is_admin());
drop policy if exists "chat write own" on public.chat_messages;
create policy "chat write own" on public.chat_messages for insert to authenticated with check (
  public.owns_character(char_id) and channel in ('near','world','whisper') and (channel <> 'whisper' or target_char is not null));

drop policy if exists "combat own" on public.combat_log;
create policy "combat own" on public.combat_log for select to authenticated using (public.owns_character(char_id) or public.is_admin());
drop policy if exists "combat write own" on public.combat_log;
create policy "combat write own" on public.combat_log for insert to authenticated with check (public.owns_character(char_id));

drop policy if exists "loot own" on public.loot_history;
create policy "loot own" on public.loot_history for select to authenticated using (public.owns_character(char_id) or public.is_admin());
drop policy if exists "loot write own" on public.loot_history;
create policy "loot write own" on public.loot_history for insert to authenticated with check (public.owns_character(char_id));

-- ---------- chat: sender name from the character, flood guard (5 messages / 5 s), whisper target by name ----------
create or replace function public.chat_before_insert() returns trigger
language plpgsql security definer set search_path='' as $$
declare t uuid;
begin
  select name into new.sender_name from public.player_characters where id = new.char_id;
  new.created_at := now();
  if (select count(*) from public.chat_messages where char_id = new.char_id and created_at > now() - interval '5 seconds') >= 5 then
    raise exception 'CHAT_FLOOD'; end if;
  if new.channel = 'whisper' then
    select id, name into t, new.target_name from public.player_characters where id = new.target_char;
    if t is null then raise exception 'WHISPER_TARGET'; end if;
  end if;
  return new;
end $$;
drop trigger if exists chat_before_insert on public.chat_messages;
create trigger chat_before_insert before insert on public.chat_messages for each row execute function public.chat_before_insert();

-- ---------- retention ----------
create or replace function public.combat_log_trim() returns trigger
language plpgsql security definer set search_path='' as $$
begin delete from public.combat_log where at < now() - interval '5 minutes'; return null; end $$;
drop trigger if exists combat_log_trim on public.combat_log;
create trigger combat_log_trim after insert on public.combat_log for each statement execute function public.combat_log_trim();

create or replace function public.chat_trim() returns trigger
language plpgsql security definer set search_path='' as $$
begin delete from public.chat_messages where created_at < now() - interval '30 days'; return null; end $$;
drop trigger if exists chat_trim on public.chat_messages;
create trigger chat_trim after insert on public.chat_messages for each statement execute function public.chat_trim();

-- ---------- whisper lookup: a character id by its name (exact, case-insensitive) ----------
create or replace function public.character_by_name(p_name text) returns uuid
language sql stable security definer set search_path='' as $$
  select id from public.player_characters where lower(name) = lower(p_name) limit 1
$$;
revoke all on function public.character_by_name(text) from public, anon;
grant execute on function public.character_by_name(text) to authenticated;

-- ---------- realtime: new chat rows are pushed to connected players (RLS still applies) ----------
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
