-- SoulForge: ติดตั้งฐานข้อมูลทั้งหมดในครั้งเดียว (สร้างจาก supabase/migrations ทุกไฟล์ตามลำดับ)
-- ใช้กับโปรเจกต์ Supabase ใหม่: SQL Editor → New query → วางทั้งไฟล์ → Run
-- โปรเจกต์ที่เคยรันบางไฟล์แล้ว: รันเฉพาะไฟล์ใน migrations ที่ยังไม่เคยรันตามลำดับเลขแทน

-- ===== 202610190001_initial.sql =====
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


-- ===== 202610190002_multiplayer.sql =====
-- Phase 2 authoritative economy. Run after 202610190001_initial.sql.
create extension if not exists pgcrypto;
create table if not exists public.world_loot (
 id uuid primary key default gen_random_uuid(), room_id text not null,
 boss_instance_id uuid not null, item_definition_id text not null,
 rarity text not null check(rarity in ('common','rare','epic','legendary')),
 x double precision not null, z double precision not null,
 claimed_by uuid references auth.users(id), claimed_at timestamptz,
 expires_at timestamptz not null,created_at timestamptz not null default now()
);
create index if not exists world_loot_room_idx on public.world_loot(room_id,expires_at);
create table if not exists public.inventory_items (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),
 item_definition_id text not null,rarity text not null,quantity integer not null default 1 check(quantity>0),
 source_loot_id uuid unique references public.world_loot(id),
 created_at timestamptz not null default now()
);
create index if not exists inventory_items_owner_idx on public.inventory_items(owner_id);
create table if not exists public.farm_cards (
 player_id uuid not null references auth.users(id),card_type text not null check(card_type in ('bronze','silver','gold','platinum')),
 quantity integer not null default 0 check(quantity>=0),primary key(player_id,card_type)
);
create table if not exists public.offline_vault_jobs (
 id uuid primary key default gen_random_uuid(),player_id uuid not null references auth.users(id),
 card_type text not null,zone_id text not null,started_at timestamptz not null default now(),
 ends_at timestamptz not null,status text not null default 'active' check(status in ('active','completed','claimed')),
 gold_reward integer not null default 0,exp_reward integer not null default 0,
 claimed_at timestamptz,created_at timestamptz not null default now(),check(ends_at>started_at)
);
create unique index if not exists active_vault_per_player on public.offline_vault_jobs(player_id) where status='active';
create table if not exists public.player_wallets (
 player_id uuid primary key references auth.users(id),gold bigint not null default 0 check(gold>=0),exp bigint not null default 0 check(exp>=0)
);
-- Deny all direct writes to authoritative tables; read own items/jobs only.
do $$ declare t text; begin foreach t in array array['world_loot','inventory_items','farm_cards','offline_vault_jobs','player_wallets'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop; end $$;
create policy "select own inventory" on public.inventory_items for select to authenticated using(owner_id=(select auth.uid()));
create policy "select unclaimed world loot" on public.world_loot for select to authenticated using(claimed_by is null and expires_at>now());
create policy "select own farm cards" on public.farm_cards for select to authenticated using(player_id=(select auth.uid()));
create policy "select own vault jobs" on public.offline_vault_jobs for select to authenticated using(player_id=(select auth.uid()));
create policy "select own wallet" on public.player_wallets for select to authenticated using(player_id=(select auth.uid()));
-- Only server secret/service_role may invoke these functions.
create or replace function public.claim_world_loot(p_loot_id uuid,p_player_id uuid,p_room_id text,p_x double precision,p_z double precision)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_loot public.world_loot%rowtype;v_item uuid;
begin
 select * into v_loot from public.world_loot where id=p_loot_id for update;
 if not found or v_loot.claimed_by is not null or v_loot.expires_at<=now() or v_loot.room_id<>p_room_id then raise exception 'Loot unavailable';end if;
 if power(v_loot.x-p_x,2)+power(v_loot.z-p_z,2)>power(2.5,2) then raise exception 'Out of range';end if;
 if (select count(*) from public.inventory_items where owner_id=p_player_id)>=80 then raise exception 'Inventory full';end if;
 update public.world_loot set claimed_by=p_player_id,claimed_at=now() where id=p_loot_id;
 insert into public.inventory_items(owner_id,item_definition_id,rarity,source_loot_id)
 values(p_player_id,v_loot.item_definition_id,v_loot.rarity,v_loot.id) returning id into v_item;
 return v_item;
end;$$;
revoke all on function public.claim_world_loot(uuid,uuid,text,double precision,double precision) from public,anon,authenticated;
grant execute on function public.claim_world_loot(uuid,uuid,text,double precision,double precision) to service_role;
-- Farm Card is consumed atomically with starting a job; caller identity derives from trusted server JWT user.
create or replace function public.start_offline_vault(p_player_id uuid,p_card_type text,p_zone_id text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_hours integer;v_gold integer;v_exp integer;v_id uuid;
begin
 select case p_card_type when 'bronze' then 1 when 'silver' then 4 when 'gold' then 8 when 'platinum' then 12 else null end into v_hours;
 if v_hours is null then raise exception 'Invalid card';end if;
 if p_zone_id not in ('ancient_ruins','shadow_forest','abyss_dungeon','soul_rift') then raise exception 'Invalid zone';end if;
 if exists(select 1 from public.offline_vault_jobs where player_id=p_player_id and status='active') then raise exception 'Vault already active';end if;
 update public.farm_cards set quantity=quantity-1 where player_id=p_player_id and card_type=p_card_type and quantity>0;
 if not found then raise exception 'Farm card missing';end if;
 v_gold:=case p_card_type when 'bronze' then 1000 when 'silver' then 1800 when 'gold' then 2800 else 4500 end*v_hours;
 v_exp:=case p_card_type when 'bronze' then 500 when 'silver' then 850 when 'gold' then 1300 else 2000 end*v_hours;
 insert into public.offline_vault_jobs(player_id,card_type,zone_id,ends_at,gold_reward,exp_reward)
 values(p_player_id,p_card_type,p_zone_id,now()+make_interval(hours=>v_hours),v_gold,v_exp) returning id into v_id;
 return v_id;
end;$$;
create or replace function public.claim_offline_vault(p_player_id uuid,p_job_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_job public.offline_vault_jobs%rowtype;
begin
 select * into v_job from public.offline_vault_jobs where id=p_job_id and player_id=p_player_id for update;
 if not found or v_job.status='claimed' or v_job.ends_at>now() then raise exception 'Vault reward unavailable';end if;
 insert into public.player_wallets(player_id,gold,exp) values(p_player_id,v_job.gold_reward,v_job.exp_reward)
 on conflict(player_id) do update set gold=public.player_wallets.gold+excluded.gold,exp=public.player_wallets.exp+excluded.exp;
 update public.offline_vault_jobs set status='claimed',claimed_at=now() where id=p_job_id;
 return jsonb_build_object('gold',v_job.gold_reward,'exp',v_job.exp_reward);
end;$$;
revoke all on function public.start_offline_vault(uuid,text,text) from public,anon,authenticated;
revoke all on function public.claim_offline_vault(uuid,uuid) from public,anon,authenticated;
grant execute on function public.start_offline_vault(uuid,text,text) to service_role;
grant execute on function public.claim_offline_vault(uuid,uuid) to service_role;


-- ===== 202610220003_marketplace.sql =====
-- Requires initial + multiplayer migrations. Currency UI name: SoulGod.
-- Keep existing player_wallets.gold column for backwards compatibility.
begin;
create table if not exists public.item_definitions (
 id text primary key, name text not null, rarity text not null,
 npc_value bigint not null default 1 check(npc_value between 1 and 100000),
 category text not null
);
alter table public.inventory_items add column if not exists market_reserved boolean not null default false;
create table if not exists public.market_listings (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references auth.users(id), buyer_id uuid references auth.users(id),
 item_id uuid references public.inventory_items(id) on delete set null,
 item_definition_id text not null, rarity text not null,quantity integer not null check(quantity>0),
 price bigint not null check(price between 1 and 1000000000000),
 status text not null default 'active' check(status in ('active','sold','cancelled')),
 created_at timestamptz not null default now(),closed_at timestamptz
);
create unique index if not exists one_active_listing_per_item on public.market_listings(item_id) where status='active';
create index if not exists market_browse on public.market_listings(status,created_at desc);
alter table public.item_definitions enable row level security;
alter table public.market_listings enable row level security;
revoke all on public.item_definitions,public.market_listings from public,anon,authenticated;
grant select on public.item_definitions to anon,authenticated;
grant all on public.item_definitions,public.market_listings to service_role;
grant select on public.market_listings to authenticated;
drop policy if exists "catalog read" on public.item_definitions;
create policy "catalog read" on public.item_definitions for select using(true);
drop policy if exists "market read" on public.market_listings;
create policy "market read" on public.market_listings for select to authenticated using(status='active' or seller_id=(select auth.uid()) or buyer_id=(select auth.uid()));
-- Transactions serialize per account. No snapshot data is ever accepted here.
create or replace function public.market_list(p_item_id uuid,p_price bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();i public.inventory_items%rowtype;r uuid;
begin
 if u is null or p_price is null or p_price<1 or p_price>1000000000000 then raise exception 'Invalid request';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
 select * into i from public.inventory_items where id=p_item_id and owner_id=u for update;
 if not found or i.market_reserved then raise exception 'Item unavailable';end if;
 update public.inventory_items set market_reserved=true where id=i.id;
 insert into public.market_listings(seller_id,item_id,item_definition_id,rarity,quantity,price) values(u,i.id,i.item_definition_id,i.rarity,i.quantity,p_price) returning id into r;
 return r;
end;$$;
create or replace function public.market_buy(p_listing_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();l public.market_listings%rowtype;s uuid;a uuid;i public.inventory_items%rowtype;
begin
 if u is null then raise exception 'Sign in required';end if;
 select seller_id into s from public.market_listings where id=p_listing_id;
 if s is null or s=u then raise exception 'Invalid listing';end if;
 -- Acquire account locks in deterministic UUID order for simultaneous cross-purchases.
 for a in select x from unnest(array[u,s]) x order by x loop
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(a::text,0));end loop;
 select * into l from public.market_listings where id=p_listing_id for update;
 if l.status<>'active' or l.item_id is null then raise exception 'Listing closed';end if;
 select * into i from public.inventory_items where id=l.item_id for update;
 if not found or i.owner_id<>s or not i.market_reserved or i.quantity<>l.quantity then raise exception 'Item unavailable';end if;
 if (select count(*) from public.inventory_items where owner_id=u)>=80 then raise exception 'Inventory full';end if;
 update public.player_wallets set gold=gold-l.price where player_id=u and gold>=l.price;
 if not found then raise exception 'Insufficient SoulGod';end if;
 insert into public.player_wallets(player_id,gold) values(s,l.price) on conflict(player_id) do update set gold=public.player_wallets.gold+excluded.gold;
 update public.inventory_items set owner_id=u,market_reserved=false where id=i.id;
 update public.market_listings set status='sold',buyer_id=u,closed_at=now() where id=l.id;
end;$$;
create or replace function public.market_cancel(p_listing_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();l public.market_listings%rowtype;
begin
 if u is null then raise exception 'Sign in required';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
 select * into l from public.market_listings where id=p_listing_id and seller_id=u for update;
 if not found or l.status<>'active' then raise exception 'Listing unavailable';end if;
 update public.inventory_items set market_reserved=false where id=l.item_id and owner_id=u;
 update public.market_listings set status='cancelled',closed_at=now() where id=l.id;
end;$$;
create or replace function public.npc_sell(p_item_id uuid,p_confirm boolean,p_expected_value bigint)
returns bigint language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();i public.inventory_items%rowtype;v bigint;
begin
 if u is null or p_confirm is distinct from true then raise exception 'Sale confirmation required';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
 select * into i from public.inventory_items where id=p_item_id and owner_id=u for update;
 if not found or i.market_reserved then raise exception 'Item unavailable or listed';end if;
 select coalesce((select npc_value from public.item_definitions where id=i.item_definition_id),1)*i.quantity::bigint into v;
 if p_expected_value is distinct from v then raise exception 'Price changed; confirm again';end if;
 delete from public.inventory_items where id=i.id;
 insert into public.player_wallets(player_id,gold) values(u,v) on conflict(player_id) do update set gold=public.player_wallets.gold+excluded.gold;
 return v;
end;$$;
revoke all on function public.market_list(uuid,bigint),public.market_buy(uuid),public.market_cancel(uuid),public.npc_sell(uuid,boolean,bigint) from public,anon;
grant execute on function public.market_list(uuid,bigint),public.market_buy(uuid),public.market_cancel(uuid),public.npc_sell(uuid,boolean,bigint) to authenticated;
commit;


-- ===== 202610220004_catalog.sql =====
-- Canonical server-side prices; never trust values supplied by a client.
begin;
insert into public.item_definitions(id,name,rarity,npc_value,category) values
('heavy-armor-0','Ironbound Vestment','Common',3,'heavy'),
('heavy-helmet-0','Ironbound helmet','Common',1,'heavy'),
('heavy-gloves-0','Ironbound gloves','Common',1,'heavy'),
('heavy-boots-0','Ironbound boots','Common',1,'heavy'),
('heavy-armor-1','Mossguard Vestment','Uncommon',6,'heavy'),
('heavy-helmet-1','Mossguard helmet','Uncommon',2,'heavy'),
('heavy-gloves-1','Mossguard gloves','Uncommon',2,'heavy'),
('heavy-boots-1','Mossguard boots','Uncommon',2,'heavy'),
('heavy-armor-2','Azure Bastion Vestment','Rare',9,'heavy'),
('heavy-helmet-2','Azure Bastion helmet','Rare',3,'heavy'),
('heavy-gloves-2','Azure Bastion gloves','Rare',3,'heavy'),
('heavy-boots-2','Azure Bastion boots','Rare',3,'heavy'),
('heavy-armor-3','Duskwarden Vestment','Epic',12,'heavy'),
('heavy-helmet-3','Duskwarden helmet','Epic',4,'heavy'),
('heavy-gloves-3','Duskwarden gloves','Epic',4,'heavy'),
('heavy-boots-3','Duskwarden boots','Epic',4,'heavy'),
('heavy-armor-4','Blood Regent Vestment','Legendary',15,'heavy'),
('heavy-helmet-4','Blood Regent helmet','Legendary',5,'heavy'),
('heavy-gloves-4','Blood Regent gloves','Legendary',5,'heavy'),
('heavy-boots-4','Blood Regent boots','Legendary',5,'heavy'),
('heavy-armor-5','Sun Sentinel Vestment','God',18,'heavy'),
('heavy-helmet-5','Sun Sentinel helmet','God',6,'heavy'),
('heavy-gloves-5','Sun Sentinel gloves','God',6,'heavy'),
('heavy-boots-5','Sun Sentinel boots','God',6,'heavy'),
('heavy-armor-6','Solar Sovereign Vestment','Pre-arch',21,'heavy'),
('heavy-helmet-6','Solar Sovereign helmet','Pre-arch',7,'heavy'),
('heavy-gloves-6','Solar Sovereign gloves','Pre-arch',7,'heavy'),
('heavy-boots-6','Solar Sovereign boots','Pre-arch',7,'heavy'),
('heavy-armor-7','Astral Bulwark Vestment','Arch',24,'heavy'),
('heavy-helmet-7','Astral Bulwark helmet','Arch',8,'heavy'),
('heavy-gloves-7','Astral Bulwark gloves','Arch',8,'heavy'),
('heavy-boots-7','Astral Bulwark boots','Arch',8,'heavy'),
('light-armor-0','Trailhide Vestment','Common',3,'light'),
('light-helmet-0','Trailhide helmet','Common',1,'light'),
('light-gloves-0','Trailhide gloves','Common',1,'light'),
('light-boots-0','Trailhide boots','Common',1,'light'),
('light-armor-1','Briarweave Vestment','Uncommon',6,'light'),
('light-helmet-1','Briarweave helmet','Uncommon',2,'light'),
('light-gloves-1','Briarweave gloves','Uncommon',2,'light'),
('light-boots-1','Briarweave boots','Uncommon',2,'light'),
('light-armor-2','Skyhunter Vestment','Rare',9,'light'),
('light-helmet-2','Skyhunter helmet','Rare',3,'light'),
('light-gloves-2','Skyhunter gloves','Rare',3,'light'),
('light-boots-2','Skyhunter boots','Rare',3,'light'),
('light-armor-3','Moonstalker Vestment','Epic',12,'light'),
('light-helmet-3','Moonstalker helmet','Epic',4,'light'),
('light-gloves-3','Moonstalker gloves','Epic',4,'light'),
('light-boots-3','Moonstalker boots','Epic',4,'light'),
('light-armor-4','Crimson Falcon Vestment','Legendary',15,'light'),
('light-helmet-4','Crimson Falcon helmet','Legendary',5,'light'),
('light-gloves-4','Crimson Falcon gloves','Legendary',5,'light'),
('light-boots-4','Crimson Falcon boots','Legendary',5,'light'),
('light-armor-5','Dawnstrider Vestment','God',18,'light'),
('light-helmet-5','Dawnstrider helmet','God',6,'light'),
('light-gloves-5','Dawnstrider gloves','God',6,'light'),
('light-boots-5','Dawnstrider boots','God',6,'light'),
('light-armor-6','Ember Warden Vestment','Pre-arch',21,'light'),
('light-helmet-6','Ember Warden helmet','Pre-arch',7,'light'),
('light-gloves-6','Ember Warden gloves','Pre-arch',7,'light'),
('light-boots-6','Ember Warden boots','Pre-arch',7,'light'),
('light-armor-7','Celestial Hunt Vestment','Arch',24,'light'),
('light-helmet-7','Celestial Hunt helmet','Arch',8,'light'),
('light-gloves-7','Celestial Hunt gloves','Arch',8,'light'),
('light-boots-7','Celestial Hunt boots','Arch',8,'light'),
('robes-armor-0','Ashcloth Vestment','Common',3,'robes'),
('robes-helmet-0','Ashcloth helmet','Common',1,'robes'),
('robes-gloves-0','Ashcloth gloves','Common',1,'robes'),
('robes-boots-0','Ashcloth boots','Common',1,'robes'),
('robes-armor-1','Verdant Script Vestment','Uncommon',6,'robes'),
('robes-helmet-1','Verdant Script helmet','Uncommon',2,'robes'),
('robes-gloves-1','Verdant Script gloves','Uncommon',2,'robes'),
('robes-boots-1','Verdant Script boots','Uncommon',2,'robes'),
('robes-armor-2','Sapphire Veil Vestment','Rare',9,'robes'),
('robes-helmet-2','Sapphire Veil helmet','Rare',3,'robes'),
('robes-gloves-2','Sapphire Veil gloves','Rare',3,'robes'),
('robes-boots-2','Sapphire Veil boots','Rare',3,'robes'),
('robes-armor-3','Violet Oracle Vestment','Epic',12,'robes'),
('robes-helmet-3','Violet Oracle helmet','Epic',4,'robes'),
('robes-gloves-3','Violet Oracle gloves','Epic',4,'robes'),
('robes-boots-3','Violet Oracle boots','Epic',4,'robes'),
('robes-armor-4','Scarlet Covenant Vestment','Legendary',15,'robes'),
('robes-helmet-4','Scarlet Covenant helmet','Legendary',5,'robes'),
('robes-gloves-4','Scarlet Covenant gloves','Legendary',5,'robes'),
('robes-boots-4','Scarlet Covenant boots','Legendary',5,'robes'),
('robes-armor-5','Golden Liturgy Vestment','God',18,'robes'),
('robes-helmet-5','Golden Liturgy helmet','God',6,'robes'),
('robes-gloves-5','Golden Liturgy gloves','God',6,'robes'),
('robes-boots-5','Golden Liturgy boots','God',6,'robes'),
('robes-armor-6','Solar Canticle Vestment','Pre-arch',21,'robes'),
('robes-helmet-6','Solar Canticle helmet','Pre-arch',7,'robes'),
('robes-gloves-6','Solar Canticle gloves','Pre-arch',7,'robes'),
('robes-boots-6','Solar Canticle boots','Pre-arch',7,'robes'),
('robes-armor-7','Astral Testament Vestment','Arch',24,'robes'),
('robes-helmet-7','Astral Testament helmet','Arch',8,'robes'),
('robes-gloves-7','Astral Testament gloves','Arch',8,'robes'),
('robes-boots-7','Astral Testament boots','Arch',8,'robes'),
('accessory-defense-0','Common defense Seal','Common',1,'defense'),
('accessory-physical-0','Common physical Seal','Common',1,'physical'),
('accessory-magic-0','Common magic Seal','Common',1,'magic'),
('accessory-elemental-0','Common elemental Seal','Common',1,'elemental'),
('accessory-defense-1','Uncommon defense Seal','Uncommon',2,'defense'),
('accessory-physical-1','Uncommon physical Seal','Uncommon',2,'physical'),
('accessory-magic-1','Uncommon magic Seal','Uncommon',2,'magic'),
('accessory-elemental-1','Uncommon elemental Seal','Uncommon',2,'elemental'),
('accessory-defense-2','Rare defense Seal','Rare',3,'defense'),
('accessory-physical-2','Rare physical Seal','Rare',3,'physical'),
('accessory-magic-2','Rare magic Seal','Rare',3,'magic'),
('accessory-elemental-2','Rare elemental Seal','Rare',3,'elemental'),
('accessory-defense-3','Epic defense Seal','Epic',4,'defense'),
('accessory-physical-3','Epic physical Seal','Epic',4,'physical'),
('accessory-magic-3','Epic magic Seal','Epic',4,'magic'),
('accessory-elemental-3','Epic elemental Seal','Epic',4,'elemental'),
('accessory-defense-4','Legendary defense Seal','Legendary',5,'defense'),
('accessory-physical-4','Legendary physical Seal','Legendary',5,'physical'),
('accessory-magic-4','Legendary magic Seal','Legendary',5,'magic'),
('accessory-elemental-4','Legendary elemental Seal','Legendary',5,'elemental'),
('accessory-defense-5','God defense Seal','God',6,'defense'),
('accessory-physical-5','God physical Seal','God',6,'physical'),
('accessory-magic-5','God magic Seal','God',6,'magic'),
('accessory-elemental-5','God elemental Seal','God',6,'elemental'),
('accessory-defense-6','Pre-arch defense Seal','Pre-arch',7,'defense'),
('accessory-physical-6','Pre-arch physical Seal','Pre-arch',7,'physical'),
('accessory-magic-6','Pre-arch magic Seal','Pre-arch',7,'magic'),
('accessory-elemental-6','Pre-arch elemental Seal','Pre-arch',7,'elemental'),
('accessory-defense-7','Arch defense Seal','Arch',8,'defense'),
('accessory-physical-7','Arch physical Seal','Arch',8,'physical'),
('accessory-magic-7','Arch magic Seal','Arch',8,'magic'),
('accessory-elemental-7','Arch elemental Seal','Arch',8,'elemental'),
('weapon-Warrior-0','Common Oathblade & Shield','Common',2,'Warrior'),
('weapon-Mage-0','Common Starfall Staff','Common',2,'Mage'),
('weapon-Priest-0','Common Dawn Mace & Tome','Common',2,'Priest'),
('weapon-Archer-0','Common Thornbow & Quiver','Common',2,'Archer'),
('weapon-Enchanter-0','Common Rune Focus & Grimoire','Common',2,'Enchanter'),
('weapon-Warrior-1','Uncommon Oathblade & Shield','Uncommon',4,'Warrior'),
('weapon-Mage-1','Uncommon Starfall Staff','Uncommon',4,'Mage'),
('weapon-Priest-1','Uncommon Dawn Mace & Tome','Uncommon',4,'Priest'),
('weapon-Archer-1','Uncommon Thornbow & Quiver','Uncommon',4,'Archer'),
('weapon-Enchanter-1','Uncommon Rune Focus & Grimoire','Uncommon',4,'Enchanter'),
('weapon-Warrior-2','Rare Oathblade & Shield','Rare',6,'Warrior'),
('weapon-Mage-2','Rare Starfall Staff','Rare',6,'Mage'),
('weapon-Priest-2','Rare Dawn Mace & Tome','Rare',6,'Priest'),
('weapon-Archer-2','Rare Thornbow & Quiver','Rare',6,'Archer'),
('weapon-Enchanter-2','Rare Rune Focus & Grimoire','Rare',6,'Enchanter'),
('weapon-Warrior-3','Epic Oathblade & Shield','Epic',8,'Warrior'),
('weapon-Mage-3','Epic Starfall Staff','Epic',8,'Mage'),
('weapon-Priest-3','Epic Dawn Mace & Tome','Epic',8,'Priest'),
('weapon-Archer-3','Epic Thornbow & Quiver','Epic',8,'Archer'),
('weapon-Enchanter-3','Epic Rune Focus & Grimoire','Epic',8,'Enchanter'),
('weapon-Warrior-4','Legendary Oathblade & Shield','Legendary',10,'Warrior'),
('weapon-Mage-4','Legendary Starfall Staff','Legendary',10,'Mage'),
('weapon-Priest-4','Legendary Dawn Mace & Tome','Legendary',10,'Priest'),
('weapon-Archer-4','Legendary Thornbow & Quiver','Legendary',10,'Archer'),
('weapon-Enchanter-4','Legendary Rune Focus & Grimoire','Legendary',10,'Enchanter'),
('weapon-Warrior-5','God Oathblade & Shield','God',12,'Warrior'),
('weapon-Mage-5','God Starfall Staff','God',12,'Mage'),
('weapon-Priest-5','God Dawn Mace & Tome','God',12,'Priest'),
('weapon-Archer-5','God Thornbow & Quiver','God',12,'Archer'),
('weapon-Enchanter-5','God Rune Focus & Grimoire','God',12,'Enchanter'),
('weapon-Warrior-6','Pre-arch Oathblade & Shield','Pre-arch',14,'Warrior'),
('weapon-Mage-6','Pre-arch Starfall Staff','Pre-arch',14,'Mage'),
('weapon-Priest-6','Pre-arch Dawn Mace & Tome','Pre-arch',14,'Priest'),
('weapon-Archer-6','Pre-arch Thornbow & Quiver','Pre-arch',14,'Archer'),
('weapon-Enchanter-6','Pre-arch Rune Focus & Grimoire','Pre-arch',14,'Enchanter'),
('weapon-Warrior-7','Arch Oathblade & Shield','Arch',16,'Warrior'),
('weapon-Mage-7','Arch Starfall Staff','Arch',16,'Mage'),
('weapon-Priest-7','Arch Dawn Mace & Tome','Arch',16,'Priest'),
('weapon-Archer-7','Arch Thornbow & Quiver','Arch',16,'Archer'),
('weapon-Enchanter-7','Arch Rune Focus & Grimoire','Arch',16,'Enchanter'),
('material-3','Epic Eclipse Shard','Epic',1,'material'),
('trophy-3','Epic Dungeon Relic','Epic',1000,'trophy'),
('material-4','Legendary Regent Core','Legendary',1,'material'),
('trophy-4','Legendary Dungeon Relic','Legendary',5000,'trophy'),
('material-6','Pre-arch Solar Heart','Pre-arch',1,'material'),
('trophy-6','Pre-arch Dungeon Relic','Pre-arch',10000,'trophy')
on conflict(id) do update set name=excluded.name,rarity=excluded.rarity,npc_value=excluded.npc_value,category=excluded.category;
commit;


-- ===== 202610230005_closed_beta.sql =====
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


-- ===== 202610230006_play.sql =====
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


-- ===== 202610230007_sprites_admin.sql =====
-- SoulForge 0007: 2.5D sprite appearance + invite pre-check + admin bootstrap helper.
-- Run AFTER 0001 … 0006. Idempotent.
begin;

-- ------------------------------------------------------------------ appearance (compact-cast male / female sheet)
alter table public.player_profiles add column if not exists gender text not null default 'm';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'player_profiles_gender_check') then
    alter table public.player_profiles add constraint player_profiles_gender_check check (gender in ('m','f'));
  end if;
end $$;

-- create_character gains the appearance; the old 2-argument form keeps working (defaults to male)
drop function if exists public.create_character(text, text);
create or replace function public.create_character(p_name text, p_class text, p_gender text default 'm') returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p.class_id is not null then raise exception 'CHARACTER_EXISTS'; end if;
  if p_class not in ('Warrior','Mage','Priest','Archer','Enchanter') then raise exception 'CLASS_INVALID'; end if;
  if coalesce(p_gender,'m') not in ('m','f') then raise exception 'GENDER_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.player_profiles set display_name = p_name, class_id = p_class, gender = coalesce(p_gender,'m'), character_created_at = now() where user_id = me;
end $$;
revoke all on function public.create_character(text, text, text) from public, anon;
grant execute on function public.create_character(text, text, text) to authenticated;

-- ------------------------------------------------------------------ invite pre-check (sign-up form appears only after this says OK)
-- Read-only: does NOT consume the code. Called by /api/auth/check-invite with the service role (rate-limited there).
create or replace function public.peek_invite(p_code text) returns text
language plpgsql stable security definer set search_path='' as $$
declare c public.invite_codes%rowtype; cap int := public.cfg_num('{beta,maxPlayers}', 500)::int;
begin
  select * into c from public.invite_codes where code = upper(trim(p_code));
  if not found or c.revoked_at is not null then return 'INVITE_INVALID'; end if;
  if c.expires_at is not null and c.expires_at <= now() then return 'INVITE_EXPIRED'; end if;
  if c.used_count >= c.max_uses then return 'INVITE_USED'; end if;
  if (select count(*) from public.player_profiles) >= cap then return 'BETA_FULL'; end if;
  return 'OK';
end $$;
revoke all on function public.peek_invite(text) from public, anon, authenticated;

-- ------------------------------------------------------------------ admin bootstrap
-- scripts/create-admin.mjs creates the auth user (email + password) with the service key, then calls this.
-- Admins sign in on the normal login form (username "admin" = admin@soulforge.local) and open /admin.
create or replace function public.bootstrap_admin(p_user uuid, p_role text default 'owner') returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_role not in ('owner','gm') then raise exception 'ROLE_INVALID'; end if;
  insert into public.admin_users(user_id, role) values (p_user, p_role)
    on conflict (user_id) do update set role = excluded.role;
  insert into public.admin_audit_log(admin_id, action, detail) values (p_user, 'bootstrap_admin', jsonb_build_object('role', p_role));
end $$;
revoke all on function public.bootstrap_admin(uuid, text) from public, anon, authenticated;

commit;


-- ===== 202610240008_craft_raid.sql =====
-- Round 2: crafting at the NPC Merchant (SoulGod + materials, Legendary+ may fail into a crystal, 3 crystals = 100 %),
-- the new catalog items (ore, crystals, food, the Thai costume) and the world-boss raid results (top-10 dashboard).
-- Mirrors src/game/balance/craft.ts and apps/game-server/src/raid.ts. Run after 202610230007_sprites_admin.sql.
begin;

-- ------------------------------------------------------------------ ledger kinds for the new sinks / sources
alter table public.economy_ledger drop constraint if exists economy_ledger_kind_check;
alter table public.economy_ledger add constraint economy_ledger_kind_check check (kind in
  ('market_fee','market_tax','market_sale','market_buy','enhance','npc_shop','npc_sell','travel','skill_reset','admin_grant','vault','loot','craft','boss_reward','quest'));

-- ------------------------------------------------------------------ catalog
insert into public.item_definitions(id, name, rarity, npc_value, category) values
  ('material-ore', 'Soulforged Ore', 'Common', 1, 'material'),
  ('crystal-Legendary', 'Legendary Forge Crystal', 'Legendary', 1, 'crystal'),
  ('crystal-God', 'God Forge Crystal', 'God', 1, 'crystal'),
  ('crystal-Pre-arch', 'Pre-arch Forge Crystal', 'Pre-arch', 1, 'crystal'),
  ('crystal-Arch', 'Arch Forge Crystal', 'Arch', 1, 'crystal'),
  ('food-hunter-stew', 'Hunter''s Stew', 'Common', 22, 'consumable'),
  ('food-iron-bread', 'Ironbark Bread', 'Common', 22, 'consumable'),
  ('food-ember-tea', 'Ember Tea', 'Common', 30, 'consumable'),
  ('costume-thai-white-gold', 'Thai White & Gold Attire', 'God', 2000, 'costume')
on conflict (id) do nothing;
insert into public.npc_shop_items(id, name, price, kind, npc) values
  ('food-hunter-stew', 'Hunter''s Stew', 90, 'food', 'shop'), ('food-iron-bread', 'Ironbark Bread', 90, 'food', 'shop'),
  ('food-ember-tea', 'Ember Tea', 120, 'food', 'shop'), ('costume-thai-white-gold', 'Thai White & Gold Attire', 20000, 'costume', 'shop')
on conflict (id) do nothing;

-- ------------------------------------------------------------------ helpers
create or replace function public.rarity_tier(r text) returns int language sql immutable set search_path='' as $$
  select array_position(array['Common','Uncommon','Rare','Epic','Legendary','God','Pre-arch','Arch'], public.norm_rarity(r)) - 1;
$$;
/** catalog id for a crafted piece: weapon by class, seal by class role, armour by armour family */
create or replace function public.craft_def_id(p_rarity text, p_class text, p_slot text) returns text language sql immutable set search_path='' as $$
  select case
    when p_slot = 'weapon' then 'weapon-' || p_class || '-' || public.rarity_tier(p_rarity)
    when p_slot = 'ring' then 'accessory-' || (case p_class when 'Warrior' then 'defense' when 'Archer' then 'physical' when 'Mage' then 'magic' else 'elemental' end) || '-' || public.rarity_tier(p_rarity)
    else (case p_class when 'Warrior' then 'heavy' when 'Archer' then 'light' else 'robes' end) || '-' || p_slot || '-' || public.rarity_tier(p_rarity) end;
$$;
/** one value of a per-rarity craft table from game_config (craft.<table>.<Rarity>) with the shipped default */
create or replace function public.craft_cfg(p_table text, p_rarity text, p_defaults numeric[]) returns numeric language sql stable security definer set search_path='' as $$
  select public.cfg_num(array['craft', p_table, public.norm_rarity(p_rarity)], p_defaults[public.rarity_tier(p_rarity) + 1]);
$$;
/** take p_qty of a stackable item (oldest stacks first); raises if the player does not have enough */
create or replace function public.take_stack(p_user uuid, p_def text, p_qty int) returns void language plpgsql security definer set search_path='' as $$
declare r record; left_ int := p_qty;
begin
  if p_qty <= 0 then return; end if;
  if coalesce((select sum(quantity) from public.inventory_items where owner_id = p_user and item_definition_id = p_def and not market_reserved), 0) < p_qty then
    raise exception 'Not enough % (need %)', p_def, p_qty; end if;
  for r in select id, quantity from public.inventory_items where owner_id = p_user and item_definition_id = p_def and not market_reserved order by created_at for update loop
    exit when left_ <= 0;
    if r.quantity <= left_ then delete from public.inventory_items where id = r.id; left_ := left_ - r.quantity;
    else update public.inventory_items set quantity = quantity - left_ where id = r.id; left_ := 0; end if;
  end loop;
end $$;
create or replace function public.give_stack(p_user uuid, p_def text, p_rarity text, p_qty int) returns void language plpgsql security definer set search_path='' as $$
begin
  update public.inventory_items set quantity = quantity + p_qty where id = (select id from public.inventory_items where owner_id = p_user and item_definition_id = p_def and not market_reserved order by created_at limit 1);
  if not found then insert into public.inventory_items(owner_id, item_definition_id, rarity, quantity) values (p_user, p_def, p_rarity, p_qty); end if;
end $$;
revoke all on function public.take_stack(uuid, text, int), public.give_stack(uuid, text, text, int) from public, anon, authenticated;

-- ------------------------------------------------------------------ craft_item: pay, roll, item or crystal
create or replace function public.craft_item(p_rarity text, p_class text, p_slot text, p_npc text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); rar text := public.norm_rarity(p_rarity); t int; mult numeric; w numeric; cost bigint; chance numeric; ok boolean;
  def text; item uuid; crystal text; need int; mats text[] := array['material-ore','material-3','material-4','material-6']; tbl text[] := array['ore','shard','core','heart'];

begin
  if u is null then raise exception 'Sign in required'; end if;
  if exists(select 1 from public.player_profiles where user_id = u and banned) then raise exception 'Account suspended'; end if;
  if p_npc not in ('merchant-hollow','merchant-dawnveil','merchant-thornwatch') then raise exception 'Crafting is only available at an NPC Merchant in town'; end if;
  if p_class not in ('Warrior','Mage','Priest','Archer','Enchanter') or p_slot not in ('weapon','armor','helmet','gloves','boots','ring') then raise exception 'Invalid recipe'; end if;
  t := public.rarity_tier(rar); if t is null then raise exception 'Invalid rarity'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  if (select count(*) from public.inventory_items where owner_id = u) >= 80 then raise exception 'Inventory full'; end if;
  mult := case p_slot when 'weapon' then public.cfg_num('{craft,slotMultiplier,weapon}', 1.5) when 'armor' then public.cfg_num('{craft,slotMultiplier,armor}', 1.25) else public.cfg_num('{craft,slotMultiplier,other}', 1) end;
  cost := round(public.craft_cfg('soulGod', rar, array[200,800,3000,12000,60000,300000,1500000,7500000]) * mult)::bigint;
  w := case when p_slot = 'weapon' then 1.5 else 1 end;
  for i in 1..4 loop
    need := ceil(public.craft_cfg(tbl[i], rar, case i when 1 then array[2,4,8,12,20,30,45,60]::numeric[] when 2 then array[0,0,0,2,5,10,20,40]::numeric[]
      when 3 then array[0,0,0,0,1,3,6,12]::numeric[] else array[0,0,0,0,0,0,1,3]::numeric[] end) * w)::int;
    perform public.take_stack(u, mats[i], need);
  end loop;
  perform public.spend_soulgod(u, cost, 'craft', public.craft_def_id(rar, p_class, p_slot));
  chance := public.craft_cfg('successRate', rar, array[1,1,1,1,0.75,0.70,0.60,0.45]);
  ok := random() < chance; def := public.craft_def_id(rar, p_class, p_slot);
  if ok then
    insert into public.inventory_items(owner_id, item_definition_id, rarity, quantity, class_lock) values (u, def, rar, 1, p_class) returning id into item;
  elsif t >= 4 then
    crystal := 'crystal-' || rar; perform public.give_stack(u, crystal, rar, 1);
  end if;
  return jsonb_build_object('success', ok, 'item_id', item, 'definition', def, 'crystal', crystal, 'cost', cost, 'chance', chance,
    'crystals', coalesce((select sum(quantity) from public.inventory_items where owner_id = u and item_definition_id = crystal), 0));
end $$;

-- ------------------------------------------------------------------ craft_with_crystals: 3 of one tier → that tier, 100 %, chosen class / type
create or replace function public.craft_with_crystals(p_tier text, p_class text, p_slot text, p_npc text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); rar text := public.norm_rarity(p_tier); need int := public.cfg_num('{craft,crystalsForGuarantee}', 3)::int; def text; item uuid;
begin
  if u is null then raise exception 'Sign in required'; end if;
  if p_npc not in ('merchant-hollow','merchant-dawnveil','merchant-thornwatch') then raise exception 'Crafting is only available at an NPC Merchant in town'; end if;
  if rar not in ('Legendary','God','Pre-arch','Arch') then raise exception 'Crystals exist for Legendary and above only'; end if;
  if p_class not in ('Warrior','Mage','Priest','Archer','Enchanter') or p_slot not in ('weapon','armor','helmet','gloves','boots','ring') then raise exception 'Invalid recipe'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  perform public.take_stack(u, 'crystal-' || rar, need);
  def := public.craft_def_id(rar, p_class, p_slot);
  insert into public.inventory_items(owner_id, item_definition_id, rarity, quantity, class_lock) values (u, def, rar, 1, p_class) returning id into item;
  return jsonb_build_object('success', true, 'item_id', item, 'definition', def, 'spent', need);
end $$;
revoke all on function public.craft_item(text, text, text, text), public.craft_with_crystals(text, text, text, text) from public, anon;
grant execute on function public.craft_item(text, text, text, text), public.craft_with_crystals(text, text, text, text) to authenticated;

-- ------------------------------------------------------------------ world-boss raid results (written by the realm server)
create table if not exists public.boss_results (
  id bigint generated always as identity primary key, boss text not null, minutes numeric not null, players int not null,
  ranked jsonb not null, created_at timestamptz not null default now()
);
alter table public.boss_results enable row level security;
revoke all on public.boss_results from anon, authenticated;
grant select on public.boss_results to anon, authenticated;
drop policy if exists "boss results are public" on public.boss_results;
create policy "boss results are public" on public.boss_results for select to anon, authenticated using (true);
/** service role only: store the top-10 table and pay the SoulGod share to each ranked player */
create or replace function public.record_boss_result(p_boss text, p_minutes numeric, p_players int, p_ranked jsonb) returns bigint
language plpgsql security definer set search_path='' as $$
declare r jsonb; id_ bigint; who uuid; amount bigint;
begin
  insert into public.boss_results(boss, minutes, players, ranked) values (p_boss, p_minutes, p_players, p_ranked) returning id into id_;
  for r in select * from jsonb_array_elements(p_ranked) loop
    who := (r->>'id')::uuid; amount := coalesce((r->>'soulGod')::bigint, 0);
    if amount > 0 then
      insert into public.player_wallets(player_id, gold) values (who, amount) on conflict(player_id) do update set gold = public.player_wallets.gold + excluded.gold;
      insert into public.economy_ledger(player_id, kind, amount, burned, ref) values (who, 'boss_reward', amount, 0, p_boss || '#' || id_);
    end if;
  end loop;
  return id_;
end $$;
revoke all on function public.record_boss_result(text, numeric, int, jsonb) from public, anon, authenticated;
commit;


-- ===== 202610250009_characters.sql =====
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


-- ===== 202610250010_realm_market.sql =====
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


-- ===== 202610260011_ops_shop.sql =====
-- Round 12: live-ops tables — coupons, the cash shop (fashion), top-up partners, maintenance switch, patches, backups.
-- Same Supabase project, separate tables. Run after 202610250010_realm_market.sql. Safe to run twice.
--
-- Rules that keep this safe:
--   · Nothing here writes public.characters. Every reward (coupon, paid order) becomes a row in public.realm_mail,
--     and the realm hands it to the character in its own transaction (realm_mail_claim) — the same path as boss rewards.
--   · Coupon codes are created ONLY by admins (admin_create_coupons). Players can only redeem.
--   · A cash order is marked paid ONLY by the service role (the payment webhook) and only when the paid amount equals
--     the order's price. The browser can create an order, never mark one paid.

-- ------------------------------------------------------------------ mail can carry a wardrobe piece
alter table public.realm_mail add column if not exists fashion text;
alter table public.realm_mail drop constraint if exists realm_mail_kind_check;
alter table public.realm_mail add constraint realm_mail_kind_check check (kind in ('sale','return','boss','admin','shop','coupon'));
alter table public.realm_mail drop constraint if exists realm_mail_fashion_id;
alter table public.realm_mail add constraint realm_mail_fashion_id check (fashion is null or fashion ~ '^[a-z0-9-]{3,48}$');

-- ------------------------------------------------------------------ fashion catalog (back office adds pieces without a patch)
create table if not exists public.fashion_items (
  id text primary key check (id ~ '^[a-z0-9-]{3,48}$'),
  slot text not null check (slot in ('outfit','weapon','wings','cape','head','other')),
  name text not null, th text not null, description text,
  price_thb int check (price_thb is null or price_thb between 1 and 100000),
  price_sg bigint check (price_sg is null or price_sg > 0),
  sprite text, art jsonb, anchor jsonb, scale numeric, behind boolean not null default false,
  active boolean not null default true, tag text, sort int not null default 100,
  updated_at timestamptz not null default now()
);
alter table public.fashion_items enable row level security;
revoke all on public.fashion_items from anon, authenticated;
grant select on public.fashion_items to anon, authenticated;
drop policy if exists "fashion is public" on public.fashion_items;
create policy "fashion is public" on public.fashion_items for select to anon, authenticated using (true);
insert into public.fashion_items(id, slot, name, th, description, price_thb, sprite, tag, sort) values
  ('costume-thai-white-gold','outfit','Thai White & Gold Attire','ชุดไทยขาวทอง','ชุดไทยพิธีการสีขาวทอง ใส่ได้ทุกอาชีพ ชาย/หญิง · ไม่มีค่าสเตตัส',349,'thai','ใหม่',1)
on conflict (id) do nothing;

create or replace function public.admin_upsert_fashion(p_row jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  insert into public.fashion_items(id, slot, name, th, description, price_thb, price_sg, sprite, art, anchor, scale, behind, active, tag, sort, updated_at)
  values (p_row->>'id', p_row->>'slot', p_row->>'name', coalesce(p_row->>'th', p_row->>'name'), p_row->>'description',
    nullif(p_row->>'priceTHB','')::int, nullif(p_row->>'priceSG','')::bigint, p_row->>'sprite', p_row->'art', p_row->'anchor',
    nullif(p_row->>'scale','')::numeric, coalesce((p_row->>'behind')::boolean, false), coalesce((p_row->>'active')::boolean, true), p_row->>'tag',
    coalesce(nullif(p_row->>'sort','')::int, 100), now())
  on conflict (id) do update set slot = excluded.slot, name = excluded.name, th = excluded.th, description = excluded.description,
    price_thb = excluded.price_thb, price_sg = excluded.price_sg, sprite = excluded.sprite, art = excluded.art, anchor = excluded.anchor,
    scale = excluded.scale, behind = excluded.behind, active = excluded.active, tag = excluded.tag, sort = excluded.sort, updated_at = now();
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'fashion_upsert', p_row);
end $$;

-- ------------------------------------------------------------------ top-up partners (shops that sell for the game)
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,32}$'),
  name text not null, contact text not null default '', logo_url text,
  -- the share of each paid order the partner keeps (set by the admin when approving)
  revenue_share numeric not null default 0 check (revenue_share between 0 and 0.5),
  status text not null default 'pending' check (status in ('pending','approved','suspended')),
  created_at timestamptz not null default now()
);
create table if not exists public.partner_promos (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  title text not null check (length(title) between 2 and 80), body text not null default '' check (length(body) <= 2000),
  image_url text, topup_steps text not null default '' check (length(topup_steps) <= 2000),
  starts_at timestamptz not null default now(), ends_at timestamptz,
  approved boolean not null default false, created_at timestamptz not null default now()
);
alter table public.partners enable row level security; alter table public.partner_promos enable row level security;
revoke all on public.partners, public.partner_promos from anon, authenticated;
grant select on public.partners, public.partner_promos to anon, authenticated;
grant insert, update on public.partner_promos to authenticated;
drop policy if exists "approved partners are public" on public.partners;
create policy "approved partners are public" on public.partners for select to anon, authenticated
  using (status = 'approved' or owner_id = (select auth.uid()) or public.is_admin());
drop policy if exists "live promos are public" on public.partner_promos;
create policy "live promos are public" on public.partner_promos for select to anon, authenticated
  using ((approved and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_admin()
    or exists (select 1 from public.partners p where p.id = partner_id and p.owner_id = (select auth.uid())));
-- partners write their own promos; every edit goes back to "waiting for approval"
drop policy if exists "partner writes own promos" on public.partner_promos;
create policy "partner writes own promos" on public.partner_promos for insert to authenticated
  with check (approved = false and exists (select 1 from public.partners p where p.id = partner_id and p.owner_id = (select auth.uid()) and p.status = 'approved'));
drop policy if exists "partner edits own promos" on public.partner_promos;
create policy "partner edits own promos" on public.partner_promos for update to authenticated
  using (exists (select 1 from public.partners p where p.id = partner_id and p.owner_id = (select auth.uid())))
  with check (approved = false);

create or replace function public.partner_apply(p_slug text, p_name text, p_contact text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v uuid;
begin
  if auth.uid() is null then raise exception 'ต้องเข้าสู่ระบบก่อน'; end if;
  if (select count(*) from public.partners where owner_id = auth.uid()) >= 3 then raise exception 'สมัครได้สูงสุด 3 ร้านต่อบัญชี'; end if;
  insert into public.partners(owner_id, slug, name, contact) values (auth.uid(), lower(p_slug), left(p_name, 60), left(coalesce(p_contact, ''), 200)) returning id into v;
  return v;
end $$;
create or replace function public.admin_set_partner(p_id uuid, p_status text, p_share numeric) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.partners set status = p_status, revenue_share = coalesce(p_share, revenue_share) where id = p_id;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'partner_set', jsonb_build_object('id', p_id, 'status', p_status, 'share', p_share));
end $$;
create or replace function public.admin_approve_promo(p_id uuid, p_ok boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.partner_promos set approved = p_ok where id = p_id;
end $$;

-- ------------------------------------------------------------------ cash shop orders
create table if not exists public.cash_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.fashion_items(id),
  amount_thb int not null check (amount_thb > 0),
  method text not null check (method in ('promptpay','truemoney','razergold','card','partner')),
  partner_id uuid references public.partners(id),
  status text not null default 'pending' check (status in ('pending','paid','refunded','cancelled')),
  provider_ref text unique, created_at timestamptz not null default now(), paid_at timestamptz
);
create index if not exists cash_orders_user on public.cash_orders(user_id, created_at desc);
alter table public.cash_orders enable row level security;
revoke all on public.cash_orders from anon, authenticated;
grant select on public.cash_orders to authenticated;
drop policy if exists "own orders or admin" on public.cash_orders;
create policy "own orders or admin" on public.cash_orders for select to authenticated using (user_id = (select auth.uid()) or public.is_admin()
  or exists (select 1 from public.partners p where p.id = partner_id and p.owner_id = (select auth.uid())));

create or replace function public.cash_create_order(p_item text, p_method text, p_partner text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v uuid; price int; pid uuid;
begin
  if auth.uid() is null then raise exception 'ต้องเข้าสู่ระบบก่อน'; end if;
  select price_thb into price from public.fashion_items where id = p_item and active and price_thb is not null;
  if price is null then raise exception 'สินค้านี้ไม่ได้จำหน่าย'; end if;
  if (select count(*) from public.cash_orders where user_id = auth.uid() and status = 'pending' and created_at > now() - interval '1 hour') >= 5 then raise exception 'มีคำสั่งซื้อค้างอยู่หลายรายการ กรุณารอ'; end if;
  if p_partner is not null then select id into pid from public.partners where slug = p_partner and status = 'approved'; if pid is null then raise exception 'ไม่พบร้านพาร์ทเนอร์'; end if; end if;
  insert into public.cash_orders(user_id, item_id, amount_thb, method, partner_id) values (auth.uid(), p_item, price, p_method, pid) returning id into v;
  return v;
end $$;

-- called by the payment webhook with the service role: amount must match, then the piece goes out by mail (exactly once)
create or replace function public.cash_mark_paid(p_order uuid, p_ref text, p_amount int) returns text
language plpgsql security definer set search_path = '' as $$
declare o public.cash_orders%rowtype;
begin
  select * into o from public.cash_orders where id = p_order for update;
  if not found then return 'NO_ORDER'; end if;
  if o.status = 'paid' then return 'ALREADY'; end if;
  if o.status <> 'pending' then return 'CLOSED'; end if;
  if p_amount <> o.amount_thb then return 'AMOUNT_MISMATCH'; end if;
  update public.cash_orders set status = 'paid', paid_at = now(), provider_ref = p_ref where id = p_order;
  insert into public.realm_mail(user_id, kind, gold, item, note, fashion)
    values (o.user_id, 'shop', 0, null, 'Cash Shop: ได้รับแฟชั่นเข้าตู้เสื้อผ้า', o.item_id);
  return 'OK';
end $$;

-- ------------------------------------------------------------------ coupons (admin-only creation, short codes)
create table if not exists public.coupons (
  code text primary key check (code ~ '^[A-Z0-9]{4,16}$'),
  batch text not null default 'manual', note text,
  -- {"gold": 1000, "fashion": "wings-dawn", "items": [{"definitionId": "hp-potion", "qty": 10}]}
  reward jsonb not null check (jsonb_typeof(reward) = 'object'),
  max_uses int not null default 1 check (max_uses between 1 and 1000000), used_count int not null default 0,
  expires_at timestamptz, active boolean not null default true,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.coupon_redemptions (
  code text not null references public.coupons(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(), primary key (code, user_id)
);
alter table public.coupons enable row level security; alter table public.coupon_redemptions enable row level security;
revoke all on public.coupons, public.coupon_redemptions from anon, authenticated;
grant select on public.coupons, public.coupon_redemptions to authenticated;
drop policy if exists "admins read coupons" on public.coupons;
create policy "admins read coupons" on public.coupons for select to authenticated using (public.is_admin());
drop policy if exists "own redemptions or admin" on public.coupon_redemptions;
create policy "own redemptions or admin" on public.coupon_redemptions for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

create or replace function public.gen_coupon_code(p_len int) returns text language plpgsql volatile set search_path = '' as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea := extensions.gen_random_bytes(p_len); s text := ''; i int;
begin
  for i in 0..p_len - 1 loop s := s || substr(alphabet, (get_byte(b, i) % 32) + 1, 1); end loop; return s;
end $$;
create or replace function public.admin_create_coupons(p_count int, p_len int, p_prefix text, p_reward jsonb, p_max_uses int, p_expires timestamptz, p_batch text, p_code text default null)
returns setof text language plpgsql security definer set search_path = '' as $$
declare c text; n int := 0; tries int := 0;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_count < 1 or p_count > 5000 or p_len < 4 or p_len > 12 then raise exception 'จำนวน 1–5000 โค้ด ความยาว 4–12 ตัว'; end if;
  if coalesce((p_reward->>'gold')::bigint, 0) > 10000000 then raise exception 'SoulGod ต่อโค้ดสูงสุด 10,000,000'; end if;
  if p_code is not null then
    insert into public.coupons(code, batch, reward, max_uses, expires_at, created_by) values (upper(p_code), p_batch, p_reward, p_max_uses, p_expires, auth.uid());
    return next upper(p_code); return;
  end if;
  while n < p_count and tries < p_count * 5 loop
    tries := tries + 1; c := upper(coalesce(p_prefix, '')) || public.gen_coupon_code(p_len);
    begin insert into public.coupons(code, batch, reward, max_uses, expires_at, created_by) values (c, p_batch, p_reward, p_max_uses, p_expires, auth.uid()); n := n + 1; return next c;
    exception when unique_violation then null; end;
  end loop;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'coupons_create', jsonb_build_object('count', n, 'batch', p_batch, 'reward', p_reward));
end $$;
create or replace function public.admin_set_coupon(p_code text, p_active boolean) returns void language plpgsql security definer set search_path = '' as $$
begin if not public.is_admin() then raise exception 'Admin only'; end if; update public.coupons set active = p_active where code = upper(p_code); end $$;

-- players redeem; the reward goes to the realm mailbox (items as {definitionId, qty}; the realm builds the item)
create or replace function public.redeem_coupon(p_code text) returns text
language plpgsql security definer set search_path = '' as $$
declare c public.coupons%rowtype; it jsonb; recent int;
begin
  if auth.uid() is null then return 'LOGIN'; end if;
  select count(*) into recent from public.coupon_redemptions where user_id = auth.uid() and redeemed_at > now() - interval '1 minute';
  if recent >= 5 then return 'RATE'; end if;
  select * into c from public.coupons where code = upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g')) for update;
  if not found or not c.active then return 'INVALID'; end if;
  if c.expires_at is not null and c.expires_at < now() then return 'EXPIRED'; end if;
  if c.used_count >= c.max_uses then return 'USED_UP'; end if;
  begin insert into public.coupon_redemptions(code, user_id) values (c.code, auth.uid());
  exception when unique_violation then return 'ALREADY'; end;
  update public.coupons set used_count = used_count + 1 where code = c.code;
  insert into public.realm_mail(user_id, kind, gold, item, note, fashion)
    values (auth.uid(), 'coupon', greatest(0, coalesce((c.reward->>'gold')::bigint, 0)), null, 'คูปอง ' || c.code, c.reward->>'fashion');
  for it in select * from jsonb_array_elements(coalesce(c.reward->'items', '[]'::jsonb)) loop
    insert into public.realm_mail(user_id, kind, gold, item, note) values (auth.uid(), 'coupon', 0,
      jsonb_build_object('definitionId', it->>'definitionId', 'qty', greatest(1, least(999, coalesce((it->>'qty')::int, 1)))), 'คูปอง ' || c.code);
  end loop;
  return 'OK';
end $$;

-- ------------------------------------------------------------------ maintenance switch + patches
alter table public.game_config drop constraint if exists game_config_key_check;
alter table public.game_config add constraint game_config_key_check check (key in ('balance','skills','npcs','announcement','ops','maps'));
-- game_config key 'ops' = {"loginOpen": true, "message": "…", "minClient": "0.12.0"} — the realm and /api/status read it
insert into public.game_config(key, value) values ('ops', '{"loginOpen": true, "message": "", "minClient": "0.12.0"}'::jsonb) on conflict (key) do nothing;
create or replace function public.game_status() returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce((select value from public.game_config where key = 'ops'), '{"loginOpen": true}'::jsonb) $$;

create table if not exists public.patches (
  version text primary key check (version ~ '^\d+\.\d+\.\d+$'),
  title text not null, notes jsonb not null default '[]'::jsonb,
  min_client text not null default '0.0.0', config_snapshot jsonb,
  status text not null default 'draft' check (status in ('draft','live','rolled_back')),
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), published_at timestamptz
);
alter table public.patches enable row level security;
revoke all on public.patches from anon, authenticated;
grant select on public.patches to anon, authenticated;
drop policy if exists "live patches are public" on public.patches;
create policy "live patches are public" on public.patches for select to anon, authenticated using (status <> 'draft' or public.is_admin());

-- publishing a patch stores the current game_config, so rolling back restores exactly what was live before it
create or replace function public.admin_publish_patch(p_version text, p_title text, p_notes jsonb, p_min_client text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  insert into public.patches(version, title, notes, min_client, config_snapshot, status, created_by, published_at)
  values (p_version, p_title, p_notes, p_min_client, (select jsonb_object_agg(key, value) from public.game_config), 'live', auth.uid(), now())
  on conflict (version) do update set title = excluded.title, notes = excluded.notes, min_client = excluded.min_client, status = 'live', published_at = now();
  update public.game_config set value = value || jsonb_build_object('minClient', p_min_client) where key = 'ops';
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'patch_publish', jsonb_build_object('version', p_version));
end $$;
create or replace function public.admin_rollback_patch(p_version text) returns void
language plpgsql security definer set search_path = '' as $$
declare snap jsonb; k text;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select config_snapshot into snap from public.patches where version = p_version and status = 'live';
  if snap is null then raise exception 'ไม่พบแพตช์ที่ใช้งานอยู่หรือไม่มีสำเนาค่าเดิม'; end if;
  for k in select jsonb_object_keys(snap) loop
    update public.game_config set value = snap->k, updated_at = now() where key = k;
  end loop;
  update public.patches set status = 'rolled_back' where version = p_version;
  insert into public.admin_audit_log(admin_id, action, detail) values (auth.uid(), 'patch_rollback', jsonb_build_object('version', p_version));
end $$;

-- ------------------------------------------------------------------ backup: one JSON of the game data (Supabase's own daily backups stay the real safety net)
create or replace function public.admin_backup() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  return jsonb_build_object('taken_at', now(),
    'game_config', (select coalesce(jsonb_agg(g), '[]') from public.game_config g),
    'characters', (select coalesce(jsonb_agg(jsonb_build_object('user_id', c.user_id, 'rev', c.rev, 'state', c.state)), '[]') from public.characters c),
    'fashion_items', (select coalesce(jsonb_agg(f), '[]') from public.fashion_items f),
    'coupons', (select coalesce(jsonb_agg(c), '[]') from public.coupons c),
    'partners', (select coalesce(jsonb_agg(p), '[]') from public.partners p),
    'patches', (select coalesce(jsonb_agg(p), '[]') from public.patches p),
    'mail_open', (select coalesce(jsonb_agg(m), '[]') from public.realm_mail m where claimed_at is null));
end $$;

-- ------------------------------------------------------------------ grants
do $$ declare f text; begin
  foreach f in array array['public.admin_upsert_fashion(jsonb)','public.partner_apply(text,text,text)','public.admin_set_partner(uuid,text,numeric)',
    'public.admin_approve_promo(uuid,boolean)','public.cash_create_order(text,text,text)','public.admin_create_coupons(int,int,text,jsonb,int,timestamptz,text,text)',
    'public.admin_set_coupon(text,boolean)','public.redeem_coupon(text)','public.admin_publish_patch(text,text,jsonb,text)',
    'public.admin_rollback_patch(text)','public.admin_backup()'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  execute 'revoke all on function public.cash_mark_paid(uuid,text,int) from public, anon, authenticated';
  execute 'grant execute on function public.cash_mark_paid(uuid,text,int) to service_role';
  execute 'revoke all on function public.gen_coupon_code(int) from public, anon, authenticated';
  execute 'grant execute on function public.game_status() to anon, authenticated';
end $$;


-- ===== 202610260012_berserker.sql =====
-- Round 13 (2026-10-27): the game code is now one class (Berserker → Reaver at Lv60), so this migration runs as is.
-- Run it on an existing database to convert old characters / items, or use database/soulforge-supabase-full-install.sql
-- for a new project (it already includes this file). The whole file is one transaction.
begin;

-- Round 15: the five starting classes (Warrior, Mage, Priest, Archer, Enchanter) are retired. Every character is a
-- Berserker (class 1) and may advance to Reaver at Lv60 (a promotion kept in the realm character state, not a class_id).
-- Existing characters become Berserkers with their level and items: old weapons → greatsword of the same tier,
-- off-hands → greataxe, light / robes armour → heavy, magic / elemental seals → physical / defense (mirrors
-- src/game/items.ts migrateClassItem; the realm server also migrates the JSON character state on load).

-- ------------------------------------------------------------------ catalog: two-handed weapons + the Reaver trial item
insert into public.item_definitions(id,name,rarity,npc_value,category,class_lock) values
('weapon-Berserker-0','Ironcleaver Greatsword','Common',2,'Berserker','Berserker'),
('weapon-greataxe-0','Hewer Greataxe','Common',2,'Berserker','Berserker'),
('weapon-greathammer-0','Ironmaul Greathammer','Common',2,'Berserker','Berserker'),
('weapon-Berserker-1','Bloodedge Greatsword','Uncommon',4,'Berserker','Berserker'),
('weapon-greataxe-1','Bloodbite Greataxe','Uncommon',4,'Berserker','Berserker'),
('weapon-greathammer-1','Bloodmaul Greathammer','Uncommon',4,'Berserker','Berserker'),
('weapon-Berserker-2','Ruinbrand Greatsword','Rare',6,'Berserker','Berserker'),
('weapon-greataxe-2','Ravager Greataxe','Rare',6,'Berserker','Berserker'),
('weapon-greathammer-2','Worldbreaker Greathammer','Rare',6,'Berserker','Berserker'),
('weapon-Berserker-3','Dread Fang Greatsword','Epic',8,'Berserker','Berserker'),
('weapon-greataxe-3','Gorefang Greataxe','Epic',8,'Berserker','Berserker'),
('weapon-greathammer-3','Dread Anvil Greathammer','Epic',8,'Berserker','Berserker'),
('weapon-Berserker-4','Ember Ruin Greatsword','Legendary',10,'Berserker','Berserker'),
('weapon-greataxe-4','Ember Reaver Greataxe','Legendary',10,'Berserker','Berserker'),
('weapon-greathammer-4','Ember Maul Greathammer','Legendary',10,'Berserker','Berserker'),
('weapon-Berserker-5','Cinder Monarch Greatsword','God',12,'Berserker','Berserker'),
('weapon-greataxe-5','Cinder Maw Greataxe','God',12,'Berserker','Berserker'),
('weapon-greathammer-5','Cinder Titan Greathammer','God',12,'Berserker','Berserker'),
('weapon-Berserker-6','Abyss Reaper Greatsword','Pre-arch',14,'Berserker','Berserker'),
('weapon-greataxe-6','Abyss Ravager Greataxe','Pre-arch',14,'Berserker','Berserker'),
('weapon-greathammer-6','Abyss Hammer Greathammer','Pre-arch',14,'Berserker','Berserker'),
('weapon-Berserker-7','Worldsunder Greatsword','Arch',16,'Berserker','Berserker'),
('weapon-greataxe-7','Worldrend Greataxe','Arch',16,'Berserker','Berserker'),
('weapon-greathammer-7','Worldshatter Greathammer','Arch',16,'Berserker','Berserker'),
('quest-reaver-sigil','Reaver Sigil','Legendary',1,'quest',null)
on conflict(id) do update set name=excluded.name,rarity=excluded.rarity,npc_value=excluded.npc_value,category=excluded.category,class_lock=excluded.class_lock;

-- ------------------------------------------------------------------ characters, item instances and market listings
alter table public.player_profiles drop constraint if exists player_profiles_class_id_check;
alter table public.inventory_items drop constraint if exists inventory_items_class_lock_check;
update public.player_profiles set class_id = 'Berserker' where class_id is not null and class_id <> 'Berserker';
update public.inventory_items set item_definition_id = regexp_replace(item_definition_id, '^weapon-(Warrior|Mage|Priest|Archer|Enchanter)-', 'weapon-Berserker-')
  where item_definition_id ~ '^weapon-(Warrior|Mage|Priest|Archer|Enchanter)-[0-9]$';
update public.inventory_items set item_definition_id = regexp_replace(item_definition_id, '^offhand-[A-Za-z]+-', 'weapon-greataxe-') where item_definition_id ~ '^offhand-[A-Za-z]+-[0-9]$';
update public.inventory_items set item_definition_id = regexp_replace(item_definition_id, '^(light|robes)-', 'heavy-') where item_definition_id ~ '^(light|robes)-(armor|helmet|gloves|boots)-[0-9]$';
update public.inventory_items set item_definition_id = regexp_replace(regexp_replace(item_definition_id, '^accessory-magic-', 'accessory-physical-'), '^accessory-elemental-', 'accessory-defense-')
  where item_definition_id ~ '^accessory-(magic|elemental)-[0-9]$';
update public.market_listings set item_definition_id = regexp_replace(item_definition_id, '^weapon-(Warrior|Mage|Priest|Archer|Enchanter)-', 'weapon-Berserker-')
  where item_definition_id ~ '^weapon-(Warrior|Mage|Priest|Archer|Enchanter)-[0-9]$';
update public.market_listings set item_definition_id = regexp_replace(item_definition_id, '^offhand-[A-Za-z]+-', 'weapon-greataxe-') where item_definition_id ~ '^offhand-[A-Za-z]+-[0-9]$';
update public.market_listings set item_definition_id = regexp_replace(item_definition_id, '^(light|robes)-', 'heavy-') where item_definition_id ~ '^(light|robes)-(armor|helmet|gloves|boots)-[0-9]$';
update public.market_listings set item_definition_id = regexp_replace(regexp_replace(item_definition_id, '^accessory-magic-', 'accessory-physical-'), '^accessory-elemental-', 'accessory-defense-')
  where item_definition_id ~ '^accessory-(magic|elemental)-[0-9]$';
update public.inventory_items set class_lock = 'Berserker' where class_lock is not null and class_lock <> 'Berserker';
alter table public.player_profiles add constraint player_profiles_class_id_check check (class_id in ('Berserker'));
alter table public.inventory_items add constraint inventory_items_class_lock_check check (class_lock in ('Berserker'));

-- ------------------------------------------------------------------ crafting: two-handed weapon (kind rolled), heavy armour, physical seal
create or replace function public.craft_def_id(p_rarity text, p_class text, p_slot text) returns text language sql volatile set search_path='' as $$
  select case
    when p_slot = 'weapon' then (array['weapon-Berserker-','weapon-greataxe-','weapon-greathammer-'])[1 + floor(random() * 3)::int] || public.rarity_tier(p_rarity)
    when p_slot = 'ring' then 'accessory-physical-' || public.rarity_tier(p_rarity)
    else 'heavy-' || p_slot || '-' || public.rarity_tier(p_rarity) end;
$$;

create or replace function public.create_character(p_name text, p_class text, p_gender text default 'm') returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p.class_id is not null then raise exception 'CHARACTER_EXISTS'; end if;
  if p_class not in ('Berserker') then raise exception 'CLASS_INVALID'; end if;
  if coalesce(p_gender,'m') not in ('m','f') then raise exception 'GENDER_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.player_profiles set display_name = p_name, class_id = p_class, gender = coalesce(p_gender,'m'), character_created_at = now() where user_id = me;
end $$;

create or replace function public.craft_item(p_rarity text, p_class text, p_slot text, p_npc text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); rar text := public.norm_rarity(p_rarity); t int; mult numeric; w numeric; cost bigint; chance numeric; ok boolean;
  def text; item uuid; crystal text; need int; mats text[] := array['material-ore','material-3','material-4','material-6']; tbl text[] := array['ore','shard','core','heart'];

begin
  if u is null then raise exception 'Sign in required'; end if;
  if exists(select 1 from public.player_profiles where user_id = u and banned) then raise exception 'Account suspended'; end if;
  if p_npc not in ('merchant-hollow','merchant-dawnveil','merchant-thornwatch') then raise exception 'Crafting is only available at an NPC Merchant in town'; end if;
  if p_class not in ('Berserker') or p_slot not in ('weapon','armor','helmet','gloves','boots','ring') then raise exception 'Invalid recipe'; end if;
  t := public.rarity_tier(rar); if t is null then raise exception 'Invalid rarity'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  if (select count(*) from public.inventory_items where owner_id = u) >= 80 then raise exception 'Inventory full'; end if;
  mult := case p_slot when 'weapon' then public.cfg_num('{craft,slotMultiplier,weapon}', 1.5) when 'armor' then public.cfg_num('{craft,slotMultiplier,armor}', 1.25) else public.cfg_num('{craft,slotMultiplier,other}', 1) end;
  cost := round(public.craft_cfg('soulGod', rar, array[200,800,3000,12000,60000,300000,1500000,7500000]) * mult)::bigint;
  w := case when p_slot = 'weapon' then 1.5 else 1 end;
  for i in 1..4 loop
    need := ceil(public.craft_cfg(tbl[i], rar, case i when 1 then array[2,4,8,12,20,30,45,60]::numeric[] when 2 then array[0,0,0,2,5,10,20,40]::numeric[]
      when 3 then array[0,0,0,0,1,3,6,12]::numeric[] else array[0,0,0,0,0,0,1,3]::numeric[] end) * w)::int;
    perform public.take_stack(u, mats[i], need);
  end loop;
  def := public.craft_def_id(rar, p_class, p_slot);
  perform public.spend_soulgod(u, cost, 'craft', def);
  chance := public.craft_cfg('successRate', rar, array[1,1,1,1,0.75,0.70,0.60,0.45]);
  ok := random() < chance;
  if ok then
    insert into public.inventory_items(owner_id, item_definition_id, rarity, quantity, class_lock) values (u, def, rar, 1, p_class) returning id into item;
  elsif t >= 4 then
    crystal := 'crystal-' || rar; perform public.give_stack(u, crystal, rar, 1);
  end if;
  return jsonb_build_object('success', ok, 'item_id', item, 'definition', def, 'crystal', crystal, 'cost', cost, 'chance', chance,
    'crystals', coalesce((select sum(quantity) from public.inventory_items where owner_id = u and item_definition_id = crystal), 0));
end $$;

create or replace function public.craft_with_crystals(p_tier text, p_class text, p_slot text, p_npc text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); rar text := public.norm_rarity(p_tier); need int := public.cfg_num('{craft,crystalsForGuarantee}', 3)::int; def text; item uuid;
begin
  if u is null then raise exception 'Sign in required'; end if;
  if p_npc not in ('merchant-hollow','merchant-dawnveil','merchant-thornwatch') then raise exception 'Crafting is only available at an NPC Merchant in town'; end if;
  if rar not in ('Legendary','God','Pre-arch','Arch') then raise exception 'Crystals exist for Legendary and above only'; end if;
  if p_class not in ('Berserker') or p_slot not in ('weapon','armor','helmet','gloves','boots','ring') then raise exception 'Invalid recipe'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text, 0));
  perform public.take_stack(u, 'crystal-' || rar, need);
  def := public.craft_def_id(rar, p_class, p_slot);
  insert into public.inventory_items(owner_id, item_definition_id, rarity, quantity, class_lock) values (u, def, rar, 1, p_class) returning id into item;
  return jsonb_build_object('success', true, 'item_id', item, 'definition', def, 'spent', need);
end $$;

commit;


-- ===== 202611020013_eight_classes.sql =====
-- Round 20 (2026-11-02): eight playable classes. Existing Berserkers stay Berserkers; new characters may pick any class.
-- Gear is still the shared (Berserker-family) catalogue until each class gets its own weapons, so class_lock is unchanged.
alter table public.player_profiles drop constraint if exists player_profiles_class_id_check;
alter table public.player_profiles add constraint player_profiles_class_id_check
  check (class_id in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor'));

create or replace function public.create_character(p_name text, p_class text, p_gender text default 'm') returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p.class_id is not null then raise exception 'CHARACTER_EXISTS'; end if;
  if p_class not in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor') then raise exception 'CLASS_INVALID'; end if;
  if coalesce(p_gender,'m') not in ('m','f') then raise exception 'GENDER_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.player_profiles set display_name = p_name, class_id = p_class, gender = coalesce(p_gender,'m'), character_created_at = now() where user_id = me;
end $$;

