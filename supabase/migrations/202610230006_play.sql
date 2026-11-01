-- SoulForge Online · 0006 · account-first sign-up, separate character creation, persistent parties.
-- 1) Registering with an invite code creates the ACCOUNT immediately (no name/class yet).
-- 2) The player then picks a class on the character-creation screen → create_character(name, class).
-- 3) Parties live on the server and in these tables, so a dropped connection never loses the party
--    (the game server keeps the seat for a 120 s reconnect grace and restores parties after a restart).

-- ------------------------------------------------------------------ profiles: character fields filled later
alter table public.player_profiles alter column display_name drop not null;
alter table public.player_profiles alter column class_id drop not null;
alter table public.player_profiles add column if not exists character_created_at timestamptz;
update public.player_profiles set character_created_at = coalesce(character_created_at, created_at) where class_id is not null;
-- names stay unique case-insensitively
create unique index if not exists player_profiles_name_ci on public.player_profiles (lower(display_name)) where display_name is not null;

-- Called ONLY by the register API (service role) right after it creates the auth user. Atomic: lock code → check → consume.
create or replace function public.claim_invite_account(p_code text, p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
declare c public.invite_codes%rowtype; cap int := public.cfg_num('{beta,maxPlayers}', 500)::int;
begin
  select * into c from public.invite_codes where code = upper(p_code) for update;
  if not found or c.revoked_at is not null or (c.expires_at is not null and c.expires_at <= now()) or c.used_count >= c.max_uses then
    raise exception 'INVITE_INVALID'; end if;
  if (select count(*) from public.player_profiles) >= cap then raise exception 'BETA_FULL'; end if;
  if exists(select 1 from public.player_profiles where user_id = p_user) then raise exception 'ALREADY_REGISTERED'; end if;
  update public.invite_codes set used_count = used_count + 1, last_used_at = now() where code = c.code;
  insert into public.invite_redemptions(code, user_id) values (c.code, p_user);
  insert into public.player_profiles(user_id, invite_code) values (p_user, c.code);
  insert into public.player_wallets(player_id, gold) values (p_user, public.cfg_num('{economy,startingSoulGod}', 150)::bigint) on conflict do nothing;
end $$;
revoke all on function public.claim_invite_account(text, uuid) from public, anon, authenticated;
grant execute on function public.claim_invite_account(text, uuid) to service_role;

-- The signed-in player creates their one character (closed beta: one per account, class fixed afterwards).
create or replace function public.create_character(p_name text, p_class text) returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p.class_id is not null then raise exception 'CHARACTER_EXISTS'; end if;
  if p_class not in ('Warrior','Mage','Priest','Archer','Enchanter') then raise exception 'CLASS_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.player_profiles set display_name = p_name, class_id = p_class, character_created_at = now() where user_id = me;
end $$;
revoke all on function public.create_character(text, text) from public, anon;
grant execute on function public.create_character(text, text) to authenticated;

-- ------------------------------------------------------------------ parties (server-owned)
create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.party_members (
  party_id uuid not null references public.parties(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 0 and 5),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (party_id, player_id)
);
create unique index if not exists one_party_per_player on public.party_members(player_id);
create unique index if not exists party_slot_unique on public.party_members(party_id, slot);
alter table public.parties enable row level security;
alter table public.party_members enable row level security;
revoke all on public.parties, public.party_members from anon, authenticated;
grant select on public.parties, public.party_members to authenticated;
create or replace function public.my_party_id() returns uuid language sql stable security definer set search_path='' as $$
  select party_id from public.party_members where player_id = auth.uid() $$;
revoke all on function public.my_party_id() from public, anon;
grant execute on function public.my_party_id() to authenticated;
drop policy if exists "party visible to members" on public.parties;
create policy "party visible to members" on public.parties for select to authenticated using (id = public.my_party_id() or public.is_admin());
drop policy if exists "party members visible to members" on public.party_members;
create policy "party members visible to members" on public.party_members for select to authenticated using (party_id = public.my_party_id() or public.is_admin());

-- The game server (service role) writes the whole party in one call: members in slot order, leader first.
create or replace function public.save_party(p_party uuid, p_leader uuid, p_members uuid[]) returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_members is null or array_length(p_members, 1) is null or array_length(p_members, 1) < 2 then
    delete from public.parties where id = p_party; return; end if;
  if array_length(p_members, 1) > 6 then raise exception 'PARTY_FULL'; end if;
  insert into public.parties(id, leader_id) values (p_party, p_leader)
    on conflict (id) do update set leader_id = excluded.leader_id, updated_at = now();
  -- rewrite the roster (keeps slot order exact and moves a player out of any older party)
  delete from public.party_members where party_id = p_party or player_id = any(p_members);
  insert into public.party_members(party_id, player_id, slot)
    select p_party, m, (i - 1)::smallint from unnest(p_members) with ordinality as t(m, i);
end $$;
revoke all on function public.save_party(uuid, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.save_party(uuid, uuid, uuid[]) to service_role;
