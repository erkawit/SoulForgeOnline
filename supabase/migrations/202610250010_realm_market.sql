-- Round 10: the player market and the mailbox run by the realm, and the economy's daily numbers.
-- Run after 202610250009_characters.sql. Safe to run twice.
--
-- Why: since round 9 the realm owns every character (public.characters). The round-5 market worked on a separate
-- inventory (inventory_items / player_wallets) that the game never fills, and its functions could be called by any
-- signed-in player. From now on:
--   · realm_listings / realm_mail hold items as JSON copies of the character's item, written only by the realm
--     (service role) through the realm_* functions below, each in ONE transaction with the character it changes,
--     guarded by the character's revision (characters.rev) — an item is in a bag, a listing or a mail, never two.
--   · players can read the market (active listings), their own listings and their own mail; nothing else.
--   · the legacy economy functions are no longer callable by players.

-- ------------------------------------------------------------------ legacy economy: realm only from now on
do $$ declare f text; begin
  foreach f in array array['public.market_list(uuid,bigint)','public.market_buy(uuid)','public.market_cancel(uuid)','public.npc_sell(uuid,boolean,bigint)',
    'public.enhance_item(uuid,boolean,text)','public.npc_shop_buy(text,integer)','public.craft_item(text,text,text,text)','public.craft_with_crystals(text,text,text,text)'] loop
    begin execute format('revoke all on function %s from public, anon, authenticated', f); exception when undefined_function then null; end;
  end loop;
end $$;

-- ------------------------------------------------------------------ tables
create table if not exists public.realm_listings (
  id uuid primary key,
  seller_id uuid not null references auth.users(id) on delete cascade,
  seller_name text not null default '',
  buyer_id uuid references auth.users(id) on delete set null,
  item jsonb not null,
  definition_id text not null, rarity text not null, enhance int not null default 0 check (enhance between 0 and 15),
  qty int not null default 1 check (qty between 1 and 9999),
  price bigint not null check (price between 1 and 1000000000000),
  fee bigint not null default 0 check (fee >= 0),
  tax_burned bigint not null default 0,
  status text not null default 'active' check (status in ('active','sold','cancelled','expired')),
  created_at timestamptz not null default now(), expires_at timestamptz not null, closed_at timestamptz,
  constraint realm_listing_item_is_object check (jsonb_typeof(item) = 'object')
);
create unique index if not exists realm_listing_one_per_item on public.realm_listings((item->>'id')) where status = 'active';
create index if not exists realm_listings_browse on public.realm_listings(status, created_at desc);
create index if not exists realm_listings_seller on public.realm_listings(seller_id, status);
create index if not exists realm_listings_sales on public.realm_listings(definition_id, enhance, closed_at) where status = 'sold';
create index if not exists realm_listings_cancels on public.realm_listings(seller_id, closed_at) where status = 'cancelled';

create table if not exists public.realm_mail (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('sale','return','boss','admin')),
  gold bigint not null default 0 check (gold >= 0),
  item jsonb, note text not null default '',
  created_at timestamptz not null default now(), claimed_at timestamptz
);
create index if not exists realm_mail_open on public.realm_mail(user_id, created_at) where claimed_at is null;

