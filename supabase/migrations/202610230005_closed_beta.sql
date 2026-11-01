-- SoulForge closed beta: invite codes, player profiles, admin roles, live balance config,
-- class-locked item instances with options/enhancement, market price floors, SoulGod burn ledger.
-- Run AFTER 202610190001 … 202610220004. Safe to re-run (idempotent where possible).
begin;
create extension if not exists pgcrypto;

-- ------------------------------------------------------------------ admins
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'gm' check (role in ('owner','gm')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
create or replace function public.is_owner() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid() and role = 'owner');
$$;
grant execute on function public.is_admin(), public.is_owner() to authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "admins see admins" on public.admin_users;
create policy "admins see admins" on public.admin_users for select to authenticated using (public.is_admin());

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id), action text not null, detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;
drop policy if exists "admins read audit" on public.admin_audit_log;
create policy "admins read audit" on public.admin_audit_log for select to authenticated using (public.is_admin());

-- ------------------------------------------------------------------ live game config (read by every client)
create table if not exists public.game_config (
  key text primary key check (key in ('balance','skills','npcs','announcement')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.game_config enable row level security;
revoke all on public.game_config from anon, authenticated;
grant select on public.game_config to anon, authenticated;
drop policy if exists "config is public" on public.game_config;
create policy "config is public" on public.game_config for select using (true);
insert into public.game_config(key, value) values ('balance','{}'),('skills','{}'),('npcs','{}'),('announcement','{}') on conflict do nothing;

create or replace function public.admin_set_config(p_key text, p_value jsonb) returns timestamptz
language plpgsql security definer set search_path='' as $$
declare t timestamptz := now();
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if jsonb_typeof(p_value) <> 'object' then raise exception 'Config must be a JSON object'; end if;
  if pg_catalog.octet_length(p_value::text) > 400000 then raise exception 'Config too large'; end if;
  update public.game_config set value = p_value, updated_at = t, updated_by = auth.uid() where key = p_key;
  if not found then raise exception 'Unknown config key'; end if;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'set_config', jsonb_build_object('key', p_key, 'bytes', pg_catalog.octet_length(p_value::text)));
  return t;
end $$;
revoke all on function public.admin_set_config(text, jsonb) from public, anon;
grant execute on function public.admin_set_config(text, jsonb) to authenticated;

-- read a number from balance config with a fallback (path like '{market,salesTaxPct}')
create or replace function public.cfg_num(p_path text[], p_default numeric) returns numeric language sql stable security definer set search_path='' as $$
  select coalesce((select (value #>> p_path)::numeric from public.game_config where key = 'balance'), p_default);
$$;
create or replace function public.norm_rarity(r text) returns text language sql immutable set search_path='' as $$
  select case lower(r) when 'common' then 'Common' when 'uncommon' then 'Uncommon' when 'rare' then 'Rare' when 'epic' then 'Epic'
    when 'legendary' then 'Legendary' when 'god' then 'God' when 'pre-arch' then 'Pre-arch' when 'arch' then 'Arch' else 'Common' end;
$$;

-- ------------------------------------------------------------------ invite codes  (XXXX-XXXX-XXXX-XXXX)
create table if not exists public.invite_codes (
  code text primary key check (code ~ '^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'),
  batch text not null default 'closed-beta-1', note text,
  max_uses integer not null default 1 check (max_uses between 1 and 1000),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz, revoked_at timestamptz,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), last_used_at timestamptz,
  check (used_count <= max_uses)
);
create table if not exists public.invite_redemptions (
  code text not null references public.invite_codes(code), user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(), primary key (code, user_id)
);
alter table public.invite_codes enable row level security;
alter table public.invite_redemptions enable row level security;
revoke all on public.invite_codes, public.invite_redemptions from anon, authenticated;
grant select on public.invite_codes, public.invite_redemptions to authenticated;
drop policy if exists "admins read invites" on public.invite_codes;
create policy "admins read invites" on public.invite_codes for select to authenticated using (public.is_admin());
drop policy if exists "admins read redemptions" on public.invite_redemptions;
create policy "admins read redemptions" on public.invite_redemptions for select to authenticated using (public.is_admin() or user_id = auth.uid());

-- 32-letter alphabet, 256 % 32 = 0 → no modulo bias; 16 random bytes from pgcrypto
create or replace function public.gen_invite_code() returns text language plpgsql volatile set search_path='' as $$
declare a constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea := extensions.gen_random_bytes(16); s text := ''; i int;
begin
  for i in 0..15 loop
    s := s || substr(a, (get_byte(b, i) % 32) + 1, 1);
    if i % 4 = 3 and i < 15 then s := s || '-'; end if;
  end loop;
  return s;
end $$;
create or replace function public.generate_invites_internal(p_count int, p_batch text, p_expires timestamptz, p_note text, p_by uuid) returns setof text
language plpgsql security definer set search_path='' as $$
declare made int := 0; c text;
begin
  if p_count < 1 or p_count > 2000 then raise exception 'Count must be 1–2000'; end if;
  while made < p_count loop
    c := public.gen_invite_code();
    insert into public.invite_codes(code, batch, expires_at, note, created_by) values (c, coalesce(nullif(p_batch,''),'closed-beta-1'), p_expires, p_note, p_by) on conflict do nothing;
    if found then made := made + 1; return next c; end if;
  end loop;
end $$;
revoke all on function public.generate_invites_internal(int, text, timestamptz, text, uuid) from public, anon, authenticated;
create or replace function public.admin_generate_invites(p_count int, p_batch text default 'closed-beta-1', p_expires timestamptz default null, p_note text default null) returns setof text
language plpgsql security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'generate_invites', jsonb_build_object('count', p_count, 'batch', p_batch));
  return query select * from public.generate_invites_internal(p_count, p_batch, p_expires, p_note, auth.uid());
end $$;
create or replace function public.admin_revoke_invite(p_code text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.invite_codes set revoked_at = now() where code = p_code and revoked_at is null;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'revoke_invite', jsonb_build_object('code', p_code));
end $$;
revoke all on function public.admin_generate_invites(int, text, timestamptz, text), public.admin_revoke_invite(text) from public, anon;
grant execute on function public.admin_generate_invites(int, text, timestamptz, text), public.admin_revoke_invite(text) to authenticated;

-- ------------------------------------------------------------------ player profiles (one per invited account)
create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null unique check (display_name ~ '^[A-Za-z0-9_฀-๿]{3,16}$'),
  class_id text not null check (class_id in ('Warrior','Mage','Priest','Archer','Enchanter')),
  invite_code text references public.invite_codes(code),
  banned boolean not null default false, ban_reason text,
  created_at timestamptz not null default now(), last_login_at timestamptz
);
alter table public.player_profiles enable row level security;
revoke all on public.player_profiles from anon, authenticated;
grant select on public.player_profiles to authenticated;
drop policy if exists "own profile or admin" on public.player_profiles;
create policy "own profile or admin" on public.player_profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Called ONLY by the register API (service role) right after it creates the auth user. Atomic: lock code → check → consume.
create or replace function public.claim_invite(p_code text, p_user uuid, p_name text, p_class text) returns void
language plpgsql security definer set search_path='' as $$
declare c public.invite_codes%rowtype; cap int := public.cfg_num('{beta,maxPlayers}', 500)::int;
begin
  select * into c from public.invite_codes where code = upper(p_code) for update;
  if not found or c.revoked_at is not null or (c.expires_at is not null and c.expires_at <= now()) or c.used_count >= c.max_uses then
    raise exception 'INVITE_INVALID'; end if;
  if (select count(*) from public.player_profiles) >= cap then raise exception 'BETA_FULL'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.invite_codes set used_count = used_count + 1, last_used_at = now() where code = c.code;
  insert into public.invite_redemptions(code, user_id) values (c.code, p_user);
  insert into public.player_profiles(user_id, display_name, class_id, invite_code) values (p_user, p_name, p_class, c.code);
  insert into public.player_wallets(player_id, gold) values (p_user, public.cfg_num('{economy,startingSoulGod}', 150)::bigint) on conflict do nothing;
end $$;
revoke all on function public.claim_invite(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_invite(text, uuid, text, text) to service_role;

create or replace function public.admin_set_ban(p_user uuid, p_banned boolean, p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.player_profiles set banned = p_banned, ban_reason = p_reason where user_id = p_user;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'ban', jsonb_build_object('user', p_user, 'banned', p_banned, 'reason', p_reason));
end $$;
revoke all on function public.admin_set_ban(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_ban(uuid, boolean, text) to authenticated;

-- ------------------------------------------------------------------ item instances: class lock, options, enhancement
alter table public.world_loot drop constraint if exists world_loot_rarity_check;
alter table public.world_loot add constraint world_loot_rarity_check check (lower(rarity) in ('common','uncommon','rare','epic','legendary','god','pre-arch','arch'));
alter table public.inventory_items add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.inventory_items add column if not exists enhance_level integer not null default 0;
alter table public.inventory_items add column if not exists class_lock text check (class_lock in ('Warrior','Mage','Priest','Archer','Enchanter'));
alter table public.inventory_items add column if not exists last_unlisted_at timestamptz;
alter table public.inventory_items drop constraint if exists inventory_items_enhance_range;
alter table public.inventory_items add constraint inventory_items_enhance_range check (enhance_level between 0 and 15);
alter table public.item_definitions add column if not exists class_lock text;
alter table public.market_listings add column if not exists enhance_level integer not null default 0;
alter table public.market_listings add column if not exists listing_fee bigint not null default 0;
alter table public.market_listings add column if not exists tax_burned bigint not null default 0;
alter table public.market_listings add column if not exists expires_at timestamptz;
create index if not exists market_sales_by_def on public.market_listings(item_definition_id, closed_at) where status = 'sold';

-- ------------------------------------------------------------------ SoulGod ledger (every sink writes here)
create table if not exists public.economy_ledger (
  id bigint generated always as identity primary key,
  player_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('market_fee','market_tax','market_sale','market_buy','enhance','npc_shop','npc_sell','travel','skill_reset','admin_grant','vault','loot')),
  amount bigint not null, burned bigint not null default 0, ref text, created_at timestamptz not null default now()
);
create index if not exists economy_ledger_time on public.economy_ledger(created_at desc);
alter table public.economy_ledger enable row level security;
revoke all on public.economy_ledger from anon, authenticated;
grant select on public.economy_ledger to authenticated;
drop policy if exists "own ledger or admin" on public.economy_ledger;
create policy "own ledger or admin" on public.economy_ledger for select to authenticated using (player_id = auth.uid() or public.is_admin());

create or replace function public.spend_soulgod(p_user uuid, p_amount bigint, p_kind text, p_ref text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_amount < 0 then raise exception 'Invalid amount'; end if;
  if p_amount = 0 then return; end if;
  update public.player_wallets set gold = gold - p_amount where player_id = p_user and gold >= p_amount;
  if not found then raise exception 'Insufficient SoulGod'; end if;
  insert into public.economy_ledger(player_id, kind, amount, burned, ref) values (p_user, p_kind, -p_amount, p_amount, p_ref);
end $$;
revoke all on function public.spend_soulgod(uuid, bigint, text, text) from public, anon, authenticated;

-- ------------------------------------------------------------------ market: floor price, fees, tax, anti-pump
create or replace function public.market_min_price(p_def text, p_rarity text, p_enhance int) returns bigint
language sql stable security definer set search_path='' as $$
  with base as (
    select round(public.cfg_num(array['market','floor',public.norm_rarity(p_rarity)],
      case public.norm_rarity(p_rarity) when 'Common' then 50 when 'Uncommon' then 150 when 'Rare' then 1000 when 'Epic' then 5000
        when 'Legendary' then 25000 when 'God' then 150000 when 'Pre-arch' then 600000 else 2500000 end)
      * (1 + public.cfg_num('{market,floorPerEnhance}', 0.15) * greatest(0, p_enhance)))::bigint as v
  ), med as (
    select percentile_cont(0.5) within group (order by price) as m from public.market_listings
    where status = 'sold' and item_definition_id = p_def and enhance_level = p_enhance and closed_at > now() - interval '7 days'
  )
  select greatest((select v from base), coalesce(round((select m from med) * public.cfg_num('{market,medianFloorRatio}', 0.5))::bigint, 0));
$$;
grant execute on function public.market_min_price(text, text, int) to anon, authenticated;

create or replace function public.market_list(p_item_id uuid, p_price bigint) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); i public.inventory_items%rowtype; r uuid; floor_price bigint; fee bigint;
  max_active int := public.cfg_num('{market,maxActiveListings}', 20)::int; cooldown int := public.cfg_num('{market,relistCooldownMinutes}', 30)::int;
begin
  if u is null or p_price is null or p_price < 1 or p_price > 1000000000000 then raise exception 'Invalid request'; end if;
  if exists(select 1 from public.player_profiles where user_id = u and banned) then raise exception 'Account suspended'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  select * into i from public.inventory_items where id = p_item_id and owner_id = u for update;
  if not found or i.market_reserved then raise exception 'Item unavailable'; end if;
  if i.last_unlisted_at is not null and i.last_unlisted_at > now() - make_interval(mins => cooldown) then raise exception 'Relist cooldown: wait % minutes after cancelling', cooldown; end if;
  if (select count(*) from public.market_listings where seller_id = u and status = 'active') >= max_active then raise exception 'Too many active listings'; end if;
  floor_price := public.market_min_price(i.item_definition_id, i.rarity, i.enhance_level);
  if p_price < floor_price then raise exception 'Price below market floor (%)', floor_price; end if;
  fee := greatest(public.cfg_num('{market,listingFeeMin}', 10), round(p_price * public.cfg_num('{market,listingFeePct}', 0.01)))::bigint;
  perform public.spend_soulgod(u, fee, 'market_fee', p_item_id::text);
  update public.inventory_items set market_reserved = true where id = i.id;
  insert into public.market_listings(seller_id, item_id, item_definition_id, rarity, quantity, price, enhance_level, listing_fee, expires_at)
    values (u, i.id, i.item_definition_id, i.rarity, i.quantity, p_price, i.enhance_level, fee, now() + make_interval(hours => public.cfg_num('{market,listingHours}', 72)::int)) returning id into r;
  return r;
end $$;

create or replace function public.market_buy(p_listing_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); l public.market_listings%rowtype; s uuid; a uuid; i public.inventory_items%rowtype; tax bigint;
begin
  if u is null then raise exception 'Sign in required'; end if;
  select seller_id into s from public.market_listings where id = p_listing_id;
  if s is null or s = u then raise exception 'Invalid listing'; end if;
  for a in select x from unnest(array[u, s]) x order by x loop perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(a::text, 0)); end loop;
  select * into l from public.market_listings where id = p_listing_id for update;
  if l.status <> 'active' or l.item_id is null or (l.expires_at is not null and l.expires_at <= now()) then raise exception 'Listing closed'; end if;
  select * into i from public.inventory_items where id = l.item_id for update;
  if not found or i.owner_id <> s or not i.market_reserved or i.quantity <> l.quantity then raise exception 'Item unavailable'; end if;
  if (select count(*) from public.inventory_items where owner_id = u) >= 80 then raise exception 'Inventory full'; end if;
  update public.player_wallets set gold = gold - l.price where player_id = u and gold >= l.price;
  if not found then raise exception 'Insufficient SoulGod'; end if;
  tax := round(l.price * public.cfg_num('{market,salesTaxPct}', 0.05))::bigint;
  insert into public.player_wallets(player_id, gold) values (s, l.price - tax) on conflict(player_id) do update set gold = public.player_wallets.gold + excluded.gold;
  insert into public.economy_ledger(player_id, kind, amount, burned, ref) values (u, 'market_buy', -l.price, 0, l.id::text), (s, 'market_sale', l.price - tax, 0, l.id::text), (s, 'market_tax', 0, tax, l.id::text);
  update public.inventory_items set owner_id = u, market_reserved = false where id = i.id;
  update public.market_listings set status = 'sold', buyer_id = u, closed_at = now(), tax_burned = tax where id = l.id;
end $$;

create or replace function public.market_cancel(p_listing_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); l public.market_listings%rowtype;
begin
  if u is null then raise exception 'Sign in required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  select * into l from public.market_listings where id = p_listing_id and seller_id = u for update;
  if not found or l.status <> 'active' then raise exception 'Listing unavailable'; end if;
  -- the listing fee is NOT refunded (it was burned), and the item waits out the relist cooldown
  update public.inventory_items set market_reserved = false, last_unlisted_at = now() where id = l.item_id and owner_id = u;
  update public.market_listings set status = 'cancelled', closed_at = now() where id = l.id;
end $$;
revoke all on function public.market_list(uuid, bigint), public.market_buy(uuid), public.market_cancel(uuid) from public, anon;
grant execute on function public.market_list(uuid, bigint), public.market_buy(uuid), public.market_cancel(uuid) to authenticated;

-- ------------------------------------------------------------------ enhancement at the NPC Merchant (blacksmith) only
create or replace function public.enhance_item(p_item_id uuid, p_protection boolean, p_npc text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); i public.inventory_items%rowtype; lvl int; rar text; cost bigint; chance numeric; ok boolean; new_lvl int;
  max_lvl int := public.cfg_num('{enhance,maxLevel}', 15)::int; safe int := public.cfg_num('{enhance,safeLevel}', 6)::int;
  rates numeric[] := array[1,1,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.22,0.15,0.1,0.06,0.03];
begin
  if u is null then raise exception 'Sign in required'; end if;
  if p_npc not in ('merchant-hollow','merchant-dawnveil','merchant-thornwatch') then raise exception 'Enhancement is only available at an NPC Merchant in town'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  select * into i from public.inventory_items where id = p_item_id and owner_id = u for update;
  if not found or i.market_reserved then raise exception 'Item unavailable'; end if;
  if not exists(select 1 from public.item_definitions d where d.id = i.item_definition_id and d.category not in ('material','trophy')) then raise exception 'This item cannot be enhanced'; end if;
  lvl := i.enhance_level; if lvl >= max_lvl then raise exception 'Already at maximum'; end if;
  rar := public.norm_rarity(i.rarity);
  if (select jsonb_typeof(value #> '{enhance,successRate}') from public.game_config where key = 'balance') = 'array' then
    select array_agg(x::numeric) into rates from public.game_config g, jsonb_array_elements_text(g.value #> '{enhance,successRate}') x where g.key = 'balance';
  end if;
  chance := coalesce(rates[lvl + 1], 0);
  cost := round(public.cfg_num(array['enhance','baseCost',rar], case rar when 'Common' then 40 when 'Uncommon' then 80 when 'Rare' then 200 when 'Epic' then 600 when 'Legendary' then 2000 when 'God' then 8000 when 'Pre-arch' then 30000 else 120000 end)
    * power(lvl + 1, public.cfg_num('{enhance,costExponent}', 1.6)))::bigint
    + case when p_protection then public.cfg_num('{enhance,protectionScrollPrice}', 25000)::bigint else 0 end;
  perform public.spend_soulgod(u, cost, 'enhance', i.id::text);
  ok := random() < chance;
  new_lvl := case when ok then lvl + 1 when lvl < safe or p_protection then lvl else greatest(0, lvl - public.cfg_num('{enhance,downgradeOnFail}', 1)::int) end;
  update public.inventory_items set enhance_level = new_lvl where id = i.id;
  return jsonb_build_object('success', ok, 'level', new_lvl, 'cost', cost, 'chance', chance);
end $$;
revoke all on function public.enhance_item(uuid, boolean, text) from public, anon;
grant execute on function public.enhance_item(uuid, boolean, text) to authenticated;

-- ------------------------------------------------------------------ NPC shop (SoulGod sink)
create table if not exists public.npc_shop_items (
  id text primary key, name text not null, price bigint not null check (price > 0), kind text not null, npc text not null, active boolean not null default true
);
alter table public.npc_shop_items enable row level security;
revoke all on public.npc_shop_items from anon, authenticated;
grant select on public.npc_shop_items to anon, authenticated;
drop policy if exists "shop is public" on public.npc_shop_items;
create policy "shop is public" on public.npc_shop_items for select using (active);
insert into public.npc_shop_items(id, name, price, kind, npc) values
  ('potion-hp-s','Small Healing Draught',30,'consumable','shop'), ('potion-hp-m','Healing Draught',120,'consumable','shop'), ('potion-hp-l','Greater Healing Draught',480,'consumable','shop'),
  ('potion-mp-s','Small Mana Tonic',30,'consumable','shop'), ('potion-mp-m','Mana Tonic',120,'consumable','shop'),
  ('scroll-return','Return Scroll',80,'consumable','shop'), ('scroll-protect','Enhancement Protection Scroll',25000,'enhance','merchant'),
  ('farm-bronze','Bronze Farm Card',5000,'farm','shop')
on conflict(id) do update set name = excluded.name, price = excluded.price, kind = excluded.kind, npc = excluded.npc;
insert into public.item_definitions(id, name, rarity, npc_value, category) select id, name, 'Common', greatest(1, price / 4), 'consumable' from public.npc_shop_items on conflict(id) do nothing;

create or replace function public.npc_shop_buy(p_item text, p_qty int) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); s public.npc_shop_items%rowtype; r uuid;
begin
  if u is null or p_qty < 1 or p_qty > 99 then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  select * into s from public.npc_shop_items where id = p_item and active;
  if not found then raise exception 'Not sold here'; end if;
  if (select count(*) from public.inventory_items where owner_id = u) >= 80 then raise exception 'Inventory full'; end if;
  perform public.spend_soulgod(u, s.price * p_qty, 'npc_shop', s.id);
  insert into public.inventory_items(owner_id, item_definition_id, rarity, quantity) values (u, s.id, 'Common', p_qty) returning id into r;
  return r;
end $$;
revoke all on function public.npc_shop_buy(text, int) from public, anon;
grant execute on function public.npc_shop_buy(text, int) to authenticated;

-- ------------------------------------------------------------------ admin dashboard numbers
create or replace function public.admin_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  return jsonb_build_object(
    'players', (select count(*) from public.player_profiles),
    'banned', (select count(*) from public.player_profiles where banned),
    'invites_total', (select count(*) from public.invite_codes where revoked_at is null),
    'invites_used', (select coalesce(sum(used_count), 0) from public.invite_codes),
    'invites_left', (select coalesce(sum(max_uses - used_count), 0) from public.invite_codes where revoked_at is null and (expires_at is null or expires_at > now())),
    'soulgod_supply', (select coalesce(sum(gold), 0) from public.player_wallets),
    'burned_24h', (select coalesce(sum(burned), 0) from public.economy_ledger where created_at > now() - interval '1 day'),
    'burned_7d', (select coalesce(sum(burned), 0) from public.economy_ledger where created_at > now() - interval '7 days'),
    'burn_by_kind', (select coalesce(jsonb_object_agg(kind, total), '{}'::jsonb) from (select kind, sum(burned) total from public.economy_ledger where created_at > now() - interval '7 days' group by kind) k),
    'active_listings', (select count(*) from public.market_listings where status = 'active'),
    'sales_7d', (select count(*) from public.market_listings where status = 'sold' and closed_at > now() - interval '7 days')
  );
end $$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

-- ------------------------------------------------------------------ first batch: 500 closed-beta codes (only when the table is empty)
do $$ begin
  if not exists(select 1 from public.invite_codes) then perform public.generate_invites_internal(500, 'closed-beta-1', null, 'Initial 500 testers', null); end if;
end $$;
commit;

-- Make yourself the first owner (replace the e-mail, run once in SQL Editor):
-- insert into public.admin_users(user_id, role) select id, 'owner' from auth.users where email = 'you@example.com' on conflict(user_id) do update set role = 'owner';
