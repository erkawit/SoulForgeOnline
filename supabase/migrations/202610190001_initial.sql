-- RUN in Supabase SQL Editor (or Supabase CLI migration).
-- RLS protects account ownership only. It does NOT validate combat rewards.
create table if not exists public.player_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now(),
  constraint snapshot_has_version check (snapshot @> '{"version":1}'::jsonb)
);

alter table public.player_snapshots enable row level security;
revoke all on table public.player_snapshots from anon, authenticated;
grant select, insert, update on table public.player_snapshots to authenticated;

create policy "owner can read snapshot"
  on public.player_snapshots for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "owner can create snapshot"
  on public.player_snapshots for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "owner can update snapshot"
  on public.player_snapshots for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Future production schema: characters, item_instances, equipment_slots,
-- monster_spawns, loot_claims, boss_events, offline_farm_jobs, transactions.
-- Those must be modified by trusted server logic/RPC, not untrusted snapshots.