create table if not exists public.economy_state (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.economy_daily (
  day date primary key, supply numeric not null, characters int not null, mail_gold numeric not null, tax numeric not null, created_at timestamptz not null default now()
);

alter table public.realm_listings enable row level security;
alter table public.realm_mail enable row level security;
alter table public.economy_state enable row level security;
alter table public.economy_daily enable row level security;
revoke all on public.realm_listings, public.realm_mail, public.economy_state, public.economy_daily from anon, authenticated;
grant select on public.realm_listings, public.realm_mail, public.economy_state to authenticated;
grant select on public.economy_daily to authenticated;
drop policy if exists "market read" on public.realm_listings;
create policy "market read" on public.realm_listings for select to authenticated
  using (status = 'active' or seller_id = (select auth.uid()) or buyer_id = (select auth.uid()) or public.is_admin());
drop policy if exists "own mail" on public.realm_mail;
create policy "own mail" on public.realm_mail for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "economy state read" on public.economy_state;
create policy "economy state read" on public.economy_state for select to authenticated using (true);
drop policy if exists "economy daily admin" on public.economy_daily;
create policy "economy daily admin" on public.economy_daily for select to authenticated using (public.is_admin());

-- the ledger learns the realm's kinds
alter table public.economy_ledger drop constraint if exists economy_ledger_kind_check;
alter table public.economy_ledger add constraint economy_ledger_kind_check check (kind in ('market_fee','market_tax','market_sale','market_buy','market_cancel','mail_claim','enhance','npc_shop','npc_sell','travel','skill_reset','admin_grant','vault','loot'));

-- ------------------------------------------------------------------ helpers
-- write a character at the expected revision (the realm's copy), or fail the whole transaction
create or replace function public.realm_write_character(p_user uuid, p_rev bigint, p_state jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare r bigint;
begin
  if jsonb_typeof(p_state) <> 'object' then raise exception 'invalid state'; end if;
  update public.characters set state = p_state, rev = rev + 1, updated_at = now() where user_id = p_user and rev = p_rev returning rev into r;
  if r is null then raise exception 'revision conflict'; end if;
  return r;
end $$;

create or replace function public.realm_list_info(p_user uuid, p_def text, p_enhance int) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'active', (select count(*) from public.realm_listings where seller_id = p_user and status = 'active'),
    'median', (select percentile_cont(0.5) within group (order by price) from public.realm_listings
                where status = 'sold' and definition_id = p_def and enhance = p_enhance and closed_at > now() - interval '7 days'),
    'cancels', (select count(*) from public.realm_listings where seller_id = p_user and status = 'cancelled' and closed_at > now() - interval '1 hour'));
$$;

-- ------------------------------------------------------------------ market
create or replace function public.realm_market_list(p_user uuid, p_rev bigint, p_state jsonb, p_listing jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare r bigint; max_active int := public.cfg_num('{market,maxActiveListings}', 20)::int;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text, 0));
  if exists (select 1 from public.player_profiles where user_id = p_user and banned) then raise exception 'Account suspended'; end if;
  if (select count(*) from public.realm_listings where seller_id = p_user and status = 'active') >= max_active then raise exception 'Too many active listings'; end if;
  r := public.realm_write_character(p_user, p_rev, p_state);
  insert into public.realm_listings(id, seller_id, seller_name, item, definition_id, rarity, enhance, qty, price, fee, expires_at)
  values ((p_listing->>'id')::uuid, p_user, coalesce(p_listing->>'seller_name', ''), p_listing->'item', p_listing->>'definition_id', p_listing->>'rarity',
          coalesce((p_listing->>'enhance')::int, 0), coalesce((p_listing->>'qty')::int, 1), (p_listing->>'price')::bigint, (p_listing->>'fee')::bigint, (p_listing->>'expires_at')::timestamptz);
  insert into public.economy_ledger(player_id, kind, amount, burned, ref) values (p_user, 'market_fee', -(p_listing->>'fee')::bigint, (p_listing->>'fee')::bigint, p_listing->>'id');
  return r;
end $$;

create or replace function public.realm_market_buy(p_user uuid, p_rev bigint, p_state jsonb, p_listing uuid, p_price bigint, p_seller_gets bigint, p_burned bigint) returns bigint
language plpgsql security definer set search_path = '' as $$
declare l public.realm_listings%rowtype; r bigint;
begin
  if p_seller_gets < 0 or p_burned < 0 or p_seller_gets + p_burned <> p_price then raise exception 'invalid split'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text, 0));
  select * into l from public.realm_listings where id = p_listing for update;
  if not found or l.status <> 'active' or l.expires_at <= now() or l.price <> p_price then raise exception 'รายการนี้ปิดไปแล้ว'; end if;
  if l.seller_id = p_user then raise exception 'ซื้อรายการของตัวเองไม่ได้'; end if;
  if exists (select 1 from public.player_profiles where user_id = p_user and banned) then raise exception 'Account suspended'; end if;
  r := public.realm_write_character(p_user, p_rev, p_state);
  update public.realm_listings set status = 'sold', buyer_id = p_user, closed_at = now(), tax_burned = p_burned where id = l.id;
  insert into public.realm_mail(user_id, kind, gold, note) values (l.seller_id, 'sale', p_seller_gets,
    format('ขาย %s ได้ %s SG (ภาษี %s)', l.item->>'name', to_char(l.price, 'FM999,999,999,999'), to_char(p_burned, 'FM999,999,999,999')));
  insert into public.economy_ledger(player_id, kind, amount, burned, ref) values
    (p_user, 'market_buy', -l.price, 0, l.id::text), (l.seller_id, 'market_sale', p_seller_gets, 0, l.id::text), (l.seller_id, 'market_tax', 0, p_burned, l.id::text);
  return r;
end $$;

