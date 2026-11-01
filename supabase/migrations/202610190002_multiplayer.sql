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
