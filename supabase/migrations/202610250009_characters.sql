-- Round 9: the realm server owns every character.
--
-- Before this migration the browser computed money, items and levels and uploaded the whole save (player_snapshots),
-- and any signed-in user could write that table directly through the REST API. From now on:
--   · public.characters is written ONLY by the realm (service role key). Players may read their own row.
--   · public.player_snapshots becomes read-only for players. The realm imports a player's old save once, sanitised
--     (apps/game-server/src/importSave.ts), the first time the character comes online.
-- Run after 202610240008_craft_raid.sql. Safe to run twice.

create table if not exists public.characters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  rev bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint characters_state_is_object check (jsonb_typeof(state) = 'object'),
  constraint characters_rev_positive check (rev >= 1)
);
create index if not exists characters_updated on public.characters(updated_at desc);

alter table public.characters enable row level security;
revoke all on table public.characters from anon, authenticated;
grant select on table public.characters to authenticated;
drop policy if exists "own character or admin" on public.characters;
create policy "own character or admin" on public.characters for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
-- no insert / update / delete policy and no grant: only the service role (the realm) writes characters

-- the old cloud save: players keep read access (download in the Cloud Save panel), but can no longer write it
revoke insert, update, delete on table public.player_snapshots from authenticated;
drop policy if exists "owner can create snapshot" on public.player_snapshots;
drop policy if exists "owner can update snapshot" on public.player_snapshots;

-- admin overview: how many characters the realm holds and the SoulGod in circulation (sum over characters)
create or replace function public.admin_character_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  return jsonb_build_object(
    'characters', (select count(*) from public.characters),
    'active_24h', (select count(*) from public.characters where updated_at > now() - interval '24 hours'),
    'soulgod_total', (select coalesce(sum((state->'player'->>'gold')::numeric), 0) from public.characters),
    'level_avg', (select coalesce(round(avg((state->'player'->>'level')::numeric), 1), 0) from public.characters)
  );
end $$;
revoke all on function public.admin_character_stats() from public, anon;
grant execute on function public.admin_character_stats() to authenticated;