create or replace function public.realm_market_cancel(p_user uuid, p_rev bigint, p_state jsonb, p_listing uuid) returns bigint
language plpgsql security definer set search_path = '' as $$
declare l public.realm_listings%rowtype; r bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text, 0));
  select * into l from public.realm_listings where id = p_listing and seller_id = p_user for update;
  if not found or l.status <> 'active' then raise exception 'รายการนี้ปิดไปแล้ว'; end if;
  r := public.realm_write_character(p_user, p_rev, p_state);
  update public.realm_listings set status = 'cancelled', closed_at = now() where id = l.id;
  insert into public.economy_ledger(player_id, kind, amount, burned, ref) values (p_user, 'market_cancel', 0, 0, l.id::text);
  return r;
end $$;

-- expired listings go back to their sellers by mail; returns the sellers (to notify the ones online)
create or replace function public.realm_market_expire() returns setof uuid
language plpgsql security definer set search_path = '' as $$
declare l public.realm_listings%rowtype;
begin
  for l in select * from public.realm_listings where status = 'active' and expires_at <= now() for update skip locked loop
    update public.realm_listings set status = 'expired', closed_at = now() where id = l.id;
    insert into public.realm_mail(user_id, kind, item, note) values (l.seller_id, 'return', l.item, format('%s หมดเวลาขาย ส่งคืน', l.item->>'name'));
    return next l.seller_id;
  end loop;
end $$;

create or replace function public.realm_mail_claim(p_user uuid, p_rev bigint, p_state jsonb, p_ids uuid[]) returns bigint
language plpgsql security definer set search_path = '' as $$
declare r bigint; n int;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text, 0));
  select count(*) into n from public.realm_mail where id = any(p_ids) and user_id = p_user and claimed_at is null;
  if n <> coalesce(array_length(p_ids, 1), 0) or n = 0 then raise exception 'จดหมายถูกรับไปแล้ว'; end if;
  r := public.realm_write_character(p_user, p_rev, p_state);
  update public.realm_mail set claimed_at = now() where id = any(p_ids);
  insert into public.economy_ledger(player_id, kind, amount, burned, ref)
    select p_user, 'mail_claim', gold, 0, id::text from public.realm_mail where id = any(p_ids) and gold > 0;
  return r;
end $$;

-- ------------------------------------------------------------------ economy: the daily SoulGod supply (inflation control input)
create or replace function public.realm_supply_day(p_day date, p_tax numeric) returns table(o_day date, o_supply numeric)
language plpgsql security definer set search_path = '' as $$
declare chars_gold numeric; mail_gold numeric; n int;
begin
  select coalesce(sum((state->'player'->>'gold')::numeric), 0), count(*) into chars_gold, n from public.characters;
  select coalesce(sum(gold), 0) into mail_gold from public.realm_mail where claimed_at is null;
  insert into public.economy_daily(day, supply, characters, mail_gold, tax) values (p_day, chars_gold + mail_gold, n, mail_gold, p_tax)
    on conflict (day) do update set supply = excluded.supply, characters = excluded.characters, mail_gold = excluded.mail_gold, tax = excluded.tax;
  return query select d.day, d.supply from public.economy_daily d order by d.day desc limit 8;
end $$;

do $$ declare f text; begin
  foreach f in array array['public.realm_write_character(uuid,bigint,jsonb)','public.realm_list_info(uuid,text,integer)','public.realm_market_list(uuid,bigint,jsonb,jsonb)',
    'public.realm_market_buy(uuid,bigint,jsonb,uuid,bigint,bigint,bigint)','public.realm_market_cancel(uuid,bigint,jsonb,uuid)','public.realm_market_expire()',
    'public.realm_mail_claim(uuid,bigint,jsonb,uuid[])','public.realm_supply_day(date,numeric)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- admin overview gains the economy numbers
create or replace function public.admin_character_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  return jsonb_build_object(
    'characters', (select count(*) from public.characters),
    'active_24h', (select count(*) from public.characters where updated_at > now() - interval '24 hours'),
    'soulgod_total', (select coalesce(sum((state->'player'->>'gold')::numeric), 0) from public.characters),
    'level_avg', (select coalesce(round(avg((state->'player'->>'level')::numeric), 1), 0) from public.characters),
    'mail_gold', (select coalesce(sum(gold), 0) from public.realm_mail where claimed_at is null),
    'listings_active', (select count(*) from public.realm_listings where status = 'active'),
    'burned_7d', (select coalesce(sum(burned), 0) from public.economy_ledger where created_at > now() - interval '7 days'),
    'market_tax', (select value from public.economy_state where key = 'market_tax'),
    'supply_days', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'supply', supply, 'tax', tax) order by day), '[]'::jsonb)
                    from (select * from public.economy_daily order by day desc limit 14) d)
  );
end $$;
revoke all on function public.admin_character_stats() from public, anon;
grant execute on function public.admin_character_stats() to authenticated;
