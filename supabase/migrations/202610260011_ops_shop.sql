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
