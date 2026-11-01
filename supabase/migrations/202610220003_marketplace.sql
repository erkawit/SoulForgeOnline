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
