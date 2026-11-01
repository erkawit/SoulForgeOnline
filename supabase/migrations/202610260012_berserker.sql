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
