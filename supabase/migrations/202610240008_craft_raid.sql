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
