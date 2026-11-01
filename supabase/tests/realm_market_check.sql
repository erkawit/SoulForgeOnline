-- Round 10 market / mail / permission checks against a local database built with local_shim.sql + all migrations.
-- Expected: every refusal below raises an ERROR, the rest succeed (see docs/ROUND10_TH.md).
\set ON_ERROR_STOP 0
insert into auth.users values ('11111111-1111-4111-8111-111111111111','a@x'),('22222222-2222-4222-8222-222222222222','b@x');
insert into public.characters(user_id,state) values ('11111111-1111-4111-8111-111111111111','{"player":{"gold":1000}}'),('22222222-2222-4222-8222-222222222222','{"player":{"gold":5000}}');
-- seller lists (rev 1 → 2)
select public.realm_market_list('11111111-1111-4111-8111-111111111111',1,'{"player":{"gold":980}}','{"id":"aaaaaaaa-0000-4000-8000-000000000001","seller_name":"A","item":{"id":"i1","name":"Iron Sword"},"definition_id":"sword","rarity":"Rare","enhance":0,"qty":1,"price":1000,"fee":20,"expires_at":"2099-01-01"}') as seller_rev;
-- stale rev refused
select public.realm_market_list('11111111-1111-4111-8111-111111111111',1,'{"player":{"gold":1}}','{"id":"aaaaaaaa-0000-4000-8000-000000000002","item":{"id":"i2","name":"x"},"definition_id":"x","rarity":"Common","price":10,"fee":10,"expires_at":"2099-01-01"}');
-- same item listed twice refused (unique active item id)
select public.realm_market_list('11111111-1111-4111-8111-111111111111',2,'{"player":{"gold":960}}','{"id":"aaaaaaaa-0000-4000-8000-000000000003","item":{"id":"i1","name":"Iron Sword"},"definition_id":"sword","rarity":"Rare","price":1000,"fee":20,"expires_at":"2099-01-01"}');
select rev, state->'player'->>'gold' gold from public.characters order by user_id;
-- seller cannot buy own
select public.realm_market_buy('11111111-1111-4111-8111-111111111111',2,'{"player":{"gold":0}}','aaaaaaaa-0000-4000-8000-000000000001',1000,940,60);
-- wrong split refused
select public.realm_market_buy('22222222-2222-4222-8222-222222222222',1,'{"player":{"gold":4000}}','aaaaaaaa-0000-4000-8000-000000000001',1000,999,60);
-- buyer buys
select public.realm_market_buy('22222222-2222-4222-8222-222222222222',1,'{"player":{"gold":4000},"inventory":[{"id":"i1"}]}','aaaaaaaa-0000-4000-8000-000000000001',1000,940,60) as buyer_rev;
-- second buy refused
select public.realm_market_buy('22222222-2222-4222-8222-222222222222',2,'{"player":{"gold":3000}}','aaaaaaaa-0000-4000-8000-000000000001',1000,940,60);
select status, buyer_id is not null bought, tax_burned from public.realm_listings;
select kind, gold, note from public.realm_mail;
-- seller claims mail
select public.realm_mail_claim('11111111-1111-4111-8111-111111111111',2,'{"player":{"gold":1920}}',(select array_agg(id) from public.realm_mail where user_id='11111111-1111-4111-8111-111111111111')) as claim_rev;
-- double claim refused
select public.realm_mail_claim('11111111-1111-4111-8111-111111111111',3,'{"player":{"gold":2860}}',(select array_agg(id) from public.realm_mail where user_id='11111111-1111-4111-8111-111111111111'));
-- expire flow
select public.realm_market_list('11111111-1111-4111-8111-111111111111',3,'{"player":{"gold":1900}}','{"id":"aaaaaaaa-0000-4000-8000-000000000004","item":{"id":"i9","name":"Old Shield"},"definition_id":"shield","rarity":"Common","price":100,"fee":10,"expires_at":"2000-01-01"}');
select * from public.realm_market_expire();
select kind, item->>'name' item from public.realm_mail where claimed_at is null;
-- cancel flow
select public.realm_market_list('11111111-1111-4111-8111-111111111111',4,'{"player":{"gold":1890}}','{"id":"aaaaaaaa-0000-4000-8000-000000000005","item":{"id":"i10","name":"Cap"},"definition_id":"cap","rarity":"Common","price":100,"fee":10,"expires_at":"2099-01-01"}');
select public.realm_market_cancel('22222222-2222-4222-8222-222222222222',2,'{}','aaaaaaaa-0000-4000-8000-000000000005');
select public.realm_market_cancel('11111111-1111-4111-8111-111111111111',5,'{"player":{"gold":1890}}','aaaaaaaa-0000-4000-8000-000000000005') as cancel_rev;
select public.realm_list_info('11111111-1111-4111-8111-111111111111','sword',0);
select * from public.realm_supply_day(current_date, 0.06);
select kind, amount, burned from public.economy_ledger order by id;
-- permissions: authenticated cannot call realm functions or legacy economy, cannot write characters / snapshots
set role authenticated; select set_config('request.jwt.sub','22222222-2222-4222-8222-222222222222',false);
select public.realm_market_expire();
select public.market_buy('aaaaaaaa-0000-4000-8000-000000000001');
update public.characters set state='{}' where true;
insert into public.player_snapshots(user_id,snapshot) values ('22222222-2222-4222-8222-222222222222','{"version":1}');
select count(*) visible_listings from public.realm_listings;
select count(*) my_mail from public.realm_mail;
select count(*) my_chars from public.characters;
reset role;
