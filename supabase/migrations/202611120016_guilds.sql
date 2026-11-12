-- Round 26 (2026-11-12): guilds + guild chat. Needs 202611120014 (player_characters) and 202611120015 (chat_messages).
--
--   guilds          name (unique, 3–16), notice, leader character, member cap 30
--   guild_members   one guild per character; role leader / officer / member
-- Players read every guild and member list; they change them only through the functions below (create, join, leave,
-- kick, promote, notice), each checking that the caller owns the character it acts for. Guild chat = chat_messages rows
-- with channel 'guild' and group_id = the guild id, readable and writable by its members only. Safe to run twice.

create table if not exists public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name ~ '^[A-Za-z0-9_฀-๿ ]{3,16}$'),
  notice text not null default '' check (char_length(notice) <= 200),
  leader_char uuid not null references public.player_characters(id) on delete restrict,
  max_members smallint not null default 30,
  created_at timestamptz not null default now()
);
create unique index if not exists guilds_name_ci on public.guilds (lower(name));

create table if not exists public.guild_members (
  guild_id uuid not null references public.guilds(id) on delete cascade,
  char_id uuid primary key references public.player_characters(id) on delete cascade,
  role text not null default 'member' check (role in ('leader','officer','member')),
  joined_at timestamptz not null default now()
);
create index if not exists guild_members_guild on public.guild_members (guild_id, role);

alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
revoke all on table public.guilds, public.guild_members from anon, authenticated;
grant select on table public.guilds, public.guild_members to authenticated;
drop policy if exists "guilds readable" on public.guilds;
create policy "guilds readable" on public.guilds for select to authenticated using (true);
drop policy if exists "guild members readable" on public.guild_members;
create policy "guild members readable" on public.guild_members for select to authenticated using (true);

-- the guild of one character (null = none)
create or replace function public.guild_of(p_char uuid) returns uuid
language sql stable security definer set search_path='' as $$ select guild_id from public.guild_members where char_id = p_char $$;
revoke all on function public.guild_of(uuid) from public, anon;
grant execute on function public.guild_of(uuid) to authenticated;

create or replace function public.create_guild(p_char uuid, p_name text) returns uuid
language plpgsql security definer set search_path='' as $$
declare g uuid; n text := btrim(p_name);
begin
  if not public.owns_character(p_char) then raise exception 'NOT_YOUR_CHARACTER'; end if;
  if exists(select 1 from public.guild_members where char_id = p_char) then raise exception 'ALREADY_IN_GUILD'; end if;
  if n !~ '^[A-Za-z0-9_฀-๿ ]{3,16}$' then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.guilds where lower(name) = lower(n)) then raise exception 'NAME_TAKEN'; end if;
  insert into public.guilds (name, leader_char) values (n, p_char) returning id into g;
  insert into public.guild_members (guild_id, char_id, role) values (g, p_char, 'leader');
  return g;
end $$;

create or replace function public.join_guild(p_char uuid, p_guild uuid) returns void
language plpgsql security definer set search_path='' as $$
declare cap int;
begin
  if not public.owns_character(p_char) then raise exception 'NOT_YOUR_CHARACTER'; end if;
  if exists(select 1 from public.guild_members where char_id = p_char) then raise exception 'ALREADY_IN_GUILD'; end if;
  select max_members into cap from public.guilds where id = p_guild for update;
  if cap is null then raise exception 'NO_GUILD'; end if;
  if (select count(*) from public.guild_members where guild_id = p_guild) >= cap then raise exception 'GUILD_FULL'; end if;
  insert into public.guild_members (guild_id, char_id) values (p_guild, p_char);
end $$;

-- leaving: the leader hands the guild to the longest-serving officer (else member); the last one out disbands it
create or replace function public.leave_guild(p_char uuid) returns void
language plpgsql security definer set search_path='' as $$
declare g uuid; r text; heir uuid;
begin
  if not public.owns_character(p_char) then raise exception 'NOT_YOUR_CHARACTER'; end if;
  select guild_id, role into g, r from public.guild_members where char_id = p_char;
  if g is null then raise exception 'NOT_IN_GUILD'; end if;
  perform 1 from public.guilds where id = g for update;
  delete from public.guild_members where char_id = p_char;
  if r = 'leader' then
    select char_id into heir from public.guild_members where guild_id = g order by (role = 'officer') desc, joined_at limit 1;
    if heir is null then delete from public.guilds where id = g;
    else update public.guild_members set role = 'leader' where char_id = heir; update public.guilds set leader_char = heir where id = g; end if;
  end if;
end $$;

-- leader / officer removes a member (officers cannot remove officers or the leader)
create or replace function public.kick_guild_member(p_char uuid, p_target uuid) returns void
language plpgsql security definer set search_path='' as $$
declare g uuid; r text; tr text;
begin
  if not public.owns_character(p_char) then raise exception 'NOT_YOUR_CHARACTER'; end if;
  select guild_id, role into g, r from public.guild_members where char_id = p_char;
  select role into tr from public.guild_members where char_id = p_target and guild_id = g;
  if g is null or tr is null or p_target = p_char then raise exception 'NOT_IN_GUILD'; end if;
  if r = 'member' or tr = 'leader' or (r = 'officer' and tr = 'officer') then raise exception 'NO_RIGHT'; end if;
  delete from public.guild_members where char_id = p_target;
end $$;

-- leader only: member <-> officer, or hand over leadership ('leader')
create or replace function public.set_guild_role(p_char uuid, p_target uuid, p_role text) returns void
language plpgsql security definer set search_path='' as $$
declare g uuid;
begin
  if not public.owns_character(p_char) then raise exception 'NOT_YOUR_CHARACTER'; end if;
  select guild_id into g from public.guild_members where char_id = p_char and role = 'leader';
  if g is null then raise exception 'NO_RIGHT'; end if;
  if not exists(select 1 from public.guild_members where char_id = p_target and guild_id = g) or p_target = p_char then raise exception 'NOT_IN_GUILD'; end if;
  if p_role not in ('officer','member','leader') then raise exception 'ROLE_INVALID'; end if;
  if p_role = 'leader' then
    update public.guild_members set role = 'officer' where char_id = p_char;
    update public.guild_members set role = 'leader' where char_id = p_target;
    update public.guilds set leader_char = p_target where id = g;
  else update public.guild_members set role = p_role where char_id = p_target; end if;
end $$;

create or replace function public.set_guild_notice(p_char uuid, p_notice text) returns void
language plpgsql security definer set search_path='' as $$
declare g uuid;
begin
  if not public.owns_character(p_char) then raise exception 'NOT_YOUR_CHARACTER'; end if;
  select guild_id into g from public.guild_members where char_id = p_char and role in ('leader','officer');
  if g is null then raise exception 'NO_RIGHT'; end if;
  update public.guilds set notice = left(coalesce(p_notice, ''), 200) where id = g;
end $$;

revoke all on function public.create_guild(uuid, text), public.join_guild(uuid, uuid), public.leave_guild(uuid), public.kick_guild_member(uuid, uuid),
  public.set_guild_role(uuid, uuid, text), public.set_guild_notice(uuid, text) from public, anon;
grant execute on function public.create_guild(uuid, text), public.join_guild(uuid, uuid), public.leave_guild(uuid), public.kick_guild_member(uuid, uuid),
  public.set_guild_role(uuid, uuid, text), public.set_guild_notice(uuid, text) to authenticated;

-- names are on player_characters, which players only see for themselves: these two read what the guild window shows
create or replace function public.guild_list() returns table (id uuid, name text, notice text, leader_name text, members int, max_members int)
language sql stable security definer set search_path='' as $$
  select g.id, g.name, g.notice, c.name, (select count(*)::int from public.guild_members m where m.guild_id = g.id), g.max_members
  from public.guilds g join public.player_characters c on c.id = g.leader_char order by 5 desc, g.created_at limit 100
$$;
create or replace function public.guild_roster(p_guild uuid) returns table (char_id uuid, name text, class_id text, role text, joined_at timestamptz)
language sql stable security definer set search_path='' as $$
  select m.char_id, c.name, c.class_id, m.role, m.joined_at from public.guild_members m join public.player_characters c on c.id = m.char_id
  where m.guild_id = p_guild order by case m.role when 'leader' then 0 when 'officer' then 1 else 2 end, m.joined_at
$$;
revoke all on function public.guild_list(), public.guild_roster(uuid) from public, anon;
grant execute on function public.guild_list(), public.guild_roster(uuid) to authenticated;

-- ---------- guild chat: members of the guild read and write channel 'guild' rows for it ----------
drop policy if exists "chat read" on public.chat_messages;
create policy "chat read" on public.chat_messages for select to authenticated using (
  channel in ('near','world')
  or (channel = 'whisper' and (public.owns_character(char_id) or public.owns_character(target_char)))
  or (channel = 'guild' and exists(select 1 from public.guild_members m join public.player_characters c on c.id = m.char_id
                                    where m.guild_id::text = group_id and c.user_id = (select auth.uid())))
  or public.owns_character(char_id) or public.is_admin());
drop policy if exists "chat write own" on public.chat_messages;
create policy "chat write own" on public.chat_messages for insert to authenticated with check (
  public.owns_character(char_id) and (
    channel in ('near','world')
    or (channel = 'whisper' and target_char is not null)
    or (channel = 'guild' and group_id = public.guild_of(char_id)::text)));
